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
    
    # --- ADD THIS IMPORT ---
    # (Make sure your file is named 'item.py' inside app/routes folder)
    from app.routes.item import item_bp 
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    
    # --- REGISTER THE ITEM BLUEPRINT ---
    # We don't add a prefix here because your route is already named '/items'
    app.register_blueprint(item_bp) 
    
    @app.route('/')
    def index():
        return "Backend is running!"
    
    return app