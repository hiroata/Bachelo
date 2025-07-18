export interface AdultCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  bgGradient: string;
  icon?: string;
  emoji?: string;
  postCount?: number;
  isSpecial?: boolean;
  ageRestricted?: boolean;
}

export const adultCategories: AdultCategory[] = [
  // メインカテゴリー
  {
    id: 'incest',
    name: '近親相姦',
    slug: 'incest',
    description: '禁断の世界、家族との体験談',
    color: 'red',
    bgGradient: 'from-rose-800 to-red-950',
    emoji: '🚫',
    isSpecial: true,
    ageRestricted: true
  },
  {
    id: 'exhibitionism',
    name: '露出狂の隠れ家',
    slug: 'exhibitionism',
    description: '露出体験談や目撃報告、スリルと興奮',
    color: 'yellow',
    bgGradient: 'from-amber-700 to-orange-900',
    emoji: '👁️'
  },
  {
    id: 'acquaintance-wife',
    name: '知り合いの人妻',
    slug: 'acquaintance-wife',
    description: '人妻や熟女とのセックス体験、寝取られ体験',
    color: 'purple',
    bgGradient: 'from-purple-800 to-indigo-950',
    emoji: '💍'
  },
  {
    id: 'sm-dungeon',
    name: 'SM調教の館',
    slug: 'sm-dungeon',
    description: '陵辱を愛するSMマニアの集いの場',
    color: 'red',
    bgGradient: 'from-gray-900 to-black',
    emoji: '⛓️',
    isSpecial: true
  },
  
  // 体験・ジャンル別
  {
    id: 'lgbt',
    name: '同性愛者の館',
    slug: 'lgbt',
    description: 'ゲイ・レズビアン体験や男装・女装体験',
    color: 'blue',
    bgGradient: 'from-blue-800 to-indigo-900',
    emoji: '🏳️‍🌈'
  },
  {
    id: 'masturbation',
    name: 'やっぱりオナニーが一番',
    slug: 'masturbation',
    description: 'オナニーが大好きだと云う貴方の舌白',
    color: 'yellow',
    bgGradient: 'from-orange-700 to-red-800',
    emoji: '💦'
  },
  {
    id: 'erotic-experience',
    name: '投稿 エッチ体験',
    slug: 'erotic-experience',
    description: 'あなたが体験したエッチな出来事',
    color: 'pink',
    bgGradient: 'from-pink-700 to-rose-900',
    emoji: '💕'
  },
  {
    id: 'fetish-mania',
    name: 'フェチとマニアの楽園',
    slug: 'fetish-mania',
    description: 'エッチのこだわりや性癖',
    color: 'purple',
    bgGradient: 'from-indigo-800 to-purple-950',
    emoji: '🎭'
  },
  
  // 特殊カテゴリー
  {
    id: 'rape-stories',
    name: 'レイプ犯された私',
    slug: 'rape-stories',
    description: '女性のレイプ体験、強姦体験',
    color: 'gray',
    bgGradient: 'from-slate-800 to-gray-950',
    emoji: '⚠️',
    isSpecial: true,
    ageRestricted: true
  },
  {
    id: 'school-girl',
    name: 'スクールガール白書',
    slug: 'school-girl',
    description: '友達の妹や生徒とのエッチ秘話',
    color: 'pink',
    bgGradient: 'from-pink-600 to-fuchsia-800',
    emoji: '🎒'
  },
  {
    id: 'massage',
    name: 'マッサージで感じちゃった私達',
    slug: 'massage',
    description: '普通のマッサージで思わず感じてしまった！',
    color: 'green',
    bgGradient: 'from-teal-700 to-emerald-900',
    emoji: '💆'
  },
  {
    id: 'pickup-techniques',
    name: '裏ナンパ術',
    slug: 'pickup-techniques',
    description: 'ナンパスポットやとっておきのナンパテク',
    color: 'blue',
    bgGradient: 'from-sky-700 to-blue-900',
    emoji: '🎯'
  },
  
  // 情報・創作系
  {
    id: 'adult-shop',
    name: '風俗大王',
    slug: 'adult-shop',
    description: '風俗に関する情報や体験談',
    color: 'yellow',
    bgGradient: 'from-amber-800 to-orange-950',
    emoji: '👑'
  },
  {
    id: 'erotic-novel',
    name: '官能小説の館',
    slug: 'erotic-novel',
    description: '様々なテーマの体験告白的な官能小説',
    color: 'red',
    bgGradient: 'from-red-800 to-rose-950',
    emoji: '📚'
  },
  {
    id: 'voice-erotica',
    name: 'Koe-Koe',
    slug: 'voice-erotica',
    description: 'エロ声やオナニーボイス、喘ぎ声',
    color: 'purple',
    bgGradient: 'from-violet-700 to-purple-900',
    emoji: '🎙️'
  },
  {
    id: 'ero-board',
    name: 'エロ板',
    slug: 'ero-board',
    description: '画像貼り付け掲示板、エロ画像をジャンル別に投稿',
    color: 'pink',
    bgGradient: 'from-fuchsia-700 to-purple-900',
    emoji: '🖼️'
  },
  
  // 実写・活動系
  {
    id: 'ada-community',
    name: 'アダコミ',
    slug: 'ada-community',
    description: '地域でつながるコミュニティ掲示板',
    color: 'blue',
    bgGradient: 'from-cyan-700 to-teal-900',
    emoji: '🗾'
  },
  {
    id: 'ero-activity',
    name: 'エロ活',
    slug: 'ero-activity',
    description: '性的嗜好・エロ活動',
    color: 'orange',
    bgGradient: 'from-orange-700 to-red-900',
    emoji: '🔥'
  },
  {
    id: 'real-experience',
    name: 'エロ体験談',
    slug: 'real-experience',
    description: '素人投稿のエロ体験談',
    color: 'red',
    bgGradient: 'from-rose-700 to-pink-900',
    emoji: '📝'
  },
  {
    id: 'video-board',
    name: '動画掲示板',
    slug: 'video-board',
    description: '撮影した動画を投稿',
    color: 'purple',
    bgGradient: 'from-indigo-700 to-blue-950',
    emoji: '🎥'
  },
  
  // SNS・ツール系
  {
    id: 'nan-net-id',
    name: 'ナンネットID',
    slug: 'nan-net-id',
    description: 'SNSコミュニティ',
    color: 'blue',
    bgGradient: 'from-blue-700 to-sky-900',
    emoji: '🆔'
  },
  {
    id: 'general-navi',
    name: '総合ナビ',
    slug: 'general-navi',
    description: 'ナンネット総合案内',
    color: 'gray',
    bgGradient: 'from-slate-700 to-gray-900',
    emoji: '🧭'
  },
  {
    id: 'news',
    name: 'ニュース',
    slug: 'news',
    description: 'ナンネットのニュース掲示板',
    color: 'green',
    bgGradient: 'from-emerald-700 to-green-950',
    emoji: '📰'
  }
];

// カテゴリーをグループ化
export const categoryGroups = {
  main: adultCategories.slice(0, 4),
  experience: adultCategories.slice(4, 8),
  special: adultCategories.slice(8, 12),
  information: adultCategories.slice(12, 16),
  community: adultCategories.slice(16, 20),
  tools: adultCategories.slice(20)
};

// 人気カテゴリーを取得
export const getPopularCategories = () => {
  return [
    adultCategories.find(c => c.slug === 'acquaintance-wife'),
    adultCategories.find(c => c.slug === 'masturbation'),
    adultCategories.find(c => c.slug === 'erotic-experience'),
    adultCategories.find(c => c.slug === 'massage'),
    adultCategories.find(c => c.slug === 'voice-erotica')
  ].filter(Boolean);
};