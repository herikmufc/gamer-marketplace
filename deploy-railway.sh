#!/bin/bash

# 🚀 Deploy Automatizado - Railway
# RetroTrade Brasil Backend

set -e

echo "🎮 RetroTrade Brasil - Deploy para Railway"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI não encontrado. Instalando...${NC}"
    npm install -g @railway/cli
fi

# Navegar para backend
cd backend

# Criar Procfile se não existir
if [ ! -f "Procfile" ]; then
    echo -e "${YELLOW}📝 Criando Procfile...${NC}"
    cat > Procfile << 'EOF'
web: uvicorn main:app --host 0.0.0.0 --port $PORT
EOF
fi

# Criar railway.json
echo -e "${YELLOW}📝 Criando railway.json...${NC}"
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Criar requirements para produção
echo -e "${YELLOW}📝 Criando requirements-prod.txt...${NC}"
cp requirements.txt requirements-prod.txt
echo "gunicorn==21.2.0" >> requirements-prod.txt
echo "psycopg2-binary==2.9.9" >> requirements-prod.txt

# Login Railway
echo -e "${GREEN}🔐 Fazendo login no Railway...${NC}"
railway login

# Inicializar projeto (se necessário)
if [ ! -f "railway.toml" ]; then
    echo -e "${GREEN}🎯 Inicializando projeto...${NC}"
    railway init
fi

# Adicionar PostgreSQL
echo -e "${GREEN}💾 Verificando banco de dados...${NC}"
railway add postgresql || echo "PostgreSQL já existe"

# Configurar variáveis de ambiente
echo ""
echo -e "${YELLOW}⚙️  Configurar variáveis de ambiente${NC}"
echo "Acesse o dashboard do Railway e adicione:"
echo ""
echo "ANTHROPIC_API_KEY=seu_key"
echo "OPENAI_API_KEY=seu_key"
echo "MERCADOPAGO_ACCESS_TOKEN=seu_token"
echo "MERCADOPAGO_PUBLIC_KEY=seu_key"
echo "ENVIRONMENT=production"
echo ""
read -p "Pressione ENTER quando terminar de configurar..."

# Deploy
echo ""
echo -e "${GREEN}🚀 Fazendo deploy...${NC}"
railway up

# Obter URL
echo ""
echo -e "${GREEN}🌐 Obtendo URL do projeto...${NC}"
railway domain

# Status
echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "📊 Ver logs:"
echo "   railway logs"
echo ""
echo "🌐 Abrir dashboard:"
echo "   railway open"
echo ""
echo "📱 Atualizar mobile/src/api/client.js com a URL:"
echo "   const API_URL = 'https://sua-url.railway.app';"
echo ""
