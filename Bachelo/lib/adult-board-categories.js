// アダルト掲示板用カテゴリー定義

const ADULT_BOARD_CATEGORIES = [
  {
    name: 'エロ雑談',
    slug: 'general',
    description: 'ドスケベな話題で盛り上がろう',
    icon: '💦',
    display_order: 1,
    content_guidelines: 'エロい話題なんでもOK',
    age_restriction: '18+'
  },
  {
    name: 'セックス体験談',
    slug: 'adult',
    description: '生々しい体験談を投稿',
    icon: '🔥',
    display_order: 2,
    content_guidelines: 'リアルな体験談、妄想もOK',
    age_restriction: '18+'
  },
  {
    name: 'オナニー・自慰',
    slug: 'masturbation',
    description: 'オナニー体験談・テクニック',
    icon: '✊',
    display_order: 3,
    content_guidelines: 'オナニーに関する話題全般',
    age_restriction: '18+'
  },
  {
    name: 'セフレ・出会い',
    slug: 'hookup',
    description: 'エロい出会いを求める',
    icon: '💋',
    display_order: 4,
    content_guidelines: 'セフレ募集、エロい出会い',
    age_restriction: '18+'
  },
  {
    name: 'エロ画像・動画',
    slug: 'media',
    description: 'エロい画像・動画を共有',
    icon: '📹',
    display_order: 5,
    content_guidelines: 'エロい画像・動画の投稿',
    age_restriction: '18+'
  },
  {
    name: 'AV・風俗',
    slug: 'industry',
    description: 'AV・風俗情報',
    icon: '🎬',
    display_order: 6,
    content_guidelines: 'AV女優、風俗店情報',
    age_restriction: '18+'
  },
  {
    name: 'フェチ・変態',
    slug: 'fetish',
    description: 'あらゆるフェチを語ろう',
    icon: '🔗',
    display_order: 7,
    content_guidelines: 'フェチ、変態行為について',
    age_restriction: '18+'
  },
  {
    name: 'エロ質問',
    slug: 'questions',
    description: 'エッチな質問・相談',
    icon: '❓',
    display_order: 8,
    content_guidelines: 'セックス、エロに関する質問',
    age_restriction: '18+'
  }
];

// 47都道府県別のカテゴリー（地域別掲示板）
const REGIONAL_CATEGORIES = [
  // 北海道・東北
  { name: '北海道', slug: 'hokkaido', region: '北海道・東北' },
  { name: '青森', slug: 'aomori', region: '北海道・東北' },
  { name: '岩手', slug: 'iwate', region: '北海道・東北' },
  { name: '宮城', slug: 'miyagi', region: '北海道・東北' },
  { name: '秋田', slug: 'akita', region: '北海道・東北' },
  { name: '山形', slug: 'yamagata', region: '北海道・東北' },
  { name: '福島', slug: 'fukushima', region: '北海道・東北' },
  
  // 関東
  { name: '茨城', slug: 'ibaraki', region: '関東' },
  { name: '栃木', slug: 'tochigi', region: '関東' },
  { name: '群馬', slug: 'gunma', region: '関東' },
  { name: '埼玉', slug: 'saitama', region: '関東' },
  { name: '千葉', slug: 'chiba', region: '関東' },
  { name: '東京', slug: 'tokyo', region: '関東' },
  { name: '神奈川', slug: 'kanagawa', region: '関東' },
  
  // 中部
  { name: '新潟', slug: 'niigata', region: '中部' },
  { name: '富山', slug: 'toyama', region: '中部' },
  { name: '石川', slug: 'ishikawa', region: '中部' },
  { name: '福井', slug: 'fukui', region: '中部' },
  { name: '山梨', slug: 'yamanashi', region: '中部' },
  { name: '長野', slug: 'nagano', region: '中部' },
  { name: '岐阜', slug: 'gifu', region: '中部' },
  { name: '静岡', slug: 'shizuoka', region: '中部' },
  { name: '愛知', slug: 'aichi', region: '中部' },
  
  // 近畿
  { name: '三重', slug: 'mie', region: '近畿' },
  { name: '滋賀', slug: 'shiga', region: '近畿' },
  { name: '京都', slug: 'kyoto', region: '近畿' },
  { name: '大阪', slug: 'osaka', region: '近畿' },
  { name: '兵庫', slug: 'hyogo', region: '近畿' },
  { name: '奈良', slug: 'nara', region: '近畿' },
  { name: '和歌山', slug: 'wakayama', region: '近畿' },
  
  // 中国
  { name: '鳥取', slug: 'tottori', region: '中国' },
  { name: '島根', slug: 'shimane', region: '中国' },
  { name: '岡山', slug: 'okayama', region: '中国' },
  { name: '広島', slug: 'hiroshima', region: '中国' },
  { name: '山口', slug: 'yamaguchi', region: '中国' },
  
  // 四国
  { name: '徳島', slug: 'tokushima', region: '四国' },
  { name: '香川', slug: 'kagawa', region: '四国' },
  { name: '愛媛', slug: 'ehime', region: '四国' },
  { name: '高知', slug: 'kochi', region: '四国' },
  
  // 九州・沖縄
  { name: '福岡', slug: 'fukuoka', region: '九州・沖縄' },
  { name: '佐賀', slug: 'saga', region: '九州・沖縄' },
  { name: '長崎', slug: 'nagasaki', region: '九州・沖縄' },
  { name: '熊本', slug: 'kumamoto', region: '九州・沖縄' },
  { name: '大分', slug: 'oita', region: '九州・沖縄' },
  { name: '宮崎', slug: 'miyazaki', region: '九州・沖縄' },
  { name: '鹿児島', slug: 'kagoshima', region: '九州・沖縄' },
  { name: '沖縄', slug: 'okinawa', region: '九州・沖縄' }
];

// コンテンツ適合性チェック（アダルト掲示板用）
function validateAdultContent(content, categorySlug) {
  // 基本的に成人向けコンテンツは許可
  // ただし、以下は除外
  const prohibitedPatterns = [
    /未成年|18歳未満|高校生|中学生|小学生/gi,
    /売春|援助交際|売買/gi,
    /薬物|覚醒剤|麻薬/gi,
    /暴力|殺人|自殺/gi
  ];

  for (const pattern of prohibitedPatterns) {
    if (pattern.test(content)) {
      return { valid: false, reason: '禁止されているコンテンツが含まれています' };
    }
  }

  return { valid: true };
}

module.exports = {
  ADULT_BOARD_CATEGORIES,
  REGIONAL_CATEGORIES,
  validateAdultContent
};