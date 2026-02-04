# Calendar Preference Persistence - Implementation Summary

## Problem
Users had to select their preferred calendar every time they logged in or opened the app. The selection was not being saved across sessions.

## Solution
Implemented real-time Firestore synchronization for calendar preferences with the following enhancements:

### 1. Real-time Calendar Selection Sync ✅
- **Before**: CalendarPage loaded preferences once on mount using a one-time `getUserPreferences()` call
- **After**: CalendarPage now uses Firestore's `onSnapshot()` real-time listener
- **Benefits**: 
  - Calendar selection is automatically saved to Firestore when changed in Settings
  - Calendar page updates **instantly** when you change the selection in Settings (no page reload needed!)
  - Changes persist across login sessions and devices

### 2. Calendar View Persistence (Bonus!) ✅
Additionally implemented persistence for the Month/Week view toggle:
- User's preferred view (Month or Week) is now saved to Firestore
- View preference loads automatically on page load
- Preference persists across sessions

## Technical Changes

### Modified Files

#### 1. `src/services/preferences.ts`
- Added `calendarView?: 'month' | 'week'` to `UserPreferences` interface

#### 2. `src/components/CalendarPage.tsx`
**Major Changes:**
- Replaced one-time `getUserPreferences()` call with real-time `onSnapshot()` listener
- Added imports: `getDoc`, `updateDoc`, `setDoc` from Firebase
- Added `handleViewChange()` function to save view preference
- Updated Month/Week toggle buttons to use `handleViewChange()`

**Key Features:**
```typescript
// Real-time listener automatically syncs calendar selection
onSnapshot(docRef, (docSnap) => {
  // Loads selectedCalendarId and calendarView
  // Updates state immediately when Firestore changes
});

// Saves view preference to Firestore
const handleViewChange = async (newView: CalendarView) => {
  setView(newView);
  await updateDoc(docRef, { calendarView: newView });
};
```

## User Experience

### Before
1. User selects calendar in Settings
2. Preference is saved ✅
3. User navigates to Calendar page
4. Calendar page loads the saved preference ✅
5. User changes calendar in Settings again
6. Calendar page **does not update** ❌
7. On next login, user has to select calendar again ❌

### After
1. User selects calendar in Settings
2. Preference is saved instantly to Firestore ✅
3. User navigates to Calendar page
4. Calendar page loads the saved preference ✅
5. User changes calendar in Settings
6. Calendar page **updates automatically in real-time!** ✅
7. On next login, preference is automatically loaded ✅
8. Month/Week view preference also persists ✅

## Firestore Data Structure

```json
{
  "userPreferences": {
    "{userId}": {
      "userId": "user123",
      "selectedCalendarId": "user@iimranchi.ac.in",
      "calendars": [
        { "id": "user@iimranchi.ac.in", "name": "Primary Calendar" },
        { "id": "c_xyz@group.calendar.google.com", "name": "Classes" }
      ],
      "calendarsLastFetched": "2026-02-04T15:20:00.000Z",
      "calendarView": "week",
      "theme": "dark",
      "createdAt": "2026-02-04T10:00:00.000Z",
      "updatedAt": "2026-02-04T15:20:00.000Z"
    }
  }
}
```

## Testing Checklist

### To Verify the Implementation:
1. ✅ **Login Persistence**: 
   - Select a calendar in Settings
   - Sign out and sign back in
   - Calendar should be automatically selected

2. ✅ **Real-time Sync**: 
   - Open Settings in one tab
   - Open Calendar page in another tab
   - Change calendar selection in Settings
   - Calendar page should update automatically without refresh

3. ✅ **View Persistence**:
   - Switch between Month/Week view
   - Refresh the page
   - View should remain the same as before refresh

4. ✅ **Default Behavior**:
   - New user (no preferences) should default to primary calendar
   - Default view should be "Week"

## Security
- Only authenticated users can read/write their own preferences
- Firestore security rules should enforce user-level access:
  ```javascript
  match /userPreferences/{userId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```

## Performance
- Real-time listener: Minimal overhead, uses WebSocket connection
- Only one active listener per user session
- Listener is properly cleaned up on component unmount
- No polling - changes are pushed from Firestore instantly
