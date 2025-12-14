-- =====================================================
-- NOTIFICATIONS & FRIENDSHIPS TABLES
-- =====================================================
-- This script creates the tables needed for:
-- 1. Notification system (bell icon in navbar)
-- 2. Friend request system
-- =====================================================

-- =====================================================
-- 1. NOTIFICATIONS TABLE
-- =====================================================
-- Stores all user notifications (offers, messages, meetups, friend requests, board posts)

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'offer', 'message', 'meetup', 'friend_request', 'board_post'
    message TEXT NOT NULL,
    related_id UUID, -- ID of the related entity (offer_id, message_id, meetup_id, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

COMMENT ON TABLE notifications IS 'Stores user notifications for offers, messages, meetups, friend requests, and board posts';
COMMENT ON COLUMN notifications.type IS 'Type of notification: offer, message, meetup, friend_request, board_post';
COMMENT ON COLUMN notifications.related_id IS 'UUID of the related entity (offer, message, meetup, friendship, post)';

-- =====================================================
-- 2. FRIENDSHIPS TABLE
-- =====================================================
-- Stores friend connections and friend requests

CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'blocked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate friendships
    CONSTRAINT unique_friendship UNIQUE(user_id, friend_id),
    -- Prevent self-friendship
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_friendships_user_status ON friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_status ON friendships(friend_id, status);

COMMENT ON TABLE friendships IS 'Stores friend connections and friend requests between users';
COMMENT ON COLUMN friendships.status IS 'Status of friendship: pending (request sent), active (friends), blocked';
COMMENT ON COLUMN friendships.user_id IS 'User who sent the friend request';
COMMENT ON COLUMN friendships.friend_id IS 'User who received the friend request';

-- =====================================================
-- 3. TRIGGER FOR UPDATED_AT
-- =====================================================
-- Auto-update the updated_at timestamp when friendship status changes

CREATE OR REPLACE FUNCTION update_friendship_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_friendship_timestamp
    BEFORE UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION update_friendship_updated_at();

-- =====================================================
-- 4. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================
-- Uncomment to insert sample notifications for testing

/*
-- Get first two user IDs for testing
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
BEGIN
    SELECT id INTO user1_id FROM users LIMIT 1;
    SELECT id INTO user2_id FROM users OFFSET 1 LIMIT 1;
    
    -- Sample notifications
    INSERT INTO notifications (user_id, type, message, is_read) VALUES
    (user1_id, 'offer', 'New offer from John Doe on iPhone 13', FALSE),
    (user1_id, 'message', 'New message from Jane Smith', FALSE),
    (user1_id, 'friend_request', 'Mike Johnson sent you a friend request', FALSE);
    
    -- Sample friend request
    INSERT INTO friendships (user_id, friend_id, status) VALUES
    (user2_id, user1_id, 'pending');
END $$;
*/

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the tables were created successfully

-- Check notifications table
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Check friendships table
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'friendships'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    tablename, 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename IN ('notifications', 'friendships')
ORDER BY tablename, indexname;

-- =====================================================
-- SETUP COMPLETE! ✅
-- =====================================================
-- You can now use the notification and friend request features!
-- 
-- Next steps:
-- 1. Restart your backend server
-- 2. Test the notification bell in the navbar
-- 3. Test sending friend requests
-- 4. Check the /friend-requests page
-- =====================================================
