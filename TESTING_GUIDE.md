# 🧪 Guia de Teste - Passo a Passo

## Cenário de Teste Completo

Vamos simular a jornada completa de um usuário usando o app.

## 📱 Teste 1: Criar Conta e Fazer Login

### 1.1 Abrir o App
```
Tela de Login aparecerá automaticamente
```

### 1.2 Criar Conta
```
1. Clique em "Cadastre-se"
2. Preencha:
   Nome: João Silva
   Email: joao@teste.com
   Usuário: joaosilva
   Senha: 123456
3. Clique em "Cadastrar"
4. ✅ Deve fazer login automaticamente
```

### 1.3 Verificar Perfil
```
1. Clique na aba "Perfil" (👤)
2. Deve mostrar:
   - Seu nome
   - @joaosilva
   - ⭐ 0 pontos
3. ✅ Perfil criado com sucesso
```

---

## 🎮 Teste 2: Criar Anúncio com IA

### 2.1 Iniciar Criação
```
1. Na Home, clique no botão "+" (roxo, canto inferior direito)
2. Tela "Anunciar Produto" abre
```

### 2.2 Adicionar Fotos
```
1. Clique em "📸 Adicionar fotos"
2. Escolha 3-5 fotos de um console/jogo
   (Pode usar fotos da internet como teste)
3. ✅ Miniaturas aparecem abaixo
```

### 2.3 Preencher Informações
```
Título: PlayStation 2 Slim Prata
Categoria: Console (clique no chip)
Console: PS2
Descrição:
  Console PlayStation 2 Slim na cor prata.
  Pouco usado, em excelente estado.
  Acompanha controle original e cabos.

Condição:
  ✅ Funcionando: ON
  ❌ Completo (CIB): OFF
  ✅ Com caixa: ON
  ❌ Com manual: OFF
```

### 2.4 Analisar com IA
```
1. Clique em "🤖 Analisar com IA"
2. Loading aparece (15-30 segundos)
3. ✅ Resultado mostra:
   - Condição: 78/100
   - Raridade: 45/100
   - Preço sugerido: R$ 350,00
   - Insights da IA
```

### 2.5 Publicar
```
1. Revise o preço sugerido
2. Clique em "Publicar Anúncio"
3. ✅ Sucesso! Volta para Home
```

---

## 🔍 Teste 3: Buscar e Visualizar Produtos

### 3.1 Ver Seu Anúncio
```
1. Na Home, role a lista
2. ✅ Seu produto aparece:
   - Foto (ou 📦 placeholder)
   - Título: PlayStation 2 Slim Prata
   - PS2
   - 78/100
   - ✓ Funcionando
   - R$ 350,00
   - Por: joaosilva
```

### 3.2 Abrir Detalhes
```
1. Clique no card do produto
2. ✅ Tela de detalhes abre com:
   - Galeria de fotos
   - Título e console
   - Preço
   - Scores (Condição, Raridade, Visualizações)
   - Badges (Funcionando, Com Caixa)
   - Descrição completa
   - Informações do vendedor
   - Botão "💬 Contatar Vendedor"
```

### 3.3 Testar Busca
```
1. Volte para Home (botão ←)
2. Na barra de busca, digite: "playstation"
3. Clique em 🔍
4. ✅ Seu produto aparece nos resultados
```

### 3.4 Filtrar por Categoria
```
1. Clique nos chips de categoria:
   - Consoles (🕹️)
   - Jogos (👾)
   - Periféricos (🎧)
2. ✅ Lista filtra conforme categoria
```

---

## 👥 Teste 4: Múltiplos Usuários

### 4.1 Criar Segundo Usuário
```
1. Perfil > Sair
2. Cadastre novo usuário:
   Nome: Maria Gamer
   Email: maria@teste.com
   Usuário: mariagamer
   Senha: 123456
```

### 4.2 Ver Produtos de Outros
```
1. Na Home, veja produtos de "joaosilva"
2. Clique para ver detalhes
3. ✅ Informações do vendedor aparecem
4. Clique em "Contatar Vendedor"
   (Implementação futura: abre chat)
```

---

## 🎯 Teste 5: Diferentes Tipos de Produtos

### 5.1 Anunciar um Jogo
```
Título: God of War II (PS2)
Categoria: Jogo
Console: PS2
Funcionando: Sim
Completo: Sim (com manual e caixa)

✅ IA deve retornar:
- Condição baseada em fotos
- Raridade mais alta (jogo completo)
- Preço menor que console
```

### 5.2 Anunciar Periférico
```
Título: Controle DualShock 2 Original
Categoria: Periférico
Console: PS2
Funcionando: Sim
Completo: Não

✅ IA deve retornar:
- Preço base menor
- Análise focada em botões/analógicos
```

---

## 🐛 Teste 6: Casos de Erro

### 6.1 Criar Anúncio Sem Fotos
```
1. Tente criar anúncio sem adicionar fotos
2. Clique "Analisar com IA"
3. ✅ Erro: "Adicione pelo menos uma foto"
```

### 6.2 Login com Credenciais Erradas
```
1. Sair do app
2. Tentar login com senha errada
3. ✅ Erro: "Incorrect username or password"
```

### 6.3 Backend Offline
```
1. Pare o backend (Ctrl+C)
2. Tente fazer login
3. ✅ Erro de conexão
```

---

## 📊 Teste 7: Validar Análise de IA

### 7.1 Console em Ótimo Estado
```
Fotos: Console limpo, sem arranhões
✅ Espera-se:
- Condição: 85-95/100
- Insights: "Excelente estado!"
- Preço: Acima da média
```

### 7.2 Console com Defeitos
```
Funciona: NÃO
Fotos: Console amarelado, arranhado
✅ Espera-se:
- Condição: 40-60/100
- Insights: "Estado comprometido..."
- Preço: Bem abaixo da média (-70%)
```

### 7.3 Item Raro
```
Console: Dreamcast ou Neo Geo
Completo: Sim
✅ Espera-se:
- Raridade: 80-100/100
- Insights: "Item muito raro!"
- Preço: Significativamente maior
```

---

## 🔄 Teste 8: Refresh e Persistência

### 8.1 Fechar e Reabrir App
```
1. Feche o app completamente
2. Abra novamente
3. ✅ Deve continuar logado (JWT token persistido)
4. ✅ Produtos ainda aparecem
```

### 8.2 Pull to Refresh
```
1. Na Home, puxe a lista para baixo
2. ✅ Loading aparece
3. ✅ Lista atualiza
```

---

## 📱 Teste 9: Diferentes Dispositivos

### 9.1 Emulador Android
```
1. npx expo start
2. Pressione 'a'
3. ✅ App abre no emulador
   (Use IP: 10.0.2.2:8000)
```

### 9.2 Celular Físico (Expo Go)
```
1. Instale Expo Go
2. Escaneie QR Code
3. ✅ App carrega
   (Requer IP local do computador)
```

### 9.3 APK Instalado
```
1. Gere APK: eas build
2. Instale no celular
3. ✅ App roda standalone
   (Não precisa Expo Go)
```

---

## ⏱️ Teste 10: Performance

### 10.1 Análise de IA
```
Tempo esperado: 15-30 segundos
✅ Loading indicator deve aparecer
✅ Sem travamentos
```

### 10.2 Lista de Produtos
```
Com 20+ produtos:
✅ Scroll suave
✅ Imagens carregam progressivamente
```

### 10.3 Navegação
```
Transições entre telas:
✅ Instantâneas
✅ Sem delay
```

---

## ✅ Checklist Geral

### Funcionalidades Básicas
- [ ] Criar conta
- [ ] Fazer login
- [ ] Ver perfil
- [ ] Criar anúncio
- [ ] Adicionar fotos
- [ ] Analisar com IA
- [ ] Ver lista de produtos
- [ ] Buscar produtos
- [ ] Filtrar por categoria
- [ ] Ver detalhes do produto
- [ ] Fazer logout

### Validações
- [ ] IA retorna scores corretos
- [ ] Preços fazem sentido
- [ ] Erros são tratados
- [ ] Loading states aparecem
- [ ] Imagens carregam

### UX
- [ ] Interface responsiva
- [ ] Botões funcionam
- [ ] Navegação intuitiva
- [ ] Feedback visual
- [ ] Textos legíveis

---

## 🎬 Fluxo de Teste Rápido (5 min)

```bash
# 1. Criar conta → Login automático (30s)
# 2. Criar 1 anúncio com IA (2min)
# 3. Ver na lista (10s)
# 4. Abrir detalhes (10s)
# 5. Buscar produto (10s)
# 6. Filtrar categoria (10s)
# 7. Ver perfil (10s)
# 8. Logout (5s)

Total: ~5 minutos
```

---

## 📝 Reportar Bugs

Se encontrar problemas:

```markdown
**Bug**: [Título curto]

**Passos para reproduzir**:
1. Fazer login
2. Criar anúncio
3. Erro aparece

**Esperado**: Anúncio ser criado
**Obtido**: Erro "Network failed"

**Logs**:
[Cole logs do terminal]

**Device**: Pixel 5 / Android 14
**Versão App**: 1.0.0
```

---

**Bom teste! 🧪🚀**

Se todos os testes passarem, seu app está pronto para uso!
