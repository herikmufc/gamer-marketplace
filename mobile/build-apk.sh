#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        📦 RetroTrade Brasil - Gerador de APK              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verificando configuração...${NC}"
echo ""

# Verificar se está no diretório mobile
if [ ! -f "app.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script de dentro da pasta 'mobile'${NC}"
    echo "cd /home/madeinweb/gamer-marketplace/mobile"
    exit 1
fi

# Verificar Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js encontrado: $(node -v)${NC}"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm encontrado: $(npm -v)${NC}"

# Verificar app.json
if [ ! -f "app.json" ]; then
    echo -e "${RED}❌ app.json não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ app.json encontrado${NC}"

# Verificar eas.json
if [ ! -f "eas.json" ]; then
    echo -e "${YELLOW}⚠ eas.json não encontrado, criando...${NC}"
    cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
EOF
    echo -e "${GREEN}✓ eas.json criado${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  ATENÇÃO: Configure o IP do backend antes!${NC}"
echo ""
echo "Edite: src/api/client.js"
echo "Linha 8: const API_URL = 'http://SEU_IP:8000';"
echo ""
echo "Descubra seu IP:"
echo -e "${BLUE}hostname -I | awk '{print \$1}'${NC}"
echo ""

read -p "Já configurou o IP? (s/n): " configured

if [ "$configured" != "s" ] && [ "$configured" != "S" ]; then
    echo ""
    echo -e "${YELLOW}Configure primeiro e execute novamente!${NC}"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📦 Escolha o método de build:${NC}"
echo ""
echo "1) EAS Build (Recomendado - Nuvem)"
echo "   • Mais fácil"
echo "   • APK pronto em ~20 min"
echo "   • Requer conta Expo (gratuita)"
echo ""
echo "2) Expo Go (Teste Rápido - Sem APK)"
echo "   • Teste imediato"
echo "   • Não gera APK"
echo "   • Precisa app Expo Go"
echo ""
echo "3) Cancelar"
echo ""

read -p "Escolha (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "${GREEN}🚀 Iniciando EAS Build${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo -e "${YELLOW}Passo 1: Login no Expo${NC}"
        echo ""
        echo "Será aberto um navegador para fazer login."
        echo "Se não tiver conta, crie em: https://expo.dev/signup"
        echo ""
        read -p "Pressione ENTER para continuar..."

        npx eas-cli login

        if [ $? -ne 0 ]; then
            echo ""
            echo -e "${RED}❌ Login falhou${NC}"
            exit 1
        fi

        echo ""
        echo -e "${YELLOW}Passo 2: Configurar projeto (primeira vez)${NC}"
        echo ""
        npx eas-cli build:configure

        echo ""
        echo -e "${YELLOW}Passo 3: Iniciar build do APK${NC}"
        echo ""
        echo "⏱️  Isso levará aproximadamente 20 minutos..."
        echo ""

        npx eas-cli build --platform android --profile preview

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "${GREEN}✅ Build concluído!${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Você receberá um link para download do APK."
        echo "Abra o link no celular e instale!"
        echo ""
        ;;

    2)
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "${GREEN}⚡ Iniciando Expo Go${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📱 No seu celular:"
        echo "1. Instale 'Expo Go' da Play Store"
        echo "2. Abra o app Expo Go"
        echo "3. Escaneie o QR Code que aparecerá"
        echo ""
        read -p "Pressione ENTER para continuar..."

        npx expo start
        ;;

    3)
        echo ""
        echo "Operação cancelada."
        exit 0
        ;;

    *)
        echo ""
        echo -e "${RED}Opção inválida${NC}"
        exit 1
        ;;
esac
