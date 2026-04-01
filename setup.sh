#!/bin/bash

echo "🎮 ============================================"
echo "   Gamer Marketplace - Setup Inicial"
echo "=============================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar dependências
echo "📋 Verificando dependências..."

# Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 não encontrado!${NC}"
    echo "Instale: sudo apt install python3 python3-venv python3-pip"
    exit 1
else
    echo -e "${GREEN}✓ Python 3 encontrado${NC}"
fi

# Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo "Instale: https://nodejs.org/"
    exit 1
else
    echo -e "${GREEN}✓ Node.js encontrado ($(node -v))${NC}"
fi

# NPM
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ npm encontrado ($(npm -v))${NC}"
fi

echo ""
echo "🔧 Configurando Backend..."
cd backend

# Criar venv se não existir
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual Python..."
    python3 -m venv venv
fi

# Ativar venv e instalar dependências
echo "Instalando dependências Python..."
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
deactivate

echo -e "${GREEN}✓ Backend configurado${NC}"

cd ..
echo ""
echo "📱 Configurando Mobile..."
cd mobile

# Instalar dependências
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências Node.js..."
    npm install
else
    echo -e "${GREEN}✓ Dependências já instaladas${NC}"
fi

cd ..
echo ""
echo "✅ Setup completo!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 PRÓXIMOS PASSOS:"
echo ""
echo "1. Configure a API Key da Anthropic:"
echo "   ${YELLOW}nano backend/.env${NC}"
echo "   Adicione: ANTHROPIC_API_KEY=sk-ant-..."
echo "   (Obtenha em: https://console.anthropic.com/)"
echo ""
echo "2. Descubra seu IP local:"
echo "   ${YELLOW}hostname -I | awk '{print \$1}'${NC}"
echo ""
echo "3. Configure o mobile:"
echo "   ${YELLOW}nano mobile/src/api/client.js${NC}"
echo "   Linha 8: const API_URL = 'http://SEU_IP:8000';"
echo ""
echo "4. Inicie o backend:"
echo "   ${YELLOW}./start-backend.sh${NC}"
echo ""
echo "5. Em outro terminal, inicie o mobile:"
echo "   ${YELLOW}./start-mobile.sh${NC}"
echo ""
echo "6. No celular:"
echo "   - Instale 'Expo Go' da Play Store"
echo "   - Escaneie o QR Code"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentação:"
echo "   - README.md - Documentação completa"
echo "   - QUICK_START.md - Guia rápido"
echo "   - BUILD_APK.md - Como gerar APK"
echo ""
echo "🎮 Bom desenvolvimento!"
