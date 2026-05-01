# 🔧 Configurar Redirect URIs no Mercado Pago

## ⚠️ PROBLEMA: App abre mas não mostra checkout

Isso pode acontecer se as **Redirect URIs** não estão configuradas.

---

## 📋 SOLUÇÃO:

### 1️⃣ Acesse o Painel do MP:

```
https://www.mercadopago.com.br/developers/panel/app/4232969983599799
```

(Substitua pelo ID da sua aplicação se necessário)

### 2️⃣ Procure por "OAuth" ou "Configurações":

No menu lateral, clique em:
- **"OAuth"** ou
- **"Configurações"** ou
- **"Redirect URIs"**

### 3️⃣ Adicione estas URLs:

No campo **"Redirect URIs autorizadas"**, adicione:

```
https://gamer-marketplace.onrender.com/auth/mercadopago/callback
https://gamer-marketplace.onrender.com/payment/success
https://gamer-marketplace.onrender.com/payment/failure
https://gamer-marketplace.onrender.com/payment/pending
```

### 4️⃣ Configurar URLs de Retorno:

Se houver uma seção separada para **"Back URLs"** ou **"URLs de retorno"**:

```
Success URL: https://gamer-marketplace.onrender.com/payment/success
Failure URL: https://gamer-marketplace.onrender.com/payment/failure
Pending URL: https://gamer-marketplace.onrender.com/payment/pending
```

### 5️⃣ Salvar:

Clique em **"Salvar"** ou **"Save"**

---

## 🎯 DEPOIS:

Teste novamente no app mobile.

---

## 🆘 SE NÃO ENCONTRAR:

Tire um print da tela do painel do MP mostrando as opções disponíveis.
