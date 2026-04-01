# 🚀 Quick Start - Testar no Celular

## Opção 1: Expo Go (Mais Rápido - 5 minutos)

### Passo 1: Backend
```bash
cd backend
source venv/bin/activate  # Já está criado
echo "ANTHROPIC_API_KEY=sk-ant-api03-SEU_KEY_AQUI" > .env
python main.py
```

### Passo 2: Descubra seu IP
```bash
# Linux/Mac:
hostname -I | awk '{print $1}'

# Anote o IP (ex: 192.168.1.100)
```

### Passo 3: Configure o Mobile
```bash
cd mobile

# Edite o arquivo:
nano src/api/client.js

# Linha 8, mude para:
const API_URL = 'http://SEU_IP:8000';  # Ex: http://192.168.1.100:8000
```

### Passo 4: Inicie o App
```bash
npx expo start
```

### Passo 5: No Celular
1. Instale **Expo Go** da Play Store
2. Escaneie o QR Code que apareceu no terminal
3. Aguarde o app carregar
4. Pronto! 🎉

---

## Opção 2: Build APK (20-30 minutos)

### Usando EAS Build (Cloud)

```bash
cd mobile

# Instalar EAS
npm install -g eas-cli

# Login
eas login

# Configurar
eas build:configure

# Build
eas build --platform android --profile preview

# Aguarde ~20 minutos
# Download do APK será fornecido ao final
```

### Instalar APK no celular
1. Abra o link fornecido pelo EAS no celular
2. Baixe o APK
3. Permita instalação de fontes desconhecidas
4. Instale
5. Abra o app

---

## ⚠️ Importante

### Antes de testar a IA:
1. Configure sua chave da Anthropic no backend/.env
2. Obtenha em: https://console.anthropic.com/
3. Custo: ~$0.03 por análise de produto

### Se o app não conectar:
1. Certifique-se que backend está rodando
2. Teste no navegador: http://SEU_IP:8000
3. Celular e computador devem estar na mesma rede WiFi
4. Firewall pode estar bloqueando porta 8000

---

## 📱 Teste Rápido (Sem IA)

Se você não tem API Key da Anthropic, o app ainda funciona!
A análise retornará valores padrão:
- Condição: 70/100
- Raridade: 50/100
- Preço: Calculado por fórmula simples

Para habilitar IA completa, adicione a chave no .env.

---

## 🎮 Fluxo de Teste

1. **Criar conta** (qualquer email/senha)
2. **Ver produtos** (inicialmente vazio)
3. **Criar anúncio**:
   - Título: "PlayStation 2 Slim"
   - Console: "PS2"
   - Categoria: Console
   - Adicionar 3-4 fotos
   - Clicar "Analisar com IA"
   - Aguardar resultado
   - Publicar
4. **Ver seu anúncio** na home
5. **Clicar no anúncio** para ver detalhes

---

## 🔧 Comandos Úteis

### Limpar cache do Expo:
```bash
cd mobile
npx expo start -c
```

### Reiniciar backend:
```bash
cd backend
# Ctrl+C para parar
python main.py
```

### Ver logs do backend:
```bash
cd backend
tail -f nohup.out  # Se estiver rodando em background
```

### Resetar banco de dados:
```bash
cd backend
rm gamer_marketplace.db
python main.py  # Cria novo DB
```

---

Pronto para testar! 🚀
