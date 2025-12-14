# 🚀 Quick Start: Notifications & Friends

## ⚡ 3-Step Setup

### 1️⃣ Run SQL in Supabase
```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy/paste: backend/datas/create_notifications_friendships.sql
4. Click Run
```

### 2️⃣ Restart Backend
```bash
cd backend
python api.py
```

Look for:
```
✓ Notifications blueprint registered
✓ Friends blueprint registered
```

### 3️⃣ Test It!
- Make an offer → Check bell icon
- Send friend request → Check `/friend-requests`

---

## 📋 What You Get

### Notification Bell (Navbar)
- Shows unread count badge
- Dropdown with all notifications
- Click to navigate to relevant page
- "Mark all as read" button

### Friend Requests Page
- Located at `/friend-requests`
- Accept/Decline buttons
- Real-time updates

---

## 🔔 Notification Types

1. **Offer** → Someone made offer on your item
2. **Message** → New message received
3. **Meetup** → 30min before meetup starts
4. **Friend Request** → Someone sent/accepted request
5. **Board Post** → New post on request board

---

## 🔗 API Endpoints

### Notifications
```
GET  /api/notifications           - Get all
PUT  /api/notifications/mark-read - Mark all read
```

### Friends
```
POST /api/friends/request/send    - Send request
GET  /api/friends/requests        - Get pending
PUT  /api/friends/request/<id>/accept - Accept
PUT  /api/friends/request/<id>/reject - Reject
GET  /api/friends/list            - Get friends
```

---

## ✅ Quick Test

1. **Test Offer Notification:**
   - User A lists item
   - User B makes offer
   - User A sees notification in bell

2. **Test Friend Request:**
   - User A sends request to User B
   - User B sees notification
   - User B goes to `/friend-requests`
   - User B accepts
   - User A sees acceptance notification

---

## 🐛 Troubleshooting

**No notifications showing?**
- Check SQL ran successfully
- Restart backend
- Check browser console

**Friend request not working?**
- Verify `friendships` table exists
- Check backend logs
- Can't send duplicate requests

**Bell not updating?**
- Refreshes every 30 seconds
- Manually refresh page

---

## 📚 Full Documentation

- **Setup Guide**: `backend/datas/NOTIFICATIONS_FRIENDS_SETUP.md`
- **Backend Summary**: `docs/BACKEND_COMPLETE_SUMMARY.md`
- **Supabase Updates**: `backend/datas/SUPABASE_UPDATES_NEEDED.md`

---

## 🎉 Done!

Your notification and friend system is ready to use!

**Questions?** Check the full setup guide for detailed troubleshooting.
