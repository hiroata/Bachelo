'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { Database } from '@/types/database'

interface VoicePost {
  id: string
  username: string
  avatarEmoji: string
  avatarColor: string
  message: string
  duration: number
  likes: number
  comments: number
  postedAt: string
  audioUrl: string
  isAnonymous: boolean
}

interface UseRealtimeVoicePostsOptions {
  category?: 'female' | 'male' | 'couple'
  initialPosts?: VoicePost[]
}

type VoicePostRow = Database['public']['Tables']['anonymous_voice_posts']['Row']

interface RealtimePostPayload {
  new: VoicePostRow
  old?: VoicePostRow
}

export function useRealtimeVoicePosts({ category, initialPosts = [] }: UseRealtimeVoicePostsOptions = {}) {
  const [posts, setPosts] = useState<VoicePost[]>(initialPosts)
  const supabase = createClient()

  // 投稿データをフォーマット
  const formatPost = useCallback((dbPost: VoicePostRow): VoicePost => {
    return {
      id: dbPost.id,
      username: dbPost.nickname,
      avatarEmoji: dbPost.avatar_emoji,
      avatarColor: dbPost.avatar_color,
      message: dbPost.message,
      duration: dbPost.duration_seconds,
      likes: dbPost.likes_count,
      comments: dbPost.comments_count,
      postedAt: formatRelativeTime(dbPost.created_at),
      audioUrl: dbPost.audio_url,
      isAnonymous: true
    }
  }, [])

  // 新規投稿を追加
  const handleNewPost = useCallback((payload: RealtimePostPayload) => {
    const newPost = formatPost(payload.new)
    setPosts(prev => [newPost, ...prev])
  }, [formatPost])

  // 投稿の更新（いいね数、コメント数など）
  const handleUpdatePost = useCallback((payload: RealtimePostPayload) => {
    const updatedPost = formatPost(payload.new)
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ))
  }, [formatPost])

  // リアルタイム接続をセットアップ
  useEffect(() => {
    // カテゴリーに基づいてチャンネル名を決定
    const channelName = category ? `voice-posts-${category}` : 'voice-posts-all'
    
    const newChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'anonymous_voice_posts',
          filter: category ? `category=eq.${category}` : undefined
        },
        handleNewPost
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'anonymous_voice_posts',
          filter: category ? `category=eq.${category}` : undefined
        },
        handleUpdatePost
      )
      .subscribe()

    // クリーンアップ
    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel)
      }
    }
  }, [category, supabase, handleNewPost, handleUpdatePost])

  // 投稿を手動で更新
  const updatePost = useCallback((postId: string, updates: Partial<VoicePost>) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    ))
  }, [])

  return {
    posts,
    updatePost
  }
}

// 相対時間をフォーマット
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  
  if (diffDay > 0) {
    return `${diffDay}日前`
  } else if (diffHour > 0) {
    return `${diffHour}時間前`
  } else if (diffMin > 0) {
    return `${diffMin}分前`
  } else {
    return 'たった今'
  }
}