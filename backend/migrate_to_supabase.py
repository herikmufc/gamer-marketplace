#!/usr/bin/env python3
"""
Script de Migração SQLite → Supabase PostgreSQL
Migra dados e imagens para o Supabase
"""
import os
import sys
import json
import base64
from io import BytesIO
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Supabase client
from supabase_client import (
    supabase_admin,
    upload_product_image,
    get_supabase_connection_string
)

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log(message, color=Colors.OKBLUE):
    """Print colored log message"""
    print(f"{color}{message}{Colors.ENDC}")

def log_success(message):
    log(f"✅ {message}", Colors.OKGREEN)

def log_error(message):
    log(f"❌ {message}", Colors.FAIL)

def log_warning(message):
    log(f"⚠️  {message}", Colors.WARNING)

def log_info(message):
    log(f"ℹ️  {message}", Colors.OKCYAN)


class SupabaseMigration:
    def __init__(self):
        # Try to find SQLite database
        if os.path.exists("gamer_marketplace_v2.db"):
            self.sqlite_path = "gamer_marketplace_v2.db"
        elif os.path.exists("gamer_marketplace.db"):
            self.sqlite_path = "gamer_marketplace.db"
        else:
            self.sqlite_path = "gamer_marketplace.db"
        self.stats = {
            "users": {"total": 0, "migrated": 0, "errors": 0},
            "products": {"total": 0, "migrated": 0, "errors": 0},
            "images": {"total": 0, "migrated": 0, "errors": 0},
            "chat_rooms": {"total": 0, "migrated": 0, "errors": 0},
            "chat_messages": {"total": 0, "migrated": 0, "errors": 0},
            "forum_posts": {"total": 0, "migrated": 0, "errors": 0},
            "forum_comments": {"total": 0, "migrated": 0, "errors": 0},
            "transactions": {"total": 0, "migrated": 0, "errors": 0},
            "events": {"total": 0, "migrated": 0, "errors": 0},
        }

    def connect_sqlite(self):
        """Connect to SQLite database"""
        if not os.path.exists(self.sqlite_path):
            log_error(f"SQLite database not found: {self.sqlite_path}")
            sys.exit(1)

        log_info(f"Connecting to SQLite: {self.sqlite_path}")
        engine = create_engine(f"sqlite:///{self.sqlite_path}")
        Session = sessionmaker(bind=engine)
        return Session()

    def connect_postgres(self):
        """Connect to Supabase PostgreSQL"""
        try:
            conn_string = get_supabase_connection_string()
            log_info(f"Connecting to Supabase PostgreSQL...")
            engine = create_engine(conn_string)
            Session = sessionmaker(bind=engine)
            return Session()
        except Exception as e:
            log_error(f"Error connecting to PostgreSQL: {e}")
            log_warning("Make sure SUPABASE_DB_PASSWORD is set in .env")
            sys.exit(1)

    def migrate_users(self, sqlite_session, pg_session):
        """Migrate users table"""
        log_info("Migrating users...")

        try:
            # Get users from SQLite
            result = sqlite_session.execute(text("SELECT * FROM users"))
            users = result.fetchall()
            self.stats["users"]["total"] = len(users)

            for user in users:
                try:
                    # Insert into PostgreSQL
                    pg_session.execute(text("""
                        INSERT INTO users (
                            id, email, username, cpf, phone, hashed_password,
                            full_name, created_at, is_active, is_technician,
                            reputation_score, terms_accepted_at, terms_version
                        ) VALUES (
                            :id, :email, :username, :cpf, :phone, :hashed_password,
                            :full_name, :created_at, :is_active, :is_technician,
                            :reputation_score, :terms_accepted_at, :terms_version
                        ) ON CONFLICT (id) DO UPDATE SET
                            email = EXCLUDED.email,
                            username = EXCLUDED.username
                    """), {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                        "cpf": user.cpf if hasattr(user, 'cpf') else None,
                        "phone": user.phone if hasattr(user, 'phone') else None,
                        "hashed_password": user.hashed_password,
                        "full_name": user.full_name,
                        "created_at": user.created_at,
                        "is_active": bool(user.is_active),  # Convert to boolean
                        "is_technician": bool(user.is_technician) if hasattr(user, 'is_technician') else False,
                        "reputation_score": user.reputation_score if hasattr(user, 'reputation_score') else 0,
                        "terms_accepted_at": user.terms_accepted_at if hasattr(user, 'terms_accepted_at') else None,
                        "terms_version": user.terms_version if hasattr(user, 'terms_version') else "1.0.0"
                    })
                    self.stats["users"]["migrated"] += 1
                except Exception as e:
                    self.stats["users"]["errors"] += 1
                    log_warning(f"Error migrating user {user.id}: {e}")
                    pg_session.rollback()  # Rollback this transaction

            pg_session.commit()
            log_success(f"Users: {self.stats['users']['migrated']}/{self.stats['users']['total']} migrated")

        except Exception as e:
            log_error(f"Error in user migration: {e}")
            pg_session.rollback()

    def migrate_products(self, sqlite_session, pg_session):
        """Migrate products table"""
        log_info("Migrating products...")

        try:
            result = sqlite_session.execute(text("SELECT * FROM products"))
            products = result.fetchall()
            self.stats["products"]["total"] = len(products)

            for product in products:
                try:
                    # Parse images (stored as JSON string in SQLite)
                    images_json = product.images if product.images else "[]"

                    # Insert into PostgreSQL
                    pg_session.execute(text("""
                        INSERT INTO products (
                            id, title, description, category, console_type,
                            condition_score, rarity_score, price_min, price_ideal,
                            price_max, final_price, is_working, is_complete,
                            has_box, has_manual, images, ai_analysis, owner_id,
                            created_at, updated_at, is_sold, views_count
                        ) VALUES (
                            :id, :title, :description, :category, :console_type,
                            :condition_score, :rarity_score, :price_min, :price_ideal,
                            :price_max, :final_price, :is_working, :is_complete,
                            :has_box, :has_manual, :images, :ai_analysis, :owner_id,
                            :created_at, :updated_at, :is_sold, :views_count
                        ) ON CONFLICT (id) DO UPDATE SET
                            title = EXCLUDED.title,
                            description = EXCLUDED.description
                    """), {
                        "id": product.id,
                        "title": product.title,
                        "description": product.description,
                        "category": product.category,
                        "console_type": product.console_type,
                        "condition_score": product.condition_score,
                        "rarity_score": product.rarity_score,
                        "price_min": product.price_min,
                        "price_ideal": product.price_ideal,
                        "price_max": product.price_max,
                        "final_price": product.final_price,
                        "is_working": bool(product.is_working),
                        "is_complete": bool(product.is_complete),
                        "has_box": bool(product.has_box),
                        "has_manual": bool(product.has_manual),
                        "images": images_json,
                        "ai_analysis": product.ai_analysis,
                        "owner_id": product.owner_id,
                        "created_at": product.created_at,
                        "updated_at": product.updated_at,
                        "is_sold": bool(product.is_sold) if hasattr(product, 'is_sold') else False,
                        "views_count": product.views_count if hasattr(product, 'views_count') else 0
                    })
                    self.stats["products"]["migrated"] += 1

                    # Migrate images to Supabase Storage
                    if product.images:
                        try:
                            images_list = json.loads(product.images)
                            self.migrate_product_images(product.id, product.owner_id, images_list, pg_session)
                        except:
                            pass

                except Exception as e:
                    self.stats["products"]["errors"] += 1
                    log_warning(f"Error migrating product {product.id}: {e}")

            pg_session.commit()
            log_success(f"Products: {self.stats['products']['migrated']}/{self.stats['products']['total']} migrated")

        except Exception as e:
            log_error(f"Error in product migration: {e}")
            pg_session.rollback()

    def migrate_product_images(self, product_id, owner_id, images_list, pg_session):
        """Migrate product images from base64 to Supabase Storage"""
        if not supabase_admin:
            log_warning("Supabase admin client not available, skipping image migration")
            return

        new_image_urls = []

        for idx, image_data in enumerate(images_list):
            try:
                self.stats["images"]["total"] += 1

                # Check if it's already a URL
                if isinstance(image_data, str) and image_data.startswith('http'):
                    new_image_urls.append(image_data)
                    self.stats["images"]["migrated"] += 1
                    continue

                # Decode base64 image
                if isinstance(image_data, str):
                    # Remove data:image/jpeg;base64, prefix if present
                    if 'base64,' in image_data:
                        image_data = image_data.split('base64,')[1]

                    image_bytes = base64.b64decode(image_data)
                    image_file = BytesIO(image_bytes)

                    # Upload to Supabase Storage
                    filename = f"image_{idx}.jpg"
                    public_url = upload_product_image(
                        user_id=owner_id,
                        product_id=product_id,
                        file=image_file,
                        filename=filename,
                        content_type="image/jpeg"
                    )

                    new_image_urls.append(public_url)
                    self.stats["images"]["migrated"] += 1
                    log_success(f"   Uploaded image {idx + 1} for product {product_id}")

            except Exception as e:
                self.stats["images"]["errors"] += 1
                log_warning(f"   Error uploading image {idx} for product {product_id}: {e}")

        # Update product with new image URLs
        if new_image_urls:
            try:
                pg_session.execute(text("""
                    UPDATE products SET images = :images WHERE id = :id
                """), {
                    "images": json.dumps(new_image_urls),
                    "id": product_id
                })
                pg_session.commit()
            except Exception as e:
                log_warning(f"Error updating product images: {e}")

    def run(self):
        """Run the migration"""
        log(f"\n{'='*60}", Colors.HEADER)
        log(f"🚀 SUPABASE MIGRATION TOOL", Colors.HEADER)
        log(f"{'='*60}\n", Colors.HEADER)

        # Connect to databases
        sqlite_session = self.connect_sqlite()
        pg_session = self.connect_postgres()

        # Run migrations
        self.migrate_users(sqlite_session, pg_session)
        self.migrate_products(sqlite_session, pg_session)

        # Close connections
        sqlite_session.close()
        pg_session.close()

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print migration summary"""
        log(f"\n{'='*60}", Colors.HEADER)
        log(f"📊 MIGRATION SUMMARY", Colors.HEADER)
        log(f"{'='*60}\n", Colors.HEADER)

        for table, stats in self.stats.items():
            if stats["total"] > 0:
                success_rate = (stats["migrated"] / stats["total"]) * 100 if stats["total"] > 0 else 0
                color = Colors.OKGREEN if success_rate == 100 else Colors.WARNING

                log(f"{table.upper()}:", Colors.BOLD)
                log(f"  Total: {stats['total']}", color)
                log(f"  Migrated: {stats['migrated']}", color)
                log(f"  Errors: {stats['errors']}", color)
                log(f"  Success Rate: {success_rate:.1f}%\n", color)

        total_migrated = sum(s["migrated"] for s in self.stats.values())
        total_errors = sum(s["errors"] for s in self.stats.values())

        if total_errors == 0:
            log_success(f"\n🎉 Migration completed successfully! ({total_migrated} records)")
        else:
            log_warning(f"\n⚠️  Migration completed with {total_errors} errors")

        log(f"\n{'='*60}\n", Colors.HEADER)


if __name__ == "__main__":
    print("\n")
    log("⚠️  IMPORTANT: Make sure you have:", Colors.WARNING)
    log("   1. Executed supabase_schema.sql in Supabase", Colors.WARNING)
    log("   2. Created all storage buckets", Colors.WARNING)
    log("   3. Set SUPABASE_DB_PASSWORD in .env", Colors.WARNING)
    print("\n")

    response = input("Continue with migration? (yes/no): ")
    if response.lower() != 'yes':
        log("Migration cancelled", Colors.WARNING)
        sys.exit(0)

    migration = SupabaseMigration()
    migration.run()
