-- カテゴリーテーブルにアイコンフィールドを追加
ALTER TABLE board_categories 
ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT '📋';

-- 既存カテゴリーのアイコンを更新
UPDATE board_categories SET icon = '💬' WHERE slug = 'general';
UPDATE board_categories SET icon = '❓' WHERE slug = 'questions';
UPDATE board_categories SET icon = '📰' WHERE slug = 'news';
UPDATE board_categories SET icon = '🎨' WHERE slug = 'hobby';
UPDATE board_categories SET icon = '🏠' WHERE slug = 'local';
UPDATE board_categories SET icon = '💕' WHERE slug = 'love';
UPDATE board_categories SET icon = '💼' WHERE slug = 'work';
UPDATE board_categories SET icon = '💄' WHERE slug = 'beauty';
UPDATE board_categories SET icon = '👗' WHERE slug = 'fashion';
UPDATE board_categories SET icon = '🍜' WHERE slug = 'food';
UPDATE board_categories SET icon = '🎮' WHERE slug = 'game';
UPDATE board_categories SET icon = '📺' WHERE slug = 'anime';
UPDATE board_categories SET icon = '🎵' WHERE slug = 'music';
UPDATE board_categories SET icon = '🎬' WHERE slug = 'movie';
UPDATE board_categories SET icon = '⚽' WHERE slug = 'sports';
UPDATE board_categories SET icon = '👨‍👩‍👧‍👦' WHERE slug = 'married';
UPDATE board_categories SET icon = '🙋' WHERE slug = 'single';
UPDATE board_categories SET icon = '🎓' WHERE slug = 'student';
UPDATE board_categories SET icon = '🐕' WHERE slug = 'pet';
UPDATE board_categories SET icon = '🏥' WHERE slug = 'health';

-- 既存のカテゴリー（もしあれば）
UPDATE board_categories SET icon = '🗾' WHERE slug = 'region';
UPDATE board_categories SET icon = '📹' WHERE slug = 'video';
UPDATE board_categories SET icon = '🖼️' WHERE slug = 'image';
UPDATE board_categories SET icon = '🎤' WHERE slug = 'voice';
UPDATE board_categories SET icon = '🤫' WHERE slug = 'confession';
UPDATE board_categories SET icon = '🎨' WHERE slug = 'illustration';