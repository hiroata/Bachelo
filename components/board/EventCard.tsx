'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, Trophy, Clock, Tag, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BoardEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'contest' | 'challenge' | 'ama' | 'collaboration' | 'theme_week' | 'voting' | 'celebration';
  status: 'planned' | 'active' | 'voting' | 'ended' | 'cancelled';
  start_date: string;
  end_date: string;
  voting_end_date?: string;
  category_id?: string;
  max_participants?: number;
  prize_description?: string;
  rules?: string;
  participant_count: number;
  post_count: number;
  view_count: number;
  featured_image_url?: string;
  tags: string[];
  organizer_id: string;
  board_categories?: {
    name: string;
    icon?: string;
  };
  event_participants?: Array<{
    id: string;
    user_id: string;
    display_name: string;
    score: number;
    rank?: number;
  }>;
}

interface EventCardProps {
  event: BoardEvent;
  userId?: string;
  onJoin?: (eventId: string) => void;
  compact?: boolean;
}

const EVENT_TYPE_CONFIG = {
  contest: { label: 'コンテスト', icon: '🏆', color: 'bg-yellow-100 text-yellow-800' },
  challenge: { label: 'チャレンジ', icon: '⚡', color: 'bg-orange-100 text-orange-800' },
  ama: { label: 'AMA', icon: '❓', color: 'bg-blue-100 text-blue-800' },
  collaboration: { label: 'コラボ', icon: '🤝', color: 'bg-green-100 text-green-800' },
  theme_week: { label: 'テーマ週間', icon: '📅', color: 'bg-purple-100 text-purple-800' },
  voting: { label: '投票', icon: '🗳️', color: 'bg-indigo-100 text-indigo-800' },
  celebration: { label: 'お祝い', icon: '🎉', color: 'bg-pink-100 text-pink-800' }
};

const STATUS_CONFIG = {
  planned: { label: '予定', color: 'bg-gray-100 text-gray-800' },
  active: { label: '開催中', color: 'bg-green-100 text-green-800' },
  voting: { label: '投票中', color: 'bg-blue-100 text-blue-800' },
  ended: { label: '終了', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-800' }
};

export default function EventCard({ event, userId, onJoin, compact = false }: EventCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(
    event.event_participants?.some(p => p.user_id === userId) || false
  );

  const eventType = EVENT_TYPE_CONFIG[event.event_type];
  const status = STATUS_CONFIG[event.status];

  // 日時フォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 残り時間計算
  const getTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(event.end_date);
    const diffMs = endDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `残り${days}日`;
    if (hours > 0) return `残り${hours}時間`;
    return '残り1時間未満';
  };

  // イベント参加
  const handleJoin = async () => {
    if (!userId || isJoining || hasJoined) return;

    setIsJoining(true);
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          userId,
          displayName: `ユーザー${userId.slice(-6)}`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join event');
      }

      setHasJoined(true);
      toast.success('イベントに参加しました！');
      onJoin?.(event.id);

    } catch (error) {
      console.error('Join event error:', error);
      toast.error('参加に失敗しました');
    } finally {
      setIsJoining(false);
    }
  };

  if (compact) {
    return (
      <Link
        href={`/events/${event.id}`}
        className="block p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{eventType.icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>
                {status.label}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {event.participant_count}
              </span>
              {event.status === 'active' && (
                <span className="text-orange-600 font-medium">
                  {getTimeRemaining()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* 特色画像 */}
      {event.featured_image_url && (
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
          <img
            src={event.featured_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${eventType.color}`}>
              {eventType.icon} {eventType.label}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link
              href={`/events/${event.id}`}
              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {event.title}
            </Link>
            
            {!event.featured_image_url && (
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${eventType.color}`}>
                  {eventType.icon} {eventType.label}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 説明 */}
        {event.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* 詳細情報 */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
          </div>

          {event.board_categories && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.board_categories.icon} {event.board_categories.name}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {event.participant_count}人参加
              {event.max_participants && ` / ${event.max_participants}人`}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {event.post_count}投稿
            </span>
          </div>

          {event.status === 'active' && (
            <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
              <Clock className="w-4 h-4" />
              {getTimeRemaining()}
            </div>
          )}
        </div>

        {/* 賞品 */}
        {event.prize_description && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">賞品:</span>
              <span className="text-yellow-700">{event.prize_description}</span>
            </div>
          </div>
        )}

        {/* タグ */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2">
          <Link
            href={`/events/${event.id}`}
            className="flex-1 py-2 px-4 border border-gray-300 rounded text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            詳細を見る
          </Link>

          {userId && event.status === 'active' && !event.max_participants || 
           (event.max_participants && event.participant_count < event.max_participants) ? (
            <button
              onClick={handleJoin}
              disabled={isJoining || hasJoined}
              className={`
                flex-1 py-2 px-4 rounded text-sm font-medium transition-colors
                ${hasJoined
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
                ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isJoining ? '参加中...' : hasJoined ? '参加済み' : '参加する'}
            </button>
          ) : (
            <div className="flex-1 py-2 px-4 bg-gray-100 text-gray-500 rounded text-center text-sm">
              {event.status === 'ended' ? '終了済み' : 
               event.max_participants && event.participant_count >= event.max_participants ? '定員に達しました' :
               '参加不可'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}