# 🤖 Features de IA - Documentação Técnica

## Visão Geral

O Gamer Marketplace usa **Claude 4.6 Sonnet** da Anthropic para análise visual e precificação inteligente de produtos.

## 1. Análise Visual de Condição

### Tecnologia
- **Modelo**: Claude 4.6 Sonnet (Vision)
- **Input**: 1-5 imagens do produto
- **Output**: Score de condição (0-100) + análise detalhada

### O que a IA Analisa

```python
{
  "condition_score": 85.0,  # Score geral
  "condition_details": {
    "carcaca_score": 80,     # Estado físico
    "issues": [
      "Leve amarelamento no topo",
      "Arranhão superficial lateral direita"
    ],
    "positives": [
      "Sem rachaduras",
      "Labels originais intactos"
    ]
  },
  "autenticidade": {
    "is_authentic": true,     # Detecta falsificações
    "confidence": 0.95,       # Confiança (0-1)
    "markers": [
      "Molde correto",
      "Logo autêntico",
      "Código de série válido"
    ]
  },
  "completude_impact": -15,   # Impacto no preço (%)
  "recommendations": [
    "Adicione foto do manual",
    "Mostre código de série melhor"
  ]
}
```

### Critérios de Avaliação

| Aspecto | Peso | Descrição |
|---------|------|-----------|
| **Carcaça** | 40% | Arranhões, rachaduras, deformações |
| **Amarelamento** | 15% | Oxidação do plástico |
| **Labels/Adesivos** | 20% | Estado dos adesivos originais |
| **Autenticidade** | 15% | Verificação de falsificação |
| **Limpeza** | 10% | Sujeira, pó acumulado |

### Prompt Usado

```python
f"""Você é um especialista em avaliação de produtos gamer vintage.
Analise as imagens deste produto: {product_info['title']}

Categoria: {product_info['category']}
Console: {product_info.get('console_type', 'N/A')}
Funciona: {product_info.get('is_working', 'Não testado')}
Completo (CIB): {product_info.get('is_complete', False)}

Forneça uma análise DETALHADA em JSON com:
1. condition_score (0-100): Estado físico geral
2. condition_details: Problemas e pontos positivos
3. autenticidade: Verificação de originalidade
4. completude_impact: Impacto da falta de itens (%)
5. recommendations: Sugestões para o vendedor

Retorne APENAS JSON válido."""
```

## 2. Cálculo de Raridade

### Algoritmo

```python
def calcular_raridade(product_info):
    score = 50.0  # Base score

    # 1. Console raro (+30 pontos)
    rare_consoles = [
        "dreamcast", "saturn", "neo geo",
        "turbografx", "atari jaguar", "3do"
    ]
    if console in rare_consoles:
        score += 30

    # 2. Edição especial (+30 pontos)
    if "limited" or "collector" in title:
        score += 30

    # 3. Completude
    if is_complete:  # CIB
        score += 15
    if has_box:
        score += 10
    if has_manual:
        score += 5

    # 4. Região (importado)
    if regiao != "Brasil":
        score += 15

    # 5. Demanda vs Oferta (futuro)
    # ratio = buscas_mensais / anuncios_ativos
    # score += min(ratio * 10, 20)

    return min(score, 100.0)
```

### Categorias de Raridade

| Score | Categoria | Descrição |
|-------|-----------|-----------|
| 90-100 | Raríssimo | Consoles/jogos extremamente raros |
| 70-89 | Raro | Difícil de encontrar |
| 50-69 | Incomum | Menos comum no mercado |
| 30-49 | Comum | Facilmente encontrado |
| 0-29 | Muito Comum | Abundante no mercado |

## 3. Precificação Inteligente

### Fórmula Completa

```python
# Base price por categoria
base_prices = {
    "console": 300,
    "game": 80,
    "peripheral": 50
}

base = base_prices[category]

# Multiplicador de condição
condition_mult = condition_score / 70  # 70 = baseline "bom estado"

# Multiplicador de raridade
rarity_mult = 1 + (rarity_score / 100)

# Ajuste de funcionalidade
if not is_working:
    condition_mult *= 0.3  # -70% se não funciona
elif not tested:
    condition_mult *= 0.8  # -20% se não testado

# Bonus de completude
if is_complete:      # CIB
    condition_mult *= 1.4  # +40%
elif has_box:
    condition_mult *= 1.2  # +20%

# Cálculo final
ideal_price = base * condition_mult * rarity_mult

return {
    "min": ideal_price * 0.85,    # -15%
    "ideal": ideal_price,
    "max": ideal_price * 1.20,    # +20%
    "confidence": 0.75
}
```

### Exemplos Reais

#### Exemplo 1: PS2 Slim em Bom Estado
```
Inputs:
- Categoria: console
- Condição: 78/100
- Raridade: 45/100
- Funciona: Sim
- Completo: Não
- Com caixa: Sim

Cálculo:
base = 300
condition_mult = 78/70 = 1.11
rarity_mult = 1 + (45/100) = 1.45
box_bonus = 1.2

price = 300 * 1.11 * 1.45 * 1.2 = 580

Output:
min: R$ 493
ideal: R$ 580
max: R$ 696
```

#### Exemplo 2: Jogo Raro Lacrado
```
Inputs:
- Categoria: game
- Condição: 95/100 (lacrado)
- Raridade: 85/100
- Completo: Sim (lacrado)

Cálculo:
base = 80
condition_mult = 95/70 = 1.36
rarity_mult = 1 + (85/100) = 1.85
sealed_bonus = 1.4

price = 80 * 1.36 * 1.85 * 1.4 = 282

Output:
min: R$ 240
ideal: R$ 282
max: R$ 338
```

## 4. Insights Gerados

### Tipos de Insights

```python
insights = []

# Condição
if condition_score >= 85:
    insights.append("⭐ Excelente estado! Você pode cobrar acima da média")
elif condition_score >= 70:
    insights.append("👍 Bom estado, preço competitivo")
elif condition_score < 60:
    insights.append("⚠️ Estado comprometido pode dificultar venda")

# Raridade
if rarity_score >= 80:
    insights.append("🔥 Item muito raro! Alta demanda no mercado")
elif rarity_score >= 60:
    insights.append("💎 Item raro, espere por bom preço")

# Completude
if not has_box and category == "console":
    insights.append("📦 Adicionar caixa original aumentaria valor em 20%")

# Fotos
if len(images) < 4:
    insights.append("📸 Adicione mais fotos para aumentar confiança do comprador")

# Descrição
if len(description) < 100:
    insights.append("✍️ Descrição detalhada aumenta chances de venda")

# Sazonalidade (futuro)
if is_holiday_season():
    insights.append("🎄 Alta demanda no período de festas, preço pode subir")

return insights
```

### Probabilidade de Venda

```python
def estimate_sell_probability(price, ideal_price):
    ratio = price / ideal_price

    if ratio <= 0.85:
        return {
            "probability": 0.95,
            "time_days": 7,
            "message": "Preço muito competitivo, venda rápida"
        }
    elif ratio <= 1.0:
        return {
            "probability": 0.80,
            "time_days": 14,
            "message": "Preço justo, venda provável"
        }
    elif ratio <= 1.20:
        return {
            "probability": 0.50,
            "time_days": 30,
            "message": "Preço alto, pode levar tempo"
        }
    else:
        return {
            "probability": 0.20,
            "time_days": 60,
            "message": "Preço muito alto, difícil vender"
        }
```

## 5. Melhorias Futuras

### Fase 2: Machine Learning
```python
# Treinar modelo com dados reais
from sklearn.ensemble import RandomForestRegressor

features = [
    'condition_score',
    'rarity_score',
    'is_working',
    'is_complete',
    'days_since_release',
    'search_volume',
    'active_listings'
]

model = RandomForestRegressor()
model.fit(X_train, y_train)  # y = preço de venda real

predicted_price = model.predict(new_product)
```

### Fase 3: Histórico de Preços
```python
# Scraping de marketplaces
price_history = {
    "product_id": "ps2-slim-silver",
    "prices": [
        {"date": "2024-01", "avg": 280, "min": 220, "max": 350},
        {"date": "2024-02", "avg": 295, "min": 230, "max": 380},
        # ...
    ],
    "trend": "increasing",
    "volatility": 0.15
}

# Previsão de preço futuro
future_price = predict_price_trend(price_history, months=3)
```

### Fase 4: Análise de Mercado Real-Time
```python
# Integração com APIs
sources = [
    MercadoLivreAPI(),
    OLXScraper(),
    PriceChartingAPI(),
    eBayAPI()
]

market_data = aggregate_prices(sources, product_name)
dynamic_price = adjust_price_based_on_market(
    base_price=calculated_price,
    market_data=market_data,
    urgency=user_urgency
)
```

## 6. Custos de IA

### Claude API Pricing (2024)

| Modelo | Input | Output |
|--------|-------|--------|
| Claude 4.6 Sonnet | $3/MTok | $15/MTok |

### Custo por Análise

```
Análise típica:
- Prompt: ~500 tokens
- 4 imágenes (1024x1024): ~5000 tokens
- Response: ~1000 tokens

Total Input: ~5500 tokens
Total Output: ~1000 tokens

Custo:
Input: (5500/1M) * $3 = $0.0165
Output: (1000/1M) * $15 = $0.015
Total: ~$0.031 por análise
```

### Otimizações de Custo

1. **Redimensionar imagens**: 1024x1024 → 512x512 (-75% tokens)
2. **Limitar imagens**: 5 → 3 (-40% tokens)
3. **Cache de resultados**: Evitar re-análises
4. **Batch processing**: Analisar múltiplos produtos juntos

## 7. Performance

### Tempos de Resposta

| Operação | Tempo Médio |
|----------|-------------|
| Análise Visual (4 imgs) | 15-30s |
| Cálculo de Raridade | <0.1s |
| Precificação | <0.1s |
| Total (end-to-end) | 15-30s |

### Otimizações

```python
# 1. Processamento paralelo
async def analyze_multiple_products(products):
    tasks = [analyze_product(p) for p in products]
    results = await asyncio.gather(*tasks)
    return results

# 2. Cache de análises
@cache(ttl=3600)
def get_rarity_score(console_type):
    # Evita recalcular para cada produto do mesmo console
    return calculate_rarity(console_type)

# 3. Compressão de imagens
def optimize_image(image):
    img = Image.open(image)
    img.thumbnail((800, 800))  # Menor = mais rápido
    return img
```

## 8. Precisão e Confiabilidade

### Métricas de Qualidade

```python
# Confidence score baseado em:
confidence = base_confidence * quality_factors

quality_factors = {
    "num_images": min(num_images / 4, 1.0),      # 4+ imagens = 100%
    "image_quality": image_resolution / 1024,    # Alta res = melhor
    "completude": 1.0 if is_complete else 0.8,   # CIB = mais preciso
    "market_data": 1.0 if has_sold_listings else 0.7
}
```

### Validação

```python
# A cada venda, aprender com preço real
def record_sale(product_id, final_price, days_to_sell):
    predicted = get_prediction(product_id)
    error = abs(predicted - final_price) / final_price

    # Feedback loop para melhorar modelo
    if error > 0.20:  # Erro > 20%
        retrain_model(product_id, final_price)
```

---

**A IA melhora continuamente com mais dados e feedback do mercado!** 🚀
