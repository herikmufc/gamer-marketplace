# 🚀 Guia de Migração para Supabase

## ✅ O Que Foi Feito Até Agora

1. ✅ Credenciais Supabase adicionadas ao `.env`
2. ✅ Dependências instaladas (`supabase==2.10.0`)
3. ✅ Schema SQL criado no Supabase (10 tabelas)
4. ✅ Storage configurado (4 buckets)
5. ✅ Cliente Supabase configurado (`supabase_client.py`)
6. ✅ Backend atualizado para Supabase (`main_supabase.py`)

---

## 📋 Próximos Passos

### 1. Obter Senha do Banco de Dados

A senha do PostgreSQL do Supabase é diferente das keys da API!

**Como obter:**
1. Acesse: [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em: **Settings** → **Database**
4. Role até **Connection string**
5. Clique em **"Reveal password"** ou copie a connection string
6. A senha estará visível

**Adicione ao `.env`:**
```bash
SUPABASE_DB_PASSWORD=sua_senha_postgres_aqui
```

---

### 2. Testar Conexão com Supabase

Execute este teste:

```bash
cd /home/madeinweb/gamer-marketplace/backend
source venv/bin/activate
python -c "from supabase_client import get_supabase_connection_string; print(get_supabase_connection_string())"
```

Se funcionar, verá a connection string completa.

---

### 3. Migrar Dados do SQLite → PostgreSQL

Vou criar um script de migração automática que:
- Lê todos os dados do SQLite
- Insere no PostgreSQL do Supabase
- Faz upload das imagens para Supabase Storage
- Mantém todos os IDs e relacionamentos

---

### 4. Atualizar o Backend

Há duas opções:

#### Opção A: Substituir main.py (Recomendado para produção)
```bash
cd backend
cp main.py main_old.py  # Backup
cp main_supabase.py main.py
```

#### Opção B: Rodar em paralelo (Teste)
```bash
cd backend
# Rodar versão Supabase na porta 8001
uvicorn main_supabase:app --host 0.0.0.0 --port 8001 --reload
```

---

### 5. Configurar Variáveis de Ambiente

Adicione ao `backend/.env`:

```bash
# Ativar Supabase
USE_SUPABASE=true

# Senha do Database (obter no dashboard)
SUPABASE_DB_PASSWORD=sua_senha_aqui

# URLs do Supabase (já configurado)
SUPABASE_URL=https://kpozlrvizpuekiteiece.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

---

## 🔄 Modo Híbrido (SQLite + Supabase)

O backend suporta **modo híbrido** durante a migração:

```bash
# No .env:
USE_SUPABASE=false  # Usa SQLite local
# ou
USE_SUPABASE=true   # Usa Supabase PostgreSQL
```

Isso permite:
- ✅ Testar Supabase sem perder dados locais
- ✅ Desenvolver localmente com SQLite
- ✅ Produção com Supabase

---

## 📊 Comparação: Antes vs Depois

| Recurso | SQLite (Antes) | Supabase (Depois) |
|---------|---------------|------------------|
| **Database** | Local (SQLite) | PostgreSQL (Cloud) |
| **Storage** | Base64 no DB | Supabase Storage (CDN) |
| **Auth** | JWT manual | Supabase Auth (opcional) |
| **Realtime** | WebSocket manual | Supabase Realtime |
| **Escalabilidade** | Limitada | Ilimitada |
| **Backup** | Manual | Automático (daily) |
| **Performance** | Local (rápido) | Cloud (CDN global) |
| **Custo** | $0 | $0-25/mês |

---

## 🎯 Estrutura Final

```
backend/
├── main.py                          # Backend principal (com Supabase)
├── main_old.py                      # Backup do original
├── supabase_client.py               # Cliente Supabase + helpers
├── supabase_schema.sql              # Schema PostgreSQL
├── supabase_storage_setup.md        # Guia de Storage
├── migrate_to_supabase.py           # Script de migração (próximo)
├── .env                             # Configurações
│   ├── USE_SUPABASE=true
│   ├── SUPABASE_URL=...
│   ├── SUPABASE_ANON_KEY=...
│   ├── SUPABASE_SERVICE_KEY=...
│   └── SUPABASE_DB_PASSWORD=...
└── requirements.txt                 # Dependências (+ supabase)
```

---

## 🧪 Checklist de Migração

- [x] Credenciais configuradas
- [x] Dependências instaladas
- [x] Schema criado no Supabase
- [x] Storage configurado
- [x] Cliente Supabase criado
- [ ] Senha do DB obtida
- [ ] Conexão testada
- [ ] Dados migrados (SQLite → PostgreSQL)
- [ ] Imagens migradas (base64 → Storage)
- [ ] Backend atualizado
- [ ] Testes realizados
- [ ] Mobile atualizado

---

## ⚡ Vantagens da Migração

### Performance
- ✅ **CDN Global**: Imagens servidas via CDN (mais rápido)
- ✅ **Connection Pooling**: PostgreSQL com pool de conexões
- ✅ **Índices otimizados**: Queries mais rápidas

### Escalabilidade
- ✅ **Suporta milhões de usuários**: PostgreSQL escala verticalmente
- ✅ **Storage ilimitado**: Pague apenas pelo uso
- ✅ **Realtime**: WebSockets nativos do Supabase

### Segurança
- ✅ **Row Level Security**: Usuários só veem seus dados
- ✅ **Políticas granulares**: Controle fino de acesso
- ✅ **SSL/TLS**: Todas as conexões criptografadas
- ✅ **Backup automático**: Daily backups

### Developer Experience
- ✅ **Dashboard visual**: Veja dados em tempo real
- ✅ **SQL Editor**: Execute queries no browser
- ✅ **Logs integrados**: Debug facilitado
- ✅ **API auto-gerada**: RESTful + GraphQL

---

## 🐛 Troubleshooting

### Erro: "connection refused"
- Verifique se a senha do DB está correta
- Teste a connection string manualmente

### Erro: "storage bucket not found"
- Certifique-se que criou os 4 buckets no dashboard

### Erro: "RLS policy violation"
- Revise as políticas de segurança
- Use `supabase_admin` para operações privilegiadas

### Performance lenta
- Verifique índices no PostgreSQL
- Use CDN para imagens (já configurado)
- Ative connection pooling

---

## 📞 Suporte

- **Docs Supabase**: https://supabase.com/docs
- **Status Supabase**: https://status.supabase.com
- **Comunidade**: https://github.com/supabase/supabase/discussions

---

## 🚀 Próximo: Script de Migração

Vou criar `migrate_to_supabase.py` que automatiza:
1. Leitura de dados do SQLite
2. Upload para Supabase PostgreSQL
3. Migração de imagens para Storage
4. Verificação de integridade

Execute quando estiver pronto!

---

**Status**: 🟡 Parcialmente completo (aguardando senha do DB)
**Última atualização**: 2026-03-31
