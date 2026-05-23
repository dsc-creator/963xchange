# Google Sign-In Setup Guide — 369xchange

This guide explains how to get Google sign-in working on any domain or hosting provider.

---

## Why Google sign-in fails on a new domain

Google OAuth requires you to explicitly whitelist every domain that will initiate a sign-in.
If your domain is not on the whitelist you will see errors like:

- `auth/unauthorized-domain`
- `redirect_uri_mismatch`
- `Error 400: redirect_uri_mismatch`
- "Pop-up was blocked" (the popup opens then immediately closes)

---

## Option A — Firebase + Google (recommended)

### Step 1 — Create a Firebase project
1. Go to https://console.firebase.google.com
2. Click **Add project** → follow the wizard.
3. In the project, go to **Build → Authentication → Get started**.
4. Click **Sign-in method** → **Google** → toggle **Enable** → Save.

### Step 2 — Get your credentials
1. Go to **Project Settings** (gear icon) → **Your apps** → **Web app** (or add one).
2. Copy the config values into your `.env.local` / hosting environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
3. Go to **Authentication → Sign-in method → Google → Web SDK configuration**.
   Copy the **Web client ID** → `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...`

### Step 3 — Authorise your domains (critical!)
In Firebase Console → **Authentication → Settings → Authorised domains**:
- `localhost` (already there by default)
- `your-project.firebaseapp.com` (already there by default)
- Add **every custom domain** you deploy to, e.g.:
  - `yourapp.netlify.app`
  - `yourdomain.com`
  - `www.yourdomain.com`

### Step 4 — Authorise in Google Cloud Console (for the OAuth client)
1. Go to https://console.cloud.google.com → select your Firebase project.
2. **APIs & Services → Credentials → OAuth 2.0 Client IDs** → click the Web client.
3. Under **Authorised JavaScript origins** add:
   - `http://localhost:3000`
   - `https://yourapp.netlify.app`
   - `https://yourdomain.com`
4. Under **Authorised redirect URIs** add:
   - `https://your-project.firebaseapp.com/__/auth/handler`
5. Click **Save**.

---

## Option B — Google-only (no Firebase)

If you don't want to set up Firebase, you only need a Google Client ID.

### Step 1 — Create an OAuth client
1. Go to https://console.cloud.google.com → **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth client ID → Web application**.
3. Under **Authorised JavaScript origins** add every domain (same list as above).
4. Click **Create** → copy the **Client ID**.

### Step 2 — Set the environment variable
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```
Leave all `NEXT_PUBLIC_FIREBASE_*` variables empty.

---

## Netlify deployment

In Netlify → **Site configuration → Environment variables**, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | (from Firebase) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-project` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | (from Firebase) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | (from Firebase) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | (from Firebase or GCP) |

Then redeploy. Add `yourapp.netlify.app` to the authorised domains lists above.

---

## Vercel deployment

Same environment variables, set in **Project Settings → Environment Variables**.
Add `yourapp.vercel.app` and your custom domain to the authorised lists.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `auth/unauthorized-domain` | Add the domain in Firebase Console → Auth → Settings → Authorised domains |
| `Error 400: redirect_uri_mismatch` | Add the domain to Google Cloud Console → OAuth client → Authorised JavaScript origins |
| Pop-up blocked | Allow pop-ups for the site in your browser settings |
| `auth/popup-blocked` | Same as above — also disable any pop-up blocker extensions |
| Sign-in hangs / no popup | Check the browser console for CSP errors; make sure `accounts.google.com` is not blocked |
| Works locally, fails on Netlify | You added `localhost` but not the Netlify URL to your authorised domains |
