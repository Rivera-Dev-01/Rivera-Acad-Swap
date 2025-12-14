# Notifications & Friend Request System

## Overview
Implemented notification bell with dropdown and friend request system.

## Frontend Changes

### 1. NavigationMenu Component
- ✅ Added notification bell with unread count badge
- ✅ Added notification dropdown with real-time updates
- ✅ Linked "List New Item" button to `/list-item` page
- ✅ Added "Friend Requests" menu item
- ✅ Updated referral points to +15 pts

### 2. FriendRequestsPage (NEW)
- ✅ Created dedicated page for managing friend requests
- ✅ Accept/Decline functionality
- ✅ Shows sender profile information
- ✅ Empty state when no requests

### 3. App.tsx
- ✅ Added route: `/friend-requests`

## Notification Types

The system supports 5 types of notifications:

1. **Recent Offers** (`offer`)
   - When someone makes an offer on your item
   - Links to: `/offers`

2. **Recent Chats** (`message`)
   - When you receive a new message
   - Links to: `/messages`

3. **Meetup Reminders** (`meetup`)
   - 30 minutes before a scheduled meetup
   - Links to: `/meetup-scheduler`

4. **Friend Requests** (`friend_request`)
   - When someone sends you a friend request
   - Links to: `/friend-requests`

5. **Request Board Posts** (`board_post`)
   - When someone posts to the request board
   - Links to: `/request-board`

## Backend Requirements

### 1. Notifications Table (Already Exists)
The `notifications` table from `create_marketplace_tables.sql` supports all notification types.

### 2. Friend Requests Endpoints Needed

Create `backend/app/routes/friends.py`:

```python
@friends_bp.route('/request/send', methods=['POST'])
def send_friend_request():
    # Send friend request
    # Create notification for receiver
    pass

@friends_bp.route('/requests', methods=['GET'])
def get_friend_requests():
    # Get pending friend requests for current user
    pass

@friends_bp.route('/request/<request_id>/accept', methods=['PUT'])
def accept_friend_request(request_id):
    # Accept friend request
    # Update friendship status to 'active'
    # Create notification for sender
    pass

@friends_bp.route('/request/<request_id>/reject', methods=['PUT'])
def reject_friend_request(request_id):
    # Reject friend request
    # Delete or mark as rejected
    pass

@friends_bp.route('/list', methods=['GET'])
def get_friends():
    # Get list of friends
    pass

@friends_bp.route('/remove/<friend_id>', methods=['DELETE'])
def remove_friend(friend_id):
    # Remove friend
    pass
```

### 3. Notifications Endpoints Needed

Create `backend/app/routes/notifications.py`:

```python
@notifications_bp.route('/', methods=['GET'])
def get_notifications():
    # Get all notifications for current user
    # Order by created_at DESC
    # Include unread count
    pass

@notifications_bp.route('/mark-read', methods=['PUT'])
def mark_all_read():
    # Mark all notifications as read
    pass

@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    # Mark specific notification as read
    pass
```

### 4. Notification Creation Helper

Create `backend/app/services/notification_service.py`:

```python
class NotificationService:
    @staticmethod
    def create_notification(user_id, type, message, related_id=None):
        # Create notification in database
        pass
    
    @staticmethod
    def create_offer_notification(seller_id, buyer_name, item_title, offer_id):
        # "New offer from {buyer_name} on {item_title}"
        pass
    
    @staticmethod
    def create_message_notification(receiver_id, sender_name, message_id):
        # "New message from {sender_name}"
        pass
    
    @staticmethod
    def create_meetup_notification(user_id, meetup_title, meetup_id):
        # "Meetup '{meetup_title}' starts in 30 minutes"
        pass
    
    @staticmethod
    def create_friend_request_notification(receiver_id, sender_name, request_id):
        # "{sender_name} sent you a friend request"
        pass
    
    @staticmethod
    def create_board_post_notification(user_id, post_title, post_id):
        # "New post: {post_title}"
        pass
```

## Integration Points

### When to Create Notifications:

1. **Offer Created** → Notify seller
   - In `OfferService.create_offer()`
   - After successful offer creation

2. **Message Sent** → Notify receiver
   - In `OfferService.send_message()`
   - After successful message send

3. **Meetup Scheduled** → Notify both parties
   - In `MeetupService.create_meetup()`
   - Schedule reminder 30 min before

4. **Friend Request Sent** → Notify receiver
   - In `FriendService.send_request()`
   - After successful request creation

5. **Board Post Created** → Notify relevant users
   - In `BoardService.create_post()`
   - Notify users interested in that category

## Frontend Integration

### Add Friend Button (UserProfileView)

Add to `Frontend/src/components/UserProfileView.tsx`:

```tsx
const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>('none');

const handleAddFriend = async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/friends/request/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiver_id: userId })
    });
    
    const data = await response.json();
    if (data.success) {
        setFriendStatus('pending');
        setToast({ message: 'Friend request sent!', type: 'success' });
    }
};

// In render:
{friendStatus === 'none' && (
    <button onClick={handleAddFriend}>
        <UserPlus /> Add Friend
    </button>
)}
{friendStatus === 'pending' && (
    <button disabled>
        <Clock /> Request Pending
    </button>
)}
{friendStatus === 'friends' && (
    <button>
        <Check /> Friends
    </button>
)}
```

## Database Schema

### Friendships Table (Already Exists)
```sql
CREATE TABLE friendships (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    friend_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'blocked'
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Notifications Table (Already Exists)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type VARCHAR(50), -- 'offer', 'message', 'meetup', 'friend_request', 'board_post'
    message TEXT,
    related_id UUID, -- ID of related entity
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP
);
```

## Testing Checklist

### Frontend:
- [ ] Notification bell shows unread count
- [ ] Clicking bell opens dropdown
- [ ] Notifications display correctly
- [ ] Clicking notification navigates to correct page
- [ ] "Mark all as read" works
- [ ] Friend Requests page loads
- [ ] Accept/Decline buttons work
- [ ] "List New Item" button navigates correctly

### Backend (To Implement):
- [ ] Send friend request endpoint
- [ ] Get friend requests endpoint
- [ ] Accept/Reject friend request endpoints
- [ ] Get notifications endpoint
- [ ] Mark notifications as read endpoint
- [ ] Notifications created on offer
- [ ] Notifications created on message
- [ ] Notifications created on friend request

## Next Steps

1. **Create Backend Routes**:
   - `backend/app/routes/friends.py`
   - `backend/app/routes/notifications.py`

2. **Create Services**:
   - `backend/app/services/friend_service.py`
   - `backend/app/services/notification_service.py`

3. **Integrate Notifications**:
   - Update `OfferService` to create notifications
   - Update `MeetupService` to create notifications
   - Add notification creation to all relevant services

4. **Add Friend Button**:
   - Update `UserProfileView.tsx`
   - Update `FindUsersPage.tsx`

5. **Test Everything**:
   - Test all notification types
   - Test friend request flow
   - Test notification navigation

## Summary

✅ **Completed**:
- Notification bell UI with dropdown
- Friend Requests page
- Navigation menu updates
- Routes and basic structure

⏳ **Pending** (Backend):
- Friend request API endpoints
- Notifications API endpoints
- Notification creation integration
- Add friend button functionality

The frontend is ready! Just need to implement the backend endpoints.
