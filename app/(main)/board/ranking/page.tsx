'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Clock, Heart, MessageCircle, Eye, Trophy, Flame, Star } from 'lucide-react';
import { BoardPost } from '@/types/board';

interface RankedPost extends BoardPost {
  rank: number;
  score: number;
}

export default function BoardRankingPage() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('weekly');
  const [category, setCategory] = useState<'trending' | 'most_viewed' | 'most_liked' | 'most_replied'>('trending');
  const [posts, setPosts] = useState<RankedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [timeRange, category]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      let endpoint = 'all-time';
      if (category === 'trending') {
        endpoint = 'trending';
      } else if (timeRange === 'daily' || timeRange === 'weekly') {
        endpoint = 'hot';
      }
      
      const response = await fetch(`/api/board/rankings/${endpoint}?range=${timeRange}`);
      
      if (!response.ok) throw new Error('Failed to fetch rankings');
      
      const data = await response.json();
      
      // ランキングスコアを計算してソート
      const rankedPosts = (data.posts || []).map((post: BoardPost, index: number) => {
        let score = 0;
        switch (category) {
          case 'trending':
            score = post.view_count + ((post.plus_count || 0) * 10) + (post.replies_count || 0) * 5;
            break;
          case 'most_viewed':
            score = post.view_count;
            break;
          case 'most_liked':
            score = (post.plus_count || 0) - (post.minus_count || 0);
            break;
          case 'most_replied':
            score = post.replies_count || 0;
            break;
        }
        
        return {
          ...post,
          rank: index + 1,
          score
        };
      });
      
      setPosts(rankedPosts);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const formatScore = (score: number, type: string) => {
    switch (type) {
      case 'most_viewed':
        return `${score.toLocaleString()} 閲覧`;
      case 'most_liked':
        return `${score.toLocaleString()} ポイント`;
      case 'most_replied':
        return `${score} 返信`;
      default:
        return `${score.toLocaleString()} pt`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Flame className="w-8 h-8 text-orange-500" />
          人気投稿ランキング
        </h1>
        <p className="text-gray-600">最も注目を集めている投稿をチェック！</p>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        {/* 期間選択 */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <div className="flex gap-2">
            {[
              { value: 'daily', label: '24時間' },
              { value: 'weekly', label: '週間' },
              { value: 'monthly', label: '月間' },
              { value: 'all', label: '全期間' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  timeRange === option.value
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* カテゴリー選択 */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'trending', label: '総合', icon: TrendingUp },
            { value: 'most_viewed', label: '閲覧数', icon: Eye },
            { value: 'most_liked', label: 'いいね数', icon: Heart },
            { value: 'most_replied', label: '返信数', icon: MessageCircle }
          ].map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setCategory(option.value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  category === option.value
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ランキング一覧 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/board/post/${post.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* ランキング順位 */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {getRankIcon(post.rank)}
                  </div>

                  {/* 投稿内容 */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 hover:text-pink-500">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.author_name}</span>
                        {post.category && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {post.category.name}
                          </span>
                        )}
                      </div>

                      {/* スコア表示 */}
                      <div className="text-sm font-semibold text-pink-600">
                        {formatScore(post.score, category)}
                      </div>
                    </div>

                    {/* 統計情報 */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.view_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.plus_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.replies_count || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ランキング1位の特別デザイン */}
                {post.rank === 1 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">
                        {timeRange === 'daily' ? '本日' : 
                         timeRange === 'weekly' ? '今週' :
                         timeRange === 'monthly' ? '今月' : '歴代'}
                        の最も{category === 'trending' ? '人気' :
                               category === 'most_viewed' ? '閲覧された' :
                               category === 'most_liked' ? '評価の高い' : '盛り上がった'}投稿
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">ランキングデータがありません</p>
        </div>
      )}

      {/* 注意事項 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p>※ ランキングは自動的に更新されます</p>
        <p>※ 不適切な投稿は予告なくランキングから除外される場合があります</p>
      </div>
    </div>
  );
}