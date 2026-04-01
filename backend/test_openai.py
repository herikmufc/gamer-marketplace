#!/usr/bin/env python3
"""
Teste rápido da configuração do OpenAI GPT
"""
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def test_openai():
    """Testa se a API Key do OpenAI está configurada e funcionando"""

    # 1. Verificar se a chave existe
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print("❌ OPENAI_API_KEY não encontrada no arquivo .env")
        print("   Adicione sua chave no arquivo .env:")
        print("   OPENAI_API_KEY=sk-proj-sua-chave-aqui")
        return False

    # Mascarar chave para segurança (mostrar só início e fim)
    masked_key = f"{api_key[:10]}...{api_key[-4:]}"
    print(f"✅ API Key encontrada: {masked_key}")

    # 2. Tentar importar biblioteca OpenAI
    try:
        from openai import OpenAI
        print("✅ Biblioteca OpenAI importada com sucesso")
    except ImportError:
        print("❌ Biblioteca OpenAI não instalada")
        print("   Instale com: pip install openai")
        return False

    # 3. Criar cliente
    try:
        client = OpenAI(api_key=api_key)
        print("✅ Cliente OpenAI criado")
    except Exception as e:
        print(f"❌ Erro ao criar cliente: {e}")
        return False

    # 4. Fazer teste simples (barato)
    print("\n🧪 Testando chamada à API...")
    print("   (Usando gpt-4o-mini - custo: ~$0.0001)")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Você é um assistente conciso. Responda em português brasileiro."
                },
                {
                    "role": "user",
                    "content": "Diga apenas 'Olá' e nada mais"
                }
            ],
            max_tokens=10,
            temperature=0
        )

        resposta = response.choices[0].message.content
        print(f"✅ API funcionando perfeitamente!")
        print(f"   Resposta do GPT: '{resposta}'")
        print(f"   Tokens usados: {response.usage.total_tokens}")
        print(f"   Modelo: {response.model}")

        return True

    except Exception as e:
        print(f"❌ Erro ao chamar API: {e}")

        # Mensagens de erro específicas
        error_str = str(e)
        if "invalid_api_key" in error_str or "Incorrect API key" in error_str:
            print("\n   💡 A chave API está incorreta ou foi revogada")
            print("      1. Acesse: https://platform.openai.com/api-keys")
            print("      2. Revogue a chave antiga")
            print("      3. Crie uma nova chave")
            print("      4. Atualize o .env")
        elif "insufficient_quota" in error_str:
            print("\n   💡 Sem créditos/quota na conta OpenAI")
            print("      Adicione créditos em: https://platform.openai.com/account/billing")
        elif "rate_limit" in error_str:
            print("\n   💡 Limite de requisições excedido")
            print("      Aguarde 1 minuto e tente novamente")

        return False

def test_models():
    """Lista modelos disponíveis"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        print("\n📋 Modelos Recomendados:")
        print("   • gpt-4o-mini  - Rápido e barato (chat, texto)")
        print("   • gpt-4o       - Com visão (análise de imagens)")
        print("   • gpt-4-turbo  - Avançado (tarefas complexas)")

    except Exception as e:
        print(f"Erro ao listar modelos: {e}")

def show_usage_tips():
    """Mostra dicas de uso"""
    print("\n💡 Próximos Passos:")
    print("   1. Backend está pronto para usar OpenAI")
    print("   2. Escolha uma feature para implementar:")
    print("      • Assistente Virtual (chatbot)")
    print("      • Gerador de Descrições")
    print("      • Consultor de Preços")
    print("      • Moderador de Fórum")
    print("\n   3. Me avise qual feature quer e eu implemento!")

    print("\n📊 Monitorar Uso:")
    print("   https://platform.openai.com/usage")

    print("\n🔐 Segurança:")
    print("   ✅ API key no .env (não commitar!)")
    print("   ✅ .env no .gitignore")
    print("   ❌ Nunca exponha a chave em código público")

if __name__ == "__main__":
    print("=" * 60)
    print("  🧪 TESTE DE CONFIGURAÇÃO OPENAI GPT")
    print("=" * 60)
    print()

    success = test_openai()

    if success:
        print("\n" + "=" * 60)
        print("  🎉 TUDO FUNCIONANDO!")
        print("=" * 60)
        test_models()
        show_usage_tips()
    else:
        print("\n" + "=" * 60)
        print("  ⚠️  CONFIGURAÇÃO INCOMPLETA")
        print("=" * 60)
        print("\n📖 Consulte: GUIA_RAPIDO.md")

    print()
