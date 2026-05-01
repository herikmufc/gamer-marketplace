#!/bin/bash

# Script para atualizar variáveis de ambiente no Render via CLI
# Requer: Render CLI instalada (https://render.com/docs/cli)

echo "🔧 Atualizando variáveis de ambiente no Render..."
echo ""

# IDs do serviço (você precisa preencher)
SERVICE_ID="srv-xxxxx"  # Substitua pelo ID do seu serviço

# Novas credenciais de produção
NEW_APP_ID="4232969983599799"
NEW_CLIENT_SECRET="z8rLjMSBVjfxWwwwhZFVb6lYcazGAZkk"
NEW_ACCESS_TOKEN="APP_USR-4232969983599799-033014-04c88499f451465394304bbb4c24f4e4-289948302"

echo "📝 Verificando se Render CLI está instalada..."
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI não está instalada"
    echo ""
    echo "Instale com:"
    echo "  npm install -g @render-com/render-cli"
    echo "  ou"
    echo "  curl -fsSL https://render.com/get-cli | sh"
    exit 1
fi

echo "✅ Render CLI encontrada"
echo ""

echo "🔐 Fazendo login no Render..."
render login

echo ""
echo "📝 Atualizando variáveis..."

# Atualizar APP_ID
render env set MERCADOPAGO_APP_ID="$NEW_APP_ID" --service=$SERVICE_ID

# Atualizar CLIENT_SECRET
render env set MERCADOPAGO_CLIENT_SECRET="$NEW_CLIENT_SECRET" --service=$SERVICE_ID

# Atualizar ACCESS_TOKEN
render env set MERCADOPAGO_ACCESS_TOKEN="$NEW_ACCESS_TOKEN" --service=$SERVICE_ID

echo ""
echo "✅ Variáveis atualizadas!"
echo ""
echo "⏱️  O Render vai reiniciar o serviço automaticamente"
echo "    Aguarde ~2 minutos para o deploy completar"
