# 🚀 Ativar Mercado Pago em PRODUÇÃO

## 📌 PROBLEMA ATUAL:
- Você tem credenciais de TESTE no backend
- Vendedor conectou com conta REAL (produção)
- Isso causa erro: **PXA39-1H82W4HVFQWT**

## ✅ SOLUÇÃO: Ativar credenciais de PRODUÇÃO

---

## 🔐 PASSO 1: Acessar o Painel do Mercado Pago

1. Entre em: **https://www.mercadopago.com.br/developers/panel/app**
2. Faça login com sua conta (herikramos.exe@gmail.com)
3. Você verá sua aplicação: **"Retrotrade"** ou similar

---

## 📋 PASSO 2: Verificar Status da Aplicação

Dentro da sua aplicação, procure por:

### ⚠️ Se vir "Modo Teste" ou "Test Mode":
- Sua aplicação está em **modo teste**
- Precisa ativar para produção

### ✅ Se vir "Modo Produção" ou "Production":
- Já está ativado
- Apenas copie as credenciais

---

## 🎯 PASSO 3: Ativar Modo Produção

### Opção A: Se houver botão "Ativar em Produção"

1. Clique em **"Ativar em Produção"** ou **"Go to Production"**
2. O Mercado Pago pode pedir para:
   - ✅ Confirmar informações da conta
   - ✅ Validar documentos (CPF/CNPJ)
   - ✅ Aceitar termos de uso

### Opção B: Se não houver botão visível

1. Procure no menu lateral:
   - **"Credenciais"** ou **"Credentials"**
   - **"Produção"** ou **"Production"**

2. Ou clique em **"Ver credenciais"** → Aba **"Produção"**

---

## 🔑 PASSO 4: Copiar Credenciais de PRODUÇÃO

Você precisa copiar **3 credenciais**:

### 1️⃣ APP_ID (Application ID)
```
Exemplo: 7944200079991706
```

### 2️⃣ CLIENT_SECRET
```
Exemplo: cSoaUCTD3H...
```

### 3️⃣ ACCESS_TOKEN (Token da Plataforma)
```
Exemplo: APP_USR-7944200079991706-...
```

⚠️ **IMPORTANTE:**
- **NÃO** copie as credenciais que têm "TEST" no nome
- Use apenas as da aba **"Produção"** ou **"Production"**
- O ACCESS_TOKEN de produção começa com `APP_USR-` (não com `TEST-`)

---

## 🌐 PASSO 5: Atualizar Credenciais no Render

### 5.1 Acesse o Render:
**https://dashboard.render.com**

### 5.2 Entre no seu serviço:
Clique em: **gamer-marketplace**

### 5.3 Vá em Environment:
Menu lateral → **"Environment"**

### 5.4 Atualize as 3 variáveis:

Clique em **"Edit"** ou no ícone de lápis de cada variável:

```bash
MERCADOPAGO_APP_ID
# Cole o APP_ID de produção (sem aspas)

MERCADOPAGO_CLIENT_SECRET
# Cole o CLIENT_SECRET de produção (sem aspas)

MERCADOPAGO_ACCESS_TOKEN
# Cole o ACCESS_TOKEN de produção (sem aspas)
```

### 5.5 Salve:
- Clique em **"Save Changes"**
- O Render vai **reiniciar automaticamente** (~2 minutos)

---

## 🔄 PASSO 6: Reconectar Conta do Vendedor

Agora que o backend tem credenciais de produção, o vendedor precisa reconectar:

### No App Mobile:

1. **Desconectar MP atual:**
   - Ir em Perfil/Configurações
   - "Desconectar Mercado Pago"

2. **Conectar novamente:**
   - Tentar vender um produto
   - Quando aparecer modal do MP
   - "Conectar Mercado Pago"
   - Fazer login com a mesma conta

Isso vai gerar um **novo token OAuth** usando as credenciais de produção.

---

## ✅ PASSO 7: Testar

Após ~2 minutos (tempo do deploy do Render):

### 7.1 Verificar credenciais:
```bash
curl https://gamer-marketplace.onrender.com/marketplace-diagnostic
```

Procure por:
```json
"✅ ACCESS_TOKEN configurado: APP_USR-794420..."
```
(deve começar com APP_USR, não TEST)

### 7.2 Testar preferência:
```bash
curl https://gamer-marketplace.onrender.com/test-mp-preference/4
```

Procure por:
```json
"init_point": "https://www.mercadopago.com.br/checkout/..."
```
(deve ser www.mercadopago.com.br, não sandbox)

### 7.3 Testar compra no app:
1. Fazer uma compra
2. Clicar em "Abrir no Navegador"
3. Deve abrir o checkout do MP sem erro

---

## 🆘 PROBLEMAS COMUNS

### ❌ "Não consigo encontrar credenciais de produção"

**Possíveis causas:**
1. Conta ainda não foi validada pelo MP
2. Precisa completar informações da conta
3. Aplicação não foi aprovada para produção

**Solução:**
- Entre em contato com suporte do MP
- Ou use **contas de teste** (veja abaixo)

---

### ❌ "Erro ao ativar produção"

O Mercado Pago pode exigir:
- ✅ Validação de identidade (CPF)
- ✅ Dados bancários cadastrados
- ✅ Verificação de e-mail/telefone

Complete esses passos no painel do MP.

---

### 🧪 ALTERNATIVA: Usar Contas de Teste (temporário)

Se não conseguir ativar produção agora, pode usar contas de teste:

1. No painel do MP, vá em **"Usuários de teste"**
2. Crie 2 usuários de teste:
   - Um vendedor
   - Um comprador
3. No app, faça login com usuário de teste
4. Conecte o MP usando credenciais de teste

**Limitação:** Pagamentos não são reais, só para testar.

---

## 📸 EXEMPLO VISUAL

Quando estiver correto, você verá:

```
Mercado Pago Developer Panel
├── Sua Aplicação: Retrotrade
├── Status: ✅ Produção Ativa
├── Credenciais
│   ├── 🧪 Teste (não usar)
│   └── 🚀 Produção (usar estas!)
│       ├── APP_ID: 7944200079991706
│       ├── CLIENT_SECRET: cSoaUC...
│       └── ACCESS_TOKEN: APP_USR-7944...
```

---

## 📞 PRÓXIMOS PASSOS APÓS CONFIGURAR

1. ✅ Testar compra completa no app
2. ✅ Verificar se pagamento aparece no painel do MP
3. ✅ Conferir se split está funcionando (5% plataforma, 95% vendedor)
4. ✅ Testar webhook de notificações

---

## 🎯 ME AVISE QUANDO:

- ✅ Conseguir copiar as credenciais de produção
- ⚠️ Tiver algum erro no painel do MP
- ❓ Tiver dúvidas sobre algum passo

Vou te ajudar em tempo real! 🚀
