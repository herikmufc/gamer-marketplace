# 📦 Como Gerar o APK - RetroTrade Brasil

## 🎯 3 Métodos Disponíveis

---

## ✅ Método 1: EAS Build (RECOMENDADO - Mais Fácil)

### Requisitos:
- Conta gratuita no Expo
- Internet

### Passos:

```bash
# 1. No seu terminal (com internet)
cd /home/madeinweb/gamer-marketplace/mobile

# 2. Login no Expo (vai abrir navegador)
npx eas-cli login

# 3. Configurar projeto (só na primeira vez)
npx eas-cli build:configure

# 4. Gerar APK
npx eas-cli build --platform android --profile preview

# 5. Aguarde ~20 minutos
# Ao final, você receberá um LINK para download do APK
```

**Pronto!** Abra o link no celular e instale o APK.

---

## ⚡ Método 2: Expo Go (TESTE RÁPIDO - Sem Build)

**Não gera APK**, mas permite testar imediatamente:

```bash
# 1. Instale Expo Go no celular (Play Store)

# 2. No terminal:
cd /home/madeinweb/gamer-marketplace/mobile
npx expo start

# 3. Escaneie o QR Code com Expo Go

# 4. App abre direto no celular!
```

**Limitação:** Precisa do computador rodando.

---

## 🔧 Método 3: Build Local (AVANÇADO)

### Requisitos:
- Android Studio instalado
- Android SDK configurado
- Java JDK 17

### Instalação do Android Studio (Ubuntu):

```bash
# 1. Download
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2024.1.1.12/android-studio-2024.1.1.12-linux.tar.gz

# 2. Extrair
sudo tar -xzf android-studio-*.tar.gz -C /opt

# 3. Configurar PATH
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# 4. Executar Android Studio
/opt/android-studio/bin/studio.sh

# 5. Seguir wizard de instalação
# Instalar Android SDK (API 34)
```

### Build do APK:

```bash
cd /home/madeinweb/gamer-marketplace/mobile

# 1. Preparar projeto
npx expo prebuild --platform android --clean

# 2. Build APK
cd android
./gradlew assembleRelease

# 3. APK estará em:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🚀 Método Recomendado para Você

### Use o **Método 1 (EAS Build)**:

1. É o mais fácil
2. Não precisa instalar nada pesado
3. APK é gerado na nuvem
4. Funcionará em qualquer Android

### Comandos Completos:

```bash
# Abra o terminal
cd /home/madeinweb/gamer-marketplace/mobile

# Faça login (abre navegador)
npx eas-cli login

# Se não tiver conta, crie em: https://expo.dev/signup

# Configure (primeira vez)
npx eas-cli build:configure

# Gere o APK
npx eas-cli build --platform android --profile preview

# Aguarde a mensagem:
# "✔ Build link: https://expo.dev/accounts/.../builds/..."
```

**Abra o link no celular e baixe o APK!**

---

## 📱 Como Instalar o APK no Celular

### Android:

1. Baixe o APK no celular
2. Abra o arquivo
3. Android pedirá permissão para "Fontes Desconhecidas"
4. Vá em: **Configurações > Segurança > Fontes Desconhecidas**
5. Permita instalação
6. Volte e instale
7. Pronto! ✅

---

## ⚠️ Importante ANTES de Gerar APK

### 1. Configure o IP do Backend:

```bash
# Edite este arquivo:
nano /home/madeinweb/gamer-marketplace/mobile/src/api/client.js

# Linha 8, mude para SEU IP:
const API_URL = 'http://SEU_IP_LOCAL:8000';

# Exemplo:
const API_URL = 'http://192.168.1.100:8000';

# Para descobrir seu IP:
hostname -I | awk '{print $1}'
```

### 2. Inicie o Backend:

```bash
cd /home/madeinweb/gamer-marketplace/backend
python main.py
```

**O backend DEVE estar rodando** para o app funcionar!

---

## 🧪 Teste Antes de Gerar APK

```bash
# 1. Backend rodando (terminal 1)
cd backend
python main.py

# 2. Mobile no Expo Go (terminal 2)
cd mobile
npx expo start

# 3. Teste no celular com Expo Go
# Se funcionar, gere o APK!
```

---

## 📊 Tempo Estimado

| Método | Tempo | Dificuldade |
|--------|-------|-------------|
| EAS Build | 20-30 min | ⭐ Fácil |
| Expo Go | 2 min | ⭐ Muito Fácil |
| Build Local | 1-2 horas | ⭐⭐⭐⭐⭐ Difícil |

---

## 🆘 Problemas Comuns

### "eas-cli: command not found"
```bash
# Use npx ao invés:
npx eas-cli login
```

### "Build failed"
```bash
# Verifique app.json:
# - package name deve ser único
# - versionCode deve ser número
```

### "APK não instala"
```bash
# Habilite fontes desconhecidas:
# Configurações > Segurança > Permitir instalação de apps
```

---

## 💡 Dica Final

**Para testar AGORA mesmo sem buildar:**

```bash
# Terminal 1: Backend
cd backend && python main.py

# Terminal 2: Mobile
cd mobile && npx expo start

# Celular: Instale "Expo Go" e escaneie QR
```

**Depois que testar e gostar, aí sim gere o APK!**

---

## 📞 Suporte

Se tiver problemas:
1. Verifique se backend está rodando
2. Verifique se configurou o IP correto
3. Teste primeiro com Expo Go
4. Só então gere o APK

---

**Boa sorte com o build! 🚀**
