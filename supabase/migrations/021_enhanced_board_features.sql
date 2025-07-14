-- Enhanced Board Features Migration
-- 掲示板機能の大幅拡張

-- 1. リアクション・感情表現システム
CREATE TYPE reaction_type AS ENUM (
  'like', 'love', 'laugh', 'angry', 'sad', 'wow', 
  'cute', 'hot', 'cool', 'thinking', 'crying', 'party'
);

CREATE TABLE post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  user_id TEXT NOT NULL, -- 匿名ID
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- 同じユーザーが同じ投稿に同じリアクションは1回まで
  UNIQUE(post_id, reaction_type, user_id)
);

-- 返信用リアクション
CREATE TABLE reply_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID REFERENCES board_replies(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  user_id TEXT NOT NULL,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(reply_id, reaction_type, user_id)
);

-- 2. ユーザーレピュテーション・ランキングシステム
CREATE TABLE user_reputation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  -- 基本ポイント
  post_points INTEGER DEFAULT 0,
  reply_points INTEGER DEFAULT 0,
  reaction_received_points INTEGER DEFAULT 0,
  daily_bonus_points INTEGER DEFAULT 0,
  
  -- 品質指標
  helpful_count INTEGER DEFAULT 0,
  funny_count INTEGER DEFAULT 0,
  creative_count INTEGER DEFAULT 0,
  controversial_count INTEGER DEFAULT 0,
  
  -- レベル・バッジ
  current_level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  
  -- 統計
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  join_date DATE DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. トレンド・話題性分析
CREATE TABLE trending_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  category_id UUID REFERENCES board_categories(id),
  
  -- トレンド指標
  mention_count INTEGER DEFAULT 0,
  engagement_score FLOAT DEFAULT 0.0,
  velocity_score FLOAT DEFAULT 0.0, -- 急上昇度
  
  -- 時間範囲
  trending_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  trending_peak TIMESTAMPTZ,
  trending_end TIMESTAMPTZ,
  
  -- メタデータ
  related_posts UUID[] DEFAULT '{}',
  sentiment_score FLOAT DEFAULT 0.0, -- -1(ネガティブ) to 1(ポジティブ)
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. リアルタイム通知システム
CREATE TYPE notification_type AS ENUM (
  'reply', 'reaction', 'mention', 'follow', 'award',
  'trending', 'system', 'event', 'milestone'
);

CREATE TABLE user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- 関連データ
  related_post_id UUID,
  related_user_id TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- 状態
  is_read BOOLEAN DEFAULT FALSE,
  is_pushed BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. イベント・コンテスト機能
CREATE TYPE event_type AS ENUM (
  'contest', 'challenge', 'ama', 'collaboration',
  'theme_week', 'voting', 'celebration'
);

CREATE TYPE event_status AS ENUM (
  'planned', 'active', 'voting', 'ended', 'cancelled'
);

CREATE TABLE board_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL,
  status event_status DEFAULT 'planned',
  
  -- 期間
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  voting_end_date TIMESTAMPTZ,
  
  -- 設定
  category_id UUID REFERENCES board_categories(id),
  max_participants INTEGER,
  prize_description TEXT,
  rules TEXT,
  
  -- 統計
  participant_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- メタデータ
  featured_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  organizer_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- イベント参加
CREATE TABLE event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES board_events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT,
  
  -- 参加データ
  submission_post_id UUID,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMPTZ,
  
  UNIQUE(event_id, user_id)
);

-- 6. 高度な検索・タグシステム
CREATE TABLE post_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  auto_generated BOOLEAN DEFAULT FALSE,
  confidence_score FLOAT DEFAULT 1.0,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(post_id, tag)
);

-- 7. ユーザー行動分析
CREATE TABLE user_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'view', 'post', 'reply', 'react', 'search'
  target_type TEXT, -- 'post', 'category', 'user'
  target_id UUID,
  
  -- コンテキスト
  session_id TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  referrer TEXT,
  
  -- メタデータ
  metadata JSONB DEFAULT '{}',
  duration_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. お気に入り・ブックマーク機能
CREATE TABLE user_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
  folder_name TEXT DEFAULT 'default',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, post_id)
);

-- 9. フォロー・ソーシャル機能
CREATE TABLE user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  
  -- フォロー設定
  notify_posts BOOLEAN DEFAULT TRUE,
  notify_replies BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- 10. コンテンツ品質・モデレーション強化
CREATE TABLE content_quality_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'post', 'reply'
  content_id UUID NOT NULL,
  
  -- AI分析スコア
  readability_score FLOAT DEFAULT 0.0,
  engagement_prediction FLOAT DEFAULT 0.0,
  toxicity_score FLOAT DEFAULT 0.0,
  spam_probability FLOAT DEFAULT 0.0,
  
  -- コミュニティ評価
  community_rating FLOAT DEFAULT 0.0,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,
  
  -- フラグ
  needs_review BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_highlighted BOOLEAN DEFAULT FALSE,
  
  analyzed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(content_type, content_id)
);

-- ===== インデックス作成 =====

-- リアクション高速検索
CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_type ON post_reactions(reaction_type);
CREATE INDEX idx_reply_reactions_reply_id ON reply_reactions(reply_id);

-- ユーザーレピュテーション
CREATE INDEX idx_user_reputation_score ON user_reputation(reputation_score DESC);
CREATE INDEX idx_user_reputation_level ON user_reputation(current_level DESC);

-- トレンド分析
CREATE INDEX idx_trending_topics_score ON trending_topics(engagement_score DESC);
CREATE INDEX idx_trending_topics_velocity ON trending_topics(velocity_score DESC);
CREATE INDEX idx_trending_topics_time ON trending_topics(trending_start DESC);

-- 通知システム
CREATE INDEX idx_user_notifications_user_unread ON user_notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_user_notifications_type ON user_notifications(type, created_at DESC);

-- イベント
CREATE INDEX idx_board_events_status ON board_events(status, start_date);
CREATE INDEX idx_board_events_category ON board_events(category_id, start_date DESC);

-- ユーザー行動
CREATE INDEX idx_user_activity_user_time ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_user_activity_action ON user_activity_log(action_type, created_at DESC);

-- タグ検索
CREATE INDEX idx_post_tags_tag ON post_tags(tag);
CREATE INDEX idx_post_tags_post ON post_tags(post_id);

-- ===== ビュー作成 =====

-- ポスト拡張情報ビュー
CREATE VIEW enhanced_post_view AS
SELECT 
  p.*,
  -- リアクション集計
  (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id) as total_reactions,
  (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.reaction_type = 'like') as like_count,
  (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.reaction_type = 'love') as love_count,
  
  -- 品質スコア
  COALESCE(cqs.community_rating, 0) as quality_score,
  COALESCE(cqs.is_featured, false) as is_featured,
  
  -- タグ
  ARRAY(SELECT tag FROM post_tags pt WHERE pt.post_id = p.id) as tags,
  
  -- ユーザー情報
  ur.reputation_score,
  ur.current_level as author_level
  
FROM board_posts p
LEFT JOIN content_quality_scores cqs ON cqs.content_type = 'post' AND cqs.content_id = p.id
LEFT JOIN user_reputation ur ON ur.user_id = p.ip_hash; -- 匿名なのでip_hashで判定

-- トレンド投稿ビュー
CREATE VIEW trending_posts_view AS
SELECT 
  p.*,
  -- エンゲージメント計算
  (p.view_count * 0.1 + p.reply_count * 2 + p.plus_count * 1.5 - p.minus_count * 0.5) as engagement_score,
  -- 新しさ重み
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p.created_at)) / 3600 as age_hours,
  -- 総合トレンドスコア
  ((p.view_count * 0.1 + p.reply_count * 2 + p.plus_count * 1.5 - p.minus_count * 0.5) / 
   (1 + EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p.created_at)) / 3600)) as trend_score
   
FROM board_posts p
WHERE p.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY trend_score DESC;

-- ===== 初期データ挿入 =====

-- デフォルトのレピュテーションレコード作成
INSERT INTO user_reputation (user_id, current_level, experience_points)
SELECT DISTINCT ip_hash, 1, 0
FROM board_posts 
WHERE ip_hash IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 基本的なタグを自動生成
INSERT INTO post_tags (post_id, tag, auto_generated)
SELECT 
  id,
  bc.name,
  true
FROM board_posts p
JOIN board_categories bc ON bc.id = p.category_id
ON CONFLICT (post_id, tag) DO NOTHING;

COMMENT ON TABLE post_reactions IS '投稿・返信へのリアクション（絵文字的感情表現）';
COMMENT ON TABLE user_reputation IS 'ユーザーの評判・レベル・経験値管理';
COMMENT ON TABLE trending_topics IS 'トレンド分析・話題のキーワード追跡';
COMMENT ON TABLE user_notifications IS 'リアルタイム通知システム';
COMMENT ON TABLE board_events IS 'イベント・コンテスト・特別企画';
COMMENT ON TABLE post_tags IS '投稿のタグ付け・分類システム';
COMMENT ON TABLE user_activity_log IS 'ユーザー行動分析・アクセス解析';
COMMENT ON TABLE user_bookmarks IS 'お気に入り・ブックマーク機能';
COMMENT ON TABLE user_follows IS 'ユーザーフォロー・ソーシャル機能';
COMMENT ON TABLE content_quality_scores IS 'コンテンツ品質評価・AI分析結果';