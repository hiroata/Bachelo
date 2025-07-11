'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

interface TopicCardProps {
  rank?: number;
  title: string;
  href: string;
  commentCount: number;
  plusVotes: number;
  minusVotes: number;
  createdAt: string;
  thumbnail?: string;
}

export default function TopicCard({
  rank,
  title,
  href,
  commentCount,
  plusVotes,
  minusVotes,
  createdAt,
  thumbnail
}: TopicCardProps) {
  const calculateVotePercentage = () => {
    const total = plusVotes + minusVotes;
    return total > 0 ? (plusVotes / total) * 100 : 50;
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${Math.floor(num / 1000)}k`;
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-pink-100 hover:shadow-md transition p-4">
      <div className="flex gap-4">
        {/* ランキング番号 */}
        {rank && rank <= 3 && (
          <div className="flex-shrink-0">
            <div className={`ranking-number ${rank === 1 ? 'text-lg' : ''}`}>
              {rank}位
            </div>
          </div>
        )}

        {/* サムネイル */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-pink-100 rounded-lg flex items-center justify-center">
            <span className="text-3xl">
              {thumbnail || '💕'}
            </span>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1">
          <Link
            href={href}
            className="text-lg font-bold text-gray-800 hover:text-pink-500 transition line-clamp-2"
          >
            {title}
          </Link>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {commentCount}コメント
            </span>
            <span>{createdAt}</span>
          </div>

          {/* 投票バー */}
          <div className="mt-3">
            <div className="flex items-center gap-4">
              <button className="vote-plus-btn">
                + {formatNumber(plusVotes)}
              </button>
              
              <div className="flex-1 vote-bar">
                <div 
                  className="vote-bar-fill"
                  style={{ width: `${calculateVotePercentage()}%` }}
                />
              </div>
              
              <button className="vote-minus-btn">
                - {formatNumber(minusVotes)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}