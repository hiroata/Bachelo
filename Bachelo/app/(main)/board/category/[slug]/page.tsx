'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, MessageCircle, Calendar, Users, Plus, 
  ArrowLeft, Filter, Flame, Star, TrendingUp 
} from 'lucide-react';
import PostModal from '@/components/board/PostModal';
import { toast } from 'react-hot-toast';
import { adultCategories } from '@/data/adult-categories';

// カテゴリー別のコンテンツ生成ロジック
const generateCategoryContent = (category: any, index: number) => {
  const templates: {[key: string]: any} = {
    'incest': {
      titles: [
        "兄との秘密の関係が始まって3年",
        "実の母親に欲情してしまう息子です",
        "姉弟で一線を越えてしまった夜",
        "叔父との禁断の関係に溺れて",
        "いとこと温泉旅行で起きたこと"
      ],
      contents: [
        "誰にも言えない関係ですが、もう後戻りできません...",
        "禁断の感情を抑えきれずについに...",
        "家族なのに、こんなに求め合ってしまって...",
        "いけないとわかっているのに体が反応してしまいます",
        "血のつながりがあるからこそ興奮してしまうんです"
      ]
    },
    'exhibitionism': {
      titles: [
        "深夜の公園で全裸散歩してきました",
        "電車内でスカートの中を...",
        "オフィスのトイレで大胆露出",
        "住宅街で露出プレイの興奮",
        "カラオケボックスでの露出体験"
      ],
      contents: [
        "見られるかもしれないスリルがたまりません...",
        "誰かに見られたい願望が止まらない",
        "露出することで得られる快感に夢中です",
        "人目につくかもしれない場所でこっそり...",
        "スリルと興奮で頭が真っ白になりました"
      ]
    },
    'sm-dungeon': {
      titles: [
        "M女調教日記〜新しい世界への扉",
        "緊縛プレイで見つけた本当の自分",
        "ご主人様に仕える喜び",
        "初めてのSMクラブ体験談",
        "調教されて開発された身体"
      ],
      contents: [
        "縛られることで解放される不思議な感覚...",
        "痛みと快楽の境界線で感じる恍惚",
        "支配されることの喜びを知ってしまいました",
        "普段の私からは想像できない姿に...",
        "調教を重ねるごとに深まる関係性"
      ]
    },
    'masturbation': {
      titles: [
        "毎日5回はしちゃう私の告白",
        "オナニー中毒かもしれません",
        "新しいおもちゃレビュー♡",
        "一人エッチの極意教えます",
        "オナニーしながら書いてます"
      ],
      contents: [
        "もう我慢できなくて、今日も何度も...",
        "一人の時間が一番気持ちいいんです",
        "色んな方法を試して自分を開発中",
        "妄想しながらするのが最高に気持ちいい",
        "みんなのオナニー事情も聞きたいです"
      ]
    },
    'voice-erotica': {
      titles: [
        "喘ぎ声録音してみました♡",
        "エロボイス配信始めました",
        "声だけで感じちゃう私",
        "オナニー実況音声あります",
        "甘い囁きで耳を犯します"
      ],
      contents: [
        "声を聞かせるのも聞くのも大好きです",
        "音声だけで興奮できる人いませんか？",
        "喘ぎ声を録音して聞き返すと...",
        "声フェチさん向けのコンテンツ作ってます",
        "耳元で囁かれるのが好きな人集まれ"
      ]
    }
  };

  // デフォルトテンプレート
  const defaultTemplate = {
    titles: [
      `【${category.name}】初体験談を語ります`,
      `${category.name}の世界にハマってます`,
      `こんな${category.name}体験してきました`,
      `${category.name}好きな人と繋がりたい`,
      `${category.name}の魅力を語らせて`
    ],
    contents: [
      "この世界に足を踏み入れてから変わりました...",
      "同じ趣味の人と出会いたいです",
      "初心者ですが興味があります",
      "経験者の方、色々教えてください",
      "この快感を共有できる人いませんか？"
    ]
  };

  const template = templates[category.slug] || defaultTemplate;
  const titleIndex = index % template.titles.length;
  const contentIndex = index % template.contents.length;

  return {
    title: template.titles[titleIndex],
    content: template.contents[contentIndex]
  };
};

export default function CategoryDetailPage() {
  const params = useParams();
  const categorySlug = params.slug as string;
  const category = adultCategories.find(c => c.slug === categorySlug);
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'trending'>('new');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // カテゴリー取得
    fetch('/api/board/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    fetchCategoryPosts();
  }, [categorySlug, sortBy]);

  const fetchCategoryPosts = async () => {
    setLoading(true);
    try {
      // カテゴリーに関連する投稿を取得
      const response = await fetch(`/api/board/posts?search=${category?.name || ''}`);
      const data = await response.json();
      
      if (data.posts) {
        // カテゴリー専用のモックデータを生成
        const mockPosts = generateMockPosts();
        const allPosts = [...mockPosts, ...data.posts];
        
        // ソート処理
        const sortedPosts = sortPosts(allPosts, sortBy);
        setPosts(sortedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // エラー時はモックデータのみ
      setPosts(sortPosts(generateMockPosts(), sortBy));
    } finally {
      setLoading(false);
    }
  };

  const generateMockPosts = () => {
    if (!category) return [];
    
    const posts = [];
    const ages = [18, 19, 20, 22, 25, 28, 30, 32, 35, 38, 40, 45];
    const types = ['体験談', '募集', '相談', '質問', '雑談'];
    
    for (let i = 0; i < 20; i++) {
      const age = ages[Math.floor(Math.random() * ages.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const { title, content } = generateCategoryContent(category, i);
      
      posts.push({
        id: `mock-${categorySlug}-${i}`,
        title: `【${age}歳】${title}`,
        content: `${content}\n\n年齢: ${age}歳\nタイプ: ${type}\n\n${
          type === '募集' ? '同じ趣味の方、メッセージください♡' :
          type === '相談' ? 'アドバイスお願いします...' :
          type === '質問' ? '経験者の方教えてください！' :
          '共感してくれる人いませんか？'
        }`,
        author_name: `${category.name}好き${i}`,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        view_count: Math.floor(Math.random() * 10000) + 500,
        plus_count: Math.floor(Math.random() * 500) + 20,
        replies_count: Math.floor(Math.random() * 100) + 5,
        type: type,
        age: age,
        category_slug: categorySlug
      });
    }
    
    return posts;
  };

  const sortPosts = (posts: any[], sortType: string) => {
    switch (sortType) {
      case 'popular':
        return [...posts].sort((a, b) => b.view_count - a.view_count);
      case 'trending':
        return [...posts].sort((a, b) => {
          const aScore = a.view_count + (a.plus_count * 10) + (a.replies_count * 5);
          const bScore = b.view_count + (b.plus_count * 10) + (b.replies_count * 5);
          return bScore - aScore;
        });
      case 'new':
      default:
        return [...posts].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  };

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">カテゴリーが見つかりません</p>
      </div>
    );
  }

  const iconMap: {[key: string]: any} = {
    'incest': '🚫',
    'exhibitionism': '👁️',
    'acquaintance-wife': '💍',
    'sm-dungeon': '⛓️',
    'lgbt': '🏳️‍🌈',
    'masturbation': '💦',
    'erotic-experience': '💕',
    'fetish-mania': '🎭',
    'rape-stories': '⚠️',
    'school-girl': '🎒',
    'massage': '💆',
    'pickup-techniques': '🎯',
    'adult-shop': '👑',
    'erotic-novel': '📚',
    'voice-erotica': '🎙️',
    'ero-board': '🖼️',
    'ada-community': '🗾',
    'ero-activity': '🔥',
    'real-experience': '📝',
    'video-board': '🎥',
    'nan-net-id': '🆔',
    'general-navi': '🧭',
    'news': '📰'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className={`bg-gradient-to-r ${category.bgGradient} rounded-2xl p-8 mb-8 text-white`}>
        <Link 
          href="/board/categories"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          カテゴリー一覧に戻る
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <span className="text-4xl">{iconMap[category.slug] || category.emoji}</span>
              {category.name}
            </h1>
            <p className="text-white/90 text-lg">{category.description}</p>
            <div className="flex items-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {(Math.floor(Math.random() * 50000) + 10000).toLocaleString()} 投稿
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {(Math.floor(Math.random() * 1000) + 100).toLocaleString()} 今日の投稿
              </span>
              {category.isSpecial && (
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold">
                  特別カテゴリー
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            投稿する
          </button>
        </div>
      </div>

      {/* ソートフィルター */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold">並び替え</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('new')}
              className={`px-4 py-2 rounded-lg transition ${
                sortBy === 'new' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              新着順
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-lg transition ${
                sortBy === 'popular' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              人気順
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1 ${
                sortBy === 'trending' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Flame className="w-4 h-4" />
              話題順
            </button>
          </div>
        </div>
      </div>

      {/* 投稿一覧 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                      <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded">
                        {post.type}
                      </span>
                      {post.age && (
                        <span>{post.age}歳</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                  <button className="text-pink-500 hover:text-pink-600 p-2">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-3 whitespace-pre-wrap">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {post.view_count?.toLocaleString() || 0} 閲覧
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {post.plus_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.replies_count || 0} 返信
                    </span>
                  </div>
                  <Link
                    href={`/board/post/${post.id}`}
                    className="text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1"
                  >
                    詳細を見る
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <span className="text-6xl mb-4 block">{iconMap[category.slug] || category.emoji}</span>
          <p className="text-gray-600 mb-2">まだ投稿がありません</p>
          <p className="text-sm text-gray-500">最初の投稿者になりましょう！</p>
        </div>
      )}

      {/* 関連カテゴリー */}
      <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">関連カテゴリー</h2>
        <div className="flex flex-wrap gap-3">
          {adultCategories
            .filter(c => c.id !== category.id)
            .slice(0, 8)
            .map(relatedCategory => (
              <Link
                key={relatedCategory.id}
                href={`/board/category/${relatedCategory.slug}`}
                className="bg-white px-4 py-2 rounded-lg hover:shadow-md transition inline-flex items-center gap-2"
              >
                <span>{iconMap[relatedCategory.slug] || relatedCategory.emoji}</span>
                <span className="text-sm font-medium">{relatedCategory.name}</span>
              </Link>
            ))}
        </div>
      </div>

      {/* 投稿モーダル */}
      {showPostModal && (
        <PostModal
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
            fetchCategoryPosts();
            toast.success('投稿を作成しました');
          }}
          categories={categories}
          defaultTitle={`【${category.name}】`}
        />
      )}
    </div>
  );
}