-- Add referral columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    reward_given BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own referrals"
ON referrals
FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
ON referrals
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_first_name TEXT, user_last_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base code from first name + last name + random number
    base_code := UPPER(SUBSTRING(user_first_name FROM 1 FOR 3) || SUBSTRING(user_last_name FROM 1 FOR 3));
    final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if code exists, if so, generate new one
    WHILE EXISTS (SELECT 1 FROM users WHERE referral_code = final_code) LOOP
        counter := counter + 1;
        final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Safety: prevent infinite loop
        IF counter > 100 THEN
            final_code := 'REF' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
            EXIT;
        END IF;
    END LOOP;
    
    RETURN final_code;
END;
$$;

-- Function to process referral reward
CREATE OR REPLACE FUNCTION process_referral_reward(referrer_uuid UUID, referred_uuid UUID, ref_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert referral record
    INSERT INTO referrals (referrer_id, referred_id, referral_code, reward_given)
    VALUES (referrer_uuid, referred_uuid, ref_code, true);
    
    -- Give reward to referrer (+15 reputation)
    UPDATE users 
    SET reputation_score = COALESCE(reputation_score, 0) + 15,
        total_referrals = COALESCE(total_referrals, 0) + 1
    WHERE id = referrer_uuid;
    
    -- Give reward to new user (+10 reputation)
    UPDATE users 
    SET reputation_score = COALESCE(reputation_score, 0) + 10
    WHERE id = referred_uuid;
    
    -- Log reputation changes
    INSERT INTO reputation_history (user_id, change_amount, reason)
    VALUES 
        (referrer_uuid, 15, 'Referral reward - invited new user'),
        (referred_uuid, 10, 'Referral bonus - joined via referral');
    
    RETURN true;
END;
$$;

-- Update existing users to have referral codes
DO $$
DECLARE
    user_record RECORD;
    new_code TEXT;
BEGIN
    FOR user_record IN SELECT id, first_name, last_name FROM users WHERE referral_code IS NULL
    LOOP
        new_code := generate_referral_code(user_record.first_name, user_record.last_name);
        UPDATE users SET referral_code = new_code WHERE id = user_record.id;
    END LOOP;
END $$;
