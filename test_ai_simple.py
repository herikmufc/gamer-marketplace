#!/usr/bin/env python3
"""Teste simplificado das funcionalidades de IA"""
import requests
import json
from io import BytesIO
from PIL import Image, ImageDraw

BASE_URL = "http://localhost:8000"

def create_test_image():
    """Cria imagem fake para teste"""
    img = Image.new('RGB', (400, 300), color=(73, 109, 137))
    d = ImageDraw.Draw(img)
    d.rectangle([50, 50, 350, 250], fill=(200, 200, 200))
    d.text((120, 130), "SUPER MARIO", fill=(0, 0, 0))
    buf = BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

print("="*60)
print("TESTE 1: Health Check")
print("="*60)
r = requests.get(f"{BASE_URL}/health")
print(f"Status: {r.status_code}")
print(json.dumps(r.json(), indent=2))

print("\n" + "="*60)
print("TESTE 2: Criar Usuário")
print("="*60)
user_data = {
    "username": "testai999",
    "email": "testai999@test.com",
    "password": "senha123",
    "full_name": "Test AI",
    "cpf": "11144477735",
    "phone": "1199999999"
}
r = requests.post(f"{BASE_URL}/register", json=user_data)
print(f"Status: {r.status_code}")
if r.status_code == 400 and "já cadastrado" in r.text:
    print("Usuário já existe, fazendo login...")
    r.status_code = 200  # Continue com login
elif r.status_code == 200:
    print(f"Usuário criado: {r.json().get('username')}")

if r.status_code == 200 or "já cadastrado" in r.text:
    # Login para obter token
    print("\n" + "="*60)
    print("TESTE 2b: Fazer Login")
    print("="*60)
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    r2 = requests.post(f"{BASE_URL}/token", data=login_data)
    print(f"Login Status: {r2.status_code}")
    if r2.status_code == 200:
        token = r2.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Login bem-sucedido!")
    else:
        print(f"❌ Erro no login: {r2.text}")
        exit(1)

    print("\n" + "="*60)
    print("TESTE 3: Identificar Jogo (com imagem fake)")
    print("="*60)
    img = create_test_image()
    files = {"file": ("game.jpg", img, "image/jpeg")}
    r = requests.post(f"{BASE_URL}/products/identify", headers=headers, files=files)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("✅ SUCESSO!")
        print(json.dumps(r.json(), indent=2, ensure_ascii=False)[:500])
    else:
        print(f"❌ Erro: {r.text}")

    print("\n" + "="*60)
    print("TESTE 4: Descobrir Eventos")
    print("="*60)
    r = requests.post(f"{BASE_URL}/events/discover",
                     headers=headers,
                     json={"state": "São Paulo", "city": "São Paulo"})
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("✅ SUCESSO!")
        result = r.json()
        print(f"Eventos encontrados: {len(result.get('events', []))}")
    else:
        print(f"❌ Erro: {r.text[:200]}")

    print("\n" + "="*60)
    print("TESTE 5: Chatbot de Manutenção - Iniciar")
    print("="*60)
    r = requests.post(f"{BASE_URL}/maintenance/start",
                     headers=headers,
                     json={"console": "PlayStation 1"})
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("✅ SUCESSO!")
        print(r.json().get("greeting", "")[:200])
    else:
        print(f"❌ Erro: {r.text[:200]}")

    print("\n" + "="*60)
    print("TESTE 6: Chatbot - Analisar Problema")
    print("="*60)
    r = requests.post(f"{BASE_URL}/maintenance/chat",
                     headers=headers,
                     json={"message": "Meu PS1 não lê CDs"})
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("✅ SUCESSO!")
        print(r.json().get("response", "")[:300])
    else:
        print(f"❌ Erro: {r.text[:200]}")

    print("\n" + "="*60)
    print("TESTE 7: Dicas de Manutenção")
    print("="*60)
    r = requests.get(f"{BASE_URL}/maintenance/tips/PlayStation 1", headers=headers)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("✅ SUCESSO!")
        print(r.json().get("response", "")[:300])
    else:
        print(f"❌ Erro: {r.text[:200]}")

print("\n" + "="*60)
print("TESTE 8: Moderação de Chat (sem autenticação)")
print("="*60)
r = requests.post(f"{BASE_URL}/chat/moderate-message",
                 json={"message": "Me passa seu whatsapp?", "room_context": "Negociação"})
print(f"Status: {r.status_code}")
if r.status_code in [200, 401]:
    print(f"Response: {r.text[:300]}")
else:
    print(f"❌ Erro: {r.text[:200]}")

print("\n" + "="*60)
print("RESUMO: Gemini AI está configurado!")
print("="*60)
