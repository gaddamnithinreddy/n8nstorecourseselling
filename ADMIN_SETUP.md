# Admin Security & Settings - Quick Start Guide

## 🚀 Initial Setup (One-Time)

### Step 1: Initialize Admin Whitelist

Your admin email is already configured in `.env`:
```
ADMIN_WHITELIST_EMAILS=nithinreddygaddam99@gmail.com
```

To initialize the whitelist in Firestore, visit this URL in your browser:
```
http://localhost:3000/api/admin/init-whitelist
```

You should see a success message with your admin email added to the whitelist.

### Step 2: Sign In

1. Go to `http://localhost:3000/login`
2. Sign in with: `nithinreddygaddam99@gmail.com`
3. You should now have admin access

### Step 3: Access Admin Dashboard

1. Navigate to `http://localhost:3000/admin`
2. You should see the admin dashboard
3. Go to Settings to manage the whitelist

---

## 📋 Features Available

### Admin Security
- ✅ Email whitelist authentication
- ✅ Multi-layer access control
- ✅ Audit logging for all actions
- ✅ Security event tracking

### Settings Management
Navigate to **Admin → Settings** to control:

1. **General Tab**
   - Site name and description
   - Brand colors
   - Hero section text

2. **Features Tab**
   - Maintenance mode (disable site temporarily)
   - Payment gateway toggle
   - User registration control
   - Email notifications

3. **Email Tab**
   - Email templates
   - Sender information
   - Dynamic content variables

4. **Payment Tab**
   - Currency settings
   - Payment gateway status

5. **SEO Tab**
   - Meta tags
   - Keywords
   - Open Graph images

6. **Security Tab**
   - Audit logging toggle
   - Session timeout
   - **Admin whitelist management** (add/remove admins)

---

## 🔐 Managing Admin Whitelist

### From Settings Page:
1. Go to **Admin → Settings → Security Tab**
2. Scroll to "Admin Whitelist Management"
3. Enter new admin email and click "Add Admin"
4. Remove admins by clicking "Remove" (can't remove yourself)

### Via API:
```bash
# Add admin
curl -X POST http://localhost:3000/api/admin/whitelist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "add", "email": "newadmin@example.com"}'

# Remove admin
curl -X POST http://localhost:3000/api/admin/whitelist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "remove", "email": "oldadmin@example.com"}'
```

---

## ⚠️ Important Security Notes

1. **Only whitelisted admins can access the dashboard**
   - Regular users with admin role but not whitelisted will see "Access Denied"

2. **You cannot remove yourself**
   - Prevents accidental lockout

3. **Changes are immediate**
   - No need to restart the server

4. **All actions are logged**
   - Check audit logs via `/api/admin/audit-logs`

---

## 🧪 Testing the Security

### Test 1: Non-whitelisted Admin
1. Create a user with admin role in Firestore
2. Don't add their email to whitelist
3. Try to access `/admin`
4. Should see "Access Denied" page

### Test 2: Maintenance Mode
1. Go to Settings → Features
2. Toggle "Maintenance Mode" ON
3. Set a custom message
4. Save changes
5. Open site in incognito window
6. Should see maintenance page
7. Admin can still access dashboard

### Test 3: Payment Toggle
1. Go to Settings → Features
2. Toggle "Enable Payments" OFF
3. Save changes
4. Try to purchase a template
5. Checkout should be disabled

---

## 📊 Monitoring & Logs

### View Audit Logs:
```bash
# Get recent admin actions
curl http://localhost:3000/api/admin/audit-logs?type=audit&limit=50 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get security events
curl http://localhost:3000/api/admin/audit-logs?type=security&limit=50 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Logged Events:
- Admin login/logout
- Settings changes
- Template edits
- Whitelist modifications
- Failed login attempts
- Unauthorized access attempts

---

## 🎯 Next Steps

1. **Initialize the whitelist** (visit `/api/admin/init-whitelist`)
2. **Sign in as admin**
3. **Explore the settings page**
4. **Add additional admins** if needed
5. **Configure site settings** to your preference
6. **Test maintenance mode** and other features

---

## 🆘 Troubleshooting

### "Access Denied" even though I'm admin
- Check if your email is in the whitelist
- Visit `/api/admin/init-whitelist` to initialize
- Check Firestore `settings/site-settings` document

### Settings not saving
- Check browser console for errors
- Verify Firebase Admin credentials
- Check audit logs for error details

### Can't access admin dashboard
- Ensure you're signed in
- Check if you have admin role in Firestore
- Verify whitelist includes your email

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Verify environment variables are set
4. Check Firestore security rules
5. Review audit logs for clues

Happy administrating! 🎉
