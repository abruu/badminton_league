# Referee Authentication & Match Approval Migration

Run this SQL in your Supabase SQL Editor to add username and password fields to the referees table and match approval fields:

```sql
-- Add username and password columns to referees table
ALTER TABLE referees 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add match approval columns to matches table
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS pendingApproval BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requestedBy TEXT;

-- Update existing referees with default credentials (optional)
-- You should change these through the admin panel after migration
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

## Steps to Apply:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Paste the SQL above
5. Click "Run" to execute

## After Migration:

- Existing referees will have username based on their name (lowercase, spaces replaced with underscores)
- Default password will be 'changeme123'
- **Important:** Use the admin dashboard to update referee credentials immediately
- New referees created through the admin panel will require username and password

## Security Note:

This implementation stores passwords in plain text for simplicity. For production use, consider:
- Using Supabase Auth with proper password hashing
- Implementing password encryption
- Adding password strength requirements
- Implementing password reset functionality
