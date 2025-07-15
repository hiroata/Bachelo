/**
 * カテゴリーのアイコンマッピング
 */
export const categoryIcons: Record<string, string> = {
  // エンタメ系
  'general': '💬',
  'questions': '❓',
  'news': '📰',
  'hobby': '🎨',
  'local': '🏠',
  
  // ライフスタイル系
  'love': '💕',
  'work': '💼',
  'beauty': '💄',
  'fashion': '👗',
  'food': '🍜',
  
  // エンタメ・趣味系
  'game': '🎮',
  'anime': '📺',
  'music': '🎵',
  'movie': '🎬',
  'sports': '⚽',
  
  // コミュニティ系
  'married': '👨‍👩‍👧‍👦',
  'single': '🙋',
  'student': '🎓',
  'pet': '🐕',
  'health': '🏥',
  
  // 既存のカテゴリー（互換性のため）
  'region': '🗾',
  'video': '📹',
  'image': '🖼️',
  'voice': '🎤',
  'confession': '🤫',
  'illustration': '🎨',
};

/**
 * カテゴリーの色マッピング
 */
export const categoryColors: Record<string, { bg: string; text: string }> = {
  'love': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'game': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'anime': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'beauty': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'food': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'music': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'sports': { bg: 'bg-green-100', text: 'text-green-700' },
  'health': { bg: 'bg-red-100', text: 'text-red-700' },
};

/**
 * カテゴリーアイコンを取得
 */
export function getCategoryIcon(slug: string): string {
  return categoryIcons[slug] || '📋';
}

/**
 * カテゴリーの色を取得
 */
export function getCategoryColor(slug: string): { bg: string; text: string } {
  return categoryColors[slug] || { bg: 'bg-gray-100', text: 'text-gray-700' };
}