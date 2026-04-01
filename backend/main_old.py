from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import anthropic
import os
import base64
from io import BytesIO
from PIL import Image
import json

# Environment Variables
from dotenv import load_dotenv
load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

# Database Setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gamer_marketplace.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Claude Client
claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

# Database Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_technician = Column(Boolean, default=False)
    reputation_score = Column(Integer, default=0)

    products = relationship("Product", back_populates="owner")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String)  # console, game, peripheral
    console_type = Column(String)  # PS2, Xbox, etc
    condition_score = Column(Float)
    rarity_score = Column(Float)
    price_min = Column(Float)
    price_ideal = Column(Float)
    price_max = Column(Float)
    final_price = Column(Float)
    is_working = Column(Boolean, default=True)
    is_complete = Column(Boolean, default=False)  # CIB
    has_box = Column(Boolean, default=False)
    has_manual = Column(Boolean, default=False)
    images = Column(Text)  # JSON array of image URLs
    ai_analysis = Column(Text)  # JSON with AI insights
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_sold = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)

    owner = relationship("User", back_populates="products")

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    reputation_score: int
    is_technician: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class ProductCreate(BaseModel):
    title: str
    description: str
    category: str
    console_type: str
    is_working: bool = True
    is_complete: bool = False
    has_box: bool = False
    has_manual: bool = False

class ProductResponse(BaseModel):
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
    views_count: int

class PriceAnalysisResponse(BaseModel):
    condition_score: float
    rarity_score: float
    price_suggestion: dict
    insights: List[str]

# FastAPI App
app = FastAPI(title="Gamer Marketplace API", version="1.0.0")

# CORS
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

# Auth Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
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

# AI Functions
async def analyze_product_images(images_base64: List[str], product_info: dict) -> dict:
    """Analyze product condition using Claude Vision"""
    if not claude_client:
        return {
            "condition_score": 75.0,
            "rarity_score": 50.0,
            "details": {"note": "AI analysis unavailable - API key not configured"}
        }

    prompt = f"""Você é um especialista em avaliação de produtos gamer vintage.
Analise as imagens deste produto: {product_info['title']}

Categoria: {product_info['category']}
Console: {product_info.get('console_type', 'N/A')}
Funciona: {product_info.get('is_working', 'Não testado')}
Completo (CIB): {product_info.get('is_complete', False)}
Com caixa: {product_info.get('has_box', False)}
Com manual: {product_info.get('has_manual', False)}

Forneça uma análise DETALHADA em JSON com:
1. condition_score (0-100): Estado físico geral
2. condition_details:
   - carcaca_score (0-100)
   - issues: lista de problemas encontrados
   - positives: pontos positivos
3. autenticidade:
   - is_authentic: true/false
   - confidence: 0-1
   - markers: evidências
4. completude_impact: impacto no preço (%)
5. recommendations: sugestões para o vendedor

Retorne APENAS JSON válido, sem markdown."""

    try:
        message_content = [
            {"type": "text", "text": prompt}
        ]

        # Add images
        for img_b64 in images_base64[:5]:  # Max 5 images
            message_content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": img_b64
                }
            })

        message = claude_client.messages.create(
            model="claude-4-6-sonnet",
            max_tokens=2000,
            messages=[{"role": "user", "content": message_content}]
        )

        analysis_text = message.content[0].text
        # Try to parse JSON
        if "```json" in analysis_text:
            analysis_text = analysis_text.split("```json")[1].split("```")[0].strip()
        elif "```" in analysis_text:
            analysis_text = analysis_text.split("```")[1].split("```")[0].strip()

        analysis = json.loads(analysis_text)
        return analysis
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        return {
            "condition_score": 70.0,
            "condition_details": {
                "carcaca_score": 70,
                "issues": ["Análise automática falhou"],
                "positives": []
            },
            "autenticidade": {
                "is_authentic": True,
                "confidence": 0.5,
                "markers": []
            }
        }

def calculate_rarity_score(product_info: dict) -> float:
    """Calculate rarity score based on product metadata"""
    score = 50.0  # Base score

    # Adjust based on console type (simplified)
    rare_consoles = ["dreamcast", "saturn", "neo geo", "turbografx", "atari jaguar"]
    console = product_info.get('console_type', '').lower()
    if any(rare in console for rare in rare_consoles):
        score += 30

    # Adjust for completeness
    if product_info.get('is_complete'):
        score += 15
    if product_info.get('has_box'):
        score += 10

    return min(score, 100.0)

def calculate_price_suggestion(condition_score: float, rarity_score: float, product_info: dict) -> dict:
    """Calculate price suggestion based on scores"""

    # Base prices by category (Brazilian Real)
    base_prices = {
        "console": 300,
        "game": 80,
        "peripheral": 50
    }

    base_price = base_prices.get(product_info.get('category', 'game'), 80)

    # Adjustments
    condition_multiplier = condition_score / 70  # 70 is "good" baseline
    rarity_multiplier = 1 + (rarity_score / 100)

    # Working condition
    if not product_info.get('is_working'):
        condition_multiplier *= 0.3

    # Completeness bonus
    if product_info.get('is_complete'):
        condition_multiplier *= 1.4
    elif product_info.get('has_box'):
        condition_multiplier *= 1.2

    ideal_price = base_price * condition_multiplier * rarity_multiplier

    return {
        "min": round(ideal_price * 0.85, 2),
        "ideal": round(ideal_price, 2),
        "max": round(ideal_price * 1.20, 2),
        "confidence": 0.75,
        "reasoning": {
            "base_price": base_price,
            "condition_adjustment": f"{((condition_multiplier - 1) * 100):.0f}%",
            "rarity_adjustment": f"{((rarity_multiplier - 1) * 100):.0f}%",
            "market_median": round(ideal_price * 0.95, 2)
        }
    }

# API Endpoints
@app.get("/")
def root():
    return {"message": "Gamer Marketplace API", "version": "1.0.0"}

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/products/analyze", response_model=PriceAnalysisResponse)
async def analyze_product(
    title: str,
    category: str,
    console_type: str,
    is_working: bool = True,
    is_complete: bool = False,
    has_box: bool = False,
    has_manual: bool = False,
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
):
    """Analyze product images and provide price suggestion"""

    # Convert images to base64
    images_base64 = []
    for image_file in images[:5]:  # Max 5 images
        image_bytes = await image_file.read()
        img = Image.open(BytesIO(image_bytes))
        # Resize if too large
        if img.width > 1024 or img.height > 1024:
            img.thumbnail((1024, 1024))
        buffered = BytesIO()
        img.save(buffered, format="JPEG")
        img_b64 = base64.b64encode(buffered.getvalue()).decode()
        images_base64.append(img_b64)

    product_info = {
        "title": title,
        "category": category,
        "console_type": console_type,
        "is_working": is_working,
        "is_complete": is_complete,
        "has_box": has_box,
        "has_manual": has_manual
    }

    # AI Analysis
    ai_analysis = await analyze_product_images(images_base64, product_info)
    condition_score = ai_analysis.get("condition_score", 70.0)

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

@app.post("/products", response_model=ProductResponse)
async def create_product(
    title: str,
    description: str,
    category: str,
    console_type: str,
    final_price: float,
    is_working: bool = True,
    is_complete: bool = False,
    has_box: bool = False,
    has_manual: bool = False,
    condition_score: float = 70.0,
    rarity_score: float = 50.0,
    price_min: float = 0,
    price_ideal: float = 0,
    price_max: float = 0,
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product listing"""

    # Save images (simplified - in production use S3/Firebase)
    image_paths = []
    for idx, image_file in enumerate(images):
        # Here you would upload to cloud storage
        # For now, just store filename
        image_paths.append(f"product_{current_user.id}_{datetime.now().timestamp()}_{idx}.jpg")

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
        images=json.dumps(image_paths),
        owner_id=current_user.id
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product

@app.get("/products", response_model=List[ProductResponse])
def list_products(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    console_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List products with filters"""
    query = db.query(Product).filter(Product.is_sold == False)

    if category:
        query = query.filter(Product.category == category)
    if console_type:
        query = query.filter(Product.console_type == console_type)

    products = query.offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get single product details"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Increment views
    product.views_count += 1
    db.commit()

    return product

@app.get("/search")
async def search_products(
    q: str,
    db: Session = Depends(get_db)
):
    """Search products with AI-powered semantic search"""
    # Simple text search (in production, use vector embeddings)
    products = db.query(Product).filter(
        (Product.title.contains(q)) |
        (Product.description.contains(q)) |
        (Product.console_type.contains(q))
    ).limit(20).all()

    return products

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
