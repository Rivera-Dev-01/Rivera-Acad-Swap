# Notifications & Friend Request System - Setup Guide

## 🎯 What's New

Your app now has:
- ✅ **Notification Bell** in navbar with unread count badge
- ✅ **5 Notification Types**: Offers, Messages, Meetups, Friend Requests, Board Posts
- ✅ **Friend Request System** with dedicated page
- ✅ **Real-time Updates** for notifications
- ✅ **Complete Backend API** ready to use

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run SQL Migration in Supabase

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the content from: `backend/datas/create_notifications_friendships.sql`
5. Click **Run** (or press F5)

You should see:
```
Success. No rows returned
```

### Step 2: Restart Backend Server

Stop your current backend (Ctrl+C) and restart:

```bash
cd backend
python api.py
```

You should see:
```
✓ Notifications blueprint registered
✓ Friends blueprint registered
```

### Step 3: Test the Features

1. **Test Notifications**:
   - Make an offer on someone's item
   - Check the bell icon in navbar (should show unread count)
   - Click bell to see notification dropdown
   - Click notification to navigate to offers page

2. **Test Friend Requests**:
   - Go to another user's profile
   - Click "Add Friend" button
   - Go to `/friend-requests` page
   - Accept or reject the request

---

## 📊 Database Tables Created

### 1. notifications
Stores all user notifications

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User receiving notification |
| type | VARCHAR(50) | Type: offer, message, meetup, friend_request, board_post |
| message | TEXT | Notification message |
| related_id | UUID | ID of related entity (offer, message, etc.) |
| is_read | BOOLEAN | Read status |
| read_at | TIMESTAMP | When marked as read |
| created_at | TIMESTAMP | When created |

### 2. friendships
Stores friend connections and requests

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who sent request |
| friend_id | UUID | User who received request |
| status | VARCHAR(20) | Status: pending, active, blocked |
| created_at | TIMESTAMP | When created |
| updated_at | TIMESTAMP | When updated |

---

## 🔌 API Endpoints

### Notifications API

```
GET    /api/notifications              - Get all notifications
PUT    /api/notifications/mark-read    - Mark all as read
PUT    /api/notifications/<id>/read    - Mark one as read
```

**Example Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "type": "offer",
      "title": "New offer",
      "message": "New offer from John Doe on iPhone 13",
      "time": "5m ago",
      "read": false,
      "link": "/offers"
    }
  ]
}
```

### Friends API

```
POST   /api/friends/request/send       - Send friend request
GET    /api/friends/requests           - Get pending requests
PUT    /api/friends/request/<id>/accept - Accept request
PUT    /api/friends/request/<id>/reject - Reject request
GET    /api/friends/list               - Get friends
DELETE /api/friends/remove/<id>        - Remove friend
GET    /api/friends/status/<user_id>   - Get friendship status
```

**Example: Send Friend Request**
```javascript
const response = await fetch('http://localhost:5000/api/friends/request/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    receiver_id: 'user-uuid-here'
  })
});
```

---

## 🎨 Frontend Components

### 1. NavigationMenu (Updated)
- Shows notification bell with unread count badge
- Dropdown displays all notifications
- Click notification to navigate to relevant page
- "Mark all as read" button

### 2. FriendRequestsPage (New)
- Located at `/friend-requests`
- Shows all pending friend requests
- Accept/Decline buttons
- Real-time updates

### 3. Routes (Updated)
- `/friend-requests` - Friend requests page
- All notification links work (offers, messages, meetup, etc.)

---

## 🔄 How Notifications Work

### Automatic Notification Creation

Notifications are automatically created when:

1. **Someone makes an offer on your item**
   - Type: `offer`
   - Message: "New offer from [buyer] on [item]"
   - Link: `/offers`

2. **Someone sends you a message**
   - Type: `message`
   - Message: "New message from [sender]"
   - Link: `/messages`

3. **Meetup starts in 30 minutes**
   - Type: `meetup`
   - Message: "Meetup '[title]' starts in 30 minutes"
   - Link: `/meetup-scheduler`

4. **Someone sends you a friend request**
   - Type: `friend_request`
   - Message: "[sender] sent you a friend request"
   - Link: `/friend-requests`

5. **Someone accepts your friend request**
   - Type: `friend_request`
   - Message: "[accepter] accepted your friend request"
   - Link: `/friend-requests`

6. **New post on request board**
   - Type: `board_post`
   - Message: "New post: [title]"
   - Link: `/request-board`

---

## 🧪 Testing Guide

### Test Scenario 1: Offer Notification

1. User A lists an item
2. User B makes an offer on that item
3. User A should receive notification:
   - Bell icon shows unread count (1)
   - Dropdown shows "New offer from User B on [item]"
   - Clicking notification goes to `/offers`

### Test Scenario 2: Friend Request

1. User A goes to User B's profile
2. User A clicks "Add Friend"
3. User B should receive notification:
   - Bell icon shows unread count
   - Dropdown shows "User A sent you a friend request"
   - Clicking notification goes to `/friend-requests`
4. User B accepts request
5. User A receives notification:
   - "User B accepted your friend request"

### Test Scenario 3: Message Notification

1. User A sends message to User B
2. User B should receive notification:
   - Bell icon shows unread count
   - Dropdown shows "New message from User A"
   - Clicking notification goes to `/messages`

---

## 🐛 Troubleshooting

### Notifications not showing?

1. **Check database tables exist:**
   ```sql
   SELECT * FROM notifications LIMIT 1;
   SELECT * FROM friendships LIMIT 1;
   ```

2. **Check backend is running:**
   - Should see "✓ Notifications blueprint registered"
   - Should see "✓ Friends blueprint registered"

3. **Check browser console:**
   - Look for API errors
   - Check network tab for failed requests

### Friend request not working?

1. **Check if tables exist:**
   ```sql
   SELECT * FROM friendships WHERE status = 'pending';
   ```

2. **Check API endpoint:**
   ```bash
   curl http://localhost:5000/api/friends/requests \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check for duplicate requests:**
   - Can't send request if already friends
   - Can't send request if pending request exists

### Bell icon not updating?

1. **Check notification polling:**
   - NavigationMenu fetches every 30 seconds
   - Manually refresh to see new notifications

2. **Check unread count:**
   ```sql
   SELECT COUNT(*) FROM notifications 
   WHERE user_id = 'YOUR_USER_ID' AND is_read = false;
   ```

---

## 📝 Code Examples

### Create Custom Notification (Backend)

```python
from app.services.notification_service import NotificationService

# Create custom notification
NotificationService.create_notification(
    user_id='user-uuid',
    notif_type='custom',
    message='Your custom message here',
    related_id='related-entity-uuid'
)
```

### Fetch Notifications (Frontend)

```javascript
const fetchNotifications = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/notifications', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.notifications;
};
```

### Send Friend Request (Frontend)

```javascript
const sendFriendRequest = async (receiverId) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/friends/request/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ receiver_id: receiverId })
  });
  return await response.json();
};
```

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] SQL migration ran successfully
- [ ] Backend shows both blueprints registered
- [ ] Notification bell appears in navbar
- [ ] Making an offer creates notification
- [ ] Sending message creates notification
- [ ] Friend request page loads at `/friend-requests`
- [ ] Can send friend request from user profile
- [ ] Can accept/reject friend requests
- [ ] Notification count updates correctly
- [ ] Clicking notification navigates to correct page
- [ ] "Mark all as read" works

---

## 🎉 You're All Set!

Your notification and friend request system is now fully functional!

**Next Steps:**
1. Test all notification types
2. Customize notification messages if needed
3. Add more notification types as your app grows
4. Consider adding push notifications later

**Need Help?**
- Check the troubleshooting section above
- Review the API endpoints
- Check browser console for errors
- Verify database tables exist

---

**Last Updated:** December 15, 2025
