from flask import Blueprint, jsonify, request
from app.extensions import get_supabase
from app.services.referral_service import ReferralService

referral_bp = Blueprint('referral', __name__)

@referral_bp.route('/stats', methods=['GET'])
def get_referral_stats():
    """Get user's referral statistics"""
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
    
    try:
        stats = ReferralService.get_user_referral_stats(user_id)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@referral_bp.route('/validate/<code>', methods=['GET'])
def validate_referral_code(code):
    """Validate if a referral code exists"""
    try:
        is_valid = ReferralService.validate_referral_code(code)
        return jsonify({
            "success": True,
            "valid": is_valid,
            "message": "Valid referral code" if is_valid else "Invalid referral code"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@referral_bp.route('/leaderboard', methods=['GET'])
def get_referral_leaderboard():
    """Get top referrers leaderboard"""
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
    
    try:
        limit = request.args.get('limit', 10, type=int)
        leaderboard = ReferralService.get_referral_leaderboard(limit)
        return jsonify({
            "success": True,
            "leaderboard": leaderboard
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
