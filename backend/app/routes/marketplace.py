from flask import Blueprint,request,jsonify
from app.extensions import get_supabase

market_bp = Blueprint('marketplace', __name__)


@market_bp.route('/items', methods=['GET'])
def get_marketplace_item():
    # Import inside the function
    try:
        from app.services.marketplace_service import MarketPlaceService
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    try:
        response, status = MarketPlaceService.get_marketplace_item()
        return jsonify(response), status
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

