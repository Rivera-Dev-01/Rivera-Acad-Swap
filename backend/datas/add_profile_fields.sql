-- Add profile fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Create index for profile completion queries
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);

-- Update existing users to check if they should be marked as complete
-- (This is optional - you can run this after users add their info)
UPDATE users 
SET profile_completed = true 
WHERE profile_picture IS NOT NULL 
  AND address IS NOT NULL 
  AND id IN (
    SELECT DISTINCT seller_id 
    FROM items 
    WHERE seller_id IS NOT NULL
  );
