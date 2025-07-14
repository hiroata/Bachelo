/**
 * Supabase操作を簡単にするヘルパー関数集
 * SQLを書かずに、TypeScriptで直感的に操作できます
 */

import { createRouteHandlerClient } from './server'
import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']

/**
 * ページネーション付きでデータを取得
 */
export async function getPaginated<T extends keyof Tables | string>(
  tableName: T,
  options: {
    page?: number
    perPage?: number
    orderBy?: string
    ascending?: boolean
    filters?: Record<string, any>
  } = {}
) {
  const {
    page = 1,
    perPage = 20,
    orderBy = 'created_at',
    ascending = false,
    filters = {}
  } = options

  const supabase = createRouteHandlerClient()
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from(tableName)
    .select('*', { count: 'exact' })
    .order(orderBy, { ascending })
    .range(from, to)

  // フィルター適用
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value)
    }
  })

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data || [],
    totalCount: count || 0,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / perPage),
    perPage
  }
}

/**
 * IDでレコードを取得
 */
export async function getById<T extends keyof Tables | string>(
  tableName: T,
  id: string,
  options: {
    select?: string
  } = {}
) {
  const supabase = createRouteHandlerClient()
  const { select = '*' } = options

  const { data, error } = await supabase
    .from(tableName)
    .select(select)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * レコードを作成
 */
export async function create<T extends keyof Tables | string>(
  tableName: T,
  data: any
) {
  const supabase = createRouteHandlerClient()

  const { data: newData, error } = await supabase
    .from(tableName)
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return newData
}

/**
 * レコードを更新
 */
export async function update<T extends keyof Tables | string>(
  tableName: T,
  id: string,
  data: any
) {
  const supabase = createRouteHandlerClient()

  const { data: updatedData, error } = await supabase
    .from(tableName)
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updatedData
}

/**
 * レコードを削除
 */
export async function remove<T extends keyof Tables | string>(
  tableName: T,
  id: string
) {
  const supabase = createRouteHandlerClient()

  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

/**
 * 投票を追加（重複チェック付き）
 */
export async function addVote(
  tableName: 'board_post_votes' | 'board_reply_votes',
  targetId: string,
  ipAddress: string,
  voteType: 'plus' | 'minus'
) {
  const supabase = createRouteHandlerClient()
  const targetColumn = tableName === 'board_post_votes' ? 'post_id' : 'reply_id'

  // 既存の投票を確認
  const { data: existing } = await supabase
    .from(tableName)
    .select('id, vote_type')
    .eq(targetColumn, targetId)
    .eq('ip_address', ipAddress)
    .single()

  if (existing) {
    if (existing.vote_type === voteType) {
      // 同じ投票タイプなら削除（トグル）
      await supabase
        .from(tableName)
        .delete()
        .eq('id', existing.id)
      
      return { action: 'removed', voteType }
    } else {
      // 違う投票タイプなら更新
      await supabase
        .from(tableName)
        .update({ vote_type: voteType })
        .eq('id', existing.id)
      
      return { action: 'changed', voteType }
    }
  } else {
    // 新規投票
    await supabase
      .from(tableName)
      .insert({
        [targetColumn]: targetId,
        ip_address: ipAddress,
        vote_type: voteType
      })
    
    return { action: 'added', voteType }
  }
}

/**
 * 投票数を再計算
 */
export async function recalculateVotes(
  targetTable: 'board_posts' | 'board_replies',
  targetId: string
) {
  const supabase = createRouteHandlerClient()
  const voteTable = targetTable === 'board_posts' ? 'board_post_votes' : 'board_reply_votes'
  const targetColumn = targetTable === 'board_posts' ? 'post_id' : 'reply_id'

  // プラス票をカウント
  const { count: plusCount } = await supabase
    .from(voteTable)
    .select('*', { count: 'exact', head: true })
    .eq(targetColumn, targetId)
    .eq('vote_type', 'plus')

  // マイナス票をカウント
  const { count: minusCount } = await supabase
    .from(voteTable)
    .select('*', { count: 'exact', head: true })
    .eq(targetColumn, targetId)
    .eq('vote_type', 'minus')

  // 更新
  await supabase
    .from(targetTable)
    .update({
      plus_count: plusCount || 0,
      minus_count: minusCount || 0
    })
    .eq('id', targetId)

  return {
    plusCount: plusCount || 0,
    minusCount: minusCount || 0
  }
}

/**
 * 返信数を更新
 */
export async function updateReplyCount(postId: string) {
  const supabase = createRouteHandlerClient()

  const { count } = await supabase
    .from('board_replies')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  await supabase
    .from('board_posts')
    .update({ reply_count: count || 0 })
    .eq('id', postId)

  return count || 0
}

/**
 * ファイルをストレージにアップロード
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options: {
    contentType?: string
    upsert?: boolean
  } = {}
) {
  const supabase = createRouteHandlerClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options.contentType,
      upsert: options.upsert || false
    })

  if (error) throw error

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return {
    path: data.path,
    publicUrl
  }
}

/**
 * ファイルを削除
 */
export async function deleteFile(bucket: string, paths: string[]) {
  const supabase = createRouteHandlerClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths)

  if (error) throw error
  return { success: true }
}

/**
 * トランザクション風の処理（エラー時にロールバック）
 */
export async function withTransaction<T>(
  callback: (supabase: SupabaseClient<Database>) => Promise<T>
): Promise<T> {
  const supabase = createRouteHandlerClient()
  
  try {
    const result = await callback(supabase)
    return result
  } catch (error) {
    // エラーが発生した場合は、エラーを再スロー
    // 注意：Supabaseは自動的にトランザクションをサポートしていないため、
    // 手動でのロールバック処理が必要な場合は個別に実装する必要があります
    throw error
  }
}

/**
 * よく使うクエリのプリセット
 */
export const queries = {
  // 最新の投稿を取得
  getLatestPosts: (limit = 10) => 
    getPaginated('board_posts', { perPage: limit, orderBy: 'created_at' }),

  // カテゴリー別の投稿を取得
  getPostsByCategory: (categoryId: string, page = 1) =>
    getPaginated('board_posts', { 
      page, 
      filters: { category_id: categoryId } 
    }),

  // 投稿の返信を取得
  getRepliesByPost: (postId: string) =>
    getPaginated('board_replies', {
      filters: { post_id: postId },
      perPage: 100 // 返信は全件取得
    }),

  // 人気の投稿を取得（投票数順）
  getPopularPosts: (limit = 10) =>
    getPaginated('board_posts', {
      perPage: limit,
      orderBy: 'plus_count',
      ascending: false
    })
}