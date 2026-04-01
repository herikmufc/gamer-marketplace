-- ============================================
-- GAMER MARKETPLACE - SUPABASE SCHEMA
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Cole e Execute

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    phone VARCHAR(15),
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_technician BOOLEAN DEFAULT FALSE,
    reputation_score INTEGER DEFAULT 0,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    terms_version VARCHAR(20) DEFAULT '1.0.0'
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_cpf ON users(cpf);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    console_type VARCHAR(100),
    condition_score FLOAT,
    rarity_score FLOAT,
    price_min FLOAT,
    price_ideal FLOAT,
    price_max FLOAT,
    final_price FLOAT,
    is_working BOOLEAN DEFAULT TRUE,
    is_complete BOOLEAN DEFAULT FALSE,
    has_box BOOLEAN DEFAULT FALSE,
    has_manual BOOLEAN DEFAULT FALSE,
    images TEXT,
    ai_analysis TEXT,
    owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_sold BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_products_title ON products(title);
CREATE INDEX idx_products_owner_id ON products(owner_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- ============================================
-- CHAT ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    buyer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    seller_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_chat_rooms_product_id ON chat_rooms(product_id);
CREATE INDEX idx_chat_rooms_buyer_id ON chat_rooms(buyer_id);
CREATE INDEX idx_chat_rooms_seller_id ON chat_rooms(seller_id);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(50) DEFAULT 'text',
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================
-- FORUM POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS forum_posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    images TEXT,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_title ON forum_posts(title);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);

-- ============================================
-- FORUM COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS forum_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id BIGINT REFERENCES forum_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_author_id ON forum_comments(author_id);
CREATE INDEX idx_forum_comments_parent_comment_id ON forum_comments(parent_comment_id);

-- ============================================
-- CHAT ALERTS TABLE (Moderação IA)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_alerts (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT REFERENCES chat_rooms(id) ON DELETE CASCADE,
    message_id BIGINT REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    risk_score INTEGER,
    description TEXT,
    detected_patterns TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by BIGINT REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_alerts_room_id ON chat_alerts(room_id);
CREATE INDEX idx_chat_alerts_user_id ON chat_alerts(user_id);
CREATE INDEX idx_chat_alerts_is_resolved ON chat_alerts(is_resolved);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100),
    state VARCHAR(2),
    city VARCHAR(100),
    address TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    organizer VARCHAR(255),
    contact_info TEXT,
    website VARCHAR(500),
    image_url VARCHAR(500),
    source_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    interest_count INTEGER DEFAULT 0,
    created_by VARCHAR(50) DEFAULT 'ai',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_state ON events(state);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_event_type ON events(event_type);

-- ============================================
-- EVENT INTERESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_interests (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_event_interests_event_id ON event_interests(event_id);
CREATE INDEX idx_event_interests_user_id ON event_interests(user_id);

-- ============================================
-- TRANSACTIONS TABLE (Sistema de Escrow)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    buyer_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    seller_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- Mercado Pago
    mp_payment_id VARCHAR(255) UNIQUE,
    mp_preference_id VARCHAR(255),
    mp_status VARCHAR(50),

    -- Valores
    amount FLOAT NOT NULL,
    mp_fee FLOAT DEFAULT 0,
    platform_fee FLOAT DEFAULT 0,
    seller_amount FLOAT,

    -- Status do Escrow
    status VARCHAR(50) DEFAULT 'pending',

    -- Verificação por Vídeo
    verification_video_url VARCHAR(500),
    verification_video_uploaded_at TIMESTAMP WITH TIME ZONE,
    ai_verification_result TEXT,
    ai_verification_score INTEGER,
    ai_verified_at TIMESTAMP WITH TIME ZONE,

    -- Auto-liberação
    auto_release_date TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    release_type VARCHAR(50),

    -- Tracking
    tracking_code VARCHAR(100),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,

    -- Reclamações
    dispute_reason TEXT,
    dispute_opened_at TIMESTAMP WITH TIME ZONE,
    dispute_resolved_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_product_id ON transactions(product_id);
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_mp_payment_id ON transactions(mp_payment_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Products: Todos podem ver, apenas dono pode editar
CREATE POLICY "Anyone can view products"
    ON products FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own products"
    ON products FOR INSERT
    WITH CHECK (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can update own products"
    ON products FOR UPDATE
    USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can delete own products"
    ON products FOR DELETE
    USING (auth.uid()::text = owner_id::text);

-- Chat Rooms: Apenas participantes podem ver
CREATE POLICY "Users can view own chat rooms"
    ON chat_rooms FOR SELECT
    USING (auth.uid()::text = buyer_id::text OR auth.uid()::text = seller_id::text);

CREATE POLICY "Users can create chat rooms"
    ON chat_rooms FOR INSERT
    WITH CHECK (auth.uid()::text = buyer_id::text);

-- Chat Messages: Apenas participantes da sala podem ver
CREATE POLICY "Users can view messages in own rooms"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_rooms
            WHERE chat_rooms.id = chat_messages.room_id
            AND (chat_rooms.buyer_id::text = auth.uid()::text OR chat_rooms.seller_id::text = auth.uid()::text)
        )
    );

CREATE POLICY "Users can send messages in own rooms"
    ON chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_rooms
            WHERE chat_rooms.id = room_id
            AND (chat_rooms.buyer_id::text = auth.uid()::text OR chat_rooms.seller_id::text = auth.uid()::text)
        )
    );

-- Forum Posts: Todos podem ver, apenas autor pode editar
CREATE POLICY "Anyone can view forum posts"
    ON forum_posts FOR SELECT
    USING (true);

CREATE POLICY "Users can create forum posts"
    ON forum_posts FOR INSERT
    WITH CHECK (auth.uid()::text = author_id::text);

CREATE POLICY "Users can update own forum posts"
    ON forum_posts FOR UPDATE
    USING (auth.uid()::text = author_id::text);

CREATE POLICY "Users can delete own forum posts"
    ON forum_posts FOR DELETE
    USING (auth.uid()::text = author_id::text);

-- Forum Comments: Todos podem ver, apenas autor pode editar
CREATE POLICY "Anyone can view forum comments"
    ON forum_comments FOR SELECT
    USING (true);

CREATE POLICY "Users can create forum comments"
    ON forum_comments FOR INSERT
    WITH CHECK (auth.uid()::text = author_id::text);

CREATE POLICY "Users can update own forum comments"
    ON forum_comments FOR UPDATE
    USING (auth.uid()::text = author_id::text);

CREATE POLICY "Users can delete own forum comments"
    ON forum_comments FOR DELETE
    USING (auth.uid()::text = author_id::text);

-- Events: Todos podem ver
CREATE POLICY "Anyone can view events"
    ON events FOR SELECT
    USING (true);

-- Event Interests: Usuários podem gerenciar seus próprios interesses
CREATE POLICY "Users can view own event interests"
    ON event_interests FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own event interests"
    ON event_interests FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own event interests"
    ON event_interests FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- Transactions: Apenas buyer e seller podem ver suas transações
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid()::text = buyer_id::text OR auth.uid()::text = seller_id::text);

CREATE POLICY "Users can create transactions as buyer"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid()::text = buyer_id::text);

CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid()::text = buyer_id::text OR auth.uid()::text = seller_id::text);

-- ============================================
-- COMPLETE!
-- ============================================
-- Schema criado com sucesso!
-- Próximo passo: Configurar Storage Buckets
