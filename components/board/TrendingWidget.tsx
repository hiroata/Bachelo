'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Fire, Clock, Users, ArrowUp } from 'lucide-react';

interface TrendingPost {
  id: string;
  title: string;
  reply_count: number;
  view_count: number;
  plus_count: number;
  engagement_score: number;
  trend_score: number;
  age_hours: number;
  tags?: string[];
  board_categories?: {
    name: string;
    icon?: string;
  };
}

interface TrendingTopic {
  id: string;
  keyword: string;
  mention_count: number;
  engagement_score: number;
  velocity_score: number;
  sentiment_score: number;
}

interface TrendingData {
  posts: TrendingPost[];
  topics: TrendingTopic[];
  timeframe: string;
  total: number;
}

export default function TrendingWidget() {
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');
  const [activeTab, setActiveTab] = useState<'posts' | 'topics'>('posts');
  const [loading, setLoading] = useState(true);

  // トレンドデータ取得
  useEffect(() => {
    fetchTrendingData();
  }, [timeframe]);

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trending?timeframe=${timeframe}&limit=10`);
      const data = await response.json();
      setTrendingData(data);
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeframe = (tf: string) => {
    switch (tf) {
      case '1h': return '1時間';
      case '24h': return '24時間';
      case '7d': return '7日間';
      default: return tf;
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-500';
    if (score < -0.3) return 'text-red-500';
    return 'text-gray-500';
  };

  const getSentimentEmoji = (score: number) => {
    if (score > 0.3) return '😊';
    if (score < -0.3) return '😔';
    return '😐';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* ヘッダー */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Fire className="w-5 h-5 text-orange-500" />
            トレンド
          </h3>
          <button
            onClick={fetchTrendingData}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            更新
          </button>
        </div>

        {/* 時間範囲選択 */}
        <div className="flex gap-1 mb-3">
          {(['1h', '24h', '7d'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`
                px-3 py-1 rounded text-sm transition-colors
                ${timeframe === tf 
                  ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {formatTimeframe(tf)}
            </button>
          ))}
        </div>

        {/* タブ選択 */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('posts')}
            className={`
              px-3 py-1 rounded text-sm transition-colors flex items-center gap-1
              ${activeTab === 'posts' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <TrendingUp className="w-4 h-4" />
            投稿
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`
              px-3 py-1 rounded text-sm transition-colors flex items-center gap-1
              ${activeTab === 'topics' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <Users className="w-4 h-4" />
            話題
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-4">
        {activeTab === 'posts' && (
          <div className="space-y-3">
            {trendingData?.posts.slice(0, 8).map((post, index) => (
              <Link
                key={post.id}
                href={`/board/post/${post.id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {post.reply_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {Math.round(post.trend_score)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(post.age_hours)}h
                      </span>
                      {post.board_categories && (
                        <span className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                          {post.board_categories.icon} {post.board_categories.name}
                        </span>
                      )}
                    </div>

                    {/* タグ */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <ArrowUp className="w-4 h-4 text-orange-500" />
                  </div>
                </div>
              </Link>
            )) || (
              <div className="text-center py-6 text-gray-500">
                <Fire className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>トレンド投稿はありません</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="space-y-2">
            {trendingData?.topics.slice(0, 10).map((topic, index) => (
              <div
                key={topic.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                    {index + 1}
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-900">
                      #{topic.keyword}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{topic.mention_count}件の言及</span>
                      <span className={getSentimentColor(topic.sentiment_score)}>
                        {getSentimentEmoji(topic.sentiment_score)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-orange-600">
                    {Math.round(topic.engagement_score)}
                  </div>
                  {topic.velocity_score > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <ArrowUp className="w-3 h-3" />
                      急上昇
                    </div>
                  )}
                </div>
              </div>
            )) || (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>話題のキーワードはありません</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="p-3 border-t bg-gray-50 text-center">
        <Link
          href="/trending"
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          すべてのトレンドを見る →
        </Link>
      </div>
    </div>
  );
}