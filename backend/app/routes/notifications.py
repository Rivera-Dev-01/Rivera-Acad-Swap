from flask import Blueprint, request, jsonify
from app.extensions import get_supabase
from app.services.notification_service import NotificationService

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
def get_notifications():
    """Get all notifications for the current user"""
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
    
    result = NotificationService.get_notifications(user_id)
    return jsonify(result)

@notifications_bp.route('/mark-read', methods=['PUT'])
def mark_all_read():
    """Mark all notifications as read"""
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
    
    result = NotificationService.mark_all_read(user_id)
    return jsonify(result)

@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    """Mark a specific notification as read"""
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
    
    result = NotificationService.mark_read(notification_id, user_id)
    return jsonify(result)
