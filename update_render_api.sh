#!/bin/bash

echo "🔧 Atualizando variáveis de ambiente no Render via API"
echo ""

# Você precisa preencher estas informações:
# 1. Seu API Key do Render (pegar em: https://dashboard.render.com/u/settings)
# 2. O Service ID do seu serviço

echo "📋 INSTRUÇÕES:"
echo ""
echo "1. Acesse: https://dashboard.render.com/u/settings"
echo "2. Vá em 'API Keys'"
echo "3. Clique em 'Create API Key'"
echo "4. Dê um nome (ex: 'CLI Update')"
echo "5. Copie o API Key"
echo ""

read -p "Cole seu RENDER API KEY aqui: " RENDER_API_KEY
echo ""

if [ -z "$RENDER_API_KEY" ]; then
    echo "❌ API Key não fornecida"
    exit 1
fi

echo "🔍 Buscando seus serviços..."
echo ""

# Listar serviços
SERVICES=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
    "https://api.render.com/v1/services")

echo "📦 Seus serviços:"
echo "$SERVICES" | jq -r '.[] | "  - \(.name) (ID: \(.id))"'
echo ""

# Pegar o ID do gamer-marketplace
SERVICE_ID=$(echo "$SERVICES" | jq -r '.[] | select(.name == "gamer-marketplace") | .id')

if [ -z "$SERVICE_ID" ]; then
    echo "❌ Serviço 'gamer-marketplace' não encontrado"
    echo ""
    echo "Serviços disponíveis:"
    echo "$SERVICES" | jq -r '.[] | .name'
    echo ""
    read -p "Digite o nome exato do seu serviço: " SERVICE_NAME
    SERVICE_ID=$(echo "$SERVICES" | jq -r ".[] | select(.name == \"$SERVICE_NAME\") | .id")
fi

if [ -z "$SERVICE_ID" ]; then
    echo "❌ Serviço não encontrado"
    exit 1
fi

echo "✅ Serviço encontrado: $SERVICE_ID"
echo ""
echo "📝 Atualizando variáveis de ambiente..."
echo ""

# Novas credenciais
NEW_APP_ID="4232969983599799"
NEW_CLIENT_SECRET="z8rLjMSBVjfxWwwwhZFVb6lYcazGAZkk"
NEW_ACCESS_TOKEN="APP_USR-4232969983599799-033014-04c88499f451465394304bbb4c24f4e4-289948302"

# Atualizar cada variável
echo "1️⃣ Atualizando MERCADOPAGO_APP_ID..."
curl -s -X PUT \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"key\": \"MERCADOPAGO_APP_ID\", \"value\": \"$NEW_APP_ID\"}" \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars/MERCADOPAGO_APP_ID" > /dev/null

echo "2️⃣ Atualizando MERCADOPAGO_CLIENT_SECRET..."
curl -s -X PUT \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"key\": \"MERCADOPAGO_CLIENT_SECRET\", \"value\": \"$NEW_CLIENT_SECRET\"}" \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars/MERCADOPAGO_CLIENT_SECRET" > /dev/null

echo "3️⃣ Atualizando MERCADOPAGO_ACCESS_TOKEN..."
curl -s -X PUT \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"key\": \"MERCADOPAGO_ACCESS_TOKEN\", \"value\": \"$NEW_ACCESS_TOKEN\"}" \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars/MERCADOPAGO_ACCESS_TOKEN" > /dev/null

echo ""
echo "✅ Variáveis atualizadas com sucesso!"
echo ""
echo "⏱️  O Render vai reiniciar o serviço automaticamente"
echo "    Aguarde ~2-3 minutos para o deploy completar"
echo ""
echo "🧪 Para testar depois, rode:"
echo "    bash check_mp_prod.sh"
