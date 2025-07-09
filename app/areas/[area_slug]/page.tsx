'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

interface Area {
  id: number
  name: string
  slug: string
  region: {
    id: number
    name: string
    slug: string
  }
}

interface Thread {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  _count: {
    posts: number
  }
}

export default function AreaPage() {
  const params = useParams()
  const router = useRouter()
  const areaSlug = params.area_slug as string
  
  const [area, setArea] = useState<Area | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [sameRegionAreas, setSameRegionAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // フォーム状態
  const [title, setTitle] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAreaData()
  }, [areaSlug])

  const fetchAreaData = async () => {
    try {
      // エリア情報を取得
      const areaRes = await fetch(`/api/regions`)
      const regions = await areaRes.json()
      
      let currentArea: Area | null = null
      let relatedAreas: Area[] = []
      
      for (const region of regions) {
        for (const area of region.areas) {
          if (area.slug === areaSlug) {
            currentArea = { ...area, region }
            relatedAreas = region.areas.filter((a: Area) => a.slug !== areaSlug)
            break
          }
        }
        if (currentArea) break
      }
      
      if (!currentArea) {
        setError('エリアが見つかりません')
        setLoading(false)
        return
      }
      
      setArea(currentArea)
      setSameRegionAreas(relatedAreas)
      
      // スレッド一覧を取得
      const threadsRes = await fetch(`/api/threads?area=${areaSlug}`)
      const threadsData = await threadsRes.json()
      setThreads(threadsData.threads)
    } catch (err) {
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!area) return
    
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          name,
          email,
          postBody: body,
          deletePassword,
          areaId: area.id
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'エラーが発生しました')
      }

      // フォームをリセット
      setTitle('')
      setName('')
      setEmail('')
      setBody('')
      setDeletePassword('')
      
      // スレッドページへ遷移
      router.push(`/threads/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>読み込み中...</p>
  if (error && !area) return <p className="text-red-500">{error}</p>
  if (!area) return <p>エリアが見つかりません</p>

  return (
    <div className="flex gap-6">
      <div className="flex-grow">
        <Breadcrumbs
          items={[
            { label: 'トップ', href: '/' },
            { label: area.region.name, href: '/' },
            { label: area.name }
          ]}
        />
        
        <h2 className="text-xl font-bold mb-4">{area.name}の掲示板</h2>
        
        {threads.length > 0 ? (
          <table className="thread-table mb-8">
            <thead>
              <tr>
                <th className="w-16">番号</th>
                <th>スレッドタイトル</th>
                <th className="w-20">レス数</th>
              </tr>
            </thead>
            <tbody>
              {threads.map((thread, index) => (
                <tr key={thread.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <Link href={`/threads/${thread.id}`}>
                      {thread.title}
                    </Link>
                  </td>
                  <td className="text-center">{thread._count.posts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mb-8">まだスレッドがありません。最初のスレッドを作成してください。</p>
        )}

        <h3 className="text-lg font-bold mb-4">新規スレッド作成</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4">
          <div className="bbs-form-row">
            <label className="bbs-form-label">
              スレッドタイトル<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bbs-form-input"
              required
            />
          </div>
          
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
              {submitting ? '送信中...' : 'スレッドを立てる'}
            </button>
          </div>
        </form>
      </div>
      
      <aside className="w-64">
        <h3 className="font-bold mb-2">{area.region.name}の他のエリア</h3>
        <ul className="space-y-1">
          {sameRegionAreas.map((otherArea) => (
            <li key={otherArea.id}>
              <Link
                href={`/areas/${otherArea.slug}`}
                className="text-bbs-link hover:underline"
              >
                {otherArea.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}