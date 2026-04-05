# 🔧 Configurar Mercado Pago Marketplace OAuth

## O que mudou?

Antes, **sua conta pessoal** do Mercado Pago intermediava todas as transações. Agora implementamos o **Mercado Pago Marketplace**, onde:

✅ Cada vendedor conecta sua própria conta MP  
✅ Pagamento vai direto para o vendedor  
✅ Plataforma deduz 5% automaticamente  
✅ Você não precisa repassar dinheiro manualmente  

---

## 📋 Passo a Passo

### 1️⃣ Criar Aplicação no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Clique em **"Criar aplicação"**
3. Preencha:
   - **Nome da aplicação:** RetroTrade Brasil
   - **Descrição:** Marketplace de games retrô
   - **Categoria:** Marketplace
   - **Modelo de integração:** Marketplace
4. Clique em **Criar aplicação**

### 2️⃣ Configurar OAuth (Redirect URLs)

1. Na aplicação criada, vá em **"OAuth"** no menu lateral
2. Em **"Redirect URIs"**, adicione:
   ```
   https://gamer-marketplace.onrender.com/auth/mercadopago/callback
   ```
3. Clique em **Salvar**

### 3️⃣ Obter Credenciais

1. Vá em **"Credenciais"** no menu lateral
2. Copie:
   - **App ID** (ex: `1234567890123456`)
   - **Client Secret** (ex: `abcdef1234567890abcdef1234567890`)

### 4️⃣ Adicionar Variáveis de Ambiente no Render

1. Acesse: https://dashboard.render.com
2. Entre no seu serviço **gamer-marketplace**
3. Vá em **"Environment"** → **"Environment Variables"**
4. Adicione as seguintes variáveis:

```bash
MERCADOPAGO_APP_ID=SEU_APP_ID_AQUI
MERCADOPAGO_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI
MERCADOPAGO_REDIRECT_URI=https://gamer-marketplace.onrender.com/auth/mercadopago/callback
PLATFORM_COMMISSION_PERCENT=5.0
```

5. Clique em **"Save Changes"**
6. O Render vai reiniciar o serviço automaticamente

### 5️⃣ Executar Migration no Banco de Dados

**IMPORTANTE:** Execute apenas UMA VEZ no servidor do Render:

1. No Render, vá em **"Shell"**
2. Execute:
   ```bash
   cd backend
   python3 migration_add_mp_fields.py
   ```
3. Deve aparecer: `✅ Migration completed successfully!`

---

## 🧪 Como Testar

### Para Vendedores:

1. Abra o app mobile
2. Vá em **"Perfil"** (ícone de perfil no menu)
3. Na seção **"💳 MERCADO PAGO"**, clique em **"Conectar Mercado Pago"**
4. Você será redirecionado para autorizar a aplicação
5. Após autorizar, volte ao app
6. O status deve mostrar **"✅ Conta Conectada"**

### Para Compradores:

1. Tente comprar um produto de um vendedor que conectou o MP
2. O pagamento deve ser criado normalmente
3. O dinheiro cairá direto na conta do vendedor (menos 5% de comissão)

---

## ⚠️ Observações Importantes

### Vendedores SEM MP conectado:
- Não podem receber pagamentos
- Quando alguém tentar comprar, verá erro: **"Este vendedor ainda não conectou sua conta do Mercado Pago"**

### Comissão da Plataforma:
- **5%** é deduzido automaticamente pelo Mercado Pago
- O vendedor recebe **95%** do valor
- Você (dono da plataforma) recebe **5%** na sua conta configurada

### Conta da Plataforma:
- Mantenha as variáveis antigas para receber comissões:
  ```
  MERCADOPAGO_ACCESS_TOKEN=APP_USR-3608457092984824-033014-049c2ac2128ac0e708ad77c8815e4b13-3303593130
  MERCADOPAGO_PUBLIC_KEY=APP_USR-4eef51bd-d9a5-4666-8265-ea580c622172
  ```
- Estas credenciais são da sua conta, onde as comissões cairão

---

## 🔍 Verificar se está funcionando

### Backend Logs (Render):

Quando um vendedor conecta:
```
✅ [MP OAUTH] Token obtido com sucesso
✅ [MP OAUTH] Usuário teste1 conectou conta MP (ID: 123456789)
```

Quando um pagamento é criado:
```
💳 [PAYMENT] Vendedor teste1 tem MP conectado (ID: 123456789)
💳 [PAYMENT] Usando token do vendedor para criar pagamento com split
💰 [PAYMENT] Valor total: R$ 100.00
💰 [PAYMENT] Comissão plataforma (5%): R$ 5.00
💰 [PAYMENT] Valor para vendedor: R$ 95.00
```

### Mobile:

No ProfileScreen, deve aparecer:
```
💳 MERCADO PAGO
✅ Conta Conectada
ID: 123456789
Conectado em: 05/04/2026
✅ Pode receber pagamentos
```

---

## 🐛 Troubleshooting

### Erro: "Mercado Pago OAuth não configurado"
- Certifique-se que adicionou todas as variáveis no Render
- Verifique se o Render reiniciou após adicionar as variáveis

### Erro no callback: "Erro ao obter token"
- Verifique se o **Redirect URI** está exatamente igual no MP e no Render
- Certifique-se que o **Client Secret** está correto

### Vendedor não consegue conectar:
- Verifique os logs do Render para ver o erro específico
- Certifique-se que o vendedor tem conta no Mercado Pago

### Pagamento falha: "Este vendedor ainda não conectou"
- Normal! O vendedor precisa conectar sua conta MP antes de poder receber

---

## 📞 Próximos Passos

Depois de configurar:

1. ✅ Teste com sua conta (conecte no perfil)
2. ✅ Teste criar um produto e tentar comprar
3. ✅ Verifique se o pagamento abre corretamente
4. ✅ Verifique se a comissão está sendo deduzida

Se tudo funcionar, você tem um marketplace 100% funcional! 🎉
