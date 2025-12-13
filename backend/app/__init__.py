from flask import Flask
from flask_cors import CORS
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # 1. Allow React (port 5173) to talk to this backend
    CORS(app, resources={r"/*": {"origins": "*"}}) 
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.marketplace import market_bp
    from app.routes.board import board_bp
    
    # --- ADD THIS IMPORT ---
    # (Make sure your file is named 'item.py' inside app/routes folder)
    from app.routes.item import item_bp 
    
    
    print("Registering blueprints...")
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    print("✓ Auth blueprint registered")
    app.register_blueprint(user_bp, url_prefix='/api/user')
    print("✓ User blueprint registered")
    app.register_blueprint(market_bp, url_prefix='/api/marketplace')
    print("✓ Marketplace blueprint registered")
    app.register_blueprint(board_bp, url_prefix='/api/board')
    print("✓ Board blueprint registered")
    
    # --- REGISTER THE ITEM BLUEPRINT ---
    # We don't add a prefix here because your route is already named '/items'
    app.register_blueprint(item_bp)
    print("✓ Item blueprint registered") 
    
    @app.route('/')
    def index():
        return "Backend is running!"
    
    return app