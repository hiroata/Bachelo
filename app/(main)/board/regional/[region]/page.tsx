'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Heart, MessageCircle, Calendar, Users, Plus, Filter, Flame } from 'lucide-react';
import PostModal from '@/components/board/PostModal';
import { toast } from 'react-hot-toast';

// 地域データ
const regionData: {[key: string]: any} = {
  'hokkaido': { 
    name: '北海道', 
    cities: ['札幌', '旭川', '函館', '帯広', '釧路'],
    description: '北の大地で熱い出会いを！雪国ならではの温もりを求めて'
  },
  'tohoku': { 
    name: '東北', 
    cities: ['仙台', '青森', '盛岡', '秋田', '山形', '福島'],
    description: '東北美人との出会いがここに！純朴な出会いから激しい夜まで'
  },
  'kanto': { 
    name: '関東', 
    cities: ['東京', '横浜', '千葉', 'さいたま', '宇都宮', '前橋', '水戸'],
    description: '日本最大の出会いスポット！都会的な刺激を求めるならここ'
  },
  'hokuriku': { 
    name: '北陸・甲信越', 
    cities: ['新潟', '金沢', '富山', '福井', '長野', '甲府'],
    description: '雪深い地域の熱い関係！温泉デートから始まる大人の関係'
  },
  'tokai': { 
    name: '東海', 
    cities: ['名古屋', '静岡', '岐阜', '津'],
    description: '情熱的な東海地方！派手好きな女性との出会い'
  },
  'kansai': { 
    name: '関西', 
    cities: ['大阪', '京都', '神戸', '奈良', '大津', '和歌山'],
    description: 'ノリの良い関西人との楽しい出会い！本音で語り合える関係へ'
  },
  'chugoku': { 
    name: '中国', 
    cities: ['広島', '岡山', '山口', '鳥取', '松江'],
    description: '穏やかな瀬戸内の出会い！じっくりと深まる大人の関係'
  },
  'shikoku': { 
    name: '四国', 
    cities: ['高松', '松山', '高知', '徳島'],
    description: 'お遍路さんも立ち寄る出会いの場！四国ならではの温かい関係'
  },
  'kyushu': { 
    name: '九州・沖縄', 
    cities: ['福岡', '北九州', '熊本', '鹿児島', '長崎', '大分', '宮崎', '那覇'],
    description: '九州男児と九州美人の熱い出会い！南国の開放的な関係を'
  }
};

export default function RegionalDetailPage() {
  const params = useParams();
  const regionSlug = params.region as string;
  const region = regionData[regionSlug];
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

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
    fetchRegionalPosts();
  }, [selectedCity, selectedType]);

  const fetchRegionalPosts = async () => {
    setLoading(true);
    try {
      // 地域名でフィルタリング
      const regionName = region.name;
      const response = await fetch(`/api/board/posts?region=${encodeURIComponent(regionName)}&per_page=100`);
      const data = await response.json();
      
      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      // エラー時はモックデータのみ
      setPosts(generateMockPosts());
    } finally {
      setLoading(false);
    }
  };

  const generateMockPosts = () => {
    if (!region) return [];
    
    const types = ['即会い', 'セフレ', '不倫', 'SM', 'パパ活'];
    const posts = [];
    
    for (let i = 0; i < 10; i++) {
      const city = region.cities[Math.floor(Math.random() * region.cities.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const age = Math.floor(Math.random() * 20) + 20;
      
      posts.push({
        id: `mock-${i}`,
        title: `【${city}】${type}希望の${age}歳です♡`,
        content: `${city}在住です。${type === '即会い' ? '今夜会える人探してます！' : 
                  type === 'セフレ' ? '定期的に会える都合のいい関係を…' :
                  type === '不倫' ? '既婚者ですが刺激が欲しくて…' :
                  type === 'SM' ? 'ちょっと変わったプレイに興味があります' :
                  '経済的に余裕のある紳士な方募集中'}
                  
優しくてエッチな人がタイプです♡
まずはメッセージから始めましょう！`,
        author_name: `${city}の淫乱女子`,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        view_count: Math.floor(Math.random() * 5000) + 500,
        plus_count: Math.floor(Math.random() * 200) + 20,
        replies_count: Math.floor(Math.random() * 50) + 5,
        type: type,
        city: city,
        age: age
      });
    }
    
    return posts;
  };

  if (!region) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">地域が見つかりません</p>
      </div>
    );
  }

  const filteredPosts = posts.filter(post => {
    if (selectedCity !== 'all' && post.city !== selectedCity) return false;
    if (selectedType !== 'all' && post.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <MapPin className="w-8 h-8" />
              {region.name}の出会い掲示板
            </h1>
            <p className="text-pink-100">{region.description}</p>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-white text-pink-500 px-6 py-3 rounded-lg hover:bg-pink-50 transition flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            投稿する
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-semibold">絞り込み</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 都市フィルター */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">エリア</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">すべて</option>
              {region.cities.map((city: string) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          {/* タイプフィルター */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">募集タイプ</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">すべて</option>
              <option value="即会い">即会い</option>
              <option value="セフレ">セフレ</option>
              <option value="不倫">不倫</option>
              <option value="SM">SM</option>
              <option value="パパ活">パパ活</option>
            </select>
          </div>
        </div>
      </div>

      {/* 投稿一覧 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-900">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded">
                        {post.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {post.city}
                      </span>
                      {post.age && (
                        <span>{post.age}歳</span>
                      )}
                    </div>
                  </div>
                  <button className="text-pink-500 hover:text-pink-600">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
                
                <p className="text-gray-700 mb-3 line-clamp-3">{post.content}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {post.view_count?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.replies_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <Link
                    href={`/board/post/${post.id}`}
                    className="text-pink-500 hover:text-pink-600 font-medium"
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
          <p className="text-gray-600 mb-2">該当する投稿がありません</p>
          <p className="text-sm text-gray-500">条件を変更するか、新しく投稿を作成してください</p>
        </div>
      )}

      {/* 人気エリア */}
      <div className="mt-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          {region.name}の人気エリア
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {region.cities.slice(0, 8).map((city: string) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`p-3 rounded-lg text-sm font-medium transition ${
                selectedCity === city
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* 投稿モーダル */}
      {showPostModal && (
        <PostModal
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
            fetchRegionalPosts();
            toast.success('投稿を作成しました');
          }}
          categories={categories}
          defaultTitle={`【${region.name}】`}
        />
      )}
    </div>
  );
}