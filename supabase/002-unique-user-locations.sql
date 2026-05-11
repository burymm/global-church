-- Clean up duplicates: keep only latest row per user_id
DELETE FROM user_locations a
USING (
  SELECT user_id, MAX(updated_at) as max_updated_at
  FROM user_locations
  GROUP BY user_id
) b
WHERE a.user_id = b.user_id
  AND a.updated_at < b.max_updated_at;

-- Add unique constraint so upsert works correctly
ALTER TABLE user_locations ADD CONSTRAINT user_locations_user_id_key UNIQUE (user_id);
