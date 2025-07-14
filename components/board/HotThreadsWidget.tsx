'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, TrendingUp, Crown, Clock } from 'lucide-react';
import { BoardPost } from '@/types/board';

interface HotThread extends BoardPost {
  trend_score?: number;
}

export default function HotThreadsWidget() {
  const [hotThreads, setHotThreads] = useState<HotThread[]>([]);
  const [trendingThreads, setTrendingThreads] = useState<HotThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hot' | 'trending'>('hot');

  useEffect(() => {
    fetchHotThreads();
    // リアルタイム更新のため、30秒ごとに再取得
    const interval = setInterval(fetchHotThreads, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHotThreads = async () => {
    try {
      // 今日の人気スレッド（24時間以内でビュー数が多い）
      const hotResponse = await fetch('/api/board/rankings/hot');
      if (hotResponse.ok) {
        const hotData = await hotResponse.json();
        setHotThreads(hotData.posts || []);
      }

      // 急上昇スレッド（短時間で急激にビューが増えた）
      const trendingResponse = await fetch('/api/board/rankings/trending');
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        setTrendingThreads(trendingData.posts || []);
      }
    } catch (error) {
      console.error('Error fetching hot threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  const getHeatLevel = (viewCount: number) => {
    if (viewCount >= 50000) return { icon: '🔥🔥🔥', color: 'text-red-600' };
    if (viewCount >= 20000) return { icon: '🔥🔥', color: 'text-orange-600' };
    if (viewCount >= 10000) return { icon: '🔥', color: 'text-orange-500' };
    return { icon: '📌', color: 'text-gray-600' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayThreads = activeTab === 'hot' ? hotThreads : trendingThreads;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-red-500 p-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Flame className="w-5 h-5" />
          リアルタイムランキング
        </h2>
        <p className="text-pink-100 text-sm mt-1">今最も熱いスレッドをチェック！</p>
      </div>

      {/* タブ */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('hot')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'hot'
              ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-4 h-4" />
            今日の人気
          </div>
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'trending'
              ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            急上昇
          </div>
        </button>
      </div>

      {/* スレッドリスト */}
      <div className="p-4">
        {displayThreads.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {activeTab === 'hot' ? '人気スレッドを集計中...' : '急上昇スレッドを検出中...'}
          </p>
        ) : (
          <div className="space-y-3">
            {displayThreads.slice(0, 10).map((thread, index) => {
              const heat = getHeatLevel(thread.view_count);
              return (
                <Link
                  key={thread.id}
                  href={`/board/post/${thread.id}`}
                  className="block group"
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                    {/* ランキング番号 */}
                    <div className="flex-shrink-0">
                      {index === 0 && (
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                          <Crown className="w-4 h-4" />
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                          2
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                          3
                        </div>
                      )}
                      {index > 2 && (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* スレッド情報 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-pink-600 transition line-clamp-2">
                        <span className={`${heat.color} mr-1`}>{heat.icon}</span>
                        {thread.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{thread.author_name}</span>
                        <span>・</span>
                        <span>{formatNumber(thread.view_count)} view</span>
                        <span>・</span>
                        <span>{thread.replies?.length || 0} res</span>
                        {activeTab === 'trending' && thread.trend_score && (
                          <>
                            <span>・</span>
                            <span className="text-pink-600 font-medium">
                              ↑{thread.trend_score}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* もっと見る */}
        {displayThreads.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href={`/board/rankings?tab=${activeTab}`}
              className="block text-center text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              ランキングをもっと見る →
            </Link>
          </div>
        )}
      </div>

      {/* 更新時刻 */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>30秒ごとに自動更新</span>
        </div>
      </div>
    </div>
  );
}