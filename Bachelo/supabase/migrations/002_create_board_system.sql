-- 掲示板カテゴリテーブル
CREATE TABLE board_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 掲示板投稿テーブル
CREATE TABLE board_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES board_categories(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 投稿画像テーブル
CREATE TABLE board_post_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 投稿返信テーブル
CREATE TABLE board_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES board_replies(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- インデックス作成
CREATE INDEX idx_board_posts_category ON board_posts(category_id);
CREATE INDEX idx_board_posts_created_at ON board_posts(created_at DESC);
CREATE INDEX idx_board_post_images_post ON board_post_images(post_id);
CREATE INDEX idx_board_replies_post ON board_replies(post_id);

-- 更新日時自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_board_categories_updated_at BEFORE UPDATE ON board_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_posts_updated_at BEFORE UPDATE ON board_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_replies_updated_at BEFORE UPDATE ON board_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期カテゴリデータ
INSERT INTO board_categories (name, slug, description, display_order) VALUES
  ('質問', 'questions', '技術的な質問や相談', 1),
  ('雑談', 'general', '自由な話題で交流', 2),
  ('ニュース', 'news', '最新情報やお知らせ', 3),
  ('レビュー', 'reviews', '商品やサービスのレビュー', 4);

-- RLSポリシー設定
ALTER TABLE board_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_replies ENABLE ROW LEVEL SECURITY;

-- 読み取りは全ユーザー許可
CREATE POLICY "Allow public read for categories" ON board_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read for posts" ON board_posts
  FOR SELECT USING (true);

CREATE POLICY "Allow public read for images" ON board_post_images
  FOR SELECT USING (true);

CREATE POLICY "Allow public read for replies" ON board_replies
  FOR SELECT USING (true);

-- 投稿は全ユーザー許可（匿名投稿可能）
CREATE POLICY "Allow public insert for posts" ON board_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert for images" ON board_post_images
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert for replies" ON board_replies
  FOR INSERT WITH CHECK (true);