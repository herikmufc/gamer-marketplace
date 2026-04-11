"""
Insere cheats diretamente no banco de dados
Execute: python insert_cheats.py
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gamer_marketplace_v2.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Cheat(Base):
    __tablename__ = "cheats"
    id = Column(Integer, primary_key=True, index=True)
    game_title = Column(String(255), nullable=False, index=True)
    console = Column(String(100), nullable=False, index=True)
    genre = Column(String(100), nullable=True, index=True)
    cheat_title = Column(String(255), nullable=False)
    cheat_code = Column(Text, nullable=False)
    cheat_type = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    difficulty = Column(String(20), nullable=True)
    verified = Column(Boolean, default=False)
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    submitted_by_user_id = Column(Integer, nullable=True)

# Dados dos cheats (do arquivo anterior)
CHEATS = [
    {"game_title": "Mortal Kombat", "console": "SNES", "genre": "Fighting", "cheat_title": "Menu de Cheats", "cheat_code": "No menu principal, pressione: Down, Up, Left, Left, A, Right, Down", "cheat_type": "button_combo", "description": "Abre menu secreto com várias opções de cheats", "difficulty": "easy", "verified": True, "upvotes": 42},
    {"game_title": "Super Mario World", "console": "SNES", "genre": "Platform", "cheat_title": "96 Saídas Secretas", "cheat_code": "Star World + Special World", "cheat_type": "secret", "description": "Complete Star World para desbloquear Special World", "difficulty": "medium", "verified": True, "upvotes": 38},
    {"game_title": "Donkey Kong Country", "console": "SNES", "genre": "Platform", "cheat_title": "50 Vidas", "cheat_code": "No menu principal: B, A, R, R, A, L", "cheat_type": "button_combo", "description": "Começa o jogo com 50 vidas", "difficulty": "easy", "verified": True, "upvotes": 55},
    {"game_title": "Contra", "console": "NES", "genre": "Action", "cheat_title": "30 Vidas (Código Konami)", "cheat_code": "Na tela título: ↑↑↓↓←→←→BA", "cheat_type": "button_combo", "description": "O código Konami mais famoso! Dá 30 vidas", "difficulty": "easy", "verified": True, "upvotes": 150},
    {"game_title": "Super Mario Bros", "console": "NES", "genre": "Platform", "cheat_title": "Mundo -1 (Minus World)", "cheat_code": "Mundo 1-2: Quebre tijolo, entre no tubo atravessando a parede", "cheat_type": "glitch", "description": "Acessa o famoso 'Minus World', um glitch infinito", "difficulty": "hard", "verified": True, "upvotes": 89},
    {"game_title": "Mike Tyson's Punch-Out!!", "console": "NES", "genre": "Sports", "cheat_title": "Pular para Mike Tyson", "cheat_code": "Password: 007 373 5963", "cheat_type": "password", "description": "Vai direto para a luta final contra Mike Tyson", "difficulty": "easy", "verified": True, "upvotes": 67},
    {"game_title": "Crash Bandicoot", "console": "PS1", "genre": "Platform", "cheat_title": "99 Vidas", "cheat_code": "Tela de senha: △ △ △ △ X ■ △ △ △ △", "cheat_type": "password", "description": "Começa com 99 vidas", "difficulty": "medium", "verified": True, "upvotes": 73},
    {"game_title": "Gran Turismo 2", "console": "PS1", "genre": "Racing", "cheat_title": "Todos os Carros", "cheat_code": "Nome: RACING (tudo maiúsculo)", "cheat_type": "password", "description": "Desbloqueia todos os carros", "difficulty": "easy", "verified": True, "upvotes": 51},
    {"game_title": "Tony Hawk's Pro Skater 2", "console": "PS1", "genre": "Sports", "cheat_title": "Spider-Man Skatista", "cheat_code": "Colete todos os tapes secretos", "cheat_type": "unlock", "description": "Desbloqueia Spider-Man como personagem jogável", "difficulty": "hard", "verified": True, "upvotes": 92},
    {"game_title": "Grand Theft Auto: San Andreas", "console": "PS2", "genre": "Action", "cheat_title": "Vida e Colete Máximos", "cheat_code": "R1, R2, L1, X, ←, ↓, →, ↑, ←, ↓, →, ↑", "cheat_type": "button_combo", "description": "Máximo de vida e colete", "difficulty": "medium", "verified": True, "upvotes": 124},
    {"game_title": "Grand Theft Auto: San Andreas", "console": "PS2", "genre": "Action", "cheat_title": "Jetpack", "cheat_code": "←, →, L1, L2, R1, R2, ↑, ↓, ←, →", "cheat_type": "button_combo", "description": "Spawna um jetpack", "difficulty": "medium", "verified": True, "upvotes": 156},
    {"game_title": "Grand Theft Auto: San Andreas", "console": "PS2", "genre": "Action", "cheat_title": "Armas Nível 1", "cheat_code": "R1, R2, L1, R2, ←, ↓, →, ↑, ←, ↓, →, ↑", "cheat_type": "button_combo", "description": "Dá armas do primeiro set", "difficulty": "easy", "verified": True, "upvotes": 98},
    {"game_title": "God of War", "console": "PS2", "genre": "Action", "cheat_title": "Modo Deus", "cheat_code": "Complete o jogo duas vezes", "cheat_type": "unlock", "description": "Desbloqueia God Mode com dano infinito", "difficulty": "hard", "verified": True, "upvotes": 78},
    {"game_title": "Sonic the Hedgehog", "console": "Genesis", "genre": "Platform", "cheat_title": "Level Select", "cheat_code": "Tela título: ↑, ↓, ←, →, segure A + Start", "cheat_type": "button_combo", "description": "Menu de seleção de fases", "difficulty": "easy", "verified": True, "upvotes": 61},
    {"game_title": "Sonic 2", "console": "Genesis", "genre": "Platform", "cheat_title": "Super Sonic desde o início", "cheat_code": "Sound Test: 19, 65, 09, 17, depois segure A + Start", "cheat_type": "password", "description": "Começa com todas as Chaos Emeralds", "difficulty": "medium", "verified": True, "upvotes": 85},
    {"game_title": "Mortal Kombat II", "console": "Genesis", "genre": "Fighting", "cheat_title": "Sangue Ativado", "cheat_code": "Antes da luta: A, B, A, C, A, B, B", "cheat_type": "button_combo", "description": "Ativa o sangue vermelho (censura removida)", "difficulty": "easy", "verified": True, "upvotes": 54},
    {"game_title": "Pokémon Red/Blue", "console": "Game Boy", "genre": "RPG", "cheat_title": "Capturar Mew", "cheat_code": "Glitch do Nugget Bridge: evite certos treinadores, fly trick", "cheat_type": "glitch", "description": "Glitch complexo para capturar Mew sem eventos", "difficulty": "hard", "verified": True, "upvotes": 203},
    {"game_title": "The Legend of Zelda: Link's Awakening", "console": "Game Boy", "genre": "Adventure", "cheat_title": "Nome ZELDA", "cheat_code": "Nome do arquivo: ZELDA", "cheat_type": "password", "description": "Começa com música diferente", "difficulty": "easy", "verified": True, "upvotes": 45},
    {"game_title": "GoldenEye 007", "console": "N64", "genre": "FPS", "cheat_title": "DK Mode", "cheat_code": "Pause: L+R+↑, C→, R+←, R+↑, ↑, R+→, ↑, L+R+C↓, L+R+↓, L+R+C←", "cheat_type": "button_combo", "description": "Cabeças e braços gigantes", "difficulty": "hard", "verified": True, "upvotes": 112},
    {"game_title": "Super Mario 64", "console": "N64", "genre": "Platform", "cheat_title": "Yoshi no Telhado", "cheat_code": "Colete todas as 120 estrelas", "cheat_type": "unlock", "description": "Yoshi aparece no telhado com 100 vidas", "difficulty": "hard", "verified": True, "upvotes": 97},
]

def insert_cheats():
    # Criar tabelas primeiro
    print("📋 Criando tabelas...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas!")

    db = SessionLocal()
    try:
        print("🎮 Inserindo cheats no banco...")

        # Verifica quantos já existem
        existing_count = db.query(Cheat).count()
        print(f"📊 Cheats existentes: {existing_count}")

        if existing_count > 0:
            response = input("⚠️  Já existem cheats no banco. Deseja adicionar mais? (s/n): ")
            if response.lower() != 's':
                print("❌ Operação cancelada")
                return

        inserted = 0
        for cheat_data in CHEATS:
            # Verifica se já existe
            existing = db.query(Cheat).filter(
                Cheat.game_title == cheat_data["game_title"],
                Cheat.cheat_title == cheat_data["cheat_title"]
            ).first()

            if existing:
                print(f"⏭️  Já existe: {cheat_data['game_title']} - {cheat_data['cheat_title']}")
                continue

            cheat = Cheat(**cheat_data)
            db.add(cheat)
            inserted += 1
            print(f"✅ [{inserted}] {cheat_data['game_title']} - {cheat_data['cheat_title']}")

        db.commit()
        print(f"\n🎉 {inserted} cheats inseridos com sucesso!")
        print(f"📊 Total de cheats no banco: {db.query(Cheat).count()}")

    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    insert_cheats()
