# Supabase Setup Guide

This app uses **Supabase** as a cloud database - no backend server needed! All database operations happen directly from the frontend.

## Quick Setup (5 minutes)

### 1. Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### 2. Create a New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Enter project details:
   - **Name**: `badminton-tournament`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project" (takes ~2 minutes)

### 3. Get Your API Credentials

1. Once project is ready, go to **Settings** → **API**
2. Find these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 4. Configure Your App

1. Open the `.env` file in your project root
2. Replace the placeholder values:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Create Database Tables

In your Supabase dashboard, go to **SQL Editor** and run this SQL:

```sql
-- Teams table
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  players JSONB NOT NULL,
  zone TEXT,
  stats JSONB DEFAULT '{"matchesWon": 0, "matchesLost": 0, "points": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  team1 JSONB NOT NULL,
  team2 JSONB NOT NULL,
  score JSONB DEFAULT '{"team1": 0, "team2": 0}'::jsonb,
  status TEXT DEFAULT 'upcoming',
  winner JSONB,
  "courtId" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courts table
CREATE TABLE courts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "refereeId" TEXT DEFAULT '',
  "refereeName" TEXT DEFAULT 'Unassigned',
  match JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referees table
CREATE TABLE referees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "courtId" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zones table
CREATE TABLE zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  courts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Score History table
CREATE TABLE score_history (
  "matchId" TEXT NOT NULL,
  team TEXT NOT NULL,
  timestamp BIGINT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - Allow all operations for now
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE referees ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables
CREATE POLICY "Allow all operations on teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on matches" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on courts" ON courts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on referees" ON referees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on zones" ON zones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on score_history" ON score_history FOR ALL USING (true) WITH CHECK (true);

-- Insert default zones
INSERT INTO zones (id, name, courts) VALUES
  ('zone-a', 'Zone A', '[]'::jsonb),
  ('zone-b', 'Zone B', '[]'::jsonb),
  ('zone-c', 'Zone C', '[]'::jsonb),
  ('zone-d', 'Zone D', '[]'::jsonb);

-- Insert default courts
INSERT INTO courts (id, name, "refereeId", "refereeName") VALUES
  ('court-1', 'Court 1', '', 'Unassigned'),
  ('court-2', 'Court 2', '', 'Unassigned'),
  ('court-3', 'Court 3', '', 'Unassigned');
```

### 6. Run Your App

```powershell
npm run dev
```

Your app will now use Supabase as the database! 🎉

## Features

✅ **No Backend Server** - Everything runs in the browser
✅ **Real-time Sync** - Data syncs across all devices automatically
✅ **Cloud Database** - Data persists in the cloud
✅ **Free Tier** - 500MB database, 2GB bandwidth/month
✅ **Network Access** - Access from any device on your network

## Troubleshooting

### "Missing Supabase environment variables" Error

**Solution**: Check that your `.env` file has both:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Restart the dev server after editing `.env`.

### "relation does not exist" Error

**Solution**: Run the SQL script in step 5 to create all tables.

### Data Not Saving

**Solution**: Check that:
1. Tables are created (see step 5)
2. Row Level Security policies are enabled
3. Your API credentials are correct

### Real-time Not Working

Supabase has real-time features, but this app uses periodic refreshing (every 1-2 seconds) which works great for tournament scoring.

## Data Management

### View Your Data

Go to **Table Editor** in Supabase dashboard to see all your data.

### Reset Tournament

Click "Reset Tournament" in the app or run this SQL:

```sql
DELETE FROM score_history;
DELETE FROM matches;
DELETE FROM teams;
```

### Backup Data

Supabase automatically backs up your data. You can also:
1. Go to **Table Editor**
2. Select a table
3. Click "Export as CSV"

## Security Note

The current setup uses permissive RLS policies (allows all operations). For production use, you should:
1. Add authentication
2. Restrict policies based on user roles
3. Add validation rules

For a tournament app on a local network, the current setup is fine!

## Cost

**Free Tier Includes:**
- 500 MB database space
- 2 GB bandwidth/month  
- 50,000 monthly active users
- Unlimited API requests

Perfect for tournament scoring! 🏸

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
