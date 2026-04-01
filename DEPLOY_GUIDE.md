# 🚀 Guia de Deploy - RetroTrade Brasil Backend

## 📋 Opções de Hosting

### 🎯 Recomendações por Caso de Uso

| Opção | Custo/Mês | Facilidade | Performance | Melhor Para |
|-------|-----------|------------|-------------|-------------|
| **Railway** | $5-20 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Prototipagem rápida |
| **Render** | $7-25 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Deploy fácil + SSL grátis |
| **DigitalOcean** | $6-40 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Controle total + escalável |
| **AWS EC2** | $10-50+ | ⭐⭐ | ⭐⭐⭐⭐⭐ | Empresarial + alta escala |
| **Heroku** | $7-25 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Deploy simples (descontinuado free tier) |
| **VPS Brasil** | R$20-80 | ⭐⭐⭐ | ⭐⭐⭐ | Baixa latência Brasil |

---

## 🌟 Opção 1: Railway (MAIS RÁPIDO)

**Por que Railway?**
- ✅ Deploy em 5 minutos
- ✅ SSL automático
- ✅ Banco PostgreSQL incluído
- ✅ Git push = auto deploy
- ✅ $5 de crédito grátis por mês

### Passo a Passo

#### 1. Criar conta
```bash
# Acesse: https://railway.app
# Login com GitHub
```

#### 2. Preparar o projeto
```bash
cd /home/madeinweb/gamer-marketplace/backend

# Criar Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Criar railway.json
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
```

#### 3. Deploy via CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Adicionar PostgreSQL
railway add postgresql

# Deploy
railway up

# Obter URL
railway domain
```

#### 4. Configurar variáveis de ambiente
```bash
# No dashboard Railway, adicionar:
ANTHROPIC_API_KEY=seu_key_aqui
OPENAI_API_KEY=seu_key_aqui
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
DATABASE_URL=postgresql://... (auto-gerado)
```

**URL final**: `https://retrotrade-production.railway.app`

---

## 🎨 Opção 2: Render (RECOMENDADO)

**Por que Render?**
- ✅ Free tier generoso (750h/mês)
- ✅ SSL automático
- ✅ Deploy de Git
- ✅ PostgreSQL gerenciado
- ✅ Logs em tempo real

### Passo a Passo

#### 1. Criar conta
```bash
# Acesse: https://render.com
# Conecte seu GitHub
```

#### 2. Preparar projeto
```bash
cd /home/madeinweb/gamer-marketplace/backend

# Criar requirements.txt de produção
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

# Criar start script
cat > start.sh << 'EOF'
#!/bin/bash
uvicorn main:app --host 0.0.0.0 --port $PORT
EOF

chmod +x start.sh
```

#### 3. Deploy no Render
1. Dashboard → New → Web Service
2. Conectar repositório GitHub
3. Configurar:
   - **Name**: retrotrade-backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements-prod.txt`
   - **Start Command**: `./start.sh`
   - **Plan**: Free (ou Starter $7/mês)

#### 4. Adicionar PostgreSQL
1. Dashboard → New → PostgreSQL
2. Nome: retrotrade-db
3. Copiar Internal Database URL
4. Adicionar ao Web Service como `DATABASE_URL`

#### 5. Variáveis de ambiente
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
DATABASE_URL=postgresql://... (do Render PostgreSQL)
PYTHON_VERSION=3.11
```

**URL final**: `https://retrotrade-backend.onrender.com`

---

## 💧 Opção 3: DigitalOcean Droplet (CONTROLE TOTAL)

**Por que DigitalOcean?**
- ✅ Controle total do servidor
- ✅ Performance excelente
- ✅ Escalável
- ✅ $200 de crédito grátis (novo usuário)

### Passo a Passo

#### 1. Criar Droplet
```bash
# Acesse: https://digitalocean.com
# Create → Droplets
# Escolha:
# - Ubuntu 22.04 LTS
# - Basic Plan
# - Regular CPU - $6/mês (1GB RAM)
# - Datacenter: São Paulo
# - SSH Key (adicione sua chave pública)
```

#### 2. Conectar ao servidor
```bash
# Obter IP do droplet
DROPLET_IP=your_droplet_ip

# Conectar via SSH
ssh root@$DROPLET_IP
```

#### 3. Setup inicial do servidor
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências
apt install -y python3.11 python3.11-venv python3-pip nginx postgresql postgresql-contrib git

# Criar usuário
adduser retrotrade
usermod -aG sudo retrotrade

# Trocar para usuário
su - retrotrade
```

#### 4. Deploy da aplicação
```bash
# Clonar repositório (ou fazer upload)
cd ~
git clone https://github.com/seu-usuario/gamer-marketplace.git
cd gamer-marketplace/backend

# Criar ambiente virtual
python3.11 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
pip install gunicorn

# Criar arquivo .env
nano .env
# Adicionar variáveis...
```

#### 5. Configurar Gunicorn
```bash
# Criar serviço systemd
sudo nano /etc/systemd/system/retrotrade.service
```

```ini
[Unit]
Description=RetroTrade FastAPI Application
After=network.target

[Service]
User=retrotrade
Group=www-data
WorkingDirectory=/home/retrotrade/gamer-marketplace/backend
Environment="PATH=/home/retrotrade/gamer-marketplace/backend/venv/bin"
ExecStart=/home/retrotrade/gamer-marketplace/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar e iniciar
sudo systemctl daemon-reload
sudo systemctl enable retrotrade
sudo systemctl start retrotrade
sudo systemctl status retrotrade
```

#### 6. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/retrotrade
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/retrotrade /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Configurar SSL com Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com.br
```

#### 8. Configurar PostgreSQL
```bash
sudo -u postgres psql

-- No psql:
CREATE DATABASE retrotrade;
CREATE USER retrotrade WITH PASSWORD 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON DATABASE retrotrade TO retrotrade;
\q

# Atualizar .env com DATABASE_URL
DATABASE_URL=postgresql://retrotrade:senha_forte_aqui@localhost/retrotrade
```

**URL final**: `https://seu-dominio.com.br`

---

## 🔥 Opção 4: Script de Deploy Automatizado

Criei scripts para facilitar o deploy:

```bash
# Ver próximo arquivo: deploy-railway.sh
# Ver próximo arquivo: deploy-render.sh
# Ver próximo arquivo: deploy-digitalocean.sh
```

---

## 📦 Preparar Backend para Produção

### 1. Criar `requirements-prod.txt`
```txt
fastapi==0.135.2
uvicorn[standard]==0.42.0
gunicorn==21.2.0
psycopg2-binary==2.9.9
...todas as outras dependências...
```

### 2. Atualizar `main.py` para produção
```python
# No main.py, adicionar:

import os
from fastapi.middleware.cors import CORSMiddleware

# Configurar CORS para produção
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://seu-dominio.com.br",
        "https://app.seu-dominio.com.br",
        # Adicionar domínios permitidos
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Detectar ambiente
IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"

if IS_PRODUCTION:
    # Desabilitar docs em produção (opcional)
    app.docs_url = None
    app.redoc_url = None
```

### 3. Configurar banco de dados
```python
# database.py
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./retrotrade.db"  # Fallback para dev
)

# Fix para Railway/Render (postgresql:// → postgresql+psycopg2://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL)
```

---

## 🔐 Variáveis de Ambiente Obrigatórias

```bash
# APIs
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx

# Banco de dados
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Segurança
SECRET_KEY=chave_aleatoria_256_bits
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Ambiente
ENVIRONMENT=production
ALLOWED_ORIGINS=https://seu-dominio.com.br

# Taxas
PLATFORM_FEE_PERCENT=5.0
AUTO_RELEASE_DAYS=3
```

---

## 📊 Monitoramento e Logs

### Railway
```bash
railway logs
railway logs --tail
```

### Render
- Dashboard → Logs (tempo real)
- Metrics tab para performance

### DigitalOcean
```bash
# Logs do Gunicorn
sudo journalctl -u retrotrade -f

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Atualizar Backend (Deploy Updates)

### Railway
```bash
git push origin main
# Auto-deploy!
```

### Render
```bash
git push origin main
# Auto-deploy!
```

### DigitalOcean
```bash
ssh retrotrade@$DROPLET_IP

cd ~/gamer-marketplace/backend
git pull
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart retrotrade
```

---

## 💰 Custos Estimados

### Cenário Starter (até 1K usuários)
| Serviço | Opção | Custo/Mês |
|---------|-------|-----------|
| Backend | Railway Hobby | $5 |
| Database | Railway PostgreSQL | Incluído |
| Storage | Railway | Incluído 100GB |
| **TOTAL** | | **$5** |

### Cenário Crescimento (1K-10K usuários)
| Serviço | Opção | Custo/Mês |
|---------|-------|-----------|
| Backend | Render Starter | $7 |
| Database | Render PostgreSQL | $7 |
| CDN | Cloudflare | Free |
| **TOTAL** | | **$14** |

### Cenário Profissional (10K+ usuários)
| Serviço | Opção | Custo/Mês |
|---------|-------|-----------|
| Backend | DigitalOcean Droplet 2GB | $12 |
| Database | DigitalOcean Managed DB | $15 |
| CDN | Cloudflare Pro | $20 |
| Monitoring | Better Uptime | $10 |
| **TOTAL** | | **$57** |

---

## 🎯 Qual Escolher?

### 👶 Iniciante / Prototipagem
**→ Railway ou Render**
- Mais fácil e rápido
- Deploy automático
- SSL grátis

### 🏢 Produção Séria
**→ DigitalOcean**
- Controle total
- Melhor performance
- Escalável

### 🚀 Grande Escala
**→ AWS ou GCP**
- Infraestrutura enterprise
- Auto-scaling
- Múltiplas regiões

---

## 📝 Checklist de Deploy

- [ ] Criar requirements-prod.txt
- [ ] Configurar variáveis de ambiente
- [ ] Atualizar CORS para domínio de produção
- [ ] Configurar banco PostgreSQL
- [ ] Testar migrações do banco
- [ ] Configurar SSL/HTTPS
- [ ] Testar todos os endpoints
- [ ] Configurar domínio customizado
- [ ] Setup de backup do banco
- [ ] Configurar monitoramento
- [ ] Documentar credenciais
- [ ] Testar mobile conectando ao servidor

---

## 🆘 Troubleshooting

### Erro: "ModuleNotFoundError"
```bash
# Instalar dependências faltantes
pip install -r requirements.txt
```

### Erro: "Database connection failed"
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
python -c "from sqlalchemy import create_engine; engine = create_engine('$DATABASE_URL'); engine.connect()"
```

### Erro: "Port already in use"
```bash
# Matar processo na porta 8000
lsof -ti:8000 | xargs kill -9
```

### Erro: "CORS blocked"
```python
# Adicionar domínio em allowed_origins
allow_origins=[
    "https://seu-dominio.com.br",
    "http://localhost:8081",  # Para dev
]
```

---

## 📚 Recursos Adicionais

- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**🚀 Pronto para colocar no ar!**

Qual opção você prefere? Posso criar os scripts de deploy automatizados para você! 🎯
