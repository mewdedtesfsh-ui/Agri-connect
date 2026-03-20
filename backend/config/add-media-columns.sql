-- Add media columns to advice_articles table
ALTER TABLE advice_articles 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) CHECK (media_type IN ('none', 'image', 'video', 'audio')),
ADD COLUMN IF NOT EXISTS media_url VARCHAR(500);

-- Set default value for existing records
UPDATE advice_articles SET media_type = 'none' WHERE media_type IS NULL;
