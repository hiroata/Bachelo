-- ユーザーポイント・レベルシステムのテーブル作成

-- ユーザープロファイルテーブル（匿名ユーザー用）
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL, -- localStorage等で管理されるID
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    current_points INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    liked_count INTEGER DEFAULT 0, -- 自分の投稿がいいねされた数
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ポイント履歴テーブル
CREATE TABLE IF NOT EXISTS point_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    points INTEGER NOT NULL,
    action TEXT NOT NULL, -- 'post', 'reply', 'liked', 'hot_post', 'daily_login', etc.
    reference_id TEXT, -- 関連する投稿IDなど
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- バッジマスターテーブル
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    requirement TEXT NOT NULL, -- 取得条件の説明
    type TEXT NOT NULL, -- 'post_count', 'level', 'special', etc.
    threshold INTEGER, -- 必要な数値
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 月間MVPテーブル
CREATE TABLE IF NOT EXISTS monthly_mvp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    month DATE NOT NULL,
    total_points INTEGER NOT NULL,
    post_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month)
);

-- インデックス作成
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_level ON user_profiles(level);
CREATE INDEX idx_user_profiles_total_points ON user_profiles(total_points);
CREATE INDEX idx_point_history_user_id ON point_history(user_id);
CREATE INDEX idx_point_history_created_at ON point_history(created_at);

-- バッジデータの初期投入
INSERT INTO badges (name, description, icon, requirement, type, threshold) VALUES
    ('初投稿', '初めて投稿した', '🎯', '初めての投稿を達成', 'post_count', 1),
    ('常連さん', '投稿数10件達成', '📝', '10件の投稿を達成', 'post_count', 10),
    ('ベテラン投稿者', '投稿数50件達成', '✍️', '50件の投稿を達成', 'post_count', 50),
    ('レジェンド', '投稿数100件達成', '🏆', '100件の投稿を達成', 'post_count', 100),
    ('人気者', 'いいね100回獲得', '❤️', '合計100いいねを獲得', 'liked_count', 100),
    ('カリスマ', 'いいね500回獲得', '💖', '合計500いいねを獲得', 'liked_count', 500),
    ('レベル5', 'レベル5到達', '⭐', 'レベル5に到達', 'level', 5),
    ('レベル10', 'レベル10到達', '🌟', 'レベル10に到達', 'level', 10),
    ('レベル20', 'レベル20到達', '✨', 'レベル20に到達', 'level', 20),
    ('夜の帝王', '深夜の投稿マスター', '🌙', '深夜に50回投稿', 'special', null),
    ('朝の女王', '早朝の投稿マスター', '☀️', '早朝に50回投稿', 'special', null),
    ('週末戦士', '週末の投稿マスター', '🎉', '週末に100回投稿', 'special', null),
    ('エロ紳士', '紳士的な投稿者', '🎩', '高評価率80%以上で50投稿', 'special', null),
    ('話題の種', '盛り上がるスレッドを作成', '🔥', '100レス以上のスレッドを作成', 'special', null),
    ('月間MVP', '月間最優秀投稿者', '👑', '月間MVPに選出', 'special', null);

-- ポイント計算関数
CREATE OR REPLACE FUNCTION calculate_level(total_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- レベル計算式: sqrt(total_points / 100) + 1
    RETURN FLOOR(SQRT(total_points::FLOAT / 100)) + 1;
END;
$$ LANGUAGE plpgsql;

-- RLSポリシー（開発環境では無効）
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE point_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_mvp DISABLE ROW LEVEL SECURITY;