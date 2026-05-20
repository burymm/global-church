-- ============================================================
-- Migration 001: Add settings + auth_name to users table
-- ============================================================

-- Add new columns (IF NOT EXISTS for idempotency)
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_name TEXT;

-- Backfill auth_name for existing users: Google full_name is the original display_name
UPDATE users SET auth_name = display_name WHERE auth_name IS NULL;

-- Update trigger function to save auth_name for new signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, display_name, avatar_url, auth_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
