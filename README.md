# 🎮 Gamer Marketplace

Marketplace completo de consoles, jogos e periféricos com IA para análise de preços e condição dos produtos.

## 🚀 Features

### ✅ Implementadas
- **Autenticação**: Login/Registro com JWT
- **Marketplace**: Listagem e busca de produtos
- **IA de Precificação**: Claude 4.6 Vision analisa fotos e sugere preços
- **Análise de Condição**: IA avalia estado físico do produto (0-100)
- **Cálculo de Raridade**: Score baseado em console, completude e mercado
- **Criação de Anúncios**: Upload de fotos e análise automática
- **Perfil de Usuário**: Gerenciamento de conta e reputação

### 🔮 Futuras
- Sistema de chat/mensagens
- Pagamentos integrados
- Comunidade e fóruns
- Diretório de técnicos
- Enciclopédia de jogos/consoles
- AR Showcase
- Sistema de trades

## 📋 Requisitos

### Backend
- Python 3.12+
- API Key do Anthropic (Claude)

### Mobile
- Node.js 18+ (recomendado 20+)
- Android Studio (para build APK)
- Expo CLI

## 🛠️ Instalação

### 1. Backend (FastAPI)

```bash
cd backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Edite .env e adicione sua ANTHROPIC_API_KEY
```

### 2. Mobile (React Native + Expo)

```bash
cd mobile

# Instalar dependências
npm install

# Para Android, configure o IP do backend
# Edite: src/api/client.js
# Linha 8: const API_URL = 'http://SEU_IP_AQUI:8000';
```

## 🚀 Executar

### Backend

```bash
cd backend
source venv/bin/activate
python main.py
```

O backend estará rodando em `http://localhost:8000`

### Mobile

```bash
cd mobile
npx expo start
```

Opções:
- Pressione `a` para abrir no emulador Android
- Pressione `i` para abrir no simulador iOS (Mac only)
- Escaneie o QR Code com Expo Go no celular

## 📦 Gerar APK

### Método 1: EAS Build (Recomendado)

```bash
cd mobile

# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Configurar build
eas build:configure

# Build para Android
eas build --platform android --profile preview
```

### Método 2: Build Local

```bash
cd mobile

# Instalar dependências do Android
npx expo install expo-dev-client

# Build local
npx expo run:android

# APK estará em: android/app/build/outputs/apk/
```

### Método 3: Expo Go (Teste rápido)

Instale o app **Expo Go** no seu celular:
- [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- [App Store](https://apps.apple.com/app/expo-go/id982107779)

Execute `npx expo start` e escaneie o QR Code.

## 🔑 Configuração da API Claude

1. Obtenha sua API Key em: https://console.anthropic.com/
2. Adicione ao `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxx...
```

## 📱 Como Usar

### Criar Conta
1. Abra o app
2. Clique em "Cadastre-se"
3. Preencha seus dados

### Anunciar Produto
1. Clique no botão "+" (flutuante)
2. Adicione fotos do produto (4-5 fotos)
3. Preencha título, descrição e console
4. Configure condição (funcionando, com caixa, etc)
5. Clique em "Analisar com IA" 🤖
6. Aguarde a análise (15-30s)
7. Revise o preço sugerido
8. Clique em "Publicar Anúncio"

### Buscar Produtos
1. Use a barra de busca no topo
2. Filtre por categoria (Consoles, Jogos, Periféricos)
3. Clique no produto para ver detalhes

## 🏗️ Estrutura do Projeto

```
gamer-marketplace/
├── backend/                 # FastAPI Backend
│   ├── main.py             # API principal
│   ├── .env                # Configurações (não commitado)
│   └── gamer_marketplace.db # SQLite database
│
├── mobile/                  # React Native App
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── contexts/       # React Context (Auth)
│   │   └── screens/        # Telas do app
│   ├── App.js              # Componente principal
│   └── app.json            # Configuração Expo
│
└── README.md
```

## 🤖 Como Funciona a IA

### Análise Visual
1. Usuário envia 4-5 fotos do produto
2. Claude 4.6 Vision analisa:
   - Estado da carcaça/plástico
   - Amarelamento e desgaste
   - Autenticidade (detecta falsificações)
   - Completude (caixa, manual)

### Cálculo de Preço
```python
Preço Final = Preço Base × Multiplicador Condição × Multiplicador Raridade

Condição:
- 90-100: Mint (pode cobrar 30% a mais)
- 70-89: Bom estado (preço médio)
- 50-69: Usado (desconto 20-30%)
- <50: Com defeitos (desconto 50%+)

Raridade:
- Consoles raros: +30 pontos
- Com caixa: +10 pontos
- Completo (CIB): +15 pontos
- Região rara: +15 pontos
```

## 🔧 Troubleshooting

### Backend não inicia
```bash
# Verifique se o .env está configurado
cat backend/.env

# Verifique se as dependências estão instaladas
pip list | grep fastapi
```

### Mobile não conecta no backend
```bash
# Descubra seu IP local
# Linux/Mac:
ifconfig | grep inet

# Windows:
ipconfig

# Atualize src/api/client.js com seu IP:
const API_URL = 'http://SEU_IP:8000';
```

### Erro ao fazer upload de imagens
- Verifique permissões de câmera/galeria
- Certifique-se que o backend está rodando
- Tamanho máximo: 5 imagens por produto

### Build APK falha
```bash
# Limpe cache
cd mobile
rm -rf node_modules
npm install
npx expo start -c
```

## 📊 Endpoints da API

### Auth
- `POST /register` - Criar conta
- `POST /token` - Login
- `GET /me` - Dados do usuário

### Products
- `GET /products` - Listar produtos
- `GET /products/{id}` - Detalhes do produto
- `POST /products/analyze` - Analisar produto com IA
- `POST /products` - Criar anúncio
- `GET /search?q=` - Buscar produtos

## 📝 Próximos Passos

### Fase 2 (Imediato)
- [ ] Sistema de favoritos
- [ ] Chat entre usuários
- [ ] Notificações push
- [ ] Upload para cloud storage (Firebase/S3)

### Fase 3 (Médio Prazo)
- [ ] Pagamentos (Stripe/Mercado Pago)
- [ ] Sistema de avaliações
- [ ] Histórico de preços
- [ ] Wishlist pública

### Fase 4 (Longo Prazo)
- [ ] Comunidade e fóruns
- [ ] Enciclopédia de jogos
- [ ] AR Showcase
- [ ] Sistema de trades automático
- [ ] Gamificação (achievements, leaderboards)

## 🤝 Contribuindo

Este é um projeto em desenvolvimento. Sugestões são bem-vindas!

## 📄 Licença

MIT License

## 🎯 Roadmap Completo

Veja [ROADMAP.md](ROADMAP.md) para detalhes das features planejadas.

---

**Desenvolvido com 🎮 por gamers, para gamers**
