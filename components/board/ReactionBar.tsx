'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// リアクションタイプ定義
export type ReactionType = 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow' | 'cute' | 'hot' | 'cool' | 'thinking' | 'crying' | 'party';

// リアクション設定
const REACTIONS = {
  like: { emoji: '👍', label: 'いいね', color: 'text-blue-500' },
  love: { emoji: '❤️', label: '大好き', color: 'text-red-500' },
  laugh: { emoji: '😂', label: '爆笑', color: 'text-yellow-500' },
  angry: { emoji: '😠', label: '怒り', color: 'text-red-600' },
  sad: { emoji: '😢', label: '悲しい', color: 'text-blue-400' },
  wow: { emoji: '😮', label: 'すごい', color: 'text-purple-500' },
  cute: { emoji: '🥰', label: 'かわいい', color: 'text-pink-500' },
  hot: { emoji: '🔥', label: '熱い', color: 'text-orange-500' },
  cool: { emoji: '😎', label: 'クール', color: 'text-gray-600' },
  thinking: { emoji: '🤔', label: '考える', color: 'text-indigo-500' },
  crying: { emoji: '😭', label: '泣く', color: 'text-blue-600' },
  party: { emoji: '🎉', label: 'お祝い', color: 'text-yellow-600' }
};

interface ReactionBarProps {
  postId?: string;
  replyId?: string;
  userId: string;
  className?: string;
  showLabels?: boolean;
}

interface ReactionStats {
  [key: string]: number;
}

export default function ReactionBar({
  postId,
  replyId,
  userId,
  className = '',
  showLabels = false
}: ReactionBarProps) {
  const [reactions, setReactions] = useState<ReactionStats>({});
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // リアクション統計を取得
  useEffect(() => {
    fetchReactions();
  }, [postId, replyId]);

  const fetchReactions = async () => {
    try {
      const targetParam = postId ? `postId=${postId}` : `replyId=${replyId}`;
      const response = await fetch(`/api/reactions?${targetParam}`);
      const data = await response.json();
      
      if (data.reactions) {
        setReactions(data.reactions);
      }
    } catch (error) {
      console.error('Failed to fetch reactions:', error);
    }
  };

  // リアクション追加/削除
  const handleReaction = async (reactionType: ReactionType) => {
    if (loading) return;

    setLoading(true);
    const wasActive = userReactions.has(reactionType);
    const action = wasActive ? 'remove' : 'add';

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          replyId,
          reactionType,
          userId,
          action
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update reaction');
      }

      // ローカル状態更新
      const newUserReactions = new Set(userReactions);
      const newReactions = { ...reactions };

      if (wasActive) {
        newUserReactions.delete(reactionType);
        newReactions[reactionType] = Math.max(0, (newReactions[reactionType] || 0) - 1);
      } else {
        newUserReactions.add(reactionType);
        newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
      }

      setUserReactions(newUserReactions);
      setReactions(newReactions);

      // 成功フィードバック
      if (!wasActive) {
        toast.success(`${REACTIONS[reactionType].emoji} ${REACTIONS[reactionType].label}`, {
          duration: 1000
        });
      }

    } catch (error) {
      console.error('Reaction error:', error);
      toast.error('リアクションの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 表示するリアクション（カウントがあるもの）
  const activeReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a); // カウント順でソート

  // よく使われるリアクション（上位4つ）
  const popularReactions: ReactionType[] = ['like', 'love', 'laugh', 'wow'];

  return (
    <div className={`reaction-bar ${className}`}>
      {/* アクティブなリアクション表示 */}
      {activeReactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {activeReactions.map(([type, count]) => {
            const reaction = REACTIONS[type as ReactionType];
            const isUserReacted = userReactions.has(type as ReactionType);
            
            return (
              <button
                key={type}
                onClick={() => handleReaction(type as ReactionType)}
                disabled={loading}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                  transition-all duration-200 hover:scale-105
                  ${isUserReacted 
                    ? 'bg-blue-100 border-blue-300 border text-blue-700' 
                    : 'bg-gray-100 border-gray-300 border hover:bg-gray-200'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="text-sm">{reaction.emoji}</span>
                <span className="font-medium">{count}</span>
                {showLabels && (
                  <span className="hidden sm:inline">{reaction.label}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* リアクション追加ボタン */}
      <div className="flex items-center gap-1">
        {/* 人気リアクション */}
        {popularReactions.map((type) => {
          const reaction = REACTIONS[type];
          const isActive = userReactions.has(type);
          
          return (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={loading}
              className={`
                p-2 rounded-full transition-all duration-200 hover:scale-110
                ${isActive 
                  ? 'bg-blue-100 border-blue-300 border' 
                  : 'hover:bg-gray-100 border border-transparent'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={reaction.label}
            >
              <span className="text-lg">{reaction.emoji}</span>
            </button>
          );
        })}

        {/* その他のリアクション展開ボタン */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="その他のリアクション"
        >
          <span className={`text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ➕
          </span>
        </button>
      </div>

      {/* 展開されたリアクション一覧 */}
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Object.entries(REACTIONS).map(([type, reaction]) => {
              const isActive = userReactions.has(type as ReactionType);
              const count = reactions[type] || 0;
              
              return (
                <button
                  key={type}
                  onClick={() => handleReaction(type as ReactionType)}
                  disabled={loading}
                  className={`
                    flex flex-col items-center p-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-100 border-blue-300 border text-blue-700' 
                      : 'hover:bg-white hover:shadow-sm border border-transparent'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={reaction.label}
                >
                  <span className="text-xl mb-1">{reaction.emoji}</span>
                  <span className="text-xs text-center leading-tight">
                    {reaction.label}
                  </span>
                  {count > 0 && (
                    <span className="text-xs font-medium text-gray-500 mt-1">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}