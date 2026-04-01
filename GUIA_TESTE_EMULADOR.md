# 🧪 Guia de Testes no Emulador - RetroTrade Brasil v2.3.0

## 📋 Pré-requisitos

### 1. Backend Rodando ✅
```bash
cd /home/madeinweb/gamer-marketplace/backend
source venv/bin/activate
python main.py
```

**Verificar**: http://localhost:8000/docs

### 2. Expo Rodando
```bash
cd /home/madeinweb/gamer-marketplace/mobile
nvm use 20  # Node 20+ obrigatório
npm start
```

**Verificar**: Terminal deve mostrar QR Code

### 3. Emulador Android
```bash
# Verificar emuladores disponíveis
emulator -list-avds

# Iniciar emulador (exemplo)
emulator -avd Pixel_5_API_30 &

# Ou usar Android Studio
# Tools > AVD Manager > Play
```

---

## 🚀 Passo a Passo para Testar

### **Passo 1: Verificar Backend**

```bash
# Terminal 1 - Backend
cd /home/madeinweb/gamer-marketplace/backend
source venv/bin/activate
python main.py
```

**Esperar**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Testar**:
- Abra: http://localhost:8000/docs
- Deve mostrar a documentação Swagger

---

### **Passo 2: Iniciar Expo**

```bash
# Terminal 2 - Expo
cd /home/madeinweb/gamer-marketplace/mobile
nvm use 20  # IMPORTANTE: Node 20+
npm start
```

**Esperar**:
```
Metro Bundler ready
Logs for your project will appear below
```

**Se porta 8081 ocupada**:
```bash
# Matar processo na porta 8081
lsof -ti:8081 | xargs kill -9

# Ou usar porta alternativa
npx expo start --port 8082
```

---

### **Passo 3: Abrir Emulador Android**

#### Opção A: Via Expo (Recomendado)
No terminal do Expo, pressione:
- `a` - Abre emulador Android automaticamente

#### Opção B: Via Android Studio
1. Abra Android Studio
2. Tools → AVD Manager
3. Clique no ▶️ Play no emulador
4. Espere o Android iniciar completamente

#### Opção C: Via Linha de Comando
```bash
# Listar emuladores
emulator -list-avds

# Exemplo de saída:
# Pixel_5_API_30
# Pixel_7_API_34

# Iniciar emulador
emulator -avd Pixel_5_API_30 &
```

---

### **Passo 4: Instalar App no Emulador**

#### Se Expo detectou o emulador:
- O app instala automaticamente! ✅

#### Se não detectou:
1. No terminal Expo, pressione `a`
2. Ou escaneie QR Code com emulador configurado
3. Ou instale manualmente:

```bash
cd /home/madeinweb/gamer-marketplace/mobile
npx expo run:android
```

---

## 🧪 Roteiro de Testes do Sistema de Pagamento

### **Teste 1: Login**
1. Abra o app
2. Faça login:
   - Usuário: `admin`
   - Senha: `admin123`
3. ✅ Deve entrar na HomeScreen

---

### **Teste 2: Ver Produto**
1. Na HomeScreen, toque em qualquer produto
2. ✅ Deve abrir ProductDetailScreen
3. ✅ Verificar botões no footer:
   - `[🛒 COMPRAR]` (maior, amarelo)
   - `[💬 CHAT]` (menor, secundário)

---

### **Teste 3: Fluxo de Compra - PIX**

#### 3.1 Iniciar Checkout
1. Toque em **"🛒 COMPRAR"**
2. ✅ Deve abrir CheckoutScreen
3. ✅ Verificar:
   - Resumo do produto
   - Valores (R$ X.XX)
   - Métodos: **PIX** (selecionado) | Cartão

#### 3.2 Criar Pagamento PIX
1. Toque em **"Finalizar Compra"**
2. ✅ Aguardar loading
3. ✅ Deve mostrar:
   - QR Code PIX
   - Código PIX copiável
   - Botão "Copiar Código PIX"
   - Info de segurança

#### 3.3 Pagar (Simulação)
**No mundo real**: Escanear QR Code no app do banco

**Para teste**: Simular pagamento no backend
```bash
# Terminal 3 - Simular pagamento
curl -X POST http://localhost:8000/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "payment",
    "data": {"id": "12345678"}
  }'
```

#### 3.4 Ver Transação Criada
1. Toque em **"Ver Meus Pedidos"**
2. ✅ Deve abrir MyTransactionsScreen
3. ✅ Verificar:
   - Tab "🛒 Compras" ativa
   - Transação listada
   - Status: **⏳ Aguardando Pagamento** (se não simulou) ou **💰 Pago**

---

### **Teste 4: Vendedor Marca como Enviado**

#### 4.1 Trocar para Vendas
1. Em MyTransactionsScreen
2. Toque na tab **"💼 Vendas"**
3. ✅ Deve listar vendas (se houver)

#### 4.2 Ver Detalhes
1. Toque na transação
2. ✅ Deve abrir TransactionDetailScreen
3. ✅ Status: **💰 Pago - Aguardando Envio**

#### 4.3 Marcar como Enviado
1. Toque em **"Marcar como Enviado"**
2. Digite código de rastreio: `BR123456789BR`
3. Confirme
4. ✅ Status muda para: **📦 Produto Enviado**
5. ✅ Deve mostrar:
   - Código de rastreio
   - Botão "Rastrear nos Correios"
   - Data de auto-liberação

---

### **Teste 5: Comprador Grava Vídeo de Verificação**

#### 5.1 Voltar para Compras
1. Navegue: Menu → **"💳 Minhas Transações"**
2. Tab **"🛒 Compras"**
3. Toque na transação comprada

#### 5.2 Status Enviado
1. ✅ Status: **📦 Produto Enviado**
2. ✅ Deve mostrar 3 botões:
   - **"✅ Confirmar Recebimento"**
   - **"📹 Gravar Vídeo de Verificação"**
   - **"⚠️ Abrir Reclamação"**

#### 5.3 Iniciar Gravação
1. Toque em **"📹 Gravar Vídeo de Verificação"**
2. ✅ Deve abrir VideoVerificationScreen
3. ✅ Solicita permissão de câmera
4. Conceda permissão

#### 5.4 Gravar Vídeo
1. Leia as instruções:
   ```
   1️⃣ Mostre o produto de todos os ângulos
   2️⃣ Filme acessórios e detalhes importantes
   3️⃣ Certifique-se de boa iluminação
   4️⃣ Grave entre 10-30 segundos
   ```
2. Toque em **"🎥 Iniciar Gravação"**
3. ✅ Deve mostrar:
   - Camera preview
   - Indicador vermelho "REC 0s"
   - Timer incrementando
4. Grave por 10-15 segundos
5. Toque em **"⏹️ Parar"**

#### 5.5 Preview do Vídeo
1. ✅ Deve mostrar preview do vídeo
2. ✅ Controles:
   - Play/Pause
   - **"🗑️ Descartar"** - regravar
   - **"📤 Enviar Vídeo"** - confirmar

#### 5.6 Enviar Vídeo
1. Toque em **"📤 Enviar Vídeo"**
2. ✅ Barra de progresso (0% → 100%)
3. ✅ Texto: "📤 Enviando Vídeo..."
4. ✅ Aguarde análise da IA

#### 5.7 Resultado da IA
**Cenário A: Auto-Aprovado** (Score >= 85)
- ✅ Alert: "✅ Verificação Aprovada!"
- ✅ Mostra score de confiança
- ✅ "O pagamento foi liberado para o vendedor!"
- ✅ Navega para TransactionDetailScreen
- ✅ Status: **🎉 Pagamento Liberado**

**Cenário B: Revisão Manual** (Score < 85)
- ✅ Alert: "📋 Vídeo em Análise"
- ✅ "Você será notificado quando a análise for concluída"
- ✅ Status: **📹 Vídeo em Análise**

---

### **Teste 6: Vendedor Recebe Pagamento**

#### 6.1 Ver Venda Liberada
1. Navegue: Menu → **"💳 Minhas Transações"**
2. Tab **"💼 Vendas"**
3. Toque na venda
4. ✅ Status: **🎉 Pagamento Liberado**
5. ✅ Card verde com:
   - "🎉 Venda Concluída!"
   - "Você recebe: R$ 142,50"
   - "O valor será transferido em até 2 dias úteis"

---

### **Teste 7: Auto-Liberação (Sem Vídeo)**

#### 7.1 Cenário
- Comprador NÃO envia vídeo
- Comprador NÃO confirma recebimento
- 3 dias úteis passam

#### 7.2 Simular Auto-Release
```bash
# Terminal 3 - Forçar auto-release
curl -X POST http://localhost:8000/admin/run-auto-release
```

#### 7.3 Verificar
1. Atualize a tela (pull-to-refresh)
2. ✅ Status muda para: **⏰ Liberado Automaticamente**
3. ✅ Card verde de sucesso

---

### **Teste 8: Abrir Reclamação**

#### 8.1 Cenário Problema
Comprador recebe produto diferente/danificado

#### 8.2 Abrir Disputa
1. Em TransactionDetailScreen (comprador)
2. Status **📦 Enviado**
3. Toque em **"⚠️ Abrir Reclamação"**
4. Digite motivo: "Produto veio com defeito"
5. Confirme

#### 8.3 Verificar Status
1. ✅ Status muda para: **⚠️ Em Disputa**
2. ✅ Card vermelho:
   - "⚠️ Reclamação em Análise"
   - "Nossa equipe está analisando seu caso"

---

### **Teste 9: Confirmar Recebimento Manual**

#### 9.1 Sem Vídeo
1. Comprador em TransactionDetailScreen
2. Status **📦 Enviado**
3. Toque em **"✅ Confirmar Recebimento"**
4. Confirme no Alert

#### 9.2 Resultado
1. ✅ Status muda para: **🎉 Pagamento Liberado**
2. ✅ Produto marcado como vendido
3. ✅ Vendedor recebe valor

---

### **Teste 10: Menu Minhas Transações**

#### 10.1 Acesso via Perfil
1. Navegue: Tab **"👤 Perfil"** (bottom)
2. Menu: Toque em **"💳 Minhas Transações"**
3. ✅ Deve abrir MyTransactionsScreen

#### 10.2 Filtros
1. ✅ Tab "🛒 Compras" - lista suas compras
2. ✅ Tab "💼 Vendas" - lista suas vendas
3. ✅ Pull-to-refresh funciona
4. ✅ Toque em item → abre detalhes

---

## 📊 Verificações de UI/UX

### ✅ Botões Ajustados
- Tamanhos compactos (não saem do frame)
- Fonte legível (12-13px)
- Ícones proporcionais (16px)

### ✅ Navegação
- Todas as telas acessíveis
- Botão voltar funciona
- Deep linking entre telas

### ✅ Status Coloridos
- Verde: released, auto_released, verified
- Amarelo: pending, paid, shipped
- Vermelho: disputed, refunded

### ✅ Loading States
- Indicadores de progresso
- Mensagens claras
- Não trava a UI

---

## 🐛 Problemas Comuns

### **Erro: "Network request failed"**
**Causa**: Backend offline ou IP errado

**Solução**:
```bash
# 1. Verificar backend
curl http://localhost:8000/docs

# 2. No emulador, usar 10.0.2.2 ao invés de localhost
# Edite: mobile/src/api/client.js
const API_URL = 'http://10.0.2.2:8000';
```

---

### **Erro: "Permission denied" (Câmera)**
**Causa**: Permissões não configuradas

**Solução**:
```bash
# 1. Reinstalar app
cd mobile
npx expo run:android

# 2. Nas configurações do Android
# Settings > Apps > RetroTrade > Permissions
# Ativar: Camera, Microphone
```

---

### **Erro: "configs.toReversed is not a function"**
**Causa**: Node.js < 20

**Solução**:
```bash
nvm use 20
node --version  # Deve ser v20.x.x
npm start
```

---

### **QR Code não aparece no Expo**
**Causa**: Terminal não interativo

**Solução**:
```bash
# Abrir em nova janela de terminal
cd /home/madeinweb/gamer-marketplace/mobile
nvm use 20
npm start

# Pressionar 'a' para Android
```

---

## 🎯 Checklist de Testes

### Backend
- [ ] API Docs acessível (http://localhost:8000/docs)
- [ ] Endpoints de pagamento funcionando
- [ ] APScheduler rodando (logs a cada 1h)
- [ ] OpenCV extrai frames de vídeo
- [ ] Claude Vision analisa vídeos

### Mobile - Navegação
- [ ] Login funciona
- [ ] HomeScreen carrega produtos
- [ ] ProductDetailScreen abre
- [ ] Botões "Comprar" e "Chat" visíveis
- [ ] Checkout abre ao clicar "Comprar"
- [ ] Menu Perfil acessa Transações

### Mobile - Pagamento
- [ ] CheckoutScreen exibe produto
- [ ] PIX/Cartão selecionáveis
- [ ] QR Code gerado
- [ ] Código PIX copiável
- [ ] Transação criada no backend

### Mobile - Transações
- [ ] MyTransactionsScreen lista compras/vendas
- [ ] Filtros Compras/Vendas funcionam
- [ ] Pull-to-refresh atualiza lista
- [ ] Detalhes abrem ao tocar item

### Mobile - Detalhes
- [ ] Status exibido corretamente
- [ ] Valores corretos (produto, taxa, total)
- [ ] Ações aparecem conforme status
- [ ] Rastreio exibido (se disponível)

### Mobile - Vídeo
- [ ] VideoVerificationScreen solicita permissões
- [ ] Câmera abre
- [ ] Timer REC funciona
- [ ] Gravação para aos 30s
- [ ] Preview exibe vídeo gravado
- [ ] Upload funciona
- [ ] IA analisa e retorna resultado

### Mobile - Ações
- [ ] Vendedor marca como enviado
- [ ] Comprador confirma recebimento
- [ ] Comprador abre reclamação
- [ ] Auto-release funciona após 3 dias

---

## 📹 Vídeos de Teste

Para testar sem produto físico, grave vídeos de:
- Tela do próprio celular
- Qualquer objeto próximo (mouse, teclado)
- Mão fazendo gestos
- O próprio emulador (meta!)

**A IA vai analisar mesmo assim!** Score pode variar.

---

## 🚀 Tudo Funcionando?

Parabéns! 🎉 Você testou com sucesso o **RetroTrade Brasil v2.3.0** com:
- ✅ Sistema de Pagamento Escrow
- ✅ Verificação por IA (Claude Vision)
- ✅ Auto-liberação em 3 dias úteis
- ✅ 4 telas mobile integradas
- ✅ Mercado Pago (PIX + Cartão)

**Sistema único no Brasil! 🇧🇷🎮**

---

**Desenvolvido para RetroTrade Brasil**
_Games Clássicos, Preços Modernos, Segurança do Futuro._
