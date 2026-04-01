# 📦 RetroTrade Brasil v2.3.0 - Sistema de Pagamento com Escrow

**Data de Release**: 30 de Março de 2026

---

## 🎉 Novidades Principais

### 💳 Sistema de Pagamento Completo com Escrow
Implementação completa de sistema de pagamento seguro integrado com Mercado Pago, incluindo:
- Pagamento retido até confirmação (escrow)
- Verificação por IA através de vídeo
- Auto-liberação após 3 dias úteis
- Sistema de disputas e reclamações

---

## 🚀 Features Implementadas

### Backend (Python/FastAPI)

#### 1. **Integração Mercado Pago** ✅
- SDK do Mercado Pago v2.3.0
- Criação de preferências de pagamento
- Geração de QR Code PIX
- Webhook para notificações de pagamento
- Suporte a PIX e Cartão de Crédito

#### 2. **Sistema de Escrow** ✅
- Modelo `Transaction` com 9 estados possíveis
- Retenção de pagamento até confirmação
- Taxa da plataforma: 5%
- Rastreamento de código dos Correios
- Datas de auto-liberação calculadas

#### 3. **Verificação por IA (Claude Vision)** ✅
- Extração de 5 frames do vídeo com OpenCV
- Análise comparativa com fotos originais
- Score de confiança (0-100)
- Auto-aprovação com score >= 85
- Recomendações: approve/review/reject

#### 4. **Auto-Liberação de Pagamentos** ✅
- APScheduler rodando a cada 1 hora
- Cálculo de 3 dias úteis (segunda a sexta)
- Liberação automática após prazo
- Notificação de vendedor e comprador

#### 5. **8 Novos Endpoints** ✅
```
POST   /payment/create              - Criar pagamento
GET    /payment/{id}                - Detalhes transação
POST   /payment/{id}/ship           - Marcar como enviado
POST   /payment/{id}/verify-video   - Upload vídeo verificação
POST   /payment/{id}/release        - Liberar pagamento
POST   /payment/{id}/dispute        - Abrir reclamação
GET    /my-transactions             - Listar transações
POST   /webhook/mercadopago         - Webhook MP
POST   /admin/run-auto-release      - Trigger manual auto-release
```

#### 6. **Dependências Adicionadas**
```
opencv-python-headless==4.13.0.92
numpy>=2.0.0
apscheduler==3.11.2
mercadopago==2.3.0
bcrypt<5.0.0
```

---

### Mobile (React Native/Expo)

#### 1. **CheckoutScreen** ✅
**Localização**: `/mobile/src/screens/CheckoutScreen.js`

**Funcionalidades**:
- Resumo do produto comprado
- Breakdown de valores e taxas
- Seleção PIX ou Cartão de Crédito
- QR Code PIX interativo
- Código PIX copiável
- Info de segurança (escrow)
- Navegação pós-compra

**Navegação**:
```javascript
navigation.navigate('Checkout', { product })
```

---

#### 2. **VideoVerificationScreen** ✅
**Localização**: `/mobile/src/screens/VideoVerificationScreen.js`

**Funcionalidades**:
- Solicitação de permissões (câmera + microfone)
- Instruções de gravação
- Gravação de vídeo (10-30s, máx 30s)
- Timer em tempo real com REC indicator
- Preview antes de enviar
- Botão descartar e regravar
- Upload com barra de progresso simulada
- Notificação de auto-aprovação IA
- Análise de confiança exibida

**Navegação**:
```javascript
navigation.navigate('VideoVerification', {
  transactionId: 123,
  product: productObject
})
```

**Requer**:
- `expo-camera@~16.0.10`
- `expo-av@~15.0.1`

---

#### 3. **MyTransactionsScreen** ✅
**Localização**: `/mobile/src/screens/MyTransactionsScreen.js`

**Funcionalidades**:
- Lista de transações do usuário
- Filtros: Compras 🛒 | Vendas 💼
- Status coloridos com emojis
- Valores e datas formatadas
- Código de rastreio (quando disponível)
- Pull-to-refresh
- Estado vazio estilizado
- Toque para detalhes

**Navegação**:
```javascript
navigation.navigate('MyTransactions')
```

**Estados de Transação**:
| Status | Emoji | Cor |
|--------|-------|-----|
| pending | ⏳ | Amarelo |
| paid | 💰 | Amarelo |
| shipped | 📦 | Amarelo |
| video_uploaded | 📹 | Amarelo |
| verified | ✅ | Verde |
| released | 🎉 | Verde |
| disputed | ⚠️ | Vermelho |
| refunded | ↩️ | Vermelho |
| auto_released | ⏰ | Verde |

---

#### 4. **TransactionDetailScreen** ✅
**Localização**: `/mobile/src/screens/TransactionDetailScreen.js`

**Funcionalidades**:
- Detalhes completos da transação
- Card de status grande e colorido
- Informações do produto
- Breakdown de valores:
  - Valor do produto
  - Taxa da plataforma (5%)
  - Valor que vendedor recebe
- Código de rastreio dos Correios
- Botão rastrear encomenda
- Ações contextuais por role:

**Ações para Vendedor**:
- `paid`: Marcar como Enviado (solicita código rastreio)
- `shipped`: Card de espera (aguardando confirmação)
- `released`: Card de sucesso com valor recebido

**Ações para Comprador**:
- `shipped`:
  - Confirmar Recebimento
  - Gravar Vídeo de Verificação
  - Abrir Reclamação
  - Info de auto-liberação com countdown
- `video_uploaded`: Card de espera (IA analisando)
- `released`: Card de sucesso
- `disputed`: Card de disputa em análise

**Navegação**:
```javascript
navigation.navigate('TransactionDetail', {
  transactionId: 123,
  asSeller: false
})
```

---

#### 5. **ProductDetailScreen - Atualizado** ✅
**Mudanças**:
- Botão "Comprar" adicionado no footer
- Layout footer ajustado: Comprar (2/3) + Chat (1/3)
- Validação de produto disponível
- Navegação para CheckoutScreen
- Botão desabilitado se produto não disponível

**Antes**:
```javascript
<RetroButton title="Contatar Vendedor" />
```

**Depois**:
```javascript
<View style={styles.footer}>
  <RetroButton title="Comprar" icon="🛒" style={flex: 2} />
  <RetroButton title="Chat" icon="💬" style={flex: 1} />
</View>
```

---

#### 6. **ProfileScreen - Atualizado** ✅
**Mudanças**:
- Item "Minhas Transações" 💳 adicionado ao menu
- Navegação funcional para MyTransactionsScreen
- Posicionado entre "Meus Anúncios" e "Favoritos"

---

#### 7. **RetroButton - Ajustes de UI** ✅
**Mudanças**:
- Padding reduzido para melhor fit
  - Small: 8px × 12px (antes 8px × 16px)
  - Medium: 10px × 20px (antes 12px × 24px)
  - Large: 14px × 24px (antes 16px × 32px)
- Fonte reduzida:
  - Small: 11px (antes 12px)
  - Medium: 12px (antes 14px)
  - Large: 13px (antes 16px)
- Ícone reduzido: 16px (antes 20px)
- Gap reduzido: 6px (antes 8px)
- Letter-spacing: 0.5px (antes 1px)

**Resultado**: Botões mais compactos, melhor alinhamento visual

---

#### 8. **App.js - Navegação** ✅
**Rotas Adicionadas**:
```javascript
<Stack.Screen name="Checkout" component={CheckoutScreen} />
<Stack.Screen name="VideoVerification" component={VideoVerificationScreen} />
<Stack.Screen name="MyTransactions" component={MyTransactionsScreen} />
<Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
```

---

#### 9. **Dependências Mobile** ✅
```json
"expo-camera": "~16.0.10",
"expo-av": "~15.0.1"
```

---

#### 10. **Permissões (app.json)** ✅

**iOS**:
```json
"infoPlist": {
  "NSCameraUsageDescription": "Precisamos acessar sua câmera para gravar vídeos de verificação do produto recebido.",
  "NSMicrophoneUsageDescription": "Precisamos acessar seu microfone para gravar vídeos com áudio."
}
```

**Android**:
```json
"permissions": [
  "CAMERA",
  "RECORD_AUDIO",
  "READ_MEDIA_IMAGES",
  "READ_MEDIA_VIDEO",
  "INTERNET",
  "ACCESS_NETWORK_STATE"
]
```

**Plugin expo-camera**:
```json
[
  "expo-camera",
  {
    "cameraPermission": "Precisamos acessar sua câmera para gravar vídeos de verificação do produto recebido.",
    "microphonePermission": "Precisamos acessar seu microfone para gravar vídeos com áudio."
  }
]
```

---

## 🔄 Fluxo Completo do Sistema

```
1. COMPRADOR
   ↓ Seleciona produto
   ↓ Clica em "Comprar" (ProductDetailScreen)
   ↓
2. CHECKOUT (CheckoutScreen)
   ↓ Escolhe PIX ou Cartão
   ↓ Escaneia QR Code / Paga
   ↓ Backend cria Transaction (status: pending → paid)
   ↓
3. VENDEDOR (MyTransactionsScreen)
   ↓ Vê nova venda (status: paid)
   ↓ Marca como "Enviado" com código rastreio
   ↓ Backend atualiza (status: paid → shipped)
   ↓ Define auto_release_date = hoje + 3 dias úteis
   ↓
4. COMPRADOR (TransactionDetailScreen)
   ↓ Vê status "Enviado"
   ↓ OPÇÃO A: Clica "Gravar Vídeo de Verificação"
   ↓
5. VÍDEO (VideoVerificationScreen)
   ↓ Grava vídeo 10-30s do produto
   ↓ Envia para backend
   ↓ Backend extrai 5 frames (OpenCV)
   ↓ Claude Vision compara com fotos originais
   ↓ Score >= 85 → Auto-aprova
   ↓ Backend atualiza (status: shipped → verified → released)
   ↓ Produto marcado como sold = true
   ↓
6. VENDEDOR (TransactionDetailScreen)
   ↓ Recebe notificação
   ↓ Vê "Pagamento Liberado"
   ↓ Valor transferido em até 2 dias úteis
   ↓
   OPÇÃO B: Comprador não envia vídeo
   ↓
7. AUTO-RELEASE (APScheduler a cada 1h)
   ↓ Checa transactions com:
   ↓   - status = "shipped"
   ↓   - auto_release_date <= now()
   ↓ Libera pagamento automaticamente
   ↓ Backend atualiza (status: shipped → auto_released)
   ↓
   OPÇÃO C: Comprador abre reclamação
   ↓
8. DISPUTA (TransactionDetailScreen)
   ↓ Comprador clica "Abrir Reclamação"
   ↓ Descreve o problema
   ↓ Backend atualiza (status: shipped → disputed)
   ↓ Admin analisa manualmente
```

---

## 📊 Status da Transação (Estados)

| Status | Descrição | Próximo Passo |
|--------|-----------|---------------|
| `pending` | Aguardando pagamento | Comprador paga |
| `paid` | Pago, aguardando envio | Vendedor envia |
| `shipped` | Enviado, aguardando confirmação | Comprador confirma ou 3 dias |
| `video_uploaded` | Vídeo enviado, aguardando IA | IA analisa |
| `verified` | IA aprovou | Libera pagamento |
| `released` | Pagamento liberado | Concluído |
| `disputed` | Em reclamação | Admin analisa |
| `refunded` | Reembolsado | Concluído |
| `auto_released` | Liberado automaticamente | Concluído |

---

## 💰 Taxas e Valores

**Taxa da Plataforma**: 5% sobre o valor da venda

**Exemplo**:
- Produto: R$ 150,00
- Taxa plataforma: R$ 7,50 (5%)
- Vendedor recebe: R$ 142,50

**Taxas Mercado Pago** (aproximadas):
- PIX: ~0.99%
- Cartão de Crédito: ~4.99% + R$ 0,40
- Boleto: ~R$ 3,49

---

## 🧪 Credenciais de Teste (Mercado Pago)

### Conta Teste
- **Public Key**: `APP_USR-4eef51bd-d9a5-4666-8265-ea580c622172`
- **Access Token**: `APP_USR-3608457092984824-033014-049c2ac2128ac0e708ad77c8815e4b13-330359130`
- **User ID**: `330359130`
- **Usuário**: `TESTUSER782443309064241364`
- **Senha**: `iERnF50KOm`

### Cartão de Teste (Aprovado)
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO
CPF: 12345678909
```

### Cartão de Teste (Recusado)
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: OTHE
CPF: 12345678909
```

---

## 🛡️ Segurança

### Proteções Implementadas
1. ✅ **Escrow** - Dinheiro retido até confirmação
2. ✅ **Verificação IA** - Análise automática de vídeos
3. ✅ **Rastreio** - Código dos Correios obrigatório
4. ✅ **Disputa** - Sistema de reclamação robusto
5. ✅ **Timeout** - Auto-liberação evita bloqueios eternos

### Anti-Fraude
- ✅ JWT Authentication em todos os endpoints
- ✅ Validação de ownership (comprador/vendedor)
- ✅ Histórico de transações auditável
- ✅ Score de reputação de usuários
- ✅ IA Claude para detecção de fraude

---

## 📱 Requisitos

### Backend
- Python 3.10+
- Node.js 20+ (para testes Expo)
- OpenCV (opencv-python-headless)
- Anthropic API Key (Claude)
- Mercado Pago API Key

### Mobile
- Node.js 20+
- Expo SDK 54
- Android 5.0+ ou iOS 13+
- Permissões: Câmera, Microfone

---

## 🚀 Como Instalar

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Mobile
```bash
cd mobile
npm install
npm run android  # ou npm run ios
```

---

## 📚 Documentação Adicional

- [PAYMENT_SYSTEM.md](PAYMENT_SYSTEM.md) - Documentação completa do sistema de pagamento
- [MOBILE_SCREENS_GUIDE.md](MOBILE_SCREENS_GUIDE.md) - Guia das telas mobile
- [README.md](README.md) - Documentação geral do projeto

---

## 🐛 Bug Fixes

### v2.3.0
- ✅ Corrigido erro bcrypt 5.0.0 incompatibilidade com passlib
- ✅ Ajustado tamanho dos botões para melhor fit
- ✅ Corrigidas versões expo-camera e expo-av compatíveis com Expo 54
- ✅ Adicionadas permissões de câmera e microfone

---

## ⚠️ Breaking Changes

Nenhuma breaking change nesta versão. Totalmente backward compatible com v2.2.0.

---

## 🔜 Roadmap (v2.4.0)

### Backend
- [ ] Implementar notificações push (Firebase)
- [ ] Email notifications com templates
- [ ] Dashboard admin para disputas
- [ ] Relatórios de vendas/comissões
- [ ] Integração com mais gateways (PagSeguro, PayPal)

### Mobile
- [ ] Implementar Clipboard real para PIX
- [ ] Abrir navegador para pagamento com cartão
- [ ] Notificações push em tempo real
- [ ] Chat entre comprador e vendedor
- [ ] Sistema de avaliação pós-venda

### IA
- [ ] Melhorar prompt Claude Vision com exemplos
- [ ] Análise frame-by-frame mais detalhada
- [ ] Detecção de produtos danificados
- [ ] Score de autenticidade (detectar réplicas)

---

## 👥 Contribuidores

- **madeinweb** - Desenvolvimento completo do sistema

---

## 📄 Licença

Proprietário - RetroTrade Brasil © 2026

---

**🎮 RetroTrade Brasil - Sistema único no Brasil com verificação por IA!**

_Games Clássicos, Preços Modernos, Segurança do Futuro._
