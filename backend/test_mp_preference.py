"""
Script para testar criação de preferência no Mercado Pago
Verifica se o marketplace está configurado corretamente
"""

import os
import mercadopago

# Credenciais de teste
SELLER_ACCESS_TOKEN = input("Cole o access_token do vendedor (da tabela users, coluna mp_access_token): ").strip()

if not SELLER_ACCESS_TOKEN:
    print("❌ Token não fornecido")
    exit(1)

print(f"\n🔍 Testando com token: {SELLER_ACCESS_TOKEN[:30]}...")

# Inicializar SDK
sdk = mercadopago.SDK(SELLER_ACCESS_TOKEN)

# Criar preferência de teste
preference_data = {
    "items": [
        {
            "title": "Produto de Teste",
            "description": "Teste de marketplace",
            "quantity": 1,
            "unit_price": 100.00,
            "currency_id": "BRL"
        }
    ],
    "payer": {
        "name": "Comprador Teste",
        "email": "teste@teste.com"
    },
    "back_urls": {
        "success": "https://gamer-marketplace.onrender.com/payment/success",
        "failure": "https://gamer-marketplace.onrender.com/payment/failure",
        "pending": "https://gamer-marketplace.onrender.com/payment/pending"
    },
    "auto_return": "approved",
    "external_reference": "test_123",
    "statement_descriptor": "RETROTRADE BRASIL",
    "notification_url": "https://gamer-marketplace.onrender.com/webhook/mercadopago",
    # Comissão do marketplace (5%)
    "marketplace_fee": 5.00
}

print("\n📋 Criando preferência de teste...")
print(f"💰 Valor: R$ 100.00")
print(f"💵 Marketplace fee: R$ 5.00 (5%)")
print(f"💸 Vendedor recebe: R$ 95.00")

try:
    response = sdk.preference().create(preference_data)

    print("\n✅ Resposta recebida do Mercado Pago:")
    print(f"📦 Type: {type(response)}")
    print(f"📦 Keys: {response.keys() if isinstance(response, dict) else 'Não é dict'}")

    # Tentar extrair dados
    preference = None
    if isinstance(response, dict):
        if "response" in response:
            preference = response["response"]
            print(f"\n📍 Estrutura: response.response")
        else:
            preference = response
            print(f"\n📍 Estrutura: response direto")

    if preference and "id" in preference:
        print(f"\n✅ Preferência criada com sucesso!")
        print(f"🆔 ID: {preference['id']}")
        print(f"🔗 Init Point: {preference.get('init_point', 'NÃO ENCONTRADO')}")
        print(f"📱 Sandbox Init Point: {preference.get('sandbox_init_point', 'NÃO ENCONTRADO')}")
        print(f"💳 Client ID: {preference.get('client_id', 'NÃO ENCONTRADO')}")

        # Verificar se tem marketplace configurado
        if 'marketplace' in preference:
            print(f"\n✅ MARKETPLACE DETECTADO:")
            print(f"   {preference['marketplace']}")
        else:
            print(f"\n⚠️ MARKETPLACE NÃO DETECTADO na resposta")

        # Verificar marketplace_fee
        if 'marketplace_fee' in preference_data:
            print(f"\n✅ Marketplace fee enviado: R$ {preference_data['marketplace_fee']}")

        print(f"\n📄 Resposta completa:")
        import json
        print(json.dumps(preference, indent=2, ensure_ascii=False))

    else:
        print(f"\n❌ Preferência sem ID!")
        print(f"Resposta completa: {response}")

except Exception as e:
    print(f"\n❌ ERRO ao criar preferência:")
    print(f"   {type(e).__name__}: {str(e)}")

    # Tentar pegar mais detalhes do erro
    if hasattr(e, 'args') and e.args:
        print(f"\n📋 Detalhes do erro:")
        import json
        try:
            error_data = json.loads(str(e.args[0]))
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
        except:
            print(f"   {e.args}")
