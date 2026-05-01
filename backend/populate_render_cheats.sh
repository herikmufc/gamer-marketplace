#!/bin/bash
# Script para popular cheats no Render via API

API_URL="https://gamer-marketplace.onrender.com"

# Primeiro login para pegar token
echo "🔐 Fazendo login..."
TOKEN=$(curl -s -X POST "$API_URL/token" \
  -d "username=admin&password=admin123" | python3 -c "import json, sys; print(json.load(sys.stdin).get('access_token', ''))")

if [ -z "$TOKEN" ]; then
  echo "❌ Erro ao fazer login"
  exit 1
fi

echo "✅ Login bem-sucedido!"
echo ""

# Testar endpoint
echo "🔍 Testando endpoint de consoles..."
curl -s "$API_URL/cheats/consoles" -H "Authorization: Bearer $TOKEN" || echo "⚠️  Endpoint retornou erro (esperado se tabela não existe)"

echo ""
echo "✅ Script preparado!"
echo ""
echo "📝 NOTA: A tabela será criada automaticamente quando o backend iniciar."
echo "    Se o endpoint retornar 500, significa que a tabela não existe ainda."
echo "    Você pode popular os cheats via SQL direto no Render PostgreSQL."
