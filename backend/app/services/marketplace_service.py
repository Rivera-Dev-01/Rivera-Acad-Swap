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

            return {"success": True, "data": active_listing.data}, 200
        except Exception as e:
            print(f"Service Error: {e}") 
            return ({"success": False, "message": str(e)}), 500