#!/bin/bash
# Script para atualizar API Key do Gemini

echo "🔑 Script de Atualização da Gemini API Key"
echo "=========================================="
echo ""

# Pedir nova chave
read -p "📝 Cole a NOVA API Key do Gemini: " NEW_KEY

if [ -z "$NEW_KEY" ]; then
    echo "❌ Erro: Chave não pode estar vazia!"
    exit 1
fi

if [[ ! $NEW_KEY == AIza* ]]; then
    echo "⚠️  Aviso: Chave não começa com 'AIza'. Tem certeza que está correta?"
    read -p "Continuar mesmo assim? (s/n): " confirm
    if [ "$confirm" != "s" ]; then
        exit 0
    fi
fi

echo ""
echo "📂 Atualizando backend/.env..."

# Backup
cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup criado"

# Atualizar .env
if grep -q "GEMINI_API_KEY=" backend/.env; then
    sed -i "s|GEMINI_API_KEY=.*|GEMINI_API_KEY=$NEW_KEY|g" backend/.env
    echo "✅ Chave atualizada no .env"
else
    echo "GEMINI_API_KEY=$NEW_KEY" >> backend/.env
    echo "✅ Chave adicionada ao .env"
fi

echo ""
echo "🔄 Reiniciando backend local..."
pkill -f uvicorn
sleep 2

cd backend
source venv/bin/activate
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo "⏳ Aguardando backend iniciar..."
sleep 8

# Testar
echo ""
echo "🧪 Testando nova chave..."
HEALTH=$(curl -s http://localhost:8000/health)

if echo "$HEALTH" | grep -q "configured"; then
    echo "✅ SUCESSO! Nova chave está funcionando!"
    echo ""
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
else
    echo "❌ Erro: Backend não está respondendo corretamente"
    echo "Log:"
    tail -20 /tmp/backend.log
fi

echo ""
echo "=========================================="
echo "✅ Atualização local concluída!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Atualizar no Render:"
echo "   https://dashboard.render.com/"
echo "   → Environment → GEMINI_API_KEY"
echo ""
echo "2. Aguardar deploy (~3 min)"
echo ""
echo "3. Testar no app mobile"
echo ""
echo "Backup salvo em: backend/.env.backup.*"
