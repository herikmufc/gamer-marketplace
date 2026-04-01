-- ============================================
-- RETROTRADE BRASIL - Fix Migration
-- ============================================
-- Script compatível com estrutura existente do Supabase
-- ============================================

-- ============================================
-- ADICIONAR COLUNAS FALTANTES EM USERS
-- ============================================
DO $$
BEGIN
    -- phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(15);
        RAISE NOTICE 'Coluna users.phone adicionada';
    END IF;

    -- reputation_score
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='reputation_score') THEN
        ALTER TABLE users ADD COLUMN reputation_score INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna users.reputation_score adicionada';
    END IF;

    -- is_technician
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='is_technician') THEN
        ALTER TABLE users ADD COLUMN is_technician BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna users.is_technician adicionada';
    END IF;

    -- is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna users.is_active adicionada';
    END IF;

    -- terms_accepted_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='terms_accepted_at') THEN
        ALTER TABLE users ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna users.terms_accepted_at adicionada';
    END IF;

    -- terms_version
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='terms_version') THEN
        ALTER TABLE users ADD COLUMN terms_version VARCHAR(20) DEFAULT '1.0.0';
        RAISE NOTICE 'Coluna users.terms_version adicionada';
    END IF;

    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna users.updated_at adicionada';
    END IF;
END $$;

-- ============================================
-- ADICIONAR COLUNAS FALTANTES EM PRODUCTS
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='condition_score') THEN
        ALTER TABLE products ADD COLUMN condition_score FLOAT;
        RAISE NOTICE 'Coluna products.condition_score adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='rarity_score') THEN
        ALTER TABLE products ADD COLUMN rarity_score FLOAT;
        RAISE NOTICE 'Coluna products.rarity_score adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='price_min') THEN
        ALTER TABLE products ADD COLUMN price_min FLOAT;
        RAISE NOTICE 'Coluna products.price_min adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='price_ideal') THEN
        ALTER TABLE products ADD COLUMN price_ideal FLOAT;
        RAISE NOTICE 'Coluna products.price_ideal adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='price_max') THEN
        ALTER TABLE products ADD COLUMN price_max FLOAT;
        RAISE NOTICE 'Coluna products.price_max adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='is_working') THEN
        ALTER TABLE products ADD COLUMN is_working BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna products.is_working adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='is_complete') THEN
        ALTER TABLE products ADD COLUMN is_complete BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna products.is_complete adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='has_box') THEN
        ALTER TABLE products ADD COLUMN has_box BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna products.has_box adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='has_manual') THEN
        ALTER TABLE products ADD COLUMN has_manual BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna products.has_manual adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='ai_analysis') THEN
        ALTER TABLE products ADD COLUMN ai_analysis TEXT;
        RAISE NOTICE 'Coluna products.ai_analysis adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='views_count') THEN
        ALTER TABLE products ADD COLUMN views_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna products.views_count adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna products.updated_at adicionada';
    END IF;
END $$;

-- ============================================
-- ADICIONAR COLUNAS FALTANTES EM TRANSACTIONS
-- ============================================
DO $$
BEGIN
    -- Renomear mp_payment_id para payment_id se necessário
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='mp_payment_id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='payment_id') THEN
        ALTER TABLE transactions RENAME COLUMN mp_payment_id TO payment_id;
        RAISE NOTICE 'Coluna transactions.mp_payment_id renomeada para payment_id';
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='payment_id') THEN
        ALTER TABLE transactions ADD COLUMN payment_id VARCHAR(255);
        RAISE NOTICE 'Coluna transactions.payment_id adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='payment_method') THEN
        ALTER TABLE transactions ADD COLUMN payment_method VARCHAR(50);
        RAISE NOTICE 'Coluna transactions.payment_method adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='tracking_code') THEN
        ALTER TABLE transactions ADD COLUMN tracking_code VARCHAR(100);
        RAISE NOTICE 'Coluna transactions.tracking_code adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='verification_video_url') THEN
        ALTER TABLE transactions ADD COLUMN verification_video_url VARCHAR(500);
        RAISE NOTICE 'Coluna transactions.verification_video_url adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='dispute_reason') THEN
        ALTER TABLE transactions ADD COLUMN dispute_reason TEXT;
        RAISE NOTICE 'Coluna transactions.dispute_reason adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='shipped_at') THEN
        ALTER TABLE transactions ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna transactions.shipped_at adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='updated_at') THEN
        ALTER TABLE transactions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna transactions.updated_at adicionada';
    END IF;
END $$;

-- ============================================
-- CRIAR ÍNDICES FALTANTES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at DESC);

-- ============================================
-- ATUALIZAR FUNÇÃO DE TRIGGER (se não existir)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SUCESSO
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Migration concluída com sucesso!';
    RAISE NOTICE 'Todas as colunas necessárias foram adicionadas.';
    RAISE NOTICE '========================================';
END $$;
