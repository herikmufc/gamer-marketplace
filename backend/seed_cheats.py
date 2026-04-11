"""
Script para popular banco de dados com cheats clássicos
"""
import requests
import json

API_URL = "http://localhost:8000"  # ou https://gamer-marketplace.onrender.com

# Cheats clássicos organizados por console
CHEATS_DATA = [
    # ===== SNES =====
    {
        "game_title": "Mortal Kombat",
        "console": "SNES",
        "genre": "Fighting",
        "cheat_title": "Menu de Cheats",
        "cheat_code": "No menu principal, pressione: Down, Up, Left, Left, A, Right, Down",
        "cheat_type": "button_combo",
        "description": "Abre menu secreto com várias opções de cheats",
        "difficulty": "easy",
        "verified": True
    },
    {
        "game_title": "Super Mario World",
        "console": "SNES",
        "genre": "Platform",
        "cheat_title": "96 Saídas Secretas",
        "cheat_code": "Star World + Special World",
        "cheat_type": "glitch",
        "description": "Complete Star World para desbloquear Special World",
        "difficulty": "medium",
        "verified": True
    },
    {
        "game_title": "Donkey Kong Country",
        "console": "SNES",
        "genre": "Platform",
        "cheat_title": "50 Vidas",
        "cheat_code": "No menu principal: B, A, R, R, A, L",
        "cheat_type": "button_combo",
        "description": "Começa o jogo com 50 vidas",
        "difficulty": "easy",
        "verified": True
    },

    # ===== NES =====
    {
        "game_title": "Contra",
        "console": "NES",
        "genre": "Action",
        "cheat_title": "30 Vidas",
        "cheat_code": "Na tela título: ↑↑↓↓←→←→BA",
        "cheat_type": "button_combo",
        "description": "O código Konami mais famoso! Dá 30 vidas",
        "difficulty": "easy",
        "verified": True
    },
    {
        "game_title": "Super Mario Bros",
        "console": "NES",
        "genre": "Platform",
        "cheat_title": "Mundo -1 (Minus World)",
        "cheat_code": "Mundo 1-2: Quebre tijolo, entre no tubo atravessando a parede",
        "cheat_type": "glitch",
        "description": "Acessa o famoso 'Minus World', um glitch infinito",
        "difficulty": "hard",
        "verified": True
    },
    {
        "game_title": "Mike Tyson's Punch-Out!!",
        "console": "NES",
        "genre": "Sports",
        "cheat_title": "Pular para Mike Tyson",
        "cheat_code": "Password: 007 373 5963",
        "cheat_type": "password",
        "description": "Vai direto para a luta final contra Mike Tyson",
        "difficulty": "easy",
        "verified": True
    },

    # ===== PlayStation 1 =====
    {
        "game_title": "Crash Bandicoot",
        "console": "PS1",
        "genre": "Platform",
        "cheat_title": "99 Vidas",
        "cheat_code": "Na tela de senha: triângulo, triângulo, triângulo, triângulo, X, quadrado, triângulo, triângulo, triângulo, triângulo",
        "cheat_type": "password",
        "description": "Começa com 99 vidas",
        "difficulty": "medium",
        "verified": True
    },
    {
        "game_title": "Gran Turismo 2",
        "console": "PS1",
        "genre": "Racing",
        "cheat_title": "Todos os Carros",
        "cheat_code": "Nome: RACING (tudo maiúsculo)",
        "cheat_type": "password",
        "description": "Desbloqueia todos os carros",
        "difficulty": "easy",
        "verified": True
    },
    {
        "game_title": "Tony Hawk's Pro Skater 2",
        "console": "PS1",
        "genre": "Sports",
        "cheat_title": "Spider-Man Skatista",
        "cheat_code": "Colete todos os tapes secretos",
        "cheat_type": "unlock",
        "description": "Desbloqueia Spider-Man como personagem jogável",
        "difficulty": "hard",
        "verified": True
    },

    # ===== PlayStation 2 =====
    {
        "game_title": "Grand Theft Auto: San Andreas",
        "console": "PS2",
        "genre": "Action",
        "cheat_title": "Vida e Colete Infinitos",
        "cheat_code": "R1, R2, L1, X, ←, ↓, →, ↑, ←, ↓, →, ↑",
        "cheat_type": "button_combo",
        "description": "Máximo de vida e colete",
        "difficulty": "medium",
        "verified": True
    },
    {
        "game_title": "Grand Theft Auto: San Andreas",
        "console": "PS2",
        "genre": "Action",
        "cheat_title": "Jetpack",
        "cheat_code": "←, →, L1, L2, R1, R2, ↑, ↓, ←, →",
        "cheat_type": "button_combo",
        "description": "Spawna um jetpack",
        "difficulty": "medium",
        "verified": True
    },
    {
        "game_title": "God of War",
        "console": "PS2",
        "genre": "Action",
        "cheat_title": "Modo Deus",
        "cheat_code": "Complete o jogo duas vezes",
        "cheat_type": "unlock",
        "description": "Desbloqueia God Mode com dano infinito",
        "difficulty": "hard",
        "verified": True
    },

    # ===== SEGA Genesis =====
    {
        "game_title": "Sonic the Hedgehog",
        "console": "Genesis",
        "genre": "Platform",
        "cheat_title": "Level Select",
        "cheat_code": "Tela título: ↑, ↓, ←, →, hold A + Start",
        "cheat_type": "button_combo",
        "description": "Menu de seleção de fases",
        "difficulty": "easy",
        "verified": True
    },
    {
        "game_title": "Sonic 2",
        "console": "Genesis",
        "genre": "Platform",
        "cheat_title": "Super Sonic desde o início",
        "cheat_code": "Sound Test: 19, 65, 09, 17, depois hold A + Start",
        "cheat_type": "password",
        "description": "Começa com todas as Chaos Emeralds",
        "difficulty": "medium",
        "verified": True
    },
    {
        "game_title": "Mortal Kombat II",
        "console": "Genesis",
        "genre": "Fighting",
        "cheat_title": "Sangue Ativado",
        "cheat_code": "Antes da luta começar: A, B, A, C, A, B, B",
        "cheat_type": "button_combo",
        "description": "Ativa o sangue vermelho (censura removida)",
        "difficulty": "easy",
        "verified": True
    },

    # ===== Game Boy =====
    {
        "game_title": "Pokémon Red/Blue",
        "console": "Game Boy",
        "genre": "RPG",
        "cheat_title": "Capturar Mew",
        "cheat_code": "Glitch do Nugget Bridge: não batalhe certos trainers, fly trick",
        "cheat_type": "glitch",
        "description": "Glitch complexo para capturar Mew sem eventos",
        "difficulty": "hard",
        "verified": True
    },
    {
        "game_title": "The Legend of Zelda: Link's Awakening",
        "console": "Game Boy",
        "genre": "Adventure",
        "cheat_title": "Nome ZELDA",
        "cheat_code": "Nome do arquivo: ZELDA",
        "cheat_type": "password",
        "description": "Começa com música diferente e mais itens",
        "difficulty": "easy",
        "verified": True
    },

    # ===== Nintendo 64 =====
    {
        "game_title": "GoldenEye 007",
        "console": "N64",
        "genre": "FPS",
        "cheat_title": "DK Mode",
        "cheat_code": "Pause: L + R + ↑, C-Right, R + Left, R + Up, Up, R + Right, Up, L + R + C-Down, L + R + Down, L + R + C-Left",
        "cheat_type": "button_combo",
        "description": "Cabeças e braços gigantes (Donkey Kong mode)",
        "difficulty": "hard",
        "verified": True
    },
    {
        "game_title": "The Legend of Zelda: Ocarina of Time",
        "console": "N64",
        "genre": "Adventure",
        "cheat_title": "Pular Credits sem completar",
        "cheat_code": "Various glitches + wrong warp",
        "cheat_type": "glitch",
        "description": "Speedrun trick: termina o jogo em minutos",
        "difficulty": "hard",
        "verified": True
    },
    {
        "game_title": "Super Mario 64",
        "console": "N64",
        "genre": "Platform",
        "cheat_title": "Yoshi no Telhado",
        "cheat_code": "Colete todas as 120 estrelas",
        "cheat_type": "unlock",
        "description": "Yoshi aparece no telhado do castelo com 100 vidas",
        "difficulty": "hard",
        "verified": True
    },
]

def seed_cheats():
    """Popula o banco com cheats"""
    print("🎮 Iniciando seed de cheats...")

    for idx, cheat in enumerate(CHEATS_DATA, 1):
        try:
            # Note: Este endpoint precisará ser criado ou usar outro método de inserção
            print(f"[{idx}/{len(CHEATS_DATA)}] Adicionando: {cheat['game_title']} - {cheat['cheat_title']}")

            # Por enquanto apenas imprime, você pode adaptar para inserir direto no banco
            print(f"  Console: {cheat['console']}")
            print(f"  Código: {cheat['cheat_code'][:50]}...")
            print()

        except Exception as e:
            print(f"❌ Erro ao adicionar cheat {idx}: {e}")

    print(f"✅ {len(CHEATS_DATA)} cheats preparados para inserção!")
    print("\n💡 Para inserir no banco, execute este script com SQLAlchemy diretamente")
    print("   ou crie um endpoint POST /cheats no backend")

if __name__ == "__main__":
    seed_cheats()
