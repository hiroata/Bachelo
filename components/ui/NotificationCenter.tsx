'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, X, Check, Trash2, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'reply' | 'reaction' | 'mention' | 'follow' | 'award' | 'trending' | 'system' | 'event' | 'milestone';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_post?: {
    id: string;
    title: string;
  };
  related_user?: {
    display_name: string;
  };
  metadata?: any;
}

interface NotificationCenterProps {
  userId: string;
  className?: string;
}

const NOTIFICATION_ICONS = {
  reply: '💬',
  reaction: '❤️',
  mention: '📢',
  follow: '👥',
  award: '🏆',
  trending: '🔥',
  system: '⚙️',
  event: '🎯',
  milestone: '⭐'
};

const NOTIFICATION_COLORS = {
  reply: 'text-blue-600',
  reaction: 'text-red-500',
  mention: 'text-purple-600',
  follow: 'text-green-600',
  award: 'text-yellow-600',
  trending: 'text-orange-600',
  system: 'text-gray-600',
  event: 'text-indigo-600',
  milestone: 'text-pink-600'
};

export default function NotificationCenter({ userId, className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 通知取得
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, filter]);

  // 外部クリック検知
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async (offset = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId,
        limit: '20',
        offset: offset.toString(),
        ...(filter !== 'all' && { type: filter }),
        ...(filter === 'unread' && { unreadOnly: 'true' })
      });

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (offset === 0) {
        setNotifications(data.notifications || []);
      } else {
        setNotifications(prev => [...prev, ...(data.notifications || [])]);
      }
      
      setUnreadCount(data.unreadCount || 0);
      setHasMore(data.hasMore || false);

    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('通知の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 通知を既読にする
  const markAsRead = async (notificationId?: string) => {
    try {
      const params = notificationId ? `?userId=${userId}&notificationId=${notificationId}` : `?userId=${userId}`;
      const response = await fetch(`/api/notifications${params}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: !notificationId })
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      if (notificationId) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }

    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('既読処理に失敗しました');
    }
  };

  // 通知削除
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&notificationId=${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
      });

    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('通知の削除に失敗しました');
    }
  };

  // 時間フォーマット
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.type === filter;
  });

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 通知ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        title="通知"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知ドロップダウン */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* ヘッダー */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">通知</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-2">
              <button
                onClick={() => markAsRead()}
                disabled={unreadCount === 0}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors
                  ${unreadCount > 0 
                    ? 'text-blue-600 hover:bg-blue-50' 
                    : 'text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Check className="w-3 h-3" />
                すべて既読
              </button>
            </div>
          </div>

          {/* フィルター */}
          <div className="p-2 border-b border-gray-200">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { value: 'all', label: 'すべて' },
                { value: 'unread', label: '未読' },
                { value: 'reply', label: '返信' },
                { value: 'reaction', label: 'リアクション' },
                { value: 'event', label: 'イベント' }
              ].map(filterOption => (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value)}
                  className={`
                    px-2 py-1 rounded text-xs whitespace-nowrap transition-colors
                    ${filter === filterOption.value 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* 通知一覧 */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">読み込み中...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>通知はありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-3 transition-colors group relative
                      ${!notification.is_read ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* アイコン */}
                      <div className={`flex-shrink-0 text-lg ${NOTIFICATION_COLORS[notification.type]}`}>
                        {NOTIFICATION_ICONS[notification.type]}
                      </div>

                      {/* コンテンツ */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatTime(notification.created_at)}</span>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>

                      {/* アクション */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col gap-1">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="既読にする"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 関連投稿 */}
                    {notification.related_post && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        投稿: {notification.related_post.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* もっと読み込む */}
            {hasMore && filteredNotifications.length > 0 && (
              <div className="p-3 text-center border-t">
                <button
                  onClick={() => fetchNotifications(notifications.length)}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                >
                  {loading ? '読み込み中...' : 'もっと見る'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}