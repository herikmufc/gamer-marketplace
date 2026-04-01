# 💳 Sistema de Pagamento com Escrow e Verificação por IA

## 🎯 Visão Geral

Sistema de pagamento seguro para RetroTrade Brasil com:
- **Escrow** (pagamento retido até confirmação)
- **Verificação por IA** através de vídeo do produto recebido
- **Auto-liberação** após 3 dias úteis
- **Integração** com Mercado Pago

---

## 🔄 Fluxo Completo

```
1. COMPRADOR → Cria pagamento via Mercado Pago
   ↓
2. MP → Processa pagamento (PIX/Cartão)
   ↓
3. SISTEMA → Retém valor (escrow)
   ↓
4. VENDEDOR → Envia produto + código rastreio
   ↓
5. SISTEMA → Define auto-liberação (D+3 úteis)
   ↓
6. COMPRADOR → Recebe produto
   ↓
7. OPÇÃO A: COMPRADOR → Grava vídeo do produto
   ↓
8. IA (Claude) → Analisa vídeo vs foto original
   ↓
9. SE APROVADO → Libera pagamento automaticamente

   OPÇÃO B: Não envia vídeo
   ↓
10. SISTEMA → Libera automaticamente após 3 dias úteis

   OPÇÃO C: Abre reclamação
   ↓
11. ADMIN → Analisa caso manualmente
```

---

## 🔌 Endpoints da API

### 1. **Criar Pagamento**
```http
POST /payment/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": 1,
  "payment_method_id": "pix",
  "installments": 1
}
```

**Resposta:**
```json
{
  "transaction_id": 123,
  "mp_preference_id": "123456789-abc",
  "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "status": "pending",
  "amount": 150.00,
  "qr_code": "data:image/png;base64,...",
  "qr_code_text": "00020126..."
}
```

---

### 2. **Consultar Transação**
```http
GET /payment/{transaction_id}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "id": 123,
  "product_id": 1,
  "buyer_id": 2,
  "seller_id": 3,
  "mp_payment_id": "12345678",
  "mp_status": "approved",
  "status": "shipped",
  "amount": 150.00,
  "platform_fee": 7.50,
  "seller_amount": 142.50,
  "auto_release_date": "2026-04-02T10:00:00Z",
  "tracking_code": "BR123456789BR",
  "shipped_at": "2026-03-30T14:30:00Z",
  "created_at": "2026-03-30T10:00:00Z"
}
```

---

### 3. **Marcar como Enviado (Vendedor)**
```http
POST /payment/{transaction_id}/ship
Authorization: Bearer {token}
Content-Type: application/json

{
  "tracking_code": "BR123456789BR"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Produto marcado como enviado",
  "tracking_code": "BR123456789BR",
  "auto_release_date": "2026-04-02T10:00:00Z"
}
```

---

### 4. **Enviar Vídeo de Verificação (Comprador)**
```http
POST /payment/{transaction_id}/verify-video
Authorization: Bearer {token}
Content-Type: multipart/form-data

video_file: [arquivo MP4/MOV]
```

**Resposta:**
```json
{
  "success": true,
  "message": "Vídeo recebido. IA analisará em breve.",
  "transaction_id": 123
}
```

---

### 5. **Liberar Pagamento**
```http
POST /payment/{transaction_id}/release
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pagamento liberado para vendedor",
  "seller_amount": 142.50
}
```

---

### 6. **Abrir Reclamação (Comprador)**
```http
POST /payment/{transaction_id}/dispute
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Produto diferente do anunciado"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Reclamação aberta. Um admin irá analisar.",
  "transaction_id": 123
}
```

---

### 7. **Listar Minhas Transações**
```http
GET /my-transactions?as_buyer=true
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": 123,
    "product_id": 1,
    "status": "shipped",
    "amount": 150.00,
    "created_at": "2026-03-30T10:00:00Z"
  }
]
```

---

### 8. **Webhook Mercado Pago**
```http
POST /webhook/mercadopago
Content-Type: application/json

{
  "topic": "payment",
  "data": {
    "id": "12345678"
  }
}
```

---

## 📊 Status da Transação

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando pagamento |
| `paid` | Pago, aguardando envio |
| `shipped` | Enviado, aguardando confirmação |
| `video_uploaded` | Vídeo enviado, aguardando análise IA |
| `verified` | IA aprovou, liberando pagamento |
| `released` | Pagamento liberado para vendedor |
| `disputed` | Comprador abriu reclamação |
| `refunded` | Estornado para comprador |
| `auto_released` | Liberado automaticamente após 3 dias |

---

## 💰 Taxas

- **Taxa da Plataforma**: 5% sobre o valor da venda
- **Taxa do Mercado Pago**: Varia conforme método de pagamento
  - PIX: ~0.99%
  - Cartão de Crédito: ~4.99% + R$ 0,40
  - Boleto: ~R$ 3,49

**Exemplo:**
- Produto: R$ 150,00
- Taxa plataforma (5%): R$ 7,50
- Vendedor recebe: R$ 142,50

---

## 🤖 Verificação por IA

### Como Funciona:

1. Comprador grava vídeo (10-30 segundos) mostrando o produto recebido
2. IA (Claude Vision) analisa vídeo comparando com fotos do anúncio
3. IA verifica:
   - ✅ Produto é o mesmo
   - ✅ Está em boas condições
   - ✅ Acessórios prometidos estão presentes
4. Score de 0-100:
   - **85-100**: Aprovado automaticamente
   - **70-84**: Revisão manual
   - **0-69**: Possível problema, notifica admin

### Prompt da IA:
```
Analise este vídeo do produto recebido e compare com as fotos originais do anúncio.

Produto: [nome]
Descrição original: [descrição]

Verifique:
1. É o mesmo produto?
2. Estado condiz com anunciado?
3. Acessórios prometidos estão presentes?

Retorne JSON com:
{
  "match": true/false,
  "confidence_score": 0-100,
  "issues_found": ["..."],
  "recommendation": "approve/review/reject"
}
```

---

## ⏱️ Auto-Liberação

### Regras:

- **Prazo**: 3 dias úteis após envio
- **Contagem**: Segunda a Sexta (ignora fins de semana)
- **Bloqueio**: Se comprador abrir reclamação
- **Notificações**:
  - Comprador: 24h antes da liberação
  - Vendedor: Quando liberado

### Cálculo de Dias Úteis:
```python
def calculate_business_days(start_date, days):
    current_date = start_date
    days_added = 0

    while days_added < days:
        current_date += timedelta(days=1)
        if current_date.weekday() < 5:  # Seg-Sex
            days_added += 1

    return current_date
```

---

## 🔐 Segurança

### Proteções Implementadas:

1. **Escrow**: Dinheiro fica retido até confirmação
2. **Verificação**: IA analisa recebimento
3. **Rastreio**: Código dos Correios obrigatório
4. **Disputa**: Sistema de reclamação robusto
5. **Timeout**: Liberação automática evita bloqueios eternos

### Anti-Fraude:

- ✅ CPF obrigatório no cadastro
- ✅ Verificação de identidade (futuro)
- ✅ Histórico de transações
- ✅ Score de reputação
- ✅ IA detecta comportamentos suspeitos em chat

---

## 📱 Integração Mobile (Próximos Passos)

### Telas a Criar:

1. **CheckoutScreen**
   - Resumo do pedido
   - Seleção de pagamento (PIX/Cartão)
   - QR Code PIX
   - Botão pagar

2. **TransactionDetailScreen**
   - Status da compra
   - Rastreio do pedido
   - Botão "Confirmar recebimento"
   - Botão "Abrir reclamação"

3. **VideoVerificationScreen**
   - Gravar vídeo do produto
   - Preview antes de enviar
   - Upload para backend

4. **MyPurchasesScreen**
   - Lista de compras
   - Filtros por status
   - Histórico completo

5. **MySalesScreen**
   - Lista de vendas
   - Pendências (enviar produto)
   - Valores a receber

---

## 🧪 Testes

### Credenciais de Teste (Mercado Pago):

- **Public Key**: `APP_USR-4eef51bd-d9a5-4666-8265-ea580c622172`
- **Access Token**: `APP_USR-3608457092984824-033014-049c2ac2128ac0e708ad77c8815e4b13-330359130`
- **User ID**: `330359130`
- **Usuário teste**: `TESTUSER782443309064241364`
- **Senha**: `iERnF50KOm`
- **Código verificação**: `593130`

### Cartões de Teste:

**Aprovado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO
CPF: 12345678909
```

**Recusado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: OTHE
CPF: 12345678909
```

---

## 🚀 Próximas Implementações

### Backend:
- [ ] Job scheduler para auto-liberação
- [ ] IA análise de vídeo completa
- [ ] Webhook real do Mercado Pago
- [ ] Notificações por email/push
- [ ] Dashboard admin para disputas

### Mobile:
- [ ] Telas de checkout e pagamento
- [ ] Gravação e upload de vídeo
- [ ] Tela de transações
- [ ] Notificações push

### Futuro:
- [ ] Suporte a reembolso parcial
- [ ] Sistema de avaliação pós-venda
- [ ] Badges de vendedor confiável
- [ ] Integração com mais gateways de pagamento

---

## 📚 Referências

- [Mercado Pago API](https://www.mercadopago.com.br/developers)
- [Claude Vision API](https://docs.anthropic.com/claude/docs/vision)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

---

**Desenvolvido para RetroTrade Brasil** 🎮
Sistema único no Brasil com verificação por IA!
