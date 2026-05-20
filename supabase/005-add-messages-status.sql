-- Add status column for delivery/read tracking
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));

UPDATE messages SET status = 'read' WHERE is_read = TRUE AND (status IS NULL OR status = 'sent');
UPDATE messages SET status = 'sent' WHERE is_read = FALSE AND status IS NULL;
