"""
API Gamer Marketplace com Supabase
Versão migrada para PostgreSQL + Supabase Storage
"""
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, or_, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import anthropic
from openai import OpenAI
import mercadopago
import os
import base64
import re
from io import BytesIO
from PIL import Image
import json
import cv2
import numpy as np
import tempfile
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

# Supabase Client
from supabase_client import (
    supabase, supabase_admin,
    upload_product_image, upload_avatar, upload_verification_video,
    upload_forum_image, delete_product_images, get_verification_video_signed_url,
    get_supabase_connection_string
)

# Environment Variables
from dotenv import load_dotenv
load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN = os.getenv("MERCADOPAGO_ACCESS_TOKEN")
MERCADOPAGO_PUBLIC_KEY = os.getenv("MERCADOPAGO_PUBLIC_KEY")
MERCADOPAGO_WEBHOOK_SECRET = os.getenv("MERCADOPAGO_WEBHOOK_SECRET")
PLATFORM_FEE_PERCENT = float(os.getenv("PLATFORM_FEE_PERCENT", 5.0))

# Database Setup - SUPABASE PostgreSQL
USE_SUPABASE = os.getenv("USE_SUPABASE", "true").lower() == "true"

if USE_SUPABASE:
    # Use Supabase PostgreSQL
    try:
        DATABASE_URL = get_supabase_connection_string()
        print(f"✅ Using Supabase PostgreSQL")
    except Exception as e:
        print(f"⚠️ Error getting Supabase connection: {e}")
        print(f"⚠️ Falling back to SQLite")
        DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gamer_marketplace_v2.db")
else:
    # Fallback to SQLite for local development
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gamer_marketplace_v2.db")
    print(f"⚠️ Using SQLite (local development mode)")

# Create engine (PostgreSQL doesn't need check_same_thread)
if "postgresql" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# AI Clients
claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Mercado Pago Client
mp_sdk = None
if MERCADOPAGO_ACCESS_TOKEN:
    mp_sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)

print(f"🚀 Backend initialized")
print(f"   - Database: {'Supabase PostgreSQL' if USE_SUPABASE else 'SQLite'}")
print(f"   - Storage: {'Supabase Storage' if USE_SUPABASE else 'Local (base64)'}")
print(f"   - Auth: {'JWT (compatible with Supabase)' if USE_SUPABASE else 'JWT'}")
