-- Migration: Add password reset functionality
-- Date: 2024-01-16
-- Description: Add reset_token and reset_token_expiry columns to users table

-- Add reset token columns if they don't exist
DO $$ 
BEGIN
    -- Add reset_token column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'reset_token') THEN
        ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
    END IF;
    
    -- Add reset_token_expiry column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'reset_token_expiry') THEN
        ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP;
    END IF;
END $$;

-- Create index for reset_token if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Log migration completion
INSERT INTO migration_log (migration_name, executed_at) 
VALUES ('003_add_password_reset', NOW())
ON CONFLICT (migration_name) DO NOTHING;

COMMIT;