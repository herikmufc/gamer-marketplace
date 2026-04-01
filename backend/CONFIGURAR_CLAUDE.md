# 🤖 Configurar Claude (Anthropic) - GRATUITO

## ✅ Código Já Adaptado!

Todo o código foi modificado para usar **Claude** ao invés de OpenAI GPT:
- ✅ Moderação de chat
- ✅ Descoberta de eventos
- ✅ Identificação de jogos (já estava usando Claude)

---

## 🎁 Vantagens do Claude

### Vs OpenAI GPT:

| Claude (Anthropic) | OpenAI GPT |
|--------------------|------------|
| ✅ **Créditos grátis** para novos usuários | ❌ Precisa adicionar cartão |
| ✅ Mais preciso em análises | ✅ Mais rápido |
| ✅ Melhor contexto longo | ✅ API mais madura |
| ✅ Respostas mais detalhadas | ✅ Mais modelos |
| 💰 ~$3/milhão tokens (input) | 💰 ~$2.50/milhão (gpt-4o-mini) |

---

## 🔑 Como Obter API Key do Claude (GRÁTIS)

### 1. Criar Conta na Anthropic

1. Acesse: **https://console.anthropic.com/**
2. Clique em **"Sign Up"**
3. Cadastre-se com email
4. Verifique seu email

### 2. Obter Créditos Gratuitos

**Boas notícias:** Anthropic oferece créditos gratuitos para novos usuários!

- 💰 **$5 em créditos iniciais**
- 🚀 Suficiente para **~1.6 milhão de tokens**
- ⏰ Válido por alguns meses

**O que dá para fazer com $5:**
- ~500 identificações de jogos por foto
- ~2000 moderações de chat
- ~100 descobertas de eventos

### 3. Criar API Key

1. No console: https://console.anthropic.com/
2. Navegue para **"API Keys"** no menu lateral
3. Clique em **"Create Key"**
4. Dê um nome: `retrotrade-brasil`
5. **COPIE A CHAVE** (começa com `sk-ant-api...`)
6. ⚠️ **Não compartilhe essa chave!**

---

## 📝 Configurar no Projeto

### 1. Adicionar Chave no `.env`

```bash
nano /home/madeinweb/gamer-marketplace/backend/.env
```

**Encontre a linha:**
```env
ANTHROPIC_API_KEY=
```

**Cole sua chave:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-SUA_CHAVE_AQUI
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 2. Reiniciar Backend

```bash
/home/madeinweb/gamer-marketplace/backend/start_backend.sh
```

---

## 🧪 Testar se Funciona

### Teste 1: Backend Rodando

```bash
curl http://192.168.1.11:8000/
```

Deve retornar: `{"message":"RetroTrade Brasil API v2.0",...}`

### Teste 2: Moderação de Chat

```bash
curl -X POST http://192.168.1.11:8000/chat/moderate-message \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "message_content": "Faz PIX direto pra mim sem taxa?"
  }'
```

**Esperado:**
```json
{
  "is_suspicious": true,
  "risk_score": 75,
  "alert_type": "payment_outside",
  "should_block": true,
  "description": "Tentativa de pagamento fora da plataforma"
}
```

### Teste 3: Identificação de Jogo

Já funciona! Endpoint: `/products/identify`

---

## 💰 Monitorar Uso

**Dashboard de uso:**
https://console.anthropic.com/settings/usage

**Ver:**
- Créditos restantes
- Requisições feitas
- Tokens consumidos
- Custo por dia

---

## 📊 Custos Estimados (Após Créditos Gratuitos)

### Uso Médio Mensal:

**Moderação de Chat (1000 mensagens):**
- Input: ~200 tokens/msg × 1000 = 200k tokens
- Output: ~100 tokens/msg × 1000 = 100k tokens
- Custo: ~$0.60 input + ~$1.50 output = **~$2.10/mês**

**Descoberta de Eventos (20 buscas):**
- Input: ~500 tokens/busca × 20 = 10k tokens
- Output: ~800 tokens/busca × 20 = 16k tokens
- Custo: ~$0.03 input + ~$0.24 output = **~$0.27/mês**

**Identificação de Jogos (100 fotos):**
- Cada foto ~1000 tokens
- Custo: **~$0.30/mês**

**TOTAL:** ~$2.67/mês

**Muito barato para o valor entregue!**

---

## 🔐 Segurança

### ✅ SEMPRE:
- Guardar chave no `.env`
- Adicionar `.env` no `.gitignore`
- Nunca commitar chaves
- Revogar chaves expostas

### ❌ NUNCA:
- Compartilhar chave em chat/email
- Postar chave em GitHub
- Deixar chave em código público
- Usar mesma chave em vários projetos

---

## 🆘 Problemas Comuns

### "Claude API não configurada"
**Solução:** Verificar se `ANTHROPIC_API_KEY` está no `.env` e reiniciar backend

### "Invalid API key"
**Solução:** Chave incorreta ou revogada. Criar nova em console.anthropic.com

### "Rate limit exceeded"
**Solução:** Aguardar 1 minuto. Se persistir, você pode estar no tier gratuito com limites mais baixos.

### "Insufficient credits"
**Solução:** Créditos gratuitos acabaram. Adicionar cartão e comprar créditos.

---

## 🎯 Próximos Passos

1. ✅ **Criar conta Anthropic**
2. ✅ **Obter API key**
3. ✅ **Adicionar no `.env`**
4. ✅ **Reiniciar backend**
5. ✅ **Testar moderação**
6. 🚀 **Implementar no mobile**

---

## 🤝 Suporte

**Console Anthropic:**
https://console.anthropic.com/

**Documentação:**
https://docs.anthropic.com/

**Preços:**
https://www.anthropic.com/pricing

**Status da API:**
https://status.anthropic.com/
