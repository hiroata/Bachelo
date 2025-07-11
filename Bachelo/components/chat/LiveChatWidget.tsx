'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageSquare, Send, Users, X, Minimize2, Maximize2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';

interface ChatMessage {
  id: string;
  author_name: string;
  author_id: string;
  message: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  post_id?: string;
}

interface ActiveUser {
  user_id: string;
  user_name: string;
  last_seen: string;
}

interface LiveChatWidgetProps {
  postId?: string;
  roomId?: string;
}

export default function LiveChatWidget({ postId, roomId }: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  // ユーザーIDとユーザー名の初期化
  useEffect(() => {
    const storedUserId = localStorage.getItem('chat_user_id');
    const storedUserName = localStorage.getItem('chat_user_name');
    
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chat_user_id', newUserId);
      setUserId(newUserId);
    }
    
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  // チャットルーム作成/取得
  useEffect(() => {
    if (isOpen && !currentRoom) {
      initializeChatRoom();
    }
  }, [isOpen, postId, roomId]);

  const initializeChatRoom = async () => {
    setLoading(true);
    try {
      let room: ChatRoom | null = null;
      
      if (roomId) {
        // 指定されたルームを取得
        const { data } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        room = data;
      } else if (postId) {
        // 投稿に紐づくルームを取得または作成
        const { data: existingRoom } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('post_id', postId)
          .single();
        
        if (existingRoom) {
          room = existingRoom;
        } else {
          // 新規作成
          const { data: newRoom } = await supabase
            .from('chat_rooms')
            .insert({
              post_id: postId,
              name: 'スレッドチャット',
              description: 'このスレッドについてリアルタイムで話そう！'
            })
            .select()
            .single();
          room = newRoom;
        }
      }
      
      if (room) {
        setCurrentRoom(room);
        await loadMessages(room.id);
        subscribeToRoom(room.id);
      }
    } catch (error) {
      console.error('Error initializing chat room:', error);
      toast.error('チャットルームの初期化に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // メッセージ取得
  const loadMessages = async (roomId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (error) {
      console.error('Error loading messages:', error);
      return;
    }
    
    setMessages(data || []);
  };

  // リアルタイムサブスクリプション
  const subscribeToRoom = (roomId: string) => {
    // メッセージの監視
    const messageChannel = supabase
      .channel(`chat_messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    // アクティブユーザーの監視
    const userChannel = supabase
      .channel(`chat_users:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_active_users',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          loadActiveUsers(roomId);
        }
      )
      .subscribe();

    // ユーザーをアクティブとして登録
    if (userName && userId) {
      joinRoom(roomId);
    }

    // クリーンアップ
    return () => {
      messageChannel.unsubscribe();
      userChannel.unsubscribe();
      if (userName && userId) {
        leaveRoom(roomId);
      }
    };
  };

  // アクティブユーザー取得
  const loadActiveUsers = async (roomId: string) => {
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    
    const { data } = await supabase
      .from('chat_active_users')
      .select('*')
      .eq('room_id', roomId)
      .gte('last_seen', fiveMinutesAgo.toISOString())
      .order('user_name');
    
    setActiveUsers(data || []);
  };

  // ルーム参加
  const joinRoom = async (roomId: string) => {
    await supabase
      .from('chat_active_users')
      .upsert({
        room_id: roomId,
        user_id: userId,
        user_name: userName,
        last_seen: new Date().toISOString()
      });
  };

  // ルーム退出
  const leaveRoom = async (roomId: string) => {
    await supabase
      .from('chat_active_users')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);
  };

  // メッセージ送信
  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentRoom || !userName) return;
    
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: currentRoom.id,
        author_name: userName,
        author_id: userId,
        message: inputMessage.trim()
      });
    
    if (error) {
      console.error('Error sending message:', error);
      toast.error('メッセージの送信に失敗しました');
      return;
    }
    
    setInputMessage('');
    
    // アクティブ状態を更新
    await joinRoom(currentRoom.id);
  };

  // スクロール制御
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 名前設定モーダル
  if (isOpen && !userName) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-80 z-50">
        <h3 className="text-lg font-semibold mb-4">チャットに参加</h3>
        <p className="text-sm text-gray-600 mb-4">
          表示名を入力してください（匿名OK）
        </p>
        <input
          type="text"
          placeholder="例: エロ太郎"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              const name = e.currentTarget.value.trim();
              setUserName(name);
              localStorage.setItem('chat_user_name', name);
            }
          }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              const input = document.querySelector('input') as HTMLInputElement;
              if (input?.value.trim()) {
                const name = input.value.trim();
                setUserName(name);
                localStorage.setItem('chat_user_name', name);
              }
            }}
            className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            参加
          </button>
        </div>
      </div>
    );
  }

  // チャットウィジェット
  return (
    <>
      {/* 開くボタン */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-pink-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-pink-600 transition flex items-center gap-2 z-40"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">ライブチャット</span>
          {activeUsers.length > 0 && (
            <span className="bg-white text-pink-500 px-2 py-0.5 rounded-full text-sm font-bold">
              {activeUsers.length}
            </span>
          )}
        </button>
      )}

      {/* チャットウィンドウ */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all ${
            isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
          }`}
        >
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">
                {currentRoom?.name || 'ライブチャット'}
              </span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                <Users className="w-3 h-3 inline mr-1" />
                {activeUsers.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (currentRoom) {
                    leaveRoom(currentRoom.id);
                  }
                }}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* メッセージエリア */}
              <div className="h-[350px] overflow-y-auto p-4 space-y-2">
                {loading ? (
                  <div className="text-center text-gray-500">読み込み中...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    まだメッセージがありません。最初の一言をどうぞ！
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${
                        msg.author_id === userId ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block max-w-[70%] ${
                          msg.author_id === userId
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        } px-3 py-2 rounded-lg`}
                      >
                        <div className="text-xs opacity-75 mb-1">
                          {msg.author_name}
                        </div>
                        <div className="text-sm">{msg.message}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 入力エリア */}
              <div className="border-t border-gray-200 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage();
                      }
                    }}
                    placeholder="メッセージを入力..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}