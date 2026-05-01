#!/bin/bash

# Script para extrair ícones individuais da sprite sheet
# Requer ImageMagick instalado: sudo apt install imagemagick

SPRITE_SHEET="assets/icons/icon-sheet.png"
OUTPUT_DIR="assets/icons"
ICON_SIZE=128

# Verificar se ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick não encontrado. Instale com: sudo apt install imagemagick"
    exit 1
fi

# Verificar se a sprite sheet existe
if [ ! -f "$SPRITE_SHEET" ]; then
    echo "❌ Sprite sheet não encontrada em: $SPRITE_SHEET"
    echo "Por favor, salve a imagem dos ícones neste caminho."
    exit 1
fi

echo "🎨 Extraindo ícones da sprite sheet..."

# Row 1 - Navigation
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+0+0 "$OUTPUT_DIR/home.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+${ICON_SIZE}+0 "$OUTPUT_DIR/events.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+$((ICON_SIZE*2))+0 "$OUTPUT_DIR/cheats.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+$((ICON_SIZE*3))+0 "$OUTPUT_DIR/profile-ai.png"

# Row 2 - Serviços
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+0+${ICON_SIZE} "$OUTPUT_DIR/marketplace.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+${ICON_SIZE}+${ICON_SIZE} "$OUTPUT_DIR/forum.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+$((ICON_SIZE*2))+${ICON_SIZE} "$OUTPUT_DIR/help.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+$((ICON_SIZE*3))+${ICON_SIZE} "$OUTPUT_DIR/chat.png"

# Row 3 - Categorias
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+0+$((ICON_SIZE*2)) "$OUTPUT_DIR/category-grid.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+${ICON_SIZE}+$((ICON_SIZE*2)) "$OUTPUT_DIR/gamepad.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+$((ICON_SIZE*2))+$((ICON_SIZE*2)) "$OUTPUT_DIR/tokens.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+$((ICON_SIZE*3))+$((ICON_SIZE*2)) "$OUTPUT_DIR/user-group.png"

# Row 4 - Dispositivos
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+0+$((ICON_SIZE*3)) "$OUTPUT_DIR/all.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+${ICON_SIZE}+$((ICON_SIZE*3)) "$OUTPUT_DIR/consoles.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+$((ICON_SIZE*2))+$((ICON_SIZE*3)) "$OUTPUT_DIR/hardware.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+$((ICON_SIZE*3))+$((ICON_SIZE*3)) "$OUTPUT_DIR/community.png"

# Row 5 - Mais categorias
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+0+$((ICON_SIZE*4)) "$OUTPUT_DIR/cat.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+${ICON_SIZE}+$((ICON_SIZE*4)) "$OUTPUT_DIR/games.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+$((ICON_SIZE*2))+$((ICON_SIZE*4)) "$OUTPUT_DIR/cartridge.png"
convert "$SPRITE_SHEET" -crop ${ICON_SIZE}x${ICON_SIZE}+$((ICON_SIZE*3))+$((ICON_SIZE*4)) "$OUTPUT_DIR/settings.png"

echo "✅ Ícones extraídos com sucesso!"
echo "📁 Ícones salvos em: $OUTPUT_DIR"
ls -lh "$OUTPUT_DIR"/*.png
