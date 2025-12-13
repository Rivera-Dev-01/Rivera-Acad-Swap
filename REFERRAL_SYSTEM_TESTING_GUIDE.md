# Referral System Testing Guide

## Prerequisites
1. Run the SQL migration in Supabase:
   - Open Supabase SQL Editor
   - Copy and paste contents of `backend/datas/create_referral_system.sql`
   - Execute the SQL
   - This will create the referral tables and generate codes for existing users

2. Restart backend server to load new routes:
   ```bash
   cd backend
   python api.py
   ```

## Test Scenario 1: Complete Referral Flow

### Step 1: Get Your Referral Link
1. Login to your account (User A)
2. Navigate to "Invite a Friend" from the sidebar
3. You should see:
   - Your unique referral code (e.g., `AKIJOH1234`)
   - Your referral link (e.g., `http://localhost:5173/register?ref=AKIJOH1234`)
   - Copy button to copy the link
   - Your current stats (0 referrals initially)

### Step 2: Share Referral Link
1. Copy your referral link
2. Logout from User A
3. Open the referral link in:
   - New incognito/private window, OR
   - Different browser, OR
   - Just paste it in the address bar after logout

### Step 3: Register with Referral Code
1. The registration page should load with `?ref=AKIJOH1234` in URL
2. You should see a green banner at the top:
   - ✓ "Valid referral code! You'll get +10 reputation bonus"
3. Fill in the registration form as User B
4. Submit registration
5. Success message should say: "Registration successful! You earned +10 reputation from the referral. You can now login."

### Step 4: Verify Rewards
1. Login as User B
2. Go to Dashboard
3. Check reputation score - should show 10 (from referral bonus)

4. Logout and login as User A
5. Go to "Invite a Friend" page
6. You should now see:
   - Total Referrals: 1
   - Reputation increased by +50
   - User B listed in "Recent Referrals" section

## Test Scenario 2: Invalid Referral Code

1. Go to: `http://localhost:5173/register?ref=INVALID123`
2. Should see red banner: "Invalid referral code"
3. Registration still works normally
4. No bonus reputation given

## Test Scenario 3: Leaderboard

1. Create multiple referrals (repeat Test Scenario 1 with different users)
2. Go to "Invite a Friend" page
3. Check "Top Referrers" section
4. Should show:
   - Rank 1 (gold) - Most referrals
   - Rank 2 (silver) - Second most
   - Rank 3 (bronze) - Third most
   - Others in gray

## Test Scenario 4: Copy to Clipboard

1. Go to "Invite a Friend" page
2. Click "Copy" button next to referral link
3. Button should change to "Copied!" with checkmark
4. Paste in notepad - should have full URL
5. After 2 seconds, button returns to "Copy"

## Expected Results

### Database Changes:
- `users` table:
  - User A: `total_referrals` = 1, `reputation_score` increased by 50
  - User B: `referred_by` = User A's ID, `reputation_score` = 10

- `referrals` table:
  - New row: `referrer_id` = User A, `referred_id` = User B, `reward_given` = true

- `reputation_history` table:
  - Row 1: User A, +50, "Referral reward - invited new user"
  - Row 2: User B, +10, "Referral bonus - joined via referral"

### API Endpoints to Test:

#### 1. Validate Referral Code (Public)
```bash
curl http://localhost:5000/api/referral/validate/AKIJOH1234
```
Expected: `{"success": true, "valid": true, "message": "Valid referral code"}`

#### 2. Get Referral Stats (Protected)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/referral/stats
```
Expected:
```json
{
  "success": true,
  "referral_code": "AKIJOH1234",
  "total_referrals": 1,
  "reputation_score": 50,
  "referred_users": [
    {
      "name": "John Doe",
      "joined_at": "2024-12-14T..."
    }
  ]
}
```

#### 3. Get Leaderboard (Protected)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/referral/leaderboard?limit=10
```
Expected:
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "name": "Akina Johnson",
      "total_referrals": 5,
      "reputation_score": 250
    }
  ]
}
```

## Troubleshooting

### Issue: "Invalid referral code" even with valid code
- Check if SQL migration ran successfully
- Verify `referral_code` column exists in users table
- Check if user has a referral code: `SELECT referral_code FROM users WHERE id = 'USER_ID'`

### Issue: No rewards given
- Check backend logs for errors
- Verify `process_referral_reward()` function exists in Supabase
- Check `reputation_history` table for entries

### Issue: Referral link not working
- Verify frontend is running on correct port (5173)
- Check browser console for errors
- Verify `useSearchParams` is working (React Router v6)

### Issue: "User not found" error
- Make sure you're logged in
- Check if token is valid in localStorage
- Verify auth middleware is working

## Success Criteria

✅ User can see their unique referral code
✅ User can copy referral link
✅ New user can register with referral code
✅ Referral code validation works
✅ Rewards are given correctly (+50 referrer, +10 new user)
✅ Referral count updates
✅ Recent referrals list shows new users
✅ Leaderboard displays top referrers
✅ Invalid codes are rejected but don't block registration

## Notes

- Each user gets a unique code based on their name
- Codes are generated automatically on first registration
- Existing users already have codes (from SQL migration)
- Referral rewards are instant (no approval needed)
- No limit on number of referrals per user
- Referral codes never expire (in current implementation)
