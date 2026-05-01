# 🌐 Como Abrir o App no Navegador

## ✅ Pronto para Usar!

O app já está configurado para rodar no navegador! Não precisa de emulador, APK ou Expo Go.

---

## 🚀 Iniciando o App Web

### Opção 1: Script Rápido (Recomendado)

```bash
cd mobile
./start-web.sh
```

### Opção 2: Comando Manual

```bash
cd mobile
npm run web
```

---

## 📱 Acessando o App

Depois de rodar o comando acima:

1. **Aguarde a compilação** (primeira vez pode demorar ~30 segundos)
2. O navegador abrirá automaticamente em: **`http://localhost:19006`**
3. Se não abrir sozinho, acesse manualmente: http://localhost:19006

---

## 🎮 Testando o App

Agora você pode:

- ✅ Criar conta e fazer login
- ✅ Ver produtos à venda
- ✅ Criar novos produtos (upload de imagem funciona!)
- ✅ Usar o chat
- ✅ Navegar no fórum
- ✅ Ver eventos
- ✅ Acessar a biblioteca de cheats
- ✅ Usar o assistente de manutenção

---

## ⚠️ Limitações da Versão Web

Algumas funcionalidades mobile não funcionam 100% no navegador:

### ❌ Não Funcionam:
- **Câmera ao vivo**: Use o botão "Escolher da Galeria" ou faça upload de arquivo
- **Notificações push**: Não suportadas no navegador
- **Gestos nativos**: Alguns gestos touch podem não funcionar

### ✅ Funcionam Perfeitamente:
- Autenticação
- Upload de fotos (via seletor de arquivos)
- Chat
- Pagamentos (Mercado Pago)
- IA (Gemini, Claude)
- Fórum
- Eventos
- Biblioteca de cheats

---

## 🔄 Atualizações Automáticas

Com o servidor rodando, qualquer alteração no código será recarregada automaticamente no navegador (Hot Reload)!

---

## 🛑 Parar o Servidor

Pressione `Ctrl + C` no terminal onde o servidor está rodando.

---

## 🐛 Problemas Comuns

### Porta 19006 já está em uso

```bash
# Matar processo na porta
lsof -ti:19006 | xargs kill -9
# Ou usar outra porta
npm run web -- --port 19007
```

### Erro de compilação

```bash
# Limpar cache e reinstalar
cd mobile
rm -rf node_modules package-lock.json
npm install
npm run web
```

### Página em branco

1. Abra o Console do navegador (F12)
2. Verifique se há erros
3. Tente recarregar a página (Ctrl+R)
4. Limpe o cache do navegador (Ctrl+Shift+R)

---

## 📊 Inspecionar o App

Abra as **Ferramentas de Desenvolvedor** do navegador (F12) para:

- Ver logs do console
- Inspecionar elementos
- Testar responsividade mobile
- Debugar código
- Ver requisições de rede

---

## 📱 Simular Dispositivo Mobile

No Chrome/Edge:
1. Pressione `F12`
2. Clique no ícone de **Toggle Device Toolbar** (Ctrl+Shift+M)
3. Escolha um dispositivo (iPhone, Android, etc.)

Isso simula a tela e interações mobile!

---

## 🌍 Conectar Backend

Por padrão, o app está configurado para usar o backend em **produção** (Render).

Para testar com backend **local**:

1. Edite: [`mobile/src/config/environment.js`](mobile/src/config/environment.js:5)
2. Mude: `const ENV = 'local';`
3. Salve o arquivo
4. O app recarregará automaticamente

---

## 🎯 URLs Importantes

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **App Web** | http://localhost:19006 | Interface do app |
| **Metro Bundler** | http://localhost:8081 | Servidor de desenvolvimento |
| **Backend Produção** | https://gamer-marketplace.onrender.com | API em produção |
| **Backend Local** | http://localhost:8000 | API local (se rodando) |
| **API Docs** | http://localhost:8000/docs | Documentação da API (backend local) |

---

## 📸 Recursos Visuais

### Desktop (1920x1080)
Tela cheia, layout otimizado para mouse

### Tablet (768x1024)
Layout adaptativo, combinação de touch e mouse

### Mobile (375x667)
Layout mobile completo, otimizado para toque

---

## 💡 Dicas Pro

### Usar com 2 Monitores
- **Monitor 1**: Navegador com o app
- **Monitor 2**: VS Code + Terminal

### Testar Múltiplos Usuários
- **Janela Normal**: Usuário 1
- **Janela Anônima**: Usuário 2
- Teste chat, transações, etc.

### Debug Rápido
```javascript
// Adicione no código para ver logs
console.log('🔍 Debug:', variavel);
```
Logs aparecem no Console do navegador (F12)

---

## ✅ Pronto!

Agora você pode desenvolver e testar o app **direto no navegador**, sem precisar de:
- ❌ Emulador Android/iOS
- ❌ Expo Go
- ❌ Build de APK/IPA
- ❌ Dispositivo físico

Basta rodar `npm run web` e começar! 🚀

---

**Última atualização**: 25/04/2026
