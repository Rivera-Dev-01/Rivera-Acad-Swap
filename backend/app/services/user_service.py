from app.extensions import get_supabase

class UserService:

    @staticmethod
    def get_dashboard_data(user_id):
        supabase = get_supabase()

        try:
            # 1. Rename variable to user_response to be clear it's the wrapper
            user_response = supabase.table('users').select('*').eq('id', user_id).single().execute()

            active_listing = supabase.table('items')\
                .select('*', count='exact')\
                .eq('seller_id', user_id)\
                .eq('status', 'active')\
                .execute()

            total_sales = supabase.table('transactions')\
                .select('*', count='exact')\
                .eq('seller_id', user_id)\
                .eq('status', 'completed')\
                .execute()
            
            # --- DEBUGGING PRINTS (Check your terminal) ---
            print("User Data Found:", user_response.data)
            print("Active Count:", active_listing.count)
            # ---------------------------------------------

            return {
                "success": True,
                # FIX: Send only user_response.data, not the whole object
                "user": user_response.data, 
                "stats": {
                    "active_listings": active_listing.count or 0,
                    "total_sales": total_sales.count or 0
                }
            }, 200

        except Exception as e: 
            # FIX: Print the ACTUAL error message to terminal
            print(f"Service Error: {e}") 
            return ({"success": False, "message": str(e)}), 500