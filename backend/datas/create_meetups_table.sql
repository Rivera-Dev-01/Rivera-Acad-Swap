-- Create meetups table
CREATE TABLE IF NOT EXISTS meetups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    location_name TEXT NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled_by_seller', 'cancelled_by_buyer', 'rescheduled')),
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetups_seller_id ON meetups(seller_id);
CREATE INDEX IF NOT EXISTS idx_meetups_buyer_id ON meetups(buyer_id);
CREATE INDEX IF NOT EXISTS idx_meetups_item_id ON meetups(item_id);
CREATE INDEX IF NOT EXISTS idx_meetups_status ON meetups(status);
CREATE INDEX IF NOT EXISTS idx_meetups_scheduled_date ON meetups(scheduled_date);

-- Create reputation history table
CREATE TABLE IF NOT EXISTS reputation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meetup_id UUID REFERENCES meetups(id) ON DELETE SET NULL,
    change_amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reputation_history_user_id ON reputation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_history_meetup_id ON reputation_history(meetup_id);

-- Enable RLS
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetups
CREATE POLICY "Users can view their own meetups"
ON meetups
FOR SELECT
TO authenticated
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Sellers can create meetups"
ON meetups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own meetups"
ON meetups
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Users can delete their own meetups"
ON meetups
FOR DELETE
TO authenticated
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- RLS Policies for reputation_history
CREATE POLICY "Users can view their own reputation history"
ON reputation_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert reputation history"
ON reputation_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_meetups_updated_at
    BEFORE UPDATE ON meetups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add reputation_score column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='reputation_score') THEN
        ALTER TABLE users ADD COLUMN reputation_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- Function to count user cancellations
CREATE OR REPLACE FUNCTION get_user_cancellation_count(user_uuid UUID, cancellation_type TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    cancel_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO cancel_count
    FROM meetups
    WHERE (seller_id = user_uuid AND status = 'cancelled_by_seller' AND cancellation_type = 'seller')
       OR (buyer_id = user_uuid AND status = 'cancelled_by_buyer' AND cancellation_type = 'buyer');
    
    RETURN COALESCE(cancel_count, 0);
END;
$$;
