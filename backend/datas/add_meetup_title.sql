-- Add title column to meetups table
ALTER TABLE meetups ADD COLUMN IF NOT EXISTS title TEXT;

-- Optional: Update existing meetups to have a title based on item title
UPDATE meetups 
SET title = (
    SELECT title 
    FROM items 
    WHERE items.id = meetups.item_id
)
WHERE title IS NULL;
