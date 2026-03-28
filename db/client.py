import os

from dotenv import load_dotenv
from supabase import create_client


def get_supabase():
    """
    Lazy Supabase client creation.

    This avoids crashing the Flask app at import time when Supabase env vars
    aren't set or `.env` hasn't been loaded yet.
    """
    load_dotenv()

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    if not supabase_url:
        raise RuntimeError("SUPABASE_URL is required (check your .env)")
    if not supabase_key:
        raise RuntimeError("SUPABASE_KEY is required (check your .env)")

    return create_client(supabase_url, supabase_key)

