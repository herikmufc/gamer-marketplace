# 🚀 Teste Rápido - RetroTrade Brasil v2.3.0

## ⚡ Início Rápido (3 comandos)

```bash
# 1. Iniciar tudo (backend + expo)
./start-dev.sh

# 2. Abrir no emulador Android
cd mobile
npx expo run:android

# 3. Testar sistema de pagamento! 🎉
```

---

## 📱 Fluxo de Teste Simples

### 1️⃣ Login
- Usuário: `admin`
- Senha: `admin123`

### 2️⃣ Comprar Produto
1. Toque em qualquer produto
2. Botão **"🛒 COMPRAR"** (amarelo, grande)
3. Selecione **PIX**
4. **"Finalizar Compra"**
5. ✅ QR Code aparece!

### 3️⃣ Ver Transações
1. Menu → **"💳 Minhas Transações"**
2. Tab **"🛒 Compras"**
3. Veja sua compra!

### 4️⃣ Gravar Vídeo (Comprador)
1. Toque na transação
2. **"📹 Gravar Vídeo de Verificação"**
3. Grave 10-15 segundos
4. **"📤 Enviar Vídeo"**
5. ✅ IA analisa automaticamente!

### 5️⃣ Ver Pagamento Liberado
1. Se score >= 85: **Auto-aprovado!** 🎉
2. Status: **🎉 Pagamento Liberado**
3. Vendedor recebe o dinheiro!

---

## 🎯 Atalhos

### Iniciar Ambiente
```bash
./start-dev.sh
```

### Parar Ambiente
```bash
./stop-dev.sh
```

### Ver Logs
```bash
# Backend
tail -f /tmp/retrotrade-backend.log

# Expo
tail -f /tmp/retrotrade-expo.log
```

### Resetar Tudo
```bash
./stop-dev.sh
./start-dev.sh
```

---

## 🔍 Verificações Rápidas

### Backend Online?
```bash
curl http://localhost:8000/docs
```
✅ Deve abrir página Swagger

### Expo Online?
```bash
curl http://localhost:8081
```
✅ Deve retornar HTML

### Emulador Rodando?
```bash
adb devices
```
✅ Deve listar emulador

---

## ⚙️ Configurações Importantes

### IP do Backend no Emulador
**Arquivo**: `mobile/src/api/client.js`

```javascript
// Para emulador Android
const API_URL = 'http://10.0.2.2:8000';

// Para dispositivo físico (mesma rede Wi-Fi)
const API_URL = 'http://192.168.1.X:8000';  // Substitua X pelo IP
```

### Descobrir seu IP local
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Ou
hostname -I
```

---

## 📋 Checklist Mínimo

- [ ] Backend rodando (http://localhost:8000/docs)
- [ ] Expo rodando (http://localhost:8081)
- [ ] Emulador aberto (`adb devices`)
- [ ] App instalado no emulador
- [ ] Login funciona
- [ ] Produtos aparecem
- [ ] Botão "Comprar" visível
- [ ] Checkout abre
- [ ] QR Code gerado
- [ ] Transações aparecem no menu

---

## 🐛 Problemas Comuns

### "Network request failed"
```bash
# Solução: Verificar API_URL
cd mobile/src/api
# Editar client.js → http://10.0.2.2:8000
```

### "Expo não abre"
```bash
# Solução: Node 20+
nvm use 20
npm start
```

### "Câmera não funciona"
```bash
# Solução: Permissões
# Android: Settings > Apps > RetroTrade > Permissions
# Ativar: Camera, Microphone
```

### "App crasha ao abrir"
```bash
# Solução: Reinstalar
cd mobile
rm -rf node_modules
npm install
npx expo run:android
```

---

## 🎮 O que Testar

### ✅ Essencial (v1.0)
- [ ] Comprar produto via PIX
- [ ] Ver transação criada
- [ ] Gravar vídeo de verificação
- [ ] IA auto-aprovar (score >= 85)
- [ ] Pagamento liberado

### 🚀 Avançado (opcional)
- [ ] Vendedor marcar como enviado
- [ ] Comprador confirmar recebimento manual
- [ ] Comprador abrir reclamação
- [ ] Auto-release após 3 dias (simular)
- [ ] Filtros compras/vendas

---

## 📚 Documentação Completa

- **[GUIA_TESTE_EMULADOR.md](GUIA_TESTE_EMULADOR.md)** - Guia completo passo a passo
- **[CHANGELOG_V2.3.0.md](CHANGELOG_V2.3.0.md)** - Todas as features implementadas
- **[PAYMENT_SYSTEM.md](PAYMENT_SYSTEM.md)** - Documentação do sistema de pagamento

---

## 💡 Dicas

1. **Use o guia completo** se travar: `cat GUIA_TESTE_EMULADOR.md`
2. **Logs são seus amigos**: `tail -f /tmp/retrotrade-*.log`
3. **Reinicie quando bugs**: `./stop-dev.sh && ./start-dev.sh`
4. **Teste no físico** para melhor performance (usar IP local)

---

## 🎉 Pronto!

Agora você tem:
- ✅ Scripts automatizados
- ✅ Guia rápido de teste
- ✅ Troubleshooting
- ✅ Sistema de pagamento completo!

**Bora testar! 🚀🎮**

---

**RetroTrade Brasil v2.3.0**
_Sistema único no Brasil com verificação por IA!_
