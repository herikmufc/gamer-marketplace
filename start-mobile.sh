#!/bin/bash

echo "📱 Iniciando Gamer Marketplace Mobile..."

cd mobile

# Verificar node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar configuração da API
API_URL=$(grep "const API_URL" src/api/client.js | cut -d"'" -f2)

echo ""
echo "📡 Configuração atual da API:"
echo "   $API_URL"
echo ""

if [[ $API_URL == *"10.0.2.2"* ]]; then
    echo "⚠️  Você está usando o IP do emulador Android (10.0.2.2)"
    echo ""
    echo "Para testar em celular físico:"
    echo "1. Descubra seu IP: hostname -I | awk '{print \$1}'"
    echo "2. Edite: mobile/src/api/client.js"
    echo "3. Linha 8: const API_URL = 'http://SEU_IP:8000';"
    echo ""
fi

read -p "Pressione ENTER para iniciar o Expo..."

# Iniciar Expo
echo ""
echo "🚀 Iniciando Expo..."
echo ""
echo "Opções:"
echo "  [a] - Abrir no emulador Android"
echo "  [i] - Abrir no simulador iOS (Mac only)"
echo "  [w] - Abrir no navegador"
echo "  [QR Code] - Escanear com Expo Go no celular"
echo ""

npx expo start
