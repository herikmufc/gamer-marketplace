-- ============================================
-- SUPABASE STORAGE - BUCKETS E POLÍTICAS
-- ============================================
-- Execute este SQL no Supabase SQL Editor após criar os schemas

-- ============================================
-- CREATE BUCKETS
-- ============================================
-- NOTA: Buckets precisam ser criados via Dashboard ou API
-- Este SQL serve apenas como referência
-- Vá em: Storage → Buckets → New Bucket

-- product-images (público)
-- verification-videos (privado)
-- avatars (público)
-- forum-images (público)

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- ==========================================
-- PRODUCT IMAGES POLICIES
-- ==========================================

-- Allow public to view product images
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Public can view product images',
    'product-images',
    '(bucket_id = ''product-images'')',
    'SELECT'
) ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload product images
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Authenticated users can upload product images',
    'product-images',
    '(bucket_id = ''product-images'' AND (auth.role() = ''authenticated''))',
    'INSERT'
) ON CONFLICT DO NOTHING;

-- Allow users to delete own product images
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Users can delete own product images',
    'product-images',
    '(bucket_id = ''product-images'' AND ((auth.uid())::text = (storage.foldername(name))[1]))',
    'DELETE'
) ON CONFLICT DO NOTHING;

-- Allow users to update own product images
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Users can update own product images',
    'product-images',
    '(bucket_id = ''product-images'' AND ((auth.uid())::text = (storage.foldername(name))[1]))',
    'UPDATE'
) ON CONFLICT DO NOTHING;

-- ==========================================
-- VERIFICATION VIDEOS POLICIES (Private)
-- ==========================================

-- Allow users to view own verification videos
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Users can view own verification videos',
    'verification-videos',
    '(bucket_id = ''verification-videos'' AND ((auth.uid())::text = (storage.foldername(name))[1]))',
    'SELECT'
) ON CONFLICT DO NOTHING;

-- Allow users to upload verification videos
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Users can upload verification videos',
    'verification-videos',
    '(bucket_id = ''verification-videos'' AND (auth.role() = ''authenticated''))',
    'INSERT'
) ON CONFLICT DO NOTHING;

-- ==========================================
-- AVATARS POLICIES
-- ==========================================

-- Allow public to view avatars
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Public can view avatars',
    'avatars',
    '(bucket_id = ''avatars'')',
    'SELECT'
) ON CONFLICT DO NOTHING;

-- Allow users to upload own avatar
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Users can upload own avatar',
    'avatars',
    '(bucket_id = ''avatars'' AND ((auth.uid())::text = (storage.foldername(name))[1]))',
    'INSERT'
) ON CONFLICT DO NOTHING;

-- Allow users to update own avatar
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Users can update own avatar',
    'avatars',
    '(bucket_id = ''avatars'' AND ((auth.uid())::text = (storage.foldername(name))[1]))',
    'UPDATE'
) ON CONFLICT DO NOTHING;

-- Allow users to delete own avatar
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Users can delete own avatar',
    'avatars',
    '(bucket_id = ''avatars'' AND ((auth.uid())::text = (storage.foldername(name))[1]))',
    'DELETE'
) ON CONFLICT DO NOTHING;

-- ==========================================
-- FORUM IMAGES POLICIES
-- ==========================================

-- Allow public to view forum images
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Public can view forum images',
    'forum-images',
    '(bucket_id = ''forum-images'')',
    'SELECT'
) ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload forum images
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Authenticated users can upload forum images',
    'forum-images',
    '(bucket_id = ''forum-images'' AND (auth.role() = ''authenticated''))',
    'INSERT'
) ON CONFLICT DO NOTHING;

-- Allow users to delete own forum images
INSERT INTO storage.policies (name, bucket_id, definition, check_function)
VALUES (
    'Users can delete own forum images',
    'forum-images',
    '(bucket_id = ''forum-images'' AND ((auth.uid())::text = (storage.foldername(name))[1]))',
    'DELETE'
) ON CONFLICT DO NOTHING;

-- ============================================
-- COMPLETE!
-- ============================================
-- Políticas de Storage criadas!
-- IMPORTANTE: Você ainda precisa criar os buckets manualmente
-- via Dashboard: Storage → Buckets
