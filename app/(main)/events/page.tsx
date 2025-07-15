'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Search, Filter, Plus } from 'lucide-react';
import EventCard from '@/components/board/EventCard';
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

export default function EventsPage() {
  const [events, setEvents] = useState<BoardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      let storedUserId = localStorage.getItem('user_id');
      if (!storedUserId) {
        storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('user_id', storedUserId);
      }
      return storedUserId;
    }
    return 'user_temp';
  });

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, typeFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/events?${params}`);
      
      if (!response.ok) {
        // APIエラー時はモックデータを表示
        console.warn('Events API not available, using mock data');
        setEvents(getMockEvents());
        return;
      }

      const data = await response.json();
      setEvents(data.events || []);

    } catch (error) {
      console.error('Error fetching events:', error);
      // エラー時もモックデータを表示
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  // モックデータ生成
  const getMockEvents = (): BoardEvent[] => [
    {
      id: 'event-1',
      title: '🏆 2025年新春投稿コンテスト',
      description: '新年最初の大きなコンテスト！最も魅力的な体験談を投稿してください。豪華賞品が待っています！',
      event_type: 'contest',
      status: 'active',
      start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      voting_end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      participant_count: 156,
      post_count: 89,
      view_count: 2450,
      prize_description: 'Amazon商品券10万円分、特別バッジ',
      tags: ['投稿コンテスト', '体験談', '新春'],
      organizer_id: 'admin',
      board_categories: {
        name: '体験談',
        icon: '💕'
      }
    },
    {
      id: 'event-2',
      title: '💬 マンスリーAMA - 人妻の本音',
      description: '人妻の皆さんが何でも質問に答える月1回のスペシャルイベント。普段聞けない本音を聞いてみませんか？',
      event_type: 'ama',
      status: 'planned',
      start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      participant_count: 23,
      post_count: 0,
      view_count: 892,
      max_participants: 100,
      tags: ['AMA', '人妻', '質問'],
      organizer_id: 'moderator1',
      board_categories: {
        name: '人妻',
        icon: '💍'
      }
    },
    {
      id: 'event-3',
      title: '⚡ 7日間チャレンジ - 毎日投稿',
      description: '7日間連続で投稿にチャレンジ！完走者には特別な称号を贈呈します。',
      event_type: 'challenge',
      status: 'active',
      start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      participant_count: 78,
      post_count: 234,
      view_count: 1567,
      tags: ['チャレンジ', '連続投稿'],
      organizer_id: 'admin'
    },
    {
      id: 'event-4',
      title: '🗳️ ベスト投稿者投票 - 2024年度',
      description: '2024年で最も印象的だった投稿者を皆で投票して決めましょう！',
      event_type: 'voting',
      status: 'voting',
      start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      participant_count: 445,
      post_count: 0,
      view_count: 3201,
      tags: ['投票', '年間ベスト'],
      organizer_id: 'admin'
    },
    {
      id: 'event-5',
      title: '🎉 掲示板10万投稿達成記念',
      description: 'ついに10万投稿を達成！記念イベントとして特別企画を開催中です。',
      event_type: 'celebration',
      status: 'ended',
      start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      participant_count: 678,
      post_count: 156,
      view_count: 5432,
      tags: ['記念', '達成'],
      organizer_id: 'admin'
    }
  ];

  const handleJoinEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, participant_count: event.participant_count + 1 }
        : event
    ));
  };

  const filteredEvents = events.filter(event => {
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">イベント一覧</h1>
        <p className="text-gray-600">コンテスト、チャレンジ、AMAなど様々なイベントに参加しよう！</p>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="イベントを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* ステータスフィルター */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">すべてのステータス</option>
            <option value="planned">予定</option>
            <option value="active">開催中</option>
            <option value="voting">投票中</option>
            <option value="ended">終了</option>
          </select>

          {/* タイプフィルター */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">すべてのタイプ</option>
            <option value="contest">コンテスト</option>
            <option value="challenge">チャレンジ</option>
            <option value="ama">AMA</option>
            <option value="collaboration">コラボ</option>
            <option value="voting">投票</option>
            <option value="celebration">お祝い</option>
          </select>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">開催中</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {events.filter(e => e.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">総参加者</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {events.reduce((sum, e) => sum + e.participant_count, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600">総投稿数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {events.reduce((sum, e) => sum + e.post_count, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">表示中</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filteredEvents.length}
          </p>
        </div>
      </div>

      {/* イベント一覧 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">イベントを読み込み中...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">イベントが見つかりません</p>
          <p className="text-gray-400">条件を変更して再度検索してください</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              userId={userId}
              onJoin={handleJoinEvent}
            />
          ))}
        </div>
      )}

      {/* ページ下部の説明 */}
      <div className="mt-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">イベントについて</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Bacheloでは定期的に様々なイベントを開催しています。コンテストに参加して賞品を獲得したり、
          チャレンジで新しい体験をしたり、AMAで質問をしたり、コミュニティの皆さんと交流を深めましょう。
          イベントへの参加は無料で、どなたでもお気軽にご参加いただけます。
        </p>
      </div>
    </div>
  );
}