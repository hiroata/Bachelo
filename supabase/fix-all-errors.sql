-- ============================================
-- Bachelo Database - Complete Error Fix Script
-- このスクリプトは全てのエラーを修正します
-- ============================================

-- エラー1: board_postsテーブルのip_hashカラム問題を修正
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 1: board_postsテーブルの修正 ===';
    
    -- board_categoriesテーブルが存在しない場合は作成
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'board_categories') THEN
        CREATE TABLE board_categories (
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
        RAISE NOTICE 'board_categoriesテーブルを作成しました';
    END IF;
    
    -- board_postsテーブルの確認と修正
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'board_posts') THEN
        -- 既存テーブルに不足カラムを追加
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_posts' AND column_name = 'ip_hash') THEN
            ALTER TABLE board_posts ADD COLUMN ip_hash TEXT;
            RAISE NOTICE 'ip_hashカラムを追加しました';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_posts' AND column_name = 'plus_count') THEN
            ALTER TABLE board_posts ADD COLUMN plus_count INTEGER DEFAULT 0;
            RAISE NOTICE 'plus_countカラムを追加しました';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_posts' AND column_name = 'minus_count') THEN
            ALTER TABLE board_posts ADD COLUMN minus_count INTEGER DEFAULT 0;
            RAISE NOTICE 'minus_countカラムを追加しました';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_posts' AND column_name = 'reply_count') THEN
            ALTER TABLE board_posts ADD COLUMN reply_count INTEGER DEFAULT 0;
            RAISE NOTICE 'reply_countカラムを追加しました';
        END IF;
    ELSE
        -- テーブルが存在しない場合は新規作成
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
        RAISE NOTICE 'board_postsテーブルを作成しました（全カラム含む）';
    END IF;
END $$;

-- エラー2: PL/pgSQLループ構文エラーを修正した検証
DO $$
DECLARE
    r RECORD; -- RECORDタイプを明示的に宣言
    col_list TEXT := '';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 2: board_postsテーブル構造の検証 ===';
    
    -- カラム情報を取得
    FOR r IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'board_posts'
        ORDER BY ordinal_position
    LOOP
        col_list := col_list || r.column_name || ' (' || r.data_type || '), ';
    END LOOP;
    
    RAISE NOTICE 'board_postsのカラム: %', col_list;
END $$;

-- エラー3: サンプルデータ挿入前にカテゴリーを確実に作成
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 3: 初期カテゴリーの作成 ===';
    
    INSERT INTO board_categories (name, description, slug) VALUES
        ('質問', '気になることを聞いてみよう', 'questions'),
        ('雑談', '自由に話そう', 'chat'),
        ('ニュース', 'ホットな話題', 'news'),
        ('レビュー', '体験談をシェア', 'reviews')
    ON CONFLICT (name) DO NOTHING;
    
    RAISE NOTICE 'カテゴリーを作成しました';
END $$;

-- エラー4: board_repliesテーブルの作成（必要な場合）
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

-- エラー5: ENUM型の安全な作成
DO $$
BEGIN
    -- report_reason型の作成
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_reason') THEN
        CREATE TYPE report_reason AS ENUM (
            'spam',
            'inappropriate',
            'harassment',
            'illegal',
            'other'
        );
        RAISE NOTICE 'report_reason型を作成しました';
    END IF;
    
    -- report_status型の作成
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE report_status AS ENUM (
            'pending',
            'reviewing',
            'resolved',
            'rejected'
        );
        RAISE NOTICE 'report_status型を作成しました';
    END IF;
END $$;

-- エラー6: 投票テーブルの作成（存在確認付き）
CREATE TABLE IF NOT EXISTS board_post_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
);

-- UNIQUE制約の安全な追加
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'board_post_votes_post_id_ip_hash_key'
    ) THEN
        ALTER TABLE board_post_votes ADD CONSTRAINT board_post_votes_post_id_ip_hash_key UNIQUE(post_id, ip_hash);
        RAISE NOTICE 'board_post_votes UNIQUE制約を追加しました';
    END IF;
END $$;

-- エラー7: テスト - board_postsへのINSERTが動作することを確認
DO $$
DECLARE
    test_category_id UUID;
    test_post_id UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 4: 動作テスト ===';
    
    -- テスト用カテゴリーID取得
    SELECT id INTO test_category_id FROM board_categories WHERE name = '質問' LIMIT 1;
    
    IF test_category_id IS NOT NULL THEN
        -- テストデータ挿入
        INSERT INTO board_posts (category_id, title, content, author_name, ip_hash)
        VALUES (test_category_id, 'テスト投稿', 'これはテストです', '名無しさん', 'test_hash')
        RETURNING id INTO test_post_id;
        
        RAISE NOTICE 'テスト投稿成功！ ID: %', test_post_id;
        
        -- クリーンアップ
        DELETE FROM board_posts WHERE id = test_post_id;
        RAISE NOTICE 'テストデータを削除しました';
    ELSE
        RAISE NOTICE 'カテゴリーが見つかりません。スキップします。';
    END IF;
END $$;

-- 最終確認
DO $$
DECLARE
    table_count INTEGER;
    ip_hash_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 修正完了レポート ===';
    
    -- board_postsのip_hashカラム存在確認
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'board_posts' AND column_name = 'ip_hash'
    ) INTO ip_hash_exists;
    
    -- テーブル数カウント
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('board_categories', 'board_posts', 'board_replies', 'board_post_votes');
    
    RAISE NOTICE 'コアテーブル数: %', table_count;
    RAISE NOTICE 'board_postsにip_hashカラム: %', CASE WHEN ip_hash_exists THEN '存在する✓' ELSE '存在しない✗' END;
    
    IF ip_hash_exists THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 すべてのエラーが修正されました！';
        RAISE NOTICE '元のマイグレーションスクリプトを実行できます。';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  まだ問題があります。reset-and-migrate.sqlを使用してください。';
    END IF;
    
    RAISE NOTICE '=================================';
END $$;