-- Migration: Update from 21-point games to 15-point sets (with 17 max)
-- This script restructures to use a sets array with explicit set numbers

-- Step 1: Drop old columns if they exist
ALTER TABLE matches 
DROP COLUMN IF EXISTS "currentGame";

ALTER TABLE matches 
DROP COLUMN IF EXISTS "gameHistory";

ALTER TABLE matches 
DROP COLUMN IF EXISTS "currentSet";

ALTER TABLE matches 
DROP COLUMN IF EXISTS "setHistory";

-- Step 2: Add new sets array column (JSONB array of Set objects)
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS "sets" JSONB DEFAULT '[{"setNumber": 1, "score": {"team1": 0, "team2": 0}}]'::jsonb;

-- Step 3: Add currentSetNumber column (tracks which set: 1, 2, or 3)
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS "currentSetNumber" INTEGER DEFAULT 1;

-- Step 4: Update existing matches to have currentSetNumber = 1 and initialize sets array
UPDATE matches 
SET "currentSetNumber" = 1,
    "sets" = '[{"setNumber": 1, "score": {"team1": 0, "team2": 0}}]'::jsonb
WHERE "currentSetNumber" IS NULL OR "sets" IS NULL;

-- Verification Query
SELECT 
  id,
  status,
  score,
  "sets",
  "currentSetNumber",
  "servingTeam",
  "team1Position",
  "team2Position"
FROM matches
ORDER BY id DESC
LIMIT 5;

-- Summary of Changes:
-- 1. Removed old columns: currentGame, gameHistory, currentSet, setHistory
-- 2. New column: sets (JSONB array)
--    Structure: [{ setNumber: 1, score: { team1: 0, team2: 0 }, winner?: 'team1' | 'team2' }]
-- 3. Column: currentSetNumber (1, 2, or 3)
-- 4. Scoring logic: 15 points to win (2-point lead required, 17 max)
-- 5. Rally scoring: Point winner gets/keeps serve
-- 6. Best of 3 sets format maintained
-- 7. Sets array stores all sets (current + completed) with explicit set numbers
