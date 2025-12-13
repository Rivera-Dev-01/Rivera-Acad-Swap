from app.extensions import get_supabase
from datetime import datetime

class MeetupService:
    
    @staticmethod
    def create_meetup(seller_id, data):
        supabase = get_supabase()
        try:
            meetup_payload = {
                "item_id": data.get("item_id"),
                "seller_id": seller_id,
                "buyer_id": data.get("buyer_id"),
                "title": data.get("title"),
                "scheduled_date": data.get("scheduled_date"),
                "scheduled_time": data.get("scheduled_time"),
                "location_name": data.get("location_name"),
                "location_lat": data.get("location_lat"),
                "location_lng": data.get("location_lng"),
                "notes": data.get("notes"),
                "status": "pending"
            }
            
            response = supabase.table('meetups').insert(meetup_payload).execute()
            return {"success": True, "data": response.data}, 201
        except Exception as e:
            print(f"Create Meetup Error: {e}")
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def get_user_meetups(user_id):
        supabase = get_supabase()
        try:
            # Get meetups where user is either seller or buyer
            meetups = supabase.table('meetups').select('*').or_(f'seller_id.eq.{user_id},buyer_id.eq.{user_id}').order('scheduled_date', desc=False).execute()
            
            # Fetch user data and item data for each meetup
            if meetups.data:
                for meetup in meetups.data:
                    # Fetch seller info
                    try:
                        seller_data = supabase.table('users').select('first_name, last_name, email').eq('id', meetup['seller_id']).single().execute()
                        if seller_data.data:
                            meetup['seller_first_name'] = seller_data.data.get('first_name', 'Unknown')
                            meetup['seller_last_name'] = seller_data.data.get('last_name', 'User')
                            meetup['seller_email'] = seller_data.data.get('email', '')
                    except Exception as e:
                        print(f"Error fetching seller data: {e}")
                        meetup['seller_first_name'] = 'Unknown'
                        meetup['seller_last_name'] = 'User'
                    
                    # Fetch buyer info
                    try:
                        buyer_data = supabase.table('users').select('first_name, last_name, email').eq('id', meetup['buyer_id']).single().execute()
                        if buyer_data.data:
                            meetup['buyer_first_name'] = buyer_data.data.get('first_name', 'Unknown')
                            meetup['buyer_last_name'] = buyer_data.data.get('last_name', 'User')
                            meetup['buyer_email'] = buyer_data.data.get('email', '')
                    except Exception as e:
                        print(f"Error fetching buyer data: {e}")
                        meetup['buyer_first_name'] = 'Unknown'
                        meetup['buyer_last_name'] = 'User'
                    
                    # Fetch item info
                    try:
                        item_data = supabase.table('items').select('title, price, images').eq('id', meetup['item_id']).single().execute()
                        if item_data.data:
                            meetup['item_title'] = item_data.data.get('title', 'Unknown Item')
                            meetup['item_price'] = item_data.data.get('price', 0)
                            meetup['item_images'] = item_data.data.get('images', [])
                    except Exception as e:
                        print(f"Error fetching item data: {e}")
                        meetup['item_title'] = 'Unknown Item'
            
            return {"success": True, "data": meetups.data}, 200
        except Exception as e:
            print(f"Get Meetups Error: {e}")
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def accept_meetup(buyer_id, meetup_id):
        supabase = get_supabase()
        try:
            # Verify buyer owns this meetup
            check = supabase.table('meetups').select('buyer_id').eq('id', meetup_id).single().execute()
            if not check.data or check.data['buyer_id'] != buyer_id:
                return {"success": False, "message": "Unauthorized"}, 403
            
            # Update status to confirmed
            response = supabase.table('meetups').update({"status": "confirmed"}).eq('id', meetup_id).execute()
            return {"success": True, "data": response.data}, 200
        except Exception as e:
            print(f"Accept Meetup Error: {e}")
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def decline_meetup(buyer_id, meetup_id, reason=None):
        supabase = get_supabase()
        try:
            # Verify buyer owns this meetup
            check = supabase.table('meetups').select('buyer_id').eq('id', meetup_id).single().execute()
            if not check.data or check.data['buyer_id'] != buyer_id:
                return {"success": False, "message": "Unauthorized"}, 403
            
            # Update status to cancelled_by_buyer
            update_data = {
                "status": "cancelled_by_buyer",
                "cancelled_at": datetime.now().isoformat(),
                "cancellation_reason": reason
            }
            response = supabase.table('meetups').update(update_data).eq('id', meetup_id).execute()
            
            # Apply reputation penalty
            MeetupService._apply_cancellation_penalty(buyer_id, meetup_id, 'buyer')
            
            return {"success": True, "data": response.data}, 200
        except Exception as e:
            print(f"Decline Meetup Error: {e}")
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def complete_meetup(buyer_id, meetup_id):
        supabase = get_supabase()
        try:
            # Verify buyer owns this meetup and it's confirmed
            check = supabase.table('meetups').select('buyer_id, seller_id, status').eq('id', meetup_id).single().execute()
            if not check.data or check.data['buyer_id'] != buyer_id:
                return {"success": False, "message": "Unauthorized"}, 403
            
            if check.data['status'] != 'confirmed':
                return {"success": False, "message": "Meetup must be confirmed first"}, 400
            
            # Update status to completed
            update_data = {
                "status": "completed",
                "completed_at": datetime.now().isoformat()
            }
            response = supabase.table('meetups').update(update_data).eq('id', meetup_id).execute()
            
            # Apply reputation rewards
            seller_id = check.data['seller_id']
            MeetupService._apply_completion_reward(seller_id, buyer_id, meetup_id)
            
            return {"success": True, "data": response.data}, 200
        except Exception as e:
            print(f"Complete Meetup Error: {e}")
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def cancel_meetup(user_id, meetup_id, reason=None):
        supabase = get_supabase()
        try:
            # Check if user is seller or buyer
            check = supabase.table('meetups').select('seller_id, buyer_id').eq('id', meetup_id).single().execute()
            if not check.data:
                return {"success": False, "message": "Meetup not found"}, 404
            
            is_seller = check.data['seller_id'] == user_id
            is_buyer = check.data['buyer_id'] == user_id
            
            if not is_seller and not is_buyer:
                return {"success": False, "message": "Unauthorized"}, 403
            
            # Determine cancellation type
            status = "cancelled_by_seller" if is_seller else "cancelled_by_buyer"
            user_type = "seller" if is_seller else "buyer"
            
            # Update status
            update_data = {
                "status": status,
                "cancelled_at": datetime.now().isoformat(),
                "cancellation_reason": reason
            }
            response = supabase.table('meetups').update(update_data).eq('id', meetup_id).execute()
            
            # Apply reputation penalty
            MeetupService._apply_cancellation_penalty(user_id, meetup_id, user_type)
            
            return {"success": True, "data": response.data}, 200
        except Exception as e:
            print(f"Cancel Meetup Error: {e}")
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def reschedule_meetup(seller_id, meetup_id, data):
        supabase = get_supabase()
        try:
            # Verify seller owns this meetup
            check = supabase.table('meetups').select('seller_id').eq('id', meetup_id).single().execute()
            if not check.data or check.data['seller_id'] != seller_id:
                return {"success": False, "message": "Unauthorized"}, 403
            
            # Update meetup details and set status back to pending
            update_data = {
                "scheduled_date": data.get("scheduled_date"),
                "scheduled_time": data.get("scheduled_time"),
                "location_name": data.get("location_name"),
                "location_lat": data.get("location_lat"),
                "location_lng": data.get("location_lng"),
                "notes": data.get("notes"),
                "status": "pending"
            }
            response = supabase.table('meetups').update(update_data).eq('id', meetup_id).execute()
            return {"success": True, "data": response.data}, 200
        except Exception as e:
            print(f"Reschedule Meetup Error: {e}")
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def _apply_cancellation_penalty(user_id, meetup_id, user_type):
        """Apply reputation penalty for cancelling meetup"""
        supabase = get_supabase()
        try:
            # Determine penalty based on user type
            # Seller penalty: -3, Buyer penalty: -1
            if user_type == 'seller':
                penalty = -3
                reason = "Meetup cancelled by seller"
            else:
                penalty = -1
                reason = "Meetup cancelled by buyer"
            
            # Update user reputation
            user_data = supabase.table('users').select('reputation_score').eq('id', user_id).single().execute()
            current_score = user_data.data.get('reputation_score', 0) if user_data.data else 0
            new_score = max(0, current_score + penalty)  # Don't go below 0
            
            supabase.table('users').update({"reputation_score": new_score}).eq('id', user_id).execute()
            
            # Log reputation change
            supabase.table('reputation_history').insert({
                "user_id": user_id,
                "meetup_id": meetup_id,
                "change_amount": penalty,
                "reason": reason
            }).execute()
        except Exception as e:
            print(f"Error applying cancellation penalty: {e}")
    
    @staticmethod
    def _apply_completion_reward(seller_id, buyer_id, meetup_id):
        """Apply reputation reward for completing meetup"""
        supabase = get_supabase()
        try:
            # Both seller and buyer get +5 for completing transaction
            rewards = [
                (seller_id, 5, "Transaction completed as seller"),
                (buyer_id, 5, "Transaction completed as buyer")
            ]
            
            for user_id, reward, reason in rewards:
                # Update user reputation
                user_data = supabase.table('users').select('reputation_score').eq('id', user_id).single().execute()
                current_score = user_data.data.get('reputation_score', 0) if user_data.data else 0
                new_score = current_score + reward
                
                supabase.table('users').update({"reputation_score": new_score}).eq('id', user_id).execute()
                
                # Log reputation change
                supabase.table('reputation_history').insert({
                    "user_id": user_id,
                    "meetup_id": meetup_id,
                    "change_amount": reward,
                    "reason": reason
                }).execute()
        except Exception as e:
            print(f"Error applying completion reward: {e}")
    
    @staticmethod
    def search_users(query):
        """Search users by name or email for buyer selection"""
        supabase = get_supabase()
        try:
            # Search by first name, last name, or email
            users = supabase.table('users').select('id, first_name, last_name, email').or_(
                f'first_name.ilike.%{query}%,last_name.ilike.%{query}%,email.ilike.%{query}%'
            ).limit(10).execute()
            
            return {"success": True, "data": users.data}, 200
        except Exception as e:
            print(f"Search Users Error: {e}")
            return {"success": False, "message": str(e)}, 500
