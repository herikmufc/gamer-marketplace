#!/usr/bin/env python3
"""
Test Supabase Connection
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

print("🔍 Testing Supabase Connection...\n")

# Check environment variables
print("📋 Environment Variables:")
print(f"   SUPABASE_URL: {'✅ Set' if os.getenv('SUPABASE_URL') else '❌ Not set'}")
print(f"   SUPABASE_ANON_KEY: {'✅ Set' if os.getenv('SUPABASE_ANON_KEY') else '❌ Not set'}")
print(f"   SUPABASE_SERVICE_KEY: {'✅ Set' if os.getenv('SUPABASE_SERVICE_KEY') else '❌ Not set'}")
print(f"   SUPABASE_DB_PASSWORD: {'✅ Set' if os.getenv('SUPABASE_DB_PASSWORD') else '❌ Not set'}")
print()

# Get connection string
try:
    from supabase_client import get_supabase_connection_string
    conn_string = get_supabase_connection_string()

    # Hide password in output
    safe_conn_string = conn_string.replace(os.getenv('SUPABASE_DB_PASSWORD', ''), '***PASSWORD***')
    print(f"📡 Connection String: {safe_conn_string}\n")

    # Test connection
    print("🔌 Connecting to PostgreSQL...")
    engine = create_engine(conn_string)

    with engine.connect() as connection:
        result = connection.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        print(f"✅ Connected successfully!")
        print(f"   PostgreSQL Version: {version[:50]}...\n")

        # Test tables
        print("📊 Checking tables...")
        result = connection.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = result.fetchall()

        if tables:
            print(f"   Found {len(tables)} tables:")
            for table in tables:
                print(f"      - {table[0]}")
        else:
            print("   ⚠️  No tables found! Run supabase_schema.sql first.")

        print()
        print("✅ All tests passed!")

except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Troubleshooting:")
    print("   1. Make sure SUPABASE_DB_PASSWORD is set in .env")
    print("   2. Verify the password is correct in Supabase Dashboard")
    print("   3. Check if supabase_schema.sql was executed")
