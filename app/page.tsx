'use client'

import { useState, useEffect } from 'react'
import RegionSelector from '@/components/RegionSelector'

interface Region {
  id: number
  name: string
  slug: string
  order: number
  areas: {
    id: number
    name: string
    slug: string
  }[]
}

export default function HomePage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRegions()
  }, [])

  const fetchRegions = async () => {
    try {
      const res = await fetch('/api/regions')
      const data = await res.json()
      setRegions(data)
    } catch (err) {
      setError('地域一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">地域別掲示板ポータル</h1>
        <p className="text-gray-700">
          全国各地の地域に特化した掲示板コミュニティです。
          お住まいの地域を選択して、地域の話題を共有しましょう。
        </p>
      </div>

      {/* 注目ユーザーのアイコン一覧（プロモーション要素） */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-bold mb-2">注目の投稿者</h2>
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">地域を選択</h2>
      
      {loading ? (
        <p>読み込み中...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <RegionSelector regions={regions} />
      )}
    </div>
  )
}