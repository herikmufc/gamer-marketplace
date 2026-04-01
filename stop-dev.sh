#!/bin/bash

# 🛑 RetroTrade Brasil - Stop Development Environment

echo "🛑 Parando RetroTrade Brasil..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# 1. Matar processos por PID salvo
if [ -f /tmp/retrotrade-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/retrotrade-backend.pid)
    if kill $BACKEND_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Backend parado (PID: $BACKEND_PID)${NC}"
    fi
    rm /tmp/retrotrade-backend.pid
fi

if [ -f /tmp/retrotrade-expo.pid ]; then
    EXPO_PID=$(cat /tmp/retrotrade-expo.pid)
    if kill $EXPO_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Expo parado (PID: $EXPO_PID)${NC}"
    fi
    rm /tmp/retrotrade-expo.pid
fi

# 2. Matar qualquer processo remanescente
pkill -f "python main.py" 2>/dev/null && echo -e "${GREEN}✅ Processos Python parados${NC}"
pkill -f "expo start" 2>/dev/null && echo -e "${GREEN}✅ Processos Expo parados${NC}"
pkill -f "node.*metro" 2>/dev/null && echo -e "${GREEN}✅ Metro Bundler parado${NC}"

# 3. Liberar portas
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✅ Porta 8000 liberada${NC}"
lsof -ti:8081 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✅ Porta 8081 liberada${NC}"

echo ""
echo -e "${GREEN}🎉 Ambiente parado com sucesso!${NC}"
echo ""

# Limpar logs (opcional)
read -p "Deseja limpar os logs? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    rm -f /tmp/retrotrade-backend.log
    rm -f /tmp/retrotrade-expo.log
    echo -e "${GREEN}✅ Logs limpos${NC}"
fi
