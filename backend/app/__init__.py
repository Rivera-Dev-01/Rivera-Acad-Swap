from flask import Flask
from flask_cors import CORS
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # CORS: Restrict origins to allowed domains only
    # Set CORS_ORIGINS env var in production (e.g., "https://rivera-acad-swap.vercel.app")
    CORS(app, resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}}) 
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.marketplace import market_bp
    from app.routes.board import board_bp
    from app.routes.item import item_bp
    from app.routes.meetup import meetup_bp
    from app.routes.referral import referral_bp
    from app.routes.offer import offer_bp
    from app.routes.notifications import notifications_bp
    from app.routes.friends import friends_bp
    from app.routes.feedback import feedback_bp
    
    
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
    
    app.register_blueprint(meetup_bp, url_prefix='/api/meetup')
    print("✓ Meetup blueprint registered")
    
    app.register_blueprint(referral_bp, url_prefix='/api/referral')
    print("✓ Referral blueprint registered")
    
    app.register_blueprint(offer_bp, url_prefix='/api/offer')
    print("✓ Offer blueprint registered")
    
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    print("✓ Notifications blueprint registered")
    
    app.register_blueprint(friends_bp, url_prefix='/api/friends')
    print("✓ Friends blueprint registered")

    app.register_blueprint(feedback_bp, url_prefix='/api/feedback')
    print("✓ Feedback blueprint registered")
    
    @app.route('/')
    def index():
        return "Backend is running!"
    
    return app