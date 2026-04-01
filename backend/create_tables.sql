-- ============================================
-- RETROTRADE BRASIL - Database Schema
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/nxbgvdhzbfmjsnvkqmhj
-- ============================================

-- Limpar tabelas existentes (use com cuidado!)
-- DROP TABLE IF EXISTS event_interests CASCADE;
-- DROP TABLE IF EXISTS chat_alerts CASCADE;
-- DROP TABLE IF EXISTS forum_comments CASCADE;
-- DROP TABLE IF EXISTS forum_posts CASCADE;
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS chat_rooms CASCADE;
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hashed_password TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    reputation_score INTEGER DEFAULT 0,
    is_technician BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    terms_accepted_at TIMESTAMP,
    terms_version VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);

-- ============================================
-- TABELA: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    console_type VARCHAR(100),
    condition_score FLOAT DEFAULT 70.0,
    rarity_score FLOAT DEFAULT 50.0,
    price_min FLOAT,
    price_ideal FLOAT,
    price_max FLOAT,
    final_price FLOAT NOT NULL,
    is_working BOOLEAN DEFAULT TRUE,
    is_complete BOOLEAN DEFAULT FALSE,
    has_box BOOLEAN DEFAULT FALSE,
    has_manual BOOLEAN DEFAULT FALSE,
    images TEXT,
    ai_analysis TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_sold BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0
);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_console ON products(console_type);
CREATE INDEX IF NOT EXISTS idx_products_is_sold ON products(is_sold);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ============================================
-- TABELA: transactions
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount FLOAT NOT NULL,
    platform_fee FLOAT DEFAULT 0,
    payment_id VARCHAR(255),
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    tracking_code VARCHAR(255),
    verification_video_url TEXT,
    ai_verification_result TEXT,
    dispute_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    shipped_at TIMESTAMP,
    completed_at TIMESTAMP,
    disputed_at TIMESTAMP
);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);

-- ============================================
-- TABELA: chat_rooms
-- ============================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Índices para chat_rooms
CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer ON chat_rooms(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_seller ON chat_rooms(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_product ON chat_rooms(product_id);

-- ============================================
-- TABELA: chat_messages
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text',
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================
-- TABELA: chat_alerts
-- ============================================
CREATE TABLE IF NOT EXISTS chat_alerts (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    risk_score INTEGER DEFAULT 0,
    description TEXT,
    detected_patterns TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para chat_alerts
CREATE INDEX IF NOT EXISTS idx_chat_alerts_room ON chat_alerts(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_alerts_user ON chat_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_alerts_resolved ON chat_alerts(is_resolved);

-- ============================================
-- TABELA: forum_posts
-- ============================================
CREATE TABLE IF NOT EXISTS forum_posts (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    images TEXT,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para forum_posts
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_is_pinned ON forum_posts(is_pinned);

-- ============================================
-- TABELA: forum_comments
-- ============================================
CREATE TABLE IF NOT EXISTS forum_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id INTEGER REFERENCES forum_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para forum_comments
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON forum_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent ON forum_comments(parent_comment_id);

-- ============================================
-- TABELA: events
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    event_date TIMESTAMP,
    event_type VARCHAR(50),
    organizer VARCHAR(255),
    contact_info TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para events
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_state ON events(state);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);

-- ============================================
-- TABELA: event_interests (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS event_interests (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Índices para event_interests
CREATE INDEX IF NOT EXISTS idx_event_interests_event ON event_interests(event_id);
CREATE INDEX IF NOT EXISTS idx_event_interests_user ON event_interests(user_id);

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER update_forum_posts_updated_at
    BEFORE UPDATE ON forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - OPCIONAL
-- ============================================
-- Descomente se quiser habilitar RLS

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Políticas de exemplo (ajustar conforme necessidade)
-- CREATE POLICY "Usuários podem ver seus próprios dados"
--     ON users FOR SELECT
--     USING (auth.uid() = id::text);

-- CREATE POLICY "Produtos públicos são visíveis"
--     ON products FOR SELECT
--     USING (is_sold = false);

-- ============================================
-- DADOS DE TESTE (OPCIONAL)
-- ============================================
-- Descomente para inserir dados de teste

-- INSERT INTO users (email, username, cpf, phone, hashed_password, full_name, terms_accepted_at, terms_version)
-- VALUES
--     ('admin@retrotrade.com', 'admin', '12345678909', '11999999999', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5uXH0UJ9kNZDC', 'Administrador', NOW(), '1.0.0'),
--     ('user1@example.com', 'user1', '98765432100', '11988888888', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5uXH0UJ9kNZDC', 'Usuario Teste', NOW(), '1.0.0');

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Listar todas as tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Contar registros em cada tabela (executar APÓS criar as tabelas)
DO $$
BEGIN
    RAISE NOTICE 'Verificando tabelas criadas...';
    RAISE NOTICE 'users: % registros', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'products: % registros', (SELECT COUNT(*) FROM products);
    RAISE NOTICE 'transactions: % registros', (SELECT COUNT(*) FROM transactions);
    RAISE NOTICE 'chat_rooms: % registros', (SELECT COUNT(*) FROM chat_rooms);
    RAISE NOTICE 'chat_messages: % registros', (SELECT COUNT(*) FROM chat_messages);
    RAISE NOTICE 'chat_alerts: % registros', (SELECT COUNT(*) FROM chat_alerts);
    RAISE NOTICE 'forum_posts: % registros', (SELECT COUNT(*) FROM forum_posts);
    RAISE NOTICE 'forum_comments: % registros', (SELECT COUNT(*) FROM forum_comments);
    RAISE NOTICE 'events: % registros', (SELECT COUNT(*) FROM events);
    RAISE NOTICE 'event_interests: % registros', (SELECT COUNT(*) FROM event_interests);
    RAISE NOTICE '✅ Todas as tabelas criadas com sucesso!';
END $$;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Total de tabelas criadas: 10
-- Total de índices criados: 30+
-- Total de triggers criados: 5
-- ============================================
