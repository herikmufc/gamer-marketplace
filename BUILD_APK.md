# 📦 Como Gerar APK para Android

## Método 1: EAS Build (Recomendado - Mais Fácil)

### Vantagens:
- Build na nuvem (não precisa Android Studio)
- APK otimizado e assinado
- Funciona em qualquer SO (Linux/Mac/Windows)

### Passos:

```bash
cd mobile

# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login no Expo (criar conta gratuita se não tiver)
eas login

# 3. Configurar projeto
eas build:configure

# 4. Build para Android (Preview)
eas build --platform android --profile preview

# Aguarde ~20 minutos
# No final você receberá um link para download do APK
```

### Download e Instalação:
1. Abra o link fornecido no celular
2. Baixe o APK (arquivo .apk)
3. Abra o arquivo baixado
4. Android vai pedir permissão para "Fontes Desconhecidas"
5. Permita e instale

---

## Método 2: Build Local (Requer Android Studio)

### Pré-requisitos:
1. **Android Studio** instalado
2. **Java JDK 17** instalado
3. **Android SDK** configurado

### Instalação do Android Studio (Ubuntu):

```bash
# Download
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2024.1.1.12/android-studio-2024.1.1.12-linux.tar.gz

# Extrair
sudo tar -xzf android-studio-*.tar.gz -C /opt

# Criar link
sudo ln -s /opt/android-studio/bin/studio.sh /usr/local/bin/android-studio

# Executar
android-studio

# Siga o wizard de instalação
# Instale Android SDK (mínimo API 34)
```

### Configurar variáveis de ambiente:

```bash
# Adicione ao ~/.bashrc ou ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Recarregar
source ~/.bashrc
```

### Build:

```bash
cd mobile

# 1. Instalar dependências nativas
npx expo prebuild

# 2. Build APK
cd android
./gradlew assembleRelease

# APK estará em:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Método 3: Expo Go (Sem Build - Para Testes)

Não gera APK, mas permite testar rapidamente:

```bash
cd mobile
npx expo start
```

**No celular:**
1. Instale **Expo Go** da Play Store
2. Escaneie o QR Code
3. App carrega direto do computador

**Limitações:**
- Requer computador rodando
- Mesma rede WiFi
- Não funciona para produção

---

## Comparação dos Métodos

| Método | Tempo | Dificuldade | Requer Android Studio | Resultado |
|--------|-------|-------------|----------------------|-----------|
| EAS Build | 20min | Fácil | Não | APK assinado |
| Build Local | 1h+ | Difícil | Sim | APK não-assinado |
| Expo Go | 2min | Muito Fácil | Não | Sem APK (teste) |

---

## Build para Produção (Google Play)

### 1. Criar conta no EAS:
```bash
eas build:configure
```

### 2. Build AAB (Android App Bundle):
```bash
eas build --platform android --profile production
```

### 3. Assinar com chave:
```bash
# EAS gerencia automaticamente as chaves
# Ou use suas próprias:
eas credentials
```

### 4. Upload para Play Console:
1. Acesse [Google Play Console](https://play.google.com/console)
2. Crie novo app
3. Upload do AAB gerado
4. Preencha informações do app
5. Enviar para revisão

---

## Troubleshooting

### Erro: "Gradle build failed"
```bash
cd mobile/android
./gradlew clean
cd ..
npx expo prebuild --clean
```

### Erro: "SDK not found"
```bash
# Verifique ANDROID_HOME
echo $ANDROID_HOME

# Deve apontar para: /home/SEU_USER/Android/Sdk
```

### Erro: "Java version mismatch"
```bash
# Instale Java 17
sudo apt install openjdk-17-jdk

# Configure
sudo update-alternatives --config java
```

### Build EAS muito lento
- Normal: 15-25 minutos
- Primeira build pode levar 30+ minutos
- Builds subsequentes são mais rápidas (cache)

### APK não instala no celular
1. Verifique se Android permite "Fontes Desconhecidas"
2. Configurações > Segurança > Fontes Desconhecidas
3. Ou: Configurações > Apps > Acesso especial > Instalar apps desconhecidos

---

## Testar APK antes de publicar

### 1. Instale no seu celular
```bash
# Via USB (adb)
adb install app-release.apk
```

### 2. Teste interno (Google Play)
- Crie "Internal Testing Track"
- Adicione emails de testadores
- Upload do AAB
- Testadores recebem link

### 3. Alpha/Beta Testing
- Crie tracks Alpha ou Beta
- Publique para grupo maior
- Colete feedback

---

## Próximos Passos após Build

1. ✅ APK gerado
2. ⚙️ Configure backend/.env com API Key
3. 📱 Instale APK no celular
4. 🎮 Teste todas as funcionalidades
5. 🐛 Reporte bugs
6. 🚀 Publique na Play Store (opcional)

---

## Dicas de Otimização

### Reduzir tamanho do APK:
```json
// app.json
"android": {
  "enableProguardInReleaseBuilds": true,
  "enableShrinkResources": true
}
```

### Cache de builds:
```bash
# Usar cache do EAS
eas build --platform android --clear-cache
```

### Build mais rápida:
```bash
# Usar perfil específico
eas build --platform android --profile preview --local
```

---

**Pronto para gerar seu APK! 🚀**

Recomendo começar com **Expo Go** para testar, depois usar **EAS Build** para gerar APK final.
