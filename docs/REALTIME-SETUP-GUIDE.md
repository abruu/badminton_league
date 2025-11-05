# Supabase Real-time Subscription Setup Guide

## 📋 Overview
This guide will help you enable Supabase real-time subscriptions for instant updates across all devices viewing the tournament.

## ✅ Prerequisites
- Supabase account and project created
- Environment variables configured (`.env` file)
- Database tables created (teams, matches, courts, referees, zones)

---

## 🚀 Step-by-Step Setup

### Step 1: Configure Environment Variables

Ensure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

### Step 2: Enable Real-time in Supabase Database

#### Option A: Using Supabase Dashboard (Recommended)

1. **Go to SQL Editor:**
   - Open your Supabase project
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Copy and paste this SQL:**

```sql
-- Enable Real-time Replication for all tournament tables

-- Enable real-time for teams table
ALTER TABLE "teams" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE "teams";

-- Enable real-time for matches table
ALTER TABLE "matches" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE "matches";

-- Enable real-time for courts table
ALTER TABLE "courts" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE "courts";

-- Enable real-time for referees table
ALTER TABLE "referees" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE "referees";

-- Enable real-time for zones table
ALTER TABLE "zones" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE "zones";
```

3. **Run the query:**
   - Click **Run** button (or press Ctrl+Enter)
   - Should see "Success. No rows returned"

4. **Verify it worked:**

Run this verification query:

```sql
-- Check which tables have real-time enabled
SELECT 
  schemaname,
  tablename,
  pubname
FROM 
  pg_publication_tables
WHERE 
  pubname = 'supabase_realtime'
  AND schemaname = 'public'
ORDER BY 
  tablename;
```

**Expected output:**
```
public | courts   | supabase_realtime
public | matches  | supabase_realtime
public | referees | supabase_realtime
public | teams    | supabase_realtime
public | zones    | supabase_realtime
```

#### Option B: Using Database Migrations File

The SQL is already prepared in:
```
database-migrations/enable-realtime.sql
```

Just copy the contents and run in Supabase SQL Editor.

---

### Step 3: Enable Real-time in Supabase API Settings

1. **Go to Database Settings:**
   - In your Supabase project
   - Click **Database** → **Replication**

2. **Enable tables for real-time:**
   - Find each table: `teams`, `matches`, `courts`, `referees`, `zones`
   - Toggle **Enable Replication** for each one
   - Click **Save**

**Screenshot location to look for:**
```
Database → Replication → Source → [Select your tables]
```

---

### Step 4: Verify Application Configuration

The real-time subscription hook is already configured in your app!

**File: `src/hooks/useRealtimeSubscriptions.ts`**

This hook automatically:
- ✅ Subscribes to all table changes via WebSocket
- ✅ Updates the UI instantly when data changes
- ✅ Falls back to 30-second polling if real-time fails
- ✅ Logs connection status in browser console

**File: `src/App.tsx`**

The hook is already imported and active:
```typescript
import { useRealtimeSubscriptions } from './hooks/useRealtimeSubscriptions';

function App() {
  useRealtimeSubscriptions(); // ✅ Already active!
  // ... rest of app
}
```

---

## 🧪 Testing Real-time Updates

### Test 1: Two Browser Windows
1. Open app in **Chrome**: `http://localhost:3003`
2. Open app in **Firefox**: `http://localhost:3003`
3. In Chrome → Go to Referee Panel → Update a score
4. In Firefox → Watch LiveScoreboard update **instantly**

### Test 2: Two Devices
1. Open app on **laptop**: `http://localhost:3003`
2. Open app on **phone**: `http://your-ip:3003`
3. Update score on laptop
4. Watch phone update instantly

### Test 3: Check Console Logs
Open browser DevTools → Console, look for:

✅ **Real-time working:**
```
[REALTIME] Setting up Supabase real-time subscriptions...
[REALTIME] Subscription status: SUBSCRIBED
[REALTIME] ✅ Successfully subscribed to real-time updates
```

❌ **Real-time failed (fallback active):**
```
[REALTIME] Subscription status: CHANNEL_ERROR
[REALTIME] ⚠️ Real-time subscription failed, using fallback polling
[REALTIME] Starting fallback polling (every 30 seconds)...
```

---

## 🔍 Troubleshooting

### Issue 1: "Real-time not working"

**Check 1: Environment Variables**
```bash
# In project root, check .env file exists
cat .env

# Should show:
# VITE_SUPABASE_URL=https://...
# VITE_SUPABASE_ANON_KEY=...
```

**Check 2: Database Real-time Enabled**
- Run verification SQL (Step 2.4 above)
- Should see all 5 tables listed

**Check 3: Browser Console**
- Open DevTools → Console
- Look for `[REALTIME]` messages
- Should see "SUBSCRIBED" status

**Check 4: Supabase Replication Settings**
- Database → Replication
- All tables should have replication enabled

### Issue 2: "Console shows CHANNEL_ERROR"

**Possible causes:**
1. **Real-time not enabled in Supabase**
   - Run SQL from Step 2 again
   - Check Replication settings

2. **Wrong environment variables**
   - Verify `.env` file has correct URL and key
   - Restart dev server: `npm run dev`

3. **Network/firewall issues**
   - WebSocket connections blocked
   - Try different network

**Fallback still works!**
- App will auto-poll every 30 seconds
- Manual refresh button available
- Not ideal but functional

### Issue 3: "Updates delayed by 30 seconds"

This means **fallback polling is active** (real-time failed).

**Solution:**
1. Check console for error messages
2. Verify Step 2 and Step 3 completed
3. Check Supabase project is active (not paused)
4. Try restarting dev server

---

## 📊 Performance Benefits

### With Real-time Enabled:
- ⚡ **Instant updates** (0-100ms latency)
- 🎯 **0 polling queries** to database
- 💚 **Minimal server load**
- 🌍 **Scales to unlimited users**

### Without Real-time (Fallback):
- ⏱️ **30-second delay** for updates
- 📊 **120 queries/hour** per user
- 🔄 **Manual refresh** option available
- ⚠️ **Higher server load** with many users

---

## 🎯 Quick Start Checklist

- [ ] 1. Check `.env` file has Supabase credentials
- [ ] 2. Run SQL to enable real-time (Step 2)
- [ ] 3. Verify query shows all 5 tables
- [ ] 4. Check Database → Replication settings
- [ ] 5. Restart dev server: `npm run dev`
- [ ] 6. Open browser console, look for `[REALTIME] ✅`
- [ ] 7. Test with two browser windows
- [ ] 8. Confirm instant updates work!

---

## 🆘 Still Need Help?

### Check Logs:
```bash
# Browser console (DevTools)
Look for: [REALTIME] messages

# Supabase Dashboard
Go to: Logs → Database Logs
Filter: Real-time events
```

### Common Solutions:
1. **Restart dev server**: `Ctrl+C` then `npm run dev`
2. **Clear browser cache**: Hard refresh `Ctrl+Shift+R`
3. **Check Supabase status**: [status.supabase.com](https://status.supabase.com)
4. **Verify project not paused**: Supabase Dashboard → Settings

### Manual Refresh:
Even if real-time isn't working, you can always:
- Click **Refresh button** in LiveScoreboard (top right)
- Click **Refresh button** in Statistics (top right)
- Fallback polling runs every 30 seconds automatically

---

## 📝 Additional Resources

- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/subscribe)
- `docs/DATABASE-OPTIMIZATION.md` - Performance details
- `src/hooks/useRealtimeSubscriptions.ts` - Implementation code

---

## ✨ Success Indicators

Once real-time is working, you'll see:

**In Console:**
```
[REALTIME] ✅ Successfully subscribed to real-time updates
[REALTIME] Matches table changed: {eventType: 'UPDATE', ...}
```

**In UI:**
- Scores update instantly across all devices
- No 30-second delay
- Smooth, real-time experience
- Green "🔴 Live" indicators work perfectly

**In Network Tab (DevTools):**
- See WebSocket connection (ws://)
- No constant fetch/XHR requests
- Minimal network activity

🎉 **You're all set!** Real-time subscriptions are now active!
