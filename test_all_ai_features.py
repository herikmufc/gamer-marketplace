#!/usr/bin/env python3
"""
🤖 Teste Completo de TODAS as Funcionalidades de IA
RetroTrade Brasil - Google Gemini AI Features
"""
import requests
import json
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import time

BASE_URL = "http://localhost:8000"

# Cores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{text.center(60)}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_info(text):
    print(f"{YELLOW}ℹ️  {text}{RESET}")

def create_fake_game_image():
    """Cria uma imagem fake de um jogo retro para teste"""
    img = Image.new('RGB', (400, 300), color=(73, 109, 137))
    d = ImageDraw.Draw(img)

    # Simula um cartucho de SNES
    d.rectangle([50, 50, 350, 250], fill=(200, 200, 200), outline=(0, 0, 0), width=3)
    d.text((120, 130), "SUPER MARIO", fill=(0, 0, 0))
    d.text((110, 160), "WORLD", fill=(255, 0, 0))

    # Convert to bytes
    buf = BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

def create_fake_console_image():
    """Cria imagem fake de console com problema"""
    img = Image.new('RGB', (400, 300), color=(50, 50, 50))
    d = ImageDraw.Draw(img)

    # Simula um PlayStation
    d.rectangle([50, 100, 350, 200], fill=(120, 120, 120), outline=(0, 0, 0), width=3)
    d.text((140, 140), "PlayStation", fill=(255, 255, 255))
    d.ellipse([100, 130, 120, 150], fill=(255, 0, 0))  # LED vermelho

    buf = BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

# ============================================
# TESTE 1: Health Check
# ============================================
def test_health():
    print_header("TESTE 1: Health Check - Verificar Gemini")

    try:
        response = requests.get(f"{BASE_URL}/health")
        data = response.json()

        print_info(f"Status: {data.get('status')}")
        print_info(f"Database: {data.get('database')}")
        print_info(f"Gemini API: {data.get('gemini_api')}")
        print_info(f"Gemini Model: {data.get('gemini_model')}")
        print_info(f"Version: {data.get('version')}")

        if data.get('gemini_api') == 'configured':
            print_success("Gemini API está configurada!")
            return True
        else:
            print_error("Gemini API NÃO configurada!")
            return False

    except Exception as e:
        print_error(f"Erro: {e}")
        return False

# ============================================
# TESTE 2: Identificação de Jogos por Imagem
# ============================================
def test_game_identification():
    print_header("TESTE 2: Identificação de Jogos por Imagem")

    try:
        # Criar usuário de teste
        register_response = requests.post(f"{BASE_URL}/register", json={
            "username": f"test_ai_{int(time.time())}",
            "email": f"test_ai_{int(time.time())}@test.com",
            "password": "Test123!",
            "full_name": "Test AI User",
            "cpf": "12345678901"
        })

        if register_response.status_code != 200:
            print_error(f"Erro ao registrar usuário: {register_response.status_code}")
            return False

        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Criar imagem fake
        image_data = create_fake_game_image()

        print_info("Enviando imagem de jogo para identificação...")

        files = {"file": ("game.jpg", image_data, "image/jpeg")}
        response = requests.post(
            f"{BASE_URL}/products/identify",
            headers=headers,
            files=files
        )

        if response.status_code == 200:
            result = response.json()
            print_success("Identificação realizada!")
            print_info(f"Resposta da IA:\n{json.dumps(result, indent=2, ensure_ascii=False)}")
            return True
        else:
            print_error(f"Erro {response.status_code}: {response.text}")
            return False

    except Exception as e:
        print_error(f"Erro: {e}")
        return False

# ============================================
# TESTE 3: Moderação de Chat
# ============================================
def test_chat_moderation():
    print_header("TESTE 3: Moderação de Chat em Tempo Real")

    print_info("Nota: Endpoint de moderação não requer autenticação para teste")

    test_messages = [
        {
            "message": "Olá! Esse jogo está disponível?",
            "expected": "appropriate"
        },
        {
            "message": "Me passa seu whatsapp para fecharmos fora daqui?",
            "expected": "suspicious"
        },
        {
            "message": "Aceito PIX, me manda o dinheiro que eu envio depois",
            "expected": "scam"
        }
    ]

    success_count = 0

    for i, test in enumerate(test_messages, 1):
        print_info(f"\nTeste {i}: \"{test['message']}\"")

        try:
            response = requests.post(
                f"{BASE_URL}/chat/moderate-message",
                json={
                    "message": test["message"],
                    "room_context": "Negociação de produto"
                }
            )

            if response.status_code == 200:
                result = response.json()
                print_success("Análise concluída!")
                print_info(f"Resultado:\n{json.dumps(result, indent=2, ensure_ascii=False)}")
                success_count += 1
            else:
                print_error(f"Erro {response.status_code}: {response.text}")

        except Exception as e:
            print_error(f"Erro: {e}")

    print_info(f"\nModeração: {success_count}/{len(test_messages)} testes bem-sucedidos")
    return success_count == len(test_messages)

# ============================================
# TESTE 4: Descoberta de Eventos
# ============================================
def test_event_discovery():
    print_header("TESTE 4: Descoberta Inteligente de Eventos")

    print_info("Criando usuário para teste autenticado...")

    # Criar usuário
    try:
        register_response = requests.post(f"{BASE_URL}/register", json={
            "username": f"test_events_{int(time.time())}",
            "email": f"test_events_{int(time.time())}@test.com",
            "password": "Test123!",
            "full_name": "Test Events User",
            "cpf": "12345678902"
        })

        if register_response.status_code != 200:
            print_error(f"Erro ao registrar usuário: {register_response.status_code}")
            return False

        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
    except Exception as e:
        print_error(f"Erro ao criar usuário: {e}")
        return False

    locations = [
        {"state": "São Paulo", "city": "São Paulo"},
        {"state": "Rio de Janeiro", "city": "Rio de Janeiro"}
    ]

    success_count = 0

    for location in locations:
        print_info(f"\nBuscando eventos em {location['city']}, {location['state']}...")

        try:
            response = requests.post(
                f"{BASE_URL}/events/discover",
                json=location,
                headers=headers
            )

            if response.status_code == 200:
                result = response.json()
                print_success(f"Busca concluída!")
                print_info(f"Eventos encontrados:\n{json.dumps(result, indent=2, ensure_ascii=False)}")
                success_count += 1
            else:
                print_error(f"Erro {response.status_code}: {response.text}")

        except Exception as e:
            print_error(f"Erro: {e}")

    return success_count == len(locations)

# ============================================
# TESTE 5: Chatbot de Manutenção - Início
# ============================================
def test_maintenance_assistant_start():
    print_header("TESTE 5A: Chatbot de Manutenção - Iniciar Conversa")

    consoles = ["PlayStation 1", "Super Nintendo", "Mega Drive"]

    success_count = 0

    for console in consoles:
        print_info(f"\nIniciando conversa sobre: {console}")

        try:
            response = requests.post(
                f"{BASE_URL}/maintenance/start",
                json={"console": console}
            )

            if response.status_code == 200:
                result = response.json()
                print_success("Conversa iniciada!")
                print_info(f"Saudação: {result.get('greeting', '')[:200]}...")
                success_count += 1
            else:
                print_error(f"Erro {response.status_code}: {response.text}")

        except Exception as e:
            print_error(f"Erro: {e}")

    return success_count == len(consoles)

# ============================================
# TESTE 6: Chatbot de Manutenção - Análise
# ============================================
def test_maintenance_assistant_analyze():
    print_header("TESTE 5B: Chatbot de Manutenção - Análise de Problema")

    problems = [
        "Meu PlayStation 1 não está lendo os CDs",
        "O Super Nintendo liga mas não aparece imagem na TV",
        "O controle do Mega Drive não responde"
    ]

    success_count = 0

    for problem in problems:
        print_info(f"\nAnalisando: {problem}")

        try:
            response = requests.post(
                f"{BASE_URL}/maintenance/chat",
                json={"message": problem}
            )

            if response.status_code == 200:
                result = response.json()
                print_success("Análise concluída!")
                print_info(f"Resposta:\n{result.get('response', '')[:300]}...")
                success_count += 1
            else:
                print_error(f"Erro {response.status_code}: {response.text}")

        except Exception as e:
            print_error(f"Erro: {e}")

    return success_count == len(problems)

# ============================================
# TESTE 7: Chatbot de Manutenção - Dicas
# ============================================
def test_maintenance_assistant_tips():
    print_header("TESTE 5C: Chatbot de Manutenção - Dicas Rápidas")

    console = "PlayStation 1"

    print_info(f"Obtendo dicas de manutenção para: {console}")

    try:
        response = requests.get(f"{BASE_URL}/maintenance/tips/{console}")

        if response.status_code == 200:
            result = response.json()
            print_success("Dicas obtidas!")
            print_info(f"Dicas:\n{json.dumps(result, indent=2, ensure_ascii=False)}")
            return True
        else:
            print_error(f"Erro {response.status_code}: {response.text}")
            return False

    except Exception as e:
        print_error(f"Erro: {e}")
        return False

# ============================================
# TESTE 8: Chatbot de Manutenção - Diagnóstico com Imagem
# ============================================
def test_maintenance_assistant_diagnose():
    print_header("TESTE 5D: Chatbot de Manutenção - Diagnóstico com Foto")

    try:
        # Criar imagem fake de console
        image_data = create_fake_console_image()

        print_info("Enviando foto de console com problema...")

        files = {"media": ("console.jpg", image_data, "image/jpeg")}
        data = {
            "console": "PlayStation 1",
            "problem": "O LED fica vermelho e não liga"
        }

        response = requests.post(
            f"{BASE_URL}/maintenance/diagnose",
            files=files,
            data=data
        )

        if response.status_code == 200:
            result = response.json()
            print_success("Diagnóstico realizado!")
            print_info(f"Resultado:\n{json.dumps(result, indent=2, ensure_ascii=False)}")
            return True
        else:
            print_error(f"Erro {response.status_code}: {response.text}")
            return False

    except Exception as e:
        print_error(f"Erro: {e}")
        return False

# ============================================
# EXECUTAR TODOS OS TESTES
# ============================================
def run_all_tests():
    print_header("🤖 TESTE COMPLETO DE IA - RetroTrade Brasil")
    print_info("Testando TODAS as funcionalidades de Gemini AI\n")

    results = {
        "Health Check": test_health(),
        "Identificação de Jogos": test_game_identification(),
        "Moderação de Chat": test_chat_moderation(),
        "Descoberta de Eventos": test_event_discovery(),
        "Manutenção - Iniciar": test_maintenance_assistant_start(),
        "Manutenção - Análise": test_maintenance_assistant_analyze(),
        "Manutenção - Dicas": test_maintenance_assistant_tips(),
        "Manutenção - Diagnóstico": test_maintenance_assistant_diagnose()
    }

    # Resumo final
    print_header("📊 RESUMO DOS TESTES")

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        status = f"{GREEN}✅ PASSOU{RESET}" if result else f"{RED}❌ FALHOU{RESET}"
        print(f"{test_name:.<50} {status}")

    print(f"\n{BLUE}{'='*60}{RESET}")
    percentage = (passed / total) * 100
    print(f"{YELLOW}Total: {passed}/{total} testes passaram ({percentage:.1f}%){RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

    if passed == total:
        print_success("🎉 TODOS OS TESTES PASSARAM! Gemini AI está 100% funcional!")
    elif passed > total / 2:
        print_info(f"⚠️  {passed}/{total} testes passaram. Alguns recursos precisam de ajustes.")
    else:
        print_error(f"❌ Apenas {passed}/{total} testes passaram. Requer investigação.")

    return results

if __name__ == "__main__":
    try:
        results = run_all_tests()

        # Salvar relatório
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        report_file = f"ai_test_report_{timestamp}.json"

        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                "timestamp": timestamp,
                "results": {k: "PASS" if v else "FAIL" for k, v in results.items()},
                "summary": {
                    "passed": sum(1 for v in results.values() if v),
                    "total": len(results),
                    "percentage": (sum(1 for v in results.values() if v) / len(results)) * 100
                }
            }, f, indent=2, ensure_ascii=False)

        print_info(f"\n📄 Relatório salvo em: {report_file}")

    except KeyboardInterrupt:
        print_error("\n\n⚠️  Testes interrompidos pelo usuário")
    except Exception as e:
        print_error(f"\n\n❌ Erro fatal: {e}")
