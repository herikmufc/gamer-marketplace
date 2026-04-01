#!/bin/bash

# 🚀 Deploy Automatizado - Render
# RetroTrade Brasil Backend

set -e

echo "🎮 RetroTrade Brasil - Preparar para Deploy no Render"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navegar para backend
cd backend

# Criar requirements para produção
echo -e "${YELLOW}📝 Criando requirements-prod.txt...${NC}"
cat > requirements-prod.txt << 'EOF'
fastapi==0.135.2
uvicorn[standard]==0.42.0
anthropic==0.86.0
openai==1.58.1
pillow==12.1.1
python-multipart==0.0.22
sqlalchemy==2.0.48
psycopg2-binary==2.9.9
pydantic==2.12.5
python-dotenv==1.2.2
python-jose[cryptography]==3.5.0
passlib[bcrypt]==1.7.4
bcrypt<5.0.0
mercadopago==2.3.0
email-validator==2.2.0
opencv-python-headless==4.13.0.92
numpy>=2.0.0
apscheduler==3.11.2
gunicorn==21.2.0
EOF

# Criar script de start
echo -e "${YELLOW}📝 Criando start.sh...${NC}"
cat > start.sh << 'EOF'
#!/bin/bash
uvicorn main:app --host 0.0.0.0 --port $PORT
EOF

chmod +x start.sh

# Criar render.yaml
echo -e "${YELLOW}📝 Criando render.yaml...${NC}"
cat > render.yaml << 'EOF'
services:
  - type: web
    name: retrotrade-backend
    env: python
    buildCommand: pip install -r requirements-prod.txt
    startCommand: ./start.sh
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: ENVIRONMENT
        value: production
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: MERCADOPAGO_ACCESS_TOKEN
        sync: false
      - key: MERCADOPAGO_PUBLIC_KEY
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: retrotrade-db
          property: connectionString

databases:
  - name: retrotrade-db
    databaseName: retrotrade
    user: retrotrade
EOF

# Commit mudanças
echo -e "${GREEN}📤 Commitando arquivos...${NC}"
git add requirements-prod.txt start.sh render.yaml
git commit -m "feat: add Render deploy configuration" || echo "Sem mudanças para commitar"

echo ""
echo -e "${GREEN}✅ Arquivos preparados!${NC}"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Fazer push para GitHub:"
echo "   git push origin main"
echo ""
echo "2. Acessar https://render.com"
echo ""
echo "3. New → Web Service"
echo ""
echo "4. Conectar repositório GitHub"
echo ""
echo "5. Configurar:"
echo "   • Name: retrotrade-backend"
echo "   • Runtime: Python 3"
echo "   • Build Command: pip install -r requirements-prod.txt"
echo "   • Start Command: ./start.sh"
echo "   • Plan: Free (ou Starter \$7/mês)"
echo ""
echo "6. Adicionar banco de dados:"
echo "   • Dashboard → New → PostgreSQL"
echo "   • Name: retrotrade-db"
echo "   • Copiar Internal Database URL"
echo "   • Adicionar como DATABASE_URL no Web Service"
echo ""
echo "7. Adicionar variáveis de ambiente:"
echo "   ANTHROPIC_API_KEY=sk-ant-..."
echo "   OPENAI_API_KEY=sk-..."
echo "   MERCADOPAGO_ACCESS_TOKEN=APP_USR-..."
echo "   MERCADOPAGO_PUBLIC_KEY=APP_USR-..."
echo "   DATABASE_URL=postgresql://... (do PostgreSQL)"
echo ""
echo "8. Clicar em 'Deploy'!"
echo ""
echo "🌐 URL final: https://retrotrade-backend.onrender.com"
echo ""
echo "📱 Atualizar mobile/src/api/client.js com a URL"
echo ""
