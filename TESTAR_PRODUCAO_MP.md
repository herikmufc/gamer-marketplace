# ✅ Como Testar Credenciais de Produção

Após atualizar as credenciais no Render e aguardar ~2 minutos:

## 🧪 TESTE 1: Verificar se credenciais foram atualizadas

```bash
curl https://gamer-marketplace.onrender.com/health | jq
```

Procure por:
```json
"mercadopago": "configured",
"mercadopago_token_present": true
```

## 🧪 TESTE 2: Diagnóstico completo

```bash
curl https://gamer-marketplace.onrender.com/marketplace-diagnostic | jq
```

Deve retornar:
```json
{
  "status": "healthy",
  "message": "✅ Marketplace está 100% funcional!",
  "success": [
    "✅ APP_ID configurado: 4232969983...",
    "✅ CLIENT_SECRET configurado: z8rLjMSBVj...",
    "✅ ACCESS_TOKEN configurado: APP_USR-4232969983599799..."
  ]
}
```

## 🧪 TESTE 3: Criar preferência de teste

```bash
curl https://gamer-marketplace.onrender.com/test-mp-preference/4 | jq
```

Verifique:
```json
{
  "mp_response": {
    "has_init_point": true,
    "preference_id": "289948302-xxxxx...",
    "init_point": "https://www.mercadopago.com.br/checkout/..."
  }
}
```

⚠️ Deve ser `www.mercadopago.com.br` (NÃO `sandbox.mercadopago.com.br`)

## 🧪 TESTE 4: Validar token do vendedor

```bash
curl https://gamer-marketplace.onrender.com/test-seller-token/admin | jq
```

Deve retornar:
```json
{
  "token_test": {
    "valid": true,
    "message": "✅ Token válido!"
  }
}
```

## 📱 TESTE FINAL: No App Mobile

1. **Abra o app**
2. **Vá em um produto**
3. **Clique em "Comprar Agora"**
4. **Finalize a compra**
5. **Clique em "Abrir no Navegador"**
6. **Deve abrir o checkout do MP SEM ERRO**

---

## ✅ SE TUDO FUNCIONAR:

Você verá o checkout real do Mercado Pago e poderá:
- ✅ Pagar com PIX
- ✅ Pagar com Cartão
- ✅ Ver o split funcionando (95% vendedor, 5% plataforma)

---

## ❌ SE DER ERRO:

Me envie:
1. Print do erro
2. Logs do console do Metro
3. Resultado dos testes acima

Vou te ajudar a resolver! 🚀
