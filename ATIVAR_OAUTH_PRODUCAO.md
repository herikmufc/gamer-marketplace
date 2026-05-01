# 🔐 Ativar OAuth em Produção no Mercado Pago

## ⚠️ ERRO: "O aplicativo não está pronto para se conectar a Mercado Pago"

Este erro acontece quando o OAuth não foi habilitado na aplicação de produção.

---

## 📋 SOLUÇÃO - PASSO A PASSO:

### 1️⃣ Acesse sua aplicação no Mercado Pago:

```
https://www.mercadopago.com.br/developers/panel/app/4232969983599799
```

### 2️⃣ Procure por "OAuth" no menu lateral

Pode estar em:
- **OAuth**
- **Configurações OAuth**
- **Autenticação**
- **Integração**

### 3️⃣ Ativar/Configurar OAuth

Você vai encontrar algo como:

**Status do OAuth:**
- ⚠️ "Desabilitado" ou "Não configurado"
- ✅ Precisa mudar para "Habilitado"

### 4️⃣ Adicionar Redirect URIs

No campo **"Redirect URIs autorizadas"**, adicione:

```
https://gamer-marketplace.onrender.com/auth/mercadopago/callback
```

### 5️⃣ Escopos (Permissions)

Certifique-se que estão marcados:
- ✅ `read` - Ler dados da conta
- ✅ `write` - Criar pagamentos  
- ✅ `offline_access` - Refresh token

### 6️⃣ Salvar

Clique em **"Salvar"** ou **"Guardar"**

---

## 🔍 SE NÃO ENCONTRAR CONFIGURAÇÃO DE OAUTH:

### Opção A: OAuth pode precisar de aprovação

O Mercado Pago pode exigir que você:

1. **Complete informações da aplicação:**
   - Nome comercial
   - Logo
   - Descrição
   - URL do site
   - Política de privacidade

2. **Submeter para revisão:**
   - Pode haver um botão "Solicitar aprovação" ou "Submit for review"
   - Leva 1-2 dias úteis

### Opção B: Usar credenciais de teste temporariamente

Se precisar testar AGORA enquanto aguarda aprovação:

1. No painel do MP, volte para **"Credenciais de teste"**
2. Copie as credenciais de **TESTE**
3. Atualize no Render (temporariamente)
4. Crie **usuários de teste** no MP
5. Use esses usuários para testar o fluxo

---

## 📸 TIRE PRINTS PARA EU TE AJUDAR:

Se não encontrar onde configurar OAuth:

1. Tire print da página principal da aplicação
2. Tire print do menu lateral mostrando as opções
3. Me envie para eu te guiar visualmente

---

## ⚡ ALTERNATIVA RÁPIDA - USAR TESTE:

Enquanto não ativa produção, podemos testar com credenciais de teste:

1. Volte para aba "Teste" no painel do MP
2. Copie as 3 credenciais de **teste**
3. Atualize no Render (temporariamente)
4. OAuth de teste geralmente já está habilitado
5. Funciona igual, só não processa pagamentos reais

Quer fazer isso para testar agora?
