from supabase import create_client, Client
from app.config import Config

# Initialize client
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

def get_supabase() -> Client:
    return supabase