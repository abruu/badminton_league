-- Add history column to matches table
-- This tracks all scoring events for comprehensive undo functionality

ALTER TABLE "matches" 
ADD COLUMN IF NOT EXISTS "history" JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the history structure
COMMENT ON COLUMN "matches"."history" IS 'Array of ScoreEvent objects tracking every point scored. Each event contains: setNumber, team, serveBefore, serveAfter, timestamp. Used for accurate undo functionality that restores serve state.';

-- Create index on history for faster queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_matches_history ON "matches" USING GIN ("history");
