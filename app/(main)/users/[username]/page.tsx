'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, MapPin, Calendar, Star, Gift, Play } from 'lucide-react';
import TipModal from '@/components/ui/TipModal';
import { useParams } from 'next/navigation';

// モックユーザーデータ
const mockUsers: {[key: string]: any} = {
  'yuri42': {
    id: 'user1',
    username: 'yuri42',
    display_name: '熟女教師ゆり',
    age: 42,
    location: '福岡',
    bio: '現役教師してます。若い男の子が大好き♡ 放課後の個人レッスンしてあげる。経験豊富なテクニックで、あなたを虜にしちゃいます。',
    avatar: '/api/placeholder/200/200',
    cover: '/api/placeholder/800/300',
    stats: {
      posts: 156,
      followers: 3420,
      likes: 15600,
      voice_posts: 28
    },
    tags: ['熟女', '巨乳', 'フェラ上手', '中出しOK', '不倫'],
    is_premium: true,
    joined: '2024年6月',
    recent_posts: [
      { id: 1, title: '教え子との禁断の関係', views: 5234, likes: 342 },
      { id: 2, title: '職員室でこっそりオナニー', views: 3421, likes: 256 },
      { id: 3, title: '保護者面談で誘惑してしまった話', views: 4532, likes: 298 }
    ],
    voice_samples: [
      { id: 1, title: '先生の個人レッスン♡', duration: '3:45', plays: 1234 },
      { id: 2, title: 'いけない生徒への罰', duration: '5:21', plays: 987 }
    ]
  },
  'miki28': {
    id: 'user2',
    username: 'miki28',
    display_name: '淫乱妻みき',
    age: 28,
    location: '東京',
    bio: 'セックスレスの人妻です。旦那には内緒で刺激を求めています。昼間の密会希望♡ Mな部分もあるので、優しく激しく攻めてください。',
    avatar: '/api/placeholder/200/200',
    cover: '/api/placeholder/800/300',
    stats: {
      posts: 89,
      followers: 2156,
      likes: 9800,
      voice_posts: 15
    },
    tags: ['人妻', '不倫願望', '昼顔', '潮吹き', 'ドM'],
    is_premium: false,
    joined: '2024年8月',
    recent_posts: [
      { id: 1, title: '旦那が出張中の過ごし方', views: 3421, likes: 234 },
      { id: 2, title: '初めての浮気体験', views: 2987, likes: 189 },
      { id: 3, title: '車内でのスリルが忘れられない', views: 4123, likes: 276 }
    ]
  }
};

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'voices' | 'about'>('posts');
  const [showTipModal, setShowTipModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // モックデータから取得
    const userData = mockUsers[username];
    if (userData) {
      setUser(userData);
    }
  }, [username]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">ユーザーが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* カバー画像 */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-pink-400 to-purple-400">
        {/* <Image src={user.cover} alt="Cover" fill className="object-cover" /> */}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      {/* プロフィールヘッダー */}
      <div className="relative px-4 pb-4">
        <div className="relative -mt-16 mb-4">
          <div className="w-32 h-32 bg-white rounded-full p-2 mx-auto md:mx-0">
            <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.display_name[0]}
            </div>
          </div>
          {user.is_premium && (
            <div className="absolute bottom-0 right-0 bg-yellow-500 text-white p-2 rounded-full">
              <Star className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="md:flex md:items-start md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold mb-1">{user.display_name}</h1>
            <p className="text-gray-600 mb-2">@{user.username}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {user.location}
              </span>
              <span>{user.age}歳</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {user.joined}から活動
              </span>
            </div>

            <p className="text-gray-800 mb-4">{user.bio}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {user.tags.map((tag: string) => (
                <span key={tag} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                isFollowing
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
            >
              {isFollowing ? 'フォロー中' : 'フォロー'}
            </button>
            <button
              onClick={() => setShowTipModal(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
            >
              <Gift className="w-4 h-4" />
              投げ銭
            </button>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold">{user.stats.posts}</div>
            <div className="text-sm text-gray-600">投稿</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.stats.followers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">フォロワー</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.stats.likes.toLocaleString()}</div>
            <div className="text-sm text-gray-600">いいね</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.stats.voice_posts}</div>
            <div className="text-sm text-gray-600">ボイス</div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex border-b border-gray-200 px-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-3 font-medium transition ${
            activeTab === 'posts'
              ? 'border-b-2 border-pink-500 text-pink-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          投稿
        </button>
        <button
          onClick={() => setActiveTab('voices')}
          className={`px-4 py-3 font-medium transition ${
            activeTab === 'voices'
              ? 'border-b-2 border-pink-500 text-pink-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ボイス
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-3 font-medium transition ${
            activeTab === 'about'
              ? 'border-b-2 border-pink-500 text-pink-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          詳細
        </button>
      </div>

      {/* コンテンツ */}
      <div className="p-4">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {user.recent_posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/board/post/${post.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
              >
                <h3 className="font-semibold mb-2 text-gray-900 hover:text-pink-500">
                  {post.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.views.toLocaleString()} 閲覧
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likes} いいね
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'voices' && (
          <div className="space-y-4">
            {user.voice_samples ? user.voice_samples.map((voice: any) => (
              <div
                key={voice.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">{voice.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{voice.duration}</span>
                      <span className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        {voice.plays.toLocaleString()} 再生
                      </span>
                    </div>
                  </div>
                  <button className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition">
                    <Play className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-8">まだボイス投稿はありません</p>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">自己紹介</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">活動時間</h3>
              <p className="text-gray-700">主に平日の昼間に活動しています</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">好きなプレイ</h3>
              <div className="flex flex-wrap gap-2">
                {user.tags.map((tag: string) => (
                  <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {user.is_premium && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  プレミアムクリエイター
                </h3>
                <p className="text-sm text-gray-700">
                  カスタムボイスのリクエストを受け付けています。
                  あなただけの特別な音声を作成します。
                </p>
                <Link
                  href={`/order/${user.id}`}
                  className="inline-block mt-3 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                >
                  カスタムボイスをリクエスト
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 投げ銭モーダル */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        recipientName={user.display_name}
        recipientId={user.id}
      />
    </div>
  );
}