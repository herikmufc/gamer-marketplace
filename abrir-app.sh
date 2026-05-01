#!/bin/bash

clear
echo "════════════════════════════════════════"
echo "   🎮 RetroTrade Brasil - Web App"
echo "════════════════════════════════════════"
echo ""
echo "🌐 Iniciando app no navegador..."
echo ""
echo "📱 O app abrirá em: http://localhost:19006"
echo ""
echo "⏳ Aguarde a compilação (pode demorar ~30s na primeira vez)"
echo ""
echo "🛑 Para parar: pressione Ctrl+C"
echo ""
echo "════════════════════════════════════════"
echo ""

cd mobile
npm run web
