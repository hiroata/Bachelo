'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Thread, Board, Post, format5chDate, renderAnchors } from '@/types/5ch';
import { ArrowUp, MessageSquare } from 'lucide-react';

export default function ThreadDetailPage() {
  const params = useParams();
  const boardSlug = params.board as string;
  const threadNumber = params.thread as string;
  
  const [board, setBoard] = useState<Board | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyForm, setReplyForm] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchThread();
  }, [boardSlug, threadNumber]);

  const fetchThread = async () => {
    try {
      const response = await fetch(`/api/test/read/${boardSlug}/${threadNumber}`);
      if (!response.ok) throw new Error('Failed to fetch thread');
      
      const data = await response.json();
      setBoard(data.board);
      setThread(data.thread);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyForm.content.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/test/read/${boardSlug}/${threadNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to post reply');
      }
      
      // 再読み込み
      await fetchThread();
      
      // フォームをリセット
      setReplyForm({ ...replyForm, content: '' });
      setShowReplyForm(false);
      
      // 最下部にスクロール
      window.scrollTo(0, document.body.scrollHeight);
    } catch (error) {
      console.error('Error posting reply:', error);
      alert(error instanceof Error ? error.message : '投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const postNumber = e.currentTarget.dataset.post;
    if (postNumber) {
      const element = document.getElementById(`post-${postNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const renderPostContent = (content: string, threadId: string) => {
    // アンカーをリンクに変換
    let html = renderAnchors(content, threadId);
    
    // 改行を<br>に変換
    html = html.replace(/\n/g, '<br>');
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
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

  if (!thread || !board) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-8">
          <p>スレッドが見つかりません</p>
          <Link href="/5ch" className="text-blue-600 hover:underline mt-4 inline-block">
            板一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const isLocked = thread.is_locked || thread.post_count >= 1000;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gray-800 text-white py-2 px-4 text-sm">
        <Link href="/5ch" className="hover:underline">5ch</Link>
        {' > '}
        <Link href={`/${boardSlug}`} className="hover:underline">{board.name}</Link>
        {' > '}
        <span>{thread.title}</span>
      </div>

      {/* スレッドタイトル */}
      <div className="bg-white border-b p-4">
        <h1 className="text-xl font-bold">{thread.title}</h1>
        <div className="text-sm text-gray-600 mt-2">
          レス数: {thread.post_count} / 1000
          {isLocked && (
            <span className="ml-4 text-red-600 font-bold">
              {thread.post_count >= 1000 ? '★スレッドストッパー★' : '【スレスト】'}
            </span>
          )}
        </div>
      </div>

      {/* レス一覧 */}
      <div className="bg-white" ref={contentRef}>
        {posts.map((post) => (
          <div
            key={post.id}
            id={`post-${post.post_number}`}
            className="border-b hover:bg-gray-50"
          >
            <div className="p-4">
              {/* レスヘッダー */}
              <div className="text-sm mb-2">
                <span className="font-bold text-green-600">{post.post_number}</span>
                {' '}
                <span className="font-bold">
                  名前：
                  <span className={post.author_email === 'sage' ? 'text-green-600' : ''}>
                    {post.author_name}
                  </span>
                </span>
                {post.author_email && post.author_email !== 'sage' && (
                  <span className="text-blue-600"> [{post.author_email}]</span>
                )}
                {' '}
                <span className="text-gray-600">
                  {format5chDate(post.created_at)}
                </span>
                {' '}
                <span className="text-gray-600">
                  ID:{post.author_id || '???'}
                </span>
              </div>

              {/* レス本文 */}
              <div 
                className="whitespace-pre-wrap break-all font-mono text-sm"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.classList.contains('anchor')) {
                    handleAnchorClick(e as any);
                  }
                }}
              >
                {post.is_deleted ? (
                  <span className="text-gray-400">あぼーん</span>
                ) : (
                  renderPostContent(post.content, thread.id)
                )}
              </div>

              {/* 画像 */}
              {post.images && post.images.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {post.images.map((image) => (
                    <a
                      key={image.id}
                      href={image.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={image.thumbnail_url || image.image_url}
                        alt=""
                        className="max-h-40 rounded border hover:opacity-80 transition"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* スレッド終了メッセージ */}
        {isLocked && (
          <div className="p-8 text-center">
            <p className="text-xl font-bold text-red-600">
              {thread.post_count >= 1000 
                ? 'このスレッドは1000を超えました。'
                : 'このスレッドは終了しました。'}
            </p>
            <p className="text-gray-600 mt-2">もう書き込みできません。</p>
          </div>
        )}
      </div>

      {/* レスフォーム */}
      {!isLocked && (
        <div className="bg-white border-t p-4">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            書き込む
          </button>

          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名前（省略可）
                  </label>
                  <input
                    type="text"
                    value={replyForm.author_name}
                    onChange={(e) => setReplyForm({ ...replyForm, author_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={board.default_name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail（省略可）
                  </label>
                  <input
                    type="text"
                    value={replyForm.author_email}
                    onChange={(e) => setReplyForm({ ...replyForm, author_email: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sage"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  本文
                </label>
                <textarea
                  value={replyForm.content}
                  onChange={(e) => setReplyForm({ ...replyForm, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  rows={6}
                  required
                  placeholder="本文を入力..."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                >
                  {submitting ? '投稿中...' : '投稿する'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* フッター */}
      <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        <Link href={`/${boardSlug}`} className="text-blue-600 hover:underline">
          {board.name}に戻る
        </Link>
        <span className="mx-2">|</span>
        <Link href="/5ch" className="text-blue-600 hover:underline">
          板一覧
        </Link>
      </div>

      {/* トップに戻るボタン */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}