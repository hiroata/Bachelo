'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Flame, Crown, MessageCircle, Heart, Users, TrendingUp, 
  Mic, Play, Clock, ChevronRight, Sparkles, Lock
} from 'lucide-react';
import { adultCategories } from '@/data/adult-categories';

export default function Home() {
  const [stats, setStats] = useState({
    categories: 23,
    totalPosts: 705339,
    newPostsToday: Math.floor(Math.random() * 5000) + 2000
  });

  // 人気カテゴリーのデータ
  const popularCategories = [
    { 
      id: 'acquaintance-wife',
      name: '知り合いの人妻',
      emoji: '💍',
      count: 5178,
      gradient: 'from-pink-500 to-purple-600'
    },
    { 
      id: 'masturbation',
      name: 'やっぱりオナニーが一番',
      emoji: '💦',
      count: 9570,
      gradient: 'from-yellow-400 to-orange-500'
    },
    { 
      id: 'erotic-experience',
      name: '投稿 エッチ体験',
      emoji: '💕',
      count: 3079,
      gradient: 'from-pink-400 to-red-500'
    },
    { 
      id: 'massage',
      name: 'マッサージで感じちゃった私達',
      emoji: '💆',
      count: 2648,
      gradient: 'from-green-400 to-teal-500'
    },
    { 
      id: 'voice-erotica',
      name: 'Koe-Koe',
      emoji: '🎙️',
      count: 4368,
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  // メインカテゴリー
  const mainCategories = [
    {
      id: 'incest',
      name: '近親相姦',
      description: '禁断の世界、家族との体験談',
      posts: 57860,
      isSpecial: true,
      gradient: 'from-red-600 to-red-800'
    },
    {
      id: 'housewife-affair',
      name: '人妻不倫',
      description: '既婚女性の秘密の関係',
      posts: 89432,
      gradient: 'from-purple-600 to-pink-700'
    },
    {
      id: 'exhibitionism',
      name: '露出・野外',
      description: '屋外での大胆な行為',
      posts: 45221,
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'sm-dungeon',
      name: 'SM・調教',
      description: '支配と服従の世界',
      posts: 32876,
      isSpecial: true,
      gradient: 'from-gray-700 to-black'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <Flame className="w-10 h-10" />
              全ジャンル掲示板
            </h1>
            <p className="text-xl text-pink-100 mb-8">
              あらゆる性癖・欲望に対応！あなたの求める刺激がきっと見つかる
            </p>
            
            {/* 統計情報 */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                <div className="text-3xl font-bold">{stats.categories}</div>
                <div className="text-sm text-pink-100">カテゴリー</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                <div className="text-3xl font-bold">{stats.totalPosts.toLocaleString()}</div>
                <div className="text-sm text-pink-100">総投稿数</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                <div className="text-3xl font-bold">24時間</div>
                <div className="text-sm text-pink-100">新着投稿</div>
              </div>
            </div>

            <Link
              href="/board"
              className="inline-block bg-white text-pink-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-pink-50 transition"
            >
              掲示板を見る →
            </Link>
          </div>
        </div>
      </div>

      {/* 今週の人気カテゴリー */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-8 h-8 text-orange-500" />
          <h2 className="text-2xl font-bold">🔥 今週の人気カテゴリー</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {popularCategories.map(category => (
            <Link
              key={category.id}
              href={`/board/category/${category.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6 text-center group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition">
                {category.emoji}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{category.name}</h3>
              <div className="flex items-center justify-center gap-1 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">{category.count.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* メインカテゴリー */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-pink-500" />
            <h2 className="text-2xl font-bold">メインカテゴリー</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mainCategories.map(category => (
              <Link
                key={category.id}
                href={`/board/category/${category.id}`}
                className={`relative overflow-hidden rounded-xl p-8 text-white bg-gradient-to-br ${category.gradient} hover:scale-105 transition transform`}
              >
                {category.isSpecial && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                      特別
                    </span>
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-white/80 mb-4">{category.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4" />
                      <span>{category.posts.toLocaleString()} 投稿</span>
                    </div>
                  </div>
                  {category.isSpecial && (
                    <Lock className="w-8 h-8 text-white/50" />
                  )}
                </div>
                
                <div className="absolute bottom-0 right-0 opacity-10">
                  <MessageCircle className="w-32 h-32" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* その他のカテゴリー */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">その他のカテゴリー</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {adultCategories.slice(0, 18).map(category => (
            <Link
              key={category.id}
              href={`/board/category/${category.slug}`}
              className="bg-white rounded-lg p-4 hover:shadow-md transition text-center"
            >
              <span className="text-2xl mb-1 block">{category.emoji}</span>
              <p className="text-sm font-medium text-gray-700">{category.name}</p>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link
            href="/board/categories"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition"
          >
            すべてのカテゴリーを見る
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* CTA セクション */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">今すぐ参加して刺激的な体験を</h2>
          <p className="text-xl text-purple-100 mb-8">
            匿名で安全に、あなたの欲望を解放しましょう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/board"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-purple-50 transition"
            >
              掲示板を見る
            </Link>
            <Link
              href="/board/regional"
              className="bg-purple-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-800 transition"
            >
              地域別掲示板
            </Link>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600">
          <p className="mb-2">⚠️ 18歳未満の方の利用は固く禁止されています</p>
          <p>当サイトはアダルトコンテンツを含みます。利用規約を守ってご利用ください。</p>
        </div>
      </div>
    </div>
  );
}