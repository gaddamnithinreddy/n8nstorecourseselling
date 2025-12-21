/**
 * Admin Setup Script
 *
 * This script creates an admin user in Firestore.
 * Run this AFTER you have created the user in Firebase Authentication.
 *
 * Steps:
 * 1. Go to Firebase Console > Authentication > Users
 * 2. Add a new user with your admin email/password
 * 3. Copy the User UID
 * 4. Update the UID below
 * 5. Run this script
 */

// To set up your admin user:
// 1. First, sign up normally through the app with your email
// 2. Then in Firebase Console > Firestore Database
// 3. Find the "users" collection
// 4. Find your user document (by email)
// 5. Edit the "role" field from "user" to "admin"
//
// OR use the Firebase Admin SDK with this data structure:

const adminSetupInstructions = `
MANUAL ADMIN SETUP:

1. Go to Firebase Console (https://console.firebase.google.com)
2. Select your project
3. Go to Authentication > Users
4. If your admin user doesn't exist, click "Add user" and create one
5. Copy the User UID from the users list
6. Go to Firestore Database
7. Create or update a document in the "users" collection with:
   - Document ID: [paste the User UID here]
   - Fields:
     - name: "Admin"
     - email: "your-admin-email@example.com"
     - role: "admin" (IMPORTANT: must be exactly "admin")
     - createdAt: [current timestamp]
     - updatedAt: [current timestamp]

After this, you can log in with your admin credentials and access /admin
`

console.log(adminSetupInstructions)
