# IMPORTANT: Run This SQL First!

Before testing the profile system, you MUST run this SQL in your Supabase SQL Editor:

```sql
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
```

## How to Run:
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the SQL above
5. Click "Run" or press Ctrl+Enter

## What This Does:
- Adds `profile_picture` column to store profile image URLs
- Adds `address` column for user addresses
- Adds `profile_completed` flag to track completion status
- Creates an index for faster queries
- Updates existing users who already meet the requirements

## After Running:
You can now test the profile system:
- Visit `/profile` to view/edit profile
- Visit `/profile-completion` to check completion status
- Try listing items (limited to 1 until profile complete)
