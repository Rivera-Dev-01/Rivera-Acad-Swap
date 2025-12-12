from flask import Blueprint, request, jsonify
from app.extensions import get_supabase

# Define the blueprint
item_bp = Blueprint('item', __name__)

@item_bp.route('/items', methods=['POST'])
def create_item():
    print("--- 1. REQUEST RECEIVED ---") # Tracker 1

    # Lazy import to avoid circular error
    try:
        from app.services.item_service import ItemService
        print("--- 2. SERVICE IMPORTED ---") # Tracker 2
    except Exception as e:
        print(f"--- CRASH AT IMPORT: {e}")
        return jsonify({"error": str(e)}), 500

    auth_header = request.headers.get('Authorization')
    print(f"--- 3. AUTH HEADER: {auth_header} ---") # Tracker 3

    if not auth_header or not auth_header.startswith('Bearer '):
        print("--- FAIL: NO TOKEN ---")
        return jsonify({"success" : False, "message": "Missing Token"}), 401

    token = auth_header.replace('Bearer ', '')
    
    try:
        print("--- 4. CONNECTING TO SUPABASE ---") # Tracker 4
        supabase = get_supabase()
        
        print("--- 5. VERIFYING USER ---") # Tracker 5
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
        print(f"--- 6. USER VERIFIED: {user_id} ---") # Tracker 6
        
    except Exception as e:
        print(f"--- CRASH AT AUTH: {e}")
        return jsonify({"success": False, "message": "Invalid Token"}), 401

    try:
        data = request.get_json()
        print(f"--- 7. DATA RECEIVED: {data.keys()} ---") # Tracker 7
        
        print("--- 8. CALLING SERVICE ---") # Tracker 8
        response, status = ItemService.create_item(user_id, data)
        print(f"--- 9. SERVICE FINISHED: {status} ---") # Tracker 9
        
        return jsonify(response), status
        
    except Exception as e:
        print(f"--- CRASH AT LOGIC: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@item_bp.route('/items/user/me', methods=['GET'])
def get_my_items():
    print("--- 1. GET MY ITEMS REQUEST RECEIVED ---")
    
    # Lazy import to avoid circular error
    try:
        from app.services.item_service import ItemService
        print("--- 2. SERVICE IMPORTED ---")
    except Exception as e:
        print(f"--- CRASH AT IMPORT: {e}")
        return jsonify({"error": str(e)}), 500

    auth_header = request.headers.get('Authorization')
    print(f"--- 3. AUTH HEADER: {auth_header} ---")
    
    if not auth_header or not auth_header.startswith('Bearer '):
        print("--- FAIL: NO TOKEN ---")
        return jsonify({"success": False, "message": "Missing Token"}), 401

    token = auth_header.replace('Bearer ', '')

    try:
        print("--- 4. CONNECTING TO SUPABASE ---")
        supabase = get_supabase()
        
        print("--- 5. VERIFYING USER ---")
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
        print(f"--- 6. USER VERIFIED: {user_id} ---")
        
    except Exception as e:
        print(f"--- CRASH AT AUTH: {e}")
        return jsonify({"success": False, "message": "Invalid Token"}), 401

    try:
        print("--- 7. CALLING SERVICE ---")
        response, status = ItemService.get_user_items(user_id)
        print(f"--- 8. SERVICE FINISHED: {status} ---")
        
        return jsonify(response), status
        
    except Exception as e:
        print(f"--- CRASH AT LOGIC: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@item_bp.route('/items/<item_id>', methods=['DELETE', 'PUT'])
def manage_item(item_id):
    if request.method == 'DELETE':
        print("--- 1. DELETE ITEM REQUEST RECEIVED ---")
    else:
        print("--- 1. UPDATE ITEM REQUEST RECEIVED ---")
    
    try:
        from app.services.item_service import ItemService
        print("--- 2. SERVICE IMPORTED ---")
    except Exception as e:
        print(f"--- CRASH AT IMPORT: {e}")
        return jsonify({"error": str(e)}), 500

    auth_header = request.headers.get('Authorization')
    print(f"--- 3. AUTH HEADER: {auth_header} ---")
    
    if not auth_header or not auth_header.startswith('Bearer '):
        print("--- FAIL: NO TOKEN ---")
        return jsonify({"success": False, "message": "Missing Token"}), 401

    token = auth_header.replace('Bearer ', '')

    try:
        print("--- 4. CONNECTING TO SUPABASE ---")
        supabase = get_supabase()
        
        print("--- 5. VERIFYING USER ---")
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
        print(f"--- 6. USER VERIFIED: {user_id} ---")
        
    except Exception as e:
        print(f"--- CRASH AT AUTH: {e}")
        return jsonify({"success": False, "message": "Invalid Token"}), 401

    try:
        if request.method == 'DELETE':
            print(f"--- 7. CALLING SERVICE TO DELETE ITEM: {item_id} ---")
            response, status = ItemService.delete_item(item_id, user_id)
            print(f"--- 8. SERVICE FINISHED: {status} ---")
        else:  # PUT
            data = request.get_json()
            print(f"--- 7. DATA RECEIVED: {data.keys() if data else 'None'} ---")
            print(f"--- 8. CALLING SERVICE TO UPDATE ITEM: {item_id} ---")
            response, status = ItemService.update_item(item_id, user_id, data)
            print(f"--- 9. SERVICE FINISHED: {status} ---")
        
        return jsonify(response), status
        
    except Exception as e:
        print(f"--- CRASH AT LOGIC: {e}")
        return jsonify({"success": False, "message": str(e)}), 500