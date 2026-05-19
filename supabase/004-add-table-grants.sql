-- ============================================================
-- Explicit GRANTs for Data API access
-- Required since Supabase changed default: new tables won't
-- auto-grant access to Data API (supabase-js / PostgREST).
-- See: https://supabase.com/blog/2026-03-31-data-api-grants
-- ============================================================

-- Users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO service_role;

-- Messages
GRANT SELECT, INSERT ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO service_role;

-- User locations
GRANT SELECT, INSERT, UPDATE ON user_locations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_locations TO service_role;
