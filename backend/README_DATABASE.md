# 🗄️ Setup do Banco de Dados - RetroTrade Brasil

## 📋 Como Criar as Tabelas no Supabase

### Passo 1: Acessar o SQL Editor

1. Acesse: https://supabase.com/dashboard/project/nxbgvdhzbfmjsnvkqmhj
2. No menu lateral, clique em **"SQL Editor"**
3. Clique em **"New Query"**

### Passo 2: Executar o Script

1. Abra o arquivo [create_tables.sql](create_tables.sql)
2. Copie **TODO** o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione `Ctrl + Enter`)

### Passo 3: Verificar

Após a execução, você verá:

```
✅ 10 tabelas criadas
✅ 30+ índices criados
✅ 5 triggers criados
✅ Query executada com sucesso
```

No final do script, será exibida uma tabela com a contagem de registros (todos zerados inicialmente).

---

## 📊 Tabelas Criadas (10 tabelas)

### 1. **users**
Usuários do sistema
- email, username, cpf (únicos)
- hashed_password (bcrypt)
- reputation_score, is_technician
- terms_accepted_at, terms_version

### 2. **products**
Produtos à venda
- title, description, category
- console_type, final_price
- condition_score, rarity_score
- is_working, is_complete, has_box, has_manual
- images (JSON), ai_analysis (JSON)
- owner_id → users

### 3. **transactions**
Transações/Pagamentos
- product_id, buyer_id, seller_id
- amount, platform_fee
- payment_id (Mercado Pago)
- status, tracking_code
- verification_video_url
- ai_verification_result

### 4. **chat_rooms**
Salas de chat
- product_id, buyer_id, seller_id
- last_message_at, is_active

### 5. **chat_messages**
Mensagens de chat
- room_id, sender_id
- message_type (text, image, video)
- content, is_read

### 6. **chat_alerts**
Alertas de moderação IA
- room_id, message_id, user_id
- alert_type, risk_score
- detected_patterns (JSON)
- is_resolved

### 7. **forum_posts**
Posts do fórum
- author_id, category
- title, content
- likes_count, views_count
- is_pinned, is_locked

### 8. **forum_comments**
Comentários do fórum
- post_id, author_id
- content, parent_comment_id
- likes_count

### 9. **events**
Eventos de jogos retro
- title, description, event_type
- city, state, event_date
- organizer, contact_info

### 10. **event_interests**
Interesse em eventos (Many-to-Many)
- event_id, user_id

---

## 🔒 Row Level Security (RLS)

O script inclui **políticas RLS comentadas**.

Por padrão, o RLS está **desabilitado** para facilitar o desenvolvimento. Para produção, recomenda-se habilitar:

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- etc...

-- Criar políticas
CREATE POLICY "Produtos públicos são visíveis"
    ON products FOR SELECT
    USING (is_sold = false);
```

---

## 🧪 Testar Após Criar as Tabelas

### Opção 1: Script Automatizado

```bash
cd /home/madeinweb/gamer-marketplace
python3 test_api.py
```

**Resultado esperado**: 7/7 testes passando (100%)

### Opção 2: Teste Manual

```bash
# Registrar usuário
curl -X POST https://gamer-marketplace.onrender.com/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "username": "teste",
    "password": "senha123",
    "full_name": "Teste User",
    "cpf": "12345678909",
    "phone": "11999999999"
  }'

# Deve retornar 200 OK com dados do usuário
```

---

## 🔧 Troubleshooting

### Erro: "relation already exists"

**Solução**: Tabelas já foram criadas. Se quiser recriar:

1. Descomente as linhas `DROP TABLE` no início do script
2. Execute novamente
3. ⚠️ **CUIDADO**: Isso apaga todos os dados!

### Erro: "permission denied"

**Solução**: Verifique se está usando a Service Key, não a Anon Key:

1. Vá em **Settings → API**
2. Use a **service_role key** (não a anon key)
3. Configure no `.env`:
   ```bash
   SUPABASE_KEY=<service_role_key_aqui>
   ```

### Erro: "syntax error"

**Solução**: Certifique-se de copiar TODO o script, do início ao fim.

---

## 📝 Dados de Teste (Opcional)

Para popular com dados de teste, descomente a seção **"DADOS DE TESTE"** no final do script:

```sql
-- INSERT INTO users (email, username, cpf, phone, hashed_password, full_name, terms_accepted_at, terms_version)
-- VALUES
--     ('admin@retrotrade.com', 'admin', '12345678909', ...);
```

**Senha padrão dos usuários de teste**: `senha123`

---

## 🚀 Próximos Passos

Após criar as tabelas:

1. ✅ Executar testes: `python3 test_api.py`
2. ✅ Fazer build do APK: `cd mobile && eas build --platform android --profile preview`
3. ✅ Testar app completo no celular

---

## 📚 Referências

- **Documentação Supabase**: https://supabase.com/docs/guides/database
- **Schema Completo**: Ver `main.py` linhas 82-210
- **Testes Automatizados**: `test_api.py`

---

**Criado por**: Claude Sonnet 4.5
**Data**: 2026-04-01
**Versão**: 1.0.0
