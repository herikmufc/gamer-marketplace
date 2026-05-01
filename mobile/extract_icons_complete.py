#!/usr/bin/env python3
"""
Script para extrair TODOS os 64 ícones da sprite sheet completa
"""

from PIL import Image
import os

# Configurações
SPRITE_SHEET = "assets/icons/icon-sheet-complete.png"
OUTPUT_DIR = "assets/icons"
ICON_SIZE = 256  # 2048 / 8 = 256 pixels por ícone

# Mapeamento completo de TODOS os 64 ícones
ICONS = {
    # LINHA 1 - Navegação Principal
    (0, 0): 'home',
    (1, 0): 'events',
    (2, 0): 'forum',
    (3, 0): 'cheats',
    (4, 0): 'help',
    (5, 0): 'chat',
    (6, 0): 'profile',
    (7, 0): 'settings',

    # LINHA 2 - Categorias de Produtos
    (0, 1): 'all',
    (1, 1): 'consoles',
    (2, 1): 'games',
    (3, 1): 'hardware',
    (4, 1): 'peripherals',
    (5, 1): 'marketplace',
    (6, 1): 'cartridge',
    (7, 1): 'joystick',

    # LINHA 3 - Ações & UI
    (0, 2): 'search',
    (1, 2): 'add',
    (2, 2): 'send',
    (3, 2): 'back',
    (4, 2): 'camera',
    (5, 2): 'image',
    (6, 2): 'bookmark',
    (7, 2): 'share',

    # LINHA 4 - Social & Interações
    (0, 3): 'discussion',
    (1, 3): 'question',
    (2, 3): 'idea',
    (3, 3): 'star',
    (4, 3): 'pin',
    (5, 3): 'heart',
    (6, 3): 'trophy',
    (7, 3): 'fire',

    # LINHA 5 - Tipos de Eventos
    (0, 4): 'tent',
    (1, 4): 'handshake',
    (2, 4): 'medal',
    (3, 4): 'gallery',
    (4, 4): 'calendar',
    (5, 4): 'location',
    (6, 4): 'ticket',
    (7, 4): 'flag',

    # LINHA 6 - Categorias de Fórum
    (0, 5): 'circuit',
    (1, 5): 'console-stack',
    (2, 5): 'game-stack',
    (3, 5): 'tools',
    (4, 5): 'tv-retro',
    (5, 5): 'community',
    (6, 5): 'price-tag',
    (7, 5): 'arcade',

    # LINHA 7 - Consoles Específicos
    (0, 6): 'nes',
    (1, 6): 'snes',
    (2, 6): 'genesis',
    (3, 6): 'playstation',
    (4, 6): 'n64',
    (5, 6): 'gameboy',
    (6, 6): 'atari',
    (7, 6): 'dreamcast',

    # LINHA 8 - Mascote & Extras
    (0, 7): 'cat-robot',
    (1, 7): 'cat-gamer',
    (2, 7): 'cat-coder',
    (3, 7): 'cat-happy',
    (4, 7): 'verified',
    (5, 7): 'warning',
    (6, 7): 'info',
    (7, 7): 'close',
}

def extract_icons():
    """Extrai todos os 64 ícones da sprite sheet"""

    if not os.path.exists(SPRITE_SHEET):
        print(f"❌ Sprite sheet não encontrada: {SPRITE_SHEET}")
        print("\n📝 INSTRUÇÕES:")
        print("1. Abra o arquivo: PROMPT_ICONES_GEMINI.md")
        print("2. Copie o prompt e cole no Gemini")
        print("3. Baixe a imagem gerada")
        print("4. Salve como: mobile/assets/icons/icon-sheet-complete.png")
        print("5. Execute este script novamente")
        return

    # Abrir a sprite sheet
    print(f"🎨 Abrindo sprite sheet: {SPRITE_SHEET}")
    sprite = Image.open(SPRITE_SHEET)
    width, height = sprite.size
    print(f"📐 Dimensões: {width}x{height}")

    # Calcular tamanho do ícone
    icon_size = width // 8  # 8 ícones por linha
    print(f"🔲 Tamanho de cada ícone: {icon_size}x{icon_size}")

    # Criar diretório de saída
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Extrair cada ícone
    extracted = 0
    for (col, row), name in sorted(ICONS.items()):
        # Calcular coordenadas
        left = col * icon_size
        top = row * icon_size
        right = left + icon_size
        bottom = top + icon_size

        # Recortar ícone
        icon = sprite.crop((left, top, right, bottom))

        # Salvar ícone
        output_path = os.path.join(OUTPUT_DIR, f"{name}.png")
        icon.save(output_path, "PNG")

        print(f"✅ {name:20s} → posição ({col},{row})")
        extracted += 1

    print(f"\n🎉 {extracted}/64 ícones extraídos com sucesso!")
    print(f"📁 Salvos em: {OUTPUT_DIR}")

    # Listar arquivos gerados
    icons_list = sorted([f for f in os.listdir(OUTPUT_DIR) if f.endswith('.png') and f != 'icon-sheet-complete.png'])
    print(f"\n📋 Total de arquivos PNG: {len(icons_list)}")

if __name__ == "__main__":
    try:
        extract_icons()
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
