'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

// ユーザープロフィール画像（仮データ）
const userProfiles = [
  { id: 1, name: 'さきさん', age: null, image: '/api/placeholder/80/80' },
  { id: 2, name: 'めいちゃん', age: null, image: '/api/placeholder/80/80' },
  { id: 3, name: 'のっちゃん', age: null, image: '/api/placeholder/80/80' },
  { id: 4, name: 'あいちゃん', age: null, image: '/api/placeholder/80/80' },
  { id: 5, name: '鹿児さん', age: null, image: '/api/placeholder/80/80' },
  { id: 6, name: 'よしがさん', age: null, image: '/api/placeholder/80/80' },
  { id: 7, name: 'ちびさん', age: null, image: '/api/placeholder/80/80' },
  { id: 8, name: 'no photo', age: null, image: null },
  { id: 9, name: 'yukikoさん', age: null, image: '/api/placeholder/80/80' },
  { id: 10, name: 'みいちゃん', age: null, image: '/api/placeholder/80/80' },
  { id: 11, name: 'Minamiさん', age: null, image: '/api/placeholder/80/80' },
  { id: 12, name: 'まむこちゃん', age: null, image: '/api/placeholder/80/80' },
  { id: 13, name: 'すみれさん', age: null, image: '/api/placeholder/80/80' },
  { id: 14, name: 'そうちゃん', age: null, image: '/api/placeholder/80/80' },
  { id: 15, name: 'なおちゃん', age: null, image: '/api/placeholder/80/80' },
];

// 地域データ
const regions = [
  {
    name: '北海道',
    slug: 'hokkaido',
    prefectures: ['札幌', '旭川', '帯広', '函館', '釧路', '北見'],
  },
  {
    name: '東北',
    slug: 'tohoku',
    prefectures: ['青森', '岩手', '宮城', '秋田', '山形', '福島'],
  },
  {
    name: '関東',
    slug: 'kanto',
    prefectures: ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川'],
  },
  {
    name: '北陸・甲信越',
    slug: 'hokuriku',
    prefectures: ['新潟', '富山', '石川', '福井', '山梨', '長野'],
  },
  {
    name: '東海',
    slug: 'tokai',
    prefectures: ['岐阜', '静岡', '愛知', '三重'],
  },
  {
    name: '関西・近畿',
    slug: 'kansai',
    prefectures: ['滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山'],
  },
  {
    name: '中国',
    slug: 'chugoku',
    prefectures: ['鳥取', '島根', '岡山', '広島', '山口'],
  },
  {
    name: '四国',
    slug: 'shikoku',
    prefectures: ['徳島', '香川', '愛媛', '高知'],
  },
];

export default function RegionalTopPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景画像部分 */}
      <div className="relative">
        {/* 背景画像 */}
        <div 
          className="h-[500px] relative bg-cover bg-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("/api/placeholder/1920/500")',
          }}
        >
          {/* ユーザープロフィール画像 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-6xl w-full px-4">
              {/* プロフィール画像グリッド */}
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4 mb-8">
                {userProfiles.slice(0, 8).map((user) => (
                  <div key={user.id} className="text-center">
                    <div className="relative">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-20 h-20 rounded-full border-4 border-white mx-auto object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-4 border-white mx-auto bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                          no photo
                        </div>
                      )}
                    </div>
                    <p className="text-white text-sm mt-1">{user.name}</p>
                  </div>
                ))}
              </div>

              {/* 2行目のプロフィール画像 */}
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 justify-center">
                {userProfiles.slice(8, 15).map((user) => (
                  <div key={user.id} className="text-center">
                    <div className="relative">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-20 h-20 rounded-full border-4 border-white mx-auto object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-4 border-white mx-auto bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                          no photo
                        </div>
                      )}
                    </div>
                    <p className="text-white text-sm mt-1">{user.name}</p>
                  </div>
                ))}
              </div>

              {/* 注意書き */}
              <div className="text-center mt-6 text-white text-sm">
                <p>他では体験をお話いただける素敵な出会いを求めるみなさんのSNS！こちらはアダルトサイトになりますので18歳未満の方の閲覧ご遠慮ください。</p>
                <p className="mt-1">アダルトにご利用はお断りしております。18歳以下の方、もしくは免許を持っていない方に会話を求めましょう。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 地域選択ボタン */}
        <div className="absolute left-0 right-0 -bottom-32 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {regions.map((region) => (
                <Link
                  key={region.slug}
                  href={`/board/regional/${region.slug}`}
                  className="block"
                >
                  <div className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full py-4 px-6 text-center shadow-lg transform transition hover:scale-105">
                    <h3 className="text-lg font-bold">{region.name}</h3>
                    <p className="text-sm mt-1 opacity-90">
                      {region.prefectures.slice(0, 3).join('　')}
                      {region.prefectures.length > 3 && '　他'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 余白 */}
      <div className="h-40"></div>

      {/* フッター部分 */}
      <div className="bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link
            href="/board"
            className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            掲示板トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}