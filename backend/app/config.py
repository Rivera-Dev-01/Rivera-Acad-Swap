import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev_key")
    
    # CORS allowed origins - comma-separated for multiple origins
    # Development: http://localhost:5173
    # Production: https://rivera-acad-swap.vercel.app
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:5173"
    ).split(",")