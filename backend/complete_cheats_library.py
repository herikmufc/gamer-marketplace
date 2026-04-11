"""
BIBLIOTECA COMPLETA DE CHEATS
Centenas de códigos dos jogos mais famosos de todos os tempos
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gamer_marketplace_v2.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
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
    updated_at = Column(DateTime, default=datetime.utcnow)
    submitted_by_user_id = Column(Integer, nullable=True)

# BIBLIOTECA COMPLETA DE CHEATS
COMPLETE_CHEATS = [
    # ==================== NINTENDO ENTERTAINMENT SYSTEM (NES) ====================
    {"game_title": "Contra", "console": "NES", "genre": "Action", "cheat_title": "30 Vidas (Konami Code)", "cheat_code": "↑↑↓↓←→←→BA", "cheat_type": "button_combo", "description": "O código mais famoso da história dos games!", "difficulty": "easy", "verified": True, "upvotes": 500},
    {"game_title": "Super Mario Bros", "console": "NES", "genre": "Platform", "cheat_title": "Mundo -1 (Minus World)", "cheat_code": "1-2: quebre tijolo, entre no tubo através da parede", "cheat_type": "glitch", "description": "Mundo infinito glitchado", "difficulty": "hard", "verified": True, "upvotes": 234},
    {"game_title": "Super Mario Bros", "console": "NES", "genre": "Platform", "cheat_title": "Pular para mundo 8", "cheat_code": "1-2: Pule na plataforma, entre no tubo warp sem subir", "cheat_type": "secret", "description": "Warp zone para mundo 8", "difficulty": "medium", "verified": True, "upvotes": 156},
    {"game_title": "The Legend of Zelda", "console": "NES", "genre": "Adventure", "cheat_title": "Nome ZELDA", "cheat_code": "Nome do save: ZELDA", "cheat_type": "password", "description": "Começa na segunda quest", "difficulty": "easy", "verified": True, "upvotes": 189},
    {"game_title": "Mike Tyson's Punch-Out!!", "console": "NES", "genre": "Sports", "cheat_title": "Pular para Tyson", "cheat_code": "007 373 5963", "cheat_type": "password", "description": "Luta final contra Mike Tyson", "difficulty": "easy", "verified": True, "upvotes": 145},
    {"game_title": "Teenage Mutant Ninja Turtles II", "console": "NES", "genre": "Beat'em Up", "cheat_title": "10 Vidas", "cheat_code": "Tela título: B, A, B, A, ↑, ↓, B, A, Start", "cheat_type": "button_combo", "description": "Começa com 10 vidas", "difficulty": "easy", "verified": True, "upvotes": 98},
    {"game_title": "Mega Man 2", "console": "NES", "genre": "Action", "cheat_title": "Stage Select", "cheat_code": "Pause, pressione: ↓, →, ←, ←, ←, →, →, ←, ↓, ←, →", "cheat_type": "button_combo", "description": "Escolhe qualquer fase", "difficulty": "medium", "verified": True, "upvotes": 167},
    {"game_title": "Castlevania", "console": "NES", "genre": "Action", "cheat_title": "Pular Intro", "cheat_code": "Pressione Start na tela Konami", "cheat_type": "secret", "description": "Pula a intro do jogo", "difficulty": "easy", "verified": True, "upvotes": 43},
    {"game_title": "Double Dragon", "console": "NES", "genre": "Beat'em Up", "cheat_title": "Level Select", "cheat_code": "Tela título: A, B, B, A, ↑, ↓, A, Start", "cheat_type": "button_combo", "description": "Escolhe a fase", "difficulty": "easy", "verified": True, "upvotes": 76},
    {"game_title": "Metroid", "console": "NES", "genre": "Action", "cheat_title": "JUSTIN BAILEY", "cheat_code": "Password: JUSTIN BAILEY ------ ------", "cheat_type": "password", "description": "Samus sem armadura + itens", "difficulty": "easy", "verified": True, "upvotes": 278},

    # ==================== SUPER NINTENDO (SNES) ====================
    {"game_title": "Super Mario World", "console": "SNES", "genre": "Platform", "cheat_title": "96 Saídas", "cheat_code": "Star World + Special World", "cheat_type": "secret", "description": "Desbloqueie todos os caminhos secretos", "difficulty": "hard", "verified": True, "upvotes": 189},
    {"game_title": "Donkey Kong Country", "console": "SNES", "genre": "Platform", "cheat_title": "50 Vidas", "cheat_code": "Menu: B, A, R, R, A, L", "cheat_type": "button_combo", "description": "BARRAL code", "difficulty": "easy", "verified": True, "upvotes": 234},
    {"game_title": "Mortal Kombat", "console": "SNES", "genre": "Fighting", "cheat_title": "Menu de Cheats", "cheat_code": "Menu: ↓, ↑, ←, ←, A, →, ↓", "cheat_type": "button_combo", "description": "Abre menu secreto", "difficulty": "easy", "verified": True, "upvotes": 156},
    {"game_title": "Street Fighter II Turbo", "console": "SNES", "genre": "Fighting", "cheat_title": "Mesmos Personagens", "cheat_code": "Segure L+R ao selecionar", "cheat_type": "button_combo", "description": "Permite mirror matches", "difficulty": "easy", "verified": True, "upvotes": 123},
    {"game_title": "Super Metroid", "console": "SNES", "genre": "Action", "cheat_title": "Wall Jump Infinito", "cheat_code": "Pule na parede + spin jump repetidamente", "cheat_type": "technique", "description": "Suba qualquer parede", "difficulty": "hard", "verified": True, "upvotes": 201},
    {"game_title": "The Legend of Zelda: A Link to the Past", "console": "SNES", "genre": "Adventure", "cheat_title": "Chris Houlihan Room", "cheat_code": "Sanctuary to Hyrule Castle perfeitamente", "cheat_type": "glitch", "description": "Sala secreta com rupees", "difficulty": "hard", "verified": True, "upvotes": 167},
    {"game_title": "Contra III", "console": "SNES", "genre": "Action", "cheat_title": "30 Vidas", "cheat_code": "Tela título: ↓, ↓, ↓, ↓, ↓, ↓, ↓, L, R", "cheat_type": "button_combo", "description": "Versão SNES do Konami Code", "difficulty": "easy", "verified": True, "upvotes": 178},
    {"game_title": "Super Mario Kart", "console": "SNES", "genre": "Racing", "cheat_title": "Pulo Extra", "cheat_code": "R logo após pular rampa", "cheat_type": "technique", "description": "Pulo mais alto", "difficulty": "medium", "verified": True, "upvotes": 134},
    {"game_title": "Chrono Trigger", "console": "SNES", "genre": "RPG", "cheat_title": "New Game+", "cheat_code": "Complete o jogo uma vez", "cheat_type": "unlock", "description": "Recomeça mantendo níveis", "difficulty": "hard", "verified": True, "upvotes": 298},
    {"game_title": "Final Fantasy VI", "console": "SNES", "genre": "RPG", "cheat_title": "Evitar Battles", "cheat_code": "Equipe Moogle Charm", "cheat_type": "item", "description": "Zero encontros aleatórios", "difficulty": "medium", "verified": True, "upvotes": 145},

    # ==================== SEGA GENESIS ====================
    {"game_title": "Sonic the Hedgehog", "console": "Genesis", "genre": "Platform", "cheat_title": "Level Select", "cheat_code": "↑, ↓, ←, →, segure A + Start", "cheat_type": "button_combo", "description": "Escolhe qualquer fase", "difficulty": "easy", "verified": True, "upvotes": 187},
    {"game_title": "Sonic 2", "console": "Genesis", "genre": "Platform", "cheat_title": "Super Sonic desde início", "cheat_code": "Sound Test: 19, 65, 09, 17 + A+Start", "cheat_type": "password", "description": "Todas Chaos Emeralds", "difficulty": "medium", "verified": True, "upvotes": 234},
    {"game_title": "Sonic 3 & Knuckles", "console": "Genesis", "genre": "Platform", "cheat_title": "Debug Mode", "cheat_code": "Sonic 3: A, C, B, C, C, C, B, C, C, C na tela Sega", "cheat_type": "button_combo", "description": "Modo desenvolvedor completo", "difficulty": "hard", "verified": True, "upvotes": 201},
    {"game_title": "Mortal Kombat II", "console": "Genesis", "genre": "Fighting", "cheat_title": "Sangue Ativado", "cheat_code": "A, B, A, C, A, B, B", "cheat_type": "button_combo", "description": "Remove censura", "difficulty": "easy", "verified": True, "upvotes": 167},
    {"game_title": "Streets of Rage 2", "console": "Genesis", "genre": "Beat'em Up", "cheat_title": "Level Select", "cheat_code": "Segure A+B, aperte →, ↓, ↓, ←", "cheat_type": "button_combo", "description": "Menu de seleção", "difficulty": "easy", "verified": True, "upvotes": 145},
    {"game_title": "Aladdin", "console": "Genesis", "genre": "Platform", "cheat_title": "Level Skip", "cheat_code": "Pause: A, B, B, A, A, B, B, A", "cheat_type": "button_combo", "description": "Pula fase atual", "difficulty": "easy", "verified": True, "upvotes": 98},
    {"game_title": "Ecco the Dolphin", "console": "Genesis", "genre": "Adventure", "cheat_title": "Invencibilidade", "cheat_code": "Pause: →, B, C, B, C, ↓, C, ↑", "cheat_type": "button_combo", "description": "Não toma dano", "difficulty": "medium", "verified": True, "upvotes": 134},

    # ==================== PLAYSTATION 1 ====================
    {"game_title": "Crash Bandicoot", "console": "PS1", "genre": "Platform", "cheat_title": "99 Vidas", "cheat_code": "△ △ △ △ X ■ △ △ △ △", "cheat_type": "password", "description": "Senha na tela de código", "difficulty": "easy", "verified": True, "upvotes": 278},
    {"game_title": "Crash Bandicoot 2", "console": "PS1", "genre": "Platform", "cheat_title": "All Gems", "cheat_code": "△ △ △ △ ○ ■ △ △ △ △", "cheat_type": "password", "description": "Todas as gemas", "difficulty": "easy", "verified": True, "upvotes": 201},
    {"game_title": "Gran Turismo 2", "console": "PS1", "genre": "Racing", "cheat_title": "Todos os Carros", "cheat_code": "Nome: RACING", "cheat_type": "password", "description": "Maiúsculas obrigatório", "difficulty": "easy", "verified": True, "upvotes": 189},
    {"game_title": "Tony Hawk's Pro Skater 2", "console": "PS1", "genre": "Sports", "cheat_title": "Spider-Man", "cheat_code": "Pegue todos os tapes", "cheat_type": "unlock", "description": "Personagem secreto", "difficulty": "hard", "verified": True, "upvotes": 234},
    {"game_title": "Metal Gear Solid", "console": "PS1", "genre": "Stealth", "cheat_title": "Stealth Suit", "cheat_code": "Complete sem ser visto", "cheat_type": "unlock", "description": "Traje de invisibilidade", "difficulty": "hard", "verified": True, "upvotes": 298},
    {"game_title": "Resident Evil 2", "console": "PS1", "genre": "Horror", "cheat_title": "Infinite Ammo", "cheat_code": "Termine rank S (< 2h30)", "cheat_type": "unlock", "description": "Munição infinita", "difficulty": "hard", "verified": True, "upvotes": 267},
    {"game_title": "Spyro the Dragon", "console": "PS1", "genre": "Platform", "cheat_title": "99 Vidas", "cheat_code": "Pause: ↑, ↑, ↑, ↑, R1, R1, R1, R1, ○", "cheat_type": "button_combo", "description": "Máximo de vidas", "difficulty": "easy", "verified": True, "upvotes": 178},
    {"game_title": "Final Fantasy VII", "console": "PS1", "genre": "RPG", "cheat_title": "Knights of the Round", "cheat_code": "Pegue Gold Chocobo + vá para ilha nordeste", "cheat_type": "secret", "description": "Materia mais forte", "difficulty": "hard", "verified": True, "upvotes": 345},
    {"game_title": "Tekken 3", "console": "PS1", "genre": "Fighting", "cheat_title": "Gon", "cheat_code": "Complete modo história com todos", "cheat_type": "unlock", "description": "Personagem dinossauro", "difficulty": "hard", "verified": True, "upvotes": 156},
    {"game_title": "Twisted Metal 2", "console": "PS1", "genre": "Action", "cheat_title": "God Mode", "cheat_code": "↑, ↓, ←, →, →, ←, ↓, ↑", "cheat_type": "button_combo", "description": "Invencibilidade", "difficulty": "easy", "verified": True, "upvotes": 123},

    # ==================== PLAYSTATION 2 ====================
    {"game_title": "Grand Theft Auto: San Andreas", "console": "PS2", "genre": "Action", "cheat_title": "Jetpack", "cheat_code": "←, →, L1, L2, R1, R2, ↑, ↓, ←, →", "cheat_type": "button_combo", "description": "Spawna jetpack", "difficulty": "easy", "verified": True, "upvotes": 567},
    {"game_title": "Grand Theft Auto: San Andreas", "console": "PS2", "genre": "Action", "cheat_title": "Vida Máxima", "cheat_code": "R1, R2, L1, X, ←, ↓, →, ↑, ←, ↓, →, ↑", "cheat_type": "button_combo", "description": "Vida e colete máximos", "difficulty": "easy", "verified": True, "upvotes": 489},
    {"game_title": "Grand Theft Auto: San Andreas", "console": "PS2", "genre": "Action", "cheat_title": "Armas Tier 1", "cheat_code": "R1, R2, L1, R2, ←, ↓, →, ↑, ←, ↓, →, ↑", "cheat_type": "button_combo", "description": "Primeiro set de armas", "difficulty": "easy", "verified": True, "upvotes": 423},
    {"game_title": "Grand Theft Auto: Vice City", "console": "PS2", "genre": "Action", "cheat_title": "Tank", "cheat_code": "○, ○, L1, ○, ○, ○, L1, L2, R1, △, ○, △", "cheat_type": "button_combo", "description": "Spawna Rhino tank", "difficulty": "medium", "verified": True, "upvotes": 378},
    {"game_title": "Grand Theft Auto III", "console": "PS2", "genre": "Action", "cheat_title": "Todas as Armas", "cheat_code": "R2, R2, L1, R2, ←, ↓, →, ↑, ←, ↓, →, ↑", "cheat_type": "button_combo", "description": "Todo o arsenal", "difficulty": "easy", "verified": True, "upvotes": 345},
    {"game_title": "God of War", "console": "PS2", "genre": "Action", "cheat_title": "God Mode", "cheat_code": "Complete no Hard 2x", "cheat_type": "unlock", "description": "Invencibilidade", "difficulty": "hard", "verified": True, "upvotes": 289},
    {"game_title": "God of War II", "console": "PS2", "genre": "Action", "cheat_title": "Arena of Fates", "cheat_code": "Complete Challenge of Titans", "cheat_type": "unlock", "description": "Arena especial", "difficulty": "hard", "verified": True, "upvotes": 234},
    {"game_title": "Devil May Cry 3", "console": "PS2", "genre": "Action", "cheat_title": "Super Costumes", "cheat_code": "Complete Dante Must Die", "cheat_type": "unlock", "description": "Trajes com poder infinito", "difficulty": "hard", "verified": True, "upvotes": 267},
    {"game_title": "Tony Hawk's Pro Skater 3", "console": "PS2", "genre": "Sports", "cheat_title": "Darth Maul", "cheat_code": "Complete modo carreira 100%", "cheat_type": "unlock", "description": "Personagem secreto Star Wars", "difficulty": "hard", "verified": True, "upvotes": 198},
    {"game_title": "Need for Speed: Underground 2", "console": "PS2", "genre": "Racing", "cheat_title": "Burger King Vinyl", "cheat_code": "Insira código do BK toy", "cheat_type": "password", "description": "Adesivo especial", "difficulty": "medium", "verified": True, "upvotes": 134},
    {"game_title": "Jak and Daxter", "console": "PS2", "genre": "Platform", "cheat_title": "Hero Mode", "cheat_code": "Complete o jogo 100%", "cheat_type": "unlock", "description": "Nova dificuldade + armas", "difficulty": "hard", "verified": True, "upvotes": 178},
    {"game_title": "Ratchet & Clank", "console": "PS2", "genre": "Platform", "cheat_title": "RYNO", "cheat_code": "Compre por 150.000 bolts", "cheat_type": "secret", "description": "Arma mais poderosa", "difficulty": "medium", "verified": True, "upvotes": 201},
    {"game_title": "Shadow of the Colossus", "console": "PS2", "genre": "Adventure", "cheat_title": "Sword of Dormin", "cheat_code": "Derrote todos time attacks Hard", "cheat_type": "unlock", "description": "Espada mais forte", "difficulty": "hard", "verified": True, "upvotes": 245},

    # ==================== NINTENDO 64 ====================
    {"game_title": "GoldenEye 007", "console": "N64", "genre": "FPS", "cheat_title": "DK Mode", "cheat_code": "L+R+↑, C→, R+←, R+↑, ↑, R+→, ↑, L+R+C↓, L+R+↓, L+R+C←", "cheat_type": "button_combo", "description": "Cabeças gigantes", "difficulty": "hard", "verified": True, "upvotes": 234},
    {"game_title": "GoldenEye 007", "console": "N64", "genre": "FPS", "cheat_title": "All Guns", "cheat_code": "L+R+↓, L+C←, L+C→, L+R+C←, L+↓, L+C↓, R+C←, L+R+C→, R+↑, L+C←", "cheat_type": "button_combo", "description": "Todas as armas", "difficulty": "hard", "verified": True, "upvotes": 201},
    {"game_title": "Super Mario 64", "console": "N64", "genre": "Platform", "cheat_title": "Yoshi no Telhado", "cheat_code": "Colete 120 estrelas", "cheat_type": "unlock", "description": "100 vidas + mensagem", "difficulty": "hard", "verified": True, "upvotes": 289},
    {"game_title": "Super Mario 64", "console": "N64", "genre": "Platform", "cheat_title": "BLJ (Backwards Long Jump)", "cheat_code": "Pule para trás em escadas", "cheat_type": "glitch", "description": "Speedrun trick famoso", "difficulty": "hard", "verified": True, "upvotes": 267},
    {"game_title": "The Legend of Zelda: Ocarina of Time", "console": "N64", "genre": "Adventure", "cheat_title": "Ganon's Castle Skip", "cheat_code": "Wrong warp via Deku Tree", "cheat_type": "glitch", "description": "Pula direto pro final", "difficulty": "hard", "verified": True, "upvotes": 298},
    {"game_title": "Mario Kart 64", "console": "N64", "genre": "Racing", "cheat_title": "Extra Tracks", "cheat_code": "Complete 150cc 1st place all cups", "cheat_type": "unlock", "description": "Pistas espelhadas", "difficulty": "hard", "verified": True, "upvotes": 178},
    {"game_title": "Perfect Dark", "console": "N64", "genre": "FPS", "cheat_title": "All Cheats", "cheat_code": "Complete todas missions Perfect Agent", "cheat_type": "unlock", "description": "Todos os cheats", "difficulty": "hard", "verified": True, "upvotes": 156},
    {"game_title": "Banjo-Kazooie", "console": "N64", "genre": "Platform", "cheat_title": "Infinite Lives", "cheat_code": "Cheato: BLUE EGGS", "cheat_type": "password", "description": "Vidas infinitas", "difficulty": "easy", "verified": True, "upvotes": 145},
    {"game_title": "Diddy Kong Racing", "console": "N64", "genre": "Racing", "cheat_title": "T.T.", "cheat_code": "Vença todos os ghost races", "cheat_type": "unlock", "description": "Personagem secreto", "difficulty": "hard", "verified": True, "upvotes": 123},
    {"game_title": "Turok 2", "console": "N64", "genre": "FPS", "cheat_title": "All Weapons", "cheat_code": "BEWAREOBLIVIONISATHAND", "cheat_type": "password", "description": "Todas as armas", "difficulty": "easy", "verified": True, "upvotes": 167},

    # ==================== GAME BOY / GBA ====================
    {"game_title": "Pokémon Red/Blue", "console": "Game Boy", "genre": "RPG", "cheat_title": "Mew Glitch", "cheat_code": "Nugget Bridge glitch + Fly", "cheat_type": "glitch", "description": "Captura Mew selvagem", "difficulty": "hard", "verified": True, "upvotes": 567},
    {"game_title": "Pokémon Yellow", "console": "Game Boy", "genre": "RPG", "cheat_title": "Surfing Pikachu", "cheat_code": "Troque Pokémon Stadium", "cheat_type": "unlock", "description": "Pikachu com Surf", "difficulty": "hard", "verified": True, "upvotes": 234},
    {"game_title": "The Legend of Zelda: Link's Awakening", "console": "Game Boy", "genre": "Adventure", "cheat_title": "Nome ZELDA", "cheat_code": "Nome: ZELDA", "cheat_type": "password", "description": "Música diferente", "difficulty": "easy", "verified": True, "upvotes": 145},
    {"game_title": "Pokémon Gold/Silver", "console": "Game Boy Color", "genre": "RPG", "cheat_title": "Clone Glitch", "cheat_code": "Box change trick", "cheat_type": "glitch", "description": "Duplica Pokémon", "difficulty": "medium", "verified": True, "upvotes": 389},
    {"game_title": "Pokémon Ruby/Sapphire", "console": "GBA", "genre": "RPG", "cheat_title": "Cloning Glitch", "cheat_code": "Battle Tower box trick", "cheat_type": "glitch", "description": "Duplica Pokémon", "difficulty": "hard", "verified": True, "upvotes": 298},
    {"game_title": "Pokémon FireRed/LeafGreen", "console": "GBA", "genre": "RPG", "cheat_title": "Mew Event", "cheat_code": "Ilha 1 com ticket especial", "cheat_type": "event", "description": "Captura Mew legalmente", "difficulty": "hard", "verified": True, "upvotes": 267},
    {"game_title": "Super Mario Advance 4", "console": "GBA", "genre": "Platform", "cheat_title": "e-Reader Levels", "cheat_code": "Use cartões e-Reader", "cheat_type": "unlock", "description": "Fases extras", "difficulty": "medium", "verified": True, "upvotes": 134},
    {"game_title": "Metroid Fusion", "console": "GBA", "genre": "Action", "cheat_title": "Gallery Mode", "cheat_code": "Complete o jogo", "cheat_type": "unlock", "description": "Arte conceitual", "difficulty": "hard", "verified": True, "upvotes": 156},
    {"game_title": "Golden Sun", "console": "GBA", "genre": "RPG", "cheat_title": "Hard Mode", "cheat_code": "Password especial", "cheat_type": "password", "description": "Dificuldade aumentada", "difficulty": "medium", "verified": True, "upvotes": 178},

    # ==================== XBOX ====================
    {"game_title": "Halo: Combat Evolved", "console": "Xbox", "genre": "FPS", "cheat_title": "Legendary Ending", "cheat_code": "Complete no Legendary", "cheat_type": "unlock", "description": "Final alternativo", "difficulty": "hard", "verified": True, "upvotes": 298},
    {"game_title": "Halo 2", "console": "Xbox", "genre": "FPS", "cheat_title": "Scarab Gun", "cheat_code": "Metropolis: Banshee skip", "cheat_type": "glitch", "description": "Arma mais forte", "difficulty": "hard", "verified": True, "upvotes": 345},
    {"game_title": "Star Wars: Knights of the Old Republic", "console": "Xbox", "genre": "RPG", "cheat_title": "Item Duplication", "cheat_code": "Equip/unequip glitch", "cheat_type": "glitch", "description": "Duplica itens", "difficulty": "medium", "verified": True, "upvotes": 223},
    {"game_title": "Fable", "console": "Xbox", "genre": "RPG", "cheat_title": "Legendary Weapons", "cheat_code": "Complete todos Silver Keys", "cheat_type": "unlock", "description": "Armas lendárias", "difficulty": "hard", "verified": True, "upvotes": 189},
    {"game_title": "Ninja Gaiden Black", "console": "Xbox", "genre": "Action", "cheat_title": "Very Hard Mode", "cheat_code": "Complete no Hard", "cheat_type": "unlock", "description": "Dificuldade extrema", "difficulty": "hard", "verified": True, "upvotes": 167},

    # ==================== GAMECUBE ====================
    {"game_title": "Super Smash Bros. Melee", "console": "GameCube", "genre": "Fighting", "cheat_title": "All Characters", "cheat_code": "Complete modo clássico com todos", "cheat_type": "unlock", "description": "Todos personagens", "difficulty": "hard", "verified": True, "upvotes": 234},
    {"game_title": "The Legend of Zelda: Wind Waker", "console": "GameCube", "genre": "Adventure", "cheat_title": "Tingle Tuner", "cheat_code": "Conecte GBA", "cheat_type": "unlock", "description": "Modo cooperativo", "difficulty": "medium", "verified": True, "upvotes": 178},
    {"game_title": "Metroid Prime", "console": "GameCube", "genre": "FPS", "cheat_title": "Fusion Suit", "cheat_code": "Link com Metroid Fusion", "cheat_type": "unlock", "description": "Traje alternativo", "difficulty": "medium", "verified": True, "upvotes": 201},
    {"game_title": "Resident Evil 4", "console": "GameCube", "genre": "Horror", "cheat_title": "Infinite Launcher", "cheat_code": "Complete Pro mode rank A", "cheat_type": "unlock", "description": "Lança-mísseis infinito", "difficulty": "hard", "verified": True, "upvotes": 267},
    {"game_title": "F-Zero GX", "console": "GameCube", "genre": "Racing", "cheat_title": "AX Characters", "cheat_code": "Complete story mode chapters", "cheat_type": "unlock", "description": "Personagens arcade", "difficulty": "hard", "verified": True, "upvotes": 156},

    # ==================== DREAMCAST ====================
    {"game_title": "Sonic Adventure", "console": "Dreamcast", "genre": "Platform", "cheat_title": "Metal Sonic", "cheat_code": "Complete modo história 130 emblemas", "cheat_type": "unlock", "description": "Personagem secreto", "difficulty": "hard", "verified": True, "upvotes": 189},
    {"game_title": "Crazy Taxi", "console": "Dreamcast", "genre": "Racing", "cheat_title": "Another Day", "cheat_code": "Complete Arcade mode", "cheat_type": "unlock", "description": "Mapa noturno", "difficulty": "medium", "verified": True, "upvotes": 145},
    {"game_title": "Soul Calibur", "console": "Dreamcast", "genre": "Fighting", "cheat_title": "All Characters", "cheat_code": "Complete Edge Master mode", "cheat_type": "unlock", "description": "Todos personagens", "difficulty": "hard", "verified": True, "upvotes": 167},

    # ==================== ATARI 2600 ====================
    {"game_title": "Adventure", "console": "Atari 2600", "genre": "Adventure", "cheat_title": "Easter Egg Original", "cheat_code": "Leve dot cinza para sala secreta", "cheat_type": "secret", "description": "Primeiro easter egg da história!", "difficulty": "hard", "verified": True, "upvotes": 123},
    {"game_title": "Pitfall!", "console": "Atari 2600", "genre": "Platform", "cheat_title": "Perfect Score", "cheat_code": "Pegue todos 32 tesouros em 20min", "cheat_type": "challenge", "description": "Pontuação máxima", "difficulty": "hard", "verified": True, "upvotes": 98},
]

def insert_complete_library():
    """Insere biblioteca completa de cheats"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("🎮 BIBLIOTECA COMPLETA DE CHEATS")
        print("=" * 60)
        print()

        existing = db.query(Cheat).count()
        print(f"📊 Cheats existentes: {existing}")

        if existing > 0:
            response = input("\n⚠️  Já existem cheats. Adicionar mais? (s/n): ")
            if response.lower() != 's':
                print("❌ Operação cancelada")
                return

        print(f"\n📥 Inserindo {len(COMPLETE_CHEATS)} cheats...")
        print()

        consoles_count = {}
        inserted = 0

        for cheat_data in COMPLETE_CHEATS:
            # Verifica duplicata
            existing = db.query(Cheat).filter(
                Cheat.game_title == cheat_data["game_title"],
                Cheat.cheat_title == cheat_data["cheat_title"]
            ).first()

            if existing:
                continue

            cheat = Cheat(**cheat_data)
            db.add(cheat)
            inserted += 1

            # Contagem por console
            console = cheat_data["console"]
            consoles_count[console] = consoles_count.get(console, 0) + 1

            if inserted % 20 == 0:
                print(f"  ✅ {inserted} cheats inseridos...")

        db.commit()

        print()
        print("=" * 60)
        print(f"🎉 {inserted} novos cheats inseridos!")
        print(f"📊 Total no banco: {db.query(Cheat).count()}")
        print()
        print("📋 Distribuição por console:")
        for console, count in sorted(consoles_count.items()):
            print(f"   {console}: {count} cheats")
        print()
        print("✅ Biblioteca completa instalada!")

    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    insert_complete_library()

# EXPANSÃO MASSIVA - Parte 2
EXPANSION_CHEATS = [
    # Mais PS2 (console mais popular)
    {"game_title": "Kingdom Hearts", "console": "PS2", "genre": "RPG", "cheat_title": "Ultima Weapon", "cheat_code": "Sintetize com Mystery Goo", "cheat_type": "secret", "description": "Keyblade mais forte", "difficulty": "hard", "verified": True, "upvotes": 234},
    {"game_title": "Final Fantasy X", "console": "PS2", "genre": "RPG", "cheat_title": "Yojimbo Zanmato", "cheat_code": "Pague 500k+ gil", "cheat_type": "technique", "description": "Mata qualquer boss", "difficulty": "medium", "verified": True, "upvotes": 298},
    {"game_title": "Dragon Ball Z: Budokai Tenkaichi 3", "console": "PS2", "genre": "Fighting", "cheat_title": "All Characters", "cheat_code": "Complete Dragon History", "cheat_type": "unlock", "description": "161 personagens", "difficulty": "hard", "verified": True, "upvotes": 267},
    {"game_title": "Burnout 3: Takedown", "console": "PS2", "genre": "Racing", "cheat_title": "All Cars", "cheat_code": "Gold em todos eventos", "cheat_type": "unlock", "description": "Todos veículos", "difficulty": "hard", "verified": True, "upvotes": 178},
    {"game_title": "TimeSplitters 2", "console": "PS2", "genre": "FPS", "cheat_title": "All Cheats", "cheat_code": "Complete challenges Platinum", "cheat_type": "unlock", "description": "Todos cheats", "difficulty": "hard", "verified": True, "upvotes": 156},
    {"game_title": "SSX Tricky", "console": "PS2", "genre": "Sports", "cheat_title": "Full Stats", "cheat_code": "Vença World Circuit Master", "cheat_type": "unlock", "description": "Status máximo", "difficulty": "hard", "verified": True, "upvotes": 145},
    {"game_title": "Ace Combat 04", "console": "PS2", "genre": "Flight", "cheat_title": "X-02 Wyvern", "cheat_code": "S rank em todas missions", "cheat_type": "unlock", "description": "Melhor avião", "difficulty": "hard", "verified": True, "upvotes": 134},
    {"game_title": "WWE SmackDown: Here Comes the Pain", "console": "PS2", "genre": "Wrestling", "cheat_title": "All Wrestlers", "cheat_code": "Complete Season Mode", "cheat_type": "unlock", "description": "Todos lutadores", "difficulty": "medium", "verified": True, "upvotes": 189},
    
    # Mais NES Classics
    {"game_title": "Gradius", "console": "NES", "genre": "Shooter", "cheat_title": "30 Vidas (Konami Code)", "cheat_code": "↑↑↓↓←→←→BA", "cheat_type": "button_combo", "description": "Konami code original", "difficulty": "easy", "verified": True, "upvotes": 201},
    {"game_title": "Ninja Gaiden", "console": "NES", "genre": "Action", "cheat_title": "99 Lives", "cheat_code": "Game Genie: SXKXGLIE", "cheat_type": "cheat_device", "description": "Com Game Genie", "difficulty": "easy", "verified": True, "upvotes": 123},
    {"game_title": "Battletoads", "console": "NES", "genre": "Beat'em Up", "cheat_title": "Level Select", "cheat_code": "Pause, segure ↓+A+B", "cheat_type": "button_combo", "description": "Pula fases", "difficulty": "medium", "verified": True, "upvotes": 167},
    {"game_title": "Duck Hunt", "console": "NES", "genre": "Shooter", "cheat_title": "Trick Shots", "cheat_code": "Mire na TV de perto", "cheat_type": "technique", "description": "Acerta sempre", "difficulty": "easy", "verified": True, "upvotes": 89},
    {"game_title": "Excitebike", "console": "NES", "genre": "Racing", "cheat_title": "Turbo Start", "cheat_code": "Segure A antes de largada", "cheat_type": "technique", "description": "Largada perfeita", "difficulty": "easy", "verified": True, "upvotes": 98},

    # Mais SNES gems
    {"game_title": "Star Fox", "console": "SNES", "genre": "Shooter", "cheat_title": "Black Hole", "cheat_code": "Out of Bounds em Asteroid", "cheat_type": "glitch", "description": "Fase secreta", "difficulty": "hard", "verified": True, "upvotes": 156},
    {"game_title": "Kirby Super Star", "console": "SNES", "genre": "Platform", "cheat_title": "Arena Mode", "cheat_code": "Complete todos mini-games", "cheat_type": "unlock", "description": "Boss rush", "difficulty": "hard", "verified": True, "upvotes": 134},
    {"game_title": "Earthbound", "console": "SNES", "genre": "RPG", "cheat_title": "Sword of Kings", "cheat_code": "Farm Starman Super 1/128", "cheat_type": "secret", "description": "Espada rara Poo", "difficulty": "hard", "verified": True, "upvotes": 198},
    {"game_title": "Yoshi's Island", "console": "SNES", "genre": "Platform", "cheat_title": "Secret Worlds", "cheat_code": "Touch fuzzy get dizzy glitch", "cheat_type": "glitch", "description": "Fases secretas", "difficulty": "hard", "verified": True, "upvotes": 167},
    {"game_title": "Killer Instinct", "console": "SNES", "genre": "Fighting", "cheat_title": "Ultimate Combos", "cheat_code": "Training mode code", "cheat_type": "secret", "description": "Combos infinitos", "difficulty": "medium", "verified": True, "upvotes": 145},

    # Mais Genesis
    {"game_title": "Gunstar Heroes", "console": "Genesis", "genre": "Action", "cheat_title": "Fixed Weapons", "cheat_code": "Segure Start ao começar", "cheat_type": "button_combo", "description": "Armas fixas", "difficulty": "easy", "verified": True, "upvotes": 123},
    {"game_title": "Phantasy Star IV", "console": "Genesis", "genre": "RPG", "cheat_title": "Music Test", "cheat_code": "Segure A+B+C ao ligar", "cheat_type": "button_combo", "description": "Ouve todas músicas", "difficulty": "easy", "verified": True, "upvotes": 134},
    {"game_title": "Vectorman", "console": "Genesis", "genre": "Platform", "cheat_title": "Refill Health", "cheat_code": "Pause: ↑, →, A, B, ↓, ←, A, B", "cheat_type": "button_combo", "description": "Vida cheia", "difficulty": "medium", "verified": True, "upvotes": 98},
    {"game_title": "Comix Zone", "console": "Genesis", "genre": "Beat'em Up", "cheat_title": "Level Select", "cheat_code": "Sound test: 14, 15, 18, 5, 13, 1, 3, 18, 15, 6", "cheat_type": "password", "description": "Escolhe página", "difficulty": "medium", "verified": True, "upvotes": 112},
    
    # PS1 Expanded
    {"game_title": "Final Fantasy VII", "console": "PS1", "genre": "RPG", "cheat_title": "Omnislash", "cheat_code": "Battle Square 64,000 BP", "cheat_type": "secret", "description": "Limit Break Cloud", "difficulty": "hard", "verified": True, "upvotes": 289},
    {"game_title": "Castlevania: Symphony of the Night", "console": "PS1", "genre": "Action", "cheat_title": "Play as Richter", "cheat_code": "Nome: RICHTER", "cheat_type": "password", "description": "Personagem alternativo", "difficulty": "easy", "verified": True, "upvotes": 267},
    {"game_title": "Silent Hill", "console": "PS1", "genre": "Horror", "cheat_title": "UFO Ending", "cheat_code": "Pegue channeling stone", "cheat_type": "secret", "description": "Final secreto", "difficulty": "hard", "verified": True, "upvotes": 234},
    {"game_title": "Parasite Eve", "console": "PS1", "genre": "RPG", "cheat_title": "EX Game", "cheat_code": "Complete o jogo", "cheat_type": "unlock", "description": "Chrysler Building 77 andares", "difficulty": "hard", "verified": True, "upvotes": 178},
    {"game_title": "Dino Crisis", "console": "PS1", "genre": "Horror", "cheat_title": "Infinite Ammo", "cheat_code": "Complete sob 5 horas", "cheat_type": "unlock", "description": "Munição infinita", "difficulty": "hard", "verified": True, "upvotes": 156},
    
    # N64 Expanded
    {"game_title": "Conker's Bad Fur Day", "console": "N64", "genre": "Platform", "cheat_title": "All Chapters", "cheat_code": "Cheat menu passwords", "cheat_type": "password", "description": "Todos capítulos", "difficulty": "medium", "verified": True, "upvotes": 189},
    {"game_title": "Star Fox 64", "console": "N64", "genre": "Shooter", "cheat_title": "Expert Mode", "cheat_code": "Medals em todas stages", "cheat_type": "unlock", "description": "Dificuldade extrema", "difficulty": "hard", "verified": True, "upvotes": 167},
    {"game_title": "Pokemon Stadium", "console": "N64", "genre": "RPG", "cheat_title": "Surfing Pikachu", "cheat_code": "Yellow com Pikachu Surf", "cheat_type": "unlock", "description": "Mini-game especial", "difficulty": "medium", "verified": True, "upvotes": 201},
    {"game_title": "Jet Force Gemini", "console": "N64", "genre": "Action", "cheat_title": "All Cheats", "cheat_code": "Salve todos tribals", "cheat_type": "unlock", "description": "Códigos completos", "difficulty": "hard", "verified": True, "upvotes": 134},

    # GameCube Expanded
    {"game_title": "Luigi's Mansion", "console": "GameCube", "genre": "Adventure", "cheat_title": "Hidden Mansion", "cheat_code": "Complete o jogo", "cheat_type": "unlock", "description": "Mansão espelhada", "difficulty": "medium", "verified": True, "upvotes": 189},
    {"game_title": "Mario Kart: Double Dash", "console": "GameCube", "genre": "Racing", "cheat_title": "Mirror Mode", "cheat_code": "150cc 1st all cups", "cheat_type": "unlock", "description": "Pistas espelhadas", "difficulty": "hard", "verified": True, "upvotes": 178},
    {"game_title": "Super Mario Sunshine", "console": "GameCube", "genre": "Platform", "cheat_title": "Corona Mountain", "cheat_code": "Colete 120 Shine Sprites", "cheat_type": "unlock", "description": "Vulcão final", "difficulty": "hard", "verified": True, "upvotes": 156},
    {"game_title": "Paper Mario: The Thousand-Year Door", "console": "GameCube", "genre": "RPG", "cheat_title": "Pit of 100 Trials", "cheat_code": "Encontre pipe secreto", "cheat_type": "secret", "description": "Dungeon 100 andares", "difficulty": "hard", "verified": True, "upvotes": 223},
    {"game_title": "Animal Crossing", "console": "GameCube", "genre": "Simulation", "cheat_title": "Golden Tools", "cheat_code": "Várias condições especiais", "cheat_type": "unlock", "description": "Ferramentas douradas", "difficulty": "hard", "verified": True, "upvotes": 201},

    # Xbox Expanded
    {"game_title": "Morrowind", "console": "Xbox", "genre": "RPG", "cheat_title": "Fortify Intelligence Loop", "cheat_code": "Fortify Int + Alchemy", "cheat_type": "glitch", "description": "Stats infinitos", "difficulty": "hard", "verified": True, "upvotes": 245},
    {"game_title": "Jet Set Radio Future", "console": "Xbox", "genre": "Action", "cheat_title": "All Characters", "cheat_code": "Complete todas tags", "cheat_type": "unlock", "description": "Todos personagens", "difficulty": "hard", "verified": True, "upvotes": 167},
    {"game_title": "Dead or Alive 3", "console": "Xbox", "genre": "Fighting", "cheat_title": "Omega Costume", "cheat_code": "Complete Time Attack", "cheat_type": "unlock", "description": "Trajes especiais", "difficulty": "medium", "verified": True, "upvotes": 134},

    # GBA Expanded
    {"game_title": "Advance Wars", "console": "GBA", "genre": "Strategy", "cheat_title": "Advance Campaign", "cheat_code": "Complete Campaign Mode", "cheat_type": "unlock", "description": "Missões difíceis", "difficulty": "hard", "verified": True, "upvotes": 156},
    {"game_title": "Castlevania: Aria of Sorrow", "console": "GBA", "genre": "Action", "cheat_title": "Julius Mode", "cheat_code": "Complete o jogo", "cheat_type": "unlock", "description": "Jogue como Julius", "difficulty": "hard", "verified": True, "upvotes": 189},
    {"game_title": "Sonic Advance 2", "console": "GBA", "genre": "Platform", "cheat_title": "Super Sonic", "cheat_code": "Colete todas Chaos Emeralds", "cheat_type": "unlock", "description": "Transformação", "difficulty": "hard", "verified": True, "upvotes": 145},
    {"game_title": "Mario & Luigi: Superstar Saga", "console": "GBA", "genre": "RPG", "cheat_title": "Joke's End", "cheat_code": "Pegue todos Beanstones", "cheat_type": "secret", "description": "Área secreta", "difficulty": "hard", "verified": True, "upvotes": 167},

    # Dreamcast Expanded  
    {"game_title": "Shenmue", "console": "Dreamcast", "genre": "Adventure", "cheat_title": "Forklift Racing", "cheat_code": "Trabalhe no porto", "cheat_type": "secret", "description": "Mini-game secreto", "difficulty": "medium", "verified": True, "upvotes": 178},
    {"game_title": "Marvel vs. Capcom 2", "console": "Dreamcast", "genre": "Fighting", "cheat_title": "All 56 Characters", "cheat_code": "Compre no shop", "cheat_type": "unlock", "description": "Todos personagens", "difficulty": "hard", "verified": True, "upvotes": 234},
    {"game_title": "Resident Evil Code: Veronica", "console": "Dreamcast", "genre": "Horror", "cheat_title": "Linear Launcher", "cheat_code": "Rank A em menos de 4h30", "cheat_type": "unlock", "description": "Arma especial", "difficulty": "hard", "verified": True, "upvotes": 198},
]

COMPLETE_CHEATS.extend(EXPANSION_CHEATS)
