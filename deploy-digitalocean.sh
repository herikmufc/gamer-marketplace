#!/bin/bash

# 🚀 Deploy Automatizado - DigitalOcean
# RetroTrade Brasil Backend

set -e

echo "🎮 RetroTrade Brasil - Deploy para DigitalOcean"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar parâmetros
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: IP do droplet não fornecido${NC}"
    echo "Uso: ./deploy-digitalocean.sh <DROPLET_IP>"
    echo "Exemplo: ./deploy-digitalocean.sh 167.99.123.45"
    exit 1
fi

DROPLET_IP=$1
SSH_USER="root"

echo -e "${GREEN}📡 Conectando ao droplet: $DROPLET_IP${NC}"
echo ""

# Criar script de setup remoto
cat > /tmp/setup_server.sh << 'REMOTE_SCRIPT'
#!/bin/bash

set -e

echo "🔧 Configurando servidor..."

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências
echo "📦 Instalando dependências..."
apt install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    nginx \
    postgresql \
    postgresql-contrib \
    git \
    ufw \
    certbot \
    python3-certbot-nginx

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Criar usuário retrotrade
echo "👤 Criando usuário retrotrade..."
if ! id "retrotrade" &>/dev/null; then
    adduser --disabled-password --gecos "" retrotrade
    usermod -aG sudo retrotrade
    echo "retrotrade ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/retrotrade
fi

# Configurar PostgreSQL
echo "💾 Configurando PostgreSQL..."
sudo -u postgres psql << EOF
SELECT 'CREATE DATABASE retrotrade' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'retrotrade')\gexec
DROP USER IF EXISTS retrotrade;
CREATE USER retrotrade WITH PASSWORD 'retrotrade_password_change_me';
ALTER DATABASE retrotrade OWNER TO retrotrade;
GRANT ALL PRIVILEGES ON DATABASE retrotrade TO retrotrade;
EOF

echo "✅ Setup inicial concluído!"
REMOTE_SCRIPT

# Enviar e executar script de setup
echo -e "${YELLOW}📤 Enviando script de setup...${NC}"
scp /tmp/setup_server.sh $SSH_USER@$DROPLET_IP:/tmp/
ssh $SSH_USER@$DROPLET_IP "bash /tmp/setup_server.sh"

# Deploy da aplicação
echo ""
echo -e "${GREEN}🚀 Fazendo deploy da aplicação...${NC}"

# Criar script de deploy
cat > /tmp/deploy_app.sh << 'DEPLOY_SCRIPT'
#!/bin/bash

set -e

echo "📦 Deploy da aplicação..."

# Navegar para home
cd /home/retrotrade

# Clonar/atualizar repositório
if [ -d "gamer-marketplace" ]; then
    echo "🔄 Atualizando repositório..."
    cd gamer-marketplace
    git pull
else
    echo "📥 Clonando repositório..."
    # Substitua pela URL do seu repo
    git clone https://github.com/seu-usuario/gamer-marketplace.git
    cd gamer-marketplace
fi

cd backend

# Criar ambiente virtual
echo "🐍 Configurando ambiente Python..."
python3.11 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Criar arquivo .env
echo "⚙️  Criando arquivo .env..."
cat > .env << 'ENV_FILE'
DATABASE_URL=postgresql://retrotrade:retrotrade_password_change_me@localhost/retrotrade
ANTHROPIC_API_KEY=CHANGE_ME
OPENAI_API_KEY=CHANGE_ME
MERCADOPAGO_ACCESS_TOKEN=CHANGE_ME
MERCADOPAGO_PUBLIC_KEY=CHANGE_ME
SECRET_KEY=CHANGE_ME_TO_RANDOM_STRING
ENVIRONMENT=production
PLATFORM_FEE_PERCENT=5.0
AUTO_RELEASE_DAYS=3
ENV_FILE

echo "⚠️  IMPORTANTE: Edite /home/retrotrade/gamer-marketplace/backend/.env com suas credenciais!"

# Executar migrações
echo "🗄️  Executando migrações..."
python -c "from main import Base, engine; Base.metadata.create_all(bind=engine)"

echo "✅ Aplicação instalada!"
DEPLOY_SCRIPT

# Enviar e executar
scp /tmp/deploy_app.sh $SSH_USER@$DROPLET_IP:/tmp/
ssh $SSH_USER@$DROPLET_IP "sudo -u retrotrade bash /tmp/deploy_app.sh"

# Configurar Gunicorn Service
echo ""
echo -e "${YELLOW}⚙️  Configurando serviço systemd...${NC}"

cat > /tmp/retrotrade.service << 'SERVICE'
[Unit]
Description=RetroTrade FastAPI Application
After=network.target

[Service]
User=retrotrade
Group=www-data
WorkingDirectory=/home/retrotrade/gamer-marketplace/backend
Environment="PATH=/home/retrotrade/gamer-marketplace/backend/venv/bin"
ExecStart=/home/retrotrade/gamer-marketplace/backend/venv/bin/gunicorn \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    main:app \
    --bind 0.0.0.0:8000 \
    --access-logfile /var/log/retrotrade/access.log \
    --error-logfile /var/log/retrotrade/error.log

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

scp /tmp/retrotrade.service $SSH_USER@$DROPLET_IP:/tmp/
ssh $SSH_USER@$DROPLET_IP << 'SSH_COMMANDS'
# Criar diretório de logs
sudo mkdir -p /var/log/retrotrade
sudo chown retrotrade:www-data /var/log/retrotrade

# Instalar e iniciar serviço
sudo mv /tmp/retrotrade.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable retrotrade
sudo systemctl start retrotrade
sudo systemctl status retrotrade --no-pager
SSH_COMMANDS

# Configurar Nginx
echo ""
echo -e "${YELLOW}🌐 Configurando Nginx...${NC}"

read -p "Digite seu domínio (ex: api.retrotrade.com.br) ou deixe em branco para usar IP: " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN=$DROPLET_IP
fi

cat > /tmp/nginx_retrotrade << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

scp /tmp/nginx_retrotrade $SSH_USER@$DROPLET_IP:/tmp/
ssh $SSH_USER@$DROPLET_IP << 'SSH_COMMANDS'
sudo mv /tmp/nginx_retrotrade /etc/nginx/sites-available/retrotrade
sudo ln -sf /etc/nginx/sites-available/retrotrade /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
SSH_COMMANDS

# SSL (se tiver domínio)
if [ "$DOMAIN" != "$DROPLET_IP" ]; then
    echo ""
    echo -e "${YELLOW}🔒 Configurando SSL...${NC}"
    ssh $SSH_USER@$DROPLET_IP "sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN || echo 'SSL setup falhou, configure manualmente'"
fi

# Finalizar
echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Informações do Deploy:"
echo ""
echo "🌐 URL: http://$DOMAIN"
if [ "$DOMAIN" != "$DROPLET_IP" ]; then
    echo "🔒 HTTPS: https://$DOMAIN"
fi
echo ""
echo "⚙️  IMPORTANTE: Configure as variáveis de ambiente!"
echo ""
echo "ssh $SSH_USER@$DROPLET_IP"
echo "sudo nano /home/retrotrade/gamer-marketplace/backend/.env"
echo ""
echo "Edite:"
echo "  ANTHROPIC_API_KEY=seu_key"
echo "  OPENAI_API_KEY=seu_key"
echo "  MERCADOPAGO_ACCESS_TOKEN=seu_token"
echo "  SECRET_KEY=\$(openssl rand -hex 32)"
echo ""
echo "Depois reinicie:"
echo "  sudo systemctl restart retrotrade"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Comandos úteis:"
echo ""
echo "Ver logs:"
echo "  ssh $SSH_USER@$DROPLET_IP 'sudo journalctl -u retrotrade -f'"
echo ""
echo "Reiniciar serviço:"
echo "  ssh $SSH_USER@$DROPLET_IP 'sudo systemctl restart retrotrade'"
echo ""
echo "Status do serviço:"
echo "  ssh $SSH_USER@$DROPLET_IP 'sudo systemctl status retrotrade'"
echo ""
echo "📱 Atualizar mobile/src/api/client.js:"
echo "  const API_URL = 'https://$DOMAIN';"
echo ""
