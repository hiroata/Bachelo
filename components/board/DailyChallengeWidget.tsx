'use client';

import { useState, useEffect } from 'react';
import { Zap, Target, Clock, Gift, Users, TrendingUp } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  reward: string;
  progress: number;
  target: number;
  participants: number;
  timeLeft: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function DailyChallengeWidget() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    // ダミーチャレンジデータ
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: '初体験エピソード投稿チャレンジ',
        description: '初めての体験を赤裸々に投稿しよう',
        type: 'daily',
        reward: 'エロポイント500pt + 限定バッジ',
        progress: 0,
        target: 1,
        participants: 234,
        timeLeft: '残り18時間',
        difficulty: 'easy'
      },
      {
        id: '2',
        title: '過激度MAXチャレンジ',
        description: '最も過激な体験談を投稿（削除されない範囲で）',
        type: 'weekly',
        reward: 'VIPステータス1週間',
        progress: 0,
        target: 3,
        participants: 567,
        timeLeft: '残り5日',
        difficulty: 'hard'
      },
      {
        id: '3',
        title: 'エロ写真コンテスト',
        description: 'セクシーな写真を投稿（規約の範囲内で）',
        type: 'special',
        reward: 'Amazonギフト券5000円',
        progress: 0,
        target: 5,
        participants: 892,
        timeLeft: '残り3日',
        difficulty: 'medium'
      },
      {
        id: '4',
        title: '深夜の告白チャレンジ',
        description: '23時〜3時の間に秘密の告白を投稿',
        type: 'daily',
        reward: '深夜の帝王バッジ',
        progress: 0,
        target: 2,
        participants: 123,
        timeLeft: '今夜23時開始',
        difficulty: 'easy'
      }
    ];

    setChallenges(mockChallenges);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Clock className="w-4 h-4" />;
      case 'weekly':
        return <TrendingUp className="w-4 h-4" />;
      case 'special':
        return <Zap className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const handleJoinChallenge = (challengeId: string) => {
    alert(`チャレンジ${challengeId}に参加しました！投稿画面に移動します...`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          エロチャレンジ
        </h2>
        <span className="text-sm text-gray-600">
          参加して報酬をゲット！
        </span>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(challenge.type)}
                <h3 className="font-semibold">{challenge.title}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty === 'easy' ? '初級' : 
                 challenge.difficulty === 'medium' ? '中級' : '上級'}
              </span>
            </div>

            {/* 説明 */}
            <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>

            {/* 報酬 */}
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-pink-600">{challenge.reward}</span>
            </div>

            {/* 進捗バー */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>進捗: {challenge.progress}/{challenge.target}</span>
                <span>{challenge.timeLeft}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                />
              </div>
            </div>

            {/* フッター */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{challenge.participants}人参加中</span>
              </div>
              <button
                onClick={() => handleJoinChallenge(challenge.id)}
                className="px-4 py-2 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition"
              >
                チャレンジに参加
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 完了済みチャレンジ */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          あなたの実績
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold text-pink-600">12</div>
            <div className="text-xs text-gray-600">完了</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">3,450</div>
            <div className="text-xs text-gray-600">獲得pt</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <div className="text-xs text-gray-600">バッジ</div>
          </div>
        </div>
      </div>
    </div>
  );
}