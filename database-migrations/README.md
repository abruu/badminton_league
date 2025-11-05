# Database Migrations

## Current Issue: Undo Button Hanging

**Problem**: When clicking the undo button, the database hangs/freezes.

**Root Cause**: The `history` column doesn't exist in the `matches` table yet.

**Solution**: Run the migration SQL script below.

---
Overall Tournament Leader
## How to Run the Migration

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project

### Step 2: Open SQL Editor
1. Click on "SQL Editor" in the left sidebar
2. Click "New Query"

### Step 3: Run the Migration
Copy and paste this SQL:

```sql
-- Add history column to matches table
ALTER TABLE "matches" 
ADD COLUMN IF NOT EXISTS "history" JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the history structure
COMMENT ON COLUMN "matches"."history" IS 'Array of ScoreEvent objects tracking every point scored. Each event contains: setNumber, team, serveBefore, serveAfter, timestamp. Used for accurate undo functionality that restores serve state.';

-- Create index on history for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_history ON "matches" USING GIN ("history");
```

### Step 4: Click "Run" or press Ctrl+Enter

### Step 5: Verify
The result should show "Success. No rows returned" - this is expected!

To double-check the column was added:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'matches' AND column_name = 'history';
```

You should see:
- column_name: `history`
- data_type: `jsonb`
- column_default: `'[]'::jsonb`

---

## After Running the Migration

Once the migration is complete:
1. Refresh your app
2. Score some points
3. Try clicking the Undo button
4. Check the browser console for logs starting with `[UNDO]` and `[SAVE_MATCH]`

The undo should now work without hanging!

---

## What This Migration Does

1. **Adds `history` column**: Stores an array of scoring events
2. **Sets default value**: Empty array `[]` for new matches
3. **Adds index**: GIN index for fast queries on JSONB data
4. **Adds documentation**: Comment explaining the column structure

---

## Migration Files

- `RUN-THIS-FIRST-add-history-column.sql` - The migration you need to run NOW
- `add-history-column.sql` - Backup copy of the same migration

---

## Troubleshooting

### Still hanging after migration?
1. Check browser console for error messages
2. Look for logs starting with `[UNDO]` and `[SAVE_MATCH]`
3. Check Supabase logs in dashboard

### "Column already exists" error?
- That's OK! The `IF NOT EXISTS` clause prevents errors
- The migration is safe to run multiple times

### Performance issues with large history?
- The GIN index should help
- History only contains events from current match
- Completed matches keep their history for record-keeping
