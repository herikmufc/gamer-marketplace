# 🚂 Deploy no Railway via Dashboard (Sem CLI)

## ✅ Você já está no Railway! Vamos fazer o deploy agora.

---

## 📋 Passo a Passo

### 1. Criar Novo Service

Na página atual do Railway, clique em:
- **"+ New"** (canto superior direito)
- Escolha: **"Empty Service"**

### 2. Configurar Source

1. Clique no service criado
2. Clique em **"Settings"** (na barra lateral)
3. Role até **"Source"**
4. Clique em **"Connect Repo"**

**Se não tiver GitHub conectado:**
- Clique em **"Deploy from GitHub"**
- Autorize o Railway a acessar seus repositórios
- Selecione o repositório `gamer-marketplace`

**Se não usar GitHub, use a opção manual:**
- Vá direto para o passo 3 e use "Deploy from CLI" depois

### 3. Configurar Build & Deploy

No painel de **Settings** do service:

#### Root Directory
```
backend
```

#### Build Command (deixe vazio ou use o padrão)
```
pip install -r requirements.txt
```

#### Start Command
```
uvicorn main_supabase:app --host 0.0.0.0 --port $PORT
```

#### Watch Paths (opcional)
```
backend/**
```

### 4. Adicionar Variáveis de Ambiente

1. Clique em **"Variables"** (na barra lateral)
2. Clique em **"+ New Variable"**
3. Adicione cada variável abaixo:

**Cole EXATAMENTE estas variáveis (uma por vez):**

#### Variável 1: SUPABASE_URL
```
SUPABASE_URL
```
Valor:
```
https://kpozlrvizpuekiteiece.supabase.co
```

#### Variável 2: SUPABASE_ANON_KEY
```
SUPABASE_ANON_KEY
```
Valor:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb3pscnZpenB1ZWtpdGVpZWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDY0MzYsImV4cCI6MjA5MDU4MjQzNn0.h_4t1tcoQlJxxjAMSEnQUW4mrgqjHU6grND_BR0T2OU
```

#### Variável 3: SUPABASE_SERVICE_KEY
```
SUPABASE_SERVICE_KEY
```
Valor:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb3pscnZpenB1ZWtpdGVpZWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAwNjQzNiwiZXhwIjoyMDkwNTgyNDM2fQ.ELrBZYlWB-K1MFj7N9gBAJZm0tGGOi0H0FiJtfSudwc
```

#### Variável 4: SUPABASE_DB_PASSWORD
```
SUPABASE_DB_PASSWORD
```
Valor:
```
cAmus@201996
```

#### Variável 5: USE_SUPABASE
```
USE_SUPABASE
```
Valor:
```
true
```

#### Variável 6: SECRET_KEY
```
SECRET_KEY
```
Valor:
```
gamer-marketplace-production-secret-railway-2026
```

#### Variável 7: ALGORITHM
```
ALGORITHM
```
Valor:
```
HS256
```

#### Variável 8: ACCESS_TOKEN_EXPIRE_MINUTES
```
ACCESS_TOKEN_EXPIRE_MINUTES
```
Valor:
```
10080
```

#### Variável 9: ENVIRONMENT
```
ENVIRONMENT
```
Valor:
```
production
```

#### Variável 10: PYTHON_VERSION (Opcional mas recomendado)
```
PYTHON_VERSION
```
Valor:
```
3.12.0
```

#### Variáveis Opcionais (APIs):

**ANTHROPIC_API_KEY** (se tiver):
```
ANTHROPIC_API_KEY
```
Valor: (sua key da Claude)

**OPENAI_API_KEY** (se tiver):
```
OPENAI_API_KEY
```
Valor: (sua key da OpenAI)

**MERCADOPAGO_ACCESS_TOKEN**:
```
MERCADOPAGO_ACCESS_TOKEN
```
Valor:
```
APP_USR-3608457092984824-033014-049c2ac2128ac0e708ad77c8815e4b13-330359130
```

**MERCADOPAGO_PUBLIC_KEY**:
```
MERCADOPAGO_PUBLIC_KEY
```
Valor:
```
APP_USR-4eef51bd-d9a5-4666-8265-ea580c622172
```

**MERCADOPAGO_USER_ID**:
```
MERCADOPAGO_USER_ID
```
Valor:
```
330359130
```

**PLATFORM_FEE_PERCENT**:
```
PLATFORM_FEE_PERCENT
```
Valor:
```
5.0
```

### 5. Deploy Automático

Depois de adicionar todas as variáveis:
1. O Railway vai iniciar o deploy automaticamente
2. Ou clique em **"Deploy"** no canto superior direito

### 6. Gerar Domínio Público

1. Clique em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. Copie a URL gerada (algo como: `gamer-marketplace-production.up.railway.app`)

---

## 🔍 Monitorar Deploy

1. Clique em **"Deployments"** (barra lateral)
2. Veja o progresso em tempo real
3. Clique no deploy ativo para ver logs

**Status esperado:**
- 🟡 Building... (2-3 minutos)
- 🟢 Active (deploy concluído!)

---

## 📱 Atualizar Mobile App

Após obter a URL, edite `mobile/src/api/client.js`:

```javascript
// Antes
const API_URL = 'http://192.168.1.x:8000';

// Depois
const API_URL = 'https://sua-url.up.railway.app';
```

---

## 🧪 Testar Deploy

Abra no navegador:
```
https://sua-url.up.railway.app/
```

Deve retornar:
```json
{"message": "Gamer Marketplace API"}
```

Testar docs:
```
https://sua-url.up.railway.app/docs
```

---

## 🔍 Ver Logs

1. No Dashboard do Railway
2. Clique no service
3. Vá em **"Logs"** (ou pressione `L`)
4. Veja logs em tempo real

---

## ⚡ Dicas

### Redeploy Manual
Se precisar fazer redeploy:
1. Settings → Clique em **"Redeploy"**

### Custom Domain (Opcional)
1. Settings → Networking
2. Custom Domain → Add Domain
3. Configure DNS (CNAME)

### Restart Service
Se o app travar:
1. Settings → Clique nos 3 pontos (...)
2. **"Restart"**

---

## 💰 Monitorar Uso

1. Clique no projeto (fora do service)
2. Vá em **"Usage"**
3. Veja créditos restantes ($5/mês grátis)

---

## 🐛 Troubleshooting

### Deploy falha no build

**Erro comum**: "Module not found"

**Solução**:
1. Verifique se `requirements.txt` está no diretório `backend/`
2. Confirme que Root Directory = `backend`

### Deploy falha no start

**Erro comum**: "Port already in use"

**Solução**:
Verifique Start Command:
```
uvicorn main_supabase:app --host 0.0.0.0 --port $PORT
```

### App retorna 502

**Possíveis causas**:
1. Variáveis de ambiente incorretas
2. Erro no código
3. Banco não conecta

**Solução**:
1. Veja os logs (clique em "Logs")
2. Verifique variáveis Supabase
3. Teste conexão do banco

### "Failed to connect to Supabase"

**Solução**:
1. Confirme TODAS as variáveis SUPABASE_* estão corretas
2. Especialmente `SUPABASE_DB_PASSWORD`
3. Verifique se não tem espaços extras nos valores

---

## ✅ Checklist

- [ ] Service criado no Railway
- [ ] Source configurado (repo ou manual)
- [ ] Root Directory = `backend`
- [ ] Start Command configurado
- [ ] 9 variáveis obrigatórias adicionadas
- [ ] Deploy iniciado automaticamente
- [ ] Status = Active (verde)
- [ ] Domínio gerado
- [ ] URL testada no navegador (retorna JSON)
- [ ] Logs verificados (sem erros)
- [ ] Mobile atualizado com nova URL

---

## 🎉 Deploy Concluído!

Sua URL: `https://sua-url.up.railway.app`

**Próximos passos:**
1. ✅ Atualizar mobile com a URL
2. ✅ Testar login/registro no app
3. ✅ Testar criação de produtos
4. ✅ Monitorar logs por alguns dias

---

## 📞 Suporte Railway

- **Docs**: https://docs.railway.app
- **Discord**: https://discord.gg/railway
- **Status**: https://status.railway.app

---

**Tempo estimado**: 10-15 minutos
**Custo**: $0 (free tier - $5 crédito/mês)
**Status**: 🚀 PRONTO PARA PRODUÇÃO
