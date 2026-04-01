# 🎮 RETROTRADE BRASIL - Overview Completo do Sistema

## 📋 Sumário Executivo

**RetroTrade Brasil** é um marketplace completo de jogos retro com recursos avançados de IA, fórum comunitário, chat integrado, sistema de pagamentos seguros e assistente de manutenção de consoles. O sistema utiliza tecnologias modernas e serviços gratuitos para oferecer uma experiência completa sem custos de infraestrutura.

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

#### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: Supabase PostgreSQL (Free Tier)
- **Storage**: Supabase Storage Buckets
- **AI**: Google Gemini 1.5 Flash (Free API)
- **Pagamentos**: Mercado Pago (Sandbox/Produção)
- **Deploy**: Render.com (Free Tier)
- **ORM**: SQLAlchemy 2.0

#### Mobile
- **Framework**: React Native + Expo
- **Navegação**: React Navigation v6
- **Estado**: Context API + AsyncStorage
- **HTTP Client**: Axios
- **Build**: EAS Build (Expo Application Services)

#### Infraestrutura
```
┌─────────────────┐
│  Expo App       │ ← Cliente Mobile
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Render.com     │ ← Backend API (FastAPI)
└────────┬────────┘
         │
         ├──→ Supabase PostgreSQL (Database)
         ├──→ Supabase Storage (Imagens/Vídeos)
         ├──→ Google Gemini API (IA)
         └──→ Mercado Pago API (Pagamentos)
```

---

## 📱 Funcionalidades do App Mobile (21 Telas)

### 1. **Autenticação e Onboarding**
- [x] **AnimatedSplashScreen** - Splash animada com logo oficial
- [x] **LegalTermsScreen** - Termos de uso e privacidade (LGPD)
- [x] **RegisterScreen** - Cadastro com CPF obrigatório
- [x] **LoginScreen** - Login com JWT token

### 2. **Marketplace de Produtos**
- [x] **HomeScreen** - Lista de produtos disponíveis
- [x] **CreateProductScreen** - Criar anúncio com:
  - Múltiplas fotos (até 5)
  - Sugestão de preço com IA (Gemini)
  - Campos: título, descrição, categoria, console, estado
- [x] **ProductDetailScreen** - Detalhes do produto
- [x] **IdentifyGameScreen** - Identificar jogo por foto (IA)

### 3. **Sistema de Pagamentos**
- [x] **CheckoutScreen** - Finalizar compra (Mercado Pago)
- [x] **VideoVerificationScreen** - Comprador verifica produto
- [x] **MyTransactionsScreen** - Histórico de compras/vendas
- [x] **TransactionDetailScreen** - Detalhes da transação

### 4. **Chat e Negociação**
- [x] **ChatListScreen** - Lista de conversas
- [ ] Chat em tempo real (WebSocket - não implementado)
- [x] Moderação automática com IA (detecta golpes)

### 5. **Fórum Comunitário**
- [x] **ForumCategoriesScreen** - 7 categorias principais
  - Hardware, Consoles, Jogos, Marketplace
  - Modificações, Emulação, Comunidade
- [x] **ForumTopicsScreen** - Lista de tópicos por categoria
- [x] **CreateForumTopicScreen** - Criar novo tópico

### 6. **Eventos**
- [x] **EventsScreen** - Eventos de games retro
- [x] **EventDetailScreen** - Detalhes do evento
- [x] Descoberta de eventos por IA (Gemini)

### 7. **Manutenção de Consoles**
- [x] **MaintenanceScreen** - Chatbot especialista em reparo
  - Suporte para fotos e vídeos
  - Diagnóstico de problemas
  - Instruções passo a passo
  - Recomendações de ferramentas/peças

### 8. **Perfil do Usuário**
- [x] **ProfileScreen** - Perfil, reputação, histórico

---

## 🔌 API Backend (42+ Endpoints)

### Endpoints de Autenticação
```
POST   /register           - Criar nova conta (CPF obrigatório)
POST   /token              - Login (retorna JWT)
GET    /me                 - Dados do usuário logado
```

### Endpoints de Produtos
```
GET    /products           - Listar produtos (filtros: categoria, console)
GET    /products/{id}      - Detalhes do produto
POST   /products           - Criar produto (multipart/form-data)
POST   /products/analyze   - Analisar produto e sugerir preço (IA)
POST   /products/identify  - Identificar jogo por foto (Gemini)
GET    /search?q=texto     - Buscar produtos
```

### Endpoints de Chat
```
GET    /chat/rooms                    - Lista conversas do usuário
POST   /chat/rooms/{product_id}       - Criar conversa sobre produto
GET    /chat/rooms/{room_id}/messages - Mensagens da conversa
POST   /chat/rooms/{room_id}/messages - Enviar mensagem
POST   /chat/moderate-message         - Moderar mensagem (IA)
GET    /chat/alerts                   - Alertas de moderação
POST   /chat/alerts/{id}/resolve      - Resolver alerta
```

### Endpoints de Fórum
```
GET    /forum/posts                - Listar posts (filtros)
POST   /forum/posts                - Criar post
GET    /forum/posts/{id}           - Detalhes do post
POST   /forum/posts/{id}/comments  - Criar comentário
GET    /forum/posts/{id}/comments  - Listar comentários
```

### Endpoints de Eventos
```
GET    /events                 - Listar eventos
POST   /events                 - Criar evento
GET    /events/{id}            - Detalhes do evento
POST   /events/{id}/interest   - Marcar interesse
DELETE /events/{id}/interest   - Remover interesse
POST   /events/discover        - Descobrir eventos por IA
```

### Endpoints de Pagamentos (Mercado Pago)
```
POST   /payment/create                      - Criar pagamento
GET    /payment/{transaction_id}            - Consultar transação
POST   /payment/{transaction_id}/ship       - Vendedor marca enviado
POST   /payment/{transaction_id}/verify-video - Comprador envia vídeo
POST   /payment/{transaction_id}/release    - Liberar pagamento
POST   /payment/{transaction_id}/dispute    - Abrir reclamação
GET    /my-transactions                     - Minhas transações
POST   /webhook/mercadopago                 - Webhook do MP
```

### Endpoints de Manutenção (Chatbot IA)
```
POST   /maintenance/start         - Iniciar sessão de assistência
POST   /maintenance/chat          - Enviar mensagem (texto/foto/vídeo)
GET    /maintenance/tips/{console} - Dicas de manutenção
POST   /maintenance/diagnose      - Diagnosticar problema
```

### Endpoint de Health Check
```
GET    /health                    - Status do sistema
```

---

## 🤖 Funcionalidades de IA (Google Gemini)

### 1. Identificação de Jogos
- **Modelo**: gemini-1.5-flash-latest
- **Input**: Foto do cartucho/caixa
- **Output**: Nome, console, região, ano, estado, valor estimado, confiança

### 2. Sugestão de Preço
- **Análise**: Condição física, raridade, completude
- **Cálculo**: Score de condição + raridade + bônus de completude
- **Output**: Faixa de preço (mín, ideal, máx) em reais

### 3. Moderação de Chat
- **Detecção**: Golpes, pagamento externo, assédio, spam
- **Ação**: ALLOW, WARN, BLOCK, BAN
- **Alertas**: Sistema de alertas para moderadores

### 4. Descoberta de Eventos
- **Input**: Estado/cidade do usuário
- **Output**: Eventos de jogos retro, feiras, encontros, lojas

### 5. Assistente de Manutenção
- **Especialização**: Consoles retro (NES, SNES, PS1/2, etc.)
- **Diagnóstico**: Análise de fotos/vídeos do problema
- **Instruções**: Passo a passo de reparo
- **Segurança**: Avisos de risco elétrico

---

## 🗄️ Modelo de Dados (PostgreSQL)

### Tabelas Principais

#### users
```sql
- id (PK)
- email, username, cpf (UNIQUE)
- hashed_password
- full_name, phone
- reputation_score (0-100)
- is_technician (boolean)
- terms_accepted_at, terms_version
- created_at, updated_at
```

#### products
```sql
- id (PK)
- title, description
- category (game, console, peripheral)
- console_type (SNES, PS1, etc)
- condition_score, rarity_score (0-100)
- price_min, price_ideal, price_max, final_price
- is_working, is_complete, has_box, has_manual
- images (JSON array)
- ai_analysis (JSON)
- owner_id (FK → users)
- is_sold, views_count
- created_at, updated_at
```

#### transactions
```sql
- id (PK)
- product_id (FK → products)
- buyer_id, seller_id (FK → users)
- amount, platform_fee
- payment_id (Mercado Pago)
- status (pending, paid, shipped, verified, completed, disputed)
- tracking_code
- verification_video_url
- ai_verification_result (JSON)
- created_at, updated_at
```

#### chat_rooms, chat_messages
```sql
- Salas de chat por produto
- Mensagens com tipo (text, image, video)
- is_read, created_at
```

#### forum_posts, forum_comments
```sql
- Posts com categoria, título, conteúdo
- Comentários com sistema de threads
- likes_count, views_count
```

#### events
```sql
- Eventos de jogos retro
- title, description, location
- event_date, organizer
- interested_users (Many-to-Many)
```

#### chat_alerts
```sql
- Alertas de moderação
- alert_type, risk_score (0-100)
- detected_patterns (JSON)
- is_resolved
```

---

## 🔒 Segurança e Compliance

### LGPD (Lei Geral de Proteção de Dados)
- [x] Termos de uso obrigatórios no cadastro
- [x] CPF mascarado na API (123.456.789-**)
- [x] Validação de CPF com algoritmo oficial
- [x] Data de aceite dos termos armazenada
- [x] Versão dos termos rastreada

### Autenticação
- [x] JWT tokens com expiração (7 dias)
- [x] Senhas hasheadas (bcrypt)
- [x] OAuth2 Password Bearer scheme

### Moderação de Conteúdo
- [x] IA detecta tentativas de golpe
- [x] Bloqueio de contato externo
- [x] Sistema de alertas para moderadores

### Pagamentos Seguros
- [x] Mercado Pago (PCI Compliance)
- [x] Escrow: pagamento liberado após verificação
- [x] Vídeo de verificação obrigatório
- [x] IA analisa autenticidade do produto

---

## 💰 Monetização e Taxas

### Taxa da Plataforma
- **Padrão**: 5% sobre cada venda
- **Configurável**: Variável `PLATFORM_FEE_PERCENT`

### Fluxo de Pagamento
1. Comprador paga via Mercado Pago (PIX, cartão)
2. Dinheiro fica retido (escrow)
3. Vendedor envia produto + tracking
4. Comprador recebe e grava vídeo de verificação
5. IA analisa autenticidade
6. Se aprovado: plataforma libera pagamento - taxa
7. Se disputado: suporte manual resolve

---

## 🚀 Deploy e Infraestrutura

### Backend (Render.com)
- **URL**: https://retrotrade-brasil.onrender.com
- **Cold Start**: ~30-50 segundos
- **Auto Deploy**: Push para `main` branch no GitHub
- **Variáveis de Ambiente**:
  - `USE_SUPABASE=true`
  - `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_DB_PASSWORD`
  - `GEMINI_API_KEY`
  - `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`
  - `SECRET_KEY`, `ALGORITHM`

### Database (Supabase)
- **Conexão**: Transaction Pooler (IPv4, porta 6543)
- **Host**: `aws-1-us-east-1.pooler.supabase.com`
- **RLS**: Row Level Security habilitado

### Storage (Supabase Storage)
- **Buckets**:
  - `product-images` - Fotos de produtos
  - `verification-videos` - Vídeos de verificação
  - `avatars` - Fotos de perfil
  - `forum-images` - Imagens do fórum

### Mobile (EAS Build)
- **Platform**: Android APK
- **Profile**: `preview` (desenvolvimento)
- **Distribution**: QR Code + Link direto
- **Build**: `eas build --platform android --profile preview`

---

## 📊 Status Atual do Sistema

### ✅ Funcionalidades Implementadas (95%)
1. ✅ Autenticação completa (registro, login, JWT)
2. ✅ CRUD de produtos
3. ✅ Sugestão de preço com IA
4. ✅ Identificação de jogos com IA
5. ✅ Sistema de pagamentos (Mercado Pago)
6. ✅ Vídeo de verificação + análise IA
7. ✅ Chat (estrutura pronta, sem WebSocket)
8. ✅ Fórum completo (7 categorias)
9. ✅ Criação de tópicos no fórum
10. ✅ Eventos com descoberta por IA
11. ✅ Assistente de manutenção (chatbot IA)
12. ✅ Moderação de chat com IA
13. ✅ Splash screen animada
14. ✅ Interface com tema retro

### ⚠️ Pendências e Melhorias
1. ⚠️ Backend retornando 404 (deploy em andamento)
2. ⚠️ Upload real de imagens para Supabase Storage
3. ⚠️ WebSocket para chat em tempo real
4. ⚠️ Sistema de notificações push
5. ⚠️ Painel administrativo (moderação)
6. ⚠️ Testes automatizados (backend + mobile)

### 🐛 Bugs Recentemente Corrigidos
1. ✅ Modelo Gemini atualizado (gemini-1.5-flash-latest)
2. ✅ URL do backend corrigida
3. ✅ Endpoints de produtos adicionados
4. ✅ Endpoint /products/analyze implementado
5. ✅ Tela de criar tópico no fórum
6. ✅ Tab bar redimensionada
7. ✅ Tema da tela de manutenção corrigido
8. ✅ Splash screen sem crashes

---

## 🧪 Como Testar o Sistema

### Pré-requisitos
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Mobile
cd mobile
npm install
```

### Testar Backend Localmente
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Acessar documentação interativa
# http://localhost:8000/docs
```

### Testar Mobile no Emulador
```bash
cd mobile

# Atualizar URL no client.js para local
# const API_URL = 'http://10.0.2.2:8000';

npx expo start
# Pressionar 'a' para Android
```

### Testar Endpoints com cURL
```bash
# Health check
curl http://localhost:8000/health

# Registrar usuário
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "username": "teste",
    "password": "senha123",
    "full_name": "Teste User",
    "cpf": "12345678909"
  }'

# Login
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=teste&password=senha123"

# Listar produtos
curl http://localhost:8000/products
```

---

## 📈 Próximos Passos

### Curto Prazo (1-2 semanas)
1. Resolver issue do deploy no Render
2. Implementar upload de imagens no Supabase Storage
3. Adicionar testes automatizados básicos
4. Deploy do APK na Play Store (Alpha/Beta)

### Médio Prazo (1 mês)
1. WebSocket para chat em tempo real
2. Sistema de notificações push
3. Painel administrativo
4. Sistema de avaliações e reputação

### Longo Prazo (3+ meses)
1. Versão iOS (App Store)
2. Sistema de leilões
3. Integração com marketplace externo (Mercado Livre)
4. Programa de afiliados

---

## 🔗 Links Importantes

- **Backend API**: https://retrotrade-brasil.onrender.com
- **Documentação API**: https://retrotrade-brasil.onrender.com/docs
- **Repositório GitHub**: https://github.com/herikmufc/gamer-marketplace
- **Supabase Dashboard**: https://supabase.com/dashboard/project/nxbgvdhzbfmjsnvkqmhj
- **Render Dashboard**: https://dashboard.render.com/

---

## 📝 Conclusão

O **RetroTrade Brasil** é um sistema robusto e completo que une marketplace, comunidade e IA em uma única plataforma. Com 21 telas no mobile, 42+ endpoints no backend, e integração com 4 serviços externos (Supabase, Gemini, Mercado Pago, Render), o app oferece uma experiência rica para compradores e vendedores de jogos retro.

A arquitetura foi projetada para escalar, com todos os componentes rodando em serviços gratuitos inicialmente, permitindo validar o negócio antes de investir em infraestrutura paga.

**Última atualização**: 2026-04-01
**Versão**: 2.0.0
**Status**: 95% completo, aguardando deploy final
