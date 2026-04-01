# 🚂 Deploy Railway - Guia Rápido

## ⚡ Deploy em 5 Passos

### 1. Instalar Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login
```bash
railway login
```

### 3. Criar Projeto
```bash
cd /home/madeinweb/gamer-marketplace/backend
railway init
# Escolha: "Create new project"
# Nome: "gamer-marketplace"
```

### 4. Configurar Variáveis (Cole no Railway Dashboard)

Acesse: https://railway.app/dashboard → Seu Projeto → Variables

```bash
SUPABASE_URL=https://kpozlrvizpuekiteiece.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb3pscnZpenB1ZWtpdGVpZWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDY0MzYsImV4cCI6MjA5MDU4MjQzNn0.h_4t1tcoQlJxxjAMSEnQUW4mrgqjHU6grND_BR0T2OU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb3pscnZpenB1ZWtpdGVpZWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAwNjQzNiwiZXhwIjoyMDkwNTgyNDM2fQ.ELrBZYlWB-K1MFj7N9gBAJZm0tGGOi0H0FiJtfSudwc
SUPABASE_DB_PASSWORD=cAmus@201996
USE_SUPABASE=true
SECRET_KEY=gamer-marketplace-prod-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ENVIRONMENT=production
```

### 5. Deploy!
```bash
railway up
```

## 🎯 Obter URL

```bash
railway domain
```

Ou no Dashboard: Settings → Generate Domain

## 📱 Atualizar Mobile

Edite `mobile/src/api/client.js`:
```javascript
const API_URL = 'https://sua-url.railway.app';
```

## 🔍 Ver Logs

```bash
railway logs
```

## ✅ Pronto!

Seu backend está no ar! 🚀
