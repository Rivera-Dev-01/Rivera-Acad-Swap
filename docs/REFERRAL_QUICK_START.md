# Referral System - Quick Start Guide

## 🎯 What is it?
A system where users can invite friends and both earn reputation points!

---

## 👤 For Existing Users (Want to Invite Friends)

### Step 1: Get Your Referral Link
```
1. Login to your account
2. Click hamburger menu (☰) in top-left
3. Click "Invite a Friend"
4. See your unique code (e.g., AKIJOH1234)
```

### Step 2: Share Your Link
```
Copy this link and send to friends:
http://localhost:5173/register?ref=YOURCODE

Share via:
✓ WhatsApp
✓ Facebook
✓ Email
✓ SMS
✓ Any messaging app
```

### Step 3: Earn Rewards
```
When friend registers:
✓ You get +50 reputation
✓ Friend gets +10 reputation
✓ See them in your "Recent Referrals" list
```

---

## 🆕 For New Users (Joining via Referral)

### Method 1: Click Friend's Link (Easiest!)
```
1. Friend sends you: http://localhost:5173/register?ref=AKIJOH1234
2. Click the link
3. See green banner: "Valid referral code! You'll get +10 reputation bonus"
4. Fill registration form
5. Click Register
6. Login and start with 10 reputation points! 🎉
```

### Method 2: Manual Entry
```
1. Go to: http://localhost:5173/register
2. Add ?ref=YOURCODE to URL
3. Example: http://localhost:5173/register?ref=AKIJOH1234
4. Continue with registration
```

---

## 💡 Quick Example

**Sarah invites Mike:**

1. Sarah's code: `SARJOH5678`
2. Sarah's link: `http://localhost:5173/register?ref=SARJOH5678`
3. Sarah sends link to Mike on WhatsApp
4. Mike clicks → Registers → Gets +10 reputation
5. Sarah gets +50 reputation
6. Done! 🎉

---

## 🏆 Rewards Summary

| Action | Reward |
|--------|--------|
| Invite a friend (referrer) | +50 reputation |
| Join via referral (new user) | +10 reputation |
| Limit per user | Unlimited referrals! |

---

## 📍 Where to Find It

**In the App:**
- Hamburger Menu (☰) → "Invite a Friend"
- Shows your code, link, stats, and leaderboard

**Features:**
- ✓ Copy link button
- ✓ View total referrals
- ✓ See recent referrals list
- ✓ Check leaderboard rankings
- ✓ Track reputation earned

---

## ❓ Common Questions

**Q: Where's my referral code?**
A: Menu → Invite a Friend → Top of page

**Q: How do I share it?**
A: Click "Copy" button and paste in any messaging app

**Q: When do I get rewards?**
A: Instantly when friend completes registration

**Q: Can I refer multiple people?**
A: Yes! No limit. Earn +50 for each successful referral.

**Q: What if code shows invalid?**
A: Make sure it's typed correctly or use the full link instead

---

## 🚀 Pro Tips

1. **Share the full link** - Easier than typing code
2. **Tell friends about the +10 bonus** - More motivation to join
3. **Use multiple channels** - WhatsApp, Facebook, email, etc.
4. **Track your progress** - Check Invite a Friend page regularly
5. **Compete on leaderboard** - See who's the top referrer!

---

## 🔧 Technical Setup (For Developers)

**Before using, run this SQL in Supabase:**
```sql
-- File: backend/datas/create_referral_system.sql
-- This creates tables and generates codes for existing users
```

**Then restart backend:**
```bash
cd backend
python api.py
```

---

## ✅ Success Checklist

- [ ] SQL migration run in Supabase
- [ ] Backend server restarted
- [ ] Can see "Invite a Friend" in menu
- [ ] Can view referral code on page
- [ ] Copy button works
- [ ] New user can register with `?ref=CODE`
- [ ] Rewards are given correctly
- [ ] Leaderboard shows rankings

---

**That's it! Start inviting friends and earning reputation! 🎉**
