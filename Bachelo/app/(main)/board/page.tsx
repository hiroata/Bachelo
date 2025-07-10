'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Crown, MessageCircle, Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { BoardPost, BoardCategory } from '@/types/board';
import PostModal from '@/components/board/PostModal';

function BoardContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [categories, setCategories] = useState<BoardCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'popular' | 'new'>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 20;

  // カテゴリー取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/board/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // 投稿取得
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: postsPerPage.toString(),
      });
      
      if (categoryId) params.append('category_id', categoryId);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/board/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(data.posts || []);
      setTotalPages(data.total_pages || 1);
      setTotalPosts(data.total || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, categoryId, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // カテゴリー変更時はページをリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, searchQuery]);

  // 投票処理
  const handleVote = async (postId: string, voteType: 'plus' | 'minus') => {
    try {
      const response = await fetch(`/api/board/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });
      
      if (!response.ok) throw new Error('Failed to vote');
      
      const result = await response.json();
      
      // 投稿の投票数を更新
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, plus_count: result.plusCount, minus_count: result.minusCount }
          : post
      ));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (selectedTab === 'popular') {
      return (b.plus_count - b.minus_count) - (a.plus_count - a.minus_count);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">匿名掲示板</h1>
            <button
              onClick={() => setShowPostModal(true)}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              投稿する
            </button>
          </div>

          {/* 検索バー */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="投稿を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* カテゴリータブ */}
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/board"
              className={`px-4 py-2 rounded-lg transition ${
                !categoryId 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて
            </Link>
            {categories.map(category => (
              <Link
                key={category.id}
                href={`/board?category=${category.id}`}
                className={`px-4 py-2 rounded-lg transition ${
                  categoryId === category.id 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ソートタブ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTab('popular')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedTab === 'popular'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              人気順
            </button>
            <button
              onClick={() => setSelectedTab('new')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedTab === 'new'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              新着順
            </button>
          </div>
        </div>

        {/* 投稿一覧 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500">まだ投稿がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPosts.map((post, index) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.is_pinned && (
                          <Crown className="w-5 h-5 text-yellow-500" />
                        )}
                        <Link 
                          href={`/board/post/${post.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-pink-500"
                        >
                          {post.title}
                        </Link>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.author_name}</span>
                        <span>{formatDate(post.created_at)}</span>
                        {post.category && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {post.category.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.reply_count || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 投票ボタン */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleVote(post.id, 'plus')}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 transition"
                      >
                        <span>+</span>
                        <span>{post.plus_count || 0}</span>
                      </button>
                      <button
                        onClick={() => handleVote(post.id, 'minus')}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        <span>-</span>
                        <span>{post.minus_count || 0}</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 画像プレビュー */}
                  {post.images && post.images.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {post.images.slice(0, 3).map((image, idx) => (
                        <div key={idx} className="relative w-20 h-20">
                          <img
                            src={image.thumbnail_url || image.image_url}
                            alt=""
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ))}
                      {post.images.length > 3 && (
                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-600">
                          +{post.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-pink-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* 投稿モーダル */}
      {showPostModal && (
        <PostModal
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
            fetchPosts();
          }}
          categories={categories}
        />
      )}
    </>
  );
}

export default function BoardPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
      </div>
    }>
      <BoardContent />
    </Suspense>
  );
}