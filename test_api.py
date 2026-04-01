#!/usr/bin/env python3
"""
Script de Teste Automatizado - RetroTrade Brasil API
Testa todos os endpoints principais do sistema
"""
import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any

# Configuração
BASE_URL = "https://gamer-marketplace.onrender.com"
# Para teste local, use: BASE_URL = "http://localhost:8000"

class Colors:
    """Cores para terminal"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.product_id = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "tests": []
        }

    def log(self, message: str, status: str = "info"):
        """Log formatado"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        colors = {
            "pass": Colors.GREEN,
            "fail": Colors.RED,
            "skip": Colors.YELLOW,
            "info": Colors.BLUE
        }
        color = colors.get(status, "")
        status_symbol = {
            "pass": "✓",
            "fail": "✗",
            "skip": "⊘",
            "info": "ℹ"
        }
        symbol = status_symbol.get(status, "→")
        print(f"[{timestamp}] {color}{symbol} {message}{Colors.END}")

    def test_endpoint(self, name: str, method: str, endpoint: str,
                     data: Dict[Any, Any] = None,
                     files: Dict[Any, Any] = None,
                     headers: Dict[str, str] = None,
                     expect_status: int = 200,
                     skip_if_no_token: bool = False) -> bool:
        """Testa um endpoint"""
        if skip_if_no_token and not self.token:
            self.log(f"{name}: Pulado (sem token)", "skip")
            self.results["skipped"] += 1
            return False

        try:
            url = f"{self.base_url}{endpoint}"
            request_headers = headers or {}

            if self.token and "Authorization" not in request_headers:
                request_headers["Authorization"] = f"Bearer {self.token}"

            self.log(f"{name}: Testando {method} {endpoint}...", "info")

            if method == "GET":
                response = requests.get(url, headers=request_headers, timeout=60)
            elif method == "POST":
                if files:
                    response = requests.post(url, data=data, files=files,
                                           headers=request_headers, timeout=60)
                else:
                    request_headers["Content-Type"] = "application/json"
                    response = requests.post(url, json=data,
                                           headers=request_headers, timeout=60)
            elif method == "DELETE":
                response = requests.delete(url, headers=request_headers, timeout=60)
            else:
                raise ValueError(f"Método {method} não suportado")

            # Verificar status
            if response.status_code == expect_status:
                self.log(f"{name}: PASSOU (status {response.status_code})", "pass")
                self.results["passed"] += 1
                self.results["tests"].append({
                    "name": name,
                    "status": "passed",
                    "response_code": response.status_code
                })
                return True
            else:
                self.log(f"{name}: FALHOU (esperado {expect_status}, recebeu {response.status_code})", "fail")
                self.log(f"  Resposta: {response.text[:200]}", "fail")
                self.results["failed"] += 1
                self.results["tests"].append({
                    "name": name,
                    "status": "failed",
                    "expected": expect_status,
                    "received": response.status_code,
                    "error": response.text[:200]
                })
                return False

        except requests.exceptions.Timeout:
            self.log(f"{name}: FALHOU (timeout após 60s)", "fail")
            self.results["failed"] += 1
            return False
        except Exception as e:
            self.log(f"{name}: FALHOU (erro: {str(e)})", "fail")
            self.results["failed"] += 1
            return False

    def run_all_tests(self):
        """Executa todos os testes"""
        print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}  🎮 RETROTRADE BRASIL - Teste Automatizado de API{Colors.END}")
        print(f"{Colors.BOLD}{'='*60}{Colors.END}\n")
        print(f"URL Base: {self.base_url}")
        print(f"Início: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

        # 1. Health Check
        self.log("\n📋 GRUPO 1: Health Check", "info")
        self.test_endpoint("Health Check", "GET", "/health")
        self.test_endpoint("Root Endpoint", "GET", "/")

        # 2. Autenticação
        self.log("\n📋 GRUPO 2: Autenticação", "info")

        # Registrar usuário de teste
        test_user = {
            "email": f"teste_{datetime.now().timestamp()}@example.com",
            "username": f"teste_{int(datetime.now().timestamp())}",
            "password": "senha123",
            "full_name": "Usuario de Teste",
            "cpf": "12345678909",
            "phone": "11999999999"
        }

        if self.test_endpoint("Registro de Usuário", "POST", "/register", data=test_user):
            # Login
            login_data = {
                "username": test_user["username"],
                "password": test_user["password"]
            }
            try:
                url = f"{self.base_url}/token"
                response = requests.post(
                    url,
                    data=login_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=60
                )
                if response.status_code == 200:
                    self.token = response.json().get("access_token")
                    self.log("Login: PASSOU (token obtido)", "pass")
                    self.results["passed"] += 1

                    # Testar /me
                    self.test_endpoint("Obter Dados do Usuário (/me)", "GET", "/me",
                                     skip_if_no_token=True)
                else:
                    self.log(f"Login: FALHOU (status {response.status_code})", "fail")
                    self.results["failed"] += 1
            except Exception as e:
                self.log(f"Login: FALHOU (erro: {str(e)})", "fail")
                self.results["failed"] += 1

        # 3. Produtos
        self.log("\n📋 GRUPO 3: Produtos", "info")
        self.test_endpoint("Listar Produtos", "GET", "/products")
        self.test_endpoint("Buscar Produtos", "GET", "/search?q=mario")

        # 4. Fórum
        self.log("\n📋 GRUPO 4: Fórum", "info")
        self.test_endpoint("Listar Posts do Fórum", "GET", "/forum/posts")

        # Criar post de teste (requer autenticação)
        if self.token:
            post_data = {
                "category": "consoles",
                "title": "Post de Teste",
                "content": "Este é um post de teste automatizado"
            }
            self.test_endpoint("Criar Post no Fórum", "POST", "/forum/posts",
                             data=post_data, skip_if_no_token=True)

        # 5. Eventos
        self.log("\n📋 GRUPO 5: Eventos", "info")
        self.test_endpoint("Listar Eventos", "GET", "/events")

        # 6. Chat
        self.log("\n📋 GRUPO 6: Chat", "info")
        if self.token:
            self.test_endpoint("Listar Salas de Chat", "GET", "/chat/rooms",
                             skip_if_no_token=True)
            self.test_endpoint("Listar Alertas de Moderação", "GET", "/chat/alerts",
                             skip_if_no_token=True)

        # 7. Transações
        self.log("\n📋 GRUPO 7: Transações", "info")
        if self.token:
            self.test_endpoint("Listar Minhas Transações", "GET", "/my-transactions",
                             skip_if_no_token=True)

        # Relatório Final
        self.print_summary()

    def print_summary(self):
        """Imprime resumo dos testes"""
        total = self.results["passed"] + self.results["failed"] + self.results["skipped"]

        print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}  📊 RESUMO DOS TESTES{Colors.END}")
        print(f"{Colors.BOLD}{'='*60}{Colors.END}\n")

        print(f"Total de testes: {total}")
        print(f"{Colors.GREEN}✓ Passaram: {self.results['passed']}{Colors.END}")
        print(f"{Colors.RED}✗ Falharam: {self.results['failed']}{Colors.END}")
        print(f"{Colors.YELLOW}⊘ Pulados: {self.results['skipped']}{Colors.END}")

        if total > 0:
            success_rate = (self.results["passed"] / total) * 100
            print(f"\nTaxa de Sucesso: {success_rate:.1f}%")

        print(f"\nFim: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{Colors.BOLD}{'='*60}{Colors.END}\n")

        # Salvar relatório em JSON
        report_file = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        print(f"📄 Relatório salvo em: {report_file}\n")

        # Exit code
        if self.results["failed"] > 0:
            sys.exit(1)
        else:
            sys.exit(0)


def main():
    """Função principal"""
    # Verificar se deve usar URL local
    if len(sys.argv) > 1 and sys.argv[1] == "--local":
        base_url = "http://localhost:8000"
    else:
        base_url = BASE_URL

    tester = APITester(base_url)
    tester.run_all_tests()


if __name__ == "__main__":
    main()
