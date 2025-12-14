# Referral System Implementation

## Overview
Implemented a complete referral system where each user gets a unique referral code and URL. Users can invite friends and earn reputation rewards.

## Features Implemented

### 1. Database Schema (`backend/datas/create_referral_system.sql`)
- Added `referral_code`, `referred_by`, `total_referrals` columns to users table
- Created `referrals` tracking table
- Created `generate_referral_code()` function (generates codes like `AKIJOH1234`)
- Created `process_referral_reward()` function to handle rewards
- Auto-generates referral codes for existing users
- RLS policies for security

### 2. Backend Services

#### `backend/app/services/auth_service.py`
- Updated `register_user()` to accept optional `referral_code` parameter
- Validates referral code before registration
- Generates unique referral code for new user
- Processes referral rewards automatically (+50 for referrer, +10 for new user)

#### `backend/app/services/referral_service.py` (NEW)
- `get_user_referral_stats()` - Get user's referral code, total referrals, and referred users list
- `validate_referral_code()` - Check if a referral code is valid
- `get_referral_leaderboard()` - Get top referrers

### 3. Backend Routes

#### `backend/app/routes/auth.py`
- Updated `/register` endpoint to accept `referralCode` parameter

#### `backend/app/routes/referral.py` (NEW)
- `GET /api/referral/stats` - Get user's referral statistics
- `GET /api/referral/validate/<code>` - Validate referral code
- `GET /api/referral/leaderboard` - Get top referrers leaderboard

#### `backend/app/__init__.py`
- Registered referral blueprint

### 4. Frontend Pages

#### `Frontend/src/Pages/RegisterPage.tsx`
- Extracts `ref` query parameter from URL (e.g., `/register?ref=AKIJOH1234`)
- Validates referral code via API
- Shows referral bonus message if code is valid
- Sends referral code to backend during registration
- Shows success message with reputation bonus

#### `Frontend/src/Pages/InviteFriendPage.tsx` (NEW)
Complete referral dashboard with:
- **Referral Code Display**: Large, prominent display of user's unique code
- **Referral Link**: Full URL with copy-to-clipboard button
- **Reward Info**: Shows +50 reputation for referrer, +10 for new users
- **Your Stats**: Total referrals and reputation score
- **Recent Referrals**: List of users who joined via your link
- **Leaderboard**: Top 10 referrers with rankings (gold/silver/bronze styling)
- **How It Works**: 3-step guide explaining the referral process

## How It Works

### User Flow:
1. **User A** goes to Invite Friend page
2. Sees their unique referral code (e.g., `AKIJOH1234`)
3. Copies referral link: `http://localhost:5173/register?ref=AKIJOH1234`
4. Shares link with **User B**
5. **User B** clicks link and registers
6. System validates code and shows bonus message
7. Upon successful registration:
   - **User A** gets +50 reputation
   - **User B** gets +10 reputation
   - Referral is tracked in database

### Referral Code Generation:
- Format: `[First 3 chars of first name][First 3 chars of last name][4 random digits]`
- Example: Akina Johnson → `AKIJOH1234`
- Guaranteed unique (checks database, regenerates if duplicate)
- Fallback: `REF` + 6 random digits if name-based fails

## Rewards System:
- **Referrer**: +50 reputation per successful referral
- **New User**: +10 reputation bonus
- Tracked in `reputation_history` table
- Updates `total_referrals` counter

## Setup Instructions

### 1. Run SQL Migration
```sql
-- Run this in Supabase SQL Editor
-- File: backend/datas/create_referral_system.sql
```

### 2. Backend is Ready
All backend code is implemented and registered.

### 3. Frontend is Ready
- Route already exists: `/invite-friend`
- Navigation link already exists in sidebar
- RegisterPage updated to handle referral codes

## Testing

### Test Referral Flow:
1. Login as User A
2. Go to `/invite-friend`
3. Copy referral link
4. Logout
5. Open referral link in new tab/incognito
6. Register as User B
7. Should see "Valid referral code! You'll get +10 reputation bonus"
8. Complete registration
9. Login as User A again
10. Check Invite Friend page - should show 1 referral
11. Check reputation score - should have +50

### Test Invalid Code:
1. Go to `/register?ref=INVALID123`
2. Should see "Invalid referral code" message
3. Registration still works, but no bonus

## API Endpoints

### Public:
- `GET /api/referral/validate/<code>` - Validate referral code

### Protected (requires auth):
- `GET /api/referral/stats` - Get user's referral stats
- `GET /api/referral/leaderboard?limit=10` - Get top referrers

## Files Created/Modified

### Created:
- `backend/datas/create_referral_system.sql`
- `backend/app/services/referral_service.py`
- `backend/app/routes/referral.py`
- `Frontend/src/Pages/InviteFriendPage.tsx`
- `REFERRAL_SYSTEM_IMPLEMENTATION.md`

### Modified:
- `backend/app/services/auth_service.py`
- `backend/app/routes/auth.py`
- `backend/app/__init__.py`
- `Frontend/src/Pages/RegisterPage.tsx`

## Next Steps (Optional Enhancements)

1. **Email Notifications**: Send email when someone uses your referral code
2. **Social Sharing**: Add buttons to share on Facebook, Twitter, WhatsApp
3. **Referral Milestones**: Bonus rewards at 5, 10, 25 referrals
4. **Referral Analytics**: Track click-through rates, conversion rates
5. **Custom Referral Codes**: Allow users to customize their code
6. **Referral Expiry**: Set time limits on referral codes
7. **Referral Tiers**: Different rewards based on referrer's reputation

## Status
✅ **COMPLETE** - All features implemented and ready to test
