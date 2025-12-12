from flask import Blueprint,request,jsonify
from app.extensions import get_supabase
from app.services.user_service import UserService

user_bp = Blueprint('user', __name__)

@user_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401

    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()
    user_id = None

    # --- BLOCK 1: VALIDATE AUTH ---
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        # If this fails, it is genuinely an invalid token
        print(f"Auth specific error: {e}")
        return jsonify({"success": False, "message": "Invalid or Expired Token"}), 401

    # --- BLOCK 2: FETCH DATA (Outside the Auth Try/Catch) ---
    # If this fails, it will show a real 500 error in your terminal, 
    # instead of falsely saying "Invalid Token"
    
    response, status = UserService.get_dashboard_data(user_id)

    # Fix the Serialization Error here:
    if hasattr(response, 'data'):
        final_data = response.data
    else:
        final_data = response

    return jsonify(final_data), status