# 🔐 Como Configurar e Usar OpenAI GPT no Backend

## Passo 1: Adicionar Sua API Key

**Edite o arquivo `.env`:**

```bash
cd /home/madeinweb/gamer-marketplace/backend
nano .env
```

**Adicione sua chave OpenAI:**
```env
# API Keys
ANTHROPIC_API_KEY=sua_chave_anthropic_aqui
OPENAI_API_KEY=sk-proj-SUA_NOVA_CHAVE_AQUI
```

**Salve e feche** (Ctrl+O, Enter, Ctrl+X)

⚠️ **NUNCA commite o arquivo `.env` no Git!**

---

## Passo 2: Verificar Instalação

A biblioteca já foi instalada:
```bash
pip list | grep openai
# Deve mostrar: openai 1.58.1
```

---

## Passo 3: Como Usar no Código

### Exemplo 1: Chatbot Simples

```python
import os
from openai import OpenAI

# Carregar do .env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

@app.post("/chat/ask")
async def chat_with_assistant(question: str):
    """Assistente virtual para dúvidas sobre retro games"""
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI API não configurada")

    response = openai_client.chat.completions.create(
        model="gpt-4o",  # ou "gpt-4o-mini" (mais barato)
        messages=[
            {
                "role": "system",
                "content": """Você é um especialista em jogos retro do Brasil.
                Responda em português brasileiro sobre:
                - Autenticidade de produtos
                - Valores de mercado (em R$)
                - Diferenças entre versões
                - História dos consoles no Brasil
                - Como identificar falsificações"""
            },
            {
                "role": "user",
                "content": question
            }
        ],
        max_tokens=500,
        temperature=0.7
    )

    return {
        "question": question,
        "answer": response.choices[0].message.content
    }
```

### Exemplo 2: Gerar Descrição de Produto

```python
@app.post("/products/generate-description")
async def generate_product_description(
    game_name: str,
    console: str,
    condition: int,
    has_box: bool,
    has_manual: bool
):
    """Gera descrição atrativa do produto usando GPT"""
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI API não configurada")

    prompt = f"""Escreva uma descrição atrativa para anúncio de venda:

Jogo: {game_name}
Console: {console}
Estado: {condition}/10
Caixa: {'Sim' if has_box else 'Não'}
Manual: {'Sim' if has_manual else 'Não'}

Crie uma descrição:
- Em português brasileiro
- Com emojis relevantes
- Destacando pontos fortes
- Informando completude
- Tom profissional mas amigável
- Máximo 200 palavras"""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",  # Mais barato para geração de texto
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.8
    )

    return {
        "description": response.choices[0].message.content
    }
```

### Exemplo 3: Análise de Autenticidade com Visão

```python
@app.post("/products/check-authenticity")
async def check_authenticity_gpt(file: UploadFile = File(...)):
    """Verifica autenticidade usando GPT-4 Vision"""
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI API não configurada")

    # Ler imagem e converter para base64
    image_data = await file.read()
    base64_image = base64.b64encode(image_data).decode('utf-8')

    response = openai_client.chat.completions.create(
        model="gpt-4o",  # Modelo com visão
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Analise esta imagem de jogo retro e identifique sinais de falsificação:

                        Verifique:
                        - Qualidade da impressão da label
                        - Cor e qualidade do plástico
                        - Parafusos (originais Nintendo usam GameBit)
                        - Fontes do texto
                        - Hologramas ou marcações especiais

                        Retorne:
                        1. Score de autenticidade (0-100)
                        2. Sinais de alerta encontrados
                        3. Elementos que indicam originalidade"""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=500
    )

    return {
        "analysis": response.choices[0].message.content
    }
```

---

## Passo 4: Atualizar main.py

Adicione no topo do `main.py`:

```python
from openai import OpenAI
import os

# Após carregar as env vars
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
```

---

## Comparação: Claude vs GPT-4

### Claude (Anthropic) - Já Implementado
✅ Melhor para análise de imagens complexas
✅ Respostas mais detalhadas e precisas
✅ Melhor contexto de conversa longa
💰 Preço: ~$3/milhão de tokens (input)

### GPT-4o (OpenAI)
✅ Mais rápido (especialmente gpt-4o-mini)
✅ Melhor para geração criativa de texto
✅ API mais madura e estável
💰 Preço: ~$2.50/milhão de tokens (gpt-4o-mini)

### Recomendação de Uso:

**Use Claude (atual) para:**
- 🔍 Identificação de jogos por foto
- 🔒 Análise de autenticidade detalhada
- 📊 Análise técnica de estado

**Use GPT-4o para:**
- 💬 Chatbot de suporte/assistente virtual
- 📝 Geração de descrições de produtos
- 🎨 Conteúdo criativo (posts no fórum)
- ⚡ Respostas rápidas (usando gpt-4o-mini)

---

## Modelos Disponíveis

| Modelo | Uso | Velocidade | Custo |
|--------|-----|------------|-------|
| `gpt-4o` | Visão + Chat | Rápido | Médio |
| `gpt-4o-mini` | Chat/Texto | Muito Rápido | Baixo |
| `gpt-4-turbo` | Chat avançado | Médio | Alto |

**Recomendação:** Use `gpt-4o-mini` para economia e velocidade!

---

## Custos Estimados

Exemplo de uso mensal (1000 requisições):

**Chatbot (gpt-4o-mini):**
- Input: 500 tokens/req × 1000 = 500k tokens
- Output: 200 tokens/req × 1000 = 200k tokens
- Custo: ~$0.15 input + ~$0.60 output = **$0.75/mês**

**Geração de Descrições (gpt-4o-mini):**
- Input: 200 tokens/req × 1000 = 200k tokens
- Output: 150 tokens/req × 1000 = 150k tokens
- Custo: ~$0.06 input + ~$0.45 output = **$0.51/mês**

💡 **Muito mais barato que contratar um atendente!**

---

## Segurança e Boas Práticas

### ✅ SEMPRE:
```python
# 1. Verificar se API key existe
if not openai_client:
    raise HTTPException(status_code=500, detail="OpenAI não configurado")

# 2. Limitar tokens para evitar custos altos
max_tokens=500  # Controla o gasto

# 3. Timeout para evitar travamentos
timeout=30  # segundos
```

### ❌ NUNCA:
```python
# ❌ Expor a API key
return {"api_key": OPENAI_API_KEY}

# ❌ Sem limite de tokens
max_tokens=None  # PERIGO! Custo ilimitado

# ❌ Input do usuário sem validação
prompt = user_input  # Pode conter prompt injection
```

---

## Teste Rápido

**Depois de adicionar sua chave no `.env`:**

```bash
# Reiniciar backend
cd /home/madeinweb/gamer-marketplace/backend
pkill -f "python.*main.py"
nohup python main.py > backend.log 2>&1 &

# Testar (se implementar um dos exemplos acima)
curl -X POST http://192.168.1.11:8000/chat/ask \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "Como identificar um cartucho fake de Super Nintendo?"}'
```

---

## Próximos Passos

Qual feature quer implementar com GPT?

1. **🤖 Assistente Virtual** - Chatbot especialista em retro games
2. **📝 Gerador de Descrições** - Cria descrições atrativas automaticamente
3. **💰 Consultor de Preços** - Analisa mercado e sugere preço ideal
4. **🎨 Moderador de Fórum** - Detecta spam e toxicidade

**Me diga qual quer e eu implemento!**
