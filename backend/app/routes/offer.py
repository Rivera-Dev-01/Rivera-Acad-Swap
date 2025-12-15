from flask import Blueprint, request, jsonify
from app.extensions import get_supabase
from app.services.offer_service import OfferService

offer_bp = Blueprint('offer', __name__)

@offer_bp.route('/create', methods=['POST'])
def create_offer():
    """Create a new offer on an item"""
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
    
    item_id = data.get('item_id')
    offer_amount = data.get('offer_amount')
    message = data.get('message', '')
    
    if not item_id or not offer_amount:
        return jsonify({"success": False, "message": "Missing required fields"}), 400
    
    result = OfferService.create_offer(user_id, item_id, offer_amount, message)
    
    if result['success']:
        return jsonify(result), 201
    return jsonify(result), 400

@offer_bp.route('/received', methods=['GET'])
def get_received_offers():
    """Get all offers received by the user"""
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
    
    result = OfferService.get_received_offers(user_id)
    return jsonify(result)

@offer_bp.route('/sent', methods=['GET'])
def get_sent_offers():
    """Get all offers sent by the user"""
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
    
    result = OfferService.get_sent_offers(user_id)
    return jsonify(result)

@offer_bp.route('/<offer_id>/status', methods=['PUT'])
def update_offer_status(offer_id):
    """Update offer status (accept, reject, counter)"""
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
    
    status = data.get('status')
    counter_amount = data.get('counter_amount')
    counter_message = data.get('counter_message')
    
    if not status:
        return jsonify({"success": False, "message": "Status is required"}), 400
    
    if status not in ['accepted', 'rejected', 'countered']:
        return jsonify({"success": False, "message": "Invalid status"}), 400
    
    result = OfferService.update_offer_status(offer_id, user_id, status, counter_amount, counter_message)
    
    if result['success']:
        return jsonify(result)
    return jsonify(result), 400

@offer_bp.route('/message/send', methods=['POST'])
def send_message():
    """Send a direct message"""
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
    message = data.get('message')
    item_id = data.get('item_id')
    offer_id = data.get('offer_id')
    
    if not receiver_id or not message:
        return jsonify({"success": False, "message": "Missing required fields"}), 400
    
    result = OfferService.send_message(user_id, receiver_id, message, item_id, offer_id)
    
    if result['success']:
        return jsonify(result), 201
    return jsonify(result), 400

@offer_bp.route('/conversations', methods=['GET'])
def get_conversations():
    """Get all conversations for the user"""
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
    
    result = OfferService.get_conversations(user_id)
    return jsonify(result)

@offer_bp.route('/messages/<other_user_id>', methods=['GET'])
def get_messages(other_user_id):
    """Get recent messages with a specific user (limited, Messenger-style)"""
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
    
    # Optional query params for pagination
    limit = request.args.get('limit', default=50, type=int)
    before = request.args.get('before')  # ISO timestamp string

    result = OfferService.get_messages(user_id, other_user_id, limit=limit, before=before)
    return jsonify(result)

@offer_bp.route('/unread-count', methods=['GET'])
def get_unread_count():
    """Get total unread message count"""
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
    
    result = OfferService.get_unread_count(user_id)
    return jsonify(result)
