'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'

interface Post {
  id: number
  postNumber: number
  name: string | null
  email: string | null
  body: string
  trip: string | null
  userId: string
  createdAt: string
}

interface Thread {
  id: number
  title: string
  area: {
    id: number
    name: string
    slug: string
    region: {
      id: number
      name: string
      slug: string
    }
  }
  posts: Post[]
  _count: {
    posts: number
  }
}

export default function ThreadPage() {
  const params = useParams()
  const threadId = params.id as string
  
  const [thread, setThread] = useState<Thread | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // フォーム状態
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // 削除モーダル状態
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null)
  const [deleteInputPassword, setDeleteInputPassword] = useState('')

  useEffect(() => {
    fetchThread()
  }, [threadId])

  const fetchThread = async () => {
    try {
      const res = await fetch(`/api/threads/${threadId}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'エラーが発生しました')
      }
      
      setThread(data.thread)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スレッドの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/threads/${threadId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          postBody: body,
          deletePassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'エラーが発生しました')
      }

      // フォームをリセット
      setBody('')
      
      // スレッドを再取得
      await fetchThread()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingPostId) return
    
    try {
      const res = await fetch(`/api/posts/${deletingPostId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deleteInputPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'エラーが発生しました')
      }

      // モーダルを閉じる
      setDeletingPostId(null)
      setDeleteInputPassword('')
      
      // スレッドを再取得
      await fetchThread()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short'
    })
  }

  if (loading) return <p>読み込み中...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!thread) return <p>スレッドが見つかりません</p>

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'トップ', href: '/' },
          { label: thread.area.region.name, href: '/' },
          { label: thread.area.name, href: `/areas/${thread.area.slug}` },
          { label: thread.title }
        ]}
      />
      
      <h2 className="text-xl font-bold mb-4">{thread.title}</h2>
      
      <div className="mb-8">
        {thread.posts.map((post) => (
          <div key={post.id}>
            <div className="post-header">
              <span className="post-number">{post.postNumber}</span>
              <span className="post-name">
                {post.name || '名無しさん'}
                {post.trip && <span>{post.trip}</span>}
              </span>
              {post.email && (
                <span className="text-gray-600">[{post.email}]</span>
              )}
              <span className="post-date">{formatDate(post.createdAt)}</span>
              <span className="post-id">{post.userId}</span>
              {post.body !== 'あぼーん' && (
                <button
                  onClick={() => setDeletingPostId(post.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  削除
                </button>
              )}
            </div>
            <div className="post-body">{post.body}</div>
            <div className="post-divider"></div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-bold mb-4">レス投稿</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-100 p-4">
        <div className="bbs-form-row">
          <label className="bbs-form-label">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bbs-form-input"
            placeholder="名無しさん"
          />
        </div>
        
        <div className="bbs-form-row">
          <label className="bbs-form-label">E-mail</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bbs-form-input"
            placeholder="sage"
          />
        </div>
        
        <div className="bbs-form-row">
          <label className="bbs-form-label">
            本文<span className="text-red-500">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="bbs-form-input h-32"
            required
          />
        </div>
        
        <div className="bbs-form-row">
          <label className="bbs-form-label">削除PASS</label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className="bbs-form-input"
            placeholder="削除用パスワード"
          />
        </div>
        
        <div className="bbs-form-row">
          <div className="bbs-form-label"></div>
          <button
            type="submit"
            disabled={submitting}
            className="bbs-button"
          >
            {submitting ? '送信中...' : '書き込む'}
          </button>
        </div>
      </form>

      {/* 削除パスワード入力モーダル */}
      {deletingPostId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded">
            <h4 className="font-bold mb-4">削除パスワードを入力</h4>
            <input
              type="password"
              value={deleteInputPassword}
              onChange={(e) => setDeleteInputPassword(e.target.value)}
              className="border px-2 py-1 mb-4 w-full"
              placeholder="削除パスワード"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-1"
              >
                削除
              </button>
              <button
                onClick={() => {
                  setDeletingPostId(null)
                  setDeleteInputPassword('')
                }}
                className="bg-gray-600 text-white px-4 py-1"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}