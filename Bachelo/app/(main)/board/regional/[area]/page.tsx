'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Heart, MessageCircle, Calendar, Users, Plus } from 'lucide-react';
import PostModal from '@/components/board/PostModal';
import { toast } from 'react-hot-toast';

// 地域別の出会い系投稿
const mockRegionalPosts: {[key: string]: any[]} = {
  '東京': [
    {
      id: 1,
      title: '【池袋】今夜会える人いませんか？',
      author_name: '寂しい人妻',
      content: '旦那が出張でいません。お酒でも飲みながら…その後はホテルで。30代の人妻です。優しい方希望。',
      age: '32歳',
      meeting_type: '即会い',
      location: '池袋駅周辺',
      created_at: '1時間前',
      view_count: 234,
      reply_count: 23,
      tags: ['人妻', '即日', '飲み']
    },
    {
      id: 2,
      title: '【新宿】平日昼間に会える人募集',
      author_name: 'OLみき',
      content: '平日の昼間に会える人を探しています。ランチ→ホテルのパターンで。既婚者OK。清潔感のある方。',
      age: '28歳',
      meeting_type: '定期',
      location: '新宿三丁目',
      created_at: '3時間前',
      view_count: 156,
      reply_count: 15
    },
    {
      id: 3,
      title: '【渋谷】セフレ募集中',
      author_name: 'ギャル系JD',
      content: '都合のいい関係になれる人探してます。週1くらいで会いたい。イケメン優遇♡',
      age: '21歳',
      meeting_type: 'セフレ',
      location: '渋谷',
      created_at: '5時間前',
      view_count: 432,
      reply_count: 54
    }
  ],
  '大阪': [
    {
      id: 4,
      title: '【難波】カラオケからのホテル',
      author_name: '巨乳ちゃん',
      content: 'カラオケで一緒に歌って、その後ホテルに行きませんか？Gカップです♡',
      age: '24歳',
      meeting_type: '今日',
      location: '難波',
      created_at: '30分前',
      view_count: 567,
      reply_count: 45
    },
    {
      id: 5,
      title: '【心斎橋】不倫相手探してます',
      author_name: '欲求不満妻',
      content: '旦那とはレス5年目。週1〜2回会える人を探しています。30代〜40代の方希望。',
      age: '35歳',
      meeting_type: '不倫',
      location: '心斎橋',
      created_at: '2時間前',
      view_count: 289,
      reply_count: 31
    }
  ],
  '福岡': [
    {
      id: 6,
      title: '【天神】今から会える人！',
      author_name: 'ムラムラ女子',
      content: '急ですが今から会える人いませんか？ホテル代は割り勘で。',
      age: '26歳',
      meeting_type: '即会い',
      location: '天神駅',
      created_at: '10分前',
      view_count: 123,
      reply_count: 8
    }
  ]
};

export default function RegionalAreaPage() {
  const params = useParams();
  const area = decodeURIComponent(params.area as string);
  const [posts, setPosts] = useState<any[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    // 地域の投稿を取得（モックデータ）
    setLoading(true);
    setTimeout(() => {
      setPosts(mockRegionalPosts[area] || []);
      setLoading(false);
    }, 500);
  }, [area]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="w-8 h-8 text-pink-500" />
            {area}の出会い掲示板
          </h1>
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            投稿する
          </button>
        </div>
        <p className="text-gray-600">
          {area}エリアで出会いを求める方のための掲示板です。真剣な出会いからカジュアルな関係まで。
        </p>
      </div>

      {/* 注意事項 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800 text-sm">
          <strong>注意:</strong> 金銭のやり取りを伴う出会いは禁止です。18歳未満の利用は固くお断りします。
        </p>
      </div>

      {/* 投稿一覧 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 hover:text-pink-500">
                      {post.title}
                    </h2>
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">{post.author_name}</span>
                      <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded">{post.age}</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{post.meeting_type}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {post.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.created_at}
                      </span>
                    </div>
                    
                    {post.tags && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag: string) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center ml-4">
                    <button className="text-pink-500 hover:text-pink-600 transition mb-1">
                      <Heart className="w-6 h-6" />
                    </button>
                    <span className="text-xs text-gray-500">{post.view_count}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {post.view_count} 閲覧
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.reply_count} 返信
                    </span>
                  </div>
                  
                  <Link
                    href={`/board/post/${post.id}`}
                    className="text-pink-500 hover:text-pink-600 font-medium text-sm"
                  >
                    詳細を見る →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">{area}の投稿はまだありません</p>
          <p className="text-sm text-gray-500">最初の投稿者になって、地域の出会いを盛り上げましょう！</p>
        </div>
      )}

      {/* 他の地域へのリンク */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">他の地域を見る</h3>
        <div className="flex flex-wrap gap-2">
          {['東京', '大阪', '名古屋', '福岡', '札幌', '仙台', '広島', '京都'].map((city) => (
            <Link
              key={city}
              href={`/board/regional/${city}`}
              className={`px-4 py-2 rounded-lg transition ${
                city === area
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {city}
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
            toast.success('投稿を作成しました');
          }}
          categories={categories}
          defaultTitle={`【${area}】`}
        />
      )}
    </div>
  );
}