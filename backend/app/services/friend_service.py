import uuid
from datetime import datetime
from typing import List, Dict
from app.extensions import get_supabase
from app.services.notification_service import NotificationService

class FriendService:
    @staticmethod
    def send_friend_request(sender_id: str, receiver_id: str) -> Dict:
        """Send a friend request"""
        supabase = get_supabase()
        
        try:
            # Check if already friends or request exists
            existing = supabase.table('friendships').select('*').or_(
                f'and(user_id.eq.{sender_id},friend_id.eq.{receiver_id}),and(user_id.eq.{receiver_id},friend_id.eq.{sender_id})'
            ).execute()
            
            if existing.data:
                return {"success": False, "message": "Friend request already exists or you are already friends"}
            
            # Get sender info for notification
            sender_response = supabase.table('users').select('first_name, last_name').eq('id', sender_id).single().execute()
            sender_name = f"{sender_response.data['first_name']} {sender_response.data['last_name']}"
            
            # Create friend request
            request_id = str(uuid.uuid4())
            friendship_data = {
                'id': request_id,
                'user_id': sender_id,
                'friend_id': receiver_id,
                'status': 'pending'
            }
            
            supabase.table('friendships').insert(friendship_data).execute()
            
            # Create notification
            NotificationService.create_friend_request_notification(receiver_id, sender_name, request_id)
            
            return {
                "success": True,
                "message": "Friend request sent successfully",
                "request_id": request_id
            }
        except Exception as e:
            print(f"Send friend request error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def get_friend_requests(user_id: str) -> Dict:
        """Get pending friend requests for a user"""
        supabase = get_supabase()
        
        try:
            # Get requests where user is the receiver
            response = supabase.table('friendships').select(
                '*, users!friendships_user_id_fkey(first_name, last_name, profile_picture, course)'
            ).eq('friend_id', user_id).eq('status', 'pending').order('created_at', desc=True).execute()
            
            requests = []
            for req in response.data:
                requests.append({
                    'id': req['id'],
                    'sender_id': req['user_id'],
                    'receiver_id': req['friend_id'],
                    'status': req['status'],
                    'created_at': req['created_at'],
                    'sender_first_name': req['users']['first_name'] if req.get('users') else '',
                    'sender_last_name': req['users']['last_name'] if req.get('users') else '',
                    'sender_profile_picture': req['users'].get('profile_picture') if req.get('users') else None,
                    'sender_course': req['users'].get('course') if req.get('users') else None
                })
            
            return {
                "success": True,
                "requests": requests
            }
        except Exception as e:
            print(f"Get friend requests error: {e}")
            return {"success": False, "message": str(e), "requests": []}
    
    @staticmethod
    def accept_friend_request(request_id: str, user_id: str) -> Dict:
        """Accept a friend request"""
        supabase = get_supabase()
        
        try:
            # Verify user is the receiver
            request_response = supabase.table('friendships').select('user_id, friend_id').eq('id', request_id).single().execute()
            
            if not request_response.data:
                return {"success": False, "message": "Friend request not found"}
            
            request = request_response.data
            
            if request['friend_id'] != user_id:
                return {"success": False, "message": "Unauthorized"}
            
            # Update status to active
            supabase.table('friendships').update({'status': 'active'}).eq('id', request_id).execute()
            
            # Get accepter info for notification
            accepter_response = supabase.table('users').select('first_name, last_name').eq('id', user_id).single().execute()
            accepter_name = f"{accepter_response.data['first_name']} {accepter_response.data['last_name']}"
            
            # Notify sender that request was accepted
            NotificationService.create_friend_accepted_notification(request['user_id'], accepter_name, request_id)
            
            return {
                "success": True,
                "message": "Friend request accepted"
            }
        except Exception as e:
            print(f"Accept friend request error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def reject_friend_request(request_id: str, user_id: str) -> Dict:
        """Reject a friend request"""
        supabase = get_supabase()
        
        try:
            # Verify user is the receiver
            request_response = supabase.table('friendships').select('friend_id').eq('id', request_id).single().execute()
            
            if not request_response.data:
                return {"success": False, "message": "Friend request not found"}
            
            if request_response.data['friend_id'] != user_id:
                return {"success": False, "message": "Unauthorized"}
            
            # Delete the request
            supabase.table('friendships').delete().eq('id', request_id).execute()
            
            return {
                "success": True,
                "message": "Friend request rejected"
            }
        except Exception as e:
            print(f"Reject friend request error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def get_friends(user_id: str) -> Dict:
        """Get list of friends"""
        supabase = get_supabase()
        
        try:
            # Get friendships where user is either user_id or friend_id and status is active
            response = supabase.table('friendships').select(
                '*, users!friendships_user_id_fkey(id, first_name, last_name, profile_picture, course), friend:users!friendships_friend_id_fkey(id, first_name, last_name, profile_picture, course)'
            ).or_(f'user_id.eq.{user_id},friend_id.eq.{user_id}').eq('status', 'active').execute()
            
            friends = []
            for friendship in response.data:
                # Determine which user is the friend
                if friendship['user_id'] == user_id:
                    friend_data = friendship.get('friend', {})
                    friend_id = friendship['friend_id']
                else:
                    friend_data = friendship.get('users', {})
                    friend_id = friendship['user_id']
                
                friends.append({
                    'id': friend_id,
                    'first_name': friend_data.get('first_name', ''),
                    'last_name': friend_data.get('last_name', ''),
                    'profile_picture': friend_data.get('profile_picture'),
                    'course': friend_data.get('course'),
                    'friendship_id': friendship['id']
                })
            
            return {
                "success": True,
                "friends": friends
            }
        except Exception as e:
            print(f"Get friends error: {e}")
            return {"success": False, "message": str(e), "friends": []}
    
    @staticmethod
    def remove_friend(friendship_id: str, user_id: str) -> Dict:
        """Remove a friend"""
        supabase = get_supabase()
        
        try:
            # Verify user is part of the friendship
            friendship_response = supabase.table('friendships').select('user_id, friend_id').eq('id', friendship_id).single().execute()
            
            if not friendship_response.data:
                return {"success": False, "message": "Friendship not found"}
            
            friendship = friendship_response.data
            
            if friendship['user_id'] != user_id and friendship['friend_id'] != user_id:
                return {"success": False, "message": "Unauthorized"}
            
            # Delete the friendship
            supabase.table('friendships').delete().eq('id', friendship_id).execute()
            
            return {
                "success": True,
                "message": "Friend removed"
            }
        except Exception as e:
            print(f"Remove friend error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def get_friendship_status(user_id: str, other_user_id: str) -> Dict:
        """Get friendship status between two users"""
        supabase = get_supabase()
        
        try:
            response = supabase.table('friendships').select('status, user_id').or_(
                f'and(user_id.eq.{user_id},friend_id.eq.{other_user_id}),and(user_id.eq.{other_user_id},friend_id.eq.{user_id})'
            ).execute()
            
            if not response.data:
                return {"success": True, "status": "none"}
            
            friendship = response.data[0]
            status = friendship['status']
            
            # If pending, check if current user is the sender
            if status == 'pending':
                is_sender = friendship['user_id'] == user_id
                return {"success": True, "status": "pending_sent" if is_sender else "pending_received"}
            
            return {"success": True, "status": status}
        except Exception as e:
            print(f"Get friendship status error: {e}")
            return {"success": False, "message": str(e), "status": "none"}
