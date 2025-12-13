# Reputation Scoring System

## Reputation Tiers

| Tier | Score Range | Badge Color | Visual Effect |
|------|-------------|-------------|---------------|
| **Common** | 0 - 24 | Gray | No glow |
| **Uncommon** | 25 - 50 | Green | No glow |
| **Rare** | 51 - 74 | Cyan | Light glow |
| **Legend** | 75 - 99 | Purple | Pulsing glow |
| **Mythic** | 100+ | Gold | Strong pulsing glow |

---

## Ways to Earn Reputation

### 1. Complete Transactions (Meetups)
**Reward: +5 points (both seller and buyer)**

- When a buyer marks a meetup as "Complete"
- Both the seller and buyer receive +5 reputation
- Encourages successful transactions
- Logged as "Transaction completed as seller/buyer"

**Example:**
- Sarah sells a textbook to Mike
- Mike marks meetup as complete
- Sarah gets +5 reputation
- Mike gets +5 reputation

---

### 2. Referral System

#### As Referrer (Inviting Friends)
**Reward: +15 points**

- Invite a friend to join the platform
- Share your unique referral link
- When they successfully register, you get +15 reputation
- No limit on number of referrals
- Logged as "Referral reward - invited new user"

#### As New User (Joining via Referral)
**Reward: +10 points**

- Register using a friend's referral link
- Start with 10 reputation points
- Better initial standing in community
- Logged as "Referral bonus - joined via referral"

**Example:**
- Sarah shares link: `http://localhost:5173/register?ref=SARJOH5678`
- Mike registers using that link
- Sarah gets +15 reputation
- Mike starts with 10 reputation

---

## Ways to Lose Reputation

### 1. Seller Cancels Meetup
**Penalty: -3 points**

- When seller cancels a scheduled meetup
- Applies regardless of reason
- Prevents seller abuse
- Logged as "Meetup cancelled by seller"

**Example:**
- Sarah schedules meetup with Mike
- Sarah cancels the meetup
- Sarah loses 3 reputation points

---

### 2. Buyer Cancels Meetup
**Penalty: -1 point**

- When buyer declines or cancels a meetup
- Smaller penalty than seller
- Logged as "Meetup cancelled by buyer"

**Example:**
- Mike receives meetup request from Sarah
- Mike declines the meetup
- Mike loses 1 reputation point

---

## Reputation Score Calculation Examples

### New User Journey

**Starting Point:**
- New user without referral: 0 points (Common)
- New user with referral: 10 points (Common)

**After 3 Successful Transactions:**
- 10 (referral) + 15 (3 × 5) = 25 points (Uncommon)

**After Inviting 2 Friends:**
- 25 + 30 (2 × 15) = 55 points (Rare)

**After 10 More Transactions:**
- 55 + 50 (10 × 5) = 105 points (Mythic!)

---

### Active Seller Journey

**Month 1:**
- Start: 0 points
- Invite 3 friends: +45 points (3 × 15)
- Complete 5 sales: +25 points (5 × 5)
- Cancel 1 meetup: -3 points
- **Total: 67 points (Rare)**

**Month 2:**
- Start: 67 points
- Complete 10 sales: +50 points (10 × 5)
- **Total: 117 points (Mythic!)**

---

### Buyer Journey

**Starting:**
- Register with referral: 10 points
- Complete 3 purchases: +15 points (3 × 5)
- Decline 2 meetups: -2 points (2 × 1)
- **Total: 23 points (Common)**

**After Growth:**
- Invite 1 friend: +15 points
- Complete 5 more purchases: +25 points (5 × 5)
- **Total: 63 points (Rare)**

---

## Reputation Milestones

### Common (0-24 points)
- New users
- Limited activity
- Building trust

### Uncommon (25-50 points)
- Regular users
- Some completed transactions
- Trusted by community

### Rare (51-74 points)
- Active users
- Multiple successful transactions
- Highly trusted

### Legend (75-99 points)
- Power users
- Many successful transactions
- Community leaders

### Mythic (100+ points)
- Elite users
- Extensive transaction history
- Most trusted members

---

## Best Practices to Build Reputation

### For Sellers:
1. ✅ Complete all scheduled meetups (+5 each)
2. ✅ Don't cancel meetups (avoid -3 penalty)
3. ✅ Invite friends to platform (+15 each)
4. ✅ Be reliable and professional
5. ✅ Communicate clearly with buyers

### For Buyers:
1. ✅ Complete purchases (+5 each)
2. ✅ Only accept meetups you can attend (avoid -1 penalty)
3. ✅ Invite friends to platform (+15 each)
4. ✅ Be respectful and punctual
5. ✅ Provide feedback when needed

---

## Reputation Protection

### Minimum Score:
- Reputation cannot go below 0
- Even with penalties, score stays at 0 minimum

### Recovery:
- Complete successful transactions to rebuild reputation
- Invite friends for quick reputation boost
- Consistent positive behavior over time

---

## Reputation Display

### Dashboard:
- Large reputation score display
- Tier badge (Common, Uncommon, Rare, Legend, Mythic)
- Visual effects based on tier
- Color-coded borders and glows

### Profile:
- Visible to other users
- Builds trust in marketplace
- Influences buyer/seller decisions

---

## Reputation History

All reputation changes are logged in `reputation_history` table:
- User ID
- Change amount (+/-)
- Reason for change
- Meetup ID (if applicable)
- Timestamp

Users can view their reputation history to track:
- How they earned points
- Any penalties received
- Progress over time

---

## Summary Table

| Action | Points | Notes |
|--------|--------|-------|
| Complete transaction (seller) | +5 | When buyer marks complete |
| Complete transaction (buyer) | +5 | When marking meetup complete |
| Invite friend (referrer) | +15 | When friend registers |
| Join via referral (new user) | +10 | One-time bonus |
| Cancel meetup (seller) | -3 | Penalty for cancellation |
| Cancel meetup (buyer) | -1 | Smaller penalty |

---

## Future Enhancements (Optional)

1. **Bonus Multipliers**: Extra points for consecutive transactions
2. **Streak Rewards**: Bonus for X transactions without cancellation
3. **Tier Benefits**: Special features unlock at higher tiers
4. **Reputation Decay**: Inactive users slowly lose points
5. **Review System**: Buyers/sellers can rate each other
6. **Achievement Badges**: Special badges for milestones
7. **Leaderboards**: Monthly/yearly top reputation users

---

**Build your reputation, earn trust, grow the community!** 🌟
