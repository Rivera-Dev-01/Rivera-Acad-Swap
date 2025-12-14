from app.extensions import get_supabase

class MarketPlaceService:

    @staticmethod
    def get_marketplace_item():
        supabase = get_supabase()
        try:
            active_listing = supabase.table('items')\
                .select('id, title, description, price, category, subcategory, condition, images, status, size, created_at, seller_id')\
                .eq('status', 'active')\
                .order('created_at', desc=True)\
                .limit(100)\
                .execute()

            # Fetch user data for each item
            if active_listing.data:
                for item in active_listing.data:
                    try:
                        user_data = supabase.table('users').select('first_name, last_name, profile_picture').eq('id', item['seller_id']).single().execute()
                        if user_data.data:
                            item['seller_first_name'] = user_data.data.get('first_name', 'Unknown')
                            item['seller_last_name'] = user_data.data.get('last_name', 'User')
                            item['seller_profile_picture'] = user_data.data.get('profile_picture')
                        else:
                            item['seller_first_name'] = 'Unknown'
                            item['seller_last_name'] = 'User'
                            item['seller_profile_picture'] = None
                    except Exception as e:
                        print(f"Error fetching user data for seller {item['seller_id']}: {e}")
                        item['seller_first_name'] = 'Unknown'
                        item['seller_last_name'] = 'User'
                        item['seller_profile_picture'] = None

            return {"success": True, "data": active_listing.data}, 200
        except Exception as e:
            print(f"Service Error: {e}") 
            return ({"success": False, "message": str(e)}), 500