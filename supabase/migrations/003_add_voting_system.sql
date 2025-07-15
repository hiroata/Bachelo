-- 投稿の評価テーブル
CREATE TABLE IF NOT EXISTS board_post_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
    ip_address VARCHAR(50) NOT NULL,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, ip_address)
);

-- 投稿テーブルに評価カウントを追加
ALTER TABLE board_posts 
ADD COLUMN IF NOT EXISTS plus_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS minus_count INTEGER DEFAULT 0;

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_board_post_votes_post_id ON board_post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_board_post_votes_ip_address ON board_post_votes(ip_address);