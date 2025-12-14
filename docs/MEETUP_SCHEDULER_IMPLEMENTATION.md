# Meetup Scheduler Implementation Guide

## ✅ Backend Completed

### 1. Database Setup
**File:** `backend/datas/create_meetups_table.sql`

Run this SQL in your Supabase SQL Editor to create:
- `meetups` table with all necessary fields
- `reputation_history` table for tracking reputation changes
- RLS policies for security
- Indexes for performance
- Triggers for auto-updating timestamps
- Helper functions for cancellation counting

### 2. Backend Service
**File:** `backend/app/services/meetup_service.py`

Implemented methods:
- `create_meetup()` - Seller creates meetup
- `get_user_meetups()` - Get all meetups for a user (includes user & item data)
- `accept_meetup()` - Buyer accepts meetup
- `decline_meetup()` - Buyer declines meetup
- `complete_meetup()` - Buyer marks meetup as complete
- `cancel_meetup()` - Either party cancels meetup
- `reschedule_meetup()` - Seller reschedules meetup
- `search_users()` - Search for buyers by name/email
- `_apply_cancellation_penalty()` - Apply reputation penalties
- `_apply_completion_reward()` - Apply reputation rewards

### 3. Backend Routes
**File:** `backend/app/routes/meetup.py`

API Endpoints:
```
POST   /api/meetup/create              - Create new meetup
GET    /api/meetup/my-meetups          - Get user's meetups
PUT    /api/meetup/<id>/accept         - Accept meetup (buyer)
PUT    /api/meetup/<id>/decline        - Decline meetup (buyer)
PUT    /api/meetup/<id>/complete       - Complete meetup (buyer)
DELETE /api/meetup/<id>/cancel         - Cancel meetup (seller/buyer)
PUT    /api/meetup/<id>/reschedule     - Reschedule meetup (seller)
GET    /api/meetup/search-users?q=     - Search users
```

### 4. Reputation System

**Completion Rewards:**
- Seller: +5 reputation
- Buyer: +3 reputation

**Cancellation Penalties:**
- 1st cancellation: Warning only (0 penalty)
- 2nd cancellation: -5 reputation
- 3rd+ cancellation: -10 reputation

## 📋 Next Steps: Frontend

### To Implement:

1. **Install Leaflet**
   ```bash
   cd Frontend
   npm install react-leaflet leaflet
   npm install -D @types/leaflet
   ```

2. **Create Components:**
   - `MeetupSchedulerPage.tsx` - Main page with meetup list
   - `CreateMeetupModal.tsx` - Modal for creating meetups
   - `MeetupDetailModal.tsx` - Modal for viewing/managing meetups
   - `MeetupMap.tsx` - Reusable map component

3. **Features to Build:**
   - List view with tabs (Pending, Confirmed, Completed, Cancelled)
   - Create meetup form with:
     - Item selection (from seller's listings)
     - Buyer search/selection
     - Date/Time picker
     - Location picker with map
     - Notes field
   - Meetup detail view with:
     - Full details display
     - Map showing location
     - Action buttons based on role and status
     - Contact button (placeholder)
   - Status badges and indicators
   - Responsive design

## 🗺️ Map Integration (Leaflet + OpenStreetMap)

### Basic Setup:
```tsx
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map component
<MapContainer center={[14.5995, 120.9842]} zoom={13} style={{ height: '400px', width: '100%' }}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  />
  <Marker position={[lat, lng]}>
    <Popup>Meetup Location</Popup>
  </Marker>
</MapContainer>
```

### Click to Set Location:
```tsx
function LocationMarker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}
```

## 🎯 User Flow

### Seller Flow:
1. Click "Schedule Meetup" (from item or dashboard)
2. Fill form: Select buyer, date, time, location (click on map), notes
3. Submit → Meetup created with status "pending"
4. Wait for buyer to accept
5. Can reschedule or cancel anytime

### Buyer Flow:
1. See meetup invitation (status: pending)
2. Accept or Decline
3. If accepted → status changes to "confirmed"
4. After meeting → Mark as "Complete"
5. Can cancel anytime (with penalty)

## 🔒 Security Features

- RLS policies ensure users can only see their own meetups
- Token authentication required for all endpoints
- Buyer/Seller verification before actions
- Status validation (e.g., can't complete a pending meetup)

## 📊 Status Flow

```
pending → confirmed → completed
   ↓          ↓
cancelled  cancelled
```

## 🚀 Testing Checklist

- [ ] Run SQL script in Supabase
- [ ] Restart Flask backend
- [ ] Test API endpoints with Postman/Thunder Client
- [ ] Install Leaflet in frontend
- [ ] Create frontend components
- [ ] Test complete user flow
- [ ] Verify reputation system works
- [ ] Test map functionality
- [ ] Test all edge cases

## 📝 Notes

- Buyer selection is temporary (search by name/email)
- Once chat is implemented, buyer_id will be passed automatically
- No notifications yet (will add later)
- No time restrictions yet (will add later)
- Contact button is placeholder for future chat integration
