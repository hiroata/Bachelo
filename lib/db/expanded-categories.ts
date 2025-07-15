/**
 * 拡充された掲示板カテゴリー
 * 5ch、Reddit、ガールズちゃんねるなどを参考にした20カテゴリー
 */

export const expandedCategories = [
  // エンタメ系
  { name: '雑談', slug: 'general', description: '自由に話せる雑談掲示板', display_order: 1, icon: '💬' },
  { name: '質問', slug: 'questions', description: '質問や相談ができる掲示板', display_order: 2, icon: '❓' },
  { name: 'ニュース', slug: 'news', description: '最新ニュースや話題を共有', display_order: 3, icon: '📰' },
  { name: '趣味', slug: 'hobby', description: '趣味の話題で盛り上がろう', display_order: 4, icon: '🎨' },
  { name: '地域', slug: 'local', description: '地域の情報交換', display_order: 5, icon: '🏠' },
  
  // ライフスタイル系
  { name: '恋愛', slug: 'love', description: '恋愛相談や体験談', display_order: 6, icon: '💕' },
  { name: '仕事', slug: 'work', description: '仕事の悩みや転職情報', display_order: 7, icon: '💼' },
  { name: '美容', slug: 'beauty', description: '美容・コスメ・ダイエット', display_order: 8, icon: '💄' },
  { name: 'ファッション', slug: 'fashion', description: 'ファッション・コーディネート', display_order: 9, icon: '👗' },
  { name: 'グルメ', slug: 'food', description: '食べ物・レストラン情報', display_order: 10, icon: '🍜' },
  
  // エンタメ・趣味系
  { name: 'ゲーム', slug: 'game', description: 'ゲーム全般の話題', display_order: 11, icon: '🎮' },
  { name: 'アニメ・漫画', slug: 'anime', description: 'アニメ・漫画・ラノベ', display_order: 12, icon: '📺' },
  { name: '音楽', slug: 'music', description: '音楽・アーティスト情報', display_order: 13, icon: '🎵' },
  { name: '映画・ドラマ', slug: 'movie', description: '映画・ドラマ・配信作品', display_order: 14, icon: '🎬' },
  { name: 'スポーツ', slug: 'sports', description: 'スポーツ観戦・実況', display_order: 15, icon: '⚽' },
  
  // コミュニティ系
  { name: '既婚者', slug: 'married', description: '夫婦・家族の話題', display_order: 16, icon: '👨‍👩‍👧‍👦' },
  { name: '独身', slug: 'single', description: '独身生活・婚活', display_order: 17, icon: '🙋' },
  { name: '学生', slug: 'student', description: '学生生活・受験・就活', display_order: 18, icon: '🎓' },
  { name: 'ペット', slug: 'pet', description: 'ペット自慢・飼育相談', display_order: 19, icon: '🐕' },
  { name: '健康', slug: 'health', description: '健康・病気・メンタルヘルス', display_order: 20, icon: '🏥' },
];

/**
 * カテゴリーを階層化（将来実装用）
 */
export const categoryHierarchy = {
  'ライフ': ['恋愛', '仕事', '美容', 'ファッション', 'グルメ', '健康'],
  'エンタメ': ['ゲーム', 'アニメ・漫画', '音楽', '映画・ドラマ', 'スポーツ'],
  'コミュニティ': ['雑談', '質問', '既婚者', '独身', '学生'],
  '情報': ['ニュース', '地域', '趣味', 'ペット'],
};

/**
 * 人気カテゴリー（ホームページに表示）
 */
export const popularCategories = [
  'general', 'love', 'game', 'anime', 'beauty', 'food'
];