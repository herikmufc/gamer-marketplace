"""
API Estendida com Chat, Fórum, CPF e Termos Legais
Execute este arquivo em vez de main.py
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
import mercadopago
import gemini_client
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
if MERCADOPAGO_ACCESS_TOKEN:
    mp_sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)

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
    is_active = Column(Boolean, default=True)
    is_technician = Column(Boolean, default=False)
    reputation_score = Column(Integer, default=0)
    terms_accepted_at = Column(DateTime)  # NOVO: Quando aceitou termos
    terms_version = Column(String, default="1.0.0")  # NOVO: Versão dos termos

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
    mp_payment_id = Column(String, unique=True, index=True)  # ID do pagamento no MP
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

def mask_cpf(cpf: str) -> str:
    """Mascara CPF: 123.456.789-**"""
    cpf_clean = re.sub(r'\D', '', cpf)
    return f"{cpf_clean[:3]}.{cpf_clean[3:6]}.{cpf_clean[6:9]}-**"

# ============================================
# ENDPOINTS - AUTH
# ============================================

@app.get("/")
def root():
    return {"message": "RetroTrade Brasil API v2.0", "features": ["Chat", "Forum", "CPF", "Legal Terms"]}

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Validar CPF
    if not validate_cpf(user.cpf):
        raise HTTPException(status_code=400, detail="CPF inválido")

    # Verificar se CPF já existe
    if db.query(User).filter(User.cpf == user.cpf).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado")

    # Verificar email/username
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    if db.query(User).filter(User.username == user.username).first():
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
        terms_version="1.0.0"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Mascarar CPF na resposta
    response = UserResponse.model_validate(db_user)
    response.cpf = mask_cpf(db_user.cpf)
    return response

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retorna dados do usuário autenticado"""
    response = UserResponse.model_validate(current_user)
    response.cpf = mask_cpf(current_user.cpf)
    return response

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
                game_data = json.loads(json_str)

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
    mp_payment_id: Optional[str]
    mp_preference_id: Optional[str]
    init_point: Optional[str]  # URL para redirecionar usuário no MP
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
    mp_payment_id: Optional[str]
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
    if not mp_sdk:
        raise HTTPException(status_code=500, detail="Mercado Pago não configurado")

    # Buscar produto
    product = db.query(Product).filter(Product.id == payment_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.is_sold:
        raise HTTPException(status_code=400, detail="Produto já vendido")

    if product.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode comprar seu próprio produto")

    # Calcular valores
    amount = product.final_price
    platform_fee = amount * (PLATFORM_FEE_PERCENT / 100)
    seller_amount = amount - platform_fee

    try:
        # Criar preferência de pagamento no Mercado Pago
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
                "success": f"http://localhost:8000/payment/success",
                "failure": f"http://localhost:8000/payment/failure",
                "pending": f"http://localhost:8000/payment/pending"
            },
            "auto_return": "approved",
            "external_reference": f"product_{product.id}_buyer_{current_user.id}",
            "statement_descriptor": "RETROTRADE BRASIL",
            "notification_url": "https://your-domain.com/webhook/mercadopago"  # Configurar com domínio real
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

        preference_response = mp_sdk.preference().create(preference_data)
        preference = preference_response["response"]

        # Criar transação no banco
        transaction = Transaction(
            product_id=product.id,
            buyer_id=current_user.id,
            seller_id=product.owner_id,
            mp_preference_id=preference["id"],
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
            mp_payment_id = str(payment["id"])
            transaction = db.query(Transaction).filter(
                Transaction.mp_payment_id == mp_payment_id
            ).first()

            if transaction:
                # Atualizar status
                old_status = transaction.mp_status
                new_status = payment["status"]

                transaction.mp_payment_id = mp_payment_id
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
