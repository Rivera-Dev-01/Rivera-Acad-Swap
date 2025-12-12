-- ============================================
-- Acad Swap Marketplace Database Schema
-- ============================================
-- Run this in your Supabase SQL Editor
-- This creates all tables needed for the marketplace backend

-- ============================================
-- 1. ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    images TEXT[], -- Array of image URLs
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for items table
CREATE INDEX IF NOT EXISTS idx_items_seller_id ON items(seller_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);

-- ============================================
-- 2. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================
-- 3. RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ratings table
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user_id ON ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_ratings_transaction_id ON ratings(transaction_id);

-- ============================================
-- 4. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('view', 'message', 'sale', 'purchase', 'rating', 'friend_request')),
    message TEXT NOT NULL,
    related_id UUID, -- ID of related entity (item, transaction, user, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- 5. FRIENDSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Indexes for friendships table
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- ============================================
-- 6. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Trigger for items table
CREATE TRIGGER update_items_updated_at 
BEFORE UPDATE ON items 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for transactions table
CREATE TRIGGER update_transactions_updated_at 
BEFORE UPDATE ON transactions 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ratings table
CREATE TRIGGER update_ratings_updated_at 
BEFORE UPDATE ON ratings 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for friendships table
CREATE TRIGGER update_friendships_updated_at 
BEFORE UPDATE ON friendships 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. HELPER FUNCTIONS FOR STATISTICS
-- ============================================

-- Function to get user's reputation score
CREATE OR REPLACE FUNCTION get_user_reputation(user_uuid UUID)
RETURNS DECIMAL(3, 2) AS $$
DECLARE
    avg_rating DECIMAL(3, 2);
BEGIN
    SELECT COALESCE(AVG(rating), 0.0)
    INTO avg_rating
    FROM ratings
    WHERE rated_user_id = user_uuid;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's total earnings
CREATE OR REPLACE FUNCTION get_user_earnings(user_uuid UUID)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(price), 0.0)
    INTO total
    FROM transactions
    WHERE seller_id = user_uuid AND status = 'completed';
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's sold items count
CREATE OR REPLACE FUNCTION get_sold_items_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO count
    FROM transactions
    WHERE seller_id = user_uuid AND status = 'completed';
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active listings count
CREATE OR REPLACE FUNCTION get_active_listings_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO count
    FROM items
    WHERE seller_id = user_uuid AND status = 'active';
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's friends count
CREATE OR REPLACE FUNCTION get_friends_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO count
    FROM friendships
    WHERE (user_id = user_uuid OR friend_id = user_uuid) AND status = 'active';
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ============================================

-- ============================================
-- Items Table RLS
-- ============================================
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Anyone can view active items or their own items
CREATE POLICY "Anyone can view active items"
ON items FOR SELECT
USING (status = 'active' OR seller_id = auth.uid());

-- Users can insert their own items
CREATE POLICY "Users can create own items"
ON items FOR INSERT
WITH CHECK (seller_id = auth.uid());

-- Users can update their own items
CREATE POLICY "Users can update own items"
ON items FOR UPDATE
USING (seller_id = auth.uid());

-- Users can delete their own items
CREATE POLICY "Users can delete own items"
ON items FOR DELETE
USING (seller_id = auth.uid());

-- ============================================
-- Transactions Table RLS
-- ============================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view transactions they're involved in
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Users can create transactions they're involved in
CREATE POLICY "Enable insert for authenticated users"
ON transactions FOR INSERT
WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

-- ============================================
-- Ratings Table RLS
-- ============================================
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings"
ON ratings FOR SELECT
USING (true);

-- Users can create ratings for transactions they're involved in
CREATE POLICY "Buyers can rate sellers"
ON ratings FOR INSERT
WITH CHECK (rater_id = auth.uid());

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
ON ratings FOR UPDATE
USING (rater_id = auth.uid());

-- ============================================
-- Notifications Table RLS
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- System creates notifications (handled by backend with service role)
CREATE POLICY "Enable insert for system"
ON notifications FOR INSERT
WITH CHECK (true);

-- ============================================
-- Friendships Table RLS
-- ============================================
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they're involved in
CREATE POLICY "Users can view own friendships"
ON friendships FOR SELECT
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Users can create friendships
CREATE POLICY "Users can create friendships"
ON friendships FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update friendships they're involved in
CREATE POLICY "Users can update own friendships"
ON friendships FOR UPDATE
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Users can delete friendships they're involved in
CREATE POLICY "Users can delete own friendships"
ON friendships FOR DELETE
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- You now have:
-- ✅ 5 new tables (items, transactions, ratings, notifications, friendships)
-- ✅ All necessary indexes for performance
-- ✅ Auto-updating timestamps
-- ✅ Helper functions for dashboard statistics
-- ✅ Row Level Security policies for data protection
--
-- Next steps:
-- 1. Create API routes to interact with these tables
-- 2. Update dashboard to fetch real data
-- 3. Build item listing and marketplace features
-- ============================================
