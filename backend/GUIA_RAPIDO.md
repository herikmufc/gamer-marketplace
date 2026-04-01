# 🚀 Guia Rápido - Configurar OpenAI GPT

## ✅ O que já está pronto:
- ✅ OpenAI instalado no `venv`
- ✅ Campo `OPENAI_API_KEY` no `.env`
- ✅ Script automático `start_backend.sh`

---

## 🔑 3 Passos Simples

### 1️⃣ Obter Nova API Key

⚠️ **Primeiro revogue a chave antiga que você postou!**

1. Acesse: https://platform.openai.com/api-keys
2. Revogue a chave antiga (botão vermelho)
3. Clique **"+ Create new secret key"**
4. Copie a nova chave (começa com `sk-proj-`)

---

### 2️⃣ Adicionar no `.env`

```bash
nano /home/madeinweb/gamer-marketplace/backend/.env
```

Edite a linha:
```env
OPENAI_API_KEY=sk-proj-COLE_SUA_CHAVE_AQUI
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

### 3️⃣ Reiniciar Backend

**Opção A - Script Automático (RECOMENDADO):**
```bash
/home/madeinweb/gamer-marketplace/backend/start_backend.sh
```

**Opção B - Manual:**
```bash
cd /home/madeinweb/gamer-marketplace/backend
pkill -f "python.*main.py"
source venv/bin/activate && nohup python main.py > backend.log 2>&1 &
```

---

## ✅ Verificar se Funcionou

```bash
curl http://192.168.1.11:8000/
```

**Deve retornar:**
```json
{"message":"RetroTrade Brasil API v2.0", ...}
```

---

## 🧪 Testar OpenAI (Opcional)

```bash
cd /home/madeinweb/gamer-marketplace/backend
source venv/bin/activate
python test_openai.py
```

---

## 🎯 Depois de Configurar

**Me avise quando terminar!** Vou implementar a feature de IA que você escolher:

### Opções:

**1. 🤖 Assistente Virtual**
- Chatbot especialista em retro games
- Responde dúvidas de compradores/vendedores
- Conhece mercado brasileiro

**2. 📝 Gerador de Descrições**
- Cria descrições atrativas automaticamente
- Usuário só preenche dados básicos
- IA escreve texto profissional

**3. 💰 Consultor de Preços**
- Analisa mercado em tempo real
- Sugere preço ideal
- Compara com anúncios similares

**4. 🛡️ Moderador de Fórum**
- Detecta spam e toxicidade
- Auto-responde perguntas frequentes
- Sugere categorias corretas

---

## 💡 Dica

**Comece com #1 (Assistente Virtual)**
- ✅ Fácil de implementar
- ✅ Impacto imediato
- ✅ Barato (gpt-4o-mini)
- ✅ Usuários vão adorar!

---

## 🆘 Problemas?

**Backend não inicia:**
```bash
tail -50 /home/madeinweb/gamer-marketplace/backend/backend.log
```

**Ver se está rodando:**
```bash
ps aux | grep "python.*main.py"
```

**Parar backend:**
```bash
pkill -f "python.*main.py"
```
