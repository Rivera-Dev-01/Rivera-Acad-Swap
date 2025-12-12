from app.extensions import get_supabase

class ItemService:
    @staticmethod
    def create_item(user_id, data):
        supabase = get_supabase()

        item_payload = {
            "title": data.get("title"),
            "category": data.get("category"),
            "price": data.get("price"),
            "condition": data.get("condition"),
            "description": data.get("description"),
            "notes": data.get("notes"),
            "images": data.get("images", []),
            "seller_id": user_id
        }

        try:
            response = supabase.table('items').insert(item_payload).execute()
            # Depending on Supabase version, response might be .data or inside response
            return {"success": True, "data": response.data}, 201
        
        except Exception as e:
            print("Exception in Service: ", e)
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def get_user_items(user_id):
        supabase = get_supabase()

        try:
            print(f"--- SERVICE: Fetching items for user: {user_id} ---")
            
            # Get all items where seller_id matches the user_id
            response = supabase.table('items').select('*').eq('seller_id', user_id).execute()
            
            print(f"--- SERVICE: Query executed, found {len(response.data) if response.data else 0} items ---")
            print(f"--- SERVICE: Response data: {response.data} ---")
            
            # Return empty array if no data, not None
            items = response.data if response.data else []
            
            return {"success": True, "data": items}, 200
        
        except Exception as e:
            print(f"--- EXCEPTION in get_user_items: {e} ---")
            import traceback
            traceback.print_exc()
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def delete_item(item_id, user_id):
        supabase = get_supabase()

        try:
            print(f"--- DELETE SERVICE: Attempting to delete item {item_id} for user {user_id} ---")
            
            # First check if item exists and belongs to user
            check_response = supabase.table('items').select('*').eq('id', item_id).eq('seller_id', user_id).execute()
            print(f"--- DELETE SERVICE: Check response data: {check_response.data} ---")
            
            if not check_response.data or len(check_response.data) == 0:
                print("--- DELETE SERVICE: Item not found or no permission ---")
                return {"success": False, "message": "Item not found or you don't have permission to delete it"}, 404
            
            # Delete the item
            print(f"--- DELETE SERVICE: Proceeding with delete ---")
            response = supabase.table('items').delete().eq('id', item_id).execute()
            print(f"--- DELETE SERVICE: Delete response: {response.data} ---")
            
            return {"success": True, "message": "Item deleted successfully"}, 200
        
        except Exception as e:
            print(f"--- DELETE SERVICE EXCEPTION: {e} ---")
            import traceback
            traceback.print_exc()
            return {"success": False, "message": str(e)}, 500
    
    @staticmethod
    def update_item(item_id, user_id, data):
        supabase = get_supabase()

        try:
            print(f"--- UPDATE SERVICE: Attempting to update item {item_id} for user {user_id} ---")
            print(f"--- UPDATE SERVICE: Data received: {data} ---")
            
            # Remove fields that shouldn't be updated
            if 'id' in data: del data['id']
            if 'seller_id' in data: del data['seller_id']
            if 'created_at' in data: del data['created_at']
            if 'view_count' in data: del data['view_count']
            if 'status' in data: del data['status']

            print(f"--- UPDATE SERVICE: Data after cleanup: {data} ---")

            # Check if item exists and belongs to user
            check_response = supabase.table('items').select('*').eq('id', item_id).eq('seller_id', user_id).execute()
            print(f"--- UPDATE SERVICE: Check response: {check_response.data} ---")

            if not check_response.data or len(check_response.data) == 0:
                print("--- UPDATE SERVICE: Item not found or no permission ---")
                return {"success": False, "message": "Item not found or you don't have permission"}, 404
            
            # Update the item and return the updated data
            print(f"--- UPDATE SERVICE: Proceeding with update ---")
            response = supabase.table('items').update(data).eq('id', item_id).execute()
            print(f"--- UPDATE SERVICE: Update response: {response.data} ---")
            
            # Return the updated item data
            return {"success": True, "message": "Item updated successfully", "data": response.data[0] if response.data else None}, 200
            
        except Exception as e:
            print(f"--- UPDATE SERVICE EXCEPTION: {e} ---")
            import traceback
            traceback.print_exc()
            return {"success": False, "message": str(e)}, 500
    