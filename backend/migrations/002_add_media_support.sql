-- Migration: Add media support to advice articles
-- Date: 2026-03-16
-- Description: Add media_type and media_url columns to advice_articles table

-- Add media columns to advice_articles table
ALTER TABLE advice_articles 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(50) CHECK (media_type IN ('image', 'video', 'audio', 'none')),
ADD COLUMN IF NOT EXISTS media_url VARCHAR(500);

-- Set default value for existing records
UPDATE advice_articles 
SET media_type = 'none' 
WHERE media_type IS NULL;

-- Add index for media queries
CREATE INDEX IF NOT EXISTS idx_advice_media_type ON advice_articles(media_type);

-- Update the check constraint to include 'none' as a valid option
ALTER TABLE advice_articles 
DROP CONSTRAINT IF EXISTS advice_articles_media_type_check;

ALTER TABLE advice_articles 
ADD CONSTRAINT advice_articles_media_type_check 
CHECK (media_type IN ('image', 'video', 'audio', 'none'));