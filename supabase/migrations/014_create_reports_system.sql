-- 通報システムの作成

-- 通報理由のenum型
CREATE TYPE report_reason AS ENUM (
  'illegal_content',       -- 違法コンテンツ
  'child_abuse',          -- 児童虐待・児童ポルノ
  'harassment',           -- ハラスメント・いじめ
  'spam',                -- スパム
  'copyright',           -- 著作権侵害
  'personal_info',       -- 個人情報の掲載
  'violence',            -- 暴力的コンテンツ
  'other'                -- その他
);

-- 通報ステータスのenum型
CREATE TYPE report_status AS ENUM (
  'pending',     -- 未対応
  'reviewing',   -- 確認中
  'resolved',    -- 対応済み
  'dismissed'    -- 却下
);

-- 通報テーブル
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 通報対象の情報
  content_type TEXT NOT NULL CHECK (content_type IN ('voice_post', 'board_post', 'board_reply')),
  content_id UUID NOT NULL,
  
  -- 通報内容
  reason report_reason NOT NULL,
  description TEXT,
  
  -- 通報者情報（匿名）
  reporter_ip_hash TEXT NOT NULL,
  
  -- ステータス
  status report_status DEFAULT 'pending' NOT NULL,
  
  -- 管理者の対応
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  
  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- インデックス
CREATE INDEX idx_reports_content ON reports(content_type, content_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- 同一IPからの重複通報を防ぐためのユニーク制約
CREATE UNIQUE INDEX idx_reports_unique_per_ip ON reports(content_type, content_id, reporter_ip_hash)
WHERE status = 'pending';

-- 通報統計ビュー
CREATE VIEW report_statistics AS
SELECT 
  content_type,
  reason,
  status,
  COUNT(*) as count,
  DATE_TRUNC('day', created_at) as date
FROM reports
GROUP BY content_type, reason, status, DATE_TRUNC('day', created_at);

-- 通報数の多いコンテンツを見つけるビュー
CREATE VIEW reported_content_summary AS
SELECT 
  content_type,
  content_id,
  COUNT(*) as report_count,
  ARRAY_AGG(DISTINCT reason) as reasons,
  MAX(created_at) as latest_report_at
FROM reports
WHERE status IN ('pending', 'reviewing')
GROUP BY content_type, content_id
HAVING COUNT(*) >= 3  -- 3件以上の通報があるコンテンツ
ORDER BY report_count DESC;