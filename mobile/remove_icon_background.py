#!/usr/bin/env python3
"""
Remove fundo branco dos ícones e torna transparente
"""

from PIL import Image
import os
from pathlib import Path

def remove_white_background(image_path, threshold=240):
    """
    Remove fundo branco de uma imagem PNG e salva com transparência

    Args:
        image_path: Caminho para o arquivo PNG
        threshold: Limite para considerar um pixel como "branco" (0-255)
    """
    # Abrir imagem
    img = Image.open(image_path).convert("RGBA")

    # Obter dados dos pixels
    data = img.getdata()

    # Criar nova lista de pixels
    new_data = []
    for item in data:
        # Se o pixel é branco ou quase branco (R, G, B acima do threshold)
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            # Tornar transparente (A = 0)
            new_data.append((255, 255, 255, 0))
        else:
            # Manter pixel original
            new_data.append(item)

    # Atualizar dados da imagem
    img.putdata(new_data)

    # Salvar imagem com transparência
    img.save(image_path, "PNG")
    print(f"✅ Processado: {os.path.basename(image_path)}")

def process_all_icons(icons_dir="assets/icons", threshold=240):
    """
    Processa todos os ícones PNG na pasta
    """
    icons_path = Path(icons_dir)

    if not icons_path.exists():
        print(f"❌ Pasta não encontrada: {icons_dir}")
        return

    # Listar todos os arquivos PNG
    png_files = list(icons_path.glob("*.png"))

    if not png_files:
        print(f"❌ Nenhum arquivo PNG encontrado em {icons_dir}")
        return

    print(f"🔍 Encontrados {len(png_files)} ícones")
    print(f"🎨 Removendo fundo branco (threshold={threshold})...\n")

    # Processar cada ícone
    for png_file in png_files:
        try:
            remove_white_background(png_file, threshold)
        except Exception as e:
            print(f"❌ Erro ao processar {png_file.name}: {e}")

    print(f"\n✅ Processamento concluído! {len(png_files)} ícones atualizados")
    print("🎮 Agora os ícones têm fundo transparente!")

if __name__ == "__main__":
    # Processar todos os ícones
    # Threshold=240 remove pixels muito brancos, preservando cores do ícone
    process_all_icons(threshold=240)
