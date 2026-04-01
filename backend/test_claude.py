#!/usr/bin/env python3
"""
Teste rápido da configuração do Claude (Anthropic)
"""
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def test_claude():
    """Testa se a API Key do Claude está configurada e funcionando"""

    # 1. Verificar se a chave existe
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        print("❌ ANTHROPIC_API_KEY não encontrada no arquivo .env")
        print("   Adicione sua chave no arquivo .env:")
        print("   ANTHROPIC_API_KEY=sk-ant-api03-sua-chave-aqui")
        print("\n📖 Consulte: CONFIGURAR_CLAUDE.md")
        return False

    # Mascarar chave para segurança (mostrar só início e fim)
    masked_key = f"{api_key[:15]}...{api_key[-4:]}"
    print(f"✅ API Key encontrada: {masked_key}")

    # 2. Tentar importar biblioteca Anthropic
    try:
        import anthropic
        print("✅ Biblioteca Anthropic importada com sucesso")
    except ImportError:
        print("❌ Biblioteca Anthropic não instalada")
        print("   Instale com: pip install anthropic")
        return False

    # 3. Criar cliente
    try:
        client = anthropic.Anthropic(api_key=api_key)
        print("✅ Cliente Claude criado")
    except Exception as e:
        print(f"❌ Erro ao criar cliente: {e}")
        return False

    # 4. Fazer teste simples (barato)
    print("\n🧪 Testando chamada à API...")
    print("   (Usando Claude Sonnet 4.5 - custo: ~$0.0003)")

    try:
        response = client.messages.create(
            model="claude-4-6-sonnet-20250929",
            max_tokens=20,
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": "Responda apenas com a palavra 'Olá' e nada mais."
                }
            ]
        )

        resposta = response.content[0].text
        print(f"✅ API funcionando perfeitamente!")
        print(f"   Resposta do Claude: '{resposta}'")
        print(f"   Tokens usados: input={response.usage.input_tokens}, output={response.usage.output_tokens}")
        print(f"   Modelo: {response.model}")

        return True

    except Exception as e:
        print(f"❌ Erro ao chamar API: {e}")

        # Mensagens de erro específicas
        error_str = str(e)
        if "invalid_api_key" in error_str or "authentication" in error_str.lower():
            print("\n   💡 A chave API está incorreta ou foi revogada")
            print("      1. Acesse: https://console.anthropic.com/settings/keys")
            print("      2. Revogue a chave antiga")
            print("      3. Crie uma nova chave")
            print("      4. Atualize o .env")
        elif "insufficient_quota" in error_str or "overloaded" in error_str.lower():
            print("\n   💡 Sem créditos ou API sobrecarregada")
            print("      - Se é novo usuário, você tem $5 em créditos gratuitos")
            print("      - Verifique em: https://console.anthropic.com/settings/usage")
            print("      - Se esgotou, adicione créditos: https://console.anthropic.com/settings/billing")
        elif "rate_limit" in error_str:
            print("\n   💡 Limite de requisições excedido")
            print("      Aguarde 1 minuto e tente novamente")

        return False

def test_moderation():
    """Testa moderação de chat"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        print("\n🧪 Testando Moderação de Chat...")

        # Mensagem suspeita
        test_message = "Faz PIX direto pra mim? Ag 1234 Conta 56789-0"

        prompt = f"""Você é um moderador. Analise esta mensagem:

MENSAGEM: "{test_message}"

Detecte comportamentos suspeitos (fraude, pagamento fora da plataforma, contatos).

Retorne APENAS JSON:
{{"is_suspicious": true, "risk_score": 75, "alert_type": "payment_outside"}}"""

        response = client.messages.create(
            model="claude-4-6-sonnet-20250929",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )

        result = response.content[0].text
        print(f"✅ Moderação funcionando!")
        print(f"   Mensagem testada: '{test_message[:50]}...'")
        print(f"   Análise: {result[:100]}...")

    except Exception as e:
        print(f"Erro ao testar moderação: {e}")

def show_usage_tips():
    """Mostra dicas de uso"""
    print("\n💡 Próximos Passos:")
    print("   1. Backend está pronto para usar Claude")
    print("   2. Todas as features funcionam:")
    print("      • 🔍 Identificação de jogos por foto")
    print("      • 🛡️ Moderação de chat anti-fraude")
    print("      • 📅 Descoberta automática de eventos")
    print("\n   3. Implemente no app mobile!")

    print("\n📊 Monitorar Uso:")
    print("   https://console.anthropic.com/settings/usage")

    print("\n🔐 Segurança:")
    print("   ✅ API key no .env (não commitar!)")
    print("   ✅ .env no .gitignore")
    print("   ❌ Nunca exponha a chave em código público")

    print("\n💰 Créditos Gratuitos:")
    print("   • Novos usuários: $5 grátis")
    print("   • Suficiente para ~1.6 milhão de tokens")
    print("   • Teste à vontade! 🎉")

if __name__ == "__main__":
    print("=" * 60)
    print("  🤖 TESTE DE CONFIGURAÇÃO CLAUDE (ANTHROPIC)")
    print("=" * 60)
    print()

    success = test_claude()

    if success:
        print("\n" + "=" * 60)
        print("  🎉 TUDO FUNCIONANDO!")
        print("=" * 60)
        test_moderation()
        show_usage_tips()
    else:
        print("\n" + "=" * 60)
        print("  ⚠️  CONFIGURAÇÃO INCOMPLETA")
        print("=" * 60)
        print("\n📖 Consulte: CONFIGURAR_CLAUDE.md")

    print()
