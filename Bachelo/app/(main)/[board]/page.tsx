'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Thread, Board } from '@/types/5ch';
import { Plus, TrendingUp, Clock, Calendar } from 'lucide-react';

interface ThreadWithStats extends Thread {
  first_post?: {
    author_name: string;
    content: string;
  };
  speed: number;
}

export default function ThreadListPage() {
  const params = useParams();
  const boardSlug = params.board as string;
  
  const [board, setBoard] = useState<Board | null>(null);
  const [threads, setThreads] = useState<ThreadWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'speed' | 'latest' | 'created'>('speed');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchThreads();
  }, [boardSlug, sort, page]);

  const fetchThreads = async () => {
    try {
      const response = await fetch(`/api/boards/${boardSlug}/threads?sort=${sort}&page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch threads');
      
      const data = await response.json();
      setBoard(data.board);
      setThreads(data.threads);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreadStatus = (thread: ThreadWithStats) => {
    if (thread.post_count >= 1000) return { text: '1000', class: 'text-red-600 font-bold' };
    if (thread.post_count >= 900) return { text: `${thread.post_count}`, class: 'text-orange-600 font-bold' };
    if (thread.post_count >= 500) return { text: `${thread.post_count}`, class: 'text-yellow-600' };
    return { text: `${thread.post_count}`, class: 'text-gray-600' };
  };

  const getSpeedClass = (speed: number) => {
    if (speed > 100) return 'text-red-500 font-bold';
    if (speed > 50) return 'text-orange-500';
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">スレッド一覧を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">板が見つかりません</p>
            <Link href="/5ch" className="text-blue-600 hover:underline mt-4 inline-block">
              板一覧に戻る
            </Link>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{board.name}</h1>
              {board.description && (
                <p className="text-sm mt-1">{board.description}</p>
              )}
            </div>
            <Link
              href={`/${boardSlug}/create`}
              className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              スレッドを立てる
            </Link>
          </div>
        </div>

        {/* ソートタブ */}
        <div className="bg-white border-b">
          <div className="flex">
            <button
              onClick={() => setSort('speed')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                sort === 'speed' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              勢い順
            </button>
            <button
              onClick={() => setSort('latest')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                sort === 'latest' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              最新順
            </button>
            <button
              onClick={() => setSort('created')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                sort === 'created' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              新着順
            </button>
          </div>
        </div>

        {/* スレッド一覧 */}
        <div className="bg-white">
          <table className="w-full">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="px-4 py-2 text-left">順位</th>
                <th className="px-4 py-2 text-left">スレッドタイトル</th>
                <th className="px-4 py-2 text-center">レス</th>
                <th className="px-4 py-2 text-center">勢い</th>
                <th className="px-4 py-2 text-right">最終書込</th>
              </tr>
            </thead>
            <tbody>
              {threads.map((thread, index) => {
                const status = getThreadStatus(thread);
                const offset = (page - 1) * 50;
                
                return (
                  <tr key={thread.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-center text-gray-500">
                      {offset + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        href={`/test/read/${boardSlug}/${thread.thread_number}`}
                        className="text-blue-600 hover:underline"
                      >
                        {thread.title}
                      </Link>
                      {thread.first_post && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {thread.first_post.content.substring(0, 100)}
                        </p>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-center ${status.class}`}>
                      {status.text}
                    </td>
                    <td className={`px-4 py-3 text-center ${getSpeedClass(thread.speed)}`}>
                      {thread.speed}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                      {new Date(thread.last_post_at).toLocaleString('ja-JP', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="bg-white rounded-b-lg px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            
            <span className="text-sm text-gray-700">
              {page} / {totalPages} ページ
            </span>
            
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        )}

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <Link href="/5ch" className="text-blue-600 hover:underline">
            板一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}