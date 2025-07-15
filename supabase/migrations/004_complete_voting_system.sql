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

-- インデックスを追加（存在しない場合のみ）
CREATE INDEX IF NOT EXISTS idx_board_post_votes_post_id ON board_post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_board_post_votes_ip_address ON board_post_votes(ip_address);

-- RLSポリシーを設定
ALTER TABLE board_post_votes ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除して再作成
DROP POLICY IF EXISTS "Anyone can view votes" ON board_post_votes;
DROP POLICY IF EXISTS "Anyone can create votes" ON board_post_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON board_post_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON board_post_votes;

-- 新しいポリシーを作成
CREATE POLICY "Anyone can view votes" ON board_post_votes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create votes" ON board_post_votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own votes" ON board_post_votes
    FOR UPDATE USING (ip_address = COALESCE(current_setting('request.headers')::json->>'x-forwarded-for', current_setting('request.headers')::json->>'x-real-ip', 'unknown'));

CREATE POLICY "Users can delete their own votes" ON board_post_votes
    FOR DELETE USING (ip_address = COALESCE(current_setting('request.headers')::json->>'x-forwarded-for', current_setting('request.headers')::json->>'x-real-ip', 'unknown'));

-- サンプル投票データを追加（テスト用）
INSERT INTO board_post_votes (post_id, ip_address, vote_type)
SELECT 
    p.id,
    '192.168.1.' || (FLOOR(RANDOM() * 254 + 1))::text,
    CASE WHEN RANDOM() > 0.3 THEN 'plus' ELSE 'minus' END
FROM board_posts p
CROSS JOIN generate_series(1, 5) AS s(i)
ON CONFLICT (post_id, ip_address) DO NOTHING;

-- 投票数を再集計
UPDATE board_posts p
SET 
    plus_count = (SELECT COUNT(*) FROM board_post_votes WHERE post_id = p.id AND vote_type = 'plus'),
    minus_count = (SELECT COUNT(*) FROM board_post_votes WHERE post_id = p.id AND vote_type = 'minus');