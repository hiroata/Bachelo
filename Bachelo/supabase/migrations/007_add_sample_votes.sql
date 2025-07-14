-- 既存の投稿と返信にランダムな投票データを追加

-- 投稿への投票を追加
DO $$
DECLARE
    post_record RECORD;
    i INTEGER;
    vote_count INTEGER;
BEGIN
    FOR post_record IN SELECT id FROM board_posts
    LOOP
        -- 各投稿に5-30件のランダムな投票を生成
        vote_count := FLOOR(RANDOM() * 25 + 5)::INT;
        
        FOR i IN 1..vote_count
        LOOP
            INSERT INTO board_post_votes (post_id, ip_address, vote_type)
            VALUES (
                post_record.id,
                '192.168.' || FLOOR(RANDOM() * 255)::text || '.' || FLOOR(RANDOM() * 255)::text,
                -- 70%の確率でプラス、30%の確率でマイナス
                CASE WHEN RANDOM() < 0.7 THEN 'plus' ELSE 'minus' END
            )
            ON CONFLICT (post_id, ip_address) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 返信への投票を追加
DO $$
DECLARE
    reply_record RECORD;
    i INTEGER;
    vote_count INTEGER;
    plus_ratio NUMERIC;
BEGIN
    FOR reply_record IN SELECT id FROM board_replies
    LOOP
        -- 各返信に3-20件のランダムな投票を生成
        vote_count := FLOOR(RANDOM() * 17 + 3)::INT;
        -- ランダムなプラス率（20%〜90%）
        plus_ratio := 0.2 + RANDOM() * 0.7;
        
        FOR i IN 1..vote_count
        LOOP
            INSERT INTO board_reply_votes (reply_id, ip_address, vote_type)
            VALUES (
                reply_record.id,
                '192.168.' || FLOOR(RANDOM() * 255)::text || '.' || FLOOR(RANDOM() * 255)::text,
                CASE WHEN RANDOM() < plus_ratio THEN 'plus' ELSE 'minus' END
            )
            ON CONFLICT (reply_id, ip_address) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 投稿の投票数を再集計
UPDATE board_posts p
SET 
    plus_count = COALESCE((SELECT COUNT(*) FROM board_post_votes WHERE post_id = p.id AND vote_type = 'plus'), 0),
    minus_count = COALESCE((SELECT COUNT(*) FROM board_post_votes WHERE post_id = p.id AND vote_type = 'minus'), 0);

-- 返信の投票数を再集計
UPDATE board_replies r
SET 
    plus_count = COALESCE((SELECT COUNT(*) FROM board_reply_votes WHERE reply_id = r.id AND vote_type = 'plus'), 0),
    minus_count = COALESCE((SELECT COUNT(*) FROM board_reply_votes WHERE reply_id = r.id AND vote_type = 'minus'), 0);

-- 特定の投稿/返信に高評価を設定（テスト用）
UPDATE board_posts 
SET plus_count = 2871, minus_count = 20
WHERE title LIKE '%日本だけだと思ってた%';

UPDATE board_posts 
SET plus_count = 1931, minus_count = 70
WHERE title LIKE '%海外でも女の子希望が多いんだね%';

UPDATE board_posts 
SET plus_count = 751, minus_count = 72
WHERE title LIKE '%なーに言ってんだか%';

-- 結果を確認
SELECT 
    'サンプル投票データが追加されました！' as message,
    (SELECT COUNT(*) FROM board_post_votes) as total_post_votes,
    (SELECT COUNT(*) FROM board_reply_votes) as total_reply_votes;