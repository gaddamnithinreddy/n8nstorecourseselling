# Deploying Firestore Security Rules

## Option 1: Via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `courseselling-4a70c`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

## Option 2: Via Firebase CLI

```bash
# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules --project courseselling-4a70c
```

## Current Rules File

The rules are in: `firestore.rules`

Key points:
- ✅ Public can read templates and settings
- ✅ Users can read their own orders and data
- ✅ Admins can read/write everything
- ✅ Audit logs and security events are server-side only (no client writes)
- ✅ Download tokens are server-generated only

## After Deploying Rules

1. Restart your dev server: `npm run dev`
2. Sign in as admin
3. Try accessing `/admin`
4. Should work without "Access Denied" error
