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

@user_bp.route('/profile', methods=['GET'])
def get_profile():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401

    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()

    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        print(f"Auth error: {e}")
        return jsonify({"success": False, "message": "Invalid or Expired Token"}), 401

    response, status = UserService.get_profile(user_id)
    return jsonify(response), status

@user_bp.route('/profile', methods=['PUT'])
def update_profile():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401

    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()

    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        print(f"Auth error: {e}")
        return jsonify({"success": False, "message": "Invalid or Expired Token"}), 401

    data = request.get_json()
    response, status = UserService.update_profile(user_id, data)
    return jsonify(response), status

@user_bp.route('/profile/completion', methods=['GET'])
def check_profile_completion():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401

    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()

    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        print(f"Auth error: {e}")
        return jsonify({"success": False, "message": "Invalid or Expired Token"}), 401

    response, status = UserService.check_profile_completion(user_id)
    return jsonify(response), status

@user_bp.route('/profile/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401

    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()

    try:
        user_response = supabase.auth.get_user(token)
        # Just verify token is valid, don't need to match user_id
    except Exception as e:
        print(f"Auth error: {e}")
        return jsonify({"success": False, "message": "Invalid or Expired Token"}), 401

    response, status = UserService.get_user_profile_by_id(user_id)
    return jsonify(response), status

@user_bp.route('/search', methods=['GET'])
def search_users():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401

    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()

    try:
        user_response = supabase.auth.get_user(token)
        current_user_id = user_response.user.id
    except Exception as e:
        print(f"Auth error: {e}")
        return jsonify({"success": False, "message": "Invalid or Expired Token"}), 401

    query = request.args.get('q', '')
    course = request.args.get('course', '')
    year = request.args.get('year', '')
    
    response, status = UserService.search_users(query, course, year, current_user_id)
    return jsonify(response), status