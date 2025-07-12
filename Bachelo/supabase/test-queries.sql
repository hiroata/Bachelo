-- ============================================
-- Bachelo Database - テストクエリ集
-- 動作確認とトラブルシューティング用
-- ============================================

-- ============================================
-- 1. テーブル構造の確認
-- ============================================
-- すべてのテーブルをリスト
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- board_postsテーブルの詳細構造
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'board_posts'
ORDER BY ordinal_position;

-- 重要カラムの存在確認
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'board_posts' 
AND column_name IN ('ip_hash', 'plus_count', 'minus_count', 'reply_count')
ORDER BY column_name;

-- ============================================
-- 2. 制約とインデックスの確認
-- ============================================
-- UNIQUE制約の確認
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_name;

-- インデックスの確認
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 3. データ挿入テスト
-- ============================================
-- カテゴリー確認
SELECT id, name, slug, icon FROM board_categories ORDER BY name;

-- テスト投稿（実行後、削除されます）
DO $$
DECLARE
    cat_id UUID;
    post_id UUID;
    reply_id UUID;
    vote_id UUID;
BEGIN
    RAISE NOTICE '=== データ挿入テスト開始 ===';
    
    -- カテゴリー取得
    SELECT id INTO cat_id FROM board_categories WHERE name = '質問' LIMIT 1;
    
    IF cat_id IS NULL THEN
        RAISE NOTICE '❌ カテゴリーが見つかりません';
        RETURN;
    END IF;
    
    -- 1. 投稿作成
    INSERT INTO board_posts (category_id, title, content, author_name, ip_hash)
    VALUES (cat_id, 'テスト投稿', 'ip_hashカラムのテスト', 'テストユーザー', 'test_hash_123')
    RETURNING id INTO post_id;
    RAISE NOTICE '✓ 投稿作成成功: %', post_id;
    
    -- 2. 返信作成
    INSERT INTO board_replies (post_id, content, author_name, ip_hash)
    VALUES (post_id, 'テスト返信', 'テスト返信者', 'test_reply_hash')
    RETURNING id INTO reply_id;
    RAISE NOTICE '✓ 返信作成成功: %', reply_id;
    
    -- 3. 投票作成
    INSERT INTO board_post_votes (post_id, vote_type, ip_hash)
    VALUES (post_id, 'plus', 'test_vote_hash')
    RETURNING id INTO vote_id;
    RAISE NOTICE '✓ 投票作成成功: %', vote_id;
    
    -- 4. 投票数更新
    UPDATE board_posts 
    SET plus_count = (SELECT COUNT(*) FROM board_post_votes WHERE post_id = post_id AND vote_type = 'plus')
    WHERE id = post_id;
    RAISE NOTICE '✓ 投票数更新成功';
    
    -- 5. データ確認
    PERFORM * FROM board_posts WHERE id = post_id AND ip_hash = 'test_hash_123';
    RAISE NOTICE '✓ ip_hashでの検索成功';
    
    -- クリーンアップ
    DELETE FROM board_posts WHERE id = post_id;
    RAISE NOTICE '✓ テストデータ削除完了';
    
    RAISE NOTICE '=== すべてのテスト成功！ ===';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ エラー発生: %', SQLERRM;
END $$;

-- ============================================
-- 4. エラー診断クエリ
-- ============================================
-- board_postsテーブルが存在するか
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'board_posts'
) as board_posts_exists;

-- ip_hashカラムが存在するか
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'board_posts' 
    AND column_name = 'ip_hash'
) as ip_hash_exists;

-- 外部キー制約の確認
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================
-- 5. サンプルデータ作成（本番用）
-- ============================================
-- これを実行すると、実際のサンプルデータが作成されます
/*
-- カテゴリーごとに5件ずつ投稿を作成
INSERT INTO board_posts (category_id, title, content, author_name, ip_hash)
SELECT 
    c.id,
    'サンプル投稿 ' || row_number() OVER (PARTITION BY c.id),
    'これはカテゴリー「' || c.name || '」のサンプル投稿です。',
    '名無しさん',
    md5(random()::text)
FROM board_categories c
CROSS JOIN generate_series(1, 5);

-- 各投稿に3件ずつ返信を作成
INSERT INTO board_replies (post_id, content, author_name, ip_hash)
SELECT 
    p.id,
    'サンプル返信 ' || row_number() OVER (PARTITION BY p.id),
    '名無しさん',
    md5(random()::text)
FROM board_posts p
CROSS JOIN generate_series(1, 3);

-- 返信数を更新
UPDATE board_posts p
SET reply_count = (SELECT COUNT(*) FROM board_replies r WHERE r.post_id = p.id);
*/

-- ============================================
-- 6. パフォーマンステスト
-- ============================================
-- 各テーブルの行数
SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- テーブルサイズ
SELECT
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS table_size,
    pg_size_pretty(pg_indexes_size(relid)) AS indexes_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- ============================================
-- 最終メッセージ
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'テストクエリの使い方:';
    RAISE NOTICE '1. 各セクションを個別に実行してください';
    RAISE NOTICE '2. エラーが出た場合は、その前のセクションで問題を特定';
    RAISE NOTICE '3. すべて成功したら、本番データの投入が可能です';
    RAISE NOTICE '========================================';
END $$;