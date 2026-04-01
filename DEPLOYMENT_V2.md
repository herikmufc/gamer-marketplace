# 🚀 Guia de Deploy - RetroTrade Brasil v2.0

## 📋 Pré-requisitos

- [x] Backend v2.0 implementado
- [x] Mobile com novas telas
- [x] CPF obrigatório
- [x] Termos legais
- [x] Chat e fórum

---

## 🔧 Deploy do Backend

### 1. Atualizar para Backend v2.0

```bash
cd /home/madeinweb/gamer-marketplace/backend

# Backup do banco antigo (opcional)
cp gamer_marketplace.db gamer_marketplace_v1_backup.db

# Ativar versão 2.0
mv main.py main_v1_backup.py
mv main_extended.py main.py

# Verificar se está OK
python main.py
```

**Portas:**
- Backend: http://0.0.0.0:8000
- Docs: http://0.0.0.0:8000/docs

### 2. Verificar Novos Endpoints

```bash
# Testar API
curl http://localhost:8000/

# Deve retornar:
{
  "message": "RetroTrade Brasil API v2.0",
  "features": ["Chat", "Forum", "CPF", "Legal Terms"]
}
```

### 3. Configurar Variáveis de Ambiente

```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-api03-...  # Sua chave
DATABASE_URL=sqlite:///./retrotrade_brasil.db
SECRET_KEY=change-this-in-production-2024
```

---

## 📱 Deploy do Mobile

### 1. Instalar Novas Dependências

```bash
cd /home/madeinweb/gamer-marketplace/mobile

# Não precisa instalar nada novo!
# Todas dependências já existem
```

### 2. Atualizar Configuração

**Edite:** `mobile/src/api/client.js`

```javascript
// Linha 8 - Configure seu IP
const API_URL = 'http://SEU_IP:8000';

// Exemplo para celular físico:
const API_URL = 'http://192.168.1.100:8000';

// Exemplo para emulador Android:
const API_URL = 'http://10.0.2.2:8000';
```

**Edite:** `mobile/app.json`

```json
{
  "expo": {
    "name": "RetroTrade Brasil",
    "slug": "retrotrade-brasil",
    "version": "2.0.0",
    ...
  }
}
```

### 3. Testar Localmente

```bash
cd mobile
npx expo start

# Opções:
# [a] - Android emulator
# [QR] - Expo Go no celular
```

---

## 🏗️ Gerar APK v2.0

### Opção 1: EAS Build (Recomendado)

```bash
cd mobile

# Login
eas login

# Build
eas build --platform android --profile preview

# Aguarde ~20 minutos
# APK será gerado com link para download
```

### Opção 2: Expo Go (Teste Rápido)

```bash
# Já configurado!
# Apenas rode: npx expo start
```

---

## 🧪 Testes Essenciais

### Backend:

```bash
# 1. Teste registro com CPF
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "username": "teste",
    "password": "123456",
    "full_name": "Teste Usuario",
    "cpf": "12345678901",
    "phone": "(11) 99999-9999"
  }'

# 2. Teste login
curl -X POST http://localhost:8000/token \
  -d "username=teste&password=123456"

# 3. Teste chat rooms (precisa token)
curl http://localhost:8000/chat/rooms \
  -H "Authorization: Bearer SEU_TOKEN"

# 4. Teste fórum
curl http://localhost:8000/forum/posts
```

### Mobile:

**Fluxo Completo:**

1. ✅ Abre app → Tela de Termos Legais
2. ✅ Rola até o fim → Botão "Aceitar" ativa
3. ✅ Clica "Aceitar" → Vai para Login
4. ✅ Clica "Cadastre-se"
5. ✅ Preenche CPF (com máscara)
6. ✅ Cria conta → Login automático
7. ✅ Navega nas 4 abas (Home, Fórum, Chat, Perfil)
8. ✅ Cria anúncio com IA
9. ✅ Entra no fórum e vê posts
10. ✅ Abre chat (ainda vazio)

---

## 🔐 Checklist de Segurança

### Antes de Deploy em Produção:

- [ ] Mudar `SECRET_KEY` no .env
- [ ] Usar PostgreSQL (não SQLite)
- [ ] Habilitar HTTPS (certificado SSL)
- [ ] Configurar rate limiting
- [ ] Backup automático do banco
- [ ] Logs em arquivo separado
- [ ] Monitoramento de erros (Sentry)
- [ ] CORS configurado corretamente
- [ ] CPF validation server-side
- [ ] API Key da Anthropic em produção

---

## 📊 Estrutura do Banco de Dados v2.0

**Novas Tabelas:**

```sql
-- Usuários (atualizada)
users:
  + cpf (string, unique, indexed)
  + phone (string, optional)
  + terms_accepted_at (datetime)
  + terms_version (string)

-- Chat
chat_rooms:
  id, product_id, buyer_id, seller_id
  created_at, last_message_at, is_active

chat_messages:
  id, room_id, sender_id
  message_type, content, is_read
  created_at

-- Fórum
forum_posts:
  id, author_id, category, title, content
  likes_count, views_count, comments_count
  is_pinned, is_locked
  created_at, updated_at

forum_comments:
  id, post_id, author_id, content
  parent_comment_id, likes_count
  created_at
```

**Migração:**
- Banco antigo: `gamer_marketplace.db`
- Banco novo: `retrotrade_brasil.db`
- Dados serão perdidos (criar novo banco)

---

## 🌐 Deploy em Servidor (Produção)

### Opção 1: VPS (DigitalOcean, AWS, etc)

```bash
# 1. Instalar dependências
sudo apt update
sudo apt install python3 python3-pip nginx

# 2. Clonar projeto
git clone https://github.com/seu-usuario/retrotrade-brasil
cd retrotrade-brasil/backend

# 3. Configurar ambiente
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Configurar .env
nano .env
# Configure todas variáveis

# 5. Rodar com Gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# 6. Configurar Nginx
sudo nano /etc/nginx/sites-available/retrotrade
```

**Nginx Config:**

```nginx
server {
    listen 80;
    server_name api.retrotrade.com.br;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Opção 2: Heroku (Fácil)

```bash
# 1. Criar Procfile
echo "web: gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker" > Procfile

# 2. Deploy
heroku create retrotrade-brasil
git push heroku main

# 3. Configurar variáveis
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
heroku config:set SECRET_KEY=...
```

### Opção 3: Railway.app (Rápido)

1. Conectar repositório GitHub
2. Railway detecta Python automaticamente
3. Adicionar variáveis de ambiente
4. Deploy automático

---

## 📱 Publicar na Google Play

### 1. Preparar APK

```bash
# Gerar APK release
eas build --platform android --profile production

# Ou AAB (preferido pela Play Store)
eas build --platform android --profile production --type app-bundle
```

### 2. Criar Conta na Play Console

1. Acesse: https://play.google.com/console
2. Pague taxa única de $25
3. Crie novo aplicativo

### 3. Preencher Informações

**Obrigatório:**
- Nome: RetroTrade Brasil
- Descrição curta (80 chars)
- Descrição completa (4000 chars)
- Ícone: 512x512
- Screenshots: Mínimo 2 (Phone)
- Categoria: Compras
- Classificação: +12 anos

**Conteúdo da Loja:**

```
Título: RetroTrade Brasil - Marketplace Gamer

Descrição Curta:
Compre, venda e colecione consoles, jogos e periféricos com IA e segurança

Descrição Completa:
🎮 RetroTrade Brasil

O primeiro marketplace brasileiro especializado em consoles, jogos e periféricos vintage com análise de IA!

✨ Features:
• 🤖 IA analisa condição e sugere preço justo
• 🔒 CPF obrigatório para segurança
• 💬 Chat integrado e criptografado
• 🎮 Fórum da comunidade gamer
• 📊 Precificação inteligente
• ⚖️ Base legal completa (anti-fraude)

🛡️ Segurança:
• Conformidade com LGPD
• Sistema de denúncias
• Rastreabilidade total
• Colaboração judicial

💎 Para Colecionadores:
• Sistema de raridade
• Histórico de preços
• Análise de autenticidade
• Comunidade ativa

Baixe agora e faça parte da maior comunidade gamer do Brasil!
```

### 4. Upload e Revisão

```bash
# 1. Upload do AAB
# 2. Preencher questionário de conteúdo
# 3. Declaração de privacidade (LGPD)
# 4. Enviar para revisão
# 5. Aguardar 1-3 dias
```

---

## 🔍 Monitoramento

### Logs do Backend:

```bash
# Ver logs em tempo real
tail -f backend/logs/app.log

# Erros
grep ERROR backend/logs/app.log

# Fraudes detectadas
grep FRAUD backend/logs/app.log
```

### Analytics Sugeridos:

- **Sentry** - Tracking de erros
- **Google Analytics** - Uso do app
- **Mixpanel** - Eventos personalizados
- **Firebase** - Crashlytics

---

## 💰 Custos Estimados (Mensal)

| Item | Custo |
|------|-------|
| VPS Básico | R$ 25-50 |
| Domínio (.com.br) | R$ 40/ano |
| Claude API (100 análises) | R$ 15 |
| Firebase (Storage) | R$ 0 (free tier) |
| Play Store (uma vez) | R$ 125 |
| **Total/mês** | **R$ 40-65** |

---

## 📈 Métricas de Sucesso

**Após 1 mês:**
- 100+ usuários cadastrados
- 50+ produtos anunciados
- 20+ vendas realizadas
- 10+ posts no fórum
- 0 fraudes reportadas

**Após 3 meses:**
- 500+ usuários
- 200+ produtos
- 100+ vendas
- 50+ discussões ativas
- Sistema de reputação funcionando

---

## 🆘 Troubleshooting

### Backend não inicia:
```bash
# Verificar porta 8000
lsof -i :8000

# Matar processo
kill -9 PID

# Verificar .env
cat backend/.env

# Ver logs
python main.py
```

### Mobile não conecta:
```bash
# Verificar IP
hostname -I

# Testar backend
curl http://SEU_IP:8000/

# Ver logs do Expo
npx expo start --clear
```

### APK não instala:
```bash
# Verificar assinatura
jarsigner -verify -verbose app.apk

# Reinstalar
adb uninstall com.retrotrade.app
adb install app.apk
```

---

## ✅ Checklist Final

### Antes de Lançar:

- [ ] Backend rodando em produção
- [ ] HTTPS configurado
- [ ] Banco de dados com backup
- [ ] APK testado em 3+ dispositivos
- [ ] Todos fluxos testados
- [ ] Política de privacidade publicada
- [ ] Termos de uso atualizados
- [ ] Suporte técnico configurado
- [ ] Redes sociais criadas
- [ ] Landing page publicada

---

## 🎉 Lançamento

**Estratégia:**

1. **Soft Launch** (Semana 1)
   - 50 usuários beta
   - Feedback intensivo
   - Ajustes rápidos

2. **Public Launch** (Semana 2)
   - Post em grupos do Facebook
   - Reddit (r/gamingbrasil)
   - Twitter/Instagram
   - Press release

3. **Growth** (Mês 1-3)
   - Parcerias com lojas
   - Influencers gamers
   - Eventos presenciais
   - Ads segmentados

---

**Boa sorte com o lançamento! 🚀🎮**

**Dúvidas:** Consulte README.md e documentação completa.
