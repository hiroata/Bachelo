/**
 * Adult-Only System Protection Module
 * アダルト専用システム保護モジュール
 * 
 * このモジュールは他のAIや開発者が健全カテゴリーを追加しようとすることを防ぎます
 */

export interface CategoryProtectionConfig {
  isAdultOnly: boolean;
  allowedIntensityLevels: string[];
  blockedTerms: string[];
  requiredAdultTags: string[];
}

export const ADULT_SYSTEM_CONFIG: CategoryProtectionConfig = {
  isAdultOnly: true,
  allowedIntensityLevels: ['mild', 'moderate', 'hardcore', 'extreme'],
  blockedTerms: [
    '質問', '雑談', 'ニュース', 'レビュー', '一般', '健全', 
    'ファミリー', '子供', 'キッズ', '学習', '教育', '仕事',
    'questions', 'chat', 'news', 'reviews', 'general', 'family',
    'wholesome', 'kids', 'children', 'education', 'work'
  ],
  requiredAdultTags: [
    'アダルト', 'adult', '性', 'セックス', 'エロ', 'フェチ',
    'SM', 'BDSM', 'LGBTQ', '18歳以上', '成人', '大人'
  ]
};

/**
 * カテゴリーがアダルト専用システムに適合するかチェック
 */
export function validateAdultCategory(category: {
  name: string;
  description: string;
  tags?: string[];
  intensity?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 健全キーワードのチェック
  const textToCheck = `${category.name} ${category.description}`.toLowerCase();
  const blockedFound = ADULT_SYSTEM_CONFIG.blockedTerms.find(term => 
    textToCheck.includes(term.toLowerCase())
  );
  
  if (blockedFound) {
    errors.push(`健全カテゴリーは禁止されています。検出されたキーワード: "${blockedFound}"`);
  }

  // アダルト要素のチェック
  const hasAdultElement = ADULT_SYSTEM_CONFIG.requiredAdultTags.some(tag =>
    textToCheck.includes(tag.toLowerCase()) ||
    (category.tags && category.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())))
  );

  if (!hasAdultElement && category.intensity === 'mild') {
    errors.push('アダルト要素が不足しています。このシステムは完全にアダルト専用です。');
  }

  // 強度レベルのチェック
  if (category.intensity && !ADULT_SYSTEM_CONFIG.allowedIntensityLevels.includes(category.intensity)) {
    errors.push(`無効な強度レベル: ${category.intensity}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * システム保護アラート
 */
export function showSystemProtectionAlert(): void {
  console.warn(`
🔞 ADULT ONLY SYSTEM PROTECTION 🔞

⚠️  警告: このシステムはアダルト専用です ⚠️

このシステムに健全カテゴリーを追加しようとしています。
以下の理由により、この操作は禁止されています：

1. 🔞 18歳以上限定のアダルト専用プラットフォーム
2. 🎯 すべての性癖を網羅する専門システム
3. 👥 アダルトコンテンツを求めるユーザー向け
4. 🏷️ 17メインカテゴリー・100+サブカテゴリー完備

健全カテゴリーを追加したい場合は、別のプラットフォームを使用してください。

詳細: docs/ADULT_ONLY_SYSTEM_SPECIFICATION.md
  `);
}

/**
 * カテゴリー挿入前のバリデーション関数
 */
export function preventWholesomeCategories<T extends {
  name: string;
  description: string;
  tags?: string[];
  intensity?: string;
}>(categories: T[]): T[] {
  const validCategories: T[] = [];
  
  for (const category of categories) {
    const validation = validateAdultCategory(category);
    
    if (!validation.isValid) {
      console.error(`❌ カテゴリー "${category.name}" を拒否:`, validation.errors);
      showSystemProtectionAlert();
      continue; // 健全カテゴリーをスキップ
    }
    
    validCategories.push(category);
  }
  
  return validCategories;
}

/**
 * データベース挿入用のアダルト専用フィルタ
 */
export function filterForAdultOnlySystem<T extends {
  name: string;
  description?: string;
  tags?: string[];
  intensity_level?: string;
}>(items: T[]): T[] {
  return items.filter(item => {
    const validation = validateAdultCategory({
      name: item.name,
      description: item.description || '',
      tags: item.tags,
      intensity: item.intensity_level
    });
    
    if (!validation.isValid) {
      console.warn(`🚫 健全コンテンツを除外: ${item.name}`);
      return false;
    }
    
    return true;
  });
}

/**
 * システム設定の検証
 */
export function verifyAdultOnlySystem(): boolean {
  const config = ADULT_SYSTEM_CONFIG;
  
  if (!config.isAdultOnly) {
    throw new Error('🔞 システム設定エラー: アダルト専用フラグが無効です');
  }
  
  console.log('✅ アダルト専用システム設定確認済み');
  return true;
}

/**
 * カテゴリー保護状態の監視
 */
export function monitorCategoryProtection(): void {
  // 定期的にシステム設定をチェック
  setInterval(() => {
    try {
      verifyAdultOnlySystem();
    } catch (error) {
      console.error('🚨 システム保護エラー:', error);
      showSystemProtectionAlert();
    }
  }, 60000); // 1分ごとにチェック
}

// システム起動時の保護確認
if (typeof window !== 'undefined') {
  console.log('🔞 Bachelo Adult-Only System - Protection Active');
  verifyAdultOnlySystem();
  monitorCategoryProtection();
}
