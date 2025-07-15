-- 掲示板関連テーブルの存在確認とデータ確認

-- 1. テーブルの存在確認
SELECT 
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM 
    pg_tables
WHERE 
    schemaname = 'public' 
    AND tablename LIKE 'board_%'
ORDER BY 
    tablename;

-- 2. カテゴリーの確認
SELECT COUNT(*) as category_count FROM board_categories;
SELECT * FROM board_categories ORDER BY display_order;

-- 3. 投稿の確認
SELECT COUNT(*) as post_count FROM board_posts;

-- 4. テーブルの列情報確認
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'board_posts'
ORDER BY 
    ordinal_position;

-- 5. RLSの状態確認
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM 
    pg_tables
WHERE 
    schemaname = 'public' 
    AND tablename LIKE 'board_%';