from flask import Blueprint, request, jsonify
from app.extensions import get_supabase
from app.services.friend_service import FriendService

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/request/send', methods=['POST'])
def send_friend_request():
    """Send a friend request"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()
    
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    data = request.get_json()
    receiver_id = data.get('receiver_id')
    
    if not receiver_id:
        return jsonify({"success": False, "message": "receiver_id is required"}), 400
    
    if receiver_id == user_id:
        return jsonify({"success": False, "message": "Cannot send friend request to yourself"}), 400
    
    result = FriendService.send_friend_request(user_id, receiver_id)
    
    if result['success']:
        return jsonify(result), 201
    return jsonify(result), 400

@friends_bp.route('/requests', methods=['GET'])
def get_friend_requests():
    """Get pending friend requests"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()
    
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    result = FriendService.get_friend_requests(user_id)
    return jsonify(result)

@friends_bp.route('/request/<request_id>/accept', methods=['PUT'])
def accept_friend_request(request_id):
    """Accept a friend request"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()
    
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    result = FriendService.accept_friend_request(request_id, user_id)
    
    if result['success']:
        return jsonify(result)
    return jsonify(result), 400

@friends_bp.route('/request/<request_id>/reject', methods=['PUT'])
def reject_friend_request(request_id):
    """Reject a friend request"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()
    
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    result = FriendService.reject_friend_request(request_id, user_id)
    
    if result['success']:
        return jsonify(result)
    return jsonify(result), 400

@friends_bp.route('/list', methods=['GET'])
def get_friends():
    """Get list of friends"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()
    
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    result = FriendService.get_friends(user_id)
    return jsonify(result)

@friends_bp.route('/remove/<friendship_id>', methods=['DELETE'])
def remove_friend(friendship_id):
    """Remove a friend"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()
    
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    result = FriendService.remove_friend(friendship_id, user_id)
    
    if result['success']:
        return jsonify(result)
    return jsonify(result), 400

@friends_bp.route('/status/<other_user_id>', methods=['GET'])
def get_friendship_status(other_user_id):
    """Get friendship status with another user"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    supabase = get_supabase()
    
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    result = FriendService.get_friendship_status(user_id, other_user_id)
    return jsonify(result)
