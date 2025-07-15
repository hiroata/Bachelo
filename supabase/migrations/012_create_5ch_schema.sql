-- 5ch型掲示板システムへの移行
-- Step 1: 新しいテーブル構造の作成

-- 板（boards）テーブル
CREATE TABLE IF NOT EXISTS boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,  -- news, tech, etc
  name VARCHAR(100) NOT NULL,         -- ニュース速報、テクノロジー等
  description TEXT,
  category VARCHAR(50),               -- ニュース、雑談、趣味など
  display_order INTEGER DEFAULT 0,
  default_name VARCHAR(50) DEFAULT '名無しさん',
  settings JSONB DEFAULT '{}',        -- 板ごとの設定
  is_active BOOLEAN DEFAULT true,
  max_threads INTEGER DEFAULT 1000,   -- 最大スレッド数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- スレッド（threads）テーブル
CREATE TABLE IF NOT EXISTS threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  thread_number INTEGER NOT NULL,     -- 板内でのスレッド番号
  title VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  last_post_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  post_count INTEGER DEFAULT 1,       -- レス数
  is_archived BOOLEAN DEFAULT false,  -- dat落ち
  is_locked BOOLEAN DEFAULT false,    -- スレスト
  is_pinned BOOLEAN DEFAULT false,    -- 固定スレッド
  UNIQUE(board_id, thread_number)
);

-- レス（posts）テーブル
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  post_number INTEGER NOT NULL,       -- スレッド内でのレス番号
  author_name VARCHAR(100) DEFAULT '名無しさん',
  author_email VARCHAR(255),          -- sage対応
  author_id VARCHAR(20),              -- ID表示用
  author_trip VARCHAR(20),            -- トリップ
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  ip_hash VARCHAR(64),
  user_agent TEXT,
  is_deleted BOOLEAN DEFAULT false,   -- あぼーん対応
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_reason TEXT,
  UNIQUE(thread_id, post_number)
);

-- アンカー（anchors）テーブル
CREATE TABLE IF NOT EXISTS post_anchors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  to_post_number INTEGER NOT NULL,   -- アンカー先のレス番号
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 画像（post_images）テーブル
CREATE TABLE IF NOT EXISTS post_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(50),
  width INTEGER,
  height INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- インデックスの作成（パフォーマンス最適化）
CREATE INDEX idx_threads_board_last_post ON threads(board_id, last_post_at DESC);
CREATE INDEX idx_threads_board_created ON threads(board_id, created_at DESC);
CREATE INDEX idx_threads_board_number ON threads(board_id, thread_number);
CREATE INDEX idx_posts_thread_number ON posts(thread_id, post_number);
CREATE INDEX idx_posts_created ON posts(created_at);
CREATE INDEX idx_post_anchors_thread ON post_anchors(thread_id, to_post_number);

-- 関数: スレッド番号の自動採番
CREATE OR REPLACE FUNCTION get_next_thread_number(board_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(thread_number), 0) + 1
  INTO next_number
  FROM threads
  WHERE board_id = board_uuid;
  
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- 関数: レス番号の自動採番
CREATE OR REPLACE FUNCTION get_next_post_number(thread_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(post_number), 0) + 1
  INTO next_number
  FROM posts
  WHERE thread_id = thread_uuid;
  
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- トリガー: スレッドの最終投稿日時を更新
CREATE OR REPLACE FUNCTION update_thread_last_post()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads
  SET 
    last_post_at = NEW.created_at,
    post_count = post_count + 1,
    updated_at = timezone('utc', now())
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_last_post
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION update_thread_last_post();

-- RLS（Row Level Security）の設定
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;

-- 読み取りポリシー（全員が読める）
CREATE POLICY "Boards are viewable by everyone" ON boards FOR SELECT USING (true);
CREATE POLICY "Threads are viewable by everyone" ON threads FOR SELECT USING (true);
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Post anchors are viewable by everyone" ON post_anchors FOR SELECT USING (true);
CREATE POLICY "Post images are viewable by everyone" ON post_images FOR SELECT USING (true);

-- 書き込みポリシー（認証不要、匿名投稿可能）
CREATE POLICY "Anyone can create threads" ON threads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create post anchors" ON post_anchors FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can upload images" ON post_images FOR INSERT WITH CHECK (true);