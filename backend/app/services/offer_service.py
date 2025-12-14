import uuid
from datetime import datetime
from typing import List, Dict, Optional
from app.extensions import get_supabase
from app.services.notification_service import NotificationService

class OfferService:
    @staticmethod
    def create_offer(buyer_id: str, item_id: str, offer_amount: float, message: str = None) -> Dict:
        """Create a new offer on an item"""
        supabase = get_supabase()
        
        try:
            # Get item details
            item_response = supabase.table('items').select('seller_id, price, title, is_sold').eq('id', item_id).single().execute()
            
            if not item_response.data:
                return {"success": False, "message": "Item not found"}
            
            item = item_response.data
            
            if item['is_sold']:
                return {"success": False, "message": "Item is already sold"}
            
            if item['seller_id'] == buyer_id:
                return {"success": False, "message": "Cannot make offer on your own item"}
            
            # Create offer
            offer_id = str(uuid.uuid4())
            offer_data = {
                'id': offer_id,
                'item_id': item_id,
                'buyer_id': buyer_id,
                'seller_id': item['seller_id'],
                'offer_amount': offer_amount,
                'message': message,
                'status': 'pending'
            }
            
            supabase.table('offers').insert(offer_data).execute()
            
            # Get buyer info for notification
            buyer_response = supabase.table('users').select('first_name, last_name').eq('id', buyer_id).single().execute()
            buyer_name = f"{buyer_response.data['first_name']} {buyer_response.data['last_name']}"
            
            # Create notification for seller
            NotificationService.create_offer_notification(item['seller_id'], buyer_name, item['title'], offer_id)
            
            return {
                "success": True,
                "message": "Offer created successfully",
                "offer_id": offer_id
            }
        except Exception as e:
            print(f"Create offer error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def get_received_offers(user_id: str) -> Dict:
        """Get all offers received by the user (as seller)"""
        supabase = get_supabase()
        
        try:
            # Get offers where user is the seller
            offers_response = supabase.table('offers').select('*, items(title, price, images), users!offers_buyer_id_fkey(first_name, last_name, profile_picture)').eq('seller_id', user_id).order('created_at', desc=True).execute()
            
            offers = []
            for offer in offers_response.data:
                # Get first image from images array
                item_image = None
                if offer.get('items') and offer['items'].get('images'):
                    images = offer['items']['images']
                    item_image = images[0] if isinstance(images, list) and len(images) > 0 else None
                
                offers.append({
                    **offer,
                    'item_title': offer['items']['title'] if offer.get('items') else None,
                    'item_price': offer['items']['price'] if offer.get('items') else None,
                    'item_image': item_image,
                    'buyer_first_name': offer['users']['first_name'] if offer.get('users') else None,
                    'buyer_last_name': offer['users']['last_name'] if offer.get('users') else None,
                    'buyer_profile_picture': offer['users']['profile_picture'] if offer.get('users') else None,
                })
            
            return {
                "success": True,
                "offers": offers
            }
        except Exception as e:
            print(f"Get received offers error: {e}")
            return {"success": False, "message": str(e), "offers": []}
    
    @staticmethod
    def get_sent_offers(user_id: str) -> Dict:
        """Get all offers sent by the user (as buyer)"""
        supabase = get_supabase()
        
        try:
            # Get offers where user is the buyer
            offers_response = supabase.table('offers').select('*, items(title, price, images), users!offers_seller_id_fkey(first_name, last_name, profile_picture)').eq('buyer_id', user_id).order('created_at', desc=True).execute()
            
            offers = []
            for offer in offers_response.data:
                # Get first image from images array
                item_image = None
                if offer.get('items') and offer['items'].get('images'):
                    images = offer['items']['images']
                    item_image = images[0] if isinstance(images, list) and len(images) > 0 else None
                
                offers.append({
                    **offer,
                    'item_title': offer['items']['title'] if offer.get('items') else None,
                    'item_price': offer['items']['price'] if offer.get('items') else None,
                    'item_image': item_image,
                    'seller_first_name': offer['users']['first_name'] if offer.get('users') else None,
                    'seller_last_name': offer['users']['last_name'] if offer.get('users') else None,
                    'seller_profile_picture': offer['users']['profile_picture'] if offer.get('users') else None,
                })
            
            return {
                "success": True,
                "offers": offers
            }
        except Exception as e:
            print(f"Get sent offers error: {e}")
            return {"success": False, "message": str(e), "offers": []}
    
    @staticmethod
    def update_offer_status(offer_id: str, user_id: str, status: str, counter_amount: float = None, counter_message: str = None) -> Dict:
        """Update offer status (accept, reject, counter)"""
        supabase = get_supabase()
        
        try:
            # Verify user is the seller
            offer_response = supabase.table('offers').select('seller_id, item_id').eq('id', offer_id).single().execute()
            
            if not offer_response.data:
                return {"success": False, "message": "Offer not found"}
            
            offer = offer_response.data
            
            if offer['seller_id'] != user_id:
                return {"success": False, "message": "Unauthorized"}
            
            # Update offer
            update_data = {'status': status}
            if status == 'countered' and counter_amount:
                update_data['counter_amount'] = counter_amount
                update_data['counter_message'] = counter_message
            
            supabase.table('offers').update(update_data).eq('id', offer_id).execute()
            
            # If accepted, mark item as sold
            if status == 'accepted':
                supabase.table('items').update({'is_sold': True}).eq('id', offer['item_id']).execute()
            
            return {
                "success": True,
                "message": f"Offer {status} successfully"
            }
        except Exception as e:
            print(f"Update offer status error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def send_message(sender_id: str, receiver_id: str, message: str, item_id: str = None, offer_id: str = None) -> Dict:
        """Send a direct message"""
        supabase = get_supabase()
        
        try:
            message_id = str(uuid.uuid4())
            message_data = {
                'id': message_id,
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'message': message,
                'item_id': item_id,
                'offer_id': offer_id,
                'is_read': False
            }
            
            supabase.table('messages').insert(message_data).execute()
            
            # Get sender info for notification
            sender_response = supabase.table('users').select('first_name, last_name').eq('id', sender_id).single().execute()
            sender_name = f"{sender_response.data['first_name']} {sender_response.data['last_name']}"
            
            # Create notification for receiver
            NotificationService.create_message_notification(receiver_id, sender_name, message_id)
            
            return {
                "success": True,
                "message": "Message sent successfully",
                "message_id": message_id
            }
        except Exception as e:
            print(f"Send message error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def get_conversations(user_id: str) -> Dict:
        """Get all conversations for a user"""
        supabase = get_supabase()
        
        try:
            # Get all messages where user is sender or receiver
            messages_response = supabase.table('messages').select('sender_id, receiver_id, message, created_at').or_(f'sender_id.eq.{user_id},receiver_id.eq.{user_id}').order('created_at', desc=True).execute()
            
            # Group by conversation partner
            conversations_dict = {}
            for msg in messages_response.data:
                other_user_id = msg['receiver_id'] if msg['sender_id'] == user_id else msg['sender_id']
                
                if other_user_id not in conversations_dict:
                    conversations_dict[other_user_id] = {
                        'other_user_id': other_user_id,
                        'last_message': msg['message'],
                        'last_message_time': msg['created_at']
                    }
            
            # Get user details and unread counts
            conversations = []
            for other_user_id, conv_data in conversations_dict.items():
                # Get user details
                user_response = supabase.table('users').select('first_name, last_name, profile_picture').eq('id', other_user_id).single().execute()
                
                # Get unread count
                unread_response = supabase.table('messages').select('id', count='exact').eq('sender_id', other_user_id).eq('receiver_id', user_id).eq('is_read', False).execute()
                
                conversations.append({
                    **conv_data,
                    'first_name': user_response.data['first_name'] if user_response.data else '',
                    'last_name': user_response.data['last_name'] if user_response.data else '',
                    'profile_picture': user_response.data['profile_picture'] if user_response.data else None,
                    'unread_count': unread_response.count if unread_response.count else 0
                })
            
            return {
                "success": True,
                "conversations": conversations
            }
        except Exception as e:
            print(f"Get conversations error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def get_messages(user_id: str, other_user_id: str) -> Dict:
        """Get all messages between two users"""
        supabase = get_supabase()
        
        try:
            # Get messages between the two users
            messages_response = supabase.table('messages').select('*, users!messages_sender_id_fkey(first_name, last_name, profile_picture)').or_(f'and(sender_id.eq.{user_id},receiver_id.eq.{other_user_id}),and(sender_id.eq.{other_user_id},receiver_id.eq.{user_id})').order('created_at', desc=False).execute()
            
            messages = []
            for msg in messages_response.data:
                messages.append({
                    **msg,
                    'sender_first_name': msg['users']['first_name'] if msg.get('users') else None,
                    'sender_last_name': msg['users']['last_name'] if msg.get('users') else None,
                    'sender_profile_picture': msg['users']['profile_picture'] if msg.get('users') else None,
                })
            
            # Mark messages as read
            supabase.table('messages').update({'is_read': True}).eq('sender_id', other_user_id).eq('receiver_id', user_id).eq('is_read', False).execute()
            
            return {
                "success": True,
                "messages": messages
            }
        except Exception as e:
            print(f"Get messages error: {e}")
            return {"success": False, "message": str(e)}
    
    @staticmethod
    def get_unread_count(user_id: str) -> Dict:
        """Get total unread message count"""
        supabase = get_supabase()
        
        try:
            unread_response = supabase.table('messages').select('id', count='exact').eq('receiver_id', user_id).eq('is_read', False).execute()
            
            return {
                "success": True,
                "unread_count": unread_response.count if unread_response.count else 0
            }
        except Exception as e:
            print(f"Get unread count error: {e}")
            return {"success": False, "message": str(e)}
