from app.extensions import get_supabase


class UserService:

    @staticmethod
    def get_profile(user_id):
        supabase = get_supabase()
        try:
            user_response = supabase.table('users').select(
                '*').eq('id', user_id).single().execute()
            return {"success": True, "user": user_response.data}, 200
        except Exception as e:
            print(f"Get profile error: {e}")
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def get_user_profile_by_id(user_id):
        """Get any user's profile by ID (for viewing other users)"""
        supabase = get_supabase()
        try:
            user_response = supabase.table('users').select(
                'id, first_name, last_name, email, course, current_year, block_section, phone_number, address, profile_picture, profile_completed, reputation_score').eq('id', user_id).single().execute()
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
            db_query = supabase.table('users').select(
                'id, first_name, last_name, email, course, current_year, block_section, profile_picture, profile_completed, reputation_score')

            # Apply filters
            if query:
                # Search in first_name, last_name, or email
                db_query = db_query.or_(
                    f'first_name.ilike.%{query}%,last_name.ilike.%{query}%,email.ilike.%{query}%')

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
            protected_fields = ['id', 'email', 'created_at',
                                'reputation_score', 'referral_code', 'referred_by']
            for field in protected_fields:
                if field in data:
                    del data[field]

            response = supabase.table('users').update(
                data).eq('id', user_id).execute()

            # After updating, check if profile is now complete
            updated_user = response.data[0] if response.data else None
            if updated_user:
                # Check if user has at least 1 item listed
                items_response = supabase.table('items').select(
                    'id', count='exact').eq('seller_id', user_id).execute()
                has_listing = (items_response.count or 0) > 0

                # Profile is complete if: profile_picture + address + 1 listing
                is_complete = bool(updated_user.get('profile_picture')) and bool(
                    updated_user.get('address')) and has_listing

                # Update profile_completed status if complete
                if is_complete and not updated_user.get('profile_completed'):
                    supabase.table('users').update(
                        {'profile_completed': True}).eq('id', user_id).execute()
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
            user_response = supabase.table('users').select(
                'profile_picture, address').eq('id', user_id).single().execute()
            user = user_response.data

            # Check if user has at least 1 item listed
            items_response = supabase.table('items').select(
                'id', count='exact').eq('seller_id', user_id).execute()
            has_listing = (items_response.count or 0) > 0

            # Profile is complete if: profile_picture + address + 1 listing
            is_complete = bool(user.get('profile_picture')) and bool(
                user.get('address')) and has_listing

            # Update profile_completed status
            if is_complete:
                supabase.table('users').update(
                    {'profile_completed': True}).eq('id', user_id).execute()

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
            # NOTE: This endpoint does a few aggregate reads. To keep it fast and
            # "real‑time‑ish" we minimise round‑trips and avoid per‑row loops.

            # 1. Base user data
            user_response = (
                supabase
                .table('users')
                .select('*')
                .eq('id', user_id)
                .single()
                .execute()
            )

            # 2. Active listings (single count query)
            active_listing = (
                supabase
                .table('items')
                .select('*', count='exact')
                .eq('seller_id', user_id)
                .eq('status', 'active')
                .execute()
            )

            # 3. Completed meetups as seller (for total_sales + earnings)
            completed_meetups_seller = (
                supabase
                .table('meetups')
                .select('id', count='exact')
                .eq('seller_id', user_id)
                .eq('status', 'completed')
                .execute()
            )

            # 4. Total earnings: single JOIN query (already optimised)
            completed_meetups_with_items = (
                supabase
                .table('meetups')
                .select('item_id, items(price)')
                .eq('seller_id', user_id)
                .eq('status', 'completed')
                .execute()
            )

            total_earnings = 0.0
            if completed_meetups_with_items.data:
                for meetup in completed_meetups_with_items.data:
                    try:
                        item_data = meetup.get('items') or {}
                        price = item_data.get('price')
                        if price is not None:
                            total_earnings += float(price)
                    except Exception as item_error:
                        # Log and continue – a single bad row shouldn't break the dashboard
                        print(f"Error calculating earnings: {item_error}")

            # 5. Completed meetups as buyer (for engagement)
            completed_deals_buyer = (
                supabase
                .table('meetups')
                .select('id', count='exact')
                .eq('buyer_id', user_id)
                .eq('status', 'completed')
                .execute()
            )

            total_completed_deals = (
                completed_meetups_seller.count or 0) + (completed_deals_buyer.count or 0)

            # 6. Request‑board posts + likes
            #    - ONE query to get this user's posts (for count + ids)
            #    - ONE query to count all likes across those posts (no per‑post loop)
            user_posts = (
                supabase
                .table('requests')
                .select('id')
                .eq('user_id', user_id)
                .execute()
            )

            post_ids = [post['id']
                        for post in (user_posts.data or []) if 'id' in post]
            total_posts = len(post_ids)

            total_post_likes = 0
            if post_ids:
                try:
                    likes_resp = (
                        supabase
                        .table('request_likes')
                        .select('id', count='exact')
                        .in_('request_id', post_ids)
                        .execute()
                    )
                    total_post_likes = likes_resp.count or 0
                except Exception as like_error:
                    print(f"Error counting total likes: {like_error}")

            # 7. Marketplace item views (single query)
            user_items = (
                supabase
                .table('items')
                .select('view_count')
                .eq('seller_id', user_id)
                .execute()
            )

            total_views = 0
            if user_items.data:
                for item in user_items.data:
                    total_views += (item.get('view_count') or 0)

            # 8. Engagement score → engagement rate (bounded 0‑100)
            completed_deals_points = total_completed_deals * 10
            likes_points = total_post_likes / 4.0    # Every 4 likes = 1 point
            posts_points = total_posts * 5
            views_points = total_views / 10.0        # Every 10 views = 1 point

            total_points = completed_deals_points + \
                likes_points + posts_points + views_points

            max_possible_points = 200.0  # Represents 100% engagement
            engagement_rate = 0.0
            if max_possible_points > 0:
                engagement_rate = min(
                    (total_points / max_possible_points) * 100.0, 100.0)

            # Debug logs (kept but more compact)
            print("Dashboard user:", user_response.data)
            print(
                f"Dashboard stats -> active={active_listing.count}, "
                f"sold={completed_meetups_seller.count}, earnings={total_earnings:.2f}, "
                f"deals={total_completed_deals}, likes={total_post_likes}, "
                f"posts={total_posts}, views={total_views}, "
                f"engagement={engagement_rate:.1f}%"
            )

            return {
                "success": True,
                "user": user_response.data,
                "stats": {
                    "active_listings": active_listing.count or 0,
                    "total_sales": completed_meetups_seller.count or 0,
                    "total_earnings": total_earnings,
                    "engagement_rate": round(engagement_rate, 1),
                },
            }, 200

        except Exception as e:
            # Print the actual error for debugging
            print(f"Service Error (get_dashboard_data): {e}")
            return {"success": False, "message": str(e)}, 500
