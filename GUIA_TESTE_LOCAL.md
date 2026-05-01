# 🎮 Guia de Teste Local - RetroTrade Brasil

## 📋 Pré-requisitos

- Python 3.8+ instalado
- Node.js 18+ e npm instalados
- Expo Go instalado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Celular e computador na mesma rede Wi-Fi

---

## 🚀 Início Rápido

### Opção 1: Script Automático (Recomendado)

```bash
./start_local.sh
```

Escolha a opção desejada:
- **1**: Apenas Backend
- **2**: Apenas Mobile
- **3**: Instruções para rodar ambos

---

### Opção 2: Manual

#### 1️⃣ Backend (Terminal 1)

```bash
cd backend

# Criar ambiente virtual (primeira vez)
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Iniciar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend rodando em: `http://localhost:8000`
📚 Documentação da API: `http://localhost:8000/docs`

---

#### 2️⃣ Mobile (Terminal 2)

```bash
cd mobile

# Instalar dependências (primeira vez)
npm install

# Iniciar Expo
npm start
```

📱 **Testar no dispositivo:**
- Abra o app **Expo Go** no celular
- Escaneie o QR code que aparece no terminal
- Aguarde o app carregar

---

## ⚙️ Configuração de Ambiente

### Trocar entre Local e Produção

Edite o arquivo: [`mobile/src/config/environment.js`](mobile/src/config/environment.js)

```javascript
const ENV = 'local';  // 'local' para desenvolvimento local
                      // 'production' para servidor Render
```

### Configurações de Rede

**Seu IP local atual:** `192.168.1.13`

Se o mobile não conectar ao backend:
1. Confirme que ambos estão na mesma rede Wi-Fi
2. Atualize o IP em [`mobile/src/config/environment.js`](mobile/src/config/environment.js:7)
3. Descubra seu IP com: `hostname -I` (Linux) ou `ipconfig` (Windows)

---

## 🧪 Testando Funcionalidades

### 1. Registro e Login
- Crie uma conta nova
- Faça login
- Verifique se o token é salvo

### 2. Produtos
- Liste produtos
- Crie um novo produto (tire uma foto ou escolha da galeria)
- Use a identificação automática de jogos (Gemini Vision)
- Busque produtos

### 3. Chat
- Acesse um produto
- Inicie uma conversa com o vendedor
- Envie mensagens

### 4. Eventos
- Liste eventos de retrogaming
- Marque interesse em um evento

### 5. Fórum
- Navegue pelas categorias
- Crie um tópico
- Participe de discussões

### 6. Cheats
- Acesse a biblioteca de cheats
- Busque por jogo/console
- Veja os códigos

### 7. Assistente de Manutenção
- Pergunte sobre reparos
- Envie fotos de problemas
- Receba diagnósticos e soluções

---

## 🐛 Problemas Comuns

### Backend não inicia

**Erro:** `ModuleNotFoundError`
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Erro:** `Port 8000 already in use`
```bash
# Encontrar processo usando a porta
lsof -i :8000
# Matar processo
kill -9 <PID>
```

---

### Mobile não conecta ao backend

**Erro:** `Network request failed`

1. Confirme que backend está rodando (`http://localhost:8000/docs`)
2. Verifique se celular e PC estão na mesma rede
3. Teste o IP no navegador do celular: `http://192.168.1.13:8000/docs`
4. Desative firewall temporariamente (Linux):
   ```bash
   sudo ufw allow 8000/tcp
   ```

---

### Expo não inicia

**Erro:** `Command not found: expo`
```bash
npm install -g expo-cli
# ou use npx
npx expo start
```

**QR code não aparece:**
```bash
# Forçar modo tunnel (mais lento, mas funciona sempre)
npm start -- --tunnel
```

---

## 📊 Monitoramento

### Logs do Backend
Os logs aparecem no terminal onde o backend está rodando.
Procure por:
- `✅` Requisições bem-sucedidas
- `❌` Erros
- `📡` Chamadas à API

### Logs do Mobile
Os logs aparecem:
- No terminal do Expo
- No console do navegador (pressione `shift + m` no terminal do Expo)
- No próprio app (pressione `shift + m` no Expo Go)

---

## 🔑 Credenciais de Teste

### Mercado Pago (Sandbox)
Já configurado no `.env` do backend:
- Modo: **TESTE**
- Usuário: `TESTUSER1234`

### Supabase
Já configurado no `.env` do backend (produção)

---

## 📱 Dispositivos de Teste Recomendados

### Android
- Emulador Android Studio
- Dispositivo físico com Expo Go

### iOS (somente Mac)
- Simulador Xcode
- Dispositivo físico com Expo Go

### Web
```bash
cd mobile
npm run web
```
Abre no navegador: `http://localhost:19006`

---

## 🎯 Checklist de Testes

- [ ] Backend inicia sem erros
- [ ] Mobile conecta ao backend
- [ ] Registro de nova conta funciona
- [ ] Login funciona
- [ ] Listagem de produtos funciona
- [ ] Criação de produto funciona
- [ ] Identificação de jogo por foto funciona
- [ ] Chat funciona
- [ ] Eventos listam corretamente
- [ ] Fórum funciona
- [ ] Biblioteca de cheats carrega
- [ ] Assistente de manutenção responde

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs do backend e mobile
2. Confirme que as dependências estão instaladas
3. Teste a conexão de rede
4. Reinicie backend e mobile

**Logs detalhados:**
- Backend: Veja terminal onde rodou `uvicorn`
- Mobile: Pressione `shift + m` no terminal do Expo

---

## 🔄 Atualizar Dependências

### Backend
```bash
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

### Mobile
```bash
cd mobile
npm update
```

---

## 📚 Documentação Adicional

- [Expo Docs](https://docs.expo.dev/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Native Docs](https://reactnavigation.org/)

---

Bom teste! 🎮✨
