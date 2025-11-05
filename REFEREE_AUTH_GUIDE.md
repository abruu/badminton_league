# 🏸 Referee Authentication System - Setup Guide

## Overview

Your Badminton Tournament app now has a complete referee authentication system. Admins can create referee accounts with usernames and passwords, and referees can log in to manage their assigned matches.

## 🎯 Features Implemented

### Admin Features
- ✅ Create referee accounts with username and password
- ✅ View all referees with their credentials
- ✅ Show/hide passwords with eye icon
- ✅ Delete referee accounts
- ✅ Assign referees to specific courts
- ✅ Dedicated "Referee Management" tab in admin dashboard

### Referee Features
- ✅ Separate login page at `/referee/login`
- ✅ Personalized referee panel showing only their assigned match
- ✅ Real-time score updates for assigned match
- ✅ Add points to either team (+1 Point buttons)
- ✅ Undo last point functionality
- ✅ Finish match capability
- ✅ Session management with automatic logout

## 📋 Setup Instructions

### Step 1: Update Supabase Database

1. Go to your Supabase project: https://supabase.com/dashboard/project/bquggzgncrucbxscfjkx
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste this SQL:

```sql
-- Add username and password columns to referees table
ALTER TABLE referees 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password TEXT;

-- Update existing referees with default credentials (if any exist)
UPDATE referees 
SET 
  username = LOWER(REPLACE(name, ' ', '_')),
  password = 'changeme123'
WHERE username IS NULL;

-- Make username and password required for new referees
ALTER TABLE referees 
ALTER COLUMN username SET NOT NULL,
ALTER COLUMN password SET NOT NULL;
```

5. Click **Run** to execute the migration
6. You should see "Success. No rows returned" message

### Step 2: Test the System

#### A. Create a Referee (Admin)
1. Open the app at http://localhost:3000
2. Click **Admin Dashboard**
3. Login with admin credentials (username: `admin`, password: `admin123`)
4. Go to the **Referee Management** tab
5. Click **Add Referee**
6. Fill in the form:
   - Name: `John Smith`
   - Username: `john_referee`
   - Password: `referee123`
   - Assign to Court: Select a court (optional)
7. Click **Create Referee**

#### B. Login as Referee
1. Go to homepage
2. Click **Referee Panel** (or navigate to http://localhost:3000/referee/login)
3. Enter credentials:
   - Username: `john_referee`
   - Password: `referee123`
4. Click **Sign In**

#### C. Manage Matches
1. After login, you'll see the **Referee Panel**
2. Your assigned court is displayed at the top
3. If a match is assigned to your court, you'll see:
   - Both teams with player names
   - Current score
   - **+1 Point** buttons for each team
   - **Undo Last Point** button
   - **Finish Match** button

## 🔐 Security Notes

⚠️ **Important:** This implementation stores passwords in plain text for simplicity. This is suitable for local network tournaments but **NOT for production internet-facing applications**.

### For Production Use, Consider:
- Using Supabase Auth with built-in password hashing
- Implementing bcrypt or similar encryption
- Adding password strength requirements
- Implementing password reset functionality
- Adding two-factor authentication
- Using JWT tokens instead of sessionStorage

## 📱 User Workflows

### Admin Workflow
1. **Login** → Admin login page (`/login`)
2. **Dashboard** → Navigate to "Referee Management" tab
3. **Create Referees** → Add new referee accounts
4. **View Credentials** → Show/hide passwords as needed
5. **Assign Courts** → Link referees to specific courts
6. **Manage Tournament** → Use other tabs for teams, matches, etc.

### Referee Workflow
1. **Login** → Referee login page (`/referee/login`)
2. **View Assignment** → See assigned court and current match
3. **Update Scores** → Click +1 Point buttons during match
4. **Undo Mistakes** → Use Undo button if needed
5. **Finish Match** → Complete match when done
6. **Logout** → Secure logout when finished

## 🗺️ Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Homepage with navigation cards |
| `/login` | Public | Admin login |
| `/dashboard` | Protected (Admin) | Admin dashboard with all management tools |
| `/referee/login` | Public | Referee login page |
| `/referee/panel` | Protected (Referee) | Referee's match management panel |
| `/referee` | Public | Old referee view (still works, for backward compatibility) |
| `/live` | Public | Live scoreboard for spectators |

## 🎨 UI Features

### Referee Management Tab
- Clean table layout showing all referees
- Eye icon to toggle password visibility
- Color-coded court assignments (green = assigned, gray = unassigned)
- Delete button with confirmation dialog
- Form validation for duplicate usernames

### Referee Login Page
- Green/blue gradient design (different from admin)
- UserCheck icon
- Link to admin login
- Error messages for invalid credentials
- Loading state during authentication

### Referee Panel
- Personalized greeting with referee name
- Court assignment prominently displayed
- Large score display for easy reading
- Color-coded team sections (blue vs purple)
- Status indicators (LIVE, UPCOMING, COMPLETED)
- Winner announcement when match completes

## 🔧 Technical Details

### Session Storage
- Admin: `isAuthenticated`, stored by admin login
- Referee: `refereeAuthenticated`, `refereeId`, `refereeName`, `refereeCourtId`
- Separate session keys prevent access conflicts

### Authentication Flow
```
Referee Login → authenticateReferee() → Supabase Query → 
Store Session → Navigate to /referee/panel → 
RefereeProtectedRoute → Check Session → Render Panel
```

### Database Schema (Referees Table)
```sql
CREATE TABLE referees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  courtId TEXT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
```

## 🐛 Troubleshooting

### "Invalid username or password"
- Check that the referee was created in admin panel
- Verify credentials are correct (case-sensitive)
- Run the SQL migration in Supabase

### "You are not assigned to any court yet"
- Admin needs to assign referee to a court
- Go to Dashboard → Referee Management → Edit referee
- Or use Court Assignment tab to assign referee

### Session expires / Gets logged out
- Session is stored in `sessionStorage` (clears on tab close)
- To persist across browser restarts, switch to `localStorage`
- Edit `sessionStorage` to `localStorage` in login pages

### Can't see any match
- Match must be assigned to referee's court
- Admin needs to use Court Assignment tab
- Match status should be "upcoming" or "live"

## 📝 Next Steps (Optional Enhancements)

- [ ] Add password change functionality for referees
- [ ] Implement password strength meter
- [ ] Add "Remember me" checkbox for persistent login
- [ ] Create referee profile page
- [ ] Add match history for each referee
- [ ] Email notifications for new assignments
- [ ] Mobile-responsive improvements
- [ ] QR code login for referees
- [ ] Multi-language support

## 🎉 You're All Set!

Your tournament app now has a complete referee authentication system. Admins can create and manage referee accounts, and referees can securely log in to manage their assigned matches.

**Test it out:**
1. Run the SQL migration in Supabase
2. Create a referee in admin panel
3. Assign them to a court
4. Log in as that referee
5. Update match scores in real-time!

---

**Need Help?** Check the main README.md or create an issue in the repository.
