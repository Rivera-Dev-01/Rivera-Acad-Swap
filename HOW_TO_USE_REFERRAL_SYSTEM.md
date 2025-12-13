# How to Use the Referral System - User Guide

## For Existing Users (Inviting Friends)

### Step 1: Access Your Referral Code
1. Login to your account
2. Click on the hamburger menu (☰) in the top-left corner
3. Select **"Invite a Friend"** from the menu
4. You'll see your unique referral code (e.g., `AKIJOH1234`)

### Step 2: Share Your Referral Link
You have two options:

**Option A: Copy the Full Link**
1. On the Invite a Friend page, you'll see your referral link
2. Click the **"Copy"** button next to the link
3. Share this link with your friends via:
   - WhatsApp
   - Facebook Messenger
   - Email
   - SMS
   - Discord
   - Any messaging app

**Option B: Share Just the Code**
1. Tell your friend your referral code (e.g., `AKIJOH1234`)
2. They can manually enter it during registration

### Step 3: Earn Rewards
- When your friend successfully registers using your link or code:
  - **You get +50 reputation points** 🎉
  - **Your friend gets +10 reputation points** 🎁
- Track your referrals on the Invite a Friend page
- See your total referrals and reputation score
- View the list of friends you've invited

---

## For New Users (Joining via Referral)

### Method 1: Using a Referral Link (Easiest)

1. **Click the referral link** your friend sent you
   - Example: `http://localhost:5173/register?ref=AKIJOH1234`
   
2. **You'll be taken to the registration page**
   - You'll see a green banner: ✓ "Valid referral code! You'll get +10 reputation bonus"
   
3. **Fill out the registration form**
   - First Name & Last Name
   - Current Year & Block Section
   - Course
   - Phone Number
   - School Email
   - Password (must meet requirements)
   
4. **Click "Register"**
   - Success message will confirm you earned the +10 reputation bonus
   
5. **Login with your new account**
   - Your reputation score will start at 10 points!

### Method 2: Manual Code Entry (If link doesn't work)

1. **Go to the registration page**
   - Navigate to: `http://localhost:5173/register`
   
2. **Add the referral code to the URL**
   - Change URL to: `http://localhost:5173/register?ref=AKIJOH1234`
   - Replace `AKIJOH1234` with the code your friend gave you
   
3. **Follow steps 2-5 from Method 1**

---

## Benefits of Using Referral System

### For Referrers (Existing Users):
- **+50 reputation points** per successful referral
- Build your reputation score faster
- Climb the referral leaderboard
- Help grow the community
- No limit on number of referrals

### For New Users:
- **+10 reputation bonus** to start your account
- Higher initial reputation score
- Better standing in the community from day one
- Shows you were invited by a trusted member

---

## Referral Leaderboard

- View top referrers on the Invite a Friend page
- Rankings are displayed with:
  - 🥇 Gold badge for #1
  - 🥈 Silver badge for #2
  - 🥉 Bronze badge for #3
- See total referrals and reputation scores
- Compete with other users to be the top referrer!

---

## Frequently Asked Questions

**Q: How do I find my referral code?**
A: Login → Menu (☰) → Invite a Friend → Your code is displayed at the top

**Q: Can I change my referral code?**
A: No, referral codes are unique and permanent. They're generated based on your name.

**Q: What if my friend doesn't use my referral link?**
A: They won't get the +10 bonus, and you won't get the +50 reward. Make sure they use your link!

**Q: Can I refer someone who already has an account?**
A: No, referral codes only work for new registrations.

**Q: Is there a limit to how many people I can refer?**
A: No! Refer as many friends as you want and earn +50 reputation for each one.

**Q: What if the referral code shows as invalid?**
A: The code might be typed incorrectly. Ask your friend to send the full link instead.

**Q: When do I receive my referral rewards?**
A: Immediately after your friend completes registration successfully.

**Q: Can I see who I've referred?**
A: Yes! Go to Invite a Friend page and scroll to "Recent Referrals" section.

**Q: What can I do with reputation points?**
A: Higher reputation builds trust in the community and may unlock future features.

---

## Example Referral Flow

### Scenario: Sarah wants to invite her friend Mike

1. **Sarah logs in** and goes to Invite a Friend
2. **Sarah's referral code**: `SARJOH5678`
3. **Sarah's referral link**: `http://localhost:5173/register?ref=SARJOH5678`
4. **Sarah copies the link** and sends it to Mike on WhatsApp
5. **Mike clicks the link** and sees the registration page with green banner
6. **Mike fills out the form** and registers
7. **Mike gets +10 reputation** (starts with 10 points)
8. **Sarah gets +50 reputation** (her total increases by 50)
9. **Sarah sees Mike** in her "Recent Referrals" list
10. **Both are happy!** 🎉

---

## Tips for Successful Referrals

1. **Share the full link** - It's easier than typing a code
2. **Explain the benefits** - Tell friends they get +10 reputation
3. **Use multiple channels** - Share on WhatsApp, Facebook, email, etc.
4. **Be genuine** - Only invite people who would actually use the platform
5. **Follow up** - Check if your friend successfully registered
6. **Track your progress** - Visit Invite a Friend page to see your stats

---

## Technical Details

### Referral Code Format
- **Pattern**: First 3 letters of first name + First 3 letters of last name + 4 random digits
- **Example**: Akina Johnson → `AKIJOH1234`
- **Guaranteed unique**: System checks for duplicates

### URL Structure
- **Base URL**: `http://localhost:5173/register`
- **With referral**: `http://localhost:5173/register?ref=YOURCODE`
- **Parameter**: `?ref=` followed by the referral code

### Validation
- Code is validated in real-time when registration page loads
- Green banner = Valid code
- Red banner = Invalid code
- Gray banner = Checking...

---

## Need Help?

If you have issues with the referral system:
1. Make sure you're using the correct referral link format
2. Check that the code hasn't been mistyped
3. Try copying the link again from the Invite a Friend page
4. Contact support if problems persist

---

**Happy Referring! 🎉**

Build your reputation, grow the community, and help your friends get started with a bonus!
