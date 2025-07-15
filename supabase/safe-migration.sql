-- ============================================
-- Bachelo Database - 安全なマイグレーションスクリプト
-- エラーが絶対に発生しない設計
-- ============================================

-- トランザクション開始
BEGIN;

-- ============================================
-- PHASE 1: テーブル作成（依存関係順）
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========== PHASE 1: テーブル作成開始 ==========';
END $$;

-- 1. 音声投稿システム
CREATE TABLE IF NOT EXISTS anonymous_voice_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'female',
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS anonymous_post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES anonymous_voice_posts(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS anonymous_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES anonymous_voice_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
);

-- UNIQUE制約を安全に追加
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anonymous_post_likes_post_id_ip_hash_key') THEN
        ALTER TABLE anonymous_post_likes ADD CONSTRAINT anonymous_post_likes_post_id_ip_hash_key UNIQUE(post_id, ip_hash);
    END IF;
END $$;

-- 2. 掲示板システム
CREATE TABLE IF NOT EXISTS board_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT,
    description TEXT,
    icon TEXT,
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- board_postsテーブルを確実に作成
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'board_posts') THEN
        CREATE TABLE board_posts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            category_id UUID REFERENCES board_categories(id),
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author_name TEXT DEFAULT '名無しさん',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            view_count INTEGER DEFAULT 0,
            reply_count INTEGER DEFAULT 0,
            ip_hash TEXT,
            plus_count INTEGER DEFAULT 0,
            minus_count INTEGER DEFAULT 0
        );
    ELSE
        -- 既存テーブルにカラムを追加
        ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS ip_hash TEXT;
        ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS plus_count INTEGER DEFAULT 0;
        ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS minus_count INTEGER DEFAULT 0;
        ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS board_post_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS board_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT DEFAULT '名無しさん',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    plus_count INTEGER DEFAULT 0,
    minus_count INTEGER DEFAULT 0
);

-- 3. 投票システム
CREATE TABLE IF NOT EXISTS board_post_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS board_reply_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reply_id UUID REFERENCES board_replies(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
);

-- UNIQUE制約を安全に追加
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'board_post_votes_post_id_ip_hash_key') THEN
        ALTER TABLE board_post_votes ADD CONSTRAINT board_post_votes_post_id_ip_hash_key UNIQUE(post_id, ip_hash);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'board_reply_votes_reply_id_ip_hash_key') THEN
        ALTER TABLE board_reply_votes ADD CONSTRAINT board_reply_votes_reply_id_ip_hash_key UNIQUE(reply_id, ip_hash);
    END IF;
END $$;

-- ============================================
-- PHASE 2: インデックス作成
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========== PHASE 2: インデックス作成 ==========';
END $$;

CREATE INDEX IF NOT EXISTS idx_anonymous_voice_posts_category ON anonymous_voice_posts(category);
CREATE INDEX IF NOT EXISTS idx_anonymous_voice_posts_created_at ON anonymous_voice_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_post_comments_post_id ON anonymous_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_post_likes_post_id ON anonymous_post_likes(post_id);

CREATE INDEX IF NOT EXISTS idx_board_posts_category_id ON board_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_board_posts_created_at ON board_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_board_replies_post_id ON board_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_board_post_votes_post_id ON board_post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_board_reply_votes_reply_id ON board_reply_votes(reply_id);

-- ============================================
-- PHASE 3: 初期データ挿入
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========== PHASE 3: 初期データ挿入 ==========';
END $$;

-- カテゴリー挿入
INSERT INTO board_categories (name, description, slug, icon) VALUES
    ('質問', '気になることを聞いてみよう', 'questions', '❓'),
    ('雑談', '自由に話そう', 'chat', '💬'),
    ('ニュース', 'ホットな話題', 'news', '📰'),
    ('レビュー', '体験談をシェア', 'reviews', '⭐'),
    ('エロ', '大人の話題はこちら', 'adult', '🔥'),
    ('体験談', 'あなたの体験を共有', 'experiences', '📖'),
    ('相談', '悩みを相談しよう', 'consultation', '🤝'),
    ('募集', '仲間を募集', 'recruitment', '📢')
ON CONFLICT (name) DO UPDATE 
SET icon = EXCLUDED.icon, 
    slug = EXCLUDED.slug,
    description = EXCLUDED.description;

-- ============================================
-- PHASE 4: RLS無効化（開発環境用）
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========== PHASE 4: RLS無効化 ==========';
END $$;

ALTER TABLE anonymous_voice_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_post_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_reply_votes DISABLE ROW LEVEL SECURITY;

-- ============================================
-- PHASE 5: 動作確認
-- ============================================
DO $$
DECLARE
    cat_id UUID;
    post_id UUID;
    r RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========== PHASE 5: 動作確認 ==========';
    
    -- カテゴリー取得
    SELECT id INTO cat_id FROM board_categories WHERE name = '質問' LIMIT 1;
    
    IF cat_id IS NOT NULL THEN
        -- テスト投稿
        INSERT INTO board_posts (category_id, title, content, author_name, ip_hash)
        VALUES (cat_id, '動作確認投稿', 'これは動作確認用の投稿です', 'テストユーザー', 'test_hash_001')
        RETURNING id INTO post_id;
        
        RAISE NOTICE '✓ テスト投稿成功: %', post_id;
        
        -- カラム確認
        FOR r IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'board_posts' 
            AND column_name IN ('ip_hash', 'plus_count', 'minus_count', 'reply_count')
            ORDER BY column_name
        LOOP
            RAISE NOTICE '✓ カラム確認: % (%)', r.column_name, r.data_type;
        END LOOP;
        
        -- クリーンアップ
        DELETE FROM board_posts WHERE id = post_id;
        RAISE NOTICE '✓ テストデータ削除完了';
    END IF;
END $$;

-- ============================================
-- 最終レポート
-- ============================================
DO $$
DECLARE
    table_count INTEGER;
    has_ip_hash BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '         マイグレーション完了';
    RAISE NOTICE '========================================';
    
    -- テーブル数
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'anonymous_voice_posts', 'anonymous_post_comments', 'anonymous_post_likes',
        'board_categories', 'board_posts', 'board_post_images', 'board_replies',
        'board_post_votes', 'board_reply_votes'
    );
    
    -- ip_hash確認
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'board_posts' AND column_name = 'ip_hash'
    ) INTO has_ip_hash;
    
    RAISE NOTICE 'テーブル数: %', table_count;
    RAISE NOTICE 'board_posts.ip_hash: %', CASE WHEN has_ip_hash THEN '✓ 存在' ELSE '✗ なし' END;
    RAISE NOTICE '';
    
    IF table_count >= 9 AND has_ip_hash THEN
        RAISE NOTICE '🎉 成功！すべてのテーブルが正常に作成されました。';
        RAISE NOTICE '次のステップ:';
        RAISE NOTICE '1. 残りのマイグレーション（5ch、通報、NGワード等）を実行';
        RAISE NOTICE '2. サンプルデータを投入';
    ELSE
        RAISE NOTICE '⚠️  一部のテーブルが作成されていません。';
        RAISE NOTICE 'reset-and-migrate.sqlを使用してください。';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

-- コミット
COMMIT;

-- ============================================
-- 成功メッセージ
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ 安全なマイグレーションが完了しました！';
    RAISE NOTICE '';
END $$;