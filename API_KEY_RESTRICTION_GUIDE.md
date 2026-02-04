# Quick Security Fix - API Key Restriction

Since you're not rotating the exposed API key, you MUST restrict it to minimize risk.

## Steps to Restrict Your Firebase API Key

### 1. Go to Google Cloud Console
- URL: https://console.cloud.google.com/apis/credentials
- Select your Firebase project

### 2. Find Your API Key
- Look for key: `AIzaSyAggnn8XaEhvxeOGPR-YSuqJKb1oTTnOyc`
- Click on it to edit

### 3. Set Application Restrictions
Choose **HTTP referrers (web sites)** and add:

```
https://yourapp.vercel.app/*
https://*.vercel.app/*
http://localhost:*
https://localhost:*
```

Replace `yourapp.vercel.app` with your actual Vercel domain.

### 4. Set API Restrictions
Under "API restrictions", select **Restrict key** and enable ONLY:

- ✅ Cloud Firestore API
- ✅ Firebase Installations API
- ✅ Token Service API
- ✅ Identity Toolkit API (for Firebase Auth)
- ✅ Google Calendar API (if you're using it)

Disable all other APIs.

### 5. Save Changes

This way, even if someone has your API key, they can only use it:
- From your authorized domains
- For the specific APIs you've enabled

## Additional Security: Enable App Check

For stronger protection, consider enabling Firebase App Check:

```bash
# Install App Check
npm install firebase/app-check
```

Then in your Firebase config:

```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// After initializing Firebase
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
  isTokenAutoRefreshEnabled: true
});
```

## Why This Matters

Even though Firebase API keys are meant to be public, unrestricted keys can be abused:
- ❌ Quota exhaustion attacks
- ❌ Unauthorized access attempts
- ❌ Potential billing issues

With restrictions in place:
- ✅ Key only works from your domains
- ✅ Limited to necessary APIs
- ✅ Harder to abuse

## Time Investment
- Restricting the key: **5 minutes**
- Setting up App Check: **15 minutes**

**This is the minimum you should do right now.**
