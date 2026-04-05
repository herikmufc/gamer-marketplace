"""
Migration script to add shipping and address fields
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
        # Check existing columns in users table
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [col[1] for col in cursor.fetchall()]

        # Check existing columns in transactions table
        cursor.execute("PRAGMA table_info(transactions)")
        transaction_columns = [col[1] for col in cursor.fetchall()]

        migrations_needed = []

        # User address fields
        user_address_fields = {
            'address_zipcode': 'ALTER TABLE users ADD COLUMN address_zipcode VARCHAR(10)',
            'address_street': 'ALTER TABLE users ADD COLUMN address_street VARCHAR(255)',
            'address_number': 'ALTER TABLE users ADD COLUMN address_number VARCHAR(20)',
            'address_complement': 'ALTER TABLE users ADD COLUMN address_complement VARCHAR(100)',
            'address_neighborhood': 'ALTER TABLE users ADD COLUMN address_neighborhood VARCHAR(100)',
            'address_city': 'ALTER TABLE users ADD COLUMN address_city VARCHAR(100)',
            'address_state': 'ALTER TABLE users ADD COLUMN address_state VARCHAR(2)',
        }

        for col_name, sql in user_address_fields.items():
            if col_name not in user_columns:
                migrations_needed.append(sql)

        # Transaction shipping fields
        transaction_shipping_fields = {
            'shipping_id': 'ALTER TABLE transactions ADD COLUMN shipping_id VARCHAR',
            'shipping_mode': 'ALTER TABLE transactions ADD COLUMN shipping_mode VARCHAR',
            'shipping_method': 'ALTER TABLE transactions ADD COLUMN shipping_method VARCHAR',
            'shipping_cost': 'ALTER TABLE transactions ADD COLUMN shipping_cost FLOAT',
            'shipping_carrier': 'ALTER TABLE transactions ADD COLUMN shipping_carrier VARCHAR',
            'shipping_estimated_delivery': 'ALTER TABLE transactions ADD COLUMN shipping_estimated_delivery DATETIME',
            'shipping_label_url': 'ALTER TABLE transactions ADD COLUMN shipping_label_url VARCHAR',
            'delivery_zipcode': 'ALTER TABLE transactions ADD COLUMN delivery_zipcode VARCHAR(10)',
            'delivery_street': 'ALTER TABLE transactions ADD COLUMN delivery_street VARCHAR(255)',
            'delivery_number': 'ALTER TABLE transactions ADD COLUMN delivery_number VARCHAR(20)',
            'delivery_complement': 'ALTER TABLE transactions ADD COLUMN delivery_complement VARCHAR(100)',
            'delivery_neighborhood': 'ALTER TABLE transactions ADD COLUMN delivery_neighborhood VARCHAR(100)',
            'delivery_city': 'ALTER TABLE transactions ADD COLUMN delivery_city VARCHAR(100)',
            'delivery_state': 'ALTER TABLE transactions ADD COLUMN delivery_state VARCHAR(2)',
        }

        for col_name, sql in transaction_shipping_fields.items():
            if col_name not in transaction_columns:
                migrations_needed.append(sql)

        if not migrations_needed:
            print("✅ All shipping fields already exist. No migration needed.")
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
    print("🚀 Starting shipping fields migration...")
    success = run_migration()
    exit(0 if success else 1)
