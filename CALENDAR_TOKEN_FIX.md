# Google Calendar Access Token Issue - Fix Documentation

## Problem

Users were seeing this warning message on every page reload after login:
```
⚠️ Please sign out and sign in again to grant calendar access.
```

## Root Cause

**Google OAuth access tokens expire after 1 hour**. Here's what was happening:

1. User signs in with Google → Access token is obtained ✅
2. Token is saved to localStorage ✅  
3. User reloads page → Token is loaded from localStorage ✅
4. **But the token has expired!** ❌
5. Calendar API calls fail → Warning message shows ❌

## Technical Explanation

### OAuth Token Lifecycle

```
Sign In → Get Access Token (valid for 1 hour)
          ↓
     Save to localStorage
          ↓
     Page Reload
          ↓
     Load from localStorage
          ↓
     Token Expired? → Calendar API fails!
```

### Why Firebase Doesn't Auto-Refresh

Firebase Authentication provides:
- ✅ **Firebase ID Tokens**: Auto-refreshed, valid for 1 hour, extended automatically
- ❌ **Google OAuth Access Tokens**: NOT auto-refreshed (requires refresh tokens from backend)

To properly refresh Google OAuth tokens, you would need:
1. A backend server (Firebase Functions)
2. Store refresh tokens securely in Firestore
3. Exchange refresh tokens for new access tokens
4. This is complex and requires additional setup

## Implemented Solution

### Short-term Fix (Implemented Now) ✅

**Token Validation on Page Load**:
- When the page loads, we validate if the stored token is still valid
- Make a test API call to Google Calendar API
- If valid → Use it ✅
- If expired → Clear it and show re-auth button ❌

**Improved UX**:
- Instead of a simple warning, users see a helpful card with:
  - Clear explanation of what happened
  - "Re-authorize Calendar Access" button
  - Explanation that they'll need to sign in again

### Code Changes

#### 1. `src/contexts/AuthContext.tsx`

**Before**:
```typescript
useEffect(() => {
  if (user) {
    const storedToken = localStorage.getItem('googleAccessToken');
    if (storedToken) {
      setGoogleAccessToken(storedToken); // No validation!
    }
  }
}, [user]);
```

**After**:
```typescript
useEffect(() => {
  const getAccessToken = async () => {
    if (user) {
      const storedToken = localStorage.getItem('googleAccessToken');
      
      if (storedToken) {
        // Validate token with test API call
        const testResponse = await fetch(
          'https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1',
          { headers: { 'Authorization': `Bearer ${storedToken}` } }
        );
        
        if (testResponse.ok) {
          console.log('✅ Existing access token is valid');
          setGoogleAccessToken(storedToken);
        } else {
          console.log('⚠️ Access token expired');
          setGoogleAccessToken(null);
          localStorage.removeItem('googleAccessToken');
        }
      }
    }
  };
  
  getAccessToken();
}, [user]);
```

#### 2. `src/components/SettingsPage.tsx`

**Before**:
```tsx
{!googleAccessToken ? (
  <div>⚠️ Please sign out and sign in again...</div>
) : ...}
```

**After**:
```tsx
{!googleAccessToken ? (
  <div className="space-y-3">
    <div className="bg-yellow-500/10 border rounded-lg p-3">
      <p className="font-medium">⚠️ Calendar Access Required</p>
      <p className="text-xs mb-3">
        Your Google Calendar access has expired...
      </p>
      <button onClick={handleSignOut}>
        Re-authorize Calendar Access
      </button>
      <p className="text-xs mt-2">
        You'll be asked to sign in again...
      </p>
    </div>
  </div>
) : ...}
```

## User Experience

### Current Behavior

**First Session** (Token valid for ~1 hour):
1. User signs in ✅
2. Selects calendar ✅
3. Uses app normally ✅
4. Reloads page → Token validated → Calendar works! ✅

**After Token Expires** (> 1 hour later):
1. User reloads page
2. Token validation fails
3. User sees clear message with "Re-authorize" button
4. Click button → Sign in again → Fresh token for another hour ✅

## Long-term Solution Options

### Option A: Backend Token Refresh (Recommended for Production) ⭐

**Setup Required**:
1. Create Firebase Cloud Function
2. Store Google refresh tokens in Firestore (encrypted)
3. Exchange refresh tokens for new access tokens
4. Return fresh tokens to frontend

**Pros**:
- ✅ Tokens refresh automatically
- ✅ No user interruption
- ✅ Tokens valid indefinitely

**Cons**:
- ❌ Requires backend implementation
- ❌ More complex setup
- ❌ Additional Firebase costs

**Implementation**: See `BACKEND_TOKEN_REFRESH_GUIDE.md` (to be created if needed)

### Option B: Longer Session Management

**Keep current approach but**:
- Add a "Stay signed in" reminder
- Show time until token expiration
- Auto-prompt re-auth 5 minutes before expiry

**Pros**:
- ✅ Simple to implement
- ✅ No backend required

**Cons**:
- ❌ User still needs periodic re-auth
- ❌ Interrupts user flow

### Option C: Service Worker Token Refresh

**Use service workers to**:
- Attempt silent re-authentication in background
- Requires `prompt=none` parameter in OAuth

**Pros**:
- ✅ No backend required
- ✅ Mostly seamless

**Cons**:
- ❌ Doesn't work if user removes consent
- ❌ Complexity in service worker setup

## FAQ

### Q: Why does the token expire?
**A**: Google OAuth tokens expire for security. This is standard OAuth 2.0 behavior.

### Q: Can I make tokens last longer?
**A**: No. Google enforces a 1-hour limit on access tokens. You need refresh tokens (backend) for longer sessions.

### Q: Will this affect my calendar data?
**A**: No. Your calendar preferences are saved in Firestore and persist. Only the API access token expires.

### Q: Do I lose my work when re-authorizing?
**A**: No. All your data (courses, terms, preferences) is saved in Firestore. You just need to sign in again to access Google Calendar.

## Testing Checklist

### To Verify the Fix:

1. ✅ **Immediate Reload** (token still valid):
   - Sign in
   - Reload page immediately
   - Calendar should work without re-auth

2. ✅ **After 1+ hour** (token expired):
   - Sign in  
   - Wait 1+ hour (or manually delete token from localStorage)
   - Reload page
   - Should see "Re-authorize Calendar Access" button
   - Click button → Sign in → Calendar works again

3. ✅ **Error Handling**:
   - Sign in
   - Manually corrupt token in localStorage
   - Reload page
   - Should gracefully show re-auth button

## Console Logging

You'll see these logs in the browser console:

**Token Valid**:
```
✅ Existing access token is valid
```

**Token Expired/Invalid**:
```
⚠️ Access token expired or invalid
```

**New Token Obtained**:
```
✅ Access token captured: ya29.a0AfB_...
```

## Summary

✅ **Fixed**: Token validation now happens on page load  
✅ **Improved UX**: Clear messaging and one-click re-authorization  
✅ **Calendar preferences still persist**: Your selection is saved in Firestore  
⚠️ **Temporary limitation**: Users need to re-auth every ~1 hour

For a permanent solution, implement backend token refresh using Firebase Functions.
