# ✅ Checklist de Testes Manuais - RetroTrade Brasil

Use este checklist para testar o app no navegador: **http://localhost:19006**

---

## 🔐 1. AUTENTICAÇÃO

### Login
- [ ] Abrir o app no navegador
- [ ] Fazer login com: **gamer** / **123456**
- [ ] Verificar se entra na tela principal
- [ ] Fazer logout
- [ ] Tentar login com senha errada (deve rejeitar)

### Registro
- [ ] Clicar em "Cadastre-se"
- [ ] Preencher todos os campos
- [ ] Usar CPF válido (ex: 52998224725)
- [ ] Verificar se registra e faz auto-login

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 🛒 2. MARKETPLACE

### Listar Produtos
- [ ] Na tela inicial, ver lista de produtos
- [ ] Verificar se mostra "Nenhum produto" (banco vazio)
- [ ] Scroll funciona corretamente

### Criar Produto
- [ ] Clicar no botão "+" ou "Criar Produto"
- [ ] Preencher título: "Super Mario World"
- [ ] Preencher descrição: "Cartucho SNES original"
- [ ] Selecionar console: "Super Nintendo"
- [ ] Definir preço: 150
- [ ] Tirar/escolher foto
- [ ] Verificar se produto é criado
- [ ] Voltar à lista e ver o produto criado

### Detalhes do Produto
- [ ] Clicar em um produto
- [ ] Ver informações completas
- [ ] Ver imagens
- [ ] Botão de comprar visível

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 🔍 3. BUSCA

- [ ] Usar campo de busca
- [ ] Buscar por "Mario"
- [ ] Ver resultados filtrados
- [ ] Limpar busca
- [ ] Buscar por console específico

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 🤖 4. IDENTIFICAÇÃO DE JOGO (IA)

- [ ] Ir em "Criar Produto"
- [ ] Clicar em "Identificar Jogo"
- [ ] Tirar/selecionar foto de um jogo
- [ ] Aguardar resposta da IA
- [ ] Verificar se identifica corretamente
- [ ] Aceitar sugestão da IA
- [ ] Campos preenchidos automaticamente

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 💬 5. CHAT

### Criar Conversa
- [ ] Abrir um produto
- [ ] Clicar em "Conversar com vendedor"
- [ ] Verificar se abre sala de chat

### Enviar Mensagens
- [ ] Digitar mensagem
- [ ] Enviar mensagem
- [ ] Ver mensagem na lista
- [ ] Abrir em outra aba/janela anônima
- [ ] Fazer login com outro usuário
- [ ] Ver mensagens do primeiro usuário
- [ ] Responder

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 📝 6. FÓRUM

### Listar Posts
- [ ] Ir na aba "Fórum"
- [ ] Ver lista de categorias/posts
- [ ] Verificar se mostra vazio (normal)

### Criar Post
- [ ] Clicar em "Criar Tópico"
- [ ] Preencher título
- [ ] Escrever conteúdo
- [ ] Selecionar categoria
- [ ] Publicar
- [ ] Ver post na lista

### Comentar
- [ ] Abrir um post
- [ ] Escrever comentário
- [ ] Publicar
- [ ] Ver comentário no post

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 🎉 7. EVENTOS

### Listar Eventos
- [ ] Ir na aba "Eventos"
- [ ] Ver lista de eventos
- [ ] Verificar se mostra vazio (normal)

### Descobrir Eventos (IA)
- [ ] Clicar em "Descobrir Eventos"
- [ ] Selecionar estado (SP)
- [ ] Aguardar IA buscar eventos
- [ ] Ver eventos sugeridos pela IA

### Marcar Interesse
- [ ] Abrir um evento
- [ ] Clicar em "Tenho Interesse"
- [ ] Verificar se marca interesse
- [ ] Clicar novamente para remover

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 🎮 8. BIBLIOTECA DE CHEATS

### Listar Cheats
- [ ] Ir na aba "Cheats"
- [ ] Ver lista de cheats
- [ ] Verificar se mostra pelo menos 1 cheat

### Buscar Cheat
- [ ] Usar campo de busca
- [ ] Buscar por jogo: "Mario"
- [ ] Ver resultados filtrados
- [ ] Filtrar por console

### Ver Detalhes
- [ ] Clicar em um cheat
- [ ] Ver códigos completos
- [ ] Ver instruções de uso
- [ ] Copiar código (se tiver botão)

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 🛠️ 9. ASSISTENTE DE MANUTENÇÃO (IA)

### Iniciar Sessão
- [ ] Ir na aba "Ajuda" ou "Manutenção"
- [ ] Ver mensagem de boas-vindas
- [ ] Selecionar console: "Super Nintendo"

### Fazer Perguntas
- [ ] Perguntar: "Como limpar o cartucho?"
- [ ] Aguardar resposta da IA
- [ ] Verificar se resposta é relevante
- [ ] Fazer outra pergunta

### Enviar Foto
- [ ] Clicar em "Enviar foto"
- [ ] Tirar/selecionar foto de problema
- [ ] IA deve analisar e dar diagnóstico
- [ ] Verificar se resposta é útil

### Obter Dicas
- [ ] Clicar em "Dicas de Manutenção"
- [ ] Ver dicas para o console selecionado
- [ ] Dicas são específicas e úteis

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 👤 10. PERFIL DE USUÁRIO

### Ver Perfil
- [ ] Ir na aba "Perfil"
- [ ] Ver dados do usuário
- [ ] Ver CPF mascarado (xxx.xxx.xxx-**)
- [ ] Ver endereço
- [ ] Ver reputação

### Editar Perfil
- [ ] Clicar em "Editar"
- [ ] Alterar nome
- [ ] Alterar endereço
- [ ] Salvar
- [ ] Verificar se salvou

### Meus Produtos
- [ ] Ver lista de produtos do usuário
- [ ] Editar produto
- [ ] Excluir produto

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 💳 11. MERCADO PAGO

### Conectar Conta
- [ ] Ir em Perfil → Mercado Pago
- [ ] Ver status de conexão (Não conectado)
- [ ] Clicar em "Conectar"
- [ ] Ver URL de OAuth (requer credenciais de produção)

### Criar Venda
- [ ] Criar produto para venda
- [ ] Definir preço
- [ ] Publicar
- [ ] Outro usuário tentar comprar
- [ ] Verificar se gera pagamento MP

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou  
**Nota**: OAuth completo requer credenciais de produção

---

## 🎯 12. FLUXO COMPLETO DE COMPRA/VENDA

### Como Vendedor
- [ ] Criar produto com foto
- [ ] Definir preço
- [ ] Publicar
- [ ] Aguardar comprador entrar em contato
- [ ] Negociar via chat
- [ ] Receber pagamento
- [ ] Marcar como enviado
- [ ] Informar código de rastreio

### Como Comprador
- [ ] Buscar produto
- [ ] Ver detalhes
- [ ] Conversar com vendedor via chat
- [ ] Comprar produto
- [ ] Fazer pagamento (Mercado Pago)
- [ ] Aguardar envio
- [ ] Receber produto
- [ ] Enviar vídeo de verificação
- [ ] Confirmar recebimento

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 🎨 13. INTERFACE E USABILIDADE

### Design
- [ ] Interface retro/nostálgica funcionando
- [ ] Cores amarelo/roxo aplicadas
- [ ] Ícones customizados visíveis
- [ ] Fontes legíveis

### Navegação
- [ ] Tabs na parte inferior funcionando
- [ ] Transições suaves entre telas
- [ ] Botões responsivos
- [ ] Scroll funciona bem

### Responsividade
- [ ] Testar em janela maximizada
- [ ] Testar em janela pequena
- [ ] Testar em modo mobile (F12 → Device Toolbar)
- [ ] Layout adapta corretamente

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 🐛 14. TESTES DE ERRO

### Validações
- [ ] Tentar criar produto sem título
- [ ] Tentar criar produto sem imagem
- [ ] Tentar enviar mensagem vazia
- [ ] Tentar criar post sem conteúdo
- [ ] Ver mensagens de erro apropriadas

### Offline/Rede
- [ ] Desconectar internet
- [ ] Tentar carregar dados
- [ ] Ver mensagem de erro de rede
- [ ] Reconectar
- [ ] Verificar se volta a funcionar

**Status**: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 📊 RESUMO DOS TESTES

Preencha após completar todos os testes:

| Funcionalidade | Status |
|----------------|--------|
| 1. Autenticação | ⬜ |
| 2. Marketplace | ⬜ |
| 3. Busca | ⬜ |
| 4. Identificação IA | ⬜ |
| 5. Chat | ⬜ |
| 6. Fórum | ⬜ |
| 7. Eventos | ⬜ |
| 8. Cheats | ⬜ |
| 9. Assistente IA | ⬜ |
| 10. Perfil | ⬜ |
| 11. Mercado Pago | ⬜ |
| 12. Fluxo Completo | ⬜ |
| 13. Interface | ⬜ |
| 14. Testes de Erro | ⬜ |

**Total**: __ / 14 funcionalidades testadas

---

## 📝 ANOTAÇÕES

Use este espaço para anotar bugs encontrados ou melhorias sugeridas:

```
Bug #1:
- Onde: [tela/funcionalidade]
- O que aconteceu: [descrição]
- O que deveria acontecer: [esperado]
- Como reproduzir: [passos]

Bug #2:
...
```

---

## 🚀 PRÓXIMOS PASSOS

Após completar o checklist:

1. ✅ Revisar bugs encontrados
2. ✅ Priorizar correções
3. ✅ Testar novamente após correções
4. ✅ Popular banco com mais dados
5. ✅ Preparar para produção

---

**Última atualização**: 26/04/2026  
**Responsável pelos testes**: [Seu Nome]
