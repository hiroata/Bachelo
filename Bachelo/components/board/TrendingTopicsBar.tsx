'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Flame, Hash, Zap } from 'lucide-react';
import Link from 'next/link';

interface TrendingTopic {
  id: string;
  tag: string;
  count: number;
  growth: number;
  heat: 'hot' | 'warm' | 'rising';
}

export default function TrendingTopicsBar() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    // ダミーのトレンディングトピック
    const trendingTopics: TrendingTopic[] = [
      { id: '1', tag: '#不倫相手募集', count: 1234, growth: 85, heat: 'hot' },
      { id: '2', tag: '#初体験の話', count: 892, growth: 45, heat: 'warm' },
      { id: '3', tag: '#人妻とセフレ', count: 2341, growth: 120, heat: 'hot' },
      { id: '4', tag: '#露出プレイ', count: 567, growth: 30, heat: 'rising' },
      { id: '5', tag: '#スワッピング体験', count: 445, growth: 95, heat: 'hot' },
      { id: '6', tag: '#上司と部下', count: 1567, growth: 60, heat: 'warm' },
      { id: '7', tag: '#３P経験談', count: 789, growth: 110, heat: 'hot' },
      { id: '8', tag: '#マッチングアプリ', count: 3456, growth: 40, heat: 'warm' },
      { id: '9', tag: '#ワンナイト', count: 2123, growth: 75, heat: 'warm' },
      { id: '10', tag: '#SMプレイ', count: 656, growth: 150, heat: 'hot' }
    ];

    setTopics(trendingTopics);

    // 自動スクロールアニメーション
    const interval = setInterval(() => {
      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHeatIcon = (heat: string) => {
    switch (heat) {
      case 'hot':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'warm':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'rising':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      default:
        return <Hash className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHeatColor = (heat: string) => {
    switch (heat) {
      case 'hot':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'warm':
        return 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white';
      case 'rising':
        return 'bg-gradient-to-r from-yellow-400 to-green-400 text-gray-800';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 py-3">
          {/* ラベル */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Flame className="w-5 h-5 text-red-500" />
            <span className="font-bold text-sm">急上昇</span>
          </div>

          {/* トピックスクロール */}
          <div className="flex-1 overflow-hidden">
            <div className={`flex gap-3 transition-transform duration-500 ${isScrolling ? '-translate-x-32' : ''}`}>
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/board?tag=${encodeURIComponent(topic.tag)}`}
                  className="flex-shrink-0"
                >
                  <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform ${getHeatColor(topic.heat)}`}>
                    {getHeatIcon(topic.heat)}
                    <span>{topic.tag}</span>
                    <span className="text-xs opacity-90">
                      {topic.count > 1000 ? `${(topic.count / 1000).toFixed(1)}k` : topic.count}
                    </span>
                    {topic.growth > 100 && (
                      <span className="text-xs bg-white/20 px-1 rounded">
                        +{topic.growth}%
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* もっと見る */}
          <Link
            href="/board/trending"
            className="flex-shrink-0 text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            すべて見る →
          </Link>
        </div>
      </div>
    </div>
  );
}