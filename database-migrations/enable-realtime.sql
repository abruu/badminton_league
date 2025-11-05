-- Enable Real-time Replication for all tournament tables
-- Run this in Supabase SQL Editor

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

-- Verify replication is enabled
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

-- Expected output:
-- public | courts   | supabase_realtime
-- public | matches  | supabase_realtime
-- public | referees | supabase_realtime
-- public | teams    | supabase_realtime
-- public | zones    | supabase_realtime
