# Security Incident Response - API Key Exposure

**Date:** February 4, 2026  
**Severity:** 🔴 CRITICAL  
**Status:** ⚠️ IN PROGRESS - Requires immediate action

## Incident Summary

Firebase API keys were exposed in the `dist/` build folder which was committed to version control and pushed to GitHub. This happened because:

1. Vite bundles environment variables into the built JavaScript files
2. The `dist/` folder was not in `.gitignore`
3. Built files containing API keys were committed and pushed to the public repository

## Completed Remediation Steps

- ✅ Added `dist/` to `.gitignore`
- ✅ Removed `dist/` folder from Git tracking (`git rm -r --cached dist/`)
- ✅ Committed and pushed changes to prevent future exposure
- ✅ Documented the incident

## 🚨 CRITICAL - Required Actions (DO IMMEDIATELY)

### 1. Rotate Firebase API Key

**Why:** The exposed key is now public and could be misused

**How:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your Firebase project
3. Find the API key that starts with "AIzaSy..."
4. **Option A (Recommended):** Delete the key and create a new one
   - Click on the key → Delete
   - Click "Create Credentials" → "API Key"
   - Copy the new key
5. **Option B:** Restrict the existing key
   - Click on the key → "Application restrictions"
   - Add HTTP referrers for your domain only
   - Under "API restrictions", select only the APIs you need

### 2. Update Local Environment

Update your `.env` file with the new API key:

\`\`\`bash
VITE_FIREBASE_API_KEY=your_new_api_key_here
\`\`\`

### 3. Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Margin-app project
3. Go to **Settings** → **Environment Variables**
4. Update or add these variables:
   - `VITE_FIREBASE_API_KEY` = your_new_api_key
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Make sure to set them for **Production**, **Preview**, and **Development** environments
6. Trigger a new deployment to apply changes

### 4. Monitor for Abuse

**Immediate checks:**

\`\`\`bash
# Check Firebase usage
# Go to: https://console.firebase.google.com/
# Navigate to: Project Settings → Usage and Billing
# Look for unusual spikes in API calls
\`\`\`

Set up alerts:
- Enable Firebase billing alerts
- Monitor authentication attempts
- Check Firestore read/write operations
- Review Cloud Functions invocations

### 5. (OPTIONAL) Purge Git History

⚠️ **WARNING:** This rewrites Git history and requires force-pushing. Only do this if you understand the implications.

If you want to completely remove the exposed keys from Git history:

\`\`\`bash
# Install git-filter-repo (if not already installed)
brew install git-filter-repo

# Backup your repository first
cd ..
cp -r Margin-app Margin-app-backup

# Remove dist folder from entire Git history
cd Margin-app
git filter-repo --path dist --invert-paths

# Force push to GitHub (⚠️ DESTRUCTIVE - coordinate with collaborators)
git push origin --force --all
\`\`\`

**Note:** Anyone who has cloned your repository will need to re-clone it after this operation.

## Prevention Measures (Already Implemented)

✅ **Updated `.gitignore`:**
- Added `dist/` to prevent build artifacts from being committed
- Added `dist-ssr/` for SSR builds
- Added `*.local` for local environment files

✅ **Best Practices:**
- Environment variables are stored in `.env` (which is gitignored)
- Build outputs are never committed
- Vercel handles environment variables securely

## Important Notes About Firebase API Keys

### Public Exposure is By Design (Partially)

Firebase web API keys are **designed to be public** in your client-side code because they're used in the browser. However, you should still protect them by:

1. **Setting up Firebase Security Rules** for Firestore and Storage
2. **Restricting API key usage** in Google Cloud Console
3. **Enabling App Check** to prevent unauthorized access

### What You Should Review

1. **Firestore Security Rules:**
   \`\`\`
   firebase firestore:rules
   \`\`\`

2. **Authentication Settings:**
   - Check authorized domains in Firebase Console
   - Review OAuth consent screen settings

3. **API Key Restrictions:**
   - Limit to specific HTTP referrers (your domains)
   - Restrict to only necessary APIs

## Timeline

- **2026-02-04 15:57** - Issue reported: "Google API key was exposed in dist/assets"
- **2026-02-04 16:00** - Investigation confirmed exposure
- **2026-02-04 16:05** - Added `dist/` to `.gitignore`
- **2026-02-04 16:06** - Removed `dist/` from Git and pushed changes
- **2026-02-04 16:10** - Created incident response documentation

## Status Checklist

- [x] Identified the exposure
- [x] Prevented future exposure (`.gitignore`)
- [x] Removed files from Git tracking
- [ ] **Rotated exposed API key** ⬅️ **DO THIS NOW**
- [ ] **Updated Vercel environment variables** ⬅️ **DO THIS NOW**
- [ ] Monitored for abuse
- [ ] Reviewed Firebase security rules
- [ ] (Optional) Purged Git history

## References

- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

**Next Steps:** Complete the unchecked items in the Status Checklist above ASAP.
