"""
Google Gemini AI Client
Provides AI capabilities for game identification, content moderation, and video analysis
"""
import os
import base64
from typing import Optional, List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Google Gemini API configurada")
else:
    print("⚠️ GEMINI_API_KEY não configurada")


def identify_game_from_image(image_data: bytes, image_format: str = "jpeg") -> Dict[str, Any]:
    """
    Identify retro game from image using Gemini Vision

    Args:
        image_data: Binary image data
        image_format: Image format (jpeg, png, etc)

    Returns:
        dict with game information
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY não configurada")

    # Use Gemini 2.5 Flash (latest, fastest)
    model = genai.GenerativeModel('models/gemini-2.5-flash')

    prompt = """Você é um especialista em jogos retro (Atari, NES, SNES, Mega Drive, PlayStation 1/2, Nintendo 64, etc).

Analise esta imagem e identifique:

1. **Nome do Jogo** (título completo)
2. **Console/Plataforma** (ex: SNES, PlayStation 1, Mega Drive)
3. **Região** (NTSC-US, NTSC-J, PAL-BR, etc)
4. **Ano de Lançamento**
5. **Estado de Conservação** (Excelente, Bom, Regular, Ruim)
6. **Itens Visíveis** (cartucho, caixa, manual, etc)
7. **Valor Estimado** (em reais, faixa de preço atual no mercado brasileiro)
8. **Confiança** (0-100%): Quão certo você está da identificação?

Responda APENAS em formato JSON:
{
  "nome": "Nome do Jogo",
  "console": "Console",
  "regiao": "Região",
  "ano": 1995,
  "estado": "Bom",
  "itens": ["cartucho", "caixa"],
  "valor_min": 150.00,
  "valor_max": 250.00,
  "confianca": 95,
  "observacoes": "Comentários adicionais sobre o jogo ou estado"
}

Se não conseguir identificar com certeza, use confianca baixa (<50) e explique nas observacoes."""

    # Prepare image
    image_parts = [
        {
            "mime_type": f"image/{image_format}",
            "data": image_data
        }
    ]

    # Generate response
    response = model.generate_content([prompt, image_parts[0]])

    return {
        "text": response.text,
        "raw_response": response
    }


def analyze_product_content(title: str, description: str, category: str) -> Dict[str, Any]:
    """
    Analyze product content for inappropriate content or scams

    Returns:
        dict with moderation results
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY não configurada")

    model = genai.GenerativeModel('models/gemini-2.5-flash')

    prompt = f"""Você é um moderador de conteúdo para um marketplace de jogos retro.

Analise este anúncio e identifique problemas:

**Título**: {title}
**Descrição**: {description}
**Categoria**: {category}

Verifique:
1. Linguagem ofensiva ou inadequada
2. Possíveis golpes ou fraudes
3. Informações enganosas
4. Preços absurdos
5. Produtos proibidos

Responda em JSON:
{{
  "approved": true/false,
  "confidence": 0-100,
  "issues": ["lista de problemas encontrados"],
  "suggestions": ["sugestões de correção"],
  "reason": "Explicação detalhada"
}}"""

    response = model.generate_content(prompt)

    return {
        "text": response.text,
        "raw_response": response
    }


def discover_retro_gaming_events(state: str, city: Optional[str] = None) -> Dict[str, Any]:
    """
    Discover retro gaming events in Brazil

    Args:
        state: Brazilian state (ex: "Rio de Janeiro", "São Paulo")
        city: Optional city name

    Returns:
        dict with events information
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY não configurada")

    model = genai.GenerativeModel('models/gemini-2.5-flash')

    location = f"{city}, {state}" if city else state

    prompt = f"""Você é um especialista em eventos de cultura pop e jogos retro no Brasil.

Liste eventos de jogos retro, feiras de games antigos, encontros de colecionadores em: {location}

Inclua:
- Eventos recorrentes (mensais, anuais)
- Feiras de games retro
- Encontros de colecionadores
- Lojas especializadas que fazem eventos
- Bares/cafés temáticos de jogos retro

Responda em JSON:
{{
  "events": [
    {{
      "name": "Nome do Evento",
      "type": "feira/encontro/loja/bar",
      "location": "Local específico",
      "frequency": "mensal/anual/pontual",
      "description": "Descrição do evento",
      "estimated_date": "Mês/período aproximado",
      "contact": "Redes sociais ou contato se souber"
    }}
  ],
  "suggestions": ["Dicas adicionais para encontrar eventos na região"]
}}

Se não souber de eventos específicos, sugira como a pessoa pode procurar."""

    response = model.generate_content(prompt)

    return {
        "text": response.text,
        "raw_response": response
    }


def analyze_verification_video(
    video_frames_base64: List[str],
    product_images_base64: List[str],
    product_title: str,
    product_description: str
) -> Dict[str, Any]:
    """
    Analyze verification video frames against product photos

    Args:
        video_frames_base64: List of base64 encoded video frames
        product_images_base64: List of base64 encoded product photos
        product_title: Product title
        product_description: Product description

    Returns:
        dict with analysis results
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY não configurada")

    model = genai.GenerativeModel('models/gemini-2.5-flash')

    prompt = f"""Você é um verificador de autenticidade de produtos em marketplaces.

**Produto Anunciado:**
- Título: {product_title}
- Descrição: {product_description}

**Tarefa:**
Compare as fotos originais do anúncio com os frames do vídeo de verificação enviado pelo comprador.

Verifique:
1. O produto no vídeo é o mesmo das fotos?
2. Estado de conservação é compatível?
3. Há sinais de dano não mostrado nas fotos?
4. Todos os itens prometidos estão presentes?
5. Há sinais de falsificação ou produto diferente?

Responda em JSON:
{{
  "is_authentic": true/false,
  "match_percentage": 0-100,
  "issues_found": ["lista de problemas"],
  "condition_notes": ["observações sobre o estado"],
  "recommendation": "APPROVE/DISPUTE/NEEDS_REVIEW",
  "detailed_analysis": "Análise detalhada da comparação"
}}"""

    # Gemini can handle multiple images at once
    # For now, we'll use the first frame and first product image
    content_parts = [prompt]

    # Add first product image
    if product_images_base64:
        content_parts.append({
            "mime_type": "image/jpeg",
            "data": base64.b64decode(product_images_base64[0])
        })

    # Add first video frame
    if video_frames_base64:
        content_parts.append({
            "mime_type": "image/jpeg",
            "data": base64.b64decode(video_frames_base64[0])
        })

    response = model.generate_content(content_parts)

    return {
        "text": response.text,
        "raw_response": response
    }


def moderate_chat_message(message: str, room_context: str = "") -> Dict[str, Any]:
    """
    Moderate chat message for inappropriate content

    Args:
        message: Chat message text
        room_context: Optional context about the chat room

    Returns:
        dict with moderation results
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY não configurada")

    model = genai.GenerativeModel('models/gemini-2.5-flash')

    prompt = f"""Você é um moderador de chat para um marketplace de jogos retro.

Analise esta mensagem:
"{message}"

Contexto: {room_context if room_context else "Chat de negociação de produto"}

Verifique se contém:
1. Linguagem ofensiva ou discriminatória
2. Assédio ou ameaças
3. Tentativa de golpe (pedir contato externo, pagamento fora da plataforma)
4. Spam ou propaganda
5. Conteúdo sexual inadequado

Responda em JSON:
{{
  "is_appropriate": true/false,
  "severity": "low/medium/high",
  "issues": ["lista de problemas"],
  "action": "ALLOW/WARN/BLOCK/BAN",
  "reason": "Explicação"
}}"""

    response = model.generate_content(prompt)

    return {
        "text": response.text,
        "raw_response": response
    }
