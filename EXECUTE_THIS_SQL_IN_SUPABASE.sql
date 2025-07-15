-- 🚨 重要: このSQLをSupabase管理パネルのSQL Editorで実行してください
-- https://app.supabase.com/project/dleqvbspjouczytouktv/editor/sql

-- 地域機能サポートのためのマイグレーション
-- board_postsテーブルにregionカラムを追加

-- 1. board_postsテーブルにregionカラムを追加
ALTER TABLE board_posts 
ADD COLUMN IF NOT EXISTS region VARCHAR(50) DEFAULT '全国';

-- 2. 地域インデックスを追加（パフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_board_posts_region 
ON board_posts (region);

-- 3. 地域とカテゴリーの複合インデックス
CREATE INDEX IF NOT EXISTS idx_board_posts_region_category 
ON board_posts (region, category_id);

-- 4. 既存の投稿にランダムな地域を割り当て（テスト用）
UPDATE board_posts 
SET region = CASE 
  WHEN RANDOM() < 0.2 THEN '北海道'
  WHEN RANDOM() < 0.4 THEN '関東'
  WHEN RANDOM() < 0.6 THEN '関西'
  WHEN RANDOM() < 0.8 THEN '九州'
  ELSE '全国'
END
WHERE region IS NULL OR region = '全国';

-- 5. 地域別の投稿数を確認
SELECT region, COUNT(*) as post_count 
FROM board_posts 
GROUP BY region 
ORDER BY post_count DESC;