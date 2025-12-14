import uuid
from datetime import datetime
from typing import List, Dict
from app.extensions import get_supabase

class NotificationService:
    @staticmethod
    def create_notification(user_id: str, notif_type: str, message: str, related_id: str = None, title: str = None) -> Dict:
        """Create a notification"""
        supabase = get_supabase()
        
        try:
            notification_id = str(uuid.uuid4())
            notification_data = {
                'id': notification_id,
                'user_id': user_id,
                'type': notif_type,
                'message': message,
                'related_id': related_id,
                'is_read': False
            }
            
            supabase.table('notifications').insert(notification_data).execute()
            
            return {"success": True, "notification_id": notification_id}
        except Exception as e:
            print(f"Create notification error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def get_notifications(user_id: str) -> Dict:
        """Get all notifications for a user"""
        supabase = get_supabase()
        
        try:
            response = supabase.table('notifications').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(50).execute()
            
            notifications = []
            for notif in response.data:
                # Format time
                created_at = datetime.fromisoformat(notif['created_at'].replace('Z', '+00:00'))
                now = datetime.now(created_at.tzinfo)
                diff = now - created_at
                
                if diff.total_seconds() < 60:
                    time_str = 'Just now'
                elif diff.total_seconds() < 3600:
                    time_str = f'{int(diff.total_seconds() / 60)}m ago'
                elif diff.total_seconds() < 86400:
                    time_str = f'{int(diff.total_seconds() / 3600)}h ago'
                else:
                    time_str = f'{int(diff.total_seconds() / 86400)}d ago'
                
                # Determine link based on type
                link = '#'
                if notif['type'] == 'offer':
                    link = '/offers'
                elif notif['type'] == 'message':
                    link = '/messages'
                elif notif['type'] == 'meetup':
                    link = '/meetup-scheduler'
                elif notif['type'] == 'friend_request':
                    link = '/friend-requests'
                elif notif['type'] == 'board_post':
                    link = '/request-board'
                
                notifications.append({
                    'id': notif['id'],
                    'type': notif['type'],
                    'title': notif['message'].split(':')[0] if ':' in notif['message'] else 'Notification',
                    'message': notif['message'],
                    'time': time_str,
                    'read': notif['is_read'],
                    'link': link
                })
            
            return {
                "success": True,
                "notifications": notifications
            }
        except Exception as e:
            print(f"Get notifications error: {e}")
            return {"success": False, "message": str(e), "notifications": []}
    
    @staticmethod
    def mark_all_read(user_id: str) -> Dict:
        """Mark all notifications as read"""
        supabase = get_supabase()
        
        try:
            supabase.table('notifications').update({'is_read': True, 'read_at': datetime.now().isoformat()}).eq('user_id', user_id).eq('is_read', False).execute()
            
            return {"success": True, "message": "All notifications marked as read"}
        except Exception as e:
            print(f"Mark all read error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def mark_read(notification_id: str, user_id: str) -> Dict:
        """Mark a specific notification as read"""
        supabase = get_supabase()
        
        try:
            supabase.table('notifications').update({'is_read': True, 'read_at': datetime.now().isoformat()}).eq('id', notification_id).eq('user_id', user_id).execute()
            
            return {"success": True, "message": "Notification marked as read"}
        except Exception as e:
            print(f"Mark read error: {e}")
            return {"success": False, "message": str(e)}
    
    # Helper methods for creating specific notification types
    @staticmethod
    def create_offer_notification(seller_id: str, buyer_name: str, item_title: str, offer_id: str):
        """Create notification for new offer"""
        message = f"New offer from {buyer_name} on {item_title}"
        return NotificationService.create_notification(seller_id, 'offer', message, offer_id)
    
    @staticmethod
    def create_message_notification(receiver_id: str, sender_name: str, message_id: str):
        """Create notification for new message"""
        message = f"New message from {sender_name}"
        return NotificationService.create_notification(receiver_id, 'message', message, message_id)
    
    @staticmethod
    def create_meetup_notification(user_id: str, meetup_title: str, meetup_id: str):
        """Create notification for meetup reminder"""
        message = f"Meetup '{meetup_title}' starts in 30 minutes"
        return NotificationService.create_notification(user_id, 'meetup', message, meetup_id)
    
    @staticmethod
    def create_friend_request_notification(receiver_id: str, sender_name: str, request_id: str):
        """Create notification for friend request"""
        message = f"{sender_name} sent you a friend request"
        return NotificationService.create_notification(receiver_id, 'friend_request', message, request_id)
    
    @staticmethod
    def create_friend_accepted_notification(sender_id: str, accepter_name: str, friendship_id: str):
        """Create notification when friend request is accepted"""
        message = f"{accepter_name} accepted your friend request"
        return NotificationService.create_notification(sender_id, 'friend_request', message, friendship_id)
    
    @staticmethod
    def create_board_post_notification(user_id: str, post_title: str, post_id: str):
        """Create notification for new board post"""
        message = f"New post: {post_title}"
        return NotificationService.create_notification(user_id, 'board_post', message, post_id)
