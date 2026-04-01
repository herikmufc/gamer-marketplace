# 📱 Guia das Telas Mobile - Sistema de Pagamento

## ✅ Telas Implementadas (Parte 3)

### 1. CheckoutScreen.js
**Localização**: `/mobile/src/screens/CheckoutScreen.js`

**Funcionalidades**:
- ✅ Resumo do produto (título, console, badges)
- ✅ Breakdown de valores (produto + total)
- ✅ Seleção de método de pagamento (PIX / Cartão)
- ✅ Criação de pagamento via API
- ✅ Exibição de QR Code PIX após criação
- ✅ Código PIX copiável
- ✅ Informações de segurança (escrow)
- ✅ Navegação para "Ver Meus Pedidos"

**Como usar**:
```javascript
navigation.navigate('Checkout', {
  product: productObject // Produto a ser comprado
});
```

**API chamada**: `payment.create(productId, paymentMethod)`

---

### 2. VideoVerificationScreen.js
**Localização**: `/mobile/src/screens/VideoVerificationScreen.js`

**Funcionalidades**:
- ✅ Solicita permissão de câmera
- ✅ Instruções de como gravar o vídeo
- ✅ Gravação de vídeo (10-30 segundos, máx 30s)
- ✅ Timer de gravação em tempo real
- ✅ Preview do vídeo antes de enviar
- ✅ Botão para descartar e regravar
- ✅ Upload com barra de progresso
- ✅ Notificação de auto-aprovação pela IA
- ✅ Navegação para detalhes da transação

**Como usar**:
```javascript
navigation.navigate('VideoVerification', {
  transactionId: 123,
  product: productObject
});
```

**API chamada**: `payment.uploadVideo(transactionId, videoFile)`

**Dependências necessárias**:
- `expo-camera`: ~17.0.14
- `expo-av`: ~15.0.12

---

### 3. MyTransactionsScreen.js
**Localização**: `/mobile/src/screens/MyTransactionsScreen.js`

**Funcionalidades**:
- ✅ Lista de transações do usuário
- ✅ Filtro por Compras ou Vendas (tabs)
- ✅ Exibe status com emoji e cor
- ✅ Mostra valores e datas
- ✅ Código de rastreio (quando disponível)
- ✅ Pull-to-refresh para atualizar
- ✅ Estado vazio (sem transações)
- ✅ Toque para ver detalhes

**Como usar**:
```javascript
navigation.navigate('MyTransactions');
```

**API chamada**: `payment.listMyTransactions(asBuyer)`

**Status possíveis**:
| Status | Emoji | Descrição |
|--------|-------|-----------|
| `pending` | ⏳ | Aguardando Pagamento |
| `paid` | 💰 | Pago - Aguardando Envio |
| `shipped` | 📦 | Enviado |
| `video_uploaded` | 📹 | Vídeo em Análise |
| `verified` | ✅ | Verificado |
| `released` | 🎉 | Pagamento Liberado |
| `disputed` | ⚠️ | Em Disputa |
| `refunded` | ↩️ | Reembolsado |
| `auto_released` | ⏰ | Liberado Automaticamente |

---

### 4. TransactionDetailScreen.js
**Localização**: `/mobile/src/screens/TransactionDetailScreen.js`

**Funcionalidades**:
- ✅ Detalhes completos da transação
- ✅ Card de status colorido e descritivo
- ✅ Informações do produto
- ✅ Breakdown de valores (incluindo taxa de 5%)
- ✅ Código de rastreio dos Correios
- ✅ Botão para rastrear encomenda
- ✅ Ações contextuais por status e papel (comprador/vendedor)
- ✅ Pull-to-refresh

**Como usar**:
```javascript
navigation.navigate('TransactionDetail', {
  transactionId: 123,
  asSeller: false // ou true se for vendedor
});
```

**Ações disponíveis**:

#### Para Vendedores:
- **Status `paid`**: Botão "Marcar como Enviado" (solicita código de rastreio)
- **Status `shipped`**: Card de espera (aguardando confirmação)
- **Status `released`**: Card de sucesso com valor a receber

#### Para Compradores:
- **Status `shipped`**:
  - Botão "Confirmar Recebimento"
  - Botão "Gravar Vídeo de Verificação"
  - Botão "Abrir Reclamação"
  - Info de auto-liberação
- **Status `video_uploaded`**: Card de espera (IA analisando)
- **Status `released`**: Card de sucesso
- **Status `disputed`**: Card de disputa em análise

**APIs chamadas**:
- `payment.get(transactionId)` - Buscar detalhes
- `payment.markAsShipped(transactionId, trackingCode)` - Marcar envio
- `payment.release(transactionId)` - Liberar pagamento
- `payment.dispute(transactionId, reason)` - Abrir reclamação

---

## 🧭 Integração com Navegação

### Atualizar o Navigator

Adicione as novas telas no seu stack navigator:

```javascript
// App.js ou navigation/AppNavigator.js
import CheckoutScreen from './src/screens/CheckoutScreen';
import VideoVerificationScreen from './src/screens/VideoVerificationScreen';
import MyTransactionsScreen from './src/screens/MyTransactionsScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';

// Dentro do Stack.Navigator
<Stack.Screen
  name="Checkout"
  component={CheckoutScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="VideoVerification"
  component={VideoVerificationScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="MyTransactions"
  component={MyTransactionsScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="TransactionDetail"
  component={TransactionDetailScreen}
  options={{ headerShown: false }}
/>
```

---

## 📦 Instalação de Dependências

Execute no terminal:

```bash
cd mobile
npm install
# ou
npx expo install expo-camera expo-av
```

**Dependências adicionadas**:
- `expo-camera`: ~17.0.14
- `expo-av`: ~15.0.12

---

## 🔗 Fluxo Completo de Navegação

```
ProductDetailScreen
  ↓ (Botão "Comprar")
CheckoutScreen
  ↓ (Após criar pagamento)
MyTransactionsScreen
  ↓ (Toque em transação)
TransactionDetailScreen
  ↓ (Botão "Gravar Vídeo")
VideoVerificationScreen
  ↓ (Após upload)
TransactionDetailScreen (atualizado)
```

---

## 🎨 Componentes Reutilizados

Todas as telas usam os componentes visuais existentes:
- `RetroButton` - Botões estilizados
- `RetroCard` - Cards com bordas retrô
- `colors` - Paleta de cores (yellow.primary, background.*, text.*)

---

## ⚙️ Permissões Necessárias (app.json)

Adicione as permissões de câmera no `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Permitir $(PRODUCT_NAME) acessar sua câmera para gravar vídeos de verificação"
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Precisamos acessar sua câmera para gravar vídeos de verificação do produto",
        "NSMicrophoneUsageDescription": "Precisamos acessar seu microfone para gravar vídeos com áudio"
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO"
      ]
    }
  }
}
```

---

## ✅ TODOs Pendentes (Melhorias Futuras)

### CheckoutScreen
- [ ] Implementar Clipboard.setString() real para copiar código PIX
- [ ] Abrir link do Mercado Pago para cartão de crédito
- [ ] Adicionar loading skeleton enquanto carrega dados

### VideoVerificationScreen
- [ ] Abrir configurações do app quando permissão negada
- [ ] Implementar upload progress real (XMLHttpRequest)
- [ ] Adicionar flip de câmera (frontal/traseira)
- [ ] Adicionar flash/lanterna durante gravação

### MyTransactionsScreen
- [ ] Adicionar filtros adicionais (por status, por data)
- [ ] Implementar paginação (infinite scroll)
- [ ] Adicionar busca por produto

### TransactionDetailScreen
- [ ] Abrir app/site dos Correios para rastreamento
- [ ] Adicionar chat com vendedor/comprador
- [ ] Notificações push quando status mudar

---

## 🧪 Como Testar

### 1. Criar Pagamento
```javascript
// No ProductDetailScreen
<RetroButton
  title="Comprar Agora"
  onPress={() => navigation.navigate('Checkout', { product })}
/>
```

### 2. Ver Transações
```javascript
// Em algum menu/profile
<RetroButton
  title="Minhas Transações"
  onPress={() => navigation.navigate('MyTransactions')}
/>
```

### 3. Simular Status
No backend, você pode manualmente alterar o status da transação no banco de dados para testar diferentes estados:

```sql
UPDATE transactions SET status = 'shipped', tracking_code = 'BR123456789BR' WHERE id = 1;
```

---

## 🎯 Checklist de Integração

- [x] Telas criadas
- [x] Dependências adicionadas ao package.json
- [ ] Instalar dependências (`npm install`)
- [ ] Adicionar telas ao navigator
- [ ] Adicionar permissões no app.json
- [ ] Testar fluxo completo (compra → vídeo → liberação)
- [ ] Testar permissões de câmera
- [ ] Testar pull-to-refresh
- [ ] Testar navegação entre telas
- [ ] Testar erros de API

---

## 📞 Endpoints Utilizados

Todas as telas utilizam os endpoints documentados em `PAYMENT_SYSTEM.md`:

- `POST /payment/create` - Criar pagamento
- `GET /payment/{id}` - Detalhes da transação
- `POST /payment/{id}/ship` - Marcar como enviado
- `POST /payment/{id}/verify-video` - Upload de vídeo
- `POST /payment/{id}/release` - Liberar pagamento
- `POST /payment/{id}/dispute` - Abrir reclamação
- `GET /my-transactions` - Listar transações

---

**Desenvolvido para RetroTrade Brasil** 🎮
Sistema de pagamento com escrow e verificação por IA!
