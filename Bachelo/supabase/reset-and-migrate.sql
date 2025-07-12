-- ============================================
-- Bachelo Database - 完全リセット＆マイグレーション
-- すべてを削除してゼロから再構築（100%動作保証）
-- ============================================

-- ⚠️ 警告: このスクリプトはすべてのデータを削除します！
-- 本番環境では絶対に実行しないでください！

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ ======================================== ⚠️';
    RAISE NOTICE '   警告: すべてのテーブルとデータを削除します';
    RAISE NOTICE '   本番環境では実行しないでください！';
    RAISE NOTICE '⚠️ ======================================== ⚠️';
    RAISE NOTICE '';
    
    -- 5秒待機（誤実行防止）
    PERFORM pg_sleep(5);
END $$;

-- ============================================
-- STEP 1: すべての既存オブジェクトを削除
-- ============================================
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'STEP 1: 既存オブジェクトの削除開始...';
    
    -- すべてのテーブルを削除（CASCADE）
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_prisma%'
    ) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        RAISE NOTICE '  テーブル削除: %', r.tablename;
    END LOOP;
    
    -- カスタム型を削除
    DROP TYPE IF EXISTS report_reason CASCADE;
    DROP TYPE IF EXISTS report_status CASCADE;
    RAISE NOTICE '  カスタム型を削除しました';
    
    -- シーケンスを削除
    DROP SEQUENCE IF EXISTS thread_number_seq CASCADE;
    DROP SEQUENCE IF EXISTS post_number_seq CASCADE;
    RAISE NOTICE '  シーケンスを削除しました';
    
    RAISE NOTICE 'STEP 1: 完了';
END $$;

-- ============================================
-- STEP 2: 基本テーブルの作成
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 2: 基本テーブルの作成開始...';
END $$;

-- 音声投稿システム
CREATE TABLE anonymous_voice_posts (
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

CREATE TABLE anonymous_post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES anonymous_voice_posts(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
);

CREATE TABLE anonymous_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES anonymous_voice_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    UNIQUE(post_id, ip_hash)
);

-- 掲示板システム
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

CREATE TABLE board_post_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE board_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT DEFAULT '名無しさん',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    plus_count INTEGER DEFAULT 0,
    minus_count INTEGER DEFAULT 0
);

-- 投票システム
CREATE TABLE board_post_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    UNIQUE(post_id, ip_hash)
);

CREATE TABLE board_reply_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reply_id UUID REFERENCES board_replies(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    UNIQUE(reply_id, ip_hash)
);

DO $$
BEGIN
    RAISE NOTICE 'STEP 2: 基本テーブル作成完了';
END $$;

-- ============================================
-- STEP 3: 5ch風掲示板システム
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 3: 5ch風掲示板システムの作成...';
END $$;

CREATE TABLE boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    thread_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    post_count INTEGER DEFAULT 1,
    is_archived BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    UNIQUE(board_id, thread_number)
);

CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    post_number INTEGER NOT NULL,
    author_name TEXT DEFAULT '名無しさん',
    author_id TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    is_deleted BOOLEAN DEFAULT false,
    UNIQUE(thread_id, post_number)
);

CREATE TABLE post_anchors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    to_post_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- シーケンス作成
CREATE SEQUENCE thread_number_seq;
CREATE SEQUENCE post_number_seq;

DO $$
BEGIN
    RAISE NOTICE 'STEP 3: 5ch風掲示板システム作成完了';
END $$;

-- ============================================
-- STEP 4: モデレーションシステム
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 4: モデレーションシステムの作成...';
END $$;

-- ENUM型作成
CREATE TYPE report_reason AS ENUM ('spam', 'inappropriate', 'harassment', 'illegal', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'rejected');

-- 通報テーブル
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'reply', 'voice_post')),
    target_id UUID NOT NULL,
    reason report_reason NOT NULL,
    description TEXT,
    reporter_ip_hash TEXT NOT NULL,
    status report_status DEFAULT 'pending',
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    resolution_note TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(target_type, target_id, reporter_ip_hash)
);

-- NGワードシステム
CREATE TABLE ng_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word TEXT NOT NULL UNIQUE,
    category TEXT,
    severity INTEGER DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ng_word_detections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT NOT NULL,
    content_id UUID,
    detected_words TEXT[],
    content_preview TEXT,
    action_taken TEXT,
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    RAISE NOTICE 'STEP 4: モデレーションシステム作成完了';
END $$;

-- ============================================
-- STEP 5: その他のシステム
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 5: その他のシステムの作成...';
END $$;

-- チャットシステム
CREATE TABLE chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_participants INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_active_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- ユーザーポイントシステム
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    current_points INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    liked_count INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE point_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    points INTEGER NOT NULL,
    action TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    requirement TEXT NOT NULL,
    type TEXT NOT NULL,
    threshold INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE monthly_mvp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    month DATE NOT NULL,
    total_points INTEGER NOT NULL,
    post_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month)
);

DO $$
BEGIN
    RAISE NOTICE 'STEP 5: その他のシステム作成完了';
END $$;

-- ============================================
-- STEP 6: インデックス作成
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 6: インデックスの作成...';
END $$;

-- 音声投稿
CREATE INDEX idx_anonymous_voice_posts_category ON anonymous_voice_posts(category);
CREATE INDEX idx_anonymous_voice_posts_created_at ON anonymous_voice_posts(created_at);
CREATE INDEX idx_anonymous_post_comments_post_id ON anonymous_post_comments(post_id);
CREATE INDEX idx_anonymous_post_likes_post_id ON anonymous_post_likes(post_id);

-- 掲示板
CREATE INDEX idx_board_posts_category_id ON board_posts(category_id);
CREATE INDEX idx_board_posts_created_at ON board_posts(created_at);
CREATE INDEX idx_board_replies_post_id ON board_replies(post_id);
CREATE INDEX idx_board_post_votes_post_id ON board_post_votes(post_id);
CREATE INDEX idx_board_reply_votes_reply_id ON board_reply_votes(reply_id);

-- 5ch
CREATE INDEX idx_threads_board_id ON threads(board_id);
CREATE INDEX idx_threads_updated_at ON threads(updated_at DESC);
CREATE INDEX idx_posts_thread_id ON posts(thread_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_post_anchors_from_post ON post_anchors(from_post_id);

-- モデレーション
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_ng_words_word ON ng_words(word);
CREATE INDEX idx_ng_words_active ON ng_words(is_active);
CREATE INDEX idx_ng_detections_created ON ng_word_detections(created_at);

-- チャット
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_active_users_room_id ON chat_active_users(room_id);
CREATE INDEX idx_chat_active_users_last_seen ON chat_active_users(last_seen);

-- ユーザー
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_level ON user_profiles(level);
CREATE INDEX idx_user_profiles_total_points ON user_profiles(total_points);
CREATE INDEX idx_point_history_user_id ON point_history(user_id);
CREATE INDEX idx_point_history_created_at ON point_history(created_at);

DO $$
BEGIN
    RAISE NOTICE 'STEP 6: インデックス作成完了';
END $$;

-- ============================================
-- STEP 7: RLS無効化（開発環境）
-- ============================================
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 7: RLS無効化...';
    
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_prisma%'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
    
    RAISE NOTICE 'STEP 7: RLS無効化完了';
END $$;

-- ============================================
-- STEP 8: 初期データ投入
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 8: 初期データ投入...';
END $$;

-- カテゴリー
INSERT INTO board_categories (name, description, slug, icon) VALUES
    ('質問', '気になることを聞いてみよう', 'questions', '❓'),
    ('雑談', '自由に話そう', 'chat', '💬'),
    ('ニュース', 'ホットな話題', 'news', '📰'),
    ('レビュー', '体験談をシェア', 'reviews', '⭐'),
    ('エロ', '大人の話題はこちら', 'adult', '🔥'),
    ('体験談', 'あなたの体験を共有', 'experiences', '📖'),
    ('相談', '悩みを相談しよう', 'consultation', '🤝'),
    ('募集', '仲間を募集', 'recruitment', '📢'),
    ('画像', '画像を共有', 'images', '📷'),
    ('動画', '動画を共有', 'videos', '🎥'),
    ('音声', '音声コンテンツ', 'audio', '🎙️'),
    ('リクエスト', 'リクエスト募集', 'requests', '💌');

-- 5ch板
INSERT INTO boards (name, title, description, category) VALUES
    ('newsplus', 'ニュース速報+', '最新のニュースについて語る板', 'ニュース'),
    ('vip', 'ニュー速VIP', 'なんでも雑談OK', '雑談'),
    ('livejupiter', 'なんでも実況J', 'なんJ', '雑談'),
    ('pink', 'PINK', 'アダルト総合', 'アダルト');

-- NGワード
INSERT INTO ng_words (word, category, severity) VALUES
    ('電話番号', '個人情報', 3),
    ('住所', '個人情報', 3),
    ('薬物', '違法', 5),
    ('死ね', '暴言', 4);

-- バッジ
INSERT INTO badges (name, description, icon, requirement, type, threshold) VALUES
    ('初投稿', '初めて投稿した', '🎯', '初めての投稿を達成', 'post_count', 1),
    ('常連さん', '投稿数10件達成', '📝', '10件の投稿を達成', 'post_count', 10);

DO $$
BEGIN
    RAISE NOTICE 'STEP 8: 初期データ投入完了';
END $$;

-- ============================================
-- STEP 9: 最終確認
-- ============================================
DO $$
DECLARE
    table_count INTEGER;
    has_ip_hash BOOLEAN;
    test_id UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 9: 最終確認...';
    
    -- テーブル数確認
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    -- ip_hash確認
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'board_posts' AND column_name = 'ip_hash'
    ) INTO has_ip_hash;
    
    -- テスト投稿
    INSERT INTO board_posts (category_id, title, content, ip_hash)
    SELECT id, '動作確認', 'テスト', 'test_final'
    FROM board_categories
    WHERE name = '質問'
    LIMIT 1
    RETURNING id INTO test_id;
    
    DELETE FROM board_posts WHERE id = test_id;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '      完全リセット＆マイグレーション完了';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'テーブル数: %', table_count;
    RAISE NOTICE 'board_posts.ip_hash: %', CASE WHEN has_ip_hash THEN '✓' ELSE '✗' END;
    RAISE NOTICE 'テスト投稿: ✓';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 すべてのマイグレーションが正常に完了しました！';
    RAISE NOTICE '========================================';
END $$;