#!/bin/bash

echo "🎮 RetroTrade Brasil - Inicialização Local"
echo "=========================================="
echo ""

# Detectar IP local
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "📡 IP Local detectado: $LOCAL_IP"
echo ""

# Função para iniciar o backend
start_backend() {
    echo "🔧 Iniciando Backend..."
    cd backend

    # Verificar se venv existe
    if [ ! -d "venv" ]; then
        echo "📦 Criando ambiente virtual..."
        python3 -m venv venv
    fi

    # Ativar venv
    source venv/bin/activate

    # Instalar dependências
    echo "📥 Instalando dependências..."
    pip install -r requirements.txt > /dev/null 2>&1

    # Iniciar servidor
    echo "✅ Backend iniciado em http://0.0.0.0:8000"
    echo "📚 Documentação da API: http://localhost:8000/docs"
    echo ""
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
}

# Função para iniciar o mobile
start_mobile() {
    echo "📱 Iniciando Mobile..."
    cd mobile

    # Instalar dependências
    echo "📥 Instalando dependências..."
    npm install > /dev/null 2>&1

    echo "✅ Mobile iniciado!"
    echo "📱 Escaneie o QR code com o app Expo Go"
    echo ""
    npm start
}

# Menu
echo "Escolha uma opção:"
echo "1) Iniciar Backend"
echo "2) Iniciar Mobile"
echo "3) Iniciar Ambos (em abas separadas)"
echo ""
read -p "Opção: " option

case $option in
    1)
        start_backend
        ;;
    2)
        start_mobile
        ;;
    3)
        echo "⚠️  Abra duas abas do terminal e execute:"
        echo "   Aba 1: cd backend && source venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
        echo "   Aba 2: cd mobile && npm start"
        ;;
    *)
        echo "❌ Opção inválida"
        ;;
esac
