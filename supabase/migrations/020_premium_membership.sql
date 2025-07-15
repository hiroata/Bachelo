-- プレミアム会員システムの実装
BEGIN;

-- 1. 会員プランテーブル
CREATE TABLE IF NOT EXISTS membership_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    price INTEGER NOT NULL, -- 円単位
    duration_days INTEGER NOT NULL, -- 有効期間（日数）
    features JSONB DEFAULT '[]'::jsonb, -- 機能リスト
    max_voice_requests INTEGER DEFAULT 0, -- カスタムボイスリクエスト数
    max_downloads INTEGER DEFAULT 0, -- ダウンロード数制限
    priority_support BOOLEAN DEFAULT false, -- 優先サポート
    no_ads BOOLEAN DEFAULT false, -- 広告非表示
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. ユーザー会員情報
CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES membership_plans(id),
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 3. 決済履歴
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    membership_id UUID REFERENCES user_memberships(id),
    amount INTEGER NOT NULL, -- 円単位
    currency VARCHAR(3) DEFAULT 'JPY',
    payment_method VARCHAR(50), -- card, bank_transfer, etc
    payment_provider VARCHAR(50), -- stripe, paypal, etc
    provider_payment_id VARCHAR(255), -- 外部決済ID
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. 投げ銭（チップ）システム
CREATE TABLE IF NOT EXISTS tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- 円単位
    message TEXT,
    post_id UUID REFERENCES board_posts(id) ON DELETE SET NULL,
    voice_post_id UUID REFERENCES anonymous_voice_posts(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. カスタムボイスリクエスト
CREATE TABLE IF NOT EXISTS voice_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    script TEXT, -- 台本
    duration_seconds INTEGER, -- 希望の長さ
    price INTEGER NOT NULL, -- 円単位
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, in_progress, completed, cancelled
    deadline TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    delivered_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. クリエイター収益
CREATE TABLE IF NOT EXISTS creator_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL, -- tip, voice_request, subscription
    source_id UUID, -- 関連するレコードのID
    amount INTEGER NOT NULL, -- 円単位
    platform_fee INTEGER NOT NULL, -- プラットフォーム手数料
    net_amount INTEGER NOT NULL, -- 実際の収益
    status VARCHAR(20) DEFAULT 'pending', -- pending, available, withdrawn
    available_at TIMESTAMPTZ, -- 引き出し可能日
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. 引き出しリクエスト
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    bank_info JSONB, -- 暗号化された銀行情報
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- デフォルトプランの挿入
INSERT INTO membership_plans (name, slug, price, duration_days, features, max_voice_requests, max_downloads, priority_support, no_ads) VALUES
('無料プラン', 'free', 0, 9999, '["基本機能のみ", "広告あり"]', 0, 5, false, false),
('ライトプラン', 'light', 980, 30, '["広告なし", "月10回ダウンロード", "優先表示"]', 1, 10, false, true),
('スタンダードプラン', 'standard', 1980, 30, '["広告なし", "無制限ダウンロード", "カスタムボイス3回", "優先サポート"]', 3, 999, true, true),
('プレミアムプラン', 'premium', 2980, 30, '["全機能利用可能", "カスタムボイス10回", "専用サポート", "限定コンテンツ"]', 10, 999, true, true);

-- インデックス作成
CREATE INDEX idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_status ON user_memberships(status);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_tips_from_user ON tips(from_user_id);
CREATE INDEX idx_tips_to_user ON tips(to_user_id);
CREATE INDEX idx_voice_requests_requester ON voice_requests(requester_id);
CREATE INDEX idx_voice_requests_creator ON voice_requests(creator_id);
CREATE INDEX idx_creator_earnings_user ON creator_earnings(user_id);
CREATE INDEX idx_creator_earnings_status ON creator_earnings(status);

-- RLSポリシー（開発環境では無効）
ALTER TABLE membership_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE tips DISABLE ROW LEVEL SECURITY;
ALTER TABLE voice_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE creator_earnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests DISABLE ROW LEVEL SECURITY;

COMMIT;