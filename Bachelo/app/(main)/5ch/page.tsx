'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Board } from '@/types/5ch';
import { Newspaper, MessageSquare, Gamepad2, Heart, Briefcase, GraduationCap } from 'lucide-react';

// カテゴリーアイコンマップ
const categoryIcons: Record<string, React.ReactNode> = {
  'ニュース': <Newspaper className="w-5 h-5" />,
  '雑談': <MessageSquare className="w-5 h-5" />,
  '趣味': <Gamepad2 className="w-5 h-5" />,
  '生活': <Heart className="w-5 h-5" />,
  '専門': <Briefcase className="w-5 h-5" />,
  'その他': <GraduationCap className="w-5 h-5" />
};

interface BoardWithStats extends Board {
  thread_count: number;
  latest_thread?: {
    title: string;
    last_post_at: string;
  };
}

export default function BoardListPage() {
  const [boards, setBoards] = useState<BoardWithStats[]>([]);
  const [categorized, setCategorized] = useState<Record<string, BoardWithStats[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards');
      
      // 500エラーの場合は自動セットアップを試みる
      if (response.status === 500) {
        console.log('板が見つかりません。セットアップを開始します...');
        const setupResponse = await fetch('/api/setup/5ch');
        if (setupResponse.ok) {
          const setupResult = await setupResponse.json();
          console.log('セットアップ完了:', setupResult);
          // セットアップ後に再度取得
          const retryResponse = await fetch('/api/boards');
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            processBoards(data);
            return;
          }
        }
      }
      
      if (!response.ok) throw new Error('Failed to fetch boards');
      
      const data = await response.json();
      processBoards(data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const processBoards = (data: any) => {
    setBoards(data.boards || []);
    
    // カテゴリーごとにグループ化
    const grouped = (data.boards || []).reduce((acc: Record<string, BoardWithStats[]>, board: BoardWithStats) => {
      const category = board.category || 'その他';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(board);
      return acc;
    }, {});
    
    setCategorized(grouped);
  };

  const formatLastPost = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">板一覧を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">5ch 掲示板</h1>
          <p className="text-sm mt-1">板を選択してください</p>
        </div>

        {/* 板一覧 */}
        <div className="bg-white rounded-b-lg shadow-lg">
          {Object.entries(categorized).map(([category, categoryBoards]) => (
            <div key={category} className="border-b last:border-b-0">
              {/* カテゴリーヘッダー */}
              <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
                {categoryIcons[category] || categoryIcons['その他']}
                <h2 className="font-bold text-gray-700">{category}</h2>
              </div>

              {/* 板リスト */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {categoryBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/${board.slug}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-blue-600 hover:underline">
                        {board.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {board.thread_count}スレ
                      </span>
                    </div>
                    
                    {board.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {board.description}
                      </p>
                    )}
                    
                    {board.latest_thread && (
                      <div className="text-xs text-gray-500">
                        <p className="truncate">
                          最新: {board.latest_thread.title}
                        </p>
                        <p>{formatLastPost(board.latest_thread.last_post_at)}</p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>5ch型掲示板システム - Bachelo</p>
          <div className="mt-2 space-x-4">
            <Link href="/board" className="text-blue-600 hover:underline">
              旧掲示板
            </Link>
            <Link href="/voice-board" className="text-blue-600 hover:underline">
              音声掲示板
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}