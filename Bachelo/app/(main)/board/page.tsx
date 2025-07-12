'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Crown, MessageCircle, Plus, ChevronLeft, ChevronRight, Search, Trash2, AlertTriangle, Heart } from 'lucide-react';
import { BoardPost, BoardCategory } from '@/types/board';
import PostModal from '@/components/board/PostModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ReportModal } from '@/components/ui/ReportModal';
import TipModal from '@/components/ui/TipModal';
import HotThreadsWidget from '@/components/board/HotThreadsWidget';
import GlobalChatRooms from '@/components/chat/GlobalChatRooms';
import UserProfileWidget from '@/components/user/UserProfileWidget';
import { toast } from 'react-hot-toast';

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

  // 削除関連の状態
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState(false);
  
  // 通報関連の状態
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  
  // 投げ銭関連の状態
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipRecipient, setTipRecipient] = useState<{id: string, name: string, postId?: string}>({id: '', name: ''});

  // カテゴリー取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/board/categories');
        if (!response.ok) {
          console.error('Failed to fetch categories:', response.status);
          // テーブルが存在しない可能性があるので、自動セットアップを試みる
          if (response.status === 500) {
            console.log('🔧 掲示板のセットアップを試みます...');
            const setupResponse = await fetch('/api/setup/board');
            if (setupResponse.ok) {
              console.log('✅ セットアップ完了！カテゴリーを再取得します...');
              // セットアップ後に再度カテゴリーを取得
              const retryResponse = await fetch('/api/board/categories');
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                if (Array.isArray(retryData)) {
                  setCategories(retryData);
                  return;
                }
              }
            }
          }
          return;
        }
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('Categories response is not an array:', data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
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

  // 投稿が削除可能かチェック（30分以内）
  const canDeletePost = (post: BoardPost) => {
    const createdAt = new Date(post.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return diffMinutes <= 30;
  };

  // 投稿削除処理
  const handleDeletePost = async () => {
    if (!deletePostId) return;
    
    setDeletingPost(true);
    try {
      const response = await fetch(`/api/board/posts/${deletePostId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '削除に失敗しました');
      }

      toast.success('投稿を削除しました');
      setDeletePostId(null);
      // 投稿一覧を再取得
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error instanceof Error ? error.message : '削除に失敗しました');
    } finally {
      setDeletingPost(false);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* ヘッダー */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">日本最大級のアダルト掲示板</h1>
              <p className="text-sm text-gray-600 mt-1">主婦・人妻の秘密の体験談が毎日更新中！</p>
            </div>
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
          <div className="space-y-3">
            {/* 全カテゴリーへのリンク */}
            <Link
              href="/board/categories"
              className="block w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition text-center font-bold"
            >
              🔥 全23カテゴリーを見る（近親相姦・露出・SM・etc）
            </Link>
            
            {/* 人気カテゴリー */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">人気カテゴリー</h3>
              <div className="flex gap-2 flex-wrap">
                <Link
                  href="/board"
                  className={`px-4 py-2 rounded-lg transition text-sm ${
                    !categoryId 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  すべて
                </Link>
                {categories.slice(0, 8).map(category => {
                  // 地域カテゴリーの場合は特別な処理
                  const isRegional = category.slug === 'region' || category.slug === 'regional';
                  const href = isRegional ? '/board/regional' : `/board?category=${category.id}`;
                  
                  return (
                    <Link
                      key={category.id}
                      href={href}
                      className={`px-4 py-2 rounded-lg transition text-sm flex items-center gap-1 ${
                        categoryId === category.id 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.icon && <span>{category.icon}</span>}
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* その他のカテゴリー */}
            {categories.length > 8 && (
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  その他のカテゴリー ({categories.length - 8}件) ▼
                </summary>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {categories.slice(8).map(category => {
                    // 地域カテゴリーの場合は特別な処理
                    const isRegional = category.slug === 'region' || category.slug === 'regional';
                    const href = isRegional ? '/board/regional' : `/board?category=${category.id}`;
                    
                    return (
                      <Link
                        key={category.id}
                        href={href}
                        className={`px-4 py-2 rounded-lg transition text-sm flex items-center gap-1 ${
                          categoryId === category.id 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.icon && <span>{category.icon}</span>}
                        {category.name}
                      </Link>
                    );
                  })}
                </div>
              </details>
            )}
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
                        <Link href={`/users/${post.author_name.toLowerCase().replace(/\s+/g, '')}`} className="hover:text-pink-500 hover:underline">
                          {post.author_name}
                        </Link>
                        <span>{formatDate(post.created_at)}</span>
                        {post.category && (
                          <span className="bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1">
                            {post.category.icon && <span>{post.category.icon}</span>}
                            {post.category.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.replies_count || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 投票ボタンと削除ボタン */}
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
                      {canDeletePost(post) && (
                        <button
                          onClick={() => setDeletePostId(post.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setReportPostId(post.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-orange-50 text-orange-600 hover:bg-orange-100 transition"
                        title="通報"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTipRecipient({id: 'anonymous', name: post.author_name, postId: post.id});
                          setTipModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        title="投げ銭"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-xs">投げ銭</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 画像プレビュー */}
                  {post.images && post.images.length > 0 && (
                    <div className="mt-4">
                      <div className="flex gap-2 flex-wrap">
                        {post.images.slice(0, 4).map((image, idx) => (
                          <div key={idx} className="relative group cursor-pointer">
                            <div className="w-32 h-32 overflow-hidden rounded-lg bg-gray-100">
                              <img
                                src={image.thumbnail_url || image.image_url}
                                alt={`画像${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            {/* ホバー時の拡大プレビュー */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg"></div>
                            {idx === 3 && post.images.length > 4 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white font-bold">
                                +{post.images.length - 4}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        画像 {post.images.length}枚
                      </p>
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

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <UserProfileWidget />
              <HotThreadsWidget />
              <GlobalChatRooms />
            </div>
          </div>
        </div>
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

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={handleDeletePost}
        title="投稿を削除"
        message="この投稿を削除してもよろしいですか？削除後は元に戻せません。"
        confirmText="削除"
        cancelText="キャンセル"
        isLoading={deletingPost}
      />
      
      {/* 通報モーダル */}
      {reportPostId && (
        <ReportModal
          isOpen={!!reportPostId}
          onClose={() => setReportPostId(null)}
          contentType="board_post"
          contentId={reportPostId}
        />
      )}
      
      {/* 投げ銭モーダル */}
      <TipModal
        isOpen={tipModalOpen}
        onClose={() => setTipModalOpen(false)}
        recipientName={tipRecipient.name}
        recipientId={tipRecipient.id}
        postId={tipRecipient.postId}
      />
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