# 🎬 Como Adicionar o Vídeo de Intro

## Fluxo Atual
1. **Splash Nativa** (logo.png - fullscreen) - 1-2 segundos
2. **IntroScreen** (Logo.jpeg estática) - enquanto não tem vídeo
3. **App Principal**

## Como Adicionar seu Vídeo

### 1. Prepare o Vídeo

**Especificações Recomendadas:**
- **Formato**: MP4 (H.264)
- **Resolução**: 
  - Vertical: 1080x1920 (mobile)
  - Horizontal: 1920x1080 (landscape)
- **Duração**: 3-5 segundos (max 10s)
- **Tamanho**: Menos de 5MB
- **FPS**: 30fps
- **Áudio**: Opcional (recomendado sem áudio ou muito leve)

**Conteúdo do Vídeo:**
- Mascote gato laranja com espada
- Corte na tela (efeito slash)
- Texto "RetroTrade Brasil" aparece
- Transição suave para preto no final

### 2. Adicione o Vídeo ao Projeto

```bash
# Copie seu vídeo para:
/home/madeinweb/gamer-marketplace/mobile/assets/intro-video.mp4
```

### 3. Ative o Vídeo no Código

Abra: `/home/madeinweb/gamer-marketplace/mobile/src/screens/IntroScreen.js`

**Altere estas linhas:**

```javascript
// ANTES (linha ~14):
const videoSource = null;
const hasVideo = false;

// DEPOIS:
const videoSource = require('../../assets/intro-video.mp4');
const hasVideo = true;
```

### 4. Teste

```bash
cd /home/madeinweb/gamer-marketplace/mobile
npx expo start --clear
```

- Recarregue o app
- O vídeo deve aparecer após a splash nativa
- Botão "PULAR →" aparece no canto superior direito
- Vídeo pula automaticamente ao terminar

## Estrutura Completa

```
App abre
  ↓
Splash Nativa (logo.png - sistema)
  ↓ (1-2s automático)
IntroScreen (seu vídeo)
  ↓ (3-5s ou até pular)
App Principal (tabs, navegação)
```

## Customização

### Mudar Duração do Vídeo
O vídeo termina automaticamente quando acaba. Não precisa configurar.

### Remover Botão "Pular"
Em `IntroScreen.js`, comente ou remova:
```javascript
{/* Botão Pular */}
{videoReady && (
  <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
    <Text style={styles.skipText}>PULAR →</Text>
  </TouchableOpacity>
)}
```

### Mudar Cores do Botão
Em `IntroScreen.js`, linha ~70-80 (styles.skipButton):
```javascript
backgroundColor: 'rgba(255, 107, 53, 0.9)', // Laranja
borderColor: colors.text.primary, // Preto
```

## Troubleshooting

### Vídeo não aparece?
1. Verifique se o arquivo está em `assets/intro-video.mp4`
2. Verifique se `hasVideo = true` no código
3. Limpe o cache: `npx expo start --clear`
4. Reinicie o app completamente

### Vídeo muito lento para carregar?
1. Reduza o tamanho do vídeo (max 5MB)
2. Reduza a resolução (720p)
3. Reduza o bitrate ao exportar

### Vídeo não encaixa na tela?
Mude o `resizeMode` em IntroScreen.js:
```javascript
resizeMode="contain" // Mostra inteiro com bordas pretas
resizeMode="cover"   // Preenche tela, pode cortar
resizeMode="stretch" // Estica para preencher (distorce)
```

## Assets Atuais

- ✅ `assets/logo.png` - Logo para splash nativa (1024x1024)
- ✅ `assets/Logo.jpeg` - Logo para fallback (1024x1024)
- ⏳ `assets/intro-video.mp4` - **Adicione aqui seu vídeo**

---

**Criado por**: Claude Sonnet 4.5  
**Data**: 2026-05-01
