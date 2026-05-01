# 🧪 Usar Credenciais de TESTE para Testar OAuth

## ✅ VANTAGENS:
- ⚡ OAuth já está habilitado
- 🚀 Funciona imediatamente
- ✅ Testa todo o fluxo do marketplace
- ⚠️ Pagamentos não são reais (PIX e Cartão são simulados)

## 📋 PASSO A PASSO:

### 1️⃣ Acesse credenciais de TESTE:

```
https://www.mercadopago.com.br/developers/panel/app
```

- Clique na sua aplicação
- Vá na aba **"Credenciais de teste"** ou **"Test credentials"**

### 2️⃣ Copie as 3 credenciais:

```
Public Key: TEST-xxxxx...
Access Token: TEST-xxxxx...
```

**IMPORTANTE:** Pode ser que precise criar **usuários de teste** primeiro:
- No painel do MP, vá em **"Usuários de teste"** ou **"Test users"**
- Crie 2 usuários: um vendedor e um comprador
- Use esses usuários no app mobile

### 3️⃣ Atualize no Render:

Mesmo processo de antes, mas com valores de TESTE:

```
MERCADOPAGO_APP_ID: (do painel de teste)
MERCADOPAGO_CLIENT_SECRET: (do painel de teste)
MERCADOPAGO_ACCESS_TOKEN: TEST-xxxxx...
```

### 4️⃣ Reconecte no app:

- OAuth de teste já funciona!
- Reconecte a conta usando usuário de teste
- Teste o fluxo completo

---

## 💡 DEPOIS:

Quando o OAuth de produção for aprovado, basta:
1. Voltar para credenciais de produção
2. Reconectar contas reais
3. Pronto! Pagamentos reais funcionando
