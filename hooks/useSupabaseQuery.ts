/**
 * Supabaseのクエリを簡単に実行するためのカスタムフック集
 * SQLを書かずに、Reactのフックとして使用できます
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

/**
 * データの取得状態を管理する型
 */
interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * ページネーション付きデータ取得フック
 */
export function usePaginatedQuery<T extends keyof Tables | string>(
  tableName: T,
  options: {
    page?: number;
    perPage?: number;
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
    enabled?: boolean;
  } = {}
): QueryState<{
  items: any[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}> {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    page = 1,
    perPage = 20,
    orderBy = 'created_at',
    ascending = false,
    filters = {},
    enabled = true
  } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending })
        .range(from, to);

      // フィルター適用
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data: items, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setData({
        items: items || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / perPage)
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [tableName, page, perPage, orderBy, ascending, filters, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 単一レコード取得フック
 */
export function useSingleQuery<T extends keyof Tables | string>(
  tableName: T,
  id: string | null,
  options: {
    select?: string;
    enabled?: boolean;
  } = {}
): QueryState<any> {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { select = '*', enabled = true } = options;

  const fetchData = useCallback(async () => {
    if (!enabled || !id) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: item, error: queryError } = await supabase
        .from(tableName)
        .select(select)
        .eq('id', id)
        .single();

      if (queryError) throw queryError;
      setData(item);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [tableName, id, select, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * リアルタイムサブスクリプションフック
 */
export function useRealtimeSubscription<T extends keyof Tables | string>(
  tableName: T,
  options: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    onInsert?: (payload: any) => void;
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
  } = {}
) {
  const { event = '*', filter, onInsert, onUpdate, onDelete } = options;

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table: tableName,
          filter
        },
        (payload: any) => {
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload.new);
              break;
            case 'UPDATE':
              onUpdate?.(payload.new);
              break;
            case 'DELETE':
              onDelete?.(payload.old);
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, event, filter, onInsert, onUpdate, onDelete]);
}

/**
 * 掲示板の投稿を取得する専用フック
 */
export function useBoardPosts(categoryId?: string, page: number = 1) {
  return usePaginatedQuery('board_posts', {
    page,
    orderBy: 'created_at',
    ascending: false,
    filters: categoryId ? { category_id: categoryId } : {}
  });
}

/**
 * 投稿の返信を取得する専用フック
 */
export function usePostReplies(postId: string | null) {
  return usePaginatedQuery('board_replies', {
    perPage: 100, // 返信は全件取得
    orderBy: 'created_at',
    ascending: true,
    filters: { post_id: postId },
    enabled: !!postId
  });
}

/**
 * カテゴリー一覧を取得する専用フック
 */
export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('board_categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

/**
 * 音声投稿を取得する専用フック（リアルタイム更新付き）
 */
export function useVoicePosts(
  category?: 'female' | 'male' | 'couple',
  options: { realtime?: boolean } = {}
) {
  const { data, loading, error, refetch } = usePaginatedQuery('anonymous_voice_posts', {
    orderBy: 'created_at',
    ascending: false,
    filters: category ? { category } : {},
    perPage: 50
  });

  // リアルタイム更新を設定
  useRealtimeSubscription('anonymous_voice_posts', {
    filter: category ? `category=eq.${category}` : undefined,
    onInsert: () => refetch(),
    onUpdate: () => refetch()
  });

  return { posts: data?.items || [], loading, error, refetch };
}

/**
 * ミューテーション（作成・更新・削除）フック
 */
export function useMutation<T extends keyof Tables | string>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (
    tableName: T,
    data: any
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to create');
      return await response.json();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (
    tableName: T,
    id: string,
    data: any
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/${tableName}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to update');
      return await response.json();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (tableName: T, id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/${tableName}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');
      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, loading, error };
}