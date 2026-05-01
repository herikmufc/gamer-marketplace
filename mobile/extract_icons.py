#!/usr/bin/env python3
"""
Script para extrair ícones individuais da sprite sheet
"""

from PIL import Image
import os

# Configurações
SPRITE_SHEET = "assets/icons/icon-sheet.png"
OUTPUT_DIR = "assets/icons"
ICON_SIZE = 256  # 1024 / 4 = 256 pixels por ícone

# Mapeamento dos ícones (posição x, y na grid 4x5)
ICONS = {
    # Row 0 - Navigation (Gatos + AI)
    (0, 0): 'home',
    (1, 0): 'events',
    (2, 0): 'cheats',
    (3, 0): 'profile-ai',

    # Row 1 - Serviços
    (0, 1): 'marketplace',
    (1, 1): 'forum',
    (2, 1): 'help',
    (3, 1): 'chat',

    # Row 2 - Categorias & Botões
    (0, 2): 'category-grid',
    (1, 2): 'gamepad',
    (2, 2): 'tokens',
    (3, 2): 'user-group',

    # Row 3 - Dispositivos
    (0, 3): 'all',
    (1, 3): 'consoles',
    (2, 3): 'hardware',
    (3, 3): 'community',

    # Row 4 - Mais categorias
    (0, 4): 'cat',
    (1, 4): 'games',
    (2, 4): 'cartridge',
    (3, 4): 'settings',
}

def extract_icons():
    """Extrai cada ícone da sprite sheet"""

    # Abrir a sprite sheet
    print(f"🎨 Abrindo sprite sheet: {SPRITE_SHEET}")
    sprite = Image.open(SPRITE_SHEET)
    width, height = sprite.size
    print(f"📐 Dimensões: {width}x{height}")

    # Calcular tamanho do ícone baseado na imagem
    icon_size = width // 4  # 4 ícones por linha
    print(f"🔲 Tamanho de cada ícone: {icon_size}x{icon_size}")

    # Criar diretório de saída se não existir
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Extrair cada ícone
    extracted = 0
    for (col, row), name in ICONS.items():
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

        print(f"✅ {name}.png ({col},{row})")
        extracted += 1

    print(f"\n🎉 {extracted} ícones extraídos com sucesso!")
    print(f"📁 Salvos em: {OUTPUT_DIR}")

if __name__ == "__main__":
    try:
        extract_icons()
    except FileNotFoundError:
        print(f"❌ Arquivo não encontrado: {SPRITE_SHEET}")
        print("Por favor, salve a sprite sheet em assets/icons/icon-sheet.png")
    except Exception as e:
        print(f"❌ Erro: {e}")
