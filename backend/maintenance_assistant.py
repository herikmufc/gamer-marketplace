"""
Maintenance Assistant - AI-powered console repair chatbot
Helps users diagnose and fix retro gaming consoles and peripherals
"""
import os
import base64
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class MaintenanceAssistant:
    """
    AI assistant specialized in retro console maintenance and repair
    """

    def __init__(self):
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
        self.conversation_history = []
        self.system_prompt = """Você é um técnico especialista em manutenção e reparo de consoles retro com 25 anos de experiência.

Você ajuda usuários a:
- Diagnosticar problemas em consoles (Atari, NES, SNES, Mega Drive, PlayStation 1/2, Nintendo 64, Dreamcast, etc)
- Identificar defeitos por fotos e vídeos
- Fornecer instruções passo a passo para reparos
- Recomendar ferramentas e peças necessárias
- Avisar sobre riscos e quando procurar um profissional

IMPORTANTE:
- Sempre priorize a SEGURANÇA do usuário
- Avise sobre riscos de choque elétrico
- Explique de forma clara e didática
- Pergunte sobre sintomas específicos
- Peça fotos/vídeos quando necessário
- Seja honesto se o reparo for muito complexo
- Sugira técnicos profissionais quando necessário

CONSOLES COMUNS NO BRASIL:
- Atari 2600 (década de 80)
- Master System (Tec Toy)
- Mega Drive (Tec Toy)
- Super Nintendo (Playtronic)
- Nintendo 64
- PlayStation 1 (vários modelos: 1001, 5001, 7001, 9001)
- PlayStation 2 (fat e slim)
- Game Boy, Game Boy Color, Game Boy Advance

PROBLEMAS COMUNS:
- Não liga
- Não lê jogos/CDs
- Sem imagem/som
- Superaquecimento
- Controle não funciona
- Cartucho sujo
- Lente suja/desalinhada
- Capacitores estourados
- Trilha rompida"""

    def start_conversation(self, console_type: str = None) -> str:
        """Start a new maintenance conversation"""
        greeting = """👋 Olá! Sou seu assistente de manutenção de consoles retro.

Estou aqui para ajudar com:
🔧 Diagnóstico de problemas
🛠️ Instruções de reparo
📸 Análise de fotos/vídeos
⚠️ Orientações de segurança

Me conte: qual console ou periférico está com problema?"""

        if console_type:
            greeting += f"\n\nVejo que você está com problemas no {console_type}. Pode me descrever o que está acontecendo?"

        self.conversation_history = [greeting]
        return greeting

    def analyze_problem(
        self,
        user_message: str,
        images: Optional[List[bytes]] = None,
        video_frames: Optional[List[bytes]] = None
    ) -> Dict[str, Any]:
        """
        Analyze user's problem with optional images/video

        Args:
            user_message: User's description of the problem
            images: Optional list of image bytes
            video_frames: Optional list of video frame bytes

        Returns:
            dict with AI response and diagnosis
        """
        if not GEMINI_API_KEY:
            return {
                "success": False,
                "error": "Gemini API não configurada"
            }

        try:
            # Build conversation context
            context = f"{self.system_prompt}\n\n"
            context += "HISTÓRICO DA CONVERSA:\n"
            for msg in self.conversation_history[-4:]:  # Last 4 messages for context
                context += f"{msg}\n"

            context += f"\nUSUÁRIO: {user_message}\n"

            # Prepare content for Gemini
            content_parts = [context]

            # Add images if provided
            if images:
                for img_data in images[:3]:  # Max 3 images
                    content_parts.append({
                        "mime_type": "image/jpeg",
                        "data": img_data
                    })

            # Add video frames if provided
            if video_frames:
                for frame_data in video_frames[:3]:  # Max 3 frames
                    content_parts.append({
                        "mime_type": "image/jpeg",
                        "data": frame_data
                    })

            # Generate response
            response = self.model.generate_content(content_parts)
            ai_response = response.text

            # Update conversation history
            self.conversation_history.append(f"USUÁRIO: {user_message}")
            self.conversation_history.append(f"ASSISTENTE: {ai_response}")

            return {
                "success": True,
                "response": ai_response,
                "has_media": bool(images or video_frames)
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def get_quick_tips(self, console: str) -> Dict[str, Any]:
        """
        Get quick maintenance tips for a specific console

        Args:
            console: Console name (e.g., "PlayStation 1", "SNES")

        Returns:
            dict with maintenance tips
        """
        if not GEMINI_API_KEY:
            return {
                "success": False,
                "error": "Gemini API não configurada"
            }

        try:
            prompt = f"""Liste as 5 dicas de manutenção preventiva mais importantes para o console {console}.

Inclua:
1. Limpeza regular
2. Cuidados com armazenamento
3. Como prolongar a vida útil
4. Sinais de alerta
5. Manutenção preventiva

Formato JSON:
{{
  "console": "{console}",
  "tips": [
    {{
      "title": "Título da dica",
      "description": "Descrição detalhada",
      "frequency": "diária/semanal/mensal/anual",
      "difficulty": "fácil/médio/difícil"
    }}
  ],
  "common_issues": ["Lista de problemas comuns"],
  "warning": "Avisos importantes de segurança"
}}"""

            response = self.model.generate_content(prompt)

            return {
                "success": True,
                "response": response.text
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def identify_problem_from_media(
        self,
        console: str,
        problem_description: str,
        media_data: bytes,
        media_type: str = "image"
    ) -> Dict[str, Any]:
        """
        Identify problem from photo or video

        Args:
            console: Console name
            problem_description: User's description
            media_data: Image or video frame bytes
            media_type: "image" or "video"

        Returns:
            dict with diagnosis
        """
        if not GEMINI_API_KEY:
            return {
                "success": False,
                "error": "Gemini API não configurada"
            }

        try:
            prompt = f"""Analise esta {media_type} do console {console}.

PROBLEMA RELATADO: {problem_description}

Identifique:
1. **Diagnóstico provável**: O que parece estar errado?
2. **Causas possíveis**: Por que isso acontece?
3. **Gravidade**: Leve/Moderado/Grave
4. **Pode consertar em casa?**: Sim/Não/Talvez
5. **Ferramentas necessárias**: Lista
6. **Passos para reparo**: Instruções detalhadas
7. **Riscos**: Avisos de segurança
8. **Custo estimado**: Faixa de preço de peças (em reais)
9. **Tempo estimado**: Quanto tempo leva
10. **Confiança**: 0-100% de certeza do diagnóstico

Responda em JSON:
{{
  "diagnosis": "Diagnóstico provável",
  "causes": ["causa1", "causa2"],
  "severity": "Leve/Moderado/Grave",
  "diy_possible": true/false,
  "tools_needed": ["ferramenta1", "ferramenta2"],
  "repair_steps": ["passo1", "passo2"],
  "risks": ["risco1", "risco2"],
  "estimated_cost": "R$ 20-50",
  "estimated_time": "30 minutos",
  "confidence": 85,
  "professional_recommended": true/false,
  "notes": "Observações adicionais"
}}"""

            content = [
                prompt,
                {
                    "mime_type": "image/jpeg",
                    "data": media_data
                }
            ]

            response = self.model.generate_content(content)

            return {
                "success": True,
                "response": response.text
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Global assistant instance
maintenance_assistant = MaintenanceAssistant()
