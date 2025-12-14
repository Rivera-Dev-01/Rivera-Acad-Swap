from app.extensions import get_supabase

class UserService:

    @staticmethod
    def get_profile(user_id):
        supabase = get_supabase()
        try:
            user_response = supabase.table('users').select('*').eq('id', user_id).single().execute()
            return {"success": True, "user": user_response.data}, 200
        except Exception as e:
            print(f"Get profile error: {e}")
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def get_user_profile_by_id(user_id):
        """Get any user's profile by ID (for viewing other users)"""
        supabase = get_supabase()
        try:
            user_response = supabase.table('users').select('id, first_name, last_name, email, course, current_year, block_section, phone_number, address, profile_picture, profile_completed, reputation_score').eq('id', user_id).single().execute()
            return {"success": True, "user": user_response.data}, 200
        except Exception as e:
            print(f"Get user profile error: {e}")
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def search_users(query, course, year, current_user_id):
        """Search for users by name, email, course, or year"""
        supabase = get_supabase()
        try:
            # Start with base query
            db_query = supabase.table('users').select('id, first_name, last_name, email, course, current_year, block_section, profile_picture, profile_completed, reputation_score')
            
            # Apply filters
            if query:
                # Search in first_name, last_name, or email
                db_query = db_query.or_(f'first_name.ilike.%{query}%,last_name.ilike.%{query}%,email.ilike.%{query}%')
            
            if course:
                db_query = db_query.eq('course', course)
            
            if year:
                db_query = db_query.eq('current_year', year)
            
            # Exclude current user and limit results
            db_query = db_query.neq('id', current_user_id).limit(50)
            
            response = db_query.execute()
            
            return {"success": True, "users": response.data or []}, 200
        except Exception as e:
            print(f"Search users error: {e}")
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def update_profile(user_id, data):
        supabase = get_supabase()
        try:
            # Remove fields that shouldn't be updated
            protected_fields = ['id', 'email', 'created_at', 'reputation_score', 'referral_code', 'referred_by']
            for field in protected_fields:
                if field in data:
                    del data[field]
            
            response = supabase.table('users').update(data).eq('id', user_id).execute()
            
            # After updating, check if profile is now complete
            updated_user = response.data[0] if response.data else None
            if updated_user:
                # Check if user has at least 1 item listed
                items_response = supabase.table('items').select('id', count='exact').eq('seller_id', user_id).execute()
                has_listing = (items_response.count or 0) > 0
                
                # Profile is complete if: profile_picture + address + 1 listing
                is_complete = bool(updated_user.get('profile_picture')) and bool(updated_user.get('address')) and has_listing
                
                # Update profile_completed status if complete
                if is_complete and not updated_user.get('profile_completed'):
                    supabase.table('users').update({'profile_completed': True}).eq('id', user_id).execute()
                    updated_user['profile_completed'] = True
                    print(f"✓ Profile marked as complete for user {user_id}")
            
            return {"success": True, "user": updated_user}, 200
        except Exception as e:
            print(f"Update profile error: {e}")
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def check_profile_completion(user_id):
        supabase = get_supabase()
        try:
            # Get user data
            user_response = supabase.table('users').select('profile_picture, address').eq('id', user_id).single().execute()
            user = user_response.data
            
            # Check if user has at least 1 item listed
            items_response = supabase.table('items').select('id', count='exact').eq('seller_id', user_id).execute()
            has_listing = (items_response.count or 0) > 0
            
            # Profile is complete if: profile_picture + address + 1 listing
            is_complete = bool(user.get('profile_picture')) and bool(user.get('address')) and has_listing
            
            # Update profile_completed status
            if is_complete:
                supabase.table('users').update({'profile_completed': True}).eq('id', user_id).execute()
            
            return {
                "success": True,
                "profile_completed": is_complete,
                "tasks": {
                    "profile_picture": bool(user.get('profile_picture')),
                    "address": bool(user.get('address')),
                    "first_listing": has_listing
                }
            }, 200
        except Exception as e:
            print(f"Check profile completion error: {e}")
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def get_dashboard_data(user_id):
        supabase = get_supabase()

        try:
            # 1. Rename variable to user_response to be clear it's the wrapper
            user_response = supabase.table('users').select('*').eq('id', user_id).single().execute()

            # 1. Active Listings
            active_listing = supabase.table('items')\
                .select('*', count='exact')\
                .eq('seller_id', user_id)\
                .eq('status', 'active')\
                .execute()

            # 2. Sold Items (Completed Meetups as Seller)
            completed_meetups_seller = supabase.table('meetups')\
                .select('id', count='exact')\
                .eq('seller_id', user_id)\
                .eq('status', 'completed')\
                .execute()
            
            # 3. Calculate Total Earnings from completed meetups
            # Optimized: Join meetups with items to get prices in one query
            completed_meetups_with_items = supabase.table('meetups')\
                .select('item_id, items(price)')\
                .eq('seller_id', user_id)\
                .eq('status', 'completed')\
                .execute()
            
            total_earnings = 0
            if completed_meetups_with_items.data:
                for meetup in completed_meetups_with_items.data:
                    try:
                        if meetup.get('items') and meetup['items'].get('price'):
                            total_earnings += float(meetup['items']['price'])
                    except Exception as item_error:
                        print(f"Error calculating earnings: {item_error}")
            
            # 4. Calculate Engagement Rate (Weighted Formula)
            # Get completed deals count (both as seller and buyer)
            completed_deals_buyer = supabase.table('meetups')\
                .select('id', count='exact')\
                .eq('buyer_id', user_id)\
                .eq('status', 'completed')\
                .execute()
            
            total_completed_deals = (completed_meetups_seller.count or 0) + (completed_deals_buyer.count or 0)
            
            # Get request board posts
            user_posts = supabase.table('requests')\
                .select('id')\
                .eq('user_id', user_id)\
                .execute()
            
            total_post_likes = 0
            total_posts = 0
            if user_posts.data:
                total_posts = len(user_posts.data)
                # Count likes for each post
                for post in user_posts.data:
                    try:
                        like_count = supabase.table('request_likes')\
                            .select('id', count='exact')\
                            .eq('request_id', post['id'])\
                            .execute()
                        total_post_likes += like_count.count if like_count.count else 0
                    except Exception as like_error:
                        print(f"Error counting likes: {like_error}")
            
            # Get marketplace item views
            user_items = supabase.table('items')\
                .select('view_count')\
                .eq('seller_id', user_id)\
                .execute()
            
            total_views = 0
            if user_items.data:
                for item in user_items.data:
                    total_views += item.get('view_count', 0) or 0
            
            # Calculate engagement points
            completed_deals_points = total_completed_deals * 10
            likes_points = total_post_likes / 4  # Every 4 likes = 1 point
            posts_points = total_posts * 5
            views_points = total_views / 10  # Every 10 views = 1 point
            
            total_points = completed_deals_points + likes_points + posts_points + views_points
            
            # Define max possible points for a "highly engaged" user
            # This is adjustable based on your platform's activity levels
            max_possible_points = 200  # Represents 100% engagement
            
            # Calculate engagement rate (capped at 100%)
            engagement_rate = min((total_points / max_possible_points) * 100, 100)
            
            # --- DEBUGGING PRINTS ---
            print("User Data Found:", user_response.data)
            print("Active Listings:", active_listing.count)
            print("Sold Items:", completed_meetups_seller.count)
            print("Total Earnings:", total_earnings)
            print(f"Engagement: Deals={total_completed_deals}, Likes={total_post_likes}, Posts={total_posts}, Views={total_views}")
            print(f"Engagement Points: {total_points:.2f} / {max_possible_points} = {engagement_rate:.1f}%")
            # -------------------------

            return {
                "success": True,
                "user": user_response.data, 
                "stats": {
                    "active_listings": active_listing.count or 0,
                    "total_sales": completed_meetups_seller.count or 0,
                    "total_earnings": total_earnings,
                    "engagement_rate": round(engagement_rate, 1)
                }
            }, 200

        except Exception as e: 
            # FIX: Print the ACTUAL error message to terminal
            print(f"Service Error: {e}") 
            return ({"success": False, "message": str(e)}), 500