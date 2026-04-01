# 🔑 Configurar API Key do OpenAI (GPT)

## ✅ OpenAI já está instalado no venv!

A biblioteca `openai==1.58.1` já foi instalada dentro do ambiente virtual.

---

## 📝 Passo a Passo

### 1. Obter Nova API Key (Segura)

**⚠️ IMPORTANTE: Revogue a chave antiga primeiro!**

1. Acesse: https://platform.openai.com/api-keys
2. Revogue a chave que você postou (termina em `...hF0IA`)
3. Clique em **"Create new secret key"**
4. Nome: `retrotrade-brasil`
5. **Copie a chave** (formato: `sk-proj-...`)

---

### 2. Adicionar Chave no Arquivo `.env`

```bash
cd /home/madeinweb/gamer-marketplace/backend
nano .env
```

**Encontre a linha:**
```env
OPENAI_API_KEY=
```

**Substitua por:**
```env
OPENAI_API_KEY=sk-proj-SUA_CHAVE_AQUI
```

**Salvar e Sair:**
- Pressione `Ctrl + O` (salvar)
- Pressione `Enter` (confirmar)
- Pressione `Ctrl + X` (sair)

---

### 3. Reiniciar o Backend (Usando o venv)

```bash
# Parar backend atual
pkill -f "python.*main.py"

# Navegar até a pasta
cd /home/madeinweb/gamer-marketplace/backend

# Ativar venv e rodar backend
source venv/bin/activate && nohup python main.py > backend.log 2>&1 &

# Verificar se está rodando
sleep 2
curl -s http://192.168.1.11:8000/ | grep "RetroTrade"
```

**Resultado esperado:**
```json
{"message":"RetroTrade Brasil API v2.0","features":["Chat","Forum","CPF","Legal Terms"]}
```

---

### 4. Verificar Instalação do OpenAI

```bash
cd /home/madeinweb/gamer-marketplace/backend
source venv/bin/activate
pip list | grep openai
```

**Deve mostrar:**
```
openai    1.58.1
```

---

## 🧪 Teste Rápido (Após Configurar)

Crie um arquivo de teste:

```bash
cd /home/madeinweb/gamer-marketplace/backend
nano test_openai.py
```

**Cole este código:**
```python
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("❌ OPENAI_API_KEY não encontrada no .env")
    exit(1)

print(f"✅ API Key encontrada: {api_key[:10]}...{api_key[-4:]}")

try:
    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": "Diga 'Olá' em uma palavra"}
        ],
        max_tokens=10
    )

    print(f"✅ OpenAI funcionando!")
    print(f"Resposta: {response.choices[0].message.content}")

except Exception as e:
    print(f"❌ Erro: {e}")
```

**Executar teste:**
```bash
source venv/bin/activate
python test_openai.py
```

**Resultado esperado:**
```
✅ API Key encontrada: sk-proj-hr...F0IA
✅ OpenAI funcionando!
Resposta: Olá
```

---

## 🎯 Próximo Passo

Depois que você:
1. ✅ Revogou a chave antiga
2. ✅ Criou nova chave
3. ✅ Adicionou no `.env`
4. ✅ Testou e funcionou

**Me avise e eu implemento a feature de IA que você escolher:**

1. 🤖 **Assistente Virtual** (Chatbot especialista)
2. 📝 **Gerador de Descrições** (Descrições automáticas)
3. 💰 **Consultor de Preços** (Análise de mercado)
4. 🛡️ **Moderador de Fórum** (Detecta spam)

---

## ⚠️ Segurança

### ✅ SEMPRE:
- Manter `.env` no `.gitignore`
- Nunca commitar chaves no Git
- Revogar chaves expostas imediatamente
- Usar variáveis de ambiente

### ❌ NUNCA:
- Compartilhar chaves em chat/email
- Postar chaves em fóruns
- Deixar chaves em código público
- Usar mesma chave em vários projetos

---

## 💰 Monitorar Uso

Acompanhe seus gastos:
https://platform.openai.com/usage

**Dica:** Configure limite de gasto mensal para evitar surpresas!

---

## 🆘 Problemas Comuns

### Erro: "API key not found"
**Solução:** Verificar se adicionou no `.env` e reiniciou backend

### Erro: "Invalid API key"
**Solução:** Chave pode estar incorreta ou revogada. Criar nova.

### Erro: "Rate limit exceeded"
**Solução:** Aguardar 1 minuto ou aumentar tier da conta OpenAI

### Backend não inicia
**Solução:**
```bash
# Ver logs de erro
tail -50 /home/madeinweb/gamer-marketplace/backend/backend.log
```

---

## 📚 Recursos

- **Documentação OpenAI:** https://platform.openai.com/docs
- **Preços:** https://openai.com/pricing
- **Status da API:** https://status.openai.com/
