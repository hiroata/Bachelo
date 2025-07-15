'use client';

import { useState } from 'react';
import { Check, Crown, Zap, Download, HeartHandshake, Star } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    id: 'free',
    name: '無料プラン',
    price: 0,
    duration: '永久',
    features: [
      '基本的な掲示板機能',
      '音声投稿の視聴',
      '月5回までダウンロード',
      '広告表示あり'
    ],
    limitations: [
      'カスタムボイスリクエスト不可',
      '優先サポートなし',
      '限定コンテンツ閲覧不可'
    ],
    color: 'gray',
    icon: Star
  },
  {
    id: 'light',
    name: 'ライトプラン',
    price: 980,
    duration: '月額',
    features: [
      '広告非表示',
      '月10回までダウンロード',
      '優先表示',
      'カスタムボイス1回/月'
    ],
    limitations: [
      '優先サポートなし',
      '限定コンテンツ一部のみ'
    ],
    color: 'blue',
    icon: Zap,
    popular: false
  },
  {
    id: 'standard',
    name: 'スタンダードプラン',
    price: 1980,
    duration: '月額',
    features: [
      '広告非表示',
      '無制限ダウンロード',
      'カスタムボイス3回/月',
      '優先サポート',
      '限定コンテンツ閲覧'
    ],
    limitations: [],
    color: 'pink',
    icon: Crown,
    popular: true
  },
  {
    id: 'premium',
    name: 'プレミアムプラン',
    price: 2980,
    duration: '月額',
    features: [
      '全機能利用可能',
      'カスタムボイス10回/月',
      '専用サポート',
      '限定コンテンツ完全アクセス',
      'クリエイター分析機能',
      '早期アクセス権'
    ],
    limitations: [],
    color: 'purple',
    icon: HeartHandshake
  }
];

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);
    setSelectedPlan(planId);
    
    // TODO: Stripe決済処理を実装
    setTimeout(() => {
      alert(`${plans.find(p => p.id === planId)?.name}への登録処理を開始します`);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* ヘッダー */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">プレミアムプランで<span className="text-pink-500">もっと楽しく</span></h1>
        <p className="text-lg text-gray-600">
          Bacheloプレミアムで、限定コンテンツやカスタムボイスをお楽しみください
        </p>
      </div>

      {/* プラン一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:scale-105 ${
                plan.popular 
                  ? 'border-pink-500 shadow-pink-100' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  おすすめ
                </div>
              )}
              
              <div className="p-6">
                <div className={`w-12 h-12 bg-${plan.color}-100 text-${plan.color}-600 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold">¥{plan.price.toLocaleString()}</span>
                  <span className="text-gray-600 ml-1">/{plan.duration}</span>
                </div>
                
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-start gap-2 opacity-60">
                      <span className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5">✕</span>
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing || plan.id === 'free'}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.id === 'free'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {plan.id === 'free' ? '現在のプラン' : '今すぐ始める'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 特典説明 */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">プレミアム会員限定特典</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8" />
            </div>
            <h3 className="font-bold mb-2">無制限ダウンロード</h3>
            <p className="text-sm text-gray-600">
              お気に入りの音声を何度でもダウンロード可能
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="font-bold mb-2">カスタムボイス</h3>
            <p className="text-sm text-gray-600">
              好きなクリエイターに直接リクエスト
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8" />
            </div>
            <h3 className="font-bold mb-2">限定コンテンツ</h3>
            <p className="text-sm text-gray-600">
              プレミアム会員だけの特別な音声
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold mb-6">よくある質問</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Q. 途中でプランを変更できますか？</h3>
            <p className="text-gray-600">A. はい、いつでもアップグレードまたはダウングレードが可能です。</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Q. 解約はいつでもできますか？</h3>
            <p className="text-gray-600">A. はい、いつでも解約可能です。次回更新日まではサービスをご利用いただけます。</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Q. 支払い方法は？</h3>
            <p className="text-gray-600">A. クレジットカード、デビットカード、銀行振込に対応しています。</p>
          </div>
        </div>
      </div>
    </div>
  );
}