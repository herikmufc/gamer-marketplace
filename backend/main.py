"""
API Estendida com Chat, Fórum, CPF e Termos Legais
Execute este arquivo em vez de main.py
"""
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Form
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import requests
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, or_, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import mercadopago
import gemini_client
from maintenance_assistant import maintenance_assistant
import supabase_client
from mercado_envios_client import MercadoEnviosClient
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

# Environment Variables
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN = os.getenv("MERCADOPAGO_ACCESS_TOKEN")
MERCADOPAGO_PUBLIC_KEY = os.getenv("MERCADOPAGO_PUBLIC_KEY")
MERCADOPAGO_WEBHOOK_SECRET = os.getenv("MERCADOPAGO_WEBHOOK_SECRET")
PLATFORM_FEE_PERCENT = float(os.getenv("PLATFORM_FEE_PERCENT", 5.0))

# Mercado Pago Marketplace OAuth
MERCADOPAGO_APP_ID = os.getenv("MERCADOPAGO_APP_ID")
MERCADOPAGO_CLIENT_SECRET = os.getenv("MERCADOPAGO_CLIENT_SECRET")
MERCADOPAGO_REDIRECT_URI = os.getenv("MERCADOPAGO_REDIRECT_URI")
PLATFORM_COMMISSION_PERCENT = float(os.getenv("PLATFORM_COMMISSION_PERCENT", 5.0))

# Database Setup - Support both SQLite and Supabase PostgreSQL
USE_SUPABASE = os.getenv("USE_SUPABASE", "false").lower() == "true"

if USE_SUPABASE:
    # Use Supabase PostgreSQL
    try:
        from supabase_client import get_supabase_connection_string
        DATABASE_URL = get_supabase_connection_string()
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        print("✅ Using Supabase PostgreSQL")
    except Exception as e:
        print(f"⚠️ Error connecting to Supabase: {e}")
        print("⚠️ Falling back to SQLite")
        DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gamer_marketplace_v2.db")
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Use SQLite (local development)
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gamer_marketplace_v2.db")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print("⚠️ Using SQLite (local development)")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Mercado Pago Client
mp_sdk = None
print(f"🔍 [MERCADOPAGO] Inicializando SDK...")
print(f"🔍 [MERCADOPAGO] ACCESS_TOKEN presente? {bool(MERCADOPAGO_ACCESS_TOKEN)}")
print(f"🔍 [MERCADOPAGO] ACCESS_TOKEN primeiros 20 caracteres: {MERCADOPAGO_ACCESS_TOKEN[:20] if MERCADOPAGO_ACCESS_TOKEN else 'NENHUM'}")

if MERCADOPAGO_ACCESS_TOKEN:
    try:
        mp_sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)
        print(f"✅ [MERCADOPAGO] SDK inicializado com sucesso!")
    except Exception as e:
        print(f"❌ [MERCADOPAGO] Erro ao inicializar SDK: {e}")
        mp_sdk = None
else:
    print(f"❌ [MERCADOPAGO] ACCESS_TOKEN não configurado!")

# ============================================
# DATABASE MODELS
# ============================================

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    cpf = Column(String(14), unique=True, index=True)  # NOVO: CPF obrigatório
    phone = Column(String(15))  # NOVO: Telefone
    hashed_password = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_technician = Column(Boolean, default=False)
    reputation_score = Column(Integer, default=0)
    terms_accepted_at = Column(DateTime)  # NOVO: Quando aceitou termos
    terms_version = Column(String, default="1.0.0")  # NOVO: Versão dos termos

    # Mercado Pago Marketplace OAuth
    mp_access_token = Column(String, nullable=True)  # Token de acesso do vendedor
    mp_refresh_token = Column(String, nullable=True)  # Token para renovar acesso
    mp_user_id = Column(String, nullable=True)  # ID do usuário no Mercado Pago
    mp_public_key = Column(String, nullable=True)  # Public key do vendedor
    mp_connected_at = Column(DateTime, nullable=True)  # Quando conectou a conta MP

    # Endereço para entrega (Mercado Envios)
    address_zipcode = Column(String(10), nullable=True)  # CEP
    address_street = Column(String(255), nullable=True)  # Rua/Avenida
    address_number = Column(String(20), nullable=True)  # Número
    address_complement = Column(String(100), nullable=True)  # Complemento/Apto
    address_neighborhood = Column(String(100), nullable=True)  # Bairro
    address_city = Column(String(100), nullable=True)  # Cidade
    address_state = Column(String(2), nullable=True)  # UF (SP, RJ, etc)

    products = relationship("Product", back_populates="owner")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String)
    console_type = Column(String)
    condition_score = Column(Float)
    rarity_score = Column(Float)
    price_min = Column(Float)
    price_ideal = Column(Float)
    price_max = Column(Float)
    final_price = Column(Float)
    is_working = Column(Boolean, default=True)
    is_complete = Column(Boolean, default=False)
    has_box = Column(Boolean, default=False)
    has_manual = Column(Boolean, default=False)
    images = Column(Text)
    ai_analysis = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_sold = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)

    owner = relationship("User", back_populates="products")

# NOVO: Chat
class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    seller_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    product = relationship("Product")
    messages = relationship("ChatMessage", back_populates="room")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    message_type = Column(String)  # text, image, video
    content = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("ChatRoom", back_populates="messages")

# NOVO: Fórum
class ForumPost(Base):
    __tablename__ = "forum_posts"
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String)
    title = Column(String, index=True)
    content = Column(Text)
    images = Column(Text)
    likes_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    comments = relationship("ForumComment", back_populates="post")

class ForumComment(Base):
    __tablename__ = "forum_comments"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    parent_comment_id = Column(Integer, ForeignKey("forum_comments.id"), nullable=True)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("ForumPost", back_populates="comments")

# NOVO: Moderação de Chat com IA
class ChatAlert(Base):
    __tablename__ = "chat_alerts"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"))
    message_id = Column(Integer, ForeignKey("chat_messages.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    alert_type = Column(String)  # fraud_attempt, payment_outside, abuse, phishing, contact_info
    risk_score = Column(Integer)  # 0-100
    description = Column(Text)
    detected_patterns = Column(Text)  # JSON com padrões detectados
    is_resolved = Column(Boolean, default=False)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# NOVO: Eventos de Jogos Retro
class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    event_type = Column(String)  # feira, encontro, campeonato, exposicao
    state = Column(String, index=True)  # SP, RJ, MG, etc
    city = Column(String, index=True)
    address = Column(Text, nullable=True)
    start_date = Column(DateTime, index=True)
    end_date = Column(DateTime, nullable=True)
    organizer = Column(String, nullable=True)
    contact_info = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    source_url = Column(String, nullable=True)  # De onde a IA encontrou
    is_verified = Column(Boolean, default=False)  # Verificado por admin
    is_active = Column(Boolean, default=True)
    interest_count = Column(Integer, default=0)
    created_by = Column(String, default="ai")  # ai ou user_id
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# NOVO: Interesse em Eventos
class EventInterest(Base):
    __tablename__ = "event_interests"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

# NOVO: Sistema de Pagamento com Escrow
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)

    # Relacionamentos
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Mercado Pago
    payment_id = Column(String, unique=True, index=True)  # ID do pagamento no MP (renomeado de mp_payment_id)
    payment_method = Column(String)  # Método de pagamento usado
    mp_preference_id = Column(String)  # ID da preferência de pagamento
    mp_status = Column(String)  # pending, approved, rejected, cancelled

    # Valores
    amount = Column(Float, nullable=False)  # Valor da transação
    mp_fee = Column(Float, default=0)  # Taxa do Mercado Pago
    platform_fee = Column(Float, default=0)  # Nossa taxa (ex: 5%)
    seller_amount = Column(Float)  # Valor que vai para o vendedor

    # Status do Escrow
    status = Column(String, default="pending")
    # pending → aguardando pagamento
    # paid → pago, aguardando envio
    # shipped → enviado, aguardando confirmação
    # video_uploaded → vídeo enviado, aguardando análise IA
    # verified → IA aprovou, liberando pagamento
    # released → pagamento liberado para vendedor
    # disputed → comprador abriu reclamação
    # refunded → estornado para comprador
    # auto_released → liberado automaticamente após 3 dias

    # Verificação por Vídeo
    verification_video_url = Column(String, nullable=True)  # URL do vídeo no S3/storage
    verification_video_uploaded_at = Column(DateTime, nullable=True)
    ai_verification_result = Column(Text, nullable=True)  # JSON com análise da IA
    ai_verification_score = Column(Integer, nullable=True)  # 0-100
    ai_verified_at = Column(DateTime, nullable=True)

    # Auto-liberação
    auto_release_date = Column(DateTime, nullable=True)  # Data de auto-liberação (3 dias úteis)
    released_at = Column(DateTime, nullable=True)
    release_type = Column(String, nullable=True)  # manual, auto, ai_verified

    # Tracking
    tracking_code = Column(String, nullable=True)  # Código de rastreio dos Correios
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)

    # Mercado Envios (Shipping)
    shipping_id = Column(String, nullable=True)  # ID do envio no Mercado Envios
    shipping_mode = Column(String, nullable=True)  # me2 (Mercado Envios)
    shipping_method = Column(String, nullable=True)  # standard, express, etc
    shipping_cost = Column(Float, nullable=True)  # Custo do frete
    shipping_carrier = Column(String, nullable=True)  # Transportadora (Correios, etc)
    shipping_estimated_delivery = Column(DateTime, nullable=True)  # Previsão de entrega
    shipping_label_url = Column(String, nullable=True)  # URL da etiqueta de envio

    # Endereço de entrega (snapshot do momento da compra)
    delivery_zipcode = Column(String(10), nullable=True)
    delivery_street = Column(String(255), nullable=True)
    delivery_number = Column(String(20), nullable=True)
    delivery_complement = Column(String(100), nullable=True)
    delivery_neighborhood = Column(String(100), nullable=True)
    delivery_city = Column(String(100), nullable=True)
    delivery_state = Column(String(2), nullable=True)

    # Reclamações
    dispute_reason = Column(Text, nullable=True)
    dispute_opened_at = Column(DateTime, nullable=True)
    dispute_resolved_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = relationship("Product")

# Create tables
Base.metadata.create_all(bind=engine)

# ============================================
# PYDANTIC MODELS
# ============================================

def validate_cpf(cpf: str) -> bool:
    """Valida CPF brasileiro"""
    cpf = re.sub(r'\D', '', cpf)  # Remove pontos e traços
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False

    # Validação dos dígitos verificadores
    for i in range(9, 11):
        value = sum((int(cpf[num]) * ((i+1) - num) for num in range(0, i)))
        digit = ((value * 10) % 11) % 10
        if digit != int(cpf[i]):
            return False
    return True

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    cpf: str  # NOVO: Obrigatório
    phone: Optional[str]
    # Endereço obrigatório para cálculo de frete
    address_zipcode: str
    address_street: str
    address_number: str
    address_complement: Optional[str] = None
    address_neighborhood: str
    address_city: str
    address_state: str

class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    email: str
    username: str
    full_name: str
    cpf: str  # Mascarado: 123.456.789-**
    reputation_score: int
    is_technician: bool
    created_at: datetime
    # Mercado Pago Marketplace
    mp_user_id: Optional[str] = None
    mp_connected_at: Optional[datetime] = None

class ChatMessageCreate(BaseModel):
    content: str
    message_type: str = "text"

class ChatMessageResponse(BaseModel):
    id: int
    sender_id: int
    content: str
    message_type: str
    is_read: bool
    created_at: datetime

class ForumPostCreate(BaseModel):
    category: str
    title: str
    content: str

class ForumPostResponse(BaseModel):
    id: int
    author_id: int
    category: str
    title: str
    content: str
    likes_count: int
    views_count: int
    comments_count: int
    created_at: datetime

class ForumCommentCreate(BaseModel):
    content: str
    parent_comment_id: Optional[int] = None

class ProductResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    title: str
    description: str
    category: str
    console_type: str
    condition_score: Optional[float]
    rarity_score: Optional[float]
    price_min: Optional[float]
    price_ideal: Optional[float]
    price_max: Optional[float]
    final_price: Optional[float]
    is_working: bool
    is_complete: bool
    has_box: bool
    has_manual: bool
    images: Optional[str]
    ai_analysis: Optional[str]
    owner: UserResponse
    created_at: datetime
    is_sold: bool
    views_count: int = 0

class PriceAnalysisResponse(BaseModel):
    condition_score: float
    rarity_score: float
    price_suggestion: dict
    insights: List[str]

# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(title="RetroTrade Brasil API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth Functions (copiadas do main.py original)
def verify_password(plain_password, hashed_password):
    # Bcrypt has a 72 byte limit, truncate if needed
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Bcrypt has a 72 byte limit, truncate if needed
    if isinstance(password, str):
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def mask_cpf(cpf: Optional[str]) -> str:
    """Mascara CPF: 123.456.789-**"""
    if not cpf:
        return "***.***.***-**"
    cpf_clean = re.sub(r'\D', '', cpf)
    if len(cpf_clean) < 11:
        return "***.***.***-**"
    return f"{cpf_clean[:3]}.{cpf_clean[3:6]}.{cpf_clean[6:9]}-**"

# ============================================
# PRODUCT HELPER FUNCTIONS
# ============================================

def calculate_rarity_score(product_info: dict) -> float:
    """Calculate rarity score based on product metadata"""
    score = 50.0  # Base score

    # Adjust based on console type (simplified)
    rare_consoles = ["dreamcast", "saturn", "neo geo", "turbografx", "atari jaguar", "3do"]
    console = product_info.get('console_type', '').lower()
    if any(rare in console for rare in rare_consoles):
        score += 30

    # Adjust for completeness
    if product_info.get('is_complete'):
        score += 15
    if product_info.get('has_box'):
        score += 10
    if product_info.get('has_manual'):
        score += 5

    return min(score, 100.0)

def calculate_price_suggestion(condition_score: float, rarity_score: float, product_info: dict) -> dict:
    """Calculate price suggestion based on scores"""
    # Base price by category (Brazilian market averages)
    base_prices = {
        "game": 80.0,
        "console": 350.0,
        "peripheral": 120.0
    }

    base_price = base_prices.get(product_info.get('category', 'game'), 100.0)

    # Adjust by condition (40% weight)
    condition_multiplier = 0.6 + (condition_score / 100) * 0.8  # 0.6x to 1.4x

    # Adjust by rarity (30% weight)
    rarity_multiplier = 0.8 + (rarity_score / 100) * 0.6  # 0.8x to 1.4x

    # Adjust by completeness (30% weight)
    completeness_bonus = 1.0
    if product_info.get('has_box'):
        completeness_bonus += 0.25
    if product_info.get('has_manual'):
        completeness_bonus += 0.15
    if product_info.get('is_complete'):
        completeness_bonus += 0.20

    # Calculate final prices
    ideal_price = base_price * condition_multiplier * rarity_multiplier * completeness_bonus
    min_price = ideal_price * 0.85
    max_price = ideal_price * 1.20

    return {
        "min": round(min_price, 2),
        "ideal": round(ideal_price, 2),
        "max": round(max_price, 2)
    }

# ============================================
# ENDPOINTS - AUTH
# ============================================

@app.get("/")
def root():
    return {"message": "RetroTrade Brasil API v2.0", "features": ["Chat", "Forum", "CPF", "Legal Terms"]}

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        print(f"📝 [REGISTER] Tentativa de registro: {user.username}")

        # Validar CPF
        if not validate_cpf(user.cpf):
            print(f"❌ [REGISTER] CPF inválido: {user.cpf}")
            raise HTTPException(status_code=400, detail="CPF inválido")

        # Verificar se CPF já existe
        if db.query(User).filter(User.cpf == user.cpf).first():
            print(f"❌ [REGISTER] CPF já cadastrado: {user.cpf}")
            raise HTTPException(status_code=400, detail="CPF já cadastrado")

        # Verificar email/username
        if db.query(User).filter(User.email == user.email).first():
            print(f"❌ [REGISTER] Email já cadastrado: {user.email}")
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        if db.query(User).filter(User.username == user.username).first():
            print(f"❌ [REGISTER] Username já cadastrado: {user.username}")
            raise HTTPException(status_code=400, detail="Username já cadastrado")

        # Criar usuário
        db_user = User(
            email=user.email,
            username=user.username,
            cpf=user.cpf,
            phone=user.phone,
            hashed_password=get_password_hash(user.password),
            full_name=user.full_name,
            terms_accepted_at=datetime.utcnow(),  # Aceite de termos
            terms_version="1.0.0",
            # Endereço para cálculo de frete
            address_zipcode=user.address_zipcode,
            address_street=user.address_street,
            address_number=user.address_number,
            address_complement=user.address_complement,
            address_neighborhood=user.address_neighborhood,
            address_city=user.address_city,
            address_state=user.address_state,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        print(f"✅ [REGISTER] Usuário criado com sucesso: {db_user.username} (ID: {db_user.id})")

        # Mascarar CPF na resposta
        response = UserResponse.model_validate(db_user)
        response.cpf = mask_cpf(db_user.cpf)
        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [REGISTER] Erro inesperado: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar usuário: {str(e)}")

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        print(f"🔐 [LOGIN] Tentativa de login: {form_data.username}")

        user = db.query(User).filter(User.username == form_data.username).first()

        if not user:
            print(f"❌ [LOGIN] Usuário não encontrado: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário ou senha incorretos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not verify_password(form_data.password, user.hashed_password):
            print(f"❌ [LOGIN] Senha incorreta para: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário ou senha incorretos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )

        print(f"✅ [LOGIN] Login bem-sucedido: {user.username}")
        print(f"✅ [LOGIN] Token gerado: {access_token[:20]}...")

        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [LOGIN] Erro inesperado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno no servidor"
        )

@app.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retorna dados do usuário autenticado"""
    response = UserResponse.model_validate(current_user)
    response.cpf = mask_cpf(current_user.cpf)
    return response

# ============================================
# ENDPOINTS - MERCADO PAGO MARKETPLACE OAUTH
# ============================================

@app.get("/auth/mercadopago/connect")
async def mercadopago_connect(current_user: User = Depends(get_current_user)):
    """
    Inicia o fluxo OAuth do Mercado Pago
    Redireciona o usuário para autorizar a aplicação
    """
    if not MERCADOPAGO_APP_ID or not MERCADOPAGO_REDIRECT_URI:
        raise HTTPException(
            status_code=500,
            detail="Mercado Pago OAuth não configurado. Configure MERCADOPAGO_APP_ID e MERCADOPAGO_REDIRECT_URI"
        )

    # URL de autorização do Mercado Pago
    authorization_url = (
        f"https://auth.mercadopago.com.br/authorization?"
        f"client_id={MERCADOPAGO_APP_ID}&"
        f"response_type=code&"
        f"platform_id=mp&"
        f"state={current_user.id}&"  # Usar user ID como state para identificar depois
        f"redirect_uri={MERCADOPAGO_REDIRECT_URI}"
    )

    return {
        "authorization_url": authorization_url,
        "message": "Redirecione o usuário para esta URL para autorizar"
    }

@app.get("/auth/mercadopago/callback")
async def mercadopago_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """
    Callback do OAuth - recebe o código de autorização e troca por access_token
    """
    try:
        print(f"📱 [MP OAUTH] Callback recebido - Code: {code[:20]}..., State (user_id): {state}")

        if not MERCADOPAGO_APP_ID or not MERCADOPAGO_CLIENT_SECRET or not MERCADOPAGO_REDIRECT_URI:
            raise HTTPException(
                status_code=500,
                detail="Mercado Pago OAuth não configurado completamente"
            )

        # Buscar usuário pelo state (user_id)
        user = db.query(User).filter(User.id == int(state)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        # Trocar code por access_token
        token_url = "https://api.mercadopago.com/oauth/token"
        token_data = {
            "client_id": MERCADOPAGO_APP_ID,
            "client_secret": MERCADOPAGO_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": MERCADOPAGO_REDIRECT_URI
        }

        print(f"🔄 [MP OAUTH] Trocando código por token...")
        token_response = requests.post(token_url, json=token_data)

        if token_response.status_code != 200:
            print(f"❌ [MP OAUTH] Erro ao trocar código: {token_response.text}")
            raise HTTPException(
                status_code=400,
                detail=f"Erro ao obter token do Mercado Pago: {token_response.text}"
            )

        token_info = token_response.json()
        print(f"✅ [MP OAUTH] Token obtido com sucesso")

        # Salvar tokens no banco
        user.mp_access_token = token_info["access_token"]
        user.mp_refresh_token = token_info.get("refresh_token")
        user.mp_user_id = token_info.get("user_id")
        user.mp_public_key = token_info.get("public_key")
        user.mp_connected_at = datetime.utcnow()

        db.commit()
        db.refresh(user)

        print(f"✅ [MP OAUTH] Usuário {user.username} conectou conta MP (ID: {user.mp_user_id})")

        # Redirecionar para o app mobile com sucesso
        return RedirectResponse(
            url=f"retrotrade://oauth/callback?success=true&user_id={user.id}",
            status_code=302
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [MP OAUTH] Erro no callback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro no callback OAuth: {str(e)}")

@app.get("/auth/mercadopago/status")
async def mercadopago_status(current_user: User = Depends(get_current_user)):
    """Verifica se o usuário tem conta do Mercado Pago conectada"""
    return {
        "connected": bool(current_user.mp_access_token),
        "mp_user_id": current_user.mp_user_id,
        "connected_at": current_user.mp_connected_at,
        "can_receive_payments": bool(current_user.mp_access_token)
    }

@app.post("/auth/mercadopago/disconnect")
async def mercadopago_disconnect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Desconecta a conta do Mercado Pago"""
    current_user.mp_access_token = None
    current_user.mp_refresh_token = None
    current_user.mp_user_id = None
    current_user.mp_public_key = None
    current_user.mp_connected_at = None

    db.commit()

    return {"message": "Conta do Mercado Pago desconectada com sucesso"}

@app.post("/auth/mercadopago/manual-connect")
async def mercadopago_manual_connect(
    access_token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Conecta manualmente usando um access_token (para testes)
    Útil quando OAuth não está habilitado no painel do MP
    """
    try:
        # Validar token fazendo request ao MP
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get("https://api.mercadopago.com/users/me", headers=headers)

        if response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Token inválido: {response.text}"
            )

        user_info = response.json()

        # Salvar no banco
        current_user.mp_access_token = access_token
        current_user.mp_user_id = str(user_info.get("id"))
        current_user.mp_connected_at = datetime.utcnow()

        db.commit()
        db.refresh(current_user)

        return {
            "message": "Conectado com sucesso!",
            "mp_user_id": current_user.mp_user_id,
            "email": user_info.get("email")
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao conectar: {str(e)}"
        )

# ============================================
# ENDPOINTS - HEALTH CHECK
# ============================================

@app.get("/run-mp-migration")
def run_mp_migration():
    """
    TEMPORÁRIO: Executa migration do Mercado Pago Marketplace
    Acesse via: https://gamer-marketplace.onrender.com/run-mp-migration
    """
    try:
        from sqlalchemy import text, inspect

        # Usar o engine já configurado (funciona com SQLite e PostgreSQL)
        inspector = inspect(engine)
        existing_columns = [col['name'] for col in inspector.get_columns('users')]

        migrations_needed = []
        migrations_executed = []

        # Definir colunas e SQL apropriado para cada tipo de banco
        if USE_SUPABASE or 'postgresql' in str(engine.url):
            # PostgreSQL
            new_columns = {
                'mp_access_token': 'ALTER TABLE users ADD COLUMN mp_access_token VARCHAR',
                'mp_refresh_token': 'ALTER TABLE users ADD COLUMN mp_refresh_token VARCHAR',
                'mp_user_id': 'ALTER TABLE users ADD COLUMN mp_user_id VARCHAR',
                'mp_public_key': 'ALTER TABLE users ADD COLUMN mp_public_key VARCHAR',
                'mp_connected_at': 'ALTER TABLE users ADD COLUMN mp_connected_at TIMESTAMP'
            }
        else:
            # SQLite
            new_columns = {
                'mp_access_token': 'ALTER TABLE users ADD COLUMN mp_access_token TEXT',
                'mp_refresh_token': 'ALTER TABLE users ADD COLUMN mp_refresh_token TEXT',
                'mp_user_id': 'ALTER TABLE users ADD COLUMN mp_user_id TEXT',
                'mp_public_key': 'ALTER TABLE users ADD COLUMN mp_public_key TEXT',
                'mp_connected_at': 'ALTER TABLE users ADD COLUMN mp_connected_at DATETIME'
            }

        for col_name, sql in new_columns.items():
            if col_name not in existing_columns:
                migrations_needed.append(sql)

        if not migrations_needed:
            return {
                "status": "success",
                "message": "All Mercado Pago fields already exist. No migration needed.",
                "database_type": "PostgreSQL" if USE_SUPABASE else "SQLite",
                "columns_checked": list(new_columns.keys()),
                "existing_columns": existing_columns
            }

        # Execute migrations
        with engine.connect() as conn:
            for migration_sql in migrations_needed:
                conn.execute(text(migration_sql))
                migrations_executed.append(migration_sql)
            conn.commit()

        return {
            "status": "success",
            "message": f"Migration completed! Added {len(migrations_executed)} new columns.",
            "database_type": "PostgreSQL/Supabase" if USE_SUPABASE else "SQLite",
            "migrations_executed": migrations_executed
        }

    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }

@app.get("/run-shipping-migration")
def run_shipping_migration():
    """
    TEMPORÁRIO: Executa migration dos campos de endereço e frete
    Acesse via: https://gamer-marketplace.onrender.com/run-shipping-migration
    """
    try:
        from sqlalchemy import text, inspect

        inspector = inspect(engine)
        users_columns = [col['name'] for col in inspector.get_columns('users')]
        transactions_columns = [col['name'] for col in inspector.get_columns('transactions')]

        migrations_needed = []
        migrations_executed = []

        # Definir SQL apropriado para cada tipo de banco
        if USE_SUPABASE or 'postgresql' in str(engine.url):
            # PostgreSQL - Address fields in users table
            user_address_fields = {
                'address_zipcode': 'ALTER TABLE users ADD COLUMN address_zipcode VARCHAR(10)',
                'address_street': 'ALTER TABLE users ADD COLUMN address_street VARCHAR(255)',
                'address_number': 'ALTER TABLE users ADD COLUMN address_number VARCHAR(20)',
                'address_complement': 'ALTER TABLE users ADD COLUMN address_complement VARCHAR(100)',
                'address_neighborhood': 'ALTER TABLE users ADD COLUMN address_neighborhood VARCHAR(100)',
                'address_city': 'ALTER TABLE users ADD COLUMN address_city VARCHAR(100)',
                'address_state': 'ALTER TABLE users ADD COLUMN address_state VARCHAR(2)',
            }

            # PostgreSQL - Shipping fields in transactions table
            transaction_shipping_fields = {
                'shipping_id': 'ALTER TABLE transactions ADD COLUMN shipping_id VARCHAR',
                'shipping_mode': 'ALTER TABLE transactions ADD COLUMN shipping_mode VARCHAR',
                'shipping_method': 'ALTER TABLE transactions ADD COLUMN shipping_method VARCHAR',
                'shipping_cost': 'ALTER TABLE transactions ADD COLUMN shipping_cost FLOAT',
                'shipping_carrier': 'ALTER TABLE transactions ADD COLUMN shipping_carrier VARCHAR',
                'shipping_estimated_delivery': 'ALTER TABLE transactions ADD COLUMN shipping_estimated_delivery TIMESTAMP',
                'shipping_label_url': 'ALTER TABLE transactions ADD COLUMN shipping_label_url VARCHAR',
                'delivery_zipcode': 'ALTER TABLE transactions ADD COLUMN delivery_zipcode VARCHAR(10)',
                'delivery_street': 'ALTER TABLE transactions ADD COLUMN delivery_street VARCHAR(255)',
                'delivery_number': 'ALTER TABLE transactions ADD COLUMN delivery_number VARCHAR(20)',
                'delivery_complement': 'ALTER TABLE transactions ADD COLUMN delivery_complement VARCHAR(100)',
                'delivery_neighborhood': 'ALTER TABLE transactions ADD COLUMN delivery_neighborhood VARCHAR(100)',
                'delivery_city': 'ALTER TABLE transactions ADD COLUMN delivery_city VARCHAR(100)',
                'delivery_state': 'ALTER TABLE transactions ADD COLUMN delivery_state VARCHAR(2)',
            }
        else:
            # SQLite
            user_address_fields = {
                'address_zipcode': 'ALTER TABLE users ADD COLUMN address_zipcode VARCHAR(10)',
                'address_street': 'ALTER TABLE users ADD COLUMN address_street VARCHAR(255)',
                'address_number': 'ALTER TABLE users ADD COLUMN address_number VARCHAR(20)',
                'address_complement': 'ALTER TABLE users ADD COLUMN address_complement VARCHAR(100)',
                'address_neighborhood': 'ALTER TABLE users ADD COLUMN address_neighborhood VARCHAR(100)',
                'address_city': 'ALTER TABLE users ADD COLUMN address_city VARCHAR(100)',
                'address_state': 'ALTER TABLE users ADD COLUMN address_state VARCHAR(2)',
            }

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

        # Check users table
        for col_name, sql in user_address_fields.items():
            if col_name not in users_columns:
                migrations_needed.append(sql)

        # Check transactions table
        for col_name, sql in transaction_shipping_fields.items():
            if col_name not in transactions_columns:
                migrations_needed.append(sql)

        if not migrations_needed:
            return {
                "status": "success",
                "message": "All shipping/address fields already exist. No migration needed.",
                "database_type": "PostgreSQL/Supabase" if USE_SUPABASE else "SQLite",
                "users_columns_checked": list(user_address_fields.keys()),
                "transactions_columns_checked": list(transaction_shipping_fields.keys()),
            }

        # Execute migrations
        with engine.connect() as conn:
            for migration_sql in migrations_needed:
                conn.execute(text(migration_sql))
                migrations_executed.append(migration_sql)
            conn.commit()

        return {
            "status": "success",
            "message": f"✅ Migration completed! Added {len(migrations_executed)} new columns.",
            "database_type": "PostgreSQL/Supabase" if USE_SUPABASE else "SQLite",
            "total_columns_added": len(migrations_executed),
            "migrations_executed": migrations_executed
        }

    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }

@app.get("/add-addresses-to-existing-users")
def add_addresses_to_existing_users(db: Session = Depends(get_db)):
    """
    TEMPORÁRIO: Adiciona endereços fictícios aos usuários que não têm endereço
    Acesse via: https://gamer-marketplace.onrender.com/add-addresses-to-existing-users
    """
    try:
        # Endereços fictícios em Niterói/RJ
        addresses = [
            {
                "zipcode": "24120200",
                "street": "Rua Moreira César",
                "number": "157",
                "complement": "Apt 302",
                "neighborhood": "Icaraí",
                "city": "Niterói",
                "state": "RJ"
            },
            {
                "zipcode": "24230090",
                "street": "Rua Miguel de Frias",
                "number": "89",
                "complement": None,
                "neighborhood": "Ingá",
                "city": "Niterói",
                "state": "RJ"
            },
            {
                "zipcode": "24360440",
                "street": "Rua Gavião Peixoto",
                "number": "245",
                "complement": "Casa 2",
                "neighborhood": "São Francisco",
                "city": "Niterói",
                "state": "RJ"
            },
        ]

        # Buscar usuários sem endereço
        users = db.query(User).filter(
            (User.address_zipcode == None) | (User.address_zipcode == "")
        ).all()

        if not users:
            return {
                "status": "success",
                "message": "Todos os usuários já têm endereço cadastrado",
                "users_updated": 0
            }

        updated_users = []
        for idx, user in enumerate(users):
            # Pegar endereço baseado no índice (circular)
            address = addresses[idx % len(addresses)]

            # Atualizar usuário
            user.address_zipcode = address["zipcode"]
            user.address_street = address["street"]
            user.address_number = address["number"]
            user.address_complement = address["complement"]
            user.address_neighborhood = address["neighborhood"]
            user.address_city = address["city"]
            user.address_state = address["state"]

            updated_users.append({
                "username": user.username,
                "email": user.email,
                "address": f"{address['street']}, {address['number']} - {address['neighborhood']}, {address['city']}/{address['state']}"
            })

        db.commit()

        return {
            "status": "success",
            "message": f"✅ Endereços adicionados para {len(users)} usuários",
            "users_updated": len(users),
            "details": updated_users
        }

    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }

@app.get("/test-seller-token/{username}")
async def test_seller_token(
    username: str,
    db: Session = Depends(get_db)
):
    """
    🔍 TESTA SE O TOKEN OAUTH DO VENDEDOR ESTÁ VÁLIDO
    """
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return {"error": "Usuário não encontrado"}

        if not user.mp_access_token:
            return {"error": "Usuário não tem MP conectado"}

        # Testar o token fazendo uma requisição simples à API do MP
        import requests

        headers = {
            "Authorization": f"Bearer {user.mp_access_token}"
        }

        # Testar com endpoint /users/me do MP
        response = requests.get(
            "https://api.mercadopago.com/users/me",
            headers=headers
        )

        result = {
            "username": username,
            "mp_user_id_stored": user.mp_user_id,
            "token_first_20_chars": user.mp_access_token[:20] + "...",
            "token_test": {
                "status_code": response.status_code,
                "valid": response.status_code == 200,
                "error": None if response.status_code == 200 else response.text
            }
        }

        if response.status_code == 200:
            mp_data = response.json()
            result["mp_api_response"] = {
                "id": mp_data.get("id"),
                "nickname": mp_data.get("nickname"),
                "email": mp_data.get("email"),
                "site_id": mp_data.get("site_id")
            }
            result["token_test"]["message"] = "✅ Token válido!"
        else:
            result["token_test"]["message"] = "❌ Token inválido ou expirado!"
            result["token_test"]["recommendation"] = "Vendedor precisa reconectar conta do MP"

        return result

    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.get("/test-mp-preference/{product_id}")
async def test_mp_preference(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    🔍 TESTE DE CRIAÇÃO DE PREFERÊNCIA MP
    Testa se o marketplace está configurado corretamente
    """
    try:
        # Buscar produto
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return {"error": "Produto não encontrado"}

        # Buscar vendedor
        seller = db.query(User).filter(User.id == product.owner_id).first()
        if not seller:
            return {"error": "Vendedor não encontrado"}

        if not seller.mp_access_token:
            return {"error": f"Vendedor {seller.username} não tem MP conectado"}

        # Calcular valores
        amount = float(product.final_price)
        platform_fee = amount * (PLATFORM_COMMISSION_PERCENT / 100)
        seller_amount = amount - platform_fee

        # Inicializar SDK
        seller_mp_sdk = mercadopago.SDK(seller.mp_access_token)

        # Criar preferência de teste
        preference_data = {
            "items": [
                {
                    "title": product.title,
                    "description": product.description[:256] if product.description else "",
                    "quantity": 1,
                    "unit_price": amount,
                    "currency_id": "BRL"
                }
            ],
            "payer": {
                "name": "Comprador Teste",
                "email": "teste@teste.com"
            },
            "back_urls": {
                "success": "https://gamer-marketplace.onrender.com/payment/success",
                "failure": "https://gamer-marketplace.onrender.com/payment/failure",
                "pending": "https://gamer-marketplace.onrender.com/payment/pending"
            },
            "auto_return": "approved",
            "external_reference": f"test_product_{product.id}",
            "statement_descriptor": "RETROTRADE BRASIL",
            "notification_url": "https://gamer-marketplace.onrender.com/webhook/mercadopago",
            "marketplace_fee": float(platform_fee)
        }

        print(f"🔍 [TEST] Criando preferência de teste...")
        response = seller_mp_sdk.preference().create(preference_data)

        # Extrair preferência
        preference = None
        if isinstance(response, dict):
            if "response" in response:
                preference = response["response"]
            else:
                preference = response

        result = {
            "status": "success",
            "seller": {
                "username": seller.username,
                "mp_user_id": seller.mp_user_id,
                "has_token": bool(seller.mp_access_token)
            },
            "product": {
                "id": product.id,
                "title": product.title,
                "price": amount
            },
            "fees": {
                "total": amount,
                "platform_fee": platform_fee,
                "seller_receives": seller_amount
            },
            "preference_data_sent": {
                "marketplace_fee": preference_data["marketplace_fee"],
                "items": preference_data["items"]
            },
            "mp_response": {
                "has_id": "id" in preference if preference else False,
                "has_init_point": "init_point" in preference if preference else False,
                "preference_id": preference.get("id") if preference else None,
                "init_point": preference.get("init_point") if preference else None,
                "client_id": preference.get("client_id") if preference else None,
                "marketplace_in_response": "marketplace" in preference if preference else False,
            },
            "raw_response_keys": list(preference.keys()) if preference else [],
            "full_preference": preference
        }

        return result

    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.get("/marketplace-diagnostic")
def marketplace_diagnostic(db: Session = Depends(get_db)):
    """
    🔍 DIAGNÓSTICO COMPLETO DO MARKETPLACE
    Verifica todas as configurações necessárias para o marketplace funcionar
    """
    diagnostic = {
        "status": "checking",
        "issues": [],
        "warnings": [],
        "success": []
    }

    # 1. Verificar credenciais do Mercado Pago
    if not MERCADOPAGO_APP_ID:
        diagnostic["issues"].append("❌ MERCADOPAGO_APP_ID não configurado")
    else:
        diagnostic["success"].append(f"✅ APP_ID configurado: {MERCADOPAGO_APP_ID[:10]}...")

    if not MERCADOPAGO_CLIENT_SECRET:
        diagnostic["issues"].append("❌ MERCADOPAGO_CLIENT_SECRET não configurado")
    else:
        diagnostic["success"].append(f"✅ CLIENT_SECRET configurado: {MERCADOPAGO_CLIENT_SECRET[:10]}...")

    if not MERCADOPAGO_ACCESS_TOKEN:
        diagnostic["issues"].append("❌ MERCADOPAGO_ACCESS_TOKEN não configurado (token da plataforma)")
    else:
        diagnostic["success"].append(f"✅ ACCESS_TOKEN configurado: {MERCADOPAGO_ACCESS_TOKEN[:20]}...")

    if not MERCADOPAGO_REDIRECT_URI:
        diagnostic["issues"].append("❌ MERCADOPAGO_REDIRECT_URI não configurado")
    else:
        diagnostic["success"].append(f"✅ REDIRECT_URI: {MERCADOPAGO_REDIRECT_URI}")

    # 2. Verificar usuários com MP conectado
    users_with_mp = db.query(User).filter(User.mp_access_token != None).all()
    if not users_with_mp:
        diagnostic["warnings"].append("⚠️ Nenhum usuário tem Mercado Pago conectado")
    else:
        diagnostic["success"].append(f"✅ {len(users_with_mp)} usuário(s) com MP conectado:")
        for user in users_with_mp:
            diagnostic["success"].append(f"   - {user.username} (MP User ID: {user.mp_user_id})")

    # 3. Verificar produtos disponíveis
    products = db.query(Product).filter(Product.is_sold == False).all()
    if not products:
        diagnostic["warnings"].append("⚠️ Nenhum produto disponível para venda")
    else:
        diagnostic["success"].append(f"✅ {len(products)} produto(s) disponível(is) para venda")

    # 4. Verificar produtos com vendedor sem MP
    products_without_mp = db.query(Product).join(User, Product.owner_id == User.id).filter(
        Product.is_sold == False,
        User.mp_access_token == None
    ).all()
    if products_without_mp:
        diagnostic["warnings"].append(f"⚠️ {len(products_without_mp)} produto(s) de vendedores sem MP conectado (não podem ser vendidos)")

    # 5. Verificar endereços dos usuários
    users_without_address = db.query(User).filter(
        (User.address_zipcode == None) | (User.address_zipcode == "")
    ).count()
    if users_without_address > 0:
        diagnostic["warnings"].append(f"⚠️ {users_without_address} usuário(s) sem endereço cadastrado (frete não calculará)")
    else:
        diagnostic["success"].append("✅ Todos os usuários têm endereço cadastrado")

    # 6. URLs críticas
    diagnostic["urls"] = {
        "webhook": "https://gamer-marketplace.onrender.com/webhook/mercadopago",
        "oauth_callback": MERCADOPAGO_REDIRECT_URI,
        "success_url": "https://gamer-marketplace.onrender.com/payment/success",
        "failure_url": "https://gamer-marketplace.onrender.com/payment/failure",
    }

    # 7. Comissão da plataforma
    diagnostic["platform_config"] = {
        "commission_percent": PLATFORM_COMMISSION_PERCENT,
        "commission_description": f"Plataforma recebe {PLATFORM_COMMISSION_PERCENT}% de cada venda"
    }

    # Status final
    if diagnostic["issues"]:
        diagnostic["status"] = "critical"
        diagnostic["message"] = "❌ Marketplace NÃO está funcional - problemas críticos encontrados"
    elif diagnostic["warnings"]:
        diagnostic["status"] = "warning"
        diagnostic["message"] = "⚠️ Marketplace está funcional mas com avisos"
    else:
        diagnostic["status"] = "healthy"
        diagnostic["message"] = "✅ Marketplace está 100% funcional!"

    return diagnostic

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected" if SessionLocal else "disconnected",
        "gemini_api": "configured" if os.getenv("GEMINI_API_KEY") else "not_configured",
        "gemini_model": "gemini-2.5-flash",
        "mercadopago": "configured" if mp_sdk else "not_configured",
        "mercadopago_token_present": bool(MERCADOPAGO_ACCESS_TOKEN),
        "mercadopago_oauth": "configured" if MERCADOPAGO_APP_ID and MERCADOPAGO_CLIENT_SECRET else "not_configured",
        "version": "2.0.3",
        "build": "2026-04-05",
        "timestamp": datetime.utcnow().isoformat()
    }

# ============================================
# ENDPOINTS - PRODUCTS
# ============================================

@app.post("/products/analyze", response_model=PriceAnalysisResponse)
async def analyze_product(
    title: str = Form(...),
    category: str = Form(...),
    console_type: str = Form(...),
    is_working: bool = Form(True),
    is_complete: bool = Form(False),
    has_box: bool = Form(False),
    has_manual: bool = Form(False),
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
):
    """Analyze product images and provide price suggestion using Gemini AI"""

    try:
        # Convert first image to bytes for Gemini
        if images:
            image_bytes = await images[0].read()
            # Resize if needed
            img = Image.open(BytesIO(image_bytes))
            if img.width > 1024 or img.height > 1024:
                img.thumbnail((1024, 1024))
            buffered = BytesIO()
            img.save(buffered, format="JPEG")
            image_data = buffered.getvalue()

        product_info = {
            "title": title,
            "category": category,
            "console_type": console_type,
            "is_working": is_working,
            "is_complete": is_complete,
            "has_box": has_box,
            "has_manual": has_manual
        }

        # Use basic scoring for now (Gemini integration can be enhanced later)
        condition_score = 75.0 if is_working else 50.0
        if has_box:
            condition_score += 5
        if has_manual:
            condition_score += 5

        # Calculate rarity
        rarity_score = calculate_rarity_score(product_info)

        # Price suggestion
        price_suggestion = calculate_price_suggestion(condition_score, rarity_score, product_info)

        # Generate insights
        insights = [
            f"🎮 Condição avaliada: {condition_score:.0f}/100",
            f"💎 Raridade: {rarity_score:.0f}/100",
            f"💰 Preço sugerido: R$ {price_suggestion['ideal']:.2f}"
        ]

        if condition_score >= 85:
            insights.append("⭐ Excelente estado! Você pode cobrar acima da média")
        elif condition_score < 60:
            insights.append("⚠️ Estado comprometido pode dificultar venda")

        if rarity_score >= 70:
            insights.append("🔥 Item raro! Alta demanda no mercado")

        return {
            "condition_score": condition_score,
            "rarity_score": rarity_score,
            "price_suggestion": price_suggestion,
            "insights": insights
        }

    except Exception as e:
        print(f"❌ Error in analyze_product: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao analisar produto: {str(e)}")

@app.post("/products", response_model=ProductResponse)
async def create_product(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    console_type: str = Form(...),
    final_price: float = Form(...),
    is_working: bool = Form(True),
    is_complete: bool = Form(False),
    has_box: bool = Form(False),
    has_manual: bool = Form(False),
    condition_score: float = Form(70.0),
    rarity_score: float = Form(50.0),
    price_min: float = Form(0),
    price_ideal: float = Form(0),
    price_max: float = Form(0),
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product listing"""

    try:
        # Create product first to get product_id
        product = Product(
            title=title,
            description=description,
            category=category,
            console_type=console_type,
            condition_score=condition_score,
            rarity_score=rarity_score,
            price_min=price_min,
            price_ideal=price_ideal,
            price_max=price_max,
            final_price=final_price,
            is_working=is_working,
            is_complete=is_complete,
            has_box=has_box,
            has_manual=has_manual,
            images=json.dumps([]),  # Empty array initially
            owner_id=current_user.id
        )

        db.add(product)
        db.commit()
        db.refresh(product)

        # Upload images to Supabase Storage
        image_urls = []
        print(f"📤 Uploading {len(images)} images for product {product.id}...")

        for idx, image_file in enumerate(images):
            try:
                # Read file content
                content = await image_file.read()
                file_obj = BytesIO(content)

                # Upload to Supabase
                public_url = supabase_client.upload_product_image(
                    user_id=current_user.id,
                    product_id=product.id,
                    file=file_obj,
                    filename=image_file.filename or f"image_{idx}.jpg",
                    content_type=image_file.content_type or "image/jpeg"
                )

                image_urls.append(public_url)
                print(f"✅ Image {idx + 1}/{len(images)} uploaded: {public_url}")

            except Exception as upload_error:
                print(f"⚠️ Error uploading image {idx}: {upload_error}")
                # Continue with other images even if one fails

        # Update product with image URLs
        product.images = json.dumps(image_urls)
        db.commit()
        db.refresh(product)

        print(f"✅ Product {product.id} created with {len(image_urls)} images")
        return product

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating product: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar produto: {str(e)}")

@app.get("/products", response_model=List[ProductResponse])
def list_products(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    console_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List products with filters"""
    try:
        query = db.query(Product).filter(Product.is_sold == False)

        if category:
            query = query.filter(Product.category == category)
        if console_type:
            query = query.filter(Product.console_type == console_type)

        products = query.order_by(desc(Product.created_at)).offset(skip).limit(limit).all()
        return products

    except Exception as e:
        print(f"❌ Error listing products: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar produtos: {str(e)}")

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get product by ID"""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        # Increment views
        product.views_count += 1
        db.commit()

        return product

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting product: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar produto: {str(e)}")

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete product (only owner can delete)"""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        # Check if user is the owner
        if product.owner_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Você não tem permissão para excluir este produto"
            )

        # Check if product is already sold
        if product.is_sold:
            raise HTTPException(
                status_code=400,
                detail="Não é possível excluir um produto já vendido"
            )

        db.delete(product)
        db.commit()

        print(f"✅ Produto {product_id} excluído por {current_user.username}")
        return {"message": "Produto excluído com sucesso"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting product: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir produto: {str(e)}")

@app.get("/search")
def search_products(q: str, db: Session = Depends(get_db)):
    """Search products by title or description"""
    try:
        products = db.query(Product).filter(
            or_(
                Product.title.ilike(f"%{q}%"),
                Product.description.ilike(f"%{q}%"),
                Product.console_type.ilike(f"%{q}%")
            ),
            Product.is_sold == False
        ).limit(50).all()

        return products

    except Exception as e:
        print(f"❌ Error searching products: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar produtos: {str(e)}")

# ============================================
# ENDPOINTS - CHAT
# ============================================

@app.get("/chat/rooms")
async def get_chat_rooms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lista todas conversas do usuário"""
    rooms = db.query(ChatRoom).filter(
        or_(ChatRoom.buyer_id == current_user.id, ChatRoom.seller_id == current_user.id)
    ).order_by(desc(ChatRoom.last_message_at)).all()
    return rooms

@app.post("/chat/rooms/{product_id}")
async def create_chat_room(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria sala de chat para produto"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # Verificar se já existe sala
    existing = db.query(ChatRoom).filter(
        ChatRoom.product_id == product_id,
        ChatRoom.buyer_id == current_user.id
    ).first()

    if existing:
        return existing

    # Criar nova sala
    room = ChatRoom(
        product_id=product_id,
        buyer_id=current_user.id,
        seller_id=product.owner_id
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room

@app.get("/chat/rooms/{room_id}/messages")
async def get_messages(
    room_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista mensagens de uma sala"""
    messages = db.query(ChatMessage).filter(
        ChatMessage.room_id == room_id
    ).order_by(ChatMessage.created_at).offset(skip).limit(limit).all()

    # Marcar como lidas
    for msg in messages:
        if msg.sender_id != current_user.id and not msg.is_read:
            msg.is_read = True
    db.commit()

    return messages

@app.post("/chat/rooms/{room_id}/messages")
async def send_message(
    room_id: int,
    message: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Envia mensagem em sala de chat"""
    room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    new_message = ChatMessage(
        room_id=room_id,
        sender_id=current_user.id,
        content=message.content,
        message_type=message.message_type
    )
    db.add(new_message)

    # Atualizar última mensagem
    room.last_message_at = datetime.utcnow()
    db.commit()
    db.refresh(new_message)

    return new_message

# ============================================
# ENDPOINTS - FÓRUM
# ============================================

@app.get("/forum/posts")
async def get_forum_posts(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Lista posts do fórum"""
    query = db.query(ForumPost)

    if category:
        query = query.filter(ForumPost.category == category)

    posts = query.order_by(
        desc(ForumPost.is_pinned),
        desc(ForumPost.created_at)
    ).offset(skip).limit(limit).all()

    return posts

@app.post("/forum/posts", response_model=ForumPostResponse)
async def create_forum_post(
    post: ForumPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria novo post no fórum"""
    new_post = ForumPost(
        author_id=current_user.id,
        category=post.category,
        title=post.title,
        content=post.content
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@app.get("/forum/posts/{post_id}")
async def get_forum_post(post_id: int, db: Session = Depends(get_db)):
    """Detalhes de um post"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")

    # Incrementar visualizações
    post.views_count += 1
    db.commit()

    return post

@app.post("/forum/posts/{post_id}/comments")
async def create_comment(
    post_id: int,
    comment: ForumCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adiciona comentário em post"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")

    new_comment = ForumComment(
        post_id=post_id,
        author_id=current_user.id,
        content=comment.content,
        parent_comment_id=comment.parent_comment_id
    )
    db.add(new_comment)

    # Incrementar contador
    post.comments_count += 1
    db.commit()
    db.refresh(new_comment)

    return new_comment

@app.get("/forum/posts/{post_id}/comments")
async def get_comments(
    post_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Lista comentários de um post"""
    comments = db.query(ForumComment).filter(
        ForumComment.post_id == post_id,
        ForumComment.parent_comment_id == None  # Apenas comentários principais
    ).order_by(ForumComment.created_at).offset(skip).limit(limit).all()

    return comments

# ============================================
# ENDPOINTS - IA: IDENTIFICAÇÃO DE JOGOS
# ============================================

class GameIdentification(BaseModel):
    """Resposta da identificação automática de jogos"""
    game_name: str
    console: str
    region: str  # NTSC-U, PAL, NTSC-J
    version: str  # Original, Greatest Hits, Limited Edition, etc
    condition_score: int  # 1-10
    has_box: bool
    has_manual: bool
    has_extras: List[str]  # Cartão de garantia, pôster, etc
    rarity: str  # Comum, Raro, Muito Raro, Extremamente Raro
    estimated_price: str  # Faixa de preço em R$
    authenticity_score: int  # 0-100
    authenticity_notes: str
    market_analysis: str  # Análise do mercado brasileiro
    confidence: int  # 0-100 - confiança na identificação

@app.post("/products/identify")
async def identify_game_by_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    🔍 IDENTIFICAÇÃO AUTOMÁTICA DE JOGOS POR FOTO

    IA analisa a foto e identifica:
    - Nome do jogo
    - Console
    - Região (NTSC/PAL/NTSC-J)
    - Estado de conservação
    - Raridade no Brasil
    - Preço estimado
    - Autenticidade
    """
    try:
        # Ler imagem
        image_data = await file.read()

        # Detectar formato da imagem
        image_format = "jpeg"
        if file.filename:
            if file.filename.lower().endswith('.png'):
                image_format = "png"
            elif file.filename.lower().endswith('.webp'):
                image_format = "webp"

        # Chamar Gemini para identificação
        result = gemini_client.identify_game_from_image(image_data, image_format)


        # Extrair resposta do Gemini
        ai_response = result["text"]

        # Tentar extrair JSON da resposta
        try:
            # Procurar pelo JSON na resposta
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = ai_response[json_start:json_end]
                gemini_data = json.loads(json_str)

                # Mapear resposta do Gemini para formato esperado pelo app
                game_data = {
                    "game_name": gemini_data.get("nome", "Não identificado"),
                    "console": gemini_data.get("console", "Desconhecido"),
                    "region": gemini_data.get("regiao", "Não especificada"),
                    "version": gemini_data.get("ano", "N/A"),
                    "condition_score": 7 if gemini_data.get("estado") == "Bom" else 5,
                    "has_box": "caixa" in str(gemini_data.get("itens", [])).lower(),
                    "has_manual": "manual" in str(gemini_data.get("itens", [])).lower(),
                    "has_extras": gemini_data.get("itens", []),
                    "rarity": "Comum" if gemini_data.get("confianca", 0) > 80 else "Raro",
                    "estimated_price": f"R$ {gemini_data.get('valor_min', 0):.2f} - R$ {gemini_data.get('valor_max', 0):.2f}",
                    "authenticity_score": gemini_data.get("confianca", 50),
                    "authenticity_notes": gemini_data.get("observacoes", ""),
                    "market_analysis": gemini_data.get("observacoes", "Análise completa da IA"),
                    "confidence": gemini_data.get("confianca", 50)
                }

                return {
                    "success": True,
                    "identification": game_data,
                    "raw_response": ai_response
                }
            else:
                # Se não encontrou JSON, retornar resposta completa
                return {
                    "success": True,
                    "identification": None,
                    "raw_response": ai_response,
                    "message": "IA respondeu mas não em formato estruturado"
                }
        except json.JSONDecodeError:
            # Se falhar ao parsear JSON, retornar resposta raw
            return {
                "success": True,
                "identification": None,
                "raw_response": ai_response,
                "message": "IA respondeu mas não em formato JSON válido"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar imagem: {str(e)}")

# ============================================
# ENDPOINTS - MODERAÇÃO DE CHAT COM IA
# ============================================

@app.post("/chat/moderate-message")
async def moderate_chat_message(
    room_id: int,
    message_content: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    🛡️ MODERAÇÃO INTELIGENTE DE CHAT

    IA analisa mensagem em busca de:
    - Tentativas de fraude
    - Pedidos de pagamento fora da plataforma
    - Compartilhamento de dados bancários/PIX
    - Linguagem abusiva/ameaças
    - Tentativas de phishing
    - Números de telefone/contatos externos
    """
    if not gemini_client.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API não configurada")

    try:
        # Prompt de moderação especializado
        prompt = f"""Você é um moderador de chat especializado em detectar comportamentos suspeitos em marketplaces.

Analise esta mensagem de chat entre comprador e vendedor de jogos retro:

MENSAGEM: "{message_content}"

DETECTE:
1. **Tentativas de Fraude** (score +40):
   - Pedidos urgentes de pagamento
   - Promessas irreais ("preço especial só hoje")
   - Pressão psicológica

2. **Pagamento Fora da Plataforma** (score +50):
   - Menção a PIX, transferência, boleto
   - Dados bancários (ag, conta, CPF para transferência)
   - "paga direto pra mim", "sem taxa"

3. **Compartilhamento de Contatos** (score +30):
   - Números de telefone/WhatsApp
   - E-mails pessoais
   - Links externos suspeitos
   - Perfis de redes sociais

4. **Linguagem Abusiva** (score +60):
   - Xingamentos, ameaças
   - Discriminação
   - Assédio

5. **Phishing/Golpes** (score +80):
   - Links suspeitos
   - Pedidos de dados pessoais sensíveis
   - Falsificação de identidade

Retorne APENAS o JSON, sem texto antes ou depois:
{{
  "is_suspicious": true/false,
  "risk_score": 0-100,
  "alert_type": "fraud_attempt|payment_outside|contact_sharing|abuse|phishing|clean",
  "description": "Breve descrição do que foi detectado",
  "detected_patterns": ["padrão1", "padrão2"],
  "should_block": true/false,
  "recommendation": "Ação recomendada"
}}

Se a mensagem for limpa e segura, retorne:
{{"is_suspicious": false, "risk_score": 0, "alert_type": "clean"}}"""

        # Usar Claude API
        response = claude_client.messages.create(
            model="claude-4-6-sonnet-20250929",
            max_tokens=500,
            temperature=0.3,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        ai_response = response.content[0].text

        # Extrair JSON
        json_start = ai_response.find('{')
        json_end = ai_response.rfind('}') + 1
        if json_start != -1 and json_end > json_start:
            json_str = ai_response[json_start:json_end]
            moderation_result = json.loads(json_str)

            # Se detectou algo suspeito, criar alerta
            if moderation_result.get('is_suspicious', False) and moderation_result.get('risk_score', 0) > 30:
                # Buscar mensagem no banco (se existir)
                chat_message = db.query(ChatMessage).filter(
                    ChatMessage.room_id == room_id,
                    ChatMessage.sender_id == current_user.id,
                    ChatMessage.content == message_content
                ).order_by(desc(ChatMessage.created_at)).first()

                alert = ChatAlert(
                    room_id=room_id,
                    message_id=chat_message.id if chat_message else None,
                    user_id=current_user.id,
                    alert_type=moderation_result.get('alert_type', 'unknown'),
                    risk_score=moderation_result.get('risk_score', 0),
                    description=moderation_result.get('description', ''),
                    detected_patterns=json.dumps(moderation_result.get('detected_patterns', []))
                )
                db.add(alert)
                db.commit()
                db.refresh(alert)

                moderation_result['alert_id'] = alert.id

            return moderation_result
        else:
            # Fallback: não conseguiu parsear, considerar limpa
            return {
                "is_suspicious": False,
                "risk_score": 0,
                "alert_type": "clean",
                "message": "Análise inconclusiva, mensagem permitida"
            }

    except Exception as e:
        # Em caso de erro na IA, não bloquear mensagem
        return {
            "is_suspicious": False,
            "risk_score": 0,
            "alert_type": "error",
            "message": f"Erro na moderação: {str(e)}"
        }

@app.get("/chat/alerts")
async def get_chat_alerts(
    unresolved_only: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista alertas de moderação de chat"""
    query = db.query(ChatAlert)

    if unresolved_only:
        query = query.filter(ChatAlert.is_resolved == False)

    alerts = query.order_by(desc(ChatAlert.risk_score), desc(ChatAlert.created_at)).limit(50).all()
    return alerts

@app.post("/chat/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca alerta como resolvido"""
    alert = db.query(ChatAlert).filter(ChatAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")

    alert.is_resolved = True
    alert.resolved_by = current_user.id
    alert.resolved_at = datetime.utcnow()
    db.commit()

    return {"message": "Alerta resolvido", "alert_id": alert_id}

# ============================================
# ENDPOINTS - EVENTOS DE JOGOS RETRO
# ============================================

class EventCreate(BaseModel):
    title: str
    description: str
    event_type: str
    state: str
    city: str
    address: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    organizer: Optional[str] = None
    contact_info: Optional[str] = None
    website: Optional[str] = None
    image_url: Optional[str] = None

class EventResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    title: str
    description: str
    event_type: str
    state: str
    city: str
    start_date: datetime
    end_date: Optional[datetime]
    is_verified: bool
    interest_count: int
    created_at: datetime

# Payment / Transaction Schemas
class PaymentCreate(BaseModel):
    """Criar novo pagamento"""
    product_id: int
    payment_method_id: str = "pix"  # pix, credit_card, debit_card, etc
    installments: int = 1

class PaymentResponse(BaseModel):
    """Resposta da criação de pagamento"""
    model_config = {"from_attributes": True}

    transaction_id: int
    payment_id: Optional[str] = None
    mp_preference_id: Optional[str] = None
    init_point: Optional[str] = None  # URL para redirecionar usuário no MP
    status: str
    amount: float
    qr_code: Optional[str] = None  # QR Code PIX (base64)
    qr_code_text: Optional[str] = None  # Código PIX copia e cola

class TransactionResponse(BaseModel):
    """Detalhes completos da transação"""
    model_config = {"from_attributes": True}

    id: int
    product_id: int
    buyer_id: int
    seller_id: int
    payment_id: Optional[str]
    mp_status: Optional[str]
    status: str
    amount: float
    platform_fee: float
    seller_amount: float
    verification_video_url: Optional[str]
    ai_verification_score: Optional[int]
    auto_release_date: Optional[datetime]
    tracking_code: Optional[str]
    shipped_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

class ShipProductRequest(BaseModel):
    """Vendedor informa envio do produto"""
    tracking_code: str

class UploadVideoRequest(BaseModel):
    """Comprador envia vídeo de verificação"""
    video_base64: str  # Vídeo em base64

class DisputeRequest(BaseModel):
    """Abrir disputa/reclamação"""
    reason: str

@app.get("/events", response_model=List[EventResponse])
async def list_events(
    state: Optional[str] = None,
    event_type: Optional[str] = None,
    upcoming_only: bool = True,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    📅 LISTA EVENTOS DE JOGOS RETRO

    Filtros:
    - state: SP, RJ, MG, etc
    - event_type: feira, encontro, campeonato, exposicao
    - upcoming_only: apenas eventos futuros
    """
    query = db.query(Event).filter(Event.is_active == True)

    if state:
        query = query.filter(Event.state == state.upper())

    if event_type:
        query = query.filter(Event.event_type == event_type.lower())

    if upcoming_only:
        query = query.filter(Event.start_date >= datetime.utcnow())

    events = query.order_by(Event.start_date).offset(skip).limit(limit).all()
    return events

@app.post("/events", response_model=EventResponse)
async def create_event(
    event: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria novo evento (usuário ou admin)"""
    new_event = Event(
        title=event.title,
        description=event.description,
        event_type=event.event_type.lower(),
        state=event.state.upper(),
        city=event.city,
        address=event.address,
        start_date=event.start_date,
        end_date=event.end_date,
        organizer=event.organizer,
        contact_info=event.contact_info,
        website=event.website,
        image_url=event.image_url,
        created_by=str(current_user.id)
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@app.get("/events/{event_id}")
async def get_event(event_id: int, db: Session = Depends(get_db)):
    """Detalhes de um evento"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return event

@app.post("/events/{event_id}/interest")
async def mark_interest(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca interesse em evento"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    # Verificar se já marcou interesse
    existing = db.query(EventInterest).filter(
        EventInterest.event_id == event_id,
        EventInterest.user_id == current_user.id
    ).first()

    if existing:
        return {"message": "Já marcou interesse neste evento"}

    interest = EventInterest(
        event_id=event_id,
        user_id=current_user.id
    )
    db.add(interest)

    # Incrementar contador
    event.interest_count += 1
    db.commit()

    return {"message": "Interesse registrado", "event_id": event_id}

@app.delete("/events/{event_id}/interest")
async def remove_interest(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove interesse em evento"""
    interest = db.query(EventInterest).filter(
        EventInterest.event_id == event_id,
        EventInterest.user_id == current_user.id
    ).first()

    if not interest:
        raise HTTPException(status_code=404, detail="Interesse não encontrado")

    event = db.query(Event).filter(Event.id == event_id).first()
    if event and event.interest_count > 0:
        event.interest_count -= 1

    db.delete(interest)
    db.commit()

    return {"message": "Interesse removido"}

@app.post("/events/discover")
async def discover_events(
    state: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    🔍 IA DESCOBRE EVENTOS AUTOMATICAMENTE

    Usa Claude para buscar eventos de jogos retro no estado especificado
    """
    if not gemini_client.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API não configurada")

    try:
        prompt = f"""Você é um assistente que busca eventos de jogos retro no Brasil.

TAREFA: Encontre eventos reais de jogos retro/games clássicos no estado de {state.upper()} nos próximos 6 meses.

TIPOS DE EVENTOS:
- Feiras do rolo (compra/venda/troca)
- Encontros de colecionadores
- Campeonatos de jogos retro
- Exposições de consoles antigos
- Eventos em lojas especializadas

INFORMAÇÕES NECESSÁRIAS:
- Nome do evento
- Descrição breve
- Tipo (feira/encontro/campeonato/exposicao)
- Cidade
- Data (formato: YYYY-MM-DD)
- Local (endereço se disponível)
- Organizador
- Site ou link (se houver)

IMPORTANTE:
- Apenas eventos REAIS e confirmados
- Se não souber de eventos específicos, sugira locais conhecidos por feiras regulares
- Foque em eventos de JOGOS RETRO (não eventos genéricos de games)

Retorne APENAS o JSON array, sem texto antes ou depois:
[
  {{
    "title": "Nome do Evento",
    "description": "Descrição",
    "event_type": "feira|encontro|campeonato|exposicao",
    "city": "Cidade",
    "start_date": "2026-04-15",
    "end_date": "2026-04-15",
    "address": "Endereço completo",
    "organizer": "Organizador",
    "website": "URL",
    "source_info": "Como você encontrou esta informação"
  }}
]

Se não encontrar eventos específicos, retorne array vazio []"""

        # Usar Claude API
        response = claude_client.messages.create(
            model="claude-4-6-sonnet-20250929",
            max_tokens=2000,
            temperature=0.5,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        ai_response = response.content[0].text

        # Extrair JSON
        json_start = ai_response.find('[')
        json_end = ai_response.rfind(']') + 1

        if json_start != -1 and json_end > json_start:
            json_str = ai_response[json_start:json_end]
            events_data = json.loads(json_str)

            # Criar eventos no banco
            created_events = []
            for event_data in events_data:
                try:
                    new_event = Event(
                        title=event_data.get('title', ''),
                        description=event_data.get('description', ''),
                        event_type=event_data.get('event_type', 'feira'),
                        state=state.upper(),
                        city=event_data.get('city', ''),
                        address=event_data.get('address'),
                        start_date=datetime.strptime(event_data.get('start_date', '2026-12-31'), '%Y-%m-%d'),
                        end_date=datetime.strptime(event_data.get('end_date'), '%Y-%m-%d') if event_data.get('end_date') else None,
                        organizer=event_data.get('organizer'),
                        website=event_data.get('website'),
                        source_url=event_data.get('source_info', 'AI Discovery'),
                        created_by='ai',
                        is_verified=False  # Precisa verificação manual
                    )
                    db.add(new_event)
                    db.commit()
                    db.refresh(new_event)
                    created_events.append(new_event)
                except Exception as e:
                    print(f"Erro ao criar evento: {e}")
                    continue

            return {
                "success": True,
                "events_found": len(created_events),
                "events": created_events,
                "message": f"IA descobriu {len(created_events)} eventos em {state}"
            }
        else:
            return {
                "success": False,
                "events_found": 0,
                "message": "IA não encontrou eventos no formato esperado",
                "raw_response": ai_response
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar eventos: {str(e)}")

# ============================================
# PAYMENT / ESCROW ENDPOINTS
# ============================================

# ============================================
# VIDEO VERIFICATION WITH AI
# ============================================

def extract_frames_from_video(video_bytes: bytes, num_frames: int = 5) -> List[str]:
    """
    Extrai N frames de um vídeo e retorna como base64

    Args:
        video_bytes: Bytes do arquivo de vídeo
        num_frames: Quantidade de frames a extrair (distribuídos uniformemente)

    Returns:
        Lista de strings base64 das imagens extraídas
    """
    frames_base64 = []

    try:
        # Salvar vídeo temporariamente
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_video:
            temp_video.write(video_bytes)
            temp_video_path = temp_video.name

        # Abrir vídeo com OpenCV
        cap = cv2.VideoCapture(temp_video_path)

        if not cap.isOpened():
            raise Exception("Não foi possível abrir o vídeo")

        # Pegar informações do vídeo
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        if total_frames < num_frames:
            num_frames = total_frames

        # Calcular índices dos frames a extrair (distribuídos uniformemente)
        frame_indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)

        for frame_idx in frame_indices:
            # Posicionar no frame desejado
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)

            # Ler frame
            ret, frame = cap.read()

            if ret:
                # Redimensionar para não sobrecarregar a API (max 1024px)
                height, width = frame.shape[:2]
                max_dimension = 1024

                if max(height, width) > max_dimension:
                    scale = max_dimension / max(height, width)
                    new_width = int(width * scale)
                    new_height = int(height * scale)
                    frame = cv2.resize(frame, (new_width, new_height))

                # Converter para JPEG
                _, buffer = cv2.imencode('.jpg', frame)

                # Converter para base64
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                frames_base64.append(frame_base64)

        cap.release()

        # Deletar arquivo temporário
        os.unlink(temp_video_path)

        return frames_base64

    except Exception as e:
        print(f"Erro ao extrair frames: {e}")
        return []

async def analyze_video_with_ai(
    video_frames_base64: List[str],
    product: Product,
    db: Session
) -> dict:
    """
    Usa Claude Vision para comparar frames do vídeo com fotos originais do produto

    Args:
        video_frames_base64: Lista de frames em base64
        product: Objeto Product com as informações do anúncio original
        db: Sessão do banco de dados

    Returns:
        {
            "match": bool,
            "confidence_score": 0-100,
            "issues_found": [...],
            "recommendation": "approve" | "review" | "reject",
            "analysis_details": "..."
        }
    """
    if not gemini_client.GEMINI_API_KEY:
        return {
            "match": False,
            "confidence_score": 0,
            "issues_found": ["Gemini API não configurada"],
            "recommendation": "review",
            "analysis_details": "IA não disponível"
        }

    try:
        # Construir o prompt para Claude
        prompt = f"""Você é um assistente especializado em verificar autenticidade de produtos em marketplaces.

**CONTEXTO:**
Um comprador recebeu um produto e gravou um vídeo para confirmar o recebimento.
Você deve comparar o vídeo recebido com a descrição original do anúncio.

**PRODUTO ANUNCIADO:**
- Título: {product.title}
- Descrição: {product.description or 'Sem descrição'}
- Console: {product.console_type}
- Está funcionando: {'Sim' if product.is_working else 'Não'}
- Completo (CIB): {'Sim' if product.is_complete else 'Não'}
- Com caixa: {'Sim' if product.has_box else 'Não'}
- Com manual: {'Sim' if product.has_manual else 'Não'}
- Score de condição: {product.condition_score}/100

**TAREFA:**
Analise os frames do vídeo recebido e verifique:
1. ✅ É o mesmo produto do anúncio?
2. ✅ O estado/condição condiz com o anunciado?
3. ✅ Os acessórios prometidos estão presentes (caixa, manual, cabos)?
4. ✅ O produto parece ser autêntico (não pirata/falsificado)?

**IMPORTANTE:**
- Seja criterioso mas justo
- Pequenas diferenças de ângulo/iluminação são normais
- Foque em inconsistências GRAVES (produto diferente, faltando itens, estado muito pior)

**RESPONDA EM JSON:**
{{
  "match": true/false,
  "confidence_score": 0-100,
  "issues_found": ["lista de problemas encontrados, se houver"],
  "recommendation": "approve" | "review" | "reject",
  "analysis_details": "Explicação detalhada da sua análise"
}}

**CRITÉRIOS DE SCORE:**
- 85-100: Produto idêntico, pode aprovar automaticamente
- 70-84: Pequenas diferenças, requer revisão manual
- 0-69: Inconsistências graves, possível fraude
"""

        # Preparar mensagens para Claude Vision
        content_blocks = [{"type": "text", "text": prompt}]

        # Adicionar frames do vídeo
        for i, frame_b64 in enumerate(video_frames_base64[:5]):  # Limitar a 5 frames
            content_blocks.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": frame_b64
                }
            })

        # Chamar Claude Vision
        response = claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": content_blocks
            }]
        )

        # Extrair resposta
        ai_response_text = response.content[0].text

        # Tentar parsear JSON
        try:
            # Remover markdown se houver
            json_text = ai_response_text
            if "```json" in json_text:
                json_text = json_text.split("```json")[1].split("```")[0].strip()
            elif "```" in json_text:
                json_text = json_text.split("```")[1].split("```")[0].strip()

            analysis_result = json.loads(json_text)

            # Validar campos obrigatórios
            if "confidence_score" not in analysis_result:
                analysis_result["confidence_score"] = 50
            if "recommendation" not in analysis_result:
                analysis_result["recommendation"] = "review"
            if "match" not in analysis_result:
                analysis_result["match"] = False
            if "issues_found" not in analysis_result:
                analysis_result["issues_found"] = []

            return analysis_result

        except json.JSONDecodeError:
            # Se não conseguir parsear JSON, criar resposta genérica
            return {
                "match": False,
                "confidence_score": 50,
                "issues_found": ["Resposta da IA em formato inválido"],
                "recommendation": "review",
                "analysis_details": ai_response_text
            }

    except Exception as e:
        print(f"Erro na análise com IA: {e}")
        return {
            "match": False,
            "confidence_score": 0,
            "issues_found": [f"Erro técnico: {str(e)}"],
            "recommendation": "review",
            "analysis_details": "Falha ao processar análise"
        }

def calculate_business_days(start_date: datetime, days: int) -> datetime:
    """Calcula data após N dias úteis (ignora fins de semana)"""
    current_date = start_date
    days_added = 0

    while days_added < days:
        current_date += timedelta(days=1)
        # Segunda=0, Domingo=6
        if current_date.weekday() < 5:  # Segunda a Sexta
            days_added += 1

    return current_date

# ============================================
# ENDPOINTS - SHIPPING / MERCADO ENVIOS
# ============================================

class AddressUpdate(BaseModel):
    address_zipcode: str
    address_street: str
    address_number: str
    address_complement: Optional[str] = None
    address_neighborhood: str
    address_city: str
    address_state: str

class ShippingCalculate(BaseModel):
    product_id: int
    zipcode: str  # CEP do comprador

@app.get("/user/address")
async def get_user_address(current_user: User = Depends(get_current_user)):
    """Retorna endereço salvo do usuário"""
    return {
        "zipcode": current_user.address_zipcode,
        "street": current_user.address_street,
        "number": current_user.address_number,
        "complement": current_user.address_complement,
        "neighborhood": current_user.address_neighborhood,
        "city": current_user.address_city,
        "state": current_user.address_state,
    }

@app.put("/user/address")
async def update_user_address(
    address: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza endereço do usuário"""
    current_user.address_zipcode = address.address_zipcode
    current_user.address_street = address.address_street
    current_user.address_number = address.address_number
    current_user.address_complement = address.address_complement
    current_user.address_neighborhood = address.address_neighborhood
    current_user.address_city = address.address_city
    current_user.address_state = address.address_state

    db.commit()
    print(f"✅ Endereço atualizado para usuário {current_user.username}")

    return {"message": "Endereço atualizado com sucesso"}

@app.post("/shipping/calculate")
async def calculate_shipping(
    shipping_data: ShippingCalculate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calcula opções de frete disponíveis para um produto
    """
    try:
        # Buscar produto
        product = db.query(Product).filter(Product.id == shipping_data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        # Buscar vendedor
        seller = db.query(User).filter(User.id == product.owner_id).first()
        if not seller or not seller.address_zipcode:
            raise HTTPException(
                status_code=400,
                detail="Vendedor precisa cadastrar endereço de envio"
            )

        # Inicializar cliente Mercado Envios
        if not MERCADOPAGO_ACCESS_TOKEN:
            raise HTTPException(status_code=500, detail="Mercado Pago não configurado")

        me_client = MercadoEnviosClient(MERCADOPAGO_ACCESS_TOKEN)

        # Dimensões padrão para jogos/consoles
        # TODO: Permitir que vendedor configure dimensões do produto
        dimensions = {
            "weight": 500,  # 500g padrão
            "length": 20,   # 20cm
            "width": 15,    # 15cm
            "height": 10    # 10cm
        }

        # Calcular frete
        options = me_client.calculate_shipping(
            from_zipcode=seller.address_zipcode,
            to_zipcode=shipping_data.zipcode,
            dimensions=dimensions,
            free_shipping=False
        )

        if not options:
            # Fallback: retornar opções de exemplo dos Correios
            print("⚠️ Mercado Envios não retornou opções, usando fallback")
            options = [
                {
                    "id": "correios_pac",
                    "name": "PAC - Correios",
                    "estimated_delivery_time": "10-15 dias úteis",
                    "cost": 15.00,
                    "carrier": "Correios"
                },
                {
                    "id": "correios_sedex",
                    "name": "SEDEX - Correios",
                    "estimated_delivery_time": "3-5 dias úteis",
                    "cost": 25.00,
                    "carrier": "Correios"
                }
            ]

        print(f"✅ {len(options)} opções de frete calculadas")
        return {"options": options}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao calcular frete: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao calcular frete: {str(e)}")

@app.post("/payment/create", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    💳 CRIA PAGAMENTO COM MERCADO PAGO + ESCROW

    Fluxo:
    1. Valida produto disponível
    2. Cria preferência de pagamento no Mercado Pago
    3. Cria transaction com status 'pending'
    4. Retorna URL de pagamento ou QR Code PIX
    """
    print(f"💳 [PAYMENT] Nova tentativa de pagamento - Produto: {payment_data.product_id}, Usuário: {current_user.username}")

    # Buscar produto e vendedor
    product = db.query(Product).filter(Product.id == payment_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.is_sold:
        raise HTTPException(status_code=400, detail="Produto já vendido")

    if product.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode comprar seu próprio produto")

    # Buscar dados do vendedor
    seller = db.query(User).filter(User.id == product.owner_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")

    # MARKETPLACE: Verificar se vendedor tem Mercado Pago conectado
    if not seller.mp_access_token:
        raise HTTPException(
            status_code=400,
            detail="Este vendedor ainda não conectou sua conta do Mercado Pago. Pagamentos não podem ser processados."
        )

    print(f"💳 [PAYMENT] Vendedor {seller.username} tem MP conectado (ID: {seller.mp_user_id})")
    print(f"💳 [PAYMENT] Usando token do vendedor para criar pagamento com split")

    # Calcular valores
    amount = product.final_price
    platform_fee = amount * (PLATFORM_COMMISSION_PERCENT / 100)
    seller_amount = amount - platform_fee

    print(f"💰 [PAYMENT] Valor total: R$ {amount:.2f}")
    print(f"💰 [PAYMENT] Comissão plataforma ({PLATFORM_COMMISSION_PERCENT}%): R$ {platform_fee:.2f}")
    print(f"💰 [PAYMENT] Valor para vendedor: R$ {seller_amount:.2f}")

    try:
        # Inicializar SDK do MP com o token do VENDEDOR
        seller_mp_sdk = mercadopago.SDK(seller.mp_access_token)

        # Criar preferência de pagamento usando conta do vendedor
        preference_data = {
            "items": [
                {
                    "title": product.title,
                    "description": product.description[:256] if product.description else "",
                    "quantity": 1,
                    "unit_price": float(amount),
                    "currency_id": "BRL"
                }
            ],
            "payer": {
                "name": current_user.full_name,
                "email": current_user.email
            },
            "back_urls": {
                "success": "https://gamer-marketplace.onrender.com/payment/success",
                "failure": "https://gamer-marketplace.onrender.com/payment/failure",
                "pending": "https://gamer-marketplace.onrender.com/payment/pending"
            },
            "auto_return": "approved",
            "external_reference": f"product_{product.id}_buyer_{current_user.id}",
            "statement_descriptor": "RETROTRADE BRASIL",
            "notification_url": "https://gamer-marketplace.onrender.com/webhook/mercadopago",
            # MARKETPLACE: Comissão da plataforma
            "marketplace_fee": float(platform_fee)
        }

        # Se for PIX, adicionar configuração específica
        if payment_data.payment_method_id == "pix":
            preference_data["payment_methods"] = {
                "excluded_payment_types": [
                    {"id": "credit_card"},
                    {"id": "debit_card"},
                    {"id": "ticket"}
                ]
            }

        print(f"💳 [PAYMENT] Criando preferência no Mercado Pago com token do vendedor...")
        print(f"📋 [PAYMENT] Marketplace fee: R$ {platform_fee:.2f}")

        try:
            preference_response = seller_mp_sdk.preference().create(preference_data)
            print(f"✅ [PAYMENT] Resposta do MP recebida")
            print(f"📦 [PAYMENT] Type da resposta: {type(preference_response)}")
            print(f"📦 [PAYMENT] Keys da resposta: {preference_response.keys() if isinstance(preference_response, dict) else 'Não é dict'}")
            print(f"📦 [PAYMENT] Resposta completa: {preference_response}")
        except Exception as mp_error:
            print(f"❌ [PAYMENT] Erro ao chamar MP SDK: {mp_error}")
            raise Exception(f"Erro ao criar preferência no Mercado Pago: {str(mp_error)}")

        # Tentar diferentes estruturas de resposta
        preference = None
        preference_id = None

        # Estrutura 1: response.response.id
        if isinstance(preference_response, dict):
            if "response" in preference_response:
                preference = preference_response["response"]
                preference_id = preference.get("id")
                print(f"📍 [PAYMENT] Encontrado via response.response.id: {preference_id}")

            # Estrutura 2: response.id (direto)
            if not preference_id and "id" in preference_response:
                preference_id = preference_response["id"]
                preference = preference_response
                print(f"📍 [PAYMENT] Encontrado via response.id: {preference_id}")

        # Verificar se tem ID
        if not preference_id:
            print(f"❌ [PAYMENT] Preference sem ID!")
            print(f"❌ [PAYMENT] Response completa: {preference_response}")
            raise Exception("Mercado Pago não retornou ID da preferência. Verifique as credenciais ou status da conta.")

        # Criar transação no banco
        transaction = Transaction(
            product_id=product.id,
            buyer_id=current_user.id,
            seller_id=product.owner_id,
            mp_preference_id=preference_id,
            amount=amount,
            platform_fee=platform_fee,
            seller_amount=seller_amount,
            status="pending",
            mp_status="pending"
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        # Retornar resposta
        response_data = {
            "transaction_id": transaction.id,
            "payment_id": None,  # Será preenchido após o pagamento ser processado
            "mp_preference_id": preference["id"],
            "init_point": preference["init_point"],  # URL para web
            "status": transaction.status,
            "amount": amount
        }

        # Se for PIX, incluir QR Code
        if payment_data.payment_method_id == "pix" and "point_of_interaction" in preference:
            poi = preference.get("point_of_interaction", {})
            if "transaction_data" in poi:
                response_data["qr_code"] = poi["transaction_data"].get("qr_code")
                response_data["qr_code_text"] = poi["transaction_data"].get("qr_code_base64")

        return PaymentResponse(**response_data)

    except Exception as e:
        db.rollback()
        print(f"❌ [PAYMENT] ERRO FINAL: {str(e)}")
        import traceback
        print(f"❌ [PAYMENT] Traceback completo:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao criar pagamento: {str(e)}")

@app.get("/payment/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    📊 CONSULTA STATUS DE TRANSAÇÃO

    Retorna detalhes completos da transação incluindo:
    - Status do pagamento
    - Status do escrow
    - Data de auto-liberação
    - Informações de envio
    """
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    # Verificar permissão (comprador ou vendedor)
    if transaction.buyer_id != current_user.id and transaction.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para acessar esta transação")

    return transaction

@app.post("/payment/{transaction_id}/ship")
async def mark_as_shipped(
    transaction_id: int,
    ship_data: ShipProductRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    📦 VENDEDOR MARCA PRODUTO COMO ENVIADO

    - Atualiza status para 'shipped'
    - Define data de auto-liberação (3 dias úteis)
    - Notifica comprador
    """
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    if transaction.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas o vendedor pode marcar como enviado")

    if transaction.status != "paid":
        raise HTTPException(status_code=400, detail="Pagamento ainda não aprovado")

    # Atualizar transação
    transaction.status = "shipped"
    transaction.tracking_code = ship_data.tracking_code
    transaction.shipped_at = datetime.utcnow()

    # Calcular data de auto-liberação (3 dias úteis)
    auto_release_days = int(os.getenv("AUTO_RELEASE_DAYS", 3))
    transaction.auto_release_date = calculate_business_days(datetime.utcnow(), auto_release_days)

    db.commit()

    return {
        "success": True,
        "message": "Produto marcado como enviado",
        "tracking_code": ship_data.tracking_code,
        "auto_release_date": transaction.auto_release_date
    }

@app.post("/payment/{transaction_id}/verify-video")
async def upload_verification_video(
    transaction_id: int,
    video_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    🎥 COMPRADOR ENVIA VÍDEO DE VERIFICAÇÃO

    - Extrai frames do vídeo
    - Aciona IA (Claude Vision) para análise automática
    - Se score >= 85: Libera pagamento automaticamente
    - Se score < 85: Requer revisão manual
    """
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    if transaction.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas o comprador pode enviar vídeo")

    if transaction.status != "shipped":
        raise HTTPException(status_code=400, detail="Produto ainda não foi enviado")

    try:
        # Ler vídeo
        video_content = await video_file.read()

        # Validar tamanho (max 100MB)
        if len(video_content) > 100 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Vídeo muito grande. Máximo 100MB.")

        # Salvar vídeo (em produção, salvar em S3/Cloud Storage)
        video_base64 = base64.b64encode(video_content[:1000]).decode('utf-8')  # Truncado
        video_url = f"data:video/mp4;base64,{video_base64}..."

        # PASSO 1: Extrair frames do vídeo
        print(f"📹 Extraindo frames do vídeo... (tamanho: {len(video_content) / 1024 / 1024:.2f}MB)")
        video_frames = extract_frames_from_video(video_content, num_frames=5)

        if not video_frames:
            raise HTTPException(status_code=400, detail="Não foi possível extrair frames do vídeo")

        print(f"✅ {len(video_frames)} frames extraídos com sucesso")

        # PASSO 2: Buscar produto para comparação
        product = db.query(Product).filter(Product.id == transaction.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        # PASSO 3: Analisar com IA
        print(f"🤖 Iniciando análise com Claude Vision...")
        ai_analysis = await analyze_video_with_ai(video_frames, product, db)

        print(f"✅ Análise concluída - Score: {ai_analysis['confidence_score']}/100")

        # PASSO 4: Salvar resultados
        transaction.verification_video_url = video_url
        transaction.verification_video_uploaded_at = datetime.utcnow()
        transaction.ai_verification_result = json.dumps(ai_analysis, ensure_ascii=False)
        transaction.ai_verification_score = ai_analysis['confidence_score']
        transaction.ai_verified_at = datetime.utcnow()

        # PASSO 5: Decidir ação baseada no score
        score = ai_analysis['confidence_score']
        recommendation = ai_analysis['recommendation']

        if score >= 85 and recommendation == "approve":
            # ✅ APROVAÇÃO AUTOMÁTICA - Liberar pagamento
            transaction.status = "verified"
            transaction.release_type = "ai_verified"

            # Liberar pagamento imediatamente
            transaction.released_at = datetime.utcnow()
            transaction.status = "released"

            # Marcar produto como vendido
            product.is_sold = True

            db.commit()

            return {
                "success": True,
                "auto_approved": True,
                "message": "✅ IA verificou o produto! Pagamento liberado automaticamente.",
                "transaction_id": transaction.id,
                "ai_score": score,
                "analysis": ai_analysis
            }

        elif score >= 70:
            # ⚠️ REVISÃO MANUAL NECESSÁRIA
            transaction.status = "video_uploaded"
            db.commit()

            return {
                "success": True,
                "auto_approved": False,
                "message": "⚠️ Vídeo recebido. Requer revisão manual (score intermediário).",
                "transaction_id": transaction.id,
                "ai_score": score,
                "analysis": ai_analysis,
                "next_action": "Um administrador irá revisar em até 24h."
            }

        else:
            # ❌ POSSÍVEL PROBLEMA DETECTADO
            transaction.status = "video_uploaded"
            db.commit()

            return {
                "success": True,
                "auto_approved": False,
                "message": "⚠️ IA detectou possíveis inconsistências. Revisão manual necessária.",
                "transaction_id": transaction.id,
                "ai_score": score,
                "issues_found": ai_analysis.get('issues_found', []),
                "next_action": "Um administrador irá analisar o caso."
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao processar vídeo: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar vídeo: {str(e)}")

@app.post("/payment/{transaction_id}/release")
async def release_payment(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    💰 LIBERA PAGAMENTO PARA VENDEDOR

    Pode ser acionado por:
    - IA após análise do vídeo
    - Sistema após 3 dias úteis
    - Admin manualmente
    """
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    # Verificar permissão (admin ou sistema pode liberar)
    # Por enquanto permitindo qualquer usuário envolvido
    if transaction.buyer_id != current_user.id and transaction.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão")

    if transaction.status in ["released", "refunded"]:
        raise HTTPException(status_code=400, detail="Pagamento já foi processado")

    # Liberar pagamento
    transaction.status = "released"
    transaction.released_at = datetime.utcnow()
    transaction.release_type = "manual"

    # Marcar produto como vendido
    product = db.query(Product).filter(Product.id == transaction.product_id).first()
    if product:
        product.is_sold = True

    db.commit()

    return {
        "success": True,
        "message": "Pagamento liberado para vendedor",
        "seller_amount": transaction.seller_amount
    }

@app.post("/payment/{transaction_id}/dispute")
async def open_dispute(
    transaction_id: int,
    dispute_data: DisputeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    ⚠️ COMPRADOR ABRE RECLAMAÇÃO

    - Congela auto-liberação
    - Notifica vendedor e admin
    - Aguarda resolução manual
    """
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    if transaction.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas o comprador pode abrir reclamação")

    if transaction.status in ["released", "refunded"]:
        raise HTTPException(status_code=400, detail="Transação já finalizada")

    transaction.status = "disputed"
    transaction.dispute_reason = dispute_data.reason
    transaction.dispute_opened_at = datetime.utcnow()

    db.commit()

    return {
        "success": True,
        "message": "Reclamação aberta. Um admin irá analisar.",
        "transaction_id": transaction.id
    }

@app.post("/webhook/mercadopago")
async def mercadopago_webhook(request: dict, db: Session = Depends(get_db)):
    """
    🔔 WEBHOOK MERCADO PAGO

    Recebe notificações de mudanças no status do pagamento
    """
    try:
        # Extrair dados do webhook
        topic = request.get("topic") or request.get("type")
        resource_id = request.get("data", {}).get("id") or request.get("id")

        if topic == "payment":
            # Buscar informações do pagamento no MP
            payment_info = mp_sdk.payment().get(resource_id)
            payment = payment_info["response"]

            # Buscar transação pelo external_reference ou payment_id
            payment_id = str(payment["id"])
            transaction = db.query(Transaction).filter(
                Transaction.payment_id == payment_id
            ).first()

            if transaction:
                # Atualizar status
                old_status = transaction.mp_status
                new_status = payment["status"]

                transaction.payment_id = payment_id
                transaction.mp_status = new_status

                # Se foi aprovado, mudar status para 'paid'
                if new_status == "approved" and old_status != "approved":
                    transaction.status = "paid"
                elif new_status in ["rejected", "cancelled"]:
                    transaction.status = "cancelled"

                db.commit()

        return {"success": True}

    except Exception as e:
        print(f"Erro no webhook: {e}")
        return {"success": False, "error": str(e)}

# Endpoint para listar transações do usuário
@app.get("/my-transactions", response_model=List[TransactionResponse])
async def list_my_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    as_buyer: bool = True
):
    """
    📋 LISTA TRANSAÇÕES DO USUÁRIO

    - as_buyer=true: compras
    - as_buyer=false: vendas
    """
    if as_buyer:
        transactions = db.query(Transaction).filter(
            Transaction.buyer_id == current_user.id
        ).order_by(desc(Transaction.created_at)).all()
    else:
        transactions = db.query(Transaction).filter(
            Transaction.seller_id == current_user.id
        ).order_by(desc(Transaction.created_at)).all()

    return transactions

# ============================================
# AUTO-RELEASE SCHEDULER (3 DIAS ÚTEIS)
# ============================================

def auto_release_payments_job():
    """
    Job que roda periodicamente para liberar pagamentos automaticamente
    após 3 dias úteis sem confirmação do comprador

    Rodará a cada 1 hora
    """
    print("🕐 [Auto-Release Job] Verificando transações pendentes...")

    # Criar sessão do banco
    db = SessionLocal()

    try:
        now = datetime.utcnow()

        # Buscar transações com status 'shipped' e data de auto-liberação vencida
        pending_transactions = db.query(Transaction).filter(
            Transaction.status == "shipped",
            Transaction.auto_release_date <= now
        ).all()

        if not pending_transactions:
            print("✅ [Auto-Release Job] Nenhuma transação para liberar")
            return

        print(f"📦 [Auto-Release Job] {len(pending_transactions)} transação(ões) para liberar")

        released_count = 0

        for transaction in pending_transactions:
            try:
                # Liberar pagamento
                transaction.status = "released"
                transaction.released_at = datetime.utcnow()
                transaction.release_type = "auto"

                # Marcar produto como vendido
                product = db.query(Product).filter(Product.id == transaction.product_id).first()
                if product:
                    product.is_sold = True

                db.commit()
                released_count += 1

                print(f"✅ [Auto-Release Job] Transação #{transaction.id} liberada automaticamente")

                # TODO: Enviar notificação para vendedor
                # TODO: Enviar email para comprador informando que prazo expirou

            except Exception as e:
                print(f"❌ [Auto-Release Job] Erro ao liberar transação #{transaction.id}: {e}")
                db.rollback()
                continue

        print(f"🎉 [Auto-Release Job] {released_count}/{len(pending_transactions)} pagamentos liberados")

    except Exception as e:
        print(f"❌ [Auto-Release Job] Erro geral: {e}")
    finally:
        db.close()

# Inicializar scheduler
scheduler = BackgroundScheduler()

# Agendar job para rodar a cada 1 hora
scheduler.add_job(
    func=auto_release_payments_job,
    trigger=CronTrigger(minute=0),  # Roda toda hora cheia (XX:00)
    id='auto_release_payments',
    name='Auto-release payments after 3 business days',
    replace_existing=True
)

# Iniciar scheduler quando o FastAPI iniciar
@app.on_event("startup")
async def startup_event():
    """Evento executado quando a API inicia"""
    print("🚀 Iniciando scheduler de auto-liberação...")
    scheduler.start()
    print("✅ Scheduler iniciado com sucesso!")
    print("⏰ Job 'auto_release_payments' rodará a cada 1 hora")

@app.on_event("shutdown")
async def shutdown_event():
    """Evento executado quando a API é desligada"""
    print("🛑 Desligando scheduler...")
    scheduler.shutdown()
    print("✅ Scheduler desligado")

# Endpoint manual para forçar execução do job (útil para testes)
@app.post("/admin/run-auto-release")
async def manually_run_auto_release(current_user: User = Depends(get_current_user)):
    """
    🔧 ADMIN: Executa job de auto-liberação manualmente

    Útil para testes ou para forçar execução fora do horário
    """
    # TODO: Adicionar verificação de admin
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Apenas admins")

    auto_release_payments_job()

    return {
        "success": True,
        "message": "Job de auto-liberação executado manualmente"
    }


# ============================================
# ENDPOINTS - ASSISTENTE DE MANUTENÇÃO 🛠️
# ============================================

@app.post("/maintenance/chat")
async def maintenance_chat(
    message: str = Form(...),
    console: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user)
):
    """
    🛠️ CHAT COM ASSISTENTE DE MANUTENÇÃO

    Chatbot especializado em diagnóstico e reparo de consoles retro
    Aceita texto, fotos e vídeos para análise
    """
    try:
        # Process images if provided
        image_data_list = []
        if images:
            for img_file in images[:3]:  # Max 3 images
                img_data = await img_file.read()
                image_data_list.append(img_data)

        # Get AI response
        result = maintenance_assistant.analyze_problem(
            user_message=message,
            images=image_data_list if image_data_list else None
        )

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro ao processar"))

        return {
            "success": True,
            "response": result["response"],
            "has_media": result.get("has_media", False)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")


@app.post("/maintenance/start")
async def start_maintenance_session(
    console: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    🚀 INICIAR SESSÃO DE MANUTENÇÃO

    Inicia uma nova conversa com o assistente de manutenção
    """
    try:
        greeting = maintenance_assistant.start_conversation(console)

        return {
            "success": True,
            "greeting": greeting
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")


@app.get("/maintenance/tips/{console}")
async def get_maintenance_tips(
    console: str,
    current_user: User = Depends(get_current_user)
):
    """
    💡 DICAS DE MANUTENÇÃO PREVENTIVA

    Retorna dicas específicas para manutenção de um console
    """
    try:
        result = maintenance_assistant.get_quick_tips(console)

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro ao buscar dicas"))

        # Try to parse JSON response
        response_text = result["response"]
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                tips_data = json.loads(response_text[json_start:json_end])
                return {
                    "success": True,
                    "tips": tips_data
                }
        except:
            pass

        return {
            "success": True,
            "tips": response_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")


@app.post("/maintenance/diagnose")
async def diagnose_problem(
    console: str,
    problem_description: str,
    media: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    🔍 DIAGNÓSTICO POR FOTO/VÍDEO

    Envia foto ou vídeo do problema para diagnóstico automático
    """
    try:
        # Read media file
        media_data = await media.read()

        # Determine media type
        media_type = "image"
        if media.filename and any(ext in media.filename.lower() for ext in ['.mp4', '.mov', '.avi']):
            media_type = "video"

        # Get diagnosis
        result = maintenance_assistant.identify_problem_from_media(
            console=console,
            problem_description=problem_description,
            media_data=media_data,
            media_type=media_type
        )

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro ao diagnosticar"))

        # Try to parse JSON response
        response_text = result["response"]
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                diagnosis_data = json.loads(response_text[json_start:json_end])
                return {
                    "success": True,
                    "diagnosis": diagnosis_data,
                    "raw_response": response_text
                }
        except:
            pass

        return {
            "success": True,
            "diagnosis": None,
            "raw_response": response_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
