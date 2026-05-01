# 🎮 RetroTrade Brasil

Marketplace de jogos e consoles retro com IA integrada (Gemini + Claude).

---

## 🚀 Início Rápido

### Abrir App no Navegador (Sem Emulador!)

```bash
cd mobile
npm run web
```

📱 Acesse: **http://localhost:19006**

📖 [Ver guia completo](ABRIR_APP_NO_NAVEGADOR.md)

---

### Testar Localmente (Backend + Mobile)

```bash
./start_local.sh
```

📖 [Ver guia completo](GUIA_TESTE_LOCAL.md)

---

## 📁 Estrutura do Projeto

```
gamer-marketplace/
├── backend/          # API Python (FastAPI)
│   ├── main.py       # Backend principal
│   └── .env          # Configurações
│
├── mobile/           # App React Native (Expo)
│   ├── App.js        # App principal
│   ├── src/          # Componentes e telas
│   └── package.json
│
└── docs/             # Documentação
```

---

## ⚙️ Configurações

### Trocar entre Local e Produção

Edite: `mobile/src/config/environment.js`

```javascript
const ENV = 'local';       // Backend local
// ou
const ENV = 'production';  // Backend Render
```

---

## 🛠️ Tecnologias

### Backend
- FastAPI (Python)
- SQLite / PostgreSQL (Supabase)
- Gemini AI (Visão e Chat)
- Mercado Pago (Pagamentos)

### Mobile
- React Native + Expo
- React Navigation
- Axios
- AsyncStorage

---

## 📚 Documentação

- [Como abrir o app no navegador](ABRIR_APP_NO_NAVEGADOR.md)
- [Como testar localmente](GUIA_TESTE_LOCAL.md)
- [Configurar API OpenAI](backend/CONFIGURAR_API_OPENAI.md)
- [Configurar Claude](backend/CONFIGURAR_CLAUDE.md)
- [Ativar produção Mercado Pago](ATIVAR_PRODUCAO_MP.md)

---

## 🎯 Funcionalidades

- ✅ Autenticação (JWT)
- ✅ Marketplace de produtos
- ✅ Identificação automática de jogos (IA)
- ✅ Chat entre usuários
- ✅ Fórum de discussões
- ✅ Eventos de retrogaming
- ✅ Biblioteca de cheats
- ✅ Assistente de manutenção (IA)
- ✅ Pagamentos (Mercado Pago)
- ✅ Sistema de escrow

---

## 📱 Testar no Celular

### Opção 1: Navegador Web
1. Rode `npm run web` no PC
2. Acesse http://SEU_IP:19006 no celular

### Opção 2: Expo Go
1. Instale Expo Go
2. Rode `npm start` no PC
3. Escaneie o QR code

---

## 🔑 Variáveis de Ambiente

### Backend (.env)
- `GEMINI_API_KEY` - Google AI Studio
- `MERCADOPAGO_ACCESS_TOKEN` - Mercado Pago
- `SUPABASE_URL` - Supabase (opcional)

### Mobile
- Configurado em `src/config/environment.js`

---

## 🐛 Suporte

Problemas? Verifique:
1. Logs do console (F12)
2. Terminal do backend
3. Terminal do Expo

---

**Desenvolvido com ❤️ para a comunidade retrogaming brasileira**
