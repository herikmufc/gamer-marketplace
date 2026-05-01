# 🚀 Deploy Gemini AI para Render

**Status:** ✅ Código enviado para GitHub  
**Próximo Passo:** Adicionar variável de ambiente no Render

---

## 📋 Passo a Passo

### 1. **Acessar Dashboard do Render**

1. Acesse: https://dashboard.render.com/
2. Faça login com sua conta
3. Encontre seu serviço: **gamer-marketplace**

### 2. **Adicionar Variável de Ambiente**

1. Clique no serviço **gamer-marketplace**
2. Vá em **Environment** (menu lateral esquerdo)
3. Clique em **Add Environment Variable**
4. Adicione:

```
Key:   GEMINI_API_KEY
Value: AIzaSyDbUCY-0QPUjHl5EWt9Zd8nSbqM1SWALag
```

5. Clique em **Save Changes**

### 3. **Aguardar Deploy Automático**

O Render vai:
- ✅ Detectar o push no GitHub
- ✅ Baixar o código novo
- ✅ Instalar dependências (`google-generativeai`)
- ✅ Reiniciar o serviço
- ⏱️ Tempo estimado: 3-5 minutos

### 4. **Verificar se Funcionou**

Abra no navegador:
```
https://gamer-marketplace.onrender.com/health
```

Você deve ver:
```json
{
  "status": "healthy",
  "gemini_api": "configured",
  "gemini_model": "gemini-2.5-flash"
}
```

---

## 📱 Testar no App

Após o deploy:

1. Abra o app RetroTrade Brasil
2. Vá em **Identificar Jogo**
3. Tire uma foto de um jogo
4. A IA deve identificar automaticamente! 🎮

---

## ⚠️ Se Não Funcionar

### Erro: "cold start"
- O Render pode demorar ~30s na primeira chamada
- Tente novamente após alguns segundos

### Erro: "GEMINI_API_KEY não configurada"
- Verifique se adicionou a variável corretamente
- Certifique-se de clicar em "Save Changes"
- Reinicie manualmente o serviço:
  - Dashboard → Seu serviço → Menu (⋮) → Manual Deploy

### Erro: "404 model not found"
- Aguarde o deploy completo terminar
- Verifique os logs do Render:
  - Dashboard → Seu serviço → Logs

---

## 🔍 Monitorar Logs

Para ver o que está acontecendo:

1. Dashboard do Render
2. Clique no seu serviço
3. Vá em **Logs** (menu lateral)
4. Você deve ver:
   - `✅ Google Gemini API configurada`
   - `INFO: Application startup complete`

---

## 📊 Recursos Disponíveis

Após o deploy, seu app terá:

✅ **Identificação de Jogos** - Análise automática de fotos  
✅ **Chatbot de Manutenção** - Assistente para reparos  
✅ **Dicas Preventivas** - Cuidados com consoles  
✅ **Moderação de Conteúdo** - Detecção de fraudes  
✅ **Descoberta de Eventos** - Busca inteligente de eventos  

---

## 🆘 Suporte

Se precisar de ajuda:
- Verifique os logs do Render
- Teste o endpoint `/health` no navegador
- Confirme que a variável de ambiente foi salva

**Deploy em andamento agora!** ⚙️ Aguarde 3-5 minutos.
