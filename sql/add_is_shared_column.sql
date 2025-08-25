-- Add is_shared column to interviews table
ALTER TABLE interviews ADD COLUMN is_shared BOOLEAN DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX idx_interviews_is_shared ON interviews(is_shared);

-- Update existing records to have is_shared = false by default
UPDATE interviews SET is_shared = FALSE WHERE is_shared IS NULL;