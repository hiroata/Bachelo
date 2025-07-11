'use client'

import Link from 'next/link'
import { MapPin } from 'lucide-react'

// 地域データの定義
const regions = [
  {
    name: '北海道',
    areas: ['札幌', '旭川', '帯広', '函館', '釧路']
  },
  {
    name: '東北',
    areas: ['青森', '岩手', '宮城', '秋田', '山形', '福島']
  },
  {
    name: '関東',
    areas: ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川']
  },
  {
    name: '北陸・甲信越',
    areas: ['新潟', '富山', '石川', '福井', '山梨', '長野']
  },
  {
    name: '東海',
    areas: ['岐阜', '静岡', '愛知', '三重']
  },
  {
    name: '関西・近畿',
    areas: ['滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山']
  },
  {
    name: '中国',
    areas: ['鳥取', '島根', '岡山', '広島', '山口']
  },
  {
    name: '四国',
    areas: ['徳島', '香川', '愛媛', '高知']
  },
  {
    name: '九州・沖縄',
    areas: ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄']
  },
  {
    name: '全国',
    areas: ['全地域共有の掲示板']
  }
]

export default function RegionalBoardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* 背景画像オーバーレイ */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      {/* 背景の装飾的な要素 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <MapPin className="w-8 h-8" />
            地域掲示板
          </h1>
          <p className="text-gray-300">
            お住まいの地域を選んで、地域限定の話題で盛り上がろう！
          </p>
        </div>

        {/* 地域選択グリッド */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regions.map((region) => (
              <Link
                key={region.name}
                href={`/board?region=${encodeURIComponent(region.name)}`}
                className="group"
              >
                <div className="bg-gradient-to-br from-green-600/80 to-green-700/80 backdrop-blur-sm rounded-2xl p-6 hover:from-green-500/90 hover:to-green-600/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-2 text-center">
                    {region.name}
                  </h2>
                  <p className="text-green-100 text-center text-sm">
                    {region.areas.join('　')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-white text-center text-sm leading-relaxed">
              地域掲示板は対象地域の在住者・勤務者のためのコミュニティです。<br />
              虚偽の地域情報や商業目的での利用は禁止されています。<br />
              みんなで楽しく地域の話題を共有しましょう。
            </p>
          </div>
        </div>

        {/* トップに戻るリンク */}
        <div className="mt-8 text-center">
          <Link 
            href="/board" 
            className="text-green-400 hover:text-green-300 transition-colors inline-flex items-center gap-2"
          >
            ← 掲示板トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}