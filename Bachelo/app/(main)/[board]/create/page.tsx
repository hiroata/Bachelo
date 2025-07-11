'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Board } from '@/types/5ch';
import { ArrowLeft } from 'lucide-react';

export default function CreateThreadPage() {
  const params = useParams();
  const router = useRouter();
  const boardSlug = params.board as string;
  
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author_name: '',
    author_email: '',
    content: ''
  });

  useEffect(() => {
    fetchBoard();
  }, [boardSlug]);

  const fetchBoard = async () => {
    try {
      const response = await fetch(`/api/boards`);
      if (!response.ok) throw new Error('Failed to fetch boards');
      
      const data = await response.json();
      const foundBoard = data.boards.find((b: Board) => b.slug === boardSlug);
      
      if (foundBoard) {
        setBoard(foundBoard);
      }
    } catch (error) {
      console.error('Error fetching board:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      alert('タイトルと本文は必須です');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/boards/${boardSlug}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create thread');
      }
      
      const data = await response.json();
      
      // 作成したスレッドに移動
      router.push(data.url);
    } catch (error) {
      console.error('Error creating thread:', error);
      alert(error instanceof Error ? error.message : 'スレッドの作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-8">
          <p>板が見つかりません</p>
          <Link href="/5ch" className="text-blue-600 hover:underline mt-4 inline-block">
            板一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gray-800 text-white py-2 px-4 text-sm">
        <Link href="/5ch" className="hover:underline">5ch</Link>
        {' > '}
        <Link href={`/${boardSlug}`} className="hover:underline">{board.name}</Link>
        {' > '}
        <span>スレッドを立てる</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* フォームヘッダー */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h1 className="text-xl font-bold">新規スレッド作成 - {board.name}</h1>
          </div>

          {/* フォーム本体 */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* スレッドタイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スレッドタイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="スレッドのタイトルを入力"
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.title.length}/200文字
              </p>
            </div>

            {/* 名前・メール */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名前（省略可）
                </label>
                <input
                  type="text"
                  value={form.author_name}
                  onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={board.default_name}
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail（省略可）
                </label>
                <input
                  type="text"
                  value={form.author_email}
                  onChange={(e) => setForm({ ...form, author_email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sage"
                  maxLength={255}
                />
              </div>
            </div>

            {/* 本文 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                本文 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                rows={10}
                placeholder="スレッドの>>1となる内容を入力"
                required
              />
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <p className="font-bold text-yellow-800 mb-2">投稿時の注意</p>
              <ul className="list-disc list-inside text-yellow-700 space-y-1">
                <li>誹謗中傷や個人情報の投稿は禁止です</li>
                <li>スレッドは1000レスで終了します</li>
                <li>重複スレッドは削除される場合があります</li>
                <li>sage進行の場合はメール欄に「sage」と入力してください</li>
              </ul>
            </div>

            {/* ボタン */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-bold"
              >
                {submitting ? 'スレッドを立てています...' : 'スレッドを立てる'}
              </button>
              <Link
                href={`/${boardSlug}`}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                キャンセル
              </Link>
            </div>
          </form>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <Link href={`/${boardSlug}`} className="text-blue-600 hover:underline">
            {board.name}に戻る
          </Link>
          <span className="mx-2">|</span>
          <Link href="/5ch" className="text-blue-600 hover:underline">
            板一覧
          </Link>
        </div>
      </div>
    </div>
  );
}