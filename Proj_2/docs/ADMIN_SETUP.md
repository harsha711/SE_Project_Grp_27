# Admin User Setup Guide

This guide explains how to create an admin user to access the admin dashboard for viewing bug reports.

## Method 1: Using the Script (Recommended)

### Step 1: Navigate to Backend Directory

```bash
cd Proj_2/Howl2Go_backend
```

### Step 2: Run the Admin Creation Script

**Option A: Create a new admin user**
```bash
npm run create:admin <email>
```

Example:
```bash
npm run create:admin admin@example.com
```

The script will prompt you for:
- Password (if not provided as second argument)
- Name for the admin user

**Option B: Create admin with password in command**
```bash
npm run create:admin admin@example.com mypassword123
```

**Option C: Update existing user to admin**
```bash
npm run create:admin existinguser@example.com
```

If the user already exists, the script will automatically update their role to `admin`.

### Step 3: Login as Admin

1. Go to the login page in your application
2. Use the email and password you just created/updated
3. After logging in, navigate to `/admin/bugs` to access the admin dashboard

---

## Method 2: Using MongoDB Directly

If you prefer to update a user directly in MongoDB:

### Step 1: Connect to MongoDB

You can use MongoDB Compass, MongoDB Shell, or any MongoDB client.

### Step 2: Find Your User

```javascript
// In MongoDB shell or Compass query
db.users.findOne({ email: "your-email@example.com" })
```

### Step 3: Update User Role

```javascript
// Update the user's role to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Step 4: Verify the Update

```javascript
// Check that the role was updated
db.users.findOne({ email: "your-email@example.com" }, { role: 1, email: 1 })
```

---

## Method 3: Create Admin via Registration + Database Update

1. **Register a new user** through the application's registration page
2. **Update the user's role** using Method 2 (MongoDB) or Method 1 (script)

---

## Accessing Admin Dashboard

Once you have an admin account:

1. **Login** to the application with your admin credentials
2. **Navigate** to `/admin/bugs` in your browser
3. You should see the admin dashboard with all bug reports

---

## Troubleshooting

### "Admin access required" error

- Make sure your user's `role` field is set to `"admin"` (not `"user"`)
- Try logging out and logging back in to refresh your session
- Check that the backend is returning the role correctly in the user profile

### Script fails to connect to MongoDB

- Ensure your `.env` file has the correct `MONGODB_URI`
- Make sure MongoDB is running and accessible
- Check your network connection

### User not found when updating

- Verify the email address is correct
- Check that the user exists in the database
- Ensure the email is in lowercase (the system stores emails in lowercase)

---

## Security Notes

⚠️ **Important:**
- Admin users have access to all bug reports and potentially other admin features
- Only grant admin access to trusted users
- Keep admin credentials secure
- Consider implementing additional security measures for production environments

---

## Quick Reference

```bash
# Create/update admin user
cd Proj_2/Howl2Go_backend
npm run create:admin <email> [password]

# Example
npm run create:admin admin@howl2go.com admin123
```

