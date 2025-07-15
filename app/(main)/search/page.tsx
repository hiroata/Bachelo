'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, MessageSquare, Calendar, Eye, Heart } from 'lucide-react';
import { BoardPost } from '@/types/board';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchResults, setSearchResults] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'title' | 'content'>('all');
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('board_posts')
        .select(`
          *,
          category:board_categories(name, slug, icon),
          replies:board_replies(count)
        `);

      // 検索タイプに応じてフィルタリング
      if (searchType === 'title') {
        query = query.ilike('title', `%${searchTerm}%`);
      } else if (searchType === 'content') {
        query = query.ilike('content', `%${searchTerm}%`);
      } else {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
    // URLを更新
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    window.history.pushState({}, '', `/search?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return '1時間以内';
    if (diffHours < 24) return `${diffHours}時間前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">掲示板検索</h1>

      {/* 検索フォーム */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="キーワードを入力して検索..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg"
            autoFocus
          />
        </div>
        
        {/* 検索オプション */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-600">検索対象:</span>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="all"
              checked={searchType === 'all'}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="text-pink-500"
            />
            <span className="text-sm">すべて</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="title"
              checked={searchType === 'title'}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="text-pink-500"
            />
            <span className="text-sm">タイトルのみ</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="content"
              checked={searchType === 'content'}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="text-pink-500"
            />
            <span className="text-sm">本文のみ</span>
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition font-medium"
        >
          検索
        </button>
      </form>

      {/* 検索結果 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">検索中...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div>
          <p className="text-gray-600 mb-4">
            「{query || searchQuery}」の検索結果: {searchResults.length}件
          </p>
          <div className="space-y-4">
            {searchResults.map((post) => (
              <Link
                key={post.id}
                href={`/board/post/${post.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition p-6"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 hover:text-pink-500 transition">
                    {post.title}
                  </h2>
                  {post.category && (
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                      {post.category.icon && <span>{post.category.icon}</span>}
                      {post.category.name}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.view_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {post.replies?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.plus_count || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-gray-500">「{searchQuery}」に一致する投稿は見つかりませんでした</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">検索キーワードを入力してください</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">掲示板検索</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">読み込み中...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}