'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Thread, Board, Post } from '@/types/5ch';
import { Heart, MessageCircle, Share2, Flag, ChevronLeft, ChevronRight } from 'lucide-react';

interface PostWithVotes extends Post {
  plus_votes?: number;
  minus_votes?: number;
}

export default function GirlsThreadPage() {
  const params = useParams();
  const router = useRouter();
  const boardSlug = params.board as string;
  const threadNumber = params.thread as string;
  
  const [board, setBoard] = useState<Board | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<PostWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyForm, setReplyForm] = useState({
    author_name: '匿名',
    content: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 100;

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
      
      // デモ用の投票数を追加
      const postsWithVotes = data.posts.map((post: Post) => ({
        ...post,
        plus_votes: Math.floor(Math.random() * 1000) + 10,
        minus_votes: Math.floor(Math.random() * 100) + 5
      }));
      setPosts(postsWithVotes);
    } catch (error) {
      console.error('Error fetching thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyForm.content.trim()) return;
    
    try {
      const response = await fetch(`/api/test/read/${boardSlug}/${threadNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: '匿名',
          author_email: '',
          content: replyForm.content
        })
      });
      
      if (!response.ok) throw new Error('Failed to post reply');
      
      await fetchThread();
      setReplyForm({ author_name: '匿名', content: '' });
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const calculateVotePercentage = (plus: number, minus: number) => {
    const total = plus + minus;
    return total > 0 ? (plus / total) * 100 : 50;
  };

  const getHeartCount = (post: PostWithVotes) => {
    const score = (post.plus_votes || 0) - (post.minus_votes || 0);
    if (score >= 100) return 7;
    if (score >= 50) return 4;
    if (score >= 10) return Math.floor(Math.random() * 3) + 1;
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const currentPosts = posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef5f7' }}>
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-pink-400 to-pink-500 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/girls" className="text-2xl font-bold">
              ガールズちゃんねる
            </Link>
            <Link
              href="/girls"
              className="text-sm hover:text-pink-100 transition"
            >
              実況 &gt; {board?.name}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* スレッドタイトル */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{thread?.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {thread?.post_count}コメント
            </span>
            <span>{new Date(thread?.created_at || '').toLocaleDateString('ja-JP')}</span>
            <button className="ml-auto flex items-center gap-1 text-gray-500 hover:text-gray-700">
              <Share2 className="w-4 h-4" />
              共有
            </button>
          </div>
        </div>

        {/* コメント一覧 */}
        <div className="space-y-4">
          {currentPosts.map((post, index) => {
            const heartCount = getHeartCount(post);
            const globalIndex = (currentPage - 1) * postsPerPage + index;
            
            return (
              <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3">
                  {/* 番号 */}
                  <div className="text-gray-500 font-medium">
                    {post.post_number}.
                  </div>

                  {/* コンテンツ */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">匿名</span>
                      <span className="text-xs text-gray-400">
                        {new Date(post.created_at).toLocaleString('ja-JP')}
                      </span>
                      {globalIndex === 0 && (
                        <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded">
                          [通報]
                        </span>
                      )}
                      <button className="ml-auto text-xs text-gray-400 hover:text-gray-600">
                        返信
                      </button>
                    </div>

                    {/* 本文 */}
                    <div className="text-gray-800 whitespace-pre-wrap mb-3">
                      {post.content}
                    </div>

                    {/* ハート表示 */}
                    {heartCount > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                        <span className="text-sm text-pink-500">
                          {heartCount}件の返信
                        </span>
                      </div>
                    )}

                    {/* 投票 */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button className="bg-pink-500 text-white px-3 py-1 rounded text-sm font-bold hover:bg-pink-600 transition">
                          +
                        </button>
                        <span className="text-pink-500 font-bold">
                          +{post.plus_votes || 0}
                        </span>
                      </div>

                      <div className="flex-1 max-w-xs">
                        <div className="relative h-5 bg-gray-200 rounded overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-400 to-pink-500"
                            style={{ 
                              width: `${calculateVotePercentage(
                                post.plus_votes || 0, 
                                post.minus_votes || 0
                              )}%` 
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">
                          -{post.minus_votes || 0}
                        </span>
                        <button className="bg-gray-400 text-white px-3 py-1 rounded text-sm font-bold hover:bg-gray-500 transition">
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-pink-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <span className="text-gray-600">...</span>
            <span className="text-gray-600">{totalPages}</span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* コメント投稿フォーム */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h3 className="font-bold text-lg mb-4">コメントを投稿する</h3>
          <form onSubmit={handleSubmitReply}>
            <textarea
              value={replyForm.content}
              onChange={(e) => setReplyForm({ ...replyForm, content: e.target.value })}
              className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-400"
              rows={4}
              placeholder="コメントを入力..."
              required
            />
            <button
              type="submit"
              className="mt-3 bg-pink-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-600 transition"
            >
              コメントを投稿
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}