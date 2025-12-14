# Supabase Database Updates Required

## Current Issue
Error: `column items.is_sold does not exist`

## Required SQL Updates

Run these SQL scripts in your **Supabase SQL Editor** in the following order:

### 1. Add is_sold Column (REQUIRED - Fixes Current Error)
**File:** `add_is_sold_column.sql`

This adds the missing `is_sold` column to the items table.

```sql
-- Run this first to fix the current error
```

**What it does:**
- ✅ Adds `is_sold` boolean column to items table
- ✅ Creates index for performance
- ✅ Updates existing sold items
- ✅ Creates trigger to auto-sync with status

---

### 2. Create Offers & Messages Tables (If Not Already Done)
**File:** `create_offers_messages.sql`

Required for the offers and messages system to work.

**What it does:**
- ✅ Creates `offers` table for item offers
- ✅ Creates `messages` table for direct messaging
- ✅ Creates indexes for performance

---

### 3. Create Meetups Table (If Not Already Done)
**File:** `create_meetups_table.sql`

Required for the meetup scheduler feature.

---

### 4. Add Profile Fields (If Not Already Done)
**File:** `add_profile_fields.sql`

Required for profile completion and user profiles.

**What it does:**
- ✅ Adds profile fields to users table
- ✅ Adds verification status
- ✅ Adds profile completion tracking

---

### 5. Create Referral System (If Not Already Done)
**File:** `create_referral_system.sql`

Required for the invite friend feature.

---

### 6. Create Notifications & Friendships Tables (REQUIRED FOR NEW FEATURES)
**File:** `create_notifications_friendships.sql`

Required for notification bell and friend request system.

**What it does:**
- ✅ Creates `notifications` table for all notification types
- ✅ Creates `friendships` table for friend requests and connections
- ✅ Creates indexes for performance
- ✅ Creates triggers for auto-updating timestamps
- ✅ Prevents duplicate friendships and self-friendship

---

## Quick Setup Guide

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run Required Scripts

#### Priority 1 (Fix Current Error):
```sql
-- Copy and paste content from: add_is_sold_column.sql
```

#### Priority 2 (REQUIRED FOR NOTIFICATIONS & FRIENDS):
```sql
-- Copy and paste content from: create_notifications_friendships.sql
```

#### Priority 3 (If tables don't exist):
Check if these tables exist in your database:
- `offers`
- `messages`
- `meetups`
- `referrals`

If any are missing, run the corresponding SQL file.

### Step 3: Verify Installation

Run this query to check if everything is set up:

```sql
-- Check if is_sold column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'items' AND column_name = 'is_sold';

-- Check if offers table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'offers'
);

-- Check if messages table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'messages'
);

-- Check if meetups table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'meetups'
);

-- Check if referrals table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'referrals'
);

-- Check if notifications table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'notifications'
);

-- Check if friendships table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'friendships'
);
```

Expected results:
- `is_sold` column should show: `boolean`
- All table checks should return: `true`

---

## Complete Database Schema

After running all updates, you should have these tables:

### Core Tables
1. ✅ `users` - User accounts
2. ✅ `items` - Marketplace items (with `is_sold` column)
3. ✅ `transactions` - Completed sales
4. ✅ `ratings` - User ratings
5. ✅ `notifications` - User notifications (NEW - REQUIRED)
6. ✅ `friendships` - Friend connections (NEW - REQUIRED)

### Feature Tables
7. ✅ `offers` - Item offers
8. ✅ `messages` - Direct messaging
9. ✅ `meetups` - Meetup scheduler
10. ✅ `referrals` - Referral system
11. ✅ `board_posts` - Request board (if exists)

---

## Troubleshooting

### Error: "relation already exists"
This means the table/column already exists. Skip that SQL file.

### Error: "column already exists"
This means the column already exists. Skip that part.

### Error: "function does not exist"
Make sure you ran the base marketplace tables SQL first.

### Error: "permission denied"
Make sure you're using the SQL Editor in Supabase (not a client connection).

---

## After Running Updates

1. **Restart your backend server** (if running)
2. **Clear browser cache** and refresh the frontend
3. **Test the "Make Offer" feature** - it should work now!

---

## Files to Run (In Order)

1. ✅ **add_is_sold_column.sql** (REQUIRED - fixes current error)
2. ✅ **create_notifications_friendships.sql** (REQUIRED - for notifications & friends)
3. ⚠️ **create_offers_messages.sql** (if offers/messages don't work)
4. ⚠️ **create_meetups_table.sql** (if meetup scheduler doesn't work)
5. ⚠️ **add_profile_fields.sql** (if profile completion doesn't work)
6. ⚠️ **create_referral_system.sql** (if invite friend doesn't work)

---

## Quick Test

After running `add_is_sold_column.sql`, test by running:

```sql
-- Test query
SELECT id, title, status, is_sold 
FROM items 
LIMIT 5;
```

You should see the `is_sold` column with boolean values!

---

## Need Help?

If you encounter any errors:
1. Copy the exact error message
2. Check which SQL file caused it
3. Verify the table/column doesn't already exist
4. Make sure you're running in the correct order

---

**Last Updated:** December 15, 2025
