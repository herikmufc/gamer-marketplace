# 🤖 Feature: Identificação Automática de Jogos por IA

## 📋 Visão Geral

Primeira funcionalidade de IA implementada no RetroTrade Brasil! Permite que usuários tirem uma foto de um jogo retro e recebam automaticamente:

- ✅ Identificação completa do jogo
- ✅ Console e região (NTSC/PAL/NTSC-J)
- ✅ Análise de estado de conservação
- ✅ Estimativa de preço no mercado brasileiro
- ✅ Verificação de autenticidade
- ✅ Análise de raridade no Brasil

---

## 🎯 Diferenciais

### Único no Brasil
Nenhum marketplace brasileiro possui identificação automática de jogos retro por IA!

### Especializado em Retro Games
- Conhecimento específico sobre consoles clássicos
- Preços em REAIS (R$)
- Raridade considerando mercado BRASILEIRO
- Identifica versões: Original, Greatest Hits, Limited Edition

### Detector de Falsificações
A IA analisa sinais de produtos fake:
- Qualidade da label/impressão
- Cor do plástico
- Parafusos (Nintendo usa GameBit especial)
- Fontes do texto

---

## 🏗️ Implementação Técnica

### Backend: `/products/identify`

**Arquivo:** `/home/madeinweb/gamer-marketplace/backend/main.py`

**Tecnologia:** Claude 4.6 Sonnet Vision API

**Endpoint:**
```python
@app.post("/products/identify")
async def identify_game_by_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
)
```

**Prompt Especializado:**
- 20 anos de experiência em colecionismo
- Análise detalhada em 8 pontos:
  1. Identificação (nome, console, região, versão)
  2. Estado de conservação (1-10)
  3. Completude (caixa, manual, extras)
  4. Raridade no Brasil
  5. Autenticidade (score 0-100 + análise)
  6. Preço estimado em R$
  7. Análise de mercado brasileiro
  8. Confiança na identificação (0-100)

**Resposta JSON:**
```json
{
  "game_name": "Chrono Trigger",
  "console": "Super Nintendo",
  "region": "NTSC-U",
  "version": "Original",
  "condition_score": 8,
  "has_box": true,
  "has_manual": true,
  "has_extras": ["cartão de registro"],
  "rarity": "Muito Raro",
  "estimated_price": "R$ 450-550",
  "authenticity_score": 85,
  "authenticity_notes": "Label autêntica, parafusos corretos...",
  "market_analysis": "Alta demanda no Brasil, preço em alta...",
  "confidence": 95
}
```

### Mobile: `IdentifyGameScreen`

**Arquivo:** `/home/madeinweb/gamer-marketplace/mobile/src/screens/IdentifyGameScreen.js`

**Features:**
- 📷 Tirar foto com câmera
- 🖼️ Selecionar da galeria
- 🔍 Preview da imagem antes de enviar
- ⏳ Loading durante análise (30s timeout)
- 📊 Resultados visuais com cards

**Resultados Exibidos:**
1. **Nome do jogo** - Destaque principal
2. **Console e Região** - Side by side
3. **Versão e Estado** - Score visual
4. **Completude** - Checkboxes (caixa, manual, extras)
5. **Raridade** - Badge colorido (verde → amarelo → laranja → vermelho)
6. **Preço Estimado** - Destaque em verde R$
7. **Autenticidade** - Barra de progresso colorida + notas
8. **Análise de Mercado** - Texto descritivo
9. **Confiança** - Score da IA

**Ação Final:**
Botão "✨ Criar Anúncio com Estes Dados" → Pré-preenche formulário de venda

### API Client

**Arquivo:** `/home/madeinweb/gamer-marketplace/mobile/src/api/client.js`

**Método:** `products.identifyGame(imageUri)`

```javascript
identifyGame: async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type: 'image/jpeg'
  });

  const response = await apiClient.post('/products/identify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000, // Claude Vision pode demorar
  });

  return response.data;
}
```

### Integração na Home

**Banner Promocional na HomeScreen:**

```jsx
<TouchableOpacity onPress={() => navigation.navigate('IdentifyGame')}>
  <View>
    <Text>🤖 Identificação por IA</Text>
    <Text>Tire foto e descubra o jogo, preço e raridade</Text>
  </View>
</TouchableOpacity>
```

Destaque visual:
- Borda azul (#4a9eff)
- Ícone 🤖
- Chamada para ação clara

---

## 🎨 Design System

### Cores por Raridade
```javascript
Comum: #4caf50 (verde)
Raro: #ffd600 (amarelo)
Muito Raro: #ff9100 (laranja)
Extremamente Raro: #ff1744 (vermelho)
```

### Cores por Autenticidade
```javascript
85-100: #4caf50 (verde) - Muito provavelmente original
70-84: #ffd600 (amarelo) - Possivelmente original
50-69: #ff9100 (laranja) - Suspeito
0-49: #ff1744 (vermelho) - Provavelmente falsificado
```

---

## 📱 Fluxo do Usuário

1. **Home Screen** → Clica no banner "🤖 Identificação por IA"
2. **IdentifyGameScreen** → Escolhe "📷 Tirar Foto" ou "🖼️ Galeria"
3. **Preview** → Visualiza imagem selecionada
4. **Identificar** → Clica "🤖 Identificar com IA"
5. **Loading** → Aguarda análise (pode levar até 30s)
6. **Resultados** → Visualiza análise completa com todos os detalhes
7. **Ação** → Opcionalmente cria anúncio com dados pré-preenchidos

---

## 🔐 Segurança

- ✅ Endpoint protegido (requer autenticação)
- ✅ Validação de tipo de arquivo
- ✅ Timeout de 30 segundos
- ✅ Tratamento de erros robusto
- ✅ Conversão segura para base64

---

## 🚀 Próximas Melhorias

### Fase 1 - Aprimoramentos Básicos
1. Salvar histórico de identificações do usuário
2. Permitir re-identificação se resultado incorreto
3. Cache de identificações recentes

### Fase 2 - Funcionalidades Avançadas
4. Identificar múltiplos jogos em uma foto (coleção)
5. Comparar preço com anúncios similares no marketplace
6. Sugerir preço ideal baseado em vendas recentes

### Fase 3 - Integração Premium
7. Auto-criar anúncio completo (título + descrição + preço)
8. Alertar vendedor se preço está muito baixo
9. Badge "✅ Verificado pela IA" em anúncios identificados

---

## 📊 Métricas Sugeridas

- Número de identificações por usuário
- Taxa de sucesso da identificação (confidence > 80%)
- Tempo médio de resposta da IA
- Conversão: identificação → anúncio criado
- Jogos mais identificados
- Consoles mais populares

---

## 🐛 Troubleshooting

### Erro: "Claude API não configurada"
**Solução:** Verificar variável `ANTHROPIC_API_KEY` no `.env`

### Erro: "Timeout"
**Solução:** Aumentar timeout para 45s ou 60s em casos complexos

### Erro: "Não foi possível identificar"
**Causas possíveis:**
- Foto muito escura/borrada
- Ângulo ruim
- Produto muito danificado
- Produto muito obscuro/raro

**Solução:** IA retorna `raw_response` com explicação

### Resultado incorreto
**Ação:** Adicionar feedback do usuário para melhorar prompt

---

## 📝 Changelog

### v2.1.0 (Atual)
- ✅ Endpoint backend `/products/identify`
- ✅ Screen `IdentifyGameScreen` no mobile
- ✅ Integração com Claude 4.6 Sonnet Vision
- ✅ Banner promocional na Home
- ✅ Análise completa com 8 pontos
- ✅ Design system com cores por raridade/autenticidade
- ✅ Botão para criar anúncio com dados pré-preenchidos

---

## 💡 Inspiração (do IA_MELHORIAS_RETRO_GAMES.md)

Esta foi a **Feature #1** da lista de melhorias com IA:

> **1. 🔍 Identificação Automática de Jogos por Foto**
>
> **O QUE:** Usuário tira foto de um cartucho/CD/caixa e a IA identifica automaticamente
>
> **POR QUE É DIFERENTE:** Nenhum marketplace brasileiro tem isso!
>
> **VALOR PARA O USUÁRIO:**
> - Vende mais rápido (cadastro automático)
> - Evita erros de digitação
> - Descobre raridades que não conhecia
> - Preço justo automaticamente

**Status:** ✅ IMPLEMENTADO

---

## 🎯 Próxima Feature Sugerida

**Feature #2:** Assistente Virtual Especialista em Retro

Chatbot que responde perguntas como:
- "Esse jogo é original?"
- "Quanto vale meu Super Nintendo completo?"
- "Como identificar um cartucho fake?"

**Diferencial:** Conhecimento brasileiro (preços R$, raridade regional)
