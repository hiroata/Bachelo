-- RLSを無効化してAPIルートでアクセス制御を行うための設定
-- これにより、SQLやRLSの知識がなくても開発が容易になります

-- 1. 各テーブルのRLSを無効化
ALTER TABLE anonymous_voice_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_reply_votes DISABLE ROW LEVEL SECURITY;

-- 2. 既存のRLSポリシーを削除（存在する場合）
DO $$ 
BEGIN
    -- anonymous_voice_posts
    DROP POLICY IF EXISTS "Anyone can view active posts" ON anonymous_voice_posts;
    DROP POLICY IF EXISTS "Anyone can create posts" ON anonymous_voice_posts;
    
    -- board関連のポリシーがあれば削除
    -- （現在は設定されていないが、将来のために記述）
END $$;

-- 注意事項:
-- このマイグレーションを適用すると、すべてのアクセス制御は
-- Next.jsのAPIルート側で行う必要があります。
-- service_role_keyを使用してサーバー側からのみアクセスしてください。