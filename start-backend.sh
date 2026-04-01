#!/bin/bash

echo "🎮 Iniciando Gamer Marketplace Backend..."

cd backend

# Ativar ambiente virtual
if [ -d "venv" ]; then
    echo "✓ Ativando ambiente virtual..."
    source venv/bin/activate
else
    echo "❌ Ambiente virtual não encontrado!"
    echo "Execute: cd backend && python3 -m venv venv && pip install -r requirements.txt"
    exit 1
fi

# Verificar .env
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "Criando .env com valores padrão..."
    cp .env.example .env
fi

# Verificar API Key
if ! grep -q "ANTHROPIC_API_KEY=sk-" .env; then
    echo ""
    echo "⚠️  ATENÇÃO: API Key da Anthropic não configurada!"
    echo ""
    echo "O app funcionará, mas a análise de IA usará valores padrão."
    echo "Para habilitar IA completa:"
    echo "1. Obtenha sua chave em: https://console.anthropic.com/"
    echo "2. Edite backend/.env e adicione: ANTHROPIC_API_KEY=sk-ant-..."
    echo ""
    read -p "Pressione ENTER para continuar..."
fi

# Mostrar IP local
echo ""
echo "📡 Seu IP local:"
hostname -I | awk '{print $1}'
echo ""
echo "Configure o mobile em: mobile/src/api/client.js"
echo "Linha 8: const API_URL = 'http://SEU_IP:8000';"
echo ""

# Iniciar servidor
echo "🚀 Iniciando servidor em http://0.0.0.0:8000"
echo ""
python main.py
