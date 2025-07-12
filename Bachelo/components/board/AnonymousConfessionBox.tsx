'use client';

import { useState } from 'react';
import { MessageSquare, Lock, Send, Heart, Eye, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Confession {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  views: number;
  shares: number;
  isLiked: boolean;
}

export default function AnonymousConfessionBox() {
  const [confession, setConfession] = useState('');
  const [recentConfessions, setRecentConfessions] = useState<Confession[]>([
    {
      id: '1',
      content: '実は上司と不倫してます...奥さんがいるのは知ってるけど、もう止められない。',
      timestamp: '5分前',
      likes: 45,
      views: 234,
      shares: 12,
      isLiked: false
    },
    {
      id: '2',
      content: '彼氏には内緒で、マッチングアプリで会った人と月3回は会ってる。体の相性が良すぎて...',
      timestamp: '12分前',
      likes: 89,
      views: 567,
      shares: 23,
      isLiked: true
    },
    {
      id: '3',
      content: '親友の旦那とキスしてしまった。酔った勢いだったけど、実は前から好きだった。',
      timestamp: '18分前',
      likes: 123,
      views: 892,
      shares: 34,
      isLiked: false
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confession.trim().length < 10) {
      toast.error('もう少し詳しく書いてください（10文字以上）');
      return;
    }

    const newConfession: Confession = {
      id: Date.now().toString(),
      content: confession,
      timestamp: 'たった今',
      likes: 0,
      views: 1,
      shares: 0,
      isLiked: false
    };

    setRecentConfessions([newConfession, ...recentConfessions.slice(0, 4)]);
    setConfession('');
    toast.success('匿名で投稿されました！');
  };

  const handleLike = (id: string) => {
    setRecentConfessions(recentConfessions.map(conf => 
      conf.id === id 
        ? { ...conf, likes: conf.isLiked ? conf.likes - 1 : conf.likes + 1, isLiked: !conf.isLiked }
        : conf
    ));
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Lock className="w-6 h-6 text-purple-600" />
          匿名告白ボックス
        </h2>
        <span className="text-xs text-gray-600">
          完全匿名・IP記録なし
        </span>
      </div>

      {/* 投稿フォーム */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <textarea
            value={confession}
            onChange={(e) => setConfession(e.target.value)}
            placeholder="誰にも言えない秘密を告白してください...&#10;不倫、浮気、性癖、なんでもOK"
            className="w-full p-4 pr-12 border border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            maxLength={500}
          />
          <button
            type="submit"
            className="absolute bottom-2 right-2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            disabled={confession.trim().length < 10}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-600">
            {confession.length}/500文字
          </span>
          <span className="text-xs text-purple-600">
            🔒 完全匿名で投稿されます
          </span>
        </div>
      </form>

      {/* 最近の告白 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          最新の匿名告白
        </h3>
        <div className="space-y-3">
          {recentConfessions.map((conf) => (
            <div
              key={conf.id}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <p className="text-sm text-gray-800 mb-3 leading-relaxed">
                {conf.content}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{conf.timestamp}</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(conf.id)}
                    className={`flex items-center gap-1 text-xs transition ${
                      conf.isLiked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${conf.isLiked ? 'fill-current' : ''}`} />
                    {conf.likes}
                  </button>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="w-4 h-4" />
                    {conf.views}
                  </span>
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition">
                    <Share2 className="w-4 h-4" />
                    {conf.shares}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* もっと見るリンク */}
      <div className="mt-4 text-center">
        <a
          href="/board/confessions"
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          すべての告白を見る →
        </a>
      </div>

      {/* 統計 */}
      <div className="mt-6 p-4 bg-white/50 rounded-lg">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-purple-600">3,456</div>
            <div className="text-xs text-gray-600">今日の告白</div>
          </div>
          <div>
            <div className="text-xl font-bold text-pink-600">12.3k</div>
            <div className="text-xs text-gray-600">総いいね数</div>
          </div>
          <div>
            <div className="text-xl font-bold text-yellow-600">89%</div>
            <div className="text-xs text-gray-600">共感率</div>
          </div>
        </div>
      </div>
    </div>
  );
}