'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Users, Lock, Unlock, Moon, Sun } from 'lucide-react';
import LiveChatWidget from './LiveChatWidget';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  activeUserCount?: number;
  icon?: string;
  timeRestricted?: {
    startHour: number;
    endHour: number;
  };
}

export default function GlobalChatRooms() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadChatRooms();
    // 1分ごとにアクティブユーザー数を更新
    const interval = setInterval(loadChatRooms, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadChatRooms = async () => {
    try {
      // グローバルチャットルームを取得
      const { data: roomsData } = await supabase
        .from('chat_rooms')
        .select('*')
        .is('post_id', null)
        .eq('is_active', true);

      if (roomsData) {
        // 各ルームのアクティブユーザー数を取得
        const roomsWithUsers = await Promise.all(
          roomsData.map(async (room) => {
            const fiveMinutesAgo = new Date();
            fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
            
            const { count } = await supabase
              .from('chat_active_users')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id)
              .gte('last_seen', fiveMinutesAgo.toISOString());
            
            return {
              ...room,
              activeUserCount: count || 0
            };
          })
        );

        // デフォルトのグローバルルーム設定
        const defaultRooms: ChatRoom[] = [
          {
            id: 'midnight-chat',
            name: '深夜の雑談部屋',
            description: '深夜限定！みんなでエロトーク',
            is_active: true,
            icon: '🌙',
            timeRestricted: { startHour: 22, endHour: 5 },
            activeUserCount: 0
          },
          {
            id: 'beginner-chat',
            name: '初心者歓迎チャット',
            description: '初めての方も気軽に参加してください',
            is_active: true,
            icon: '🔰',
            activeUserCount: 0
          },
          {
            id: 'extreme-chat',
            name: '過激な告白部屋',
            description: '普段言えない過激な話をしよう',
            is_active: true,
            icon: '🔥',
            activeUserCount: 0
          },
          {
            id: 'housewife-chat',
            name: '主婦限定チャット',
            description: '昼間の主婦たちの秘密の話',
            is_active: true,
            icon: '👩',
            timeRestricted: { startHour: 10, endHour: 16 },
            activeUserCount: 0
          }
        ];

        // データベースのルームとデフォルトルームをマージ
        const mergedRooms = defaultRooms.map(defaultRoom => {
          const dbRoom = roomsWithUsers.find(r => r.name === defaultRoom.name);
          return dbRoom ? { ...defaultRoom, ...dbRoom } : defaultRoom;
        });

        setRooms(mergedRooms);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const isRoomAvailable = (room: ChatRoom) => {
    if (!room.timeRestricted) return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    const { startHour, endHour } = room.timeRestricted;
    
    if (startHour < endHour) {
      // 通常の時間帯（例：10時〜16時）
      return currentHour >= startHour && currentHour < endHour;
    } else {
      // 日をまたぐ時間帯（例：22時〜5時）
      return currentHour >= startHour || currentHour < endHour;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            ライブチャットルーム
          </h2>
          <p className="text-purple-100 text-sm mt-1">リアルタイムで盛り上がろう！</p>
        </div>

        <div className="p-4 space-y-3">
          {rooms.map((room) => {
            const available = isRoomAvailable(room);
            return (
              <button
                key={room.id}
                onClick={() => available && setSelectedRoom(room.id)}
                disabled={!available}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  available
                    ? 'border-gray-200 hover:border-pink-300 hover:bg-pink-50 cursor-pointer'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {room.icon && <span className="text-xl">{room.icon}</span>}
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      {room.timeRestricted && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {room.timeRestricted.startHour}時〜{room.timeRestricted.endHour}時
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{room.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {room.activeUserCount !== undefined && room.activeUserCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{room.activeUserCount}</span>
                      </div>
                    )}
                    {available ? (
                      <Unlock className="w-5 h-5 text-green-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {!available && room.timeRestricted && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    {room.timeRestricted.startHour >= 22 || room.timeRestricted.endHour <= 5 ? (
                      <Moon className="w-3 h-3" />
                    ) : (
                      <Sun className="w-3 h-3" />
                    )}
                    <span>
                      {room.timeRestricted.startHour}時になったら利用できます
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-4">
          <div className="bg-pink-50 rounded-lg p-3 text-sm text-pink-800">
            💡 チャットルームは匿名で参加できます。マナーを守って楽しく会話しましょう！
          </div>
        </div>
      </div>

      {/* 選択されたチャットルーム */}
      {selectedRoom && (
        <LiveChatWidget
          roomId={selectedRoom}
          key={selectedRoom} // ルーム変更時に再マウント
        />
      )}
    </>
  );
}