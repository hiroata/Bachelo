-- NGワード管理システムの作成

-- NGワードのカテゴリー
CREATE TYPE ng_word_category AS ENUM (
  'illegal',      -- 違法・犯罪関連
  'child_safety', -- 児童保護関連
  'personal_info',-- 個人情報
  'harassment',   -- ハラスメント
  'spam',        -- スパム
  'general'      -- 一般的な禁止語
);

-- NGワードの重要度
CREATE TYPE ng_word_severity AS ENUM (
  'low',      -- 低（警告のみ）
  'medium',   -- 中（投稿保留）
  'high',     -- 高（投稿拒否）
  'critical'  -- 重大（即時削除・通報）
);

-- NGワードテーブル
CREATE TABLE ng_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  category ng_word_category NOT NULL DEFAULT 'general',
  severity ng_word_severity NOT NULL DEFAULT 'medium',
  is_regex BOOLEAN DEFAULT FALSE, -- 正規表現として扱うか
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- NGワード検出ログ
CREATE TABLE ng_word_detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  detected_words TEXT[] NOT NULL,
  severity ng_word_severity NOT NULL,
  action_taken TEXT NOT NULL, -- 'blocked', 'flagged', 'auto_removed'
  user_ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- インデックス
CREATE INDEX idx_ng_words_active ON ng_words(is_active) WHERE is_active = true;
CREATE INDEX idx_ng_word_detections_content ON ng_word_detections(content_type, content_id);
CREATE INDEX idx_ng_word_detections_created_at ON ng_word_detections(created_at DESC);

-- 初期NGワードの投入
INSERT INTO ng_words (word, category, severity, description) VALUES
-- 違法・犯罪関連
('薬物販売', 'illegal', 'critical', '違法薬物の売買に関する投稿'),
('児童ポルノ', 'child_safety', 'critical', '児童の性的虐待コンテンツ'),
('援助交際', 'illegal', 'high', '売春・買春の勧誘'),

-- 個人情報
('住所：.*[都道府県].*[市区町村]', 'personal_info', 'high', '具体的な住所情報（正規表現）'),
('電話番号：[0-9]{2,4}-[0-9]{2,4}-[0-9]{4}', 'personal_info', 'high', '電話番号パターン（正規表現）'),
('本名', 'personal_info', 'medium', '実名の公開'),

-- ハラスメント
('死ね', 'harassment', 'high', '生命に関する脅迫'),
('殺す', 'harassment', 'high', '暴力的な脅迫'),
('キモい', 'harassment', 'low', '侮辱的な表現'),

-- スパム
('必ず儲かる', 'spam', 'medium', '詐欺的な勧誘'),
('簡単に稼げる', 'spam', 'medium', '詐欺的な勧誘'),

-- その他
('出会い系サイト', 'spam', 'medium', '外部サイトへの誘導')
ON CONFLICT (word) DO NOTHING;

-- NGワード検出関数
CREATE OR REPLACE FUNCTION check_ng_words(
  p_content TEXT,
  p_severity_threshold ng_word_severity DEFAULT 'low'
) RETURNS TABLE (
  word TEXT,
  category ng_word_category,
  severity ng_word_severity
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nw.word,
    nw.category,
    nw.severity
  FROM ng_words nw
  WHERE nw.is_active = true
    AND (
      (nw.is_regex = false AND p_content ILIKE '%' || nw.word || '%')
      OR 
      (nw.is_regex = true AND p_content ~* nw.word)
    )
    AND nw.severity::text >= p_severity_threshold::text
  ORDER BY nw.severity DESC;
END;
$$ LANGUAGE plpgsql;

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_ng_words_updated_at
  BEFORE UPDATE ON ng_words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();