-- ============================================================
-- Global Church — Database Schema
-- ============================================================

-- Users table (synced with Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_name TEXT NOT NULL,
  display_icon TEXT,
  avatar_url TEXT,
  denomination TEXT DEFAULT 'orthodox',
  faith_type TEXT DEFAULT 'christian' CHECK (faith_type IN ('christian', 'other')),
  interests TEXT[] DEFAULT '{}',
  statuses TEXT[] DEFAULT '{}',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_updated_at TIMESTAMPTZ,
  is_sharing_location BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_user_ids TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'ru' CHECK (language IN ('ru', 'be', 'en'))
);

CREATE INDEX idx_users_location ON users(location_lat, location_lng)
  WHERE is_sharing_location = TRUE AND is_online = TRUE;

CREATE INDEX idx_users_is_online ON users(is_online);

-- User locations history
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_sharing BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_user_locations_user ON user_locations(user_id, updated_at DESC);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, created_at DESC);

-- ============================================================
-- Enable Supabase Realtime
-- ============================================================

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE user_locations REPLICA IDENTITY FULL;

BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE messages, user_locations;
COMMIT;

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on Google sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

-- Users: everyone can read, only owner can update
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Messages: users can only read/write their own messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- User locations: opt-in sharing
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see shared locations"
  ON user_locations FOR SELECT
  USING (is_sharing = TRUE);

CREATE POLICY "Users can update own location"
  ON user_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own location 2"
  ON user_locations FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- Data API grants (for supabase-js / PostgREST access)
-- ============================================================

GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO service_role;

-- Migration: add status column for delivery/read tracking
-- Run separately if messages table already exists:
-- ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));
-- UPDATE messages SET status = 'read' WHERE is_read = TRUE AND (status IS NULL OR status = 'sent');
-- UPDATE messages SET status = 'sent' WHERE is_read = FALSE AND status IS NULL;

GRANT SELECT, INSERT, UPDATE ON user_locations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_locations TO service_role;
