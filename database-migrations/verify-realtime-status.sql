-- Verify Real-time Status
-- Run this query to check if real-time is already enabled

-- Check which tables are in supabase_realtime publication
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

-- Expected output if real-time is enabled:
-- public | courts   | supabase_realtime
-- public | matches  | supabase_realtime
-- public | referees | supabase_realtime
-- public | teams    | supabase_realtime
-- public | zones    | supabase_realtime

-- Check REPLICA IDENTITY for each table
SELECT 
  schemaname,
  tablename,
  CASE relreplident
    WHEN 'd' THEN 'default'
    WHEN 'n' THEN 'nothing'
    WHEN 'f' THEN 'full'
    WHEN 'i' THEN 'index'
  END as replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_publication_tables pt ON pt.tablename = c.relname AND pt.schemaname = n.nspname
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
  AND c.relname IN ('teams', 'matches', 'courts', 'referees', 'zones')
ORDER BY c.relname;

-- If all tables show 'full' replica_identity and appear in supabase_realtime,
-- then real-time is ALREADY ENABLED! ✅
