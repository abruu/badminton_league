-- IMPORTANT: Run this SQL in your Supabase SQL Editor
-- This adds the history column needed for the undo functionality

-- Step 1: Add the history column
ALTER TABLE "matches" 
ADD COLUMN IF NOT EXISTS "history" JSONB DEFAULT '[]'::jsonb;

-- Step 2: Add a helpful comment
COMMENT ON COLUMN "matches"."history" IS 'Array of ScoreEvent objects tracking every point scored. Each event contains: setNumber, team, serveBefore, serveAfter, timestamp. Used for accurate undo functionality that restores serve state.';

-- Step 3: Create index for better performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_matches_history ON "matches" USING GIN ("history");

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'matches' AND column_name = 'history';
