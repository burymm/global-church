-- Remove deprecated "openToTalk" status from all users
UPDATE users
SET statuses = ARRAY_REMOVE(statuses, 'openToTalk')
WHERE statuses @> ARRAY['openToTalk'];
