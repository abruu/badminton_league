-- Add columns for best of 3 games with serve tracking
-- Run this SQL in your Supabase SQL Editor

-- Add currentGame column to store current game score
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS "currentGame" JSONB DEFAULT '{"team1": 0, "team2": 0}'::jsonb;

-- Add gameHistory column to store completed games
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS "gameHistory" JSONB DEFAULT '[]'::jsonb;

-- Add servingTeam column to track which team is serving
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS "servingTeam" TEXT DEFAULT 'team1';

-- Add team1Position column (left or right side of court)
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS "team1Position" TEXT DEFAULT 'left';

-- Add team2Position column (left or right side of court)
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS "team2Position" TEXT DEFAULT 'right';

-- Add comments to document the columns
COMMENT ON COLUMN matches."currentGame" IS 'Current game score as JSON: {"team1": number, "team2": number}';
COMMENT ON COLUMN matches."gameHistory" IS 'Array of completed game scores';
COMMENT ON COLUMN matches."servingTeam" IS 'Which team is currently serving (team1 or team2)';
COMMENT ON COLUMN matches."team1Position" IS 'Court position of team1 (left or right)';
COMMENT ON COLUMN matches."team2Position" IS 'Court position of team2 (left or right)';

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'matches' 
  AND column_name IN ('currentGame', 'gameHistory', 'servingTeam', 'team1Position', 'team2Position')
ORDER BY column_name;
