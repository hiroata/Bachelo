'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BoardCategory, BoardPost } from '@/types/board';

function BoardContent() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<BoardCategory[]>([]);
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const categoryId = searchParams.get('category');
    const page = searchParams.get('page');
    setSelectedCategory(categoryId);
    setCurrentPage(page ? parseInt(page) : 1);
    fetchPosts(categoryId, page ? parseInt(page) : 1);
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/board/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchPosts = async (categoryId: string | null, page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });
      if (categoryId) {
        params.append('category_id', categoryId);
      }
      
      const response = await fetch(`/api/board/posts?${params}`);
      const data = await response.json();
      setPosts(data.posts);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">掲示板</h1>
      
      {/* カテゴリタブ */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/board">
          <Button
            variant={selectedCategory === null ? 'primary' : 'outline'}
          >
            すべて
          </Button>
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/board?category=${category.id}`}
          >
            <Button
              variant={selectedCategory === category.id ? 'primary' : 'outline'}
            >
              {category.name}
            </Button>
          </Link>
        ))}
      </div>

      {/* 新規投稿ボタン */}
      <div className="mb-6">
        <Button
          onClick={() => setShowPostModal(true)}
          className="bg-pink-500 hover:bg-pink-600"
        >
          新規投稿
        </Button>
      </div>

      {/* 投稿一覧 */}
      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <Link href={`/board/post/${post.id}`}>
                <h2 className="text-xl font-semibold mb-2 hover:text-pink-500">
                  {post.is_pinned && <span className="text-red-500 mr-2">📌</span>}
                  {post.title}
                </h2>
              </Link>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                <span>投稿者: {post.author_name}</span>
                <span>カテゴリ: {post.category?.name}</span>
                <span>閲覧数: {post.view_count}</span>
                <span>返信: {post.replies_count || 0}</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              {post.images && post.images.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {post.images.slice(0, 4).map((image) => (
                    <img
                      key={image.id}
                      src={image.thumbnail_url || image.image_url}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/board?${selectedCategory ? `category=${selectedCategory}&` : ''}page=${page}`}
            >
              <Button
                variant={currentPage === page ? 'primary' : 'outline'}
                size="sm"
              >
                {page}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* 投稿モーダル */}
      {showPostModal && (
        <PostModal
          categories={categories}
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
            fetchPosts(selectedCategory, currentPage);
          }}
        />
      )}
    </div>
  );
}

function PostModal({
  categories,
  onClose,
  onSuccess,
}: {
  categories: BoardCategory[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    category_id: categories[0]?.id || '',
    author_name: '',
    author_email: '',
    title: '',
    content: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 投稿を作成
      const response = await fetch('/api/board/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const post = await response.json();

      // 画像がある場合はアップロード
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((file) => formData.append('files', file));
        formData.append('post_id', post.id);

        await fetch('/api/board/upload', {
          method: 'POST',
          body: formData,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('投稿の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">新規投稿</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">カテゴリ</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">名前</label>
            <input
              type="text"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              className="w-full p-2 border rounded"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス（任意）</label>
            <input
              type="email"
              value={formData.author_email}
              onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">タイトル</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">本文</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-2 border rounded"
              rows={10}
              required
              maxLength={10000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">画像（最大4枚）</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 4);
                setImages(files);
              }}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? '投稿中...' : '投稿する'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BoardPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">読み込み中...</div>}>
      <BoardContent />
    </Suspense>
  );
}