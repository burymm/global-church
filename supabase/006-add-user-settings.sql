ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"notifications_enabled": true, "sound_enabled": true}'::jsonb;
