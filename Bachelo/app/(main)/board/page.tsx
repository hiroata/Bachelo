'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Crown, MessageCircle, Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { BoardPost, BoardCategory } from '@/types/board';
import PostModal from '@/components/board/PostModal';

export default function BoardPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [categories, setCategories] = useState<BoardCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'popular' | 'new'>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/board/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      // カテゴリーが指定されていない場合は全カテゴリーから取得
      const url = categoryId 
        ? `/api/board/posts?category=${categoryId}`
        : '/api/board/posts?per_page=50'; // 総合トップでは多めに取得
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data.posts || data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

  const sortedPosts = Array.isArray(posts) ? [...posts].sort((a, b) => {
    if (selectedTab === 'popular') {
      // 人気順: 返信数と投票スコアを組み合わせて評価
      const aScore = (a.replies_count || 0) * 2 + ((a.plus_count || 0) - (a.minus_count || 0));
      const bScore = (b.replies_count || 0) * 2 + ((b.plus_count || 0) - (b.minus_count || 0));
      return bScore - aScore;
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  }) : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* ヘッダーバナー */}
      <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white py-8 text-center">
        <h1 className="text-3xl font-bold mb-2">BACHELO - バチェロ</h1>
        <p className="text-lg">みんなの掲示板</p>
      </div>

      <div className="mx-auto" style={{ maxWidth: '1200px', padding: '20px' }}>
        {/* サブヘッダー */}
        <div className="bg-pink-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-pink-600">
              {categoryId ? 'カテゴリー別トピック' : '女子の好きな話題で毎日おしゃべり♪'}
            </h2>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="トピックを検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-pink-400"
                style={{ width: '300px' }}
              />
              <button className="bg-pink-500 text-white px-4 py-2 rounded-r-full hover:bg-pink-600">
                <Search size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab('popular')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedTab === 'popular'
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <Crown className="inline-block mr-1" size={16} />
                今日の人気トピック
              </button>
              <button
                onClick={() => setSelectedTab('new')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedTab === 'new'
                    ? 'bg-blue-400 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <MessageCircle className="inline-block mr-1" size={16} />
                新着トピック
              </button>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-6 py-2 rounded-full font-bold text-white bg-pink-500 hover:bg-pink-600 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              トピックを投稿する
            </button>
          </div>
        </div>

        {/* 日付ナビゲーション */}
        <div className="flex items-center justify-center mb-6">
          <button className="text-gray-400 hover:text-gray-600 flex items-center px-4">
            <ChevronLeft size={16} />
            昨日
          </button>
          <h2 className="text-lg font-bold text-gray-700 px-8">
            {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}
          </h2>
          <button className="text-gray-400 hover:text-gray-600 flex items-center px-4">
            前日
            <ChevronRight size={16} />
          </button>
        </div>

        {/* メインコンテンツエリア */}
        <div className="flex gap-6">
          {/* 投稿リスト */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-8">読み込み中...</div>
            ) : (
              <div>
                {sortedPosts.length > 0 ? sortedPosts.slice(0, 20).map((post, index) => (
                  <Link href={`/board/post/${post.id}`} key={post.id}>
                    <div className="flex items-start gap-4 bg-white p-4 mb-2 hover:bg-gray-50 transition-colors border border-gray-200 rounded">
                      {/* サムネイル */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">画像</span>
                        </div>
                      </div>
                      
                      {/* コンテンツ */}
                      <div className="flex-1">
                        {/* メタ情報 */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-pink-500 text-white px-2 py-0.5 text-xs font-bold rounded">
                            {index + 1}位
                          </span>
                          <span className="text-gray-500 text-sm">
                            <MessageCircle className="inline w-4 h-4 mr-1" />
                            {post.replies_count || 0}コメント
                          </span>
                          <span className="text-gray-400 text-sm">
                            {Math.floor(Math.random() * 24) + 1}秒前
                          </span>
                        </div>
                        
                        {/* タイトル */}
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          【{post.category?.name || '実況・感想'}】{post.title}
                        </h3>
                        
                        {/* 説明文 */}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {post.content?.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="text-center py-8 text-gray-500">投稿がありません</div>
                )}
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="w-80">
            <h3 className="text-lg font-bold text-pink-500 mb-4">
              {categoryId ? 'カテゴリー内の人気トピック' : '全カテゴリーの人気トピック'}
            </h3>
            <div className="space-y-2">
              {sortedPosts.slice(0, 10).map((post, index) => (
                <Link href={`/board/post/${post.id}`} key={post.id}>
                  <div className="bg-white p-3 rounded hover:bg-gray-50 transition-colors flex items-start gap-3 border border-gray-200">
                    <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                      <img src="" alt="" className="w-full h-full object-cover rounded" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-700 hover:text-pink-500 line-clamp-2">
                        【{post.category?.name || '実況・感想'}】{post.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        <MessageCircle className="inline w-3 h-3 mr-1" />
                        {post.replies_count || 0}コメント
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 投稿モーダル */}
      {showPostModal && (
        <PostModal
          categories={categories}
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
}