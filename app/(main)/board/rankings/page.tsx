'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Flame, TrendingUp, Trophy, Clock, Calendar, MessageCircle, Eye, ThumbsUp } from 'lucide-react';
import { BoardPost } from '@/types/board';

interface RankedPost extends BoardPost {
  trend_score?: number;
  rank?: number;
}

function RankingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'hot' | 'trending' | 'all-time' || 'hot';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [posts, setPosts] = useState<RankedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [activeTab, timeRange]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/board/rankings/';
      
      switch (activeTab) {
        case 'hot':
          endpoint += 'hot';
          break;
        case 'trending':
          endpoint += 'trending';
          break;
        case 'all-time':
          endpoint += 'all-time';
          break;
      }

      if (timeRange !== '24h') {
        endpoint += `?range=${timeRange}`;
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    return num.toLocaleString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">{rank}</span>;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return '1時間以内';
    if (diffHours < 24) return `${diffHours}時間前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-xl shadow-lg p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">🏆 掲示板ランキング</h1>
        <p className="text-pink-100">最も注目を集めているスレッドをチェック！</p>
      </div>

      {/* タブ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('hot')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              activeTab === 'hot'
                ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-5 h-5" />
              <span>人気ランキング</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              activeTab === 'trending'
                ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>急上昇</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('all-time')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              activeTab === 'all-time'
                ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" />
              <span>殿堂入り</span>
            </div>
          </button>
        </div>

        {/* 期間フィルター */}
        <div className="p-4 bg-gray-50 flex items-center gap-4">
          <span className="text-sm text-gray-600">期間:</span>
          <div className="flex gap-2">
            {['24h', '7d', '30d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  timeRange === range
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range === '24h' && '24時間'}
                {range === '7d' && '1週間'}
                {range === '30d' && '1ヶ月'}
                {range === 'all' && 'すべて'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ランキングリスト */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">ランキングデータがありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition ${
                index < 3 ? 'border-pink-200' : 'border-gray-100'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* ランク */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* コンテンツ */}
                  <div className="flex-1">
                    <Link
                      href={`/board/post/${post.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-pink-500 transition"
                    >
                      {post.title}
                    </Link>
                    
                    <p className="text-gray-600 mt-2 line-clamp-2">{post.content}</p>
                    
                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                      <span className="font-medium">{post.author_name}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeAgo(post.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(post.view_count)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.replies?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.plus_count || 0}</span>
                      </div>
                      {activeTab === 'trending' && post.trend_score && (
                        <span className="text-pink-600 font-medium">
                          ↑{post.trend_score}%
                        </span>
                      )}
                    </div>

                    {/* カテゴリー */}
                    {post.category && (
                      <div className="mt-3">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                          {post.category.icon && <span>{post.category.icon}</span>}
                          {post.category.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RankingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      </div>
    }>
      <RankingsContent />
    </Suspense>
  );
}