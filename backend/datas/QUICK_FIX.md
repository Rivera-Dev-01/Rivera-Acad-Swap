# Quick Fix for "is_sold does not exist" Error

## The Problem
You're seeing this error: `column items.is_sold does not exist`

## The Solution (2 minutes)

### Step 1: Open Supabase
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Copy & Paste This SQL

```sql
-- Add is_sold column to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_items_is_sold ON items(is_sold);

-- Update existing sold items
UPDATE items 
SET is_sold = TRUE 
WHERE status = 'sold';

-- Create trigger to auto-sync
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

DROP TRIGGER IF EXISTS trigger_update_is_sold ON items;
CREATE TRIGGER trigger_update_is_sold
    BEFORE UPDATE OF status ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_is_sold_on_status_change();
```

### Step 3: Run It
Click the **"Run"** button (or press Ctrl+Enter)

### Step 4: Verify
Run this to check:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'items' AND column_name = 'is_sold';
```

You should see `is_sold` in the results!

### Step 5: Test
Refresh your app and try making an offer again. It should work! ✅

---

## Done!
The error should be fixed now. The "Make Offer" feature will work properly.
