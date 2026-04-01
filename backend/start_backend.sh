#!/bin/bash

# Script para iniciar o backend do RetroTrade Brasil
# Com ambiente virtual ativado

echo "🚀 Iniciando RetroTrade Brasil Backend..."

# Navegar para o diretório correto
cd /home/madeinweb/gamer-marketplace/backend

# Parar backend anterior se estiver rodando
echo "⏹️  Parando backend anterior..."
pkill -f "python.*main.py" 2>/dev/null
sleep 1

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "   Copie .env.example para .env e configure suas chaves"
    exit 1
fi

# Verificar se as chaves estão configuradas
if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo "⚠️  OPENAI_API_KEY não configurada no .env"
    echo "   Edite o arquivo .env e adicione sua chave OpenAI"
fi

# Iniciar backend
echo "▶️  Iniciando backend..."
nohup python main.py > backend.log 2>&1 &

# Aguardar inicialização
sleep 3

# Verificar se está rodando
if pgrep -f "python.*main.py" > /dev/null; then
    echo "✅ Backend iniciado com sucesso!"
    echo "   URL: http://192.168.1.11:8000"
    echo "   Docs: http://192.168.1.11:8000/docs"
    echo "   PID: $(pgrep -f 'python.*main.py')"

    # Testar se está respondendo
    sleep 2
    if curl -s http://192.168.1.11:8000/ | grep -q "RetroTrade"; then
        echo "   Status: 🟢 Online"
    else
        echo "   Status: 🟡 Iniciando..."
    fi
else
    echo "❌ Falha ao iniciar backend!"
    echo "   Verifique os logs: tail -50 backend.log"
    exit 1
fi

echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: tail -f backend.log"
echo "   Parar: pkill -f 'python.*main.py'"
echo "   Status: curl http://192.168.1.11:8000/"
