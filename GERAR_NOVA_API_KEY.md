# 🔑 Como Gerar Nova API Key do Gemini

**URGENTE:** API Key atual foi bloqueada por vazamento

---

## 📋 Passo a Passo

### **1. Acessar Google AI Studio**
```
https://aistudio.google.com/app/apikey
```

### **2. Revogar Chave Antiga**
- Encontre a chave: `AIzaSyDbUCY...`
- Clique nos 3 pontos (⋮)
- Selecione **"Revoke"** ou **"Delete"**
- Confirme

### **3. Criar Nova Chave**
- Clique em **"Create API Key"**
- Selecione **"Create API key in new project"** (ou use projeto existente)
- Aguarde ~5 segundos
- **COPIE A NOVA CHAVE** (começa com `AIza...`)

---

## 🔧 Atualizar no Projeto

### **Opção 1: Backend Local**
```bash
cd backend
nano .env

# Alterar a linha:
GEMINI_API_KEY=NOVA_CHAVE_AQUI

# Salvar: Ctrl+O, Enter, Ctrl+X
# Reiniciar backend
```

### **Opção 2: Render (Produção)**
1. Dashboard: https://dashboard.render.com/
2. Selecione: **gamer-marketplace**
3. Menu lateral: **Environment**
4. Encontre: `GEMINI_API_KEY`
5. Clique em **Edit**
6. Cole a nova chave
7. **Save Changes**
8. Aguarde auto-deploy (~3 min)

---

## ⚠️ IMPORTANTE: Evitar Novos Vazamentos

### **O que NÃO fazer:**
❌ Commitar arquivo `.env` no Git  
❌ Compartilhar chave em print/screenshot  
❌ Postar chave em chat/fórum  
❌ Deixar chave hardcoded no código  

### **O que fazer:**
✅ Manter `.env` no `.gitignore`  
✅ Usar variáveis de ambiente no servidor  
✅ Nunca compartilhar chaves publicamente  
✅ Usar secrets managers em produção  

---

## 🔍 Como Evitar Vazamentos

### **Verificar se .env está no .gitignore:**
```bash
cat .gitignore | grep .env
# Deve mostrar: .env
```

### **Se não estiver, adicionar:**
```bash
echo ".env" >> .gitignore
git rm --cached backend/.env
git commit -m "Remove .env from repo"
```

### **Verificar histórico do Git:**
```bash
# Ver se .env foi commitado antes
git log --all --full-history -- backend/.env

# Se foi, precisa limpar histórico (avançado)
```

---

## ✅ Teste Após Atualizar

```bash
# Testar localmente
curl http://localhost:8000/health

# Testar produção
curl https://gamer-marketplace.onrender.com/health

# Ambos devem mostrar:
# "gemini_api": "configured"
```

---

## 🆘 Se Tiver Problemas

### Erro 403 persiste?
- Aguarde 5 minutos após trocar a chave
- Limpe cache do navegador/app
- Reinicie o backend completamente

### Nova chave também bloqueada?
- Verifique se não há outro lugar com a chave exposta
- Procure por "AIza" no repositório GitHub
- Remova da descrição do projeto, issues, PRs

---

**Tempo estimado:** 5 minutos  
**Prioridade:** 🔴 CRÍTICA  
**Impacto:** Sem nova chave = IA não funciona
