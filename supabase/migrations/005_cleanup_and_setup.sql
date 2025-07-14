-- 1. 既存のVoice Creator Marketplace関連を全て削除
-- ポリシーを削除
DROP POLICY IF EXISTS "Anyone can view active posts" ON anonymous_voice_posts;
DROP POLICY IF EXISTS "Anyone can create posts" ON anonymous_voice_posts;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.anonymous_post_comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON public.anonymous_post_comments;
DROP POLICY IF EXISTS "Users can view likes" ON public.anonymous_post_likes;
DROP POLICY IF EXISTS "Anyone can create likes" ON public.anonymous_post_likes;

-- テーブルを削除
DROP TABLE IF EXISTS anonymous_post_likes CASCADE;
DROP TABLE IF EXISTS anonymous_post_comments CASCADE;
DROP TABLE IF EXISTS anonymous_voice_posts CASCADE;

-- 2. BACHELOの掲示板システムが正しく設定されているか確認
-- 既存のテーブルを確認
DO $$ 
BEGIN
    -- board_categoriesテーブルが存在しない場合は作成
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'board_categories') THEN
        CREATE TABLE board_categories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- board_postsテーブルが存在しない場合は作成
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'board_posts') THEN
        CREATE TABLE board_posts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            category_id UUID REFERENCES board_categories(id) ON DELETE SET NULL,
            author_name VARCHAR(100) NOT NULL,
            author_email VARCHAR(255),
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            view_count INTEGER DEFAULT 0,
            is_pinned BOOLEAN DEFAULT false,
            is_locked BOOLEAN DEFAULT false,
            ip_address VARCHAR(50),
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- board_repliesテーブルが存在しない場合は作成
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'board_replies') THEN
        CREATE TABLE board_replies (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            post_id UUID NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
            parent_reply_id UUID REFERENCES board_replies(id) ON DELETE CASCADE,
            author_name VARCHAR(100) NOT NULL,
            author_email VARCHAR(255),
            content TEXT NOT NULL,
            ip_address VARCHAR(50),
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- board_post_imagesテーブルが存在しない場合は作成
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'board_post_images') THEN
        CREATE TABLE board_post_images (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            post_id UUID NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
            image_url TEXT NOT NULL,
            thumbnail_url TEXT,
            file_size INTEGER,
            mime_type VARCHAR(100),
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- 3. 投票システムを追加
-- 投票テーブルが存在しない場合のみ作成
CREATE TABLE IF NOT EXISTS board_post_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
    ip_address VARCHAR(50) NOT NULL,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, ip_address)
);

-- 投稿テーブルに投票カウントカラムを追加（存在しない場合のみ）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_posts' AND column_name = 'plus_count') THEN
        ALTER TABLE board_posts ADD COLUMN plus_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_posts' AND column_name = 'minus_count') THEN
        ALTER TABLE board_posts ADD COLUMN minus_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 4. インデックスを作成
CREATE INDEX IF NOT EXISTS idx_board_posts_category_id ON board_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_board_posts_created_at ON board_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_board_replies_post_id ON board_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_board_post_images_post_id ON board_post_images(post_id);
CREATE INDEX IF NOT EXISTS idx_board_post_votes_post_id ON board_post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_board_post_votes_ip_address ON board_post_votes(ip_address);

-- 5. RLSを有効化
ALTER TABLE board_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_votes ENABLE ROW LEVEL SECURITY;

-- 6. RLSポリシーを作成
-- カテゴリ
DROP POLICY IF EXISTS "Allow public read for categories" ON board_categories;
CREATE POLICY "Allow public read for categories" ON board_categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin manage categories" ON board_categories;
CREATE POLICY "Allow admin manage categories" ON board_categories
    FOR ALL USING (true);

-- 投稿
DROP POLICY IF EXISTS "Allow public read posts" ON board_posts;
CREATE POLICY "Allow public read posts" ON board_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anyone create posts" ON board_posts;
CREATE POLICY "Allow anyone create posts" ON board_posts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin manage posts" ON board_posts;
CREATE POLICY "Allow admin manage posts" ON board_posts
    FOR ALL USING (true);

-- 返信
DROP POLICY IF EXISTS "Allow public read replies" ON board_replies;
CREATE POLICY "Allow public read replies" ON board_replies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anyone create replies" ON board_replies;
CREATE POLICY "Allow anyone create replies" ON board_replies
    FOR INSERT WITH CHECK (true);

-- 画像
DROP POLICY IF EXISTS "Allow public read images" ON board_post_images;
CREATE POLICY "Allow public read images" ON board_post_images
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow post authors upload images" ON board_post_images;
CREATE POLICY "Allow post authors upload images" ON board_post_images
    FOR INSERT WITH CHECK (true);

-- 投票
DROP POLICY IF EXISTS "Allow public read votes" ON board_post_votes;
CREATE POLICY "Allow public read votes" ON board_post_votes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anyone create votes" ON board_post_votes;
CREATE POLICY "Allow anyone create votes" ON board_post_votes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users update own votes" ON board_post_votes;
CREATE POLICY "Allow users update own votes" ON board_post_votes
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow users delete own votes" ON board_post_votes;
CREATE POLICY "Allow users delete own votes" ON board_post_votes
    FOR DELETE USING (true);

-- 7. 初期カテゴリデータ
INSERT INTO board_categories (name, slug, description, display_order) VALUES
('雑談', 'general', '自由に話し合いましょう', 1),
('質問', 'questions', '疑問や質問を投稿してください', 2),
('ニュース', 'news', '最新のニュースや話題', 3)
ON CONFLICT (slug) DO NOTHING;

-- 8. サンプル投稿データ（必要に応じて）
DO $$
DECLARE
    category_id UUID;
    post_id UUID;
BEGIN
    -- 雑談カテゴリのIDを取得
    SELECT id INTO category_id FROM board_categories WHERE slug = 'general' LIMIT 1;
    
    -- サンプル投稿を作成（存在しない場合のみ）
    IF NOT EXISTS (SELECT 1 FROM board_posts LIMIT 1) THEN
        -- 投稿1
        INSERT INTO board_posts (category_id, author_name, title, content, ip_address)
        VALUES (
            category_id,
            '管理人',
            'BACHELOの掲示板について語ろう',
            'BACHELOの掲示板へようこそ！
ここは音声投稿サイトBACHELOの総合掲示板です。
みんなで楽しく語り合いましょう。

・誹謗中傷は禁止
・個人情報の投稿は控えてください
・楽しく平和に利用しましょう',
            '192.168.1.1'
        ) RETURNING id INTO post_id;
        
        -- サンプル返信
        INSERT INTO board_replies (post_id, author_name, content, ip_address) VALUES
        (post_id, 'エロゲ好き', '>>1
乙です！
掲示板ができて嬉しいです。
これから盛り上げていきましょう！', '192.168.1.2'),
        (post_id, '初心者', '音声投稿サイトなのに掲示板もあるんですね。
交流の場があるのはありがたいです。

みなさんよろしくお願いします～', '192.168.1.3'),
        (post_id, '古参ユーザー', 'ついに掲示板実装きたー！
前から要望出してたから嬉しい

管理人さんお疲れ様です', '192.168.1.4');
        
        -- 投稿2
        INSERT INTO board_posts (category_id, author_name, title, content, ip_address)
        VALUES (
            category_id,
            '音声投稿初心者',
            '初めての音声投稿、アドバイスください',
            'はじめまして！
音声投稿を始めようと思うのですが、
どんなことに気をつければいいでしょうか？

機材とかも全然わからないので、
アドバイスいただけると嬉しいです。',
            '192.168.1.5'
        );
    END IF;
END $$;

-- 9. 投票数を再集計
UPDATE board_posts p
SET 
    plus_count = COALESCE((SELECT COUNT(*) FROM board_post_votes WHERE post_id = p.id AND vote_type = 'plus'), 0),
    minus_count = COALESCE((SELECT COUNT(*) FROM board_post_votes WHERE post_id = p.id AND vote_type = 'minus'), 0);

-- 完了メッセージ
SELECT 'BACHELO掲示板システムのセットアップが完了しました！' as message;