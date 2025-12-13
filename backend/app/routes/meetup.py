from flask import Blueprint, request, jsonify
from app.extensions import get_supabase
from app.services.meetup_service import MeetupService

meetup_bp = Blueprint('meetup', __name__)

@meetup_bp.route('/create', methods=['POST'])
def create_meetup():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    try:
        data = request.get_json()
        response, status = MeetupService.create_meetup(user_id, data)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@meetup_bp.route('/my-meetups', methods=['GET'])
def get_my_meetups():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    try:
        response, status = MeetupService.get_user_meetups(user_id)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@meetup_bp.route('/<meetup_id>/accept', methods=['PUT'])
def accept_meetup(meetup_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    try:
        response, status = MeetupService.accept_meetup(user_id, meetup_id)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@meetup_bp.route('/<meetup_id>/decline', methods=['PUT'])
def decline_meetup(meetup_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    try:
        data = request.get_json()
        reason = data.get('reason') if data else None
        response, status = MeetupService.decline_meetup(user_id, meetup_id, reason)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@meetup_bp.route('/<meetup_id>/complete', methods=['PUT'])
def complete_meetup(meetup_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    try:
        response, status = MeetupService.complete_meetup(user_id, meetup_id)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@meetup_bp.route('/<meetup_id>/cancel', methods=['DELETE'])
def cancel_meetup(meetup_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    try:
        data = request.get_json()
        reason = data.get('reason') if data else None
        response, status = MeetupService.cancel_meetup(user_id, meetup_id, reason)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@meetup_bp.route('/<meetup_id>/reschedule', methods=['PUT'])
def reschedule_meetup(meetup_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid Token"}), 401
    
    try:
        data = request.get_json()
        response, status = MeetupService.reschedule_meetup(user_id, meetup_id, data)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@meetup_bp.route('/search-users', methods=['GET'])
def search_users():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    query = request.args.get('q', '')
    if not query or len(query) < 2:
        return jsonify({"success": False, "message": "Query too short"}), 400
    
    try:
        response, status = MeetupService.search_users(query)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
