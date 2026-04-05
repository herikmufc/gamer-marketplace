"""
Migration script to add Mercado Pago Marketplace fields to users table
Run this script once to update the database schema
"""

import sqlite3
from pathlib import Path

def run_migration():
    db_path = Path(__file__).parent / "gamer_marketplace.db"

    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        return False

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]

        migrations_needed = []

        if 'mp_access_token' not in columns:
            migrations_needed.append("ALTER TABLE users ADD COLUMN mp_access_token TEXT")

        if 'mp_refresh_token' not in columns:
            migrations_needed.append("ALTER TABLE users ADD COLUMN mp_refresh_token TEXT")

        if 'mp_user_id' not in columns:
            migrations_needed.append("ALTER TABLE users ADD COLUMN mp_user_id TEXT")

        if 'mp_public_key' not in columns:
            migrations_needed.append("ALTER TABLE users ADD COLUMN mp_public_key TEXT")

        if 'mp_connected_at' not in columns:
            migrations_needed.append("ALTER TABLE users ADD COLUMN mp_connected_at DATETIME")

        if not migrations_needed:
            print("✅ All Mercado Pago fields already exist. No migration needed.")
            return True

        # Execute migrations
        for migration_sql in migrations_needed:
            print(f"🔄 Running: {migration_sql}")
            cursor.execute(migration_sql)

        conn.commit()
        print(f"✅ Migration completed successfully! Added {len(migrations_needed)} new columns.")
        return True

    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        return False

    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Starting Mercado Pago Marketplace migration...")
    success = run_migration()
    exit(0 if success else 1)
