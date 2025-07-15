-- 返信（レス）用の投票テーブルを作成
CREATE TABLE IF NOT EXISTS board_reply_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reply_id UUID NOT NULL REFERENCES board_replies(id) ON DELETE CASCADE,
    ip_address VARCHAR(50) NOT NULL,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reply_id, ip_address)
);

-- 返信テーブルに投票カウントカラムを追加
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_replies' AND column_name = 'plus_count') THEN
        ALTER TABLE board_replies ADD COLUMN plus_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'board_replies' AND column_name = 'minus_count') THEN
        ALTER TABLE board_replies ADD COLUMN minus_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_board_reply_votes_reply_id ON board_reply_votes(reply_id);
CREATE INDEX IF NOT EXISTS idx_board_reply_votes_ip_address ON board_reply_votes(ip_address);

-- RLSを有効化
ALTER TABLE board_reply_votes ENABLE ROW LEVEL SECURITY;

-- RLSポリシーを作成
DROP POLICY IF EXISTS "Allow public read reply votes" ON board_reply_votes;
CREATE POLICY "Allow public read reply votes" ON board_reply_votes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anyone create reply votes" ON board_reply_votes;
CREATE POLICY "Allow anyone create reply votes" ON board_reply_votes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users update own reply votes" ON board_reply_votes;
CREATE POLICY "Allow users update own reply votes" ON board_reply_votes
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow users delete own reply votes" ON board_reply_votes;
CREATE POLICY "Allow users delete own reply votes" ON board_reply_votes
    FOR DELETE USING (true);

-- サンプル投票データを追加（テスト用）
DO $$
DECLARE
    reply_record RECORD;
BEGIN
    FOR reply_record IN SELECT id FROM board_replies LIMIT 10
    LOOP
        -- ランダムな投票を生成
        FOR i IN 1..FLOOR(RANDOM() * 10 + 1)::INT
        LOOP
            INSERT INTO board_reply_votes (reply_id, ip_address, vote_type)
            VALUES (
                reply_record.id,
                '192.168.1.' || (FLOOR(RANDOM() * 254 + 1))::text,
                CASE WHEN RANDOM() > 0.3 THEN 'plus' ELSE 'minus' END
            )
            ON CONFLICT (reply_id, ip_address) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 返信の投票数を集計
UPDATE board_replies r
SET 
    plus_count = COALESCE((SELECT COUNT(*) FROM board_reply_votes WHERE reply_id = r.id AND vote_type = 'plus'), 0),
    minus_count = COALESCE((SELECT COUNT(*) FROM board_reply_votes WHERE reply_id = r.id AND vote_type = 'minus'), 0);

SELECT '返信投票システムが追加されました！' as message;