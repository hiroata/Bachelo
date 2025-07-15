-- 初期板データの投入
-- 既存のカテゴリーを5ch風の板に変換

INSERT INTO boards (slug, name, description, category, display_order, default_name) VALUES
-- ニュース系
('newsplus', 'ニュース速報+', '最新ニュースについて語る板', 'ニュース', 1, '名無しさん'),
('news', 'ニュース速報', 'ニュース全般', 'ニュース', 2, '名無しさん'),
('news4vip', 'ニュー速VIP', 'なんでも雑談', 'ニュース', 3, '以下、名無しにかわりましてVIPがお送りします'),

-- 雑談系
('livejupiter', 'なんでも実況J', 'なんJ', '雑談', 10, '風吹けば名無し'),
('morningcoffee', 'モーニング娘。（狼）', 'ハロプロ・芸能雑談', '雑談', 11, '名無し募集中。。。'),
('poverty', '嫌儲', 'ニュース雑談', '雑談', 12, '番組の途中ですがアフィサイトへの転載は禁止です'),

-- 趣味系
('gamesm', 'ゲーム速報', 'ゲーム総合', '趣味', 20, '名無しさん'),
('anime', 'アニメ', 'アニメ作品について', '趣味', 21, '名無しさん'),
('comic', '漫画', '漫画作品について', '趣味', 22, '名無しさん'),
('music', '音楽', '音楽全般', '趣味', 23, '名無しさん'),
('movie', '映画', '映画作品について', '趣味', 24, '名無しさん'),
('sports', 'スポーツ', 'スポーツ全般', '趣味', 25, '名無しさん'),

-- 生活系
('fashion', 'ファッション', 'ファッション・美容', '生活', 30, '名無しさん'),
('food', '料理・グルメ', '食べ物・料理について', '生活', 31, '名無しさん'),
('love', '恋愛', '恋愛相談・体験談', '生活', 32, '名無しさん'),
('job', '仕事', '仕事・転職・キャリア', '生活', 33, '名無しさん'),
('money', 'お金', '投資・節約・マネー', '生活', 34, '名無しさん'),

-- 専門系
('tech', 'プログラミング', 'IT技術・プログラミング', '専門', 40, '名無しさん'),
('science', '科学', '科学・学問', '専門', 41, '名無しさん'),
('health', '健康', '健康・医療', '専門', 42, '名無しさん');

-- 板ごとの設定を更新
UPDATE boards SET settings = jsonb_build_object(
  'require_email', false,
  'enable_id', true,
  'enable_trip', true,
  'max_file_size', 5242880,  -- 5MB
  'allowed_file_types', ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  'thread_autosage', 1000,    -- 1000レスで自動sage
  'thread_autoarchive', 1000  -- 1000レスでdat落ち
);

-- VIP板は特別な設定
UPDATE boards 
SET settings = settings || jsonb_build_object(
  'enable_be', true,
  'force_id', true
)
WHERE slug = 'news4vip';

-- なんJも特別な設定
UPDATE boards 
SET settings = settings || jsonb_build_object(
  'enable_team_icons', true,
  'baseball_mode', true
)
WHERE slug = 'livejupiter';