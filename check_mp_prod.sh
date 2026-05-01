#!/bin/bash

echo "🔍 Verificando se credenciais de produção foram atualizadas..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Aguardar deploy
echo "⏱️  Aguardando deploy do Render (~2 minutos)..."
for i in {1..12}; do
    echo -n "."
    sleep 10
done
echo ""
echo ""

# Teste 1: Health check
echo "🧪 TESTE 1: Health Check"
HEALTH=$(curl -s https://gamer-marketplace.onrender.com/health)
MP_CONFIGURED=$(echo $HEALTH | jq -r '.mercadopago')

if [ "$MP_CONFIGURED" = "configured" ]; then
    echo -e "${GREEN}✅ Mercado Pago configurado${NC}"
else
    echo -e "${RED}❌ Mercado Pago não configurado${NC}"
fi
echo ""

# Teste 2: Verificar se é produção
echo "🧪 TESTE 2: Verificar Credenciais"
DIAGNOSTIC=$(curl -s https://gamer-marketplace.onrender.com/marketplace-diagnostic)
ACCESS_TOKEN=$(echo $DIAGNOSTIC | jq -r '.success[] | select(contains("ACCESS_TOKEN"))')

if [[ $ACCESS_TOKEN == *"APP_USR-4232969983599799"* ]]; then
    echo -e "${GREEN}✅ Credenciais de PRODUÇÃO detectadas!${NC}"
    echo "   $ACCESS_TOKEN"
else
    echo -e "${RED}❌ Ainda usando credenciais antigas${NC}"
    echo "   $ACCESS_TOKEN"
fi
echo ""

# Teste 3: Criar preferência
echo "🧪 TESTE 3: Criar Preferência de Teste"
PREFERENCE=$(curl -s https://gamer-marketplace.onrender.com/test-mp-preference/4)
INIT_POINT=$(echo $PREFERENCE | jq -r '.mp_response.init_point')

if [[ $INIT_POINT == https://www.mercadopago.com.br* ]]; then
    echo -e "${GREEN}✅ Preferência criada em PRODUÇÃO${NC}"
    echo "   Init Point: ${INIT_POINT:0:50}..."
else
    echo -e "${YELLOW}⚠️  Ainda usando sandbox ou erro${NC}"
    echo "   Init Point: $INIT_POINT"
fi
echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 RESUMO:"
echo ""

if [[ $ACCESS_TOKEN == *"APP_USR-4232969983599799"* ]] && [[ $INIT_POINT == https://www.mercadopago.com.br* ]]; then
    echo -e "${GREEN}✅ PRODUÇÃO ATIVADA COM SUCESSO!${NC}"
    echo ""
    echo "📱 Agora teste no app mobile:"
    echo "   1. Abra o app"
    echo "   2. Faça uma compra"
    echo "   3. Clique em 'Abrir no Navegador'"
    echo "   4. Deve abrir checkout do MP SEM ERRO"
else
    echo -e "${RED}❌ Credenciais ainda não foram atualizadas${NC}"
    echo ""
    echo "Aguarde mais 2 minutos e rode novamente:"
    echo "   bash check_mp_prod.sh"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
