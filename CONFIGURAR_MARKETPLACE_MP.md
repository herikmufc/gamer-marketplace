# 🏪 Como Configurar Marketplace no Mercado Pago

## ⚠️ IMPORTANTE: Sua aplicação DEVE ser do tipo "Marketplace"

Para que o split de comissão funcione, sua aplicação no Mercado Pago **PRECISA** estar configurada como **Marketplace** ou **Gateway de Pagamentos**.

## 📋 Passos para Verificar/Configurar:

### 1. Acesse o Painel do Mercado Pago

1. Entre em: https://www.mercadopago.com.br/developers/panel/app
2. Faça login com sua conta
3. Clique na sua aplicação: **"Retrotrade"**

### 2. Verifique o Tipo de Aplicação

Na página da aplicação, procure por:

- **Tipo de integração**: Deve ser **"Marketplace"** ou **"Gateway de pagamentos"**
- Se estiver como "Pagamentos online" ou outro tipo, você precisa mudar

### 3. Configurar como Marketplace

Se sua aplicação NÃO está configurada como Marketplace:

#### Opção A: Editar a aplicação existente (se permitido)
1. Vá em **"Configurações"** ou **"Editar"**
2. Procure por **"Modelo de negócio"** ou **"Tipo de integração"**
3. Selecione: **"Marketplace"** ou **"Gateway de pagamentos"**
4. Salve as alterações

#### Opção B: Criar nova aplicação (se não puder editar)
1. Clique em **"Criar aplicação"**
2. Na tela de tipo de pagamento, escolha: **"Marketplace"** ou **"Gateway de pagamentos"**
3. Plataforma: **"Web"** ou **"Mobile"**
4. Complete os dados:
   - Nome: Retrotrade Marketplace
   - Descrição: Marketplace de jogos retro
5. Após criar, copie as novas credenciais:
   - APP_ID
   - CLIENT_SECRET
   - ACCESS_TOKEN (este é o token da plataforma)

### 4. Configurar OAuth para Vendedores

No painel da aplicação, vá em **"OAuth"**:

1. **Redirect URIs autorizadas**: Adicione:
   ```
   https://gamer-marketplace.onrender.com/auth/mercadopago/callback
   ```

2. **Escopos (Permissions)**: Certifique-se que estão marcados:
   - ✅ `read` - Ler dados da conta
   - ✅ `write` - Criar pagamentos
   - ✅ `offline_access` - Refresh token

### 5. Configurar Webhooks

Ainda no painel, vá em **"Webhooks"**:

1. Adicione a URL de notificação:
   ```
   https://gamer-marketplace.onrender.com/webhook/mercadopago
   ```

2. Eventos que você quer receber:
   - ✅ `payment` - Pagamentos
   - ✅ `merchant_order` - Pedidos

### 6. Atualizar Credenciais no Render

Se você criou uma NOVA aplicação, atualize as variáveis de ambiente no Render:

1. Acesse: https://dashboard.render.com
2. Vá no seu serviço: **gamer-marketplace**
3. Em **"Environment"**, atualize:
   ```
   MERCADOPAGO_APP_ID=<novo_app_id>
   MERCADOPAGO_CLIENT_SECRET=<novo_client_secret>
   MERCADOPAGO_ACCESS_TOKEN=<novo_access_token>
   ```
4. O serviço vai reiniciar automaticamente

## 🔍 Como Verificar se Está Funcionando

Após configurar, teste com este endpoint:

```bash
# Substitua {product_id} pelo ID de um produto real
curl https://gamer-marketplace.onrender.com/test-mp-preference/{product_id}
```

Procure na resposta:
- ✅ `"has_init_point": true` - OK
- ✅ `"preference_id": "xxxxx"` - OK
- ⚠️ Se `init_point` estiver vazio ou `null` - Problema na configuração

## 🆘 Problemas Comuns

### Erro: "marketplace_fee não aceito"
- ❌ Aplicação NÃO está configurada como Marketplace
- ✔️ Solução: Criar nova aplicação do tipo Marketplace

### Erro: "unauthorized"
- ❌ Token do vendedor expirado ou inválido
- ✔️ Solução: Vendedor precisa reconectar conta do MP

### init_point retorna null/vazio
- ❌ Aplicação não está configurada corretamente
- ❌ Credenciais são de teste mas tentando usar em produção (ou vice-versa)
- ✔️ Solução: Verificar tipo de aplicação e credenciais

## 📸 Exemplo Visual

Quando estiver corretamente configurado, você verá na aplicação do MP:

```
Tipo: Marketplace ✅
Modelo: Comissão por transação
Status: Ativa
```

E no endpoint de teste, verá:

```json
{
  "status": "success",
  "mp_response": {
    "has_init_point": true,
    "preference_id": "1234567890-abc123-...",
    "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
  }
}
```

## 🎯 Próximos Passos

Após configurar corretamente:

1. ✅ Vendedores conectam suas contas via OAuth
2. ✅ Compradores finalizam pagamentos normalmente
3. ✅ Mercado Pago faz o split automático:
   - 95% para o vendedor
   - 5% para a plataforma (você)
4. ✅ Webhook notifica quando pagamento é aprovado
