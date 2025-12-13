from flask import Blueprint,request,jsonify
from app.extensions import get_supabase

board_bp = Blueprint('board', __name__)

@board_bp.route('/request', methods=['GET'])
def get_request_board():
    try:
        from app.services.board_service import BoardService
    except ImportError as e:
        print("Import Error", e)
        return jsonify({"error": str(e)}), 500
    
    # Try to get user_id from token if provided
    user_id = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.replace('Bearer ', '')
        try:
            supabase = get_supabase()
            user_response = supabase.auth.get_user(token)
            user_id = user_response.user.id
        except Exception as e:
            print(f"Token validation failed: {e}")
            # Continue without user_id
    
    try:
        response, status = BoardService.get_board_item(user_id)
        return jsonify(response), status
        
    except Exception as e:
        print(f"Error Service Calling: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@board_bp.route('/requests', methods=['POST'])
def create_request():
    try:
        from app.services.board_service import BoardService
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        response, status = BoardService.create_request(user_id, data)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500



@board_bp.route('/requests/<request_id>/like', methods=['POST'])
def toggle_like(request_id):
    try:
        from app.services.board_service import BoardService
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')

    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        print("Error Token")
        return jsonify({"success": False, "message": str(e)}), 401

    try:
        response, status = BoardService.toggle_like(user_id, request_id)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@board_bp.route('/requests/<request_id>/replies', methods=['GET'])
def get_replies(request_id):
    try:
        from app.services.board_service import BoardService
    except ImportError as e:
        print("Import Error", e)
        return jsonify({"error": str(e)}), 500
    
    try:
        response, status = BoardService.get_replies(request_id)
        return jsonify(response), status
        
    except Exception as e:
        print(f"Error Service Calling: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@board_bp.route('/requests/<request_id>/replies', methods=['POST'])
def create_reply(request_id):
    try:
        from app.services.board_service import BoardService
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "message": "Missing Token"}), 401
    
    token = auth_header.replace('Bearer ', '')

    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        print("Error Token")
        return jsonify({"success": False, "message": str(e)}), 401

    try:
        data = request.get_json()
        response, status = BoardService.create_reply(user_id, request_id, data)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@board_bp.route('/requests/<request_id>', methods=['DELETE'])
def delete_request(request_id):
    try:
        from app.services.board_service import BoardService
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        response, status = BoardService.delete_request(user_id, request_id)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@board_bp.route('/requests/<request_id>/replies/<reply_id>', methods=['DELETE'])
def delete_reply(request_id, reply_id):
    try:
        from app.services.board_service import BoardService
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        response, status = BoardService.delete_reply(user_id, request_id, reply_id)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
