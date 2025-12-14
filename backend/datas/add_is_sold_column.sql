-- ============================================
-- Add is_sold column to items table
-- ============================================
-- Run this in your Supabase SQL Editor

-- Add is_sold column to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_items_is_sold ON items(is_sold);

-- Update existing sold items based on status
UPDATE items 
SET is_sold = TRUE 
WHERE status = 'sold';

-- Optional: Create a trigger to auto-update is_sold when status changes
CREATE OR REPLACE FUNCTION update_is_sold_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'sold' THEN
        NEW.is_sold = TRUE;
    ELSIF NEW.status = 'active' THEN
        NEW.is_sold = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_is_sold ON items;
CREATE TRIGGER trigger_update_is_sold
    BEFORE UPDATE OF status ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_is_sold_on_status_change();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- ✅ Added is_sold column to items table
-- ✅ Created index for performance
-- ✅ Updated existing sold items
-- ✅ Created trigger to auto-sync is_sold with status
-- ============================================
