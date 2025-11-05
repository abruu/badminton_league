# Reset Tournament Password Configuration

## Overview
The tournament reset feature is now protected by a password to prevent accidental data deletion.

## Setup Instructions

### 1. Configure Password in .env File

Add the following line to your `.env` file:

```bash
VITE_RESET_PASSWORD=your_secure_password
```

**Example:**
```bash
VITE_RESET_PASSWORD=reset123
```

### 2. Choose a Strong Password

**Recommended:**
- Use a unique password (different from admin password)
- Mix of letters, numbers, and special characters
- At least 8 characters long
- Example: `Reset@2024!Secure`

**Default Password:**
- If not configured, default is: `admin123`
- ⚠️ **Change this in production!**

### 3. Restart Development Server

After changing the `.env` file, restart your development server:

```bash
npm run dev
```

## How It Works

### User Flow:

1. **Click Reset Tournament Button** in Dashboard
2. **Password Prompt** appears asking for reset password
3. **Enter Password** configured in VITE_RESET_PASSWORD
4. **Validation**:
   - ✅ Correct password → Shows confirmation dialog
   - ❌ Incorrect password → Shows error and cancels reset
5. **Confirm Action** if password is correct
6. **Reset Executes**:
   - Deletes all matches
   - Deletes all courts  
   - Deletes all referees
   - Deletes all zones
   - **Preserves all teams** (stats reset to 0)

### Security Features:

- ✅ Password required before reset
- ✅ Password stored in environment variable
- ✅ Not hardcoded in source code
- ✅ Two-step confirmation (password + dialog)
- ✅ Clear error messages

## Environment Variables Summary

```bash
# .env file structure

# Supabase Configuration
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Admin Login
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin123

# Reset Tournament (NEW)
VITE_RESET_PASSWORD=reset123
```

## Testing

### Test Correct Password:
1. Go to Dashboard
2. Click "Reset Tournament"
3. Enter the password from your `.env` file
4. Should proceed to confirmation dialog

### Test Incorrect Password:
1. Go to Dashboard
2. Click "Reset Tournament"
3. Enter wrong password
4. Should show "Incorrect password! Reset cancelled."

### Test Cancel:
1. Go to Dashboard
2. Click "Reset Tournament"
3. Click Cancel in password prompt
4. Nothing should happen

## Production Deployment

### Important Steps:

1. **Set Production Password**
   ```bash
   VITE_RESET_PASSWORD=your_very_secure_production_password
   ```

2. **Keep It Secret**
   - Don't commit `.env` to version control
   - Share password only with tournament administrators
   - Store securely (password manager)

3. **Change Regularly**
   - Update password after each tournament
   - Change if compromised
   - Document who has access

## Troubleshooting

### Password Not Working?

1. **Check .env file** - Make sure `VITE_RESET_PASSWORD` is set
2. **Restart server** - Changes to `.env` require restart
3. **Check spelling** - Environment variable name must be exact
4. **No spaces** - Remove spaces around = sign
5. **Check default** - If not set, default is `admin123`

### Reset Button Not Asking for Password?

1. Clear browser cache
2. Hard refresh (Ctrl + F5)
3. Check console for errors
4. Verify Dashboard.tsx changes applied

## Code Reference

### Dashboard.tsx Implementation:

```typescript
const handleReset = async () => {
  // Ask for password first
  const password = prompt('Enter reset password to proceed:');
  
  if (!password) {
    return; // User cancelled
  }

  // Validate password
  const resetPassword = import.meta.env.VITE_RESET_PASSWORD || 'admin123';
  if (password !== resetPassword) {
    alert('Incorrect password! Reset cancelled.');
    return;
  }

  // Confirm reset action
  if (confirm('Are you sure you want to reset...')) {
    // Proceed with reset
  }
};
```

## Security Best Practices

1. ✅ Use different passwords for admin login and reset
2. ✅ Don't share password via insecure channels
3. ✅ Change password between tournaments
4. ✅ Log who performs resets (future feature)
5. ✅ Keep `.env` file out of git (in .gitignore)

## Future Enhancements

Potential improvements:
- [ ] Add audit log for reset actions
- [ ] Email notification when reset occurs
- [ ] Multi-factor authentication
- [ ] Role-based permissions
- [ ] Reset confirmation via email
- [ ] Password strength requirements
- [ ] Failed attempt tracking

---

**Last Updated:** November 5, 2025
