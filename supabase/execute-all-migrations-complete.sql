-- Bachelo Complete Database Migration Script
-- This script executes all migrations from 001 to 017 in the correct order
-- Last updated: 2025-01-12

-- ========================================
-- 001_create_anonymous_voice_posts.sql
-- ========================================

-- 音声投稿テーブル
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

-- コメントテーブル
CREATE TABLE IF NOT EXISTS anonymous_post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES anonymous_voice_posts(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS anonymous_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES anonymous_voice_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    UNIQUE(post_id, ip_hash)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_anonymous_voice_posts_category ON anonymous_voice_posts(category);
CREATE INDEX IF NOT EXISTS idx_anonymous_voice_posts_created_at ON anonymous_voice_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_post_comments_post_id ON anonymous_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_post_likes_post_id ON anonymous_post_likes(post_id);

-- ========================================
-- 002_create_board_system.sql
-- ========================================

-- カテゴリーテーブル
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

-- 投稿テーブル
CREATE TABLE IF NOT EXISTS board_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES board_categories(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT DEFAULT '名無しさん',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    ip_hash TEXT
);

-- 画像テーブル
CREATE TABLE IF NOT EXISTS board_post_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 返信テーブル
CREATE TABLE IF NOT EXISTS board_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT DEFAULT '名無しさん',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_board_posts_category_id ON board_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_board_posts_created_at ON board_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_board_replies_post_id ON board_replies(post_id);

-- 初期カテゴリーの挿入
INSERT INTO board_categories (name, description, slug) VALUES
    ('質問', '気になることを聞いてみよう', 'questions'),
    ('雑談', '自由に話そう', 'chat'),
    ('ニュース', 'ホットな話題', 'news'),
    ('レビュー', '体験談をシェア', 'reviews')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 003_add_voting_system.sql
-- ========================================

-- 投票テーブル
CREATE TABLE IF NOT EXISTS board_post_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
);

-- 投稿テーブルに投票数カラムを追加
ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS plus_count INTEGER DEFAULT 0;
ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS minus_count INTEGER DEFAULT 0;

-- ip_hashカラムが存在しない場合は追加
ALTER TABLE board_post_votes ADD COLUMN IF NOT EXISTS ip_hash TEXT;

-- UNIQUE制約を安全に追加
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_post_votes' AND column_name = 'ip_hash') THEN
        ALTER TABLE board_post_votes DROP CONSTRAINT IF EXISTS board_post_votes_post_id_ip_hash_key;
        ALTER TABLE board_post_votes ADD CONSTRAINT board_post_votes_post_id_ip_hash_key UNIQUE(post_id, ip_hash);
    END IF;
END $$;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_board_post_votes_post_id ON board_post_votes(post_id);

-- ========================================
-- 004_complete_voting_system.sql
-- ========================================

-- 既存のテーブルを確認して、必要に応じて再作成
DO $$ 
BEGIN
    -- 投票数カラムの追加（存在しない場合）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_posts' AND column_name = 'plus_count') THEN
        ALTER TABLE board_posts ADD COLUMN plus_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_posts' AND column_name = 'minus_count') THEN
        ALTER TABLE board_posts ADD COLUMN minus_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- サンプル投票データの挿入（カラム存在確認付き）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_post_votes' AND column_name = 'ip_hash') THEN
        INSERT INTO board_post_votes (post_id, vote_type, ip_hash)
        SELECT 
            p.id,
            CASE WHEN random() > 0.3 THEN 'plus' ELSE 'minus' END,
            md5(random()::text || generate_series::text)
        FROM board_posts p
        CROSS JOIN generate_series(1, 5)
        ON CONFLICT (post_id, ip_hash) DO NOTHING;
    END IF;
END $$;

-- 投票数を更新
UPDATE board_posts p
SET 
    plus_count = COALESCE((SELECT COUNT(*) FROM board_post_votes v WHERE v.post_id = p.id AND v.vote_type = 'plus'), 0),
    minus_count = COALESCE((SELECT COUNT(*) FROM board_post_votes v WHERE v.post_id = p.id AND v.vote_type = 'minus'), 0);

-- ========================================
-- 005_cleanup_and_setup.sql
-- ========================================

-- Voice Creator Marketplace関連のテーブルを削除
DROP TABLE IF EXISTS voice_creator_requests CASCADE;
DROP TABLE IF EXISTS voice_creators CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;

-- 必要なカラムを確認して追加
DO $$ 
BEGIN
    -- reply_countカラムの追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_posts' AND column_name = 'reply_count') THEN
        ALTER TABLE board_posts ADD COLUMN reply_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- サンプル投稿データの挿入
INSERT INTO board_posts (category_id, title, content, author_name, ip_hash)
SELECT 
    c.id,
    'テスト投稿 ' || generate_series,
    'これはテスト投稿です。内容番号: ' || generate_series,
    CASE 
        WHEN random() < 0.7 THEN '名無しさん'
        ELSE 'エロ' || (random() * 100)::int || '番'
    END,
    md5(random()::text)
FROM board_categories c
CROSS JOIN generate_series(1, 10)
WHERE c.name IN ('質問', '雑談')
ON CONFLICT DO NOTHING;

-- サンプル返信データの挿入
INSERT INTO board_replies (post_id, content, author_name, ip_hash)
SELECT 
    p.id,
    CASE generate_series % 5
        WHEN 0 THEN 'それいいね！'
        WHEN 1 THEN 'もっと詳しく教えて'
        WHEN 2 THEN '私も同じ経験あるよ'
        WHEN 3 THEN 'ワロタwww'
        ELSE 'なるほどね～'
    END,
    CASE 
        WHEN random() < 0.6 THEN '名無しさん'
        ELSE 'エロ' || (random() * 100)::int || '番'
    END,
    md5(random()::text || generate_series::text)
FROM board_posts p
CROSS JOIN generate_series(1, 3)
WHERE p.created_at > NOW() - INTERVAL '7 days'
ON CONFLICT DO NOTHING;

-- 返信数を更新
UPDATE board_posts p
SET reply_count = (SELECT COUNT(*) FROM board_replies r WHERE r.post_id = p.id);

-- ========================================
-- 006_add_reply_voting.sql
-- ========================================

-- 返信投票テーブル
CREATE TABLE IF NOT EXISTS board_reply_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reply_id UUID REFERENCES board_replies(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
);

-- 返信テーブルに投票数カラムを追加
ALTER TABLE board_replies ADD COLUMN IF NOT EXISTS plus_count INTEGER DEFAULT 0;
ALTER TABLE board_replies ADD COLUMN IF NOT EXISTS minus_count INTEGER DEFAULT 0;

-- ip_hashカラムが存在しない場合は追加
ALTER TABLE board_reply_votes ADD COLUMN IF NOT EXISTS ip_hash TEXT;

-- UNIQUE制約を安全に追加
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_reply_votes' AND column_name = 'ip_hash') THEN
        ALTER TABLE board_reply_votes DROP CONSTRAINT IF EXISTS board_reply_votes_reply_id_ip_hash_key;
        ALTER TABLE board_reply_votes ADD CONSTRAINT board_reply_votes_reply_id_ip_hash_key UNIQUE(reply_id, ip_hash);
    END IF;
END $$;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_board_reply_votes_reply_id ON board_reply_votes(reply_id);

-- サンプル返信投票データ（カラム存在確認付き）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_reply_votes' AND column_name = 'ip_hash') THEN
        INSERT INTO board_reply_votes (reply_id, vote_type, ip_hash)
        SELECT 
            r.id,
            CASE WHEN random() > 0.4 THEN 'plus' ELSE 'minus' END,
            md5(random()::text || generate_series::text)
        FROM board_replies r
        CROSS JOIN generate_series(1, 3)
        ON CONFLICT (reply_id, ip_hash) DO NOTHING;
    END IF;
END $$;

-- 返信の投票数を更新
UPDATE board_replies r
SET 
    plus_count = COALESCE((SELECT COUNT(*) FROM board_reply_votes v WHERE v.reply_id = r.id AND v.vote_type = 'plus'), 0),
    minus_count = COALESCE((SELECT COUNT(*) FROM board_reply_votes v WHERE v.reply_id = r.id AND v.vote_type = 'minus'), 0);

-- ========================================
-- 007_add_sample_votes.sql
-- ========================================

-- より多くのサンプル投票データを追加（カラム存在確認付き）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_post_votes' AND column_name = 'ip_hash') THEN
        INSERT INTO board_post_votes (post_id, vote_type, ip_hash)
        SELECT 
            p.id,
            CASE 
                WHEN p.title LIKE '%人気%' OR p.title LIKE '%最高%' THEN 
                    CASE WHEN random() > 0.2 THEN 'plus' ELSE 'minus' END
                WHEN p.title LIKE '%質問%' THEN 
                    CASE WHEN random() > 0.5 THEN 'plus' ELSE 'minus' END
                ELSE 
                    CASE WHEN random() > 0.4 THEN 'plus' ELSE 'minus' END
            END,
            md5(random()::text || p.id::text || generate_series::text)
        FROM board_posts p
        CROSS JOIN generate_series(1, FLOOR(random() * 20 + 5)::int)
        ON CONFLICT (post_id, ip_hash) DO NOTHING;
    END IF;
END $$;

-- 返信にも追加の投票（カラム存在確認付き）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_reply_votes' AND column_name = 'ip_hash') THEN
        INSERT INTO board_reply_votes (reply_id, vote_type, ip_hash)
        SELECT 
            r.id,
            CASE 
                WHEN r.content LIKE '%いいね%' OR r.content LIKE '%最高%' THEN 
                    CASE WHEN random() > 0.2 THEN 'plus' ELSE 'minus' END
                ELSE 
                    CASE WHEN random() > 0.5 THEN 'plus' ELSE 'minus' END
            END,
            md5(random()::text || r.id::text || generate_series::text)
        FROM board_replies r
        CROSS JOIN generate_series(1, FLOOR(random() * 15 + 3)::int)
        ON CONFLICT (reply_id, ip_hash) DO NOTHING;
    END IF;
END $$;

-- 投票数を再計算
UPDATE board_posts p
SET 
    plus_count = (SELECT COUNT(*) FROM board_post_votes v WHERE v.post_id = p.id AND v.vote_type = 'plus'),
    minus_count = (SELECT COUNT(*) FROM board_post_votes v WHERE v.post_id = p.id AND v.vote_type = 'minus');

UPDATE board_replies r
SET 
    plus_count = (SELECT COUNT(*) FROM board_reply_votes v WHERE v.reply_id = r.id AND v.vote_type = 'plus'),
    minus_count = (SELECT COUNT(*) FROM board_reply_votes v WHERE v.reply_id = r.id AND v.vote_type = 'minus');

-- 特定の投稿を人気投稿にする
UPDATE board_posts 
SET plus_count = 50 + FLOOR(random() * 50)::int, minus_count = FLOOR(random() * 10)::int
WHERE title LIKE '%人気%' OR title LIKE '%最高%';

-- ========================================
-- 008_add_more_replies.sql
-- ========================================

-- 既存の投稿により多くの返信を追加
INSERT INTO board_replies (post_id, content, author_name, ip_hash, created_at)
SELECT 
    p.id,
    CASE (random() * 20)::int
        WHEN 0 THEN 'これマジ？詳しく聞きたい'
        WHEN 1 THEN 'うちの近所でも同じようなことあったわ'
        WHEN 2 THEN '証拠画像はよ'
        WHEN 3 THEN 'それで、それで？続きが気になる！'
        WHEN 4 THEN '>>1\nお前天才かよ'
        WHEN 5 THEN 'エッッッッッ'
        WHEN 6 THEN 'これは良スレの予感...'
        WHEN 7 THEN 'ワイも似たような経験あるで'
        WHEN 8 THEN '嘘松乙'
        WHEN 9 THEN 'マジレスすると...'
        WHEN 10 THEN 'で、オチは？'
        WHEN 11 THEN 'これ前にも見たような...'
        WHEN 12 THEN '今北産業'
        WHEN 13 THEN 'ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!'
        WHEN 14 THEN 'それよりも俺の話聞いてくれよ'
        WHEN 15 THEN '>>3\nそれな'
        WHEN 16 THEN 'お前らこんな時間に何してんの？'
        WHEN 17 THEN 'やっぱり夜中のスレは最高だな'
        WHEN 18 THEN 'もっとkwsk'
        ELSE '定期的にこの話題出るよね'
    END,
    CASE 
        WHEN random() < 0.3 THEN '名無しさん'
        WHEN random() < 0.4 THEN 'エロ紳士' || (random() * 100)::int
        WHEN random() < 0.5 THEN '夜の' || 
            CASE (random() * 5)::int
                WHEN 0 THEN '帝王'
                WHEN 1 THEN '住人'
                WHEN 2 THEN 'ベテラン'
                WHEN 3 THEN '新参'
                ELSE '常連'
            END
        WHEN random() < 0.6 THEN 'ムッツリ' || (random() * 50)::int || '号'
        ELSE '深夜の' || 
            CASE (random() * 4)::int
                WHEN 0 THEN '賢者'
                WHEN 1 THEN '哲学者'
                WHEN 2 THEN '暇人'
                ELSE '変態'
            END
    END,
    md5(random()::text || p.id::text || generate_series::text),
    p.created_at + (random() * INTERVAL '24 hours')
FROM board_posts p
CROSS JOIN generate_series(1, FLOOR(random() * 10 + 5)::int)
WHERE p.created_at > NOW() - INTERVAL '3 days'
ON CONFLICT DO NOTHING;

-- 返信数を更新
UPDATE board_posts p
SET reply_count = (SELECT COUNT(*) FROM board_replies r WHERE r.post_id = p.id);

-- 返信にも投票を追加（カラム存在確認付き）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'board_reply_votes' AND column_name = 'ip_hash') THEN
        INSERT INTO board_reply_votes (reply_id, vote_type, ip_hash)
        SELECT 
            r.id,
            CASE 
                WHEN r.content LIKE '%エッ%' OR r.content LIKE '%最高%' OR r.content LIKE '%ｷﾀ%' THEN 
                    CASE WHEN random() > 0.1 THEN 'plus' ELSE 'minus' END
                WHEN r.content LIKE '%嘘松%' OR r.content LIKE '%つまらん%' THEN 
                    CASE WHEN random() > 0.8 THEN 'plus' ELSE 'minus' END
                ELSE 
                    CASE WHEN random() > 0.4 THEN 'plus' ELSE 'minus' END
            END,
            md5(random()::text || r.id::text || generate_series::text)
        FROM board_replies r
        CROSS JOIN generate_series(1, FLOOR(random() * 8 + 2)::int)
        WHERE r.created_at > NOW() - INTERVAL '3 days'
        ON CONFLICT (reply_id, ip_hash) DO NOTHING;
    END IF;
END $$;

-- 返信の投票数を更新
UPDATE board_replies r
SET 
    plus_count = (SELECT COUNT(*) FROM board_reply_votes v WHERE v.reply_id = r.id AND v.vote_type = 'plus'),
    minus_count = (SELECT COUNT(*) FROM board_reply_votes v WHERE v.reply_id = r.id AND v.vote_type = 'minus');

-- ========================================
-- 009_disable_rls_for_easier_development.sql
-- ========================================

-- 開発を簡単にするためRLSを無効化
ALTER TABLE anonymous_voice_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_post_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_reply_votes DISABLE ROW LEVEL SECURITY;

-- 既存のRLSポリシーを削除
DROP POLICY IF EXISTS "Anyone can view posts" ON anonymous_voice_posts;
DROP POLICY IF EXISTS "Anyone can create posts" ON anonymous_voice_posts;
DROP POLICY IF EXISTS "Anyone can view comments" ON anonymous_post_comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON anonymous_post_comments;
DROP POLICY IF EXISTS "Anyone can view likes" ON anonymous_post_likes;
DROP POLICY IF EXISTS "Anyone can create likes" ON anonymous_post_likes;
DROP POLICY IF EXISTS "Public read access" ON board_categories;
DROP POLICY IF EXISTS "Public read access" ON board_posts;
DROP POLICY IF EXISTS "Public create access" ON board_posts;
DROP POLICY IF EXISTS "Public read access" ON board_post_images;
DROP POLICY IF EXISTS "Public create access" ON board_post_images;
DROP POLICY IF EXISTS "Public read access" ON board_replies;
DROP POLICY IF EXISTS "Public create access" ON board_replies;
DROP POLICY IF EXISTS "Public read access" ON board_post_votes;
DROP POLICY IF EXISTS "Public create/update access" ON board_post_votes;
DROP POLICY IF EXISTS "Public read access" ON board_reply_votes;
DROP POLICY IF EXISTS "Public create/update access" ON board_reply_votes;

-- ========================================
-- 010_add_category_icons.sql
-- ========================================

-- カテゴリーテーブルにアイコンとslugカラムを追加
ALTER TABLE board_categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE board_categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE board_categories ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;
ALTER TABLE board_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE board_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- 既存カテゴリーにアイコンとslugを設定
UPDATE board_categories SET 
    icon = CASE 
        WHEN name = '質問' THEN '❓'
        WHEN name = '雑談' THEN '💬'
        WHEN name = 'ニュース' THEN '📰'
        WHEN name = 'レビュー' THEN '⭐'
        WHEN name = 'エロ' THEN '🔥'
        WHEN name = '体験談' THEN '📖'
        WHEN name = '相談' THEN '🤝'
        WHEN name = '募集' THEN '📢'
        WHEN name = '画像' THEN '📷'
        WHEN name = '動画' THEN '🎥'
        WHEN name = '音声' THEN '🎙️'
        WHEN name = 'リクエスト' THEN '💌'
        ELSE '📌'
    END,
    slug = CASE 
        WHEN name = '質問' THEN 'questions'
        WHEN name = '雑談' THEN 'chat'
        WHEN name = 'ニュース' THEN 'news'
        WHEN name = 'レビュー' THEN 'reviews'
        WHEN name = 'エロ' THEN 'adult'
        WHEN name = '体験談' THEN 'experiences'
        WHEN name = '相談' THEN 'consultation'
        WHEN name = '募集' THEN 'recruitment'
        WHEN name = '画像' THEN 'images'
        WHEN name = '動画' THEN 'videos'
        WHEN name = '音声' THEN 'audio'
        WHEN name = 'リクエスト' THEN 'requests'
        ELSE lower(replace(name, ' ', '-'))
    END
WHERE slug IS NULL OR icon IS NULL;

-- 新しいカテゴリーを追加（存在しない場合）
INSERT INTO board_categories (name, description, icon, slug) VALUES
    ('エロ', '大人の話題はこちら', '🔥', 'adult'),
    ('体験談', 'あなたの体験を共有', '📖', 'experiences'),
    ('相談', '悩みを相談しよう', '🤝', 'consultation'),
    ('募集', '仲間を募集', '📢', 'recruitment'),
    ('画像', '画像を共有', '📷', 'images'),
    ('動画', '動画を共有', '🎥', 'videos'),
    ('音声', '音声コンテンツ', '🎙️', 'audio'),
    ('リクエスト', 'リクエスト募集', '💌', 'requests')
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon, slug = EXCLUDED.slug;

-- ========================================
-- 011_add_cascade_deletes.sql
-- ========================================

-- 外部キー制約を更新してカスケード削除を確実にする
ALTER TABLE anonymous_post_comments 
    DROP CONSTRAINT IF EXISTS anonymous_post_comments_post_id_fkey,
    ADD CONSTRAINT anonymous_post_comments_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES anonymous_voice_posts(id) ON DELETE CASCADE;

ALTER TABLE anonymous_post_likes 
    DROP CONSTRAINT IF EXISTS anonymous_post_likes_post_id_fkey,
    ADD CONSTRAINT anonymous_post_likes_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES anonymous_voice_posts(id) ON DELETE CASCADE;

ALTER TABLE board_post_images 
    DROP CONSTRAINT IF EXISTS board_post_images_post_id_fkey,
    ADD CONSTRAINT board_post_images_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES board_posts(id) ON DELETE CASCADE;

ALTER TABLE board_replies 
    DROP CONSTRAINT IF EXISTS board_replies_post_id_fkey,
    ADD CONSTRAINT board_replies_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES board_posts(id) ON DELETE CASCADE;

ALTER TABLE board_post_votes 
    DROP CONSTRAINT IF EXISTS board_post_votes_post_id_fkey,
    ADD CONSTRAINT board_post_votes_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES board_posts(id) ON DELETE CASCADE;

ALTER TABLE board_reply_votes 
    DROP CONSTRAINT IF EXISTS board_reply_votes_reply_id_fkey,
    ADD CONSTRAINT board_reply_votes_reply_id_fkey 
    FOREIGN KEY (reply_id) REFERENCES board_replies(id) ON DELETE CASCADE;

-- ========================================
-- 012_create_5ch_schema.sql
-- ========================================

-- 5ch風掲示板システムの構築

-- 板（Board）テーブル
CREATE TABLE IF NOT EXISTS boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- スレッド（Thread）テーブル
CREATE TABLE IF NOT EXISTS threads (
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

-- 投稿（Post）テーブル
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    post_number INTEGER NOT NULL,
    author_name TEXT DEFAULT '名無しさん',
    author_id TEXT, -- トリップやIDなど
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    is_deleted BOOLEAN DEFAULT false,
    UNIQUE(thread_id, post_number)
);

-- アンカー（返信参照）テーブル
CREATE TABLE IF NOT EXISTS post_anchors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    to_post_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_threads_board_id ON threads(board_id);
CREATE INDEX IF NOT EXISTS idx_threads_updated_at ON threads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_thread_id ON posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_post_anchors_from_post ON post_anchors(from_post_id);

-- 自動採番用のシーケンス
CREATE SEQUENCE IF NOT EXISTS thread_number_seq;
CREATE SEQUENCE IF NOT EXISTS post_number_seq;

-- スレッド番号を自動採番するトリガー
CREATE OR REPLACE FUNCTION set_thread_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.thread_number IS NULL THEN
        NEW.thread_number := nextval('thread_number_seq');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_thread_number_trigger
BEFORE INSERT ON threads
FOR EACH ROW
EXECUTE FUNCTION set_thread_number();

-- 投稿番号を自動採番するトリガー
CREATE OR REPLACE FUNCTION set_post_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.post_number := COALESCE(
        (SELECT MAX(post_number) FROM posts WHERE thread_id = NEW.thread_id),
        0
    ) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_post_number_trigger
BEFORE INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION set_post_number();

-- スレッドの更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_thread_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE threads 
    SET updated_at = CURRENT_TIMESTAMP,
        post_count = (SELECT COUNT(*) FROM posts WHERE thread_id = NEW.thread_id AND NOT is_deleted)
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_activity_trigger
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION update_thread_activity();

-- ========================================
-- 013_insert_initial_boards.sql
-- ========================================

-- 5ch風の板を作成
INSERT INTO boards (name, title, description, category) VALUES
    -- ニュース
    ('newsplus', 'ニュース速報+', '最新のニュースについて語る板', 'ニュース'),
    ('news', 'ニュース速報', '速報性重視のニュース板', 'ニュース'),
    ('bizplus', 'ビジネスニュース+', 'ビジネス関連のニュース', 'ニュース'),
    
    -- 雑談
    ('vip', 'ニュー速VIP', 'なんでも雑談OK', '雑談'),
    ('livejupiter', 'なんでも実況J', 'なんJ', '雑談'),
    ('poverty', '嫌儲', 'ニュース速報(嫌儲)', '雑談'),
    
    -- 趣味
    ('game', 'ゲーム速報', 'ゲーム総合', '趣味'),
    ('anime', 'アニメ', 'アニメ作品について', '趣味'),
    ('comic', '漫画', '漫画作品について', '趣味'),
    ('music', '音楽', '音楽総合', '趣味'),
    
    -- 生活
    ('fashion', 'ファッション', 'ファッション情報', '生活'),
    ('food', '料理', '料理・グルメ情報', '生活'),
    ('love', '恋愛', '恋愛相談・雑談', '生活'),
    ('money', 'マネー', 'お金の話題', '生活'),
    
    -- 学問・専門
    ('prog', 'プログラミング', 'プログラミング技術', '専門'),
    ('science', '科学', '科学ニュース・議論', '専門'),
    ('history', '歴史', '歴史について語る', '専門'),
    
    -- アダルト
    ('pink', 'PINK', 'アダルト総合', 'アダルト'),
    ('erotica', 'エロ', 'エロ話・体験談', 'アダルト'),
    ('couple', 'カップル', 'カップル・夫婦の話題', 'アダルト')
ON CONFLICT (name) DO NOTHING;

-- サンプルスレッドを作成
INSERT INTO threads (board_id, title, post_count)
SELECT 
    b.id,
    CASE 
        WHEN b.name = 'vip' THEN 
            CASE (random() * 5)::int
                WHEN 0 THEN '【速報】ワイ、ついに彼女ができる'
                WHEN 1 THEN '深夜だし怖い話でもしようぜ'
                WHEN 2 THEN 'お前らの黒歴史教えてくれ'
                WHEN 3 THEN '今から寝るまで全レスする'
                ELSE '暇だから安価でなんかする'
            END
        WHEN b.name = 'livejupiter' THEN 
            CASE (random() * 5)::int
                WHEN 0 THEN '【朗報】ワイ、転職成功'
                WHEN 1 THEN '彼女「じゃあ別れよ」ワイ「！？」'
                WHEN 2 THEN 'なんJ深夜の怖い話部'
                WHEN 3 THEN '三大〇〇といえば？'
                ELSE 'ワイの年収当ててみろ'
            END
        WHEN b.name = 'pink' THEN 
            CASE (random() * 5)::int
                WHEN 0 THEN '【相談】彼女が積極的すぎて困ってる'
                WHEN 1 THEN '初体験の思い出語ってけ'
                WHEN 2 THEN 'お前らの性癖教えて'
                WHEN 3 THEN '【質問】これって普通？'
                ELSE '経験人数を正直に書いてけ'
            END
        ELSE '雑談スレ'
    END,
    1
FROM boards b
CROSS JOIN generate_series(1, 3)
WHERE b.name IN ('vip', 'livejupiter', 'pink')
ON CONFLICT DO NOTHING;

-- サンプル投稿を作成
INSERT INTO posts (thread_id, author_name, content, ip_hash)
SELECT 
    t.id,
    CASE 
        WHEN random() < 0.7 THEN '名無しさん'
        WHEN random() < 0.8 THEN 'ななし'
        WHEN random() < 0.9 THEN '774'
        ELSE '名無し募集中'
    END,
    CASE (random() * 10)::int
        WHEN 0 THEN 'まじかよ...'
        WHEN 1 THEN 'それな'
        WHEN 2 THEN 'わかる'
        WHEN 3 THEN '>>1\n乙'
        WHEN 4 THEN 'kwsk'
        WHEN 5 THEN 'ソースは？'
        WHEN 6 THEN '釣りだろ'
        WHEN 7 THEN 'マジレスすると...'
        WHEN 8 THEN 'ワロタｗｗｗ'
        ELSE 'なるほど'
    END,
    md5(random()::text)
FROM threads t
CROSS JOIN generate_series(1, 5)
ON CONFLICT DO NOTHING;

-- ========================================
-- 014_create_reports_system.sql
-- ========================================

-- 通報理由の列挙型
CREATE TYPE report_reason AS ENUM (
    'spam',
    'inappropriate',
    'harassment',
    'illegal',
    'other'
);

-- 通報ステータスの列挙型
CREATE TYPE report_status AS ENUM (
    'pending',
    'reviewing',
    'resolved',
    'rejected'
);

-- 通報テーブル
CREATE TABLE IF NOT EXISTS reports (
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

-- インデックス
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);

-- 通報統計ビュー
CREATE OR REPLACE VIEW report_statistics AS
SELECT 
    target_type,
    reason,
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as count_24h,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as count_7d
FROM reports
GROUP BY target_type, reason, status;

-- 頻繁に通報されるコンテンツのビュー
CREATE OR REPLACE VIEW frequently_reported_content AS
SELECT 
    target_type,
    target_id,
    COUNT(*) as report_count,
    array_agg(DISTINCT reason) as reasons,
    MAX(created_at) as last_reported_at
FROM reports
WHERE status IN ('pending', 'reviewing')
GROUP BY target_type, target_id
HAVING COUNT(*) >= 3
ORDER BY report_count DESC;

-- RLSポリシー（開発環境では無効）
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 015_create_ng_words_system.sql
-- ========================================

-- NGワードテーブル
CREATE TABLE IF NOT EXISTS ng_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word TEXT NOT NULL UNIQUE,
    category TEXT,
    severity INTEGER DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- NGワード検出ログ
CREATE TABLE IF NOT EXISTS ng_word_detections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT NOT NULL,
    content_id UUID,
    detected_words TEXT[],
    content_preview TEXT,
    action_taken TEXT, -- 'blocked', 'flagged', 'allowed'
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_ng_words_word ON ng_words(word);
CREATE INDEX IF NOT EXISTS idx_ng_words_active ON ng_words(is_active);
CREATE INDEX IF NOT EXISTS idx_ng_detections_created ON ng_word_detections(created_at);

-- NGワードチェック関数
CREATE OR REPLACE FUNCTION check_ng_words(content TEXT)
RETURNS TABLE(word TEXT, severity INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT n.word, n.severity
    FROM ng_words n
    WHERE n.is_active = true
    AND position(lower(n.word) in lower(content)) > 0
    ORDER BY n.severity DESC;
END;
$$ LANGUAGE plpgsql;

-- 初期NGワードデータ
INSERT INTO ng_words (word, category, severity) VALUES
    -- 個人情報関連
    ('電話番号', '個人情報', 3),
    ('住所', '個人情報', 3),
    ('本名', '個人情報', 3),
    
    -- 違法・有害
    ('薬物', '違法', 5),
    ('援助交際', '違法', 5),
    ('児童', '違法', 5),
    
    -- スパム
    ('副業', 'スパム', 2),
    ('稼げる', 'スパム', 2),
    ('クリック', 'スパム', 1),
    
    -- 暴言・差別
    ('死ね', '暴言', 4),
    ('殺す', '暴言', 5),
    ('差別用語1', '差別', 5),
    ('差別用語2', '差別', 5)
ON CONFLICT (word) DO NOTHING;

-- RLSポリシー（開発環境では無効）
ALTER TABLE ng_words DISABLE ROW LEVEL SECURITY;
ALTER TABLE ng_word_detections DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 016_create_live_chat_system.sql
-- ========================================

-- チャットルームテーブル
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_participants INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- チャットメッセージテーブル
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_id TEXT NOT NULL, -- セッションベースのID
    message TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- アクティブユーザーテーブル（現在チャットに参加中のユーザー）
CREATE TABLE IF NOT EXISTS chat_active_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_active_users_room_id ON chat_active_users(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_active_users_last_seen ON chat_active_users(last_seen);

-- リアルタイム用のパブリケーション設定
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chat_active_users') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE chat_active_users;
    END IF;
END $$;

-- サンプルチャットルーム作成（人気スレッド用）
INSERT INTO chat_rooms (name, description) VALUES
    ('深夜の雑談部屋', '深夜限定！みんなでエロトーク'),
    ('初心者歓迎チャット', '初めての方も気軽に参加してください'),
    ('過激な告白部屋', '普段言えない過激な話をしよう')
ON CONFLICT DO NOTHING;

-- RLSポリシー（開発環境では無効）
ALTER TABLE chat_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_active_users DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 017_create_user_points_system.sql
-- ========================================

-- ユーザープロファイルテーブル（匿名ユーザー用）
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL, -- localStorage等で管理されるID
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    current_points INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    liked_count INTEGER DEFAULT 0, -- 自分の投稿がいいねされた数
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ポイント履歴テーブル
CREATE TABLE IF NOT EXISTS point_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    points INTEGER NOT NULL,
    action TEXT NOT NULL, -- 'post', 'reply', 'liked', 'hot_post', 'daily_login', etc.
    reference_id TEXT, -- 関連する投稿IDなど
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- バッジマスターテーブル
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    requirement TEXT NOT NULL, -- 取得条件の説明
    type TEXT NOT NULL, -- 'post_count', 'level', 'special', etc.
    threshold INTEGER, -- 必要な数値
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 月間MVPテーブル
CREATE TABLE IF NOT EXISTS monthly_mvp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    month DATE NOT NULL,
    total_points INTEGER NOT NULL,
    post_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_points ON user_profiles(total_points);
CREATE INDEX IF NOT EXISTS idx_point_history_user_id ON point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_point_history_created_at ON point_history(created_at);

-- バッジデータの初期投入
INSERT INTO badges (name, description, icon, requirement, type, threshold) VALUES
    ('初投稿', '初めて投稿した', '🎯', '初めての投稿を達成', 'post_count', 1),
    ('常連さん', '投稿数10件達成', '📝', '10件の投稿を達成', 'post_count', 10),
    ('ベテラン投稿者', '投稿数50件達成', '✍️', '50件の投稿を達成', 'post_count', 50),
    ('レジェンド', '投稿数100件達成', '🏆', '100件の投稿を達成', 'post_count', 100),
    ('人気者', 'いいね100回獲得', '❤️', '合計100いいねを獲得', 'liked_count', 100),
    ('カリスマ', 'いいね500回獲得', '💖', '合計500いいねを獲得', 'liked_count', 500),
    ('レベル5', 'レベル5到達', '⭐', 'レベル5に到達', 'level', 5),
    ('レベル10', 'レベル10到達', '🌟', 'レベル10に到達', 'level', 10),
    ('レベル20', 'レベル20到達', '✨', 'レベル20に到達', 'level', 20),
    ('夜の帝王', '深夜の投稿マスター', '🌙', '深夜に50回投稿', 'special', null),
    ('朝の女王', '早朝の投稿マスター', '☀️', '早朝に50回投稿', 'special', null),
    ('週末戦士', '週末の投稿マスター', '🎉', '週末に100回投稿', 'special', null),
    ('エロ紳士', '紳士的な投稿者', '🎩', '高評価率80%以上で50投稿', 'special', null),
    ('話題の種', '盛り上がるスレッドを作成', '🔥', '100レス以上のスレッドを作成', 'special', null),
    ('月間MVP', '月間最優秀投稿者', '👑', '月間MVPに選出', 'special', null)
ON CONFLICT DO NOTHING;

-- ポイント計算関数
CREATE OR REPLACE FUNCTION calculate_level(total_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- レベル計算式: sqrt(total_points / 100) + 1
    RETURN FLOOR(SQRT(total_points::FLOAT / 100)) + 1;
END;
$$ LANGUAGE plpgsql;

-- RLSポリシー（開発環境では無効）
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE point_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_mvp DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 完了メッセージ
-- ========================================
DO $$
BEGIN
    RAISE NOTICE 'All migrations have been executed successfully!';
    RAISE NOTICE 'Total tables created: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
END $$;