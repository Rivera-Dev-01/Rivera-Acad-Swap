-- Fix Old Test Users
-- This script adds missing user data for accounts that exist in auth.users but not in public.users

-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. First, run this query to see which users are missing data:

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

-- 3. For each user that shows 'MISSING DATA', you need to insert their data manually
-- 4. Replace the values below with the actual user information:

-- Example insert (CUSTOMIZE THIS FOR EACH USER):
/*
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
    'USER_ID_FROM_AUTH_USERS',  -- Get this from the query above
    'user@university.edu',       -- Their email
    'John',                      -- First name
    'Doe',                       -- Last name
    '3rd Year',                  -- Current year
    'Block A',                   -- Block section
    'Computer Science',          -- Course
    '09123456789'               -- Phone number
);
*/

-- OR: If you want to delete old test users and start fresh:
-- WARNING: This will permanently delete the users!
/*
DELETE FROM auth.users 
WHERE email IN (
    'test1@university.edu',
    'test2@university.edu'
    -- Add more emails as needed
);
*/
