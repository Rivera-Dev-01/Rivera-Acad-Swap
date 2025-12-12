# Fix Old Test Users Guide

## Problem
Old test users created before the `users` table was properly set up exist in Supabase Auth but don't have corresponding entries in the `users` table. This causes login to fail with the message "user data is missing".

## Why This Happens
- Users exist in `auth.users` (Supabase authentication)
- But they don't exist in `public.users` (your custom user data table)
- The login process requires both to work

## Solution Options

### Option 1: Delete Old Test Users (Easiest)

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Find the old test users
4. Click the three dots (⋮) next to each user
5. Select **Delete user**
6. Have them register again with the registration form

**Pros**: Clean slate, ensures all data is correct
**Cons**: Users need to re-register

---

### Option 2: Manually Add Missing User Data

1. Go to Supabase Dashboard → **SQL Editor**

2. Run this query to see which users are missing data:
```sql
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE 
        WHEN u.id IS NULL THEN 'MISSING DATA'
        ELSE 'HAS DATA'
    END as status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC;
```

3. For each user showing 'MISSING DATA', insert their data:
```sql
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    current_year,
    block_section,
    course,
    phone_number
) VALUES (
    'COPY_USER_ID_FROM_QUERY_ABOVE',
    'user@university.edu',
    'John',
    'Doe',
    '3rd Year',
    'Block A',
    'Computer Science',
    '09123456789'
);
```

**Pros**: Keeps existing accounts
**Cons**: Need to manually enter all user information

---

### Option 3: Bulk Delete All Test Users (Nuclear Option)

If you have many test users and want to start completely fresh:

1. Go to Supabase Dashboard → **SQL Editor**

2. Run this query to delete all test users:
```sql
-- WARNING: This deletes users permanently!
DELETE FROM auth.users 
WHERE email LIKE '%test%'  -- Adjust this pattern to match your test emails
   OR email LIKE '%@university.edu';  -- Or use specific domain
```

**Pros**: Quick cleanup of all test data
**Cons**: Deletes ALL matching users (be careful!)

---

## Recommended Approach

For development/testing: **Use Option 1** (delete and re-register)
- It's the cleanest and ensures data integrity
- Only takes a minute to re-register
- Guarantees all fields are properly filled

For production users: **Use Option 2** (manually add data)
- Preserves user accounts
- Requires knowing their information

---

## Verification

After fixing, test the login:

1. Clear browser localStorage:
   - Open browser console (F12)
   - Type: `localStorage.clear()`
   - Press Enter

2. Try logging in with the fixed account

3. Check browser console for:
   ```
   ✓ User data saved to localStorage
   ✓ Navigating to dashboard...
   ✓ Parsed user successfully
   ```

4. Dashboard should load with user information

---

## Prevention

Going forward, all new registrations will automatically:
1. Create auth user in `auth.users`
2. Create user data in `public.users`
3. Both happen in the same registration flow

So this issue won't happen with new users!
