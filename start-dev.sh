#!/bin/bash

# 🚀 RetroTrade Brasil - Start Development Environment
# Este script inicia backend + frontend para desenvolvimento

echo "🎮 RetroTrade Brasil - Iniciando ambiente de desenvolvimento..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo "📦 Verificando Node.js..."
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)

if [ -z "$NODE_VERSION" ]; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo "Instale Node.js 20+: https://nodejs.org/"
    exit 1
elif [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Node.js $NODE_VERSION detectado. Necessário Node 20+${NC}"
    echo "Use: nvm use 20"

    # Tentar usar nvm automaticamente
    if [ -f "$HOME/.nvm/nvm.sh" ]; then
        echo "Tentando usar nvm..."
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm use 20 2>/dev/null || nvm install 20
    else
        exit 1
    fi
fi

echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
echo ""

# 2. Verificar Python
echo "🐍 Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 não encontrado!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python $(python3 --version)${NC}"
echo ""

# 3. Matar processos antigos
echo "🔄 Limpando processos antigos..."
pkill -f "python main.py" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Processos limpos${NC}"
echo ""

# 4. Iniciar Backend
echo "🚀 Iniciando Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Criando virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Verificar dependências
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Instalando dependências do backend..."
    pip install -q -r requirements.txt
fi

# Iniciar backend em background
nohup python main.py > /tmp/retrotrade-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"
echo "   Logs: tail -f /tmp/retrotrade-backend.log"
echo "   API Docs: http://localhost:8000/docs"
echo ""

# Aguardar backend iniciar
echo "⏳ Aguardando backend inicializar..."
for i in {1..10}; do
    if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend online!${NC}"
        break
    fi
    sleep 1
done
echo ""

# 5. Iniciar Mobile (Expo)
echo "📱 Iniciando Expo..."
cd ../mobile

# Verificar dependências
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências do mobile..."
    npm install
fi

# Iniciar Expo em background
nohup npx expo start --clear > /tmp/retrotrade-expo.log 2>&1 &
EXPO_PID=$!
echo -e "${GREEN}✅ Expo iniciado (PID: $EXPO_PID)${NC}"
echo "   Logs: tail -f /tmp/retrotrade-expo.log"
echo ""

# Aguardar Expo iniciar
echo "⏳ Aguardando Metro Bundler..."
for i in {1..15}; do
    if curl -s http://localhost:8081 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Metro Bundler online!${NC}"
        break
    fi
    sleep 1
done
echo ""

# 6. Status Final
echo "=========================================="
echo -e "${GREEN}🎉 Ambiente iniciado com sucesso!${NC}"
echo "=========================================="
echo ""
echo "📊 Serviços:"
echo "   🔹 Backend:  http://localhost:8000"
echo "   🔹 API Docs: http://localhost:8000/docs"
echo "   🔹 Expo:     http://localhost:8081"
echo ""
echo "📱 Abrir no emulador:"
echo "   cd mobile && npx expo run:android"
echo "   Ou pressione 'a' no terminal do Expo"
echo ""
echo "📝 Logs em tempo real:"
echo "   Backend: tail -f /tmp/retrotrade-backend.log"
echo "   Expo:    tail -f /tmp/retrotrade-expo.log"
echo ""
echo "⏹️  Parar tudo:"
echo "   ./stop-dev.sh"
echo "   Ou: kill $BACKEND_PID $EXPO_PID"
echo ""
echo "🧪 Guia de testes:"
echo "   cat GUIA_TESTE_EMULADOR.md"
echo ""
echo "=========================================="
echo ""

# Salvar PIDs para fácil cleanup
echo "$BACKEND_PID" > /tmp/retrotrade-backend.pid
echo "$EXPO_PID" > /tmp/retrotrade-expo.pid

# Opcional: Abrir logs em tempo real
read -p "Deseja ver os logs em tempo real? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "Abrindo logs... (Ctrl+C para sair)"
    tail -f /tmp/retrotrade-backend.log /tmp/retrotrade-expo.log
fi
