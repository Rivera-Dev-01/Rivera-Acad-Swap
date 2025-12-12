from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        print(f"Registration request received: {data}")
        
        # Validate required fields
        required_fields = ['schoolEmail', 'password', 'firstName', 'lastName', 
                          'currentYear', 'blockSection', 'course', 'phoneNumber']
        
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "success": False, 
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        response, status = AuthService.register_user(
            email=data.get('schoolEmail'),
            password=data.get('password'),
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            current_year=data.get('currentYear'),
            block_section=data.get('blockSection'),
            course=data.get('course'),
            phone_number=data.get('phoneNumber')
        )
        
        return jsonify(response), status
        
    except Exception as e:
        print(f"Registration route error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"success": False, "message": "Missing email or password"}), 400
    
    response, status = AuthService.login_user(
        email=data.get('email'),
        password=data.get('password')
    )
    
    print(f"Login response being sent: {response}")
    print(f"User data in response: {response.get('user')}")
    
    return jsonify(response), status

