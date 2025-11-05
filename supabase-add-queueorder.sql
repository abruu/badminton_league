-- Add queueOrder column to matches table
-- This column is used to maintain the order of matches in a court's queue

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS "queueOrder" INTEGER;

-- Add a comment to document the column
COMMENT ON COLUMN matches."queueOrder" IS 'Order of match in court queue (lower number = higher priority)';

-- Optional: Create an index for better query performance when sorting by queueOrder
CREATE INDEX IF NOT EXISTS idx_matches_queue_order 
ON matches("courtId", "queueOrder") 
WHERE "courtId" IS NOT NULL AND status IN ('upcoming', 'live');

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'matches' AND column_name = 'queueOrder';
