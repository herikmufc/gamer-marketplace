"""
Supabase Client Configuration and Helper Functions
"""
import os
from supabase import create_client, Client
from typing import Optional, BinaryIO
import uuid
from datetime import datetime

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Initialize Supabase clients
supabase: Optional[Client] = None
supabase_admin: Optional[Client] = None

if SUPABASE_URL and SUPABASE_ANON_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ============================================
# STORAGE HELPER FUNCTIONS
# ============================================

def upload_product_image(user_id: int, product_id: int, file: BinaryIO, filename: str, content_type: str) -> str:
    """
    Upload product image to Supabase Storage
    Returns: Public URL of uploaded image
    """
    if not supabase_admin:
        raise Exception("Supabase admin client not initialized")

    # Generate unique filename
    ext = filename.split('.')[-1] if '.' in filename else 'jpg'
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    path = f"{user_id}/{product_id}/{unique_filename}"

    try:
        # Upload to storage
        result = supabase_admin.storage.from_("product-images").upload(
            path=path,
            file=file,
            file_options={"content-type": content_type}
        )

        # Get public URL
        public_url = supabase_admin.storage.from_("product-images").get_public_url(path)
        return public_url
    except Exception as e:
        print(f"Error uploading product image: {e}")
        raise


def upload_avatar(user_id: int, file: BinaryIO, filename: str, content_type: str) -> str:
    """
    Upload user avatar to Supabase Storage
    Returns: Public URL of uploaded avatar
    """
    if not supabase_admin:
        raise Exception("Supabase admin client not initialized")

    ext = filename.split('.')[-1] if '.' in filename else 'jpg'
    path = f"{user_id}/avatar.{ext}"

    try:
        # Delete old avatar if exists
        try:
            supabase_admin.storage.from_("avatars").remove([path])
        except:
            pass

        # Upload new avatar
        result = supabase_admin.storage.from_("avatars").upload(
            path=path,
            file=file,
            file_options={"content-type": content_type, "upsert": "true"}
        )

        # Get public URL
        public_url = supabase_admin.storage.from_("avatars").get_public_url(path)
        return public_url
    except Exception as e:
        print(f"Error uploading avatar: {e}")
        raise


def upload_verification_video(user_id: int, transaction_id: int, file: BinaryIO, filename: str, content_type: str) -> str:
    """
    Upload verification video to Supabase Storage (private bucket)
    Returns: Path to video (not public URL, requires signed URL)
    """
    if not supabase_admin:
        raise Exception("Supabase admin client not initialized")

    ext = filename.split('.')[-1] if '.' in filename else 'mp4'
    path = f"{user_id}/{transaction_id}/verification.{ext}"

    try:
        # Upload to private storage
        result = supabase_admin.storage.from_("verification-videos").upload(
            path=path,
            file=file,
            file_options={"content-type": content_type, "upsert": "true"}
        )

        return path
    except Exception as e:
        print(f"Error uploading verification video: {e}")
        raise


def get_verification_video_signed_url(path: str, expires_in: int = 3600) -> str:
    """
    Get signed URL for private verification video
    expires_in: seconds until URL expires (default 1 hour)
    """
    if not supabase_admin:
        raise Exception("Supabase admin client not initialized")

    try:
        signed_url = supabase_admin.storage.from_("verification-videos").create_signed_url(
            path=path,
            expires_in=expires_in
        )
        return signed_url['signedURL']
    except Exception as e:
        print(f"Error creating signed URL: {e}")
        raise


def upload_forum_image(user_id: int, post_id: int, file: BinaryIO, filename: str, content_type: str) -> str:
    """
    Upload forum image to Supabase Storage
    Returns: Public URL of uploaded image
    """
    if not supabase_admin:
        raise Exception("Supabase admin client not initialized")

    ext = filename.split('.')[-1] if '.' in filename else 'jpg'
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    path = f"{user_id}/{post_id}/{unique_filename}"

    try:
        result = supabase_admin.storage.from_("forum-images").upload(
            path=path,
            file=file,
            file_options={"content-type": content_type}
        )

        public_url = supabase_admin.storage.from_("forum-images").get_public_url(path)
        return public_url
    except Exception as e:
        print(f"Error uploading forum image: {e}")
        raise


def delete_product_images(user_id: int, product_id: int):
    """
    Delete all images for a product
    """
    if not supabase_admin:
        raise Exception("Supabase admin client not initialized")

    try:
        # List all files in product folder
        files = supabase_admin.storage.from_("product-images").list(f"{user_id}/{product_id}")

        # Delete all files
        if files:
            paths = [f"{user_id}/{product_id}/{file['name']}" for file in files]
            supabase_admin.storage.from_("product-images").remove(paths)
    except Exception as e:
        print(f"Error deleting product images: {e}")
        # Don't raise, just log


def delete_avatar(user_id: int):
    """
    Delete user avatar
    """
    if not supabase_admin:
        raise Exception("Supabase admin client not initialized")

    try:
        # Try to delete common extensions
        for ext in ['jpg', 'jpeg', 'png', 'webp']:
            try:
                supabase_admin.storage.from_("avatars").remove([f"{user_id}/avatar.{ext}"])
            except:
                pass
    except Exception as e:
        print(f"Error deleting avatar: {e}")


# ============================================
# DATABASE HELPER FUNCTIONS
# ============================================

def get_supabase_connection_string() -> str:
    """
    Get PostgreSQL connection string for SQLAlchemy
    Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres

    Uses Supabase Connection Pooler (Transaction Mode) which supports IPv4
    """
    from urllib.parse import quote_plus

    if not SUPABASE_URL:
        raise Exception("SUPABASE_URL not configured")

    # Extract project ref from Supabase URL
    # https://kpozlrvizpuekiteiece.supabase.co -> kpozlrvizpuekiteiece
    project_ref = SUPABASE_URL.replace("https://", "").replace("http://", "").split(".")[0]

    # Use custom DB host if provided (for pooler), otherwise use direct connection
    # Pooler format: aws-1-us-east-1.pooler.supabase.com (Transaction Mode port 6543)
    # Direct format: db.{project}.supabase.co (port 5432)
    db_host = os.getenv("SUPABASE_DB_HOST", f"aws-1-us-east-1.pooler.supabase.com")
    db_port = int(os.getenv("SUPABASE_DB_PORT", "6543"))  # Transaction mode pooler
    db_name = "postgres"
    db_user = f"postgres.{project_ref}"  # Pooler requires postgres.{project_ref} format

    # Get database password from environment
    db_password = os.getenv("SUPABASE_DB_PASSWORD")
    if not db_password:
        raise Exception("SUPABASE_DB_PASSWORD not configured")

    # URL encode password to handle special characters (@, #, etc)
    db_password_encoded = quote_plus(db_password)

    connection_string = f"postgresql://{db_user}:{db_password_encoded}@{db_host}:{db_port}/{db_name}"
    return connection_string


# ============================================
# AUTH HELPER FUNCTIONS
# ============================================

def verify_supabase_jwt(token: str) -> dict:
    """
    Verify Supabase JWT token
    Returns: User data if valid
    """
    if not supabase:
        raise Exception("Supabase client not initialized")

    try:
        # Get user from token
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        print(f"Error verifying JWT: {e}")
        raise


def create_supabase_user(email: str, password: str, metadata: dict = None) -> dict:
    """
    Create user in Supabase Auth
    Returns: User data
    """
    if not supabase_admin:
        raise Exception("Supabase admin client not initialized")

    try:
        user = supabase_admin.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,  # Auto-confirm email
            "user_metadata": metadata or {}
        })
        return user
    except Exception as e:
        print(f"Error creating Supabase user: {e}")
        raise


def update_supabase_user(user_id: str, metadata: dict) -> dict:
    """
    Update user metadata in Supabase Auth
    """
    if not supabase_admin:
        raise Exception("Supabase admin client not initialized")

    try:
        user = supabase_admin.auth.admin.update_user_by_id(
            user_id,
            {"user_metadata": metadata}
        )
        return user
    except Exception as e:
        print(f"Error updating Supabase user: {e}")
        raise


def delete_supabase_user(user_id: str):
    """
    Delete user from Supabase Auth
    """
    if not supabase_admin:
        raise Exception("Supabase admin client not initialized")

    try:
        supabase_admin.auth.admin.delete_user(user_id)
    except Exception as e:
        print(f"Error deleting Supabase user: {e}")
        raise
