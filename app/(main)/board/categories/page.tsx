'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, Eye, Users, Sparkles, Flame, Crown, 
  Lock, Camera, Mic, MapPin, Video, Hash,
  Newspaper, Navigation, MessageCircle
} from 'lucide-react';
import { adultCategories, categoryGroups } from '@/data/adult-categories';

// アイコンマッピング
const iconMap: {[key: string]: any} = {
  'incest': Lock,
  'exhibitionism': Eye,
  'acquaintance-wife': Heart,
  'sm-dungeon': Lock,
  'lgbt': Heart,
  'masturbation': Sparkles,
  'erotic-experience': Flame,
  'fetish-mania': Crown,
  'rape-stories': Lock,
  'school-girl': Heart,
  'massage': Sparkles,
  'pickup-techniques': MessageCircle,
  'adult-shop': Crown,
  'erotic-novel': MessageCircle,
  'voice-erotica': Mic,
  'ero-board': Camera,
  'ada-community': MapPin,
  'ero-activity': Flame,
  'real-experience': MessageCircle,
  'video-board': Video,
  'nan-net-id': Hash,
  'general-navi': Navigation,
  'news': Newspaper
};

export default function CategoriesPage() {
  const [postCounts, setPostCounts] = useState<{[key: string]: number}>({});
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    // モックの投稿数を設定
    const counts: {[key: string]: number} = {};
    adultCategories.forEach(category => {
      counts[category.id] = Math.floor(Math.random() * 50000) + 10000;
    });
    setPostCounts(counts);
  }, []);

  const renderCategoryGroup = (title: string, categories: any[], color: string) => {
    return (
      <div className="mb-12">
        <h2 className={`text-2xl font-bold mb-6 text-${color}-600 flex items-center gap-2`}>
          <Flame className="w-6 h-6" />
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(category => {
            const Icon = iconMap[category.id] || Heart;
            const isHovered = hoveredCategory === category.id;
            
            return (
              <Link
                key={category.id}
                href={`/board/category/${category.slug}`}
                className={`
                  relative overflow-hidden rounded-xl transition-all duration-300
                  ${isHovered ? 'transform -translate-y-1 shadow-2xl' : 'shadow-lg'}
                  bg-gradient-to-br ${category.bgGradient}
                `}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="p-6 text-white relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-3 rounded-lg bg-white/20 backdrop-blur-sm
                        ${isHovered ? 'animate-pulse' : ''}
                      `}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {category.emoji && (
                        <span className="text-2xl">{category.emoji}</span>
                      )}
                    </div>
                    {category.isSpecial && (
                      <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                        特別
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{category.name}</h3>
                  <p className="text-sm text-white/90 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {postCounts[category.id]?.toLocaleString() || '0'} 投稿
                    </span>
                    {category.ageRestricted && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        18+
                      </span>
                    )}
                  </div>
                </div>
                
                {/* ホバーエフェクト */}
                {isHovered && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 mb-12 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          🔥 全ジャンル掲示板
        </h1>
        <p className="text-lg text-pink-100">
          あらゆる性癖・欲望に対応！あなたの求める刺激がきっと見つかる
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-2xl font-bold">{adultCategories.length}</span>
            <span className="ml-2 text-sm">カテゴリー</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-2xl font-bold">
              {Object.values(postCounts).reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
            <span className="ml-2 text-sm">総投稿数</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-2xl font-bold">24時間</span>
            <span className="ml-2 text-sm">新着投稿</span>
          </div>
        </div>
      </div>

      {/* 人気カテゴリー */}
      <div className="mb-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-orange-600 flex items-center gap-2">
          <Crown className="w-6 h-6" />
          🔥 今週の人気カテゴリー
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['acquaintance-wife', 'masturbation', 'erotic-experience', 'massage', 'voice-erotica'].map(id => {
            const category = adultCategories.find(c => c.slug === id);
            if (!category) return null;
            
            return (
              <Link
                key={category.id}
                href={`/board/category/${category.slug}`}
                className="bg-white rounded-lg p-4 hover:shadow-md transition text-center"
              >
                <span className="text-2xl mb-2 block">{category.emoji}</span>
                <p className="text-sm font-medium text-gray-700">{category.name}</p>
                <p className="text-xs text-orange-500 mt-1">
                  🔥 {Math.floor(Math.random() * 5000 + 1000).toLocaleString()}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* カテゴリーグループ */}
      {renderCategoryGroup('メインカテゴリー', categoryGroups.main, 'red')}
      {renderCategoryGroup('体験・ジャンル別', categoryGroups.experience, 'purple')}
      {renderCategoryGroup('特殊カテゴリー', categoryGroups.special, 'pink')}
      {renderCategoryGroup('情報・創作系', categoryGroups.information, 'blue')}
      {renderCategoryGroup('実写・活動系', categoryGroups.community, 'green')}
      {renderCategoryGroup('SNS・ツール系', categoryGroups.tools, 'gray')}

      {/* 注意事項 */}
      <div className="mt-12 bg-gray-100 rounded-xl p-6">
        <h3 className="font-bold mb-2 text-red-600">⚠️ ご利用にあたっての注意</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 18歳未満の方のご利用は固くお断りします</li>
          <li>• 違法な内容の投稿は禁止されています</li>
          <li>• 個人情報の投稿にはご注意ください</li>
          <li>• お互いを尊重したコミュニケーションを心がけましょう</li>
        </ul>
      </div>
    </div>
  );
}