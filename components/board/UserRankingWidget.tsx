'use client';

import { useState, useEffect } from 'react';
import { Crown, Trophy, Medal, Star, Flame, Heart } from 'lucide-react';

interface RankedUser {
  rank: number;
  name: string;
  score: number;
  posts: number;
  likes: number;
  title: string;
  badge: string;
}

export default function UserRankingWidget() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'all'>('weekly');
  const [rankings, setRankings] = useState<RankedUser[]>([]);

  useEffect(() => {
    // ダミーデータ（実際はAPIから取得）
    const generateRankings = () => {
      const titles = [
        'エロ神', '夜の帝王', '快楽の女王', '欲望の支配者', '官能の達人',
        '誘惑の天使', '淫靡な悪魔', '情熱の戦士', '禁断の果実', '背徳の薔薇'
      ];

      const badges = ['🔥', '💎', '👑', '🌟', '💋', '🍑', '🔞', '💕', '🎭', '🌹'];

      const users: RankedUser[] = [];
      for (let i = 1; i <= 10; i++) {
        users.push({
          rank: i,
          name: `エロ${activeTab === 'weekly' ? '週間' : activeTab === 'monthly' ? '月間' : '歴代'}王者${i}`,
          score: Math.floor(Math.random() * 50000) + 10000 - (i * 3000),
          posts: Math.floor(Math.random() * 100) + 20,
          likes: Math.floor(Math.random() * 5000) + 1000,
          title: titles[i - 1],
          badge: badges[i - 1]
        });
      }
      
      users.sort((a, b) => b.score - a.score);
      users.forEach((user, index) => user.rank = index + 1);
      
      setRankings(users);
    };

    generateRankings();
  }, [activeTab]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-gray-600 font-semibold">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Flame className="w-6 h-6 text-red-500" />
          エロ番付ランキング
        </h2>
      </div>

      {/* タブ */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'weekly'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          週間
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'monthly'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          月間
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'all'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          歴代
        </button>
      </div>

      {/* ランキングリスト */}
      <div className="space-y-3">
        {rankings.map((user) => (
          <div
            key={user.rank}
            className={`p-4 rounded-lg border transition-all duration-200 ${getRankStyle(user.rank)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(user.rank)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-2xl">{user.badge}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    称号: <span className="text-pink-600 font-medium">{user.title}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-pink-600">
                  {user.score.toLocaleString()}pt
                </div>
                <div className="text-xs text-gray-600">
                  投稿{user.posts} | <Heart className="inline w-3 h-3" />{user.likes}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 自分のランキング */}
      <div className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
        <div className="text-sm text-gray-600 mb-1">あなたの順位</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-pink-600">#324</span>
            <span className="text-sm text-gray-600">/ 10,234人中</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">1,234pt</div>
            <div className="text-xs text-gray-600">あと100ptで昇格！</div>
          </div>
        </div>
      </div>

      {/* ランキング報酬 */}
      <div className="mt-4 text-xs text-gray-600 text-center">
        <Star className="inline w-4 h-4 text-yellow-500" />
        上位ランカーには特別な称号とバッジが付与されます
      </div>
    </div>
  );
}