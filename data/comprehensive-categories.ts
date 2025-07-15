/**
 * 包括的掲示板カテゴリー分類システム
 * すべての人の多様な興味・関心に対応する細分化されたカテゴリー構造
 */

export interface CategoryStructure {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  parentCategory?: string;
  isAdult?: boolean;
  tags?: string[];
  targetAudience?: string[];
}

export const comprehensiveCategories: CategoryStructure[] = [
  // ============================================
  // 1. ライフスタイル・日常系
  // ============================================
  {
    id: 'lifestyle-main',
    name: 'ライフスタイル',
    slug: 'lifestyle',
    description: '日常生活全般について',
    icon: '🏠',
    displayOrder: 100,
  },
  {
    id: 'daily-chat',
    name: '日常雑談',
    slug: 'daily-chat',
    description: '何気ない日々の出来事を共有',
    icon: '💬',
    displayOrder: 101,
    parentCategory: 'lifestyle-main',
    tags: ['雑談', '日常', 'チャット'],
  },
  {
    id: 'life-advice',
    name: '人生相談',
    slug: 'life-advice',
    description: '人生の悩みや選択について相談',
    icon: '🤔',
    displayOrder: 102,
    parentCategory: 'lifestyle-main',
    tags: ['相談', '人生', 'アドバイス'],
  },
  {
    id: 'family-relationships',
    name: '家族・人間関係',
    slug: 'family-relationships',
    description: '家族や友人、職場の人間関係について',
    icon: '👨‍👩‍👧‍👦',
    displayOrder: 103,
    parentCategory: 'lifestyle-main',
    tags: ['家族', '友達', '人間関係', '職場'],
  },
  {
    id: 'health-wellness',
    name: '健康・美容',
    slug: 'health-wellness',
    description: '健康管理、美容、ダイエット、メンタルヘルス',
    icon: '💪',
    displayOrder: 104,
    parentCategory: 'lifestyle-main',
    tags: ['健康', '美容', 'ダイエット', 'メンタル'],
  },
  {
    id: 'cooking-gourmet',
    name: '料理・グルメ',
    slug: 'cooking-gourmet',
    description: '料理のレシピ、レストラン情報、食べ物の話',
    icon: '🍽️',
    displayOrder: 105,
    parentCategory: 'lifestyle-main',
    tags: ['料理', 'レシピ', 'グルメ', '食べ物'],
  },

  // ============================================
  // 2. 恋愛・出会い系
  // ============================================
  {
    id: 'romance-main',
    name: '恋愛・出会い',
    slug: 'romance',
    description: '恋愛関係全般について',
    icon: '💕',
    displayOrder: 200,
  },
  {
    id: 'dating-advice',
    name: '恋愛相談',
    slug: 'dating-advice',
    description: '恋愛の悩み、アプローチ方法',
    icon: '💘',
    displayOrder: 201,
    parentCategory: 'romance-main',
    tags: ['恋愛', '相談', 'デート', 'アドバイス'],
  },
  {
    id: 'breakup-healing',
    name: '失恋・別れ',
    slug: 'breakup-healing',
    description: '失恋の癒し、別れの対処法',
    icon: '💔',
    displayOrder: 202,
    parentCategory: 'romance-main',
    tags: ['失恋', '別れ', '癒し', '立ち直り'],
  },
  {
    id: 'marriage-wedding',
    name: '結婚・婚活',
    slug: 'marriage-wedding',
    description: '結婚準備、婚活、夫婦生活',
    icon: '💒',
    displayOrder: 203,
    parentCategory: 'romance-main',
    tags: ['結婚', '婚活', '夫婦', 'ウェディング'],
  },
  {
    id: 'lgbtq-romance',
    name: 'LGBTQ+恋愛',
    slug: 'lgbtq-romance',
    description: 'LGBTQ+コミュニティの恋愛相談',
    icon: '🏳️‍🌈',
    displayOrder: 204,
    parentCategory: 'romance-main',
    tags: ['LGBTQ', 'ゲイ', 'レズビアン', 'トランス', 'クィア'],
  },

  // ============================================
  // 3. 趣味・エンターテインメント系
  // ============================================
  {
    id: 'entertainment-main',
    name: '趣味・エンタメ',
    slug: 'entertainment',
    description: '趣味とエンターテインメント全般',
    icon: '🎭',
    displayOrder: 300,
  },
  {
    id: 'anime-manga',
    name: 'アニメ・漫画',
    slug: 'anime-manga',
    description: 'アニメ、漫画の感想や考察',
    icon: '📺',
    displayOrder: 301,
    parentCategory: 'entertainment-main',
    tags: ['アニメ', '漫画', 'オタク', '2次元'],
  },
  {
    id: 'games-esports',
    name: 'ゲーム・eスポーツ',
    slug: 'games-esports',
    description: 'ビデオゲーム、モバイルゲーム、eスポーツ',
    icon: '🎮',
    displayOrder: 302,
    parentCategory: 'entertainment-main',
    tags: ['ゲーム', 'eスポーツ', 'モバゲー', 'PC'],
  },
  {
    id: 'music-concerts',
    name: '音楽・ライブ',
    slug: 'music-concerts',
    description: '音楽、アーティスト、ライブ・コンサート',
    icon: '🎵',
    displayOrder: 303,
    parentCategory: 'entertainment-main',
    tags: ['音楽', 'ライブ', 'コンサート', 'アーティスト'],
  },
  {
    id: 'movies-tv',
    name: '映画・ドラマ',
    slug: 'movies-tv',
    description: '映画、ドラマ、配信サービス',
    icon: '🎬',
    displayOrder: 304,
    parentCategory: 'entertainment-main',
    tags: ['映画', 'ドラマ', 'Netflix', '配信'],
  },
  {
    id: 'books-reading',
    name: '読書・文学',
    slug: 'books-reading',
    description: '本、小説、詩、読書感想',
    icon: '📚',
    displayOrder: 305,
    parentCategory: 'entertainment-main',
    tags: ['読書', '小説', '文学', '本'],
  },
  {
    id: 'art-culture',
    name: 'アート・文化',
    slug: 'art-culture',
    description: '美術、伝統文化、博物館、展覧会',
    icon: '🎨',
    displayOrder: 306,
    parentCategory: 'entertainment-main',
    tags: ['アート', '美術', '文化', '芸術'],
  },

  // ============================================
  // 4. スポーツ・アウトドア系
  // ============================================
  {
    id: 'sports-main',
    name: 'スポーツ・アウトドア',
    slug: 'sports',
    description: 'スポーツとアウトドア活動',
    icon: '⚽',
    displayOrder: 400,
  },
  {
    id: 'team-sports',
    name: 'チームスポーツ',
    slug: 'team-sports',
    description: 'サッカー、野球、バスケなど',
    icon: '🏀',
    displayOrder: 401,
    parentCategory: 'sports-main',
    tags: ['サッカー', '野球', 'バスケ', 'チーム'],
  },
  {
    id: 'individual-sports',
    name: '個人スポーツ',
    slug: 'individual-sports',
    description: 'テニス、ゴルフ、水泳、マラソンなど',
    icon: '🎾',
    displayOrder: 402,
    parentCategory: 'sports-main',
    tags: ['テニス', 'ゴルフ', '水泳', 'マラソン'],
  },
  {
    id: 'martial-arts',
    name: '格闘技・武道',
    slug: 'martial-arts',
    description: 'ボクシング、空手、柔道、総合格闘技',
    icon: '🥊',
    displayOrder: 403,
    parentCategory: 'sports-main',
    tags: ['格闘技', '武道', 'ボクシング', 'MMA'],
  },
  {
    id: 'outdoor-activities',
    name: 'アウトドア活動',
    slug: 'outdoor-activities',
    description: 'キャンプ、登山、釣り、ハイキング',
    icon: '🏕️',
    displayOrder: 404,
    parentCategory: 'sports-main',
    tags: ['キャンプ', '登山', '釣り', 'ハイキング'],
  },
  {
    id: 'fitness-training',
    name: 'フィットネス・筋トレ',
    slug: 'fitness-training',
    description: 'ジム、筋トレ、ヨガ、ダンス',
    icon: '💪',
    displayOrder: 405,
    parentCategory: 'sports-main',
    tags: ['筋トレ', 'ジム', 'ヨガ', 'フィットネス'],
  },

  // ============================================
  // 5. 学習・キャリア系
  // ============================================
  {
    id: 'education-main',
    name: '学習・キャリア',
    slug: 'education',
    description: '学習、教育、キャリア開発',
    icon: '🎓',
    displayOrder: 500,
  },
  {
    id: 'academic-study',
    name: '学問・研究',
    slug: 'academic-study',
    description: '大学、研究、学術的な話題',
    icon: '🔬',
    displayOrder: 501,
    parentCategory: 'education-main',
    tags: ['大学', '研究', '学術', '論文'],
  },
  {
    id: 'language-learning',
    name: '語学学習',
    slug: 'language-learning',
    description: '英語、中国語などの語学学習',
    icon: '🗣️',
    displayOrder: 502,
    parentCategory: 'education-main',
    tags: ['英語', '語学', '留学', 'TOEIC'],
  },
  {
    id: 'tech-programming',
    name: 'IT・プログラミング',
    slug: 'tech-programming',
    description: 'プログラミング、テクノロジー、IT',
    icon: '💻',
    displayOrder: 503,
    parentCategory: 'education-main',
    tags: ['プログラミング', 'IT', 'テック', 'AI'],
  },
  {
    id: 'job-career',
    name: '就職・転職',
    slug: 'job-career',
    description: '就職活動、転職、キャリア相談',
    icon: '💼',
    displayOrder: 504,
    parentCategory: 'education-main',
    tags: ['就職', '転職', 'キャリア', '面接'],
  },
  {
    id: 'certification-skills',
    name: '資格・スキル',
    slug: 'certification-skills',
    description: '資格取得、スキルアップ',
    icon: '📜',
    displayOrder: 505,
    parentCategory: 'education-main',
    tags: ['資格', 'スキル', '勉強法', '検定'],
  },

  // ============================================
  // 6. 経済・投資系
  // ============================================
  {
    id: 'finance-main',
    name: '経済・投資',
    slug: 'finance',
    description: 'お金、投資、経済について',
    icon: '💰',
    displayOrder: 600,
  },
  {
    id: 'investment-stocks',
    name: '投資・株式',
    slug: 'investment-stocks',
    description: '株式投資、FX、仮想通貨',
    icon: '📈',
    displayOrder: 601,
    parentCategory: 'finance-main',
    tags: ['投資', '株式', 'FX', '仮想通貨'],
  },
  {
    id: 'personal-finance',
    name: '節約・家計管理',
    slug: 'personal-finance',
    description: '家計簿、節約術、お金の管理',
    icon: '💵',
    displayOrder: 602,
    parentCategory: 'finance-main',
    tags: ['節約', '家計', '貯金', 'お金'],
  },
  {
    id: 'real-estate',
    name: '不動産・住宅',
    slug: 'real-estate',
    description: '住宅購入、賃貸、不動産投資',
    icon: '🏡',
    displayOrder: 603,
    parentCategory: 'finance-main',
    tags: ['不動産', '住宅', '賃貸', '購入'],
  },

  // ============================================
  // 7. 地域・コミュニティ系
  // ============================================
  {
    id: 'local-main',
    name: '地域・コミュニティ',
    slug: 'local',
    description: '地域情報とコミュニティ',
    icon: '🏘️',
    displayOrder: 700,
  },
  {
    id: 'regional-info',
    name: '地域情報',
    slug: 'regional-info',
    description: '各地域の情報、イベント、グルメ',
    icon: '🗾',
    displayOrder: 701,
    parentCategory: 'local-main',
    tags: ['地域', '観光', 'イベント', 'ローカル'],
  },
  {
    id: 'meetup-events',
    name: 'オフ会・イベント',
    slug: 'meetup-events',
    description: 'オフ会企画、イベント参加',
    icon: '🎉',
    displayOrder: 702,
    parentCategory: 'local-main',
    tags: ['オフ会', 'イベント', '集会', '交流'],
  },
  {
    id: 'volunteer-social',
    name: 'ボランティア・社会貢献',
    slug: 'volunteer-social',
    description: 'ボランティア活動、社会貢献',
    icon: '🤝',
    displayOrder: 703,
    parentCategory: 'local-main',
    tags: ['ボランティア', '社会貢献', '慈善', '支援'],
  },

  // ============================================
  // 8. 専門・マニア系
  // ============================================
  {
    id: 'specialty-main',
    name: '専門・マニア',
    slug: 'specialty',
    description: '専門的・マニアックな話題',
    icon: '🔍',
    displayOrder: 800,
  },
  {
    id: 'science-research',
    name: '科学・研究',
    slug: 'science-research',
    description: '科学、研究、学術的議論',
    icon: '🧪',
    displayOrder: 801,
    parentCategory: 'specialty-main',
    tags: ['科学', '研究', '実験', '理論'],
  },
  {
    id: 'history-culture',
    name: '歴史・文化研究',
    slug: 'history-culture',
    description: '歴史、考古学、文化研究',
    icon: '🏛️',
    displayOrder: 802,
    parentCategory: 'specialty-main',
    tags: ['歴史', '考古学', '文化', '古代'],
  },
  {
    id: 'mystery-occult',
    name: 'ミステリー・オカルト',
    slug: 'mystery-occult',
    description: '都市伝説、超常現象、ミステリー',
    icon: '👻',
    displayOrder: 803,
    parentCategory: 'specialty-main',
    tags: ['オカルト', 'ミステリー', '都市伝説', '超常現象'],
  },
  {
    id: 'philosophy-religion',
    name: '哲学・宗教',
    slug: 'philosophy-religion',
    description: '哲学的思考、宗教的議論',
    icon: '🕯️',
    displayOrder: 804,
    parentCategory: 'specialty-main',
    tags: ['哲学', '宗教', '思想', '精神'],
  },

  // ============================================
  // 9. 創作・表現系
  // ============================================
  {
    id: 'creative-main',
    name: '創作・表現',
    slug: 'creative',
    description: 'クリエイティブな活動',
    icon: '🎭',
    displayOrder: 900,
  },
  {
    id: 'writing-poetry',
    name: '文章・詩',
    slug: 'writing-poetry',
    description: '小説、詩、エッセイの創作',
    icon: '✍️',
    displayOrder: 901,
    parentCategory: 'creative-main',
    tags: ['小説', '詩', 'エッセイ', '創作'],
  },
  {
    id: 'visual-arts',
    name: 'ビジュアルアート',
    slug: 'visual-arts',
    description: '絵画、イラスト、デザイン',
    icon: '🎨',
    displayOrder: 902,
    parentCategory: 'creative-main',
    tags: ['絵画', 'イラスト', 'デザイン', 'アート'],
  },
  {
    id: 'music-creation',
    name: '音楽制作',
    slug: 'music-creation',
    description: '楽曲制作、演奏、作詞作曲',
    icon: '🎼',
    displayOrder: 903,
    parentCategory: 'creative-main',
    tags: ['作曲', '演奏', '楽器', '音楽制作'],
  },
  {
    id: 'photography-video',
    name: '写真・映像',
    slug: 'photography-video',
    description: '写真撮影、動画制作',
    icon: '📸',
    displayOrder: 904,
    parentCategory: 'creative-main',
    tags: ['写真', '動画', '撮影', '映像制作'],
  },

  // ============================================
  // 10. 大人向け・セクシュアリティ系
  // ============================================
  {
    id: 'adult-main',
    name: '大人の話題',
    slug: 'adult',
    description: '大人向けの話題（18歳以上）',
    icon: '🔞',
    displayOrder: 1000,
    isAdult: true,
    targetAudience: ['adults'],
  },
  {
    id: 'sexuality-education',
    name: 'セクシュアリティ教育',
    slug: 'sexuality-education',
    description: '性教育、性的健康について',
    icon: '📚',
    displayOrder: 1001,
    parentCategory: 'adult-main',
    isAdult: true,
    tags: ['性教育', '健康', '教育', 'セクシュアリティ'],
    targetAudience: ['adults'],
  },
  {
    id: 'intimate-relationships',
    name: '親密な関係',
    slug: 'intimate-relationships',
    description: 'パートナーとの親密な関係について',
    icon: '💞',
    displayOrder: 1002,
    parentCategory: 'adult-main',
    isAdult: true,
    tags: ['パートナー', '親密', '関係', 'カップル'],
    targetAudience: ['adults'],
  },
  {
    id: 'adult-entertainment',
    name: 'アダルトエンターテインメント',
    slug: 'adult-entertainment',
    description: '大人向けエンターテインメント',
    icon: '🎭',
    displayOrder: 1003,
    parentCategory: 'adult-main',
    isAdult: true,
    tags: ['エンターテインメント', '大人', '娯楽'],
    targetAudience: ['adults'],
  },
  {
    id: 'fetish-kink',
    name: 'フェチ・キンク',
    slug: 'fetish-kink',
    description: '特殊な性的嗜好について',
    icon: '🔗',
    displayOrder: 1004,
    parentCategory: 'adult-main',
    isAdult: true,
    tags: ['フェチ', 'キンク', '嗜好', '特殊'],
    targetAudience: ['adults'],
  },

  // ============================================
  // 11. 特殊・ニッチ系
  // ============================================
  {
    id: 'niche-main',
    name: 'ニッチ・特殊',
    slug: 'niche',
    description: 'ニッチで特殊な興味',
    icon: '🔮',
    displayOrder: 1100,
  },
  {
    id: 'collections-hobbies',
    name: 'コレクション・収集',
    slug: 'collections-hobbies',
    description: '様々なものの収集・コレクション',
    icon: '🗃️',
    displayOrder: 1101,
    parentCategory: 'niche-main',
    tags: ['コレクション', '収集', 'フィギュア', 'カード'],
  },
  {
    id: 'urban-exploration',
    name: '都市探索・廃墟',
    slug: 'urban-exploration',
    description: '廃墟探索、都市探索',
    icon: '🏚️',
    displayOrder: 1102,
    parentCategory: 'niche-main',
    tags: ['廃墟', '探索', '都市', '建築'],
  },
  {
    id: 'unusual-interests',
    name: '変わった趣味',
    slug: 'unusual-interests',
    description: '一般的でない珍しい趣味',
    icon: '🦄',
    displayOrder: 1103,
    parentCategory: 'niche-main',
    tags: ['珍しい', 'ユニーク', '変わった', '特殊'],
  },
  {
    id: 'subculture',
    name: 'サブカルチャー',
    slug: 'subculture',
    description: '様々なサブカルチャー',
    icon: '🎌',
    displayOrder: 1104,
    parentCategory: 'niche-main',
    tags: ['サブカル', 'カウンターカルチャー', 'アンダーグラウンド'],
  },

  // ============================================
  // 12. 質問・相談・情報交換系
  // ============================================
  {
    id: 'qa-main',
    name: '質問・相談',
    slug: 'qa',
    description: '質問と相談の場',
    icon: '❓',
    displayOrder: 1200,
  },
  {
    id: 'general-questions',
    name: '一般質問',
    slug: 'general-questions',
    description: 'どんな質問でもOK',
    icon: '❔',
    displayOrder: 1201,
    parentCategory: 'qa-main',
    tags: ['質問', '回答', 'ヘルプ', 'サポート'],
  },
  {
    id: 'technical-help',
    name: '技術的な質問',
    slug: 'technical-help',
    description: 'IT、技術的な問題解決',
    icon: '🔧',
    displayOrder: 1202,
    parentCategory: 'qa-main',
    tags: ['技術', 'IT', 'トラブル', 'ヘルプ'],
  },
  {
    id: 'buying-advice',
    name: '購入相談',
    slug: 'buying-advice',
    description: '商品・サービスの購入相談',
    icon: '🛒',
    displayOrder: 1203,
    parentCategory: 'qa-main',
    tags: ['購入', '相談', 'レビュー', '比較'],
  },
  {
    id: 'recommendation',
    name: 'おすすめ・紹介',
    slug: 'recommendation',
    description: '様々なおすすめ情報',
    icon: '👍',
    displayOrder: 1204,
    parentCategory: 'qa-main',
    tags: ['おすすめ', '紹介', 'レコメンド', '情報'],
  },

  // ============================================
  // 13. 時事・社会系
  // ============================================
  {
    id: 'social-main',
    name: '時事・社会',
    slug: 'social',
    description: '社会問題と時事ニュース',
    icon: '📰',
    displayOrder: 1300,
  },
  {
    id: 'current-events',
    name: 'ニュース・時事',
    slug: 'current-events',
    description: '最新ニュース、時事問題',
    icon: '📺',
    displayOrder: 1301,
    parentCategory: 'social-main',
    tags: ['ニュース', '時事', '社会', '政治'],
  },
  {
    id: 'social-issues',
    name: '社会問題',
    slug: 'social-issues',
    description: '社会問題についての議論',
    icon: '⚖️',
    displayOrder: 1302,
    parentCategory: 'social-main',
    tags: ['社会問題', '議論', '政治', '人権'],
  },
  {
    id: 'environment',
    name: '環境・エコロジー',
    slug: 'environment',
    description: '環境問題、エコロジー',
    icon: '🌱',
    displayOrder: 1303,
    parentCategory: 'social-main',
    tags: ['環境', 'エコ', '自然', '持続可能性'],
  },

  // ============================================
  // 14. 特別カテゴリー
  // ============================================
  {
    id: 'special-main',
    name: '特別カテゴリー',
    slug: 'special',
    description: '特別な目的のカテゴリー',
    icon: '⭐',
    displayOrder: 1400,
  },
  {
    id: 'anonymous-confessions',
    name: '匿名告白',
    slug: 'anonymous-confessions',
    description: '誰にも言えない秘密や告白',
    icon: '🤫',
    displayOrder: 1401,
    parentCategory: 'special-main',
    tags: ['告白', '秘密', '匿名', '本音'],
  },
  {
    id: 'emotional-support',
    name: '心の支え',
    slug: 'emotional-support',
    description: '辛い時の心の支えになる場',
    icon: '🤗',
    displayOrder: 1402,
    parentCategory: 'special-main',
    tags: ['支え', '癒し', '励まし', '心'],
  },
  {
    id: 'random-chat',
    name: 'ランダム雑談',
    slug: 'random-chat',
    description: '何でもアリの自由な雑談',
    icon: '🎲',
    displayOrder: 1403,
    parentCategory: 'special-main',
    tags: ['雑談', 'ランダム', '自由', 'チャット'],
  },
  {
    id: 'test-sandbox',
    name: 'テスト・お試し',
    slug: 'test-sandbox',
    description: '投稿テスト、お試し用',
    icon: '🧪',
    displayOrder: 1404,
    parentCategory: 'special-main',
    tags: ['テスト', 'お試し', '練習', 'サンドボックス'],
  },
];

// カテゴリー検索・フィルタリング用のヘルパー関数
export const categoryHelpers = {
  /**
   * 大人向けカテゴリーを除外
   */
  filterSafeCategories: (categories: CategoryStructure[]) => 
    categories.filter(cat => !cat.isAdult),

  /**
   * 大人向けカテゴリーのみ取得
   */
  getAdultCategories: (categories: CategoryStructure[]) => 
    categories.filter(cat => cat.isAdult),

  /**
   * 親カテゴリーのみ取得
   */
  getMainCategories: (categories: CategoryStructure[]) => 
    categories.filter(cat => !cat.parentCategory),

  /**
   * 特定の親カテゴリーの子カテゴリーを取得
   */
  getSubCategories: (categories: CategoryStructure[], parentId: string) => 
    categories.filter(cat => cat.parentCategory === parentId),

  /**
   * タグによる検索
   */
  searchByTags: (categories: CategoryStructure[], searchTags: string[]) => 
    categories.filter(cat => 
      cat.tags && cat.tags.some(tag => 
        searchTags.some(searchTag => 
          tag.toLowerCase().includes(searchTag.toLowerCase())
        )
      )
    ),

  /**
   * キーワードによる検索
   */
  searchByKeyword: (categories: CategoryStructure[], keyword: string) => 
    categories.filter(cat => 
      cat.name.toLowerCase().includes(keyword.toLowerCase()) ||
      cat.description.toLowerCase().includes(keyword.toLowerCase()) ||
      (cat.tags && cat.tags.some(tag => 
        tag.toLowerCase().includes(keyword.toLowerCase())
      ))
    ),

  /**
   * 表示順でソート
   */
  sortByDisplayOrder: (categories: CategoryStructure[]) => 
    [...categories].sort((a, b) => a.displayOrder - b.displayOrder),
};

export default comprehensiveCategories;
