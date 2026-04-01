# 🚀 Deploy no Render (Sem CLI - Mais Fácil!)

## ✅ Vantagens do Render
- ✅ **100% via Dashboard** - Sem CLI necessário
- ✅ **Free Tier** - Gratuito para começar
- ✅ **SSL automático** - HTTPS pronto
- ✅ **Deploy em 10 cliques**

---

## 📋 Passo a Passo

### 1. Criar Conta
1. Acesse: https://render.com
2. Clique em **"Get Started for Free"**
3. Faça login com GitHub ou Email

### 2. Criar Novo Web Service

1. No Dashboard, clique em: **"New +"** → **"Web Service"**

2. **Conectar Repositório**:
   - Se tiver no GitHub: Conecte o repositório
   - Se NÃO tiver no GitHub: **"Public Git Repository"**
   - Cole a URL (ou upload manual)

### 3. Configurar Service

**Name**: `gamer-marketplace`

**Region**: `Oregon (US West)` (ou mais próximo do Brasil)

**Branch**: `main` (ou master)

**Root Directory**: `backend`

**Runtime**: `Python 3`

**Build Command**:
```bash
pip install -r requirements.txt
```

**Start Command**:
```bash
uvicorn main_supabase:app --host 0.0.0.0 --port $PORT
```

### 4. Adicionar Variáveis de Ambiente

Role até **"Environment Variables"** e clique em **"Add Environment Variable"**.

**Cole estas variáveis** (uma por linha):

```
SUPABASE_URL=https://kpozlrvizpuekiteiece.supabase.co
```

```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb3pscnZpenB1ZWtpdGVpZWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDY0MzYsImV4cCI6MjA5MDU4MjQzNn0.h_4t1tcoQlJxxjAMSEnQUW4mrgqjHU6grND_BR0T2OU
```

```
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb3pscnZpenB1ZWtpdGVpZWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAwNjQzNiwiZXhwIjoyMDkwNTgyNDM2fQ.ELrBZYlWB-K1MFj7N9gBAJZm0tGGOi0H0FiJtfSudwc
```

```
SUPABASE_DB_PASSWORD=cAmus@201996
```

```
USE_SUPABASE=true
```

```
SECRET_KEY=gamer-marketplace-production-secret-2026
```

```
ALGORITHM=HS256
```

```
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

```
ENVIRONMENT=production
```

### 5. Escolher Plano

- **Free**: Gratuito (⚠️ dorme após 15min sem uso)
- **Starter ($7/mês)**: Sempre ativo

Para começar, escolha **Free**.

### 6. Criar Service

Clique em **"Create Web Service"**

O Render vai:
1. ✅ Fazer build do projeto (~3-5 min)
2. ✅ Instalar dependências
3. ✅ Iniciar o servidor
4. ✅ Gerar URL pública

---

## 🌐 Obter URL

Após o deploy, sua URL estará no topo da página:

```
https://gamer-marketplace.onrender.com
```

---

## 📱 Atualizar Mobile

Edite `mobile/src/api/client.js`:

```javascript
// Antes
const API_URL = 'http://192.168.1.x:8000';

// Depois
const API_URL = 'https://gamer-marketplace.onrender.com';
```

---

## 🔍 Ver Logs

No Dashboard do Render:
- Clique no seu service
- Vá em: **"Logs"**
- Veja logs em tempo real

---

## ⚡ Dica: Evitar Cold Start

No free tier, o app "dorme" após 15min sem uso.
Para manter ativo:

1. Use um serviço de ping (ex: [cron-job.org](https://cron-job.org))
2. Ping a cada 10 minutos: `https://seu-app.onrender.com/`
3. **OU** upgrade para Starter ($7/mês)

---

## 🐛 Troubleshooting

### Deploy falha com "Module not found"

Verifique:
- `requirements.txt` está correto
- Todas as dependências estão listadas

### App não responde (503)

- Primeira request pode demorar ~1min (cold start)
- Verifique logs para erros

### Erro de Database

- Confirme que todas as variáveis SUPABASE_* estão corretas
- Teste conexão no Supabase Dashboard

---

## 💰 Custos

### Free Tier
- ✅ **$0/mês**
- ✅ 750 horas/mês
- ⚠️ Dorme após 15min inativo
- ⚠️ Cold start (~30s na primeira request)

### Starter
- 💰 **$7/mês**
- ✅ Sempre ativo
- ✅ Sem cold start
- ✅ Custom domain

---

## ✅ Checklist

- [ ] Conta criada no Render
- [ ] Web Service criado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído (status: "Live")
- [ ] URL obtida
- [ ] Teste de health check (abra a URL no navegador)
- [ ] Mobile atualizado com nova URL

---

## 🎉 Pronto!

Seu backend está no ar! 🚀

**URL**: https://seu-app.onrender.com

**Próximo passo**: Atualizar o mobile app com a nova URL!
