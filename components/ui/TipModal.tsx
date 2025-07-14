'use client';

import { useState } from 'react';
import { X, Heart, Coffee, Gift, Crown, Diamond } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientId: string;
  postId?: string;
  voicePostId?: string;
}

const tipAmounts = [
  { amount: 100, label: 'コーヒー', icon: Coffee, color: 'bg-amber-500' },
  { amount: 500, label: 'ランチ', icon: Heart, color: 'bg-pink-500' },
  { amount: 1000, label: 'ディナー', icon: Gift, color: 'bg-purple-500' },
  { amount: 3000, label: 'プレミアム', icon: Crown, color: 'bg-yellow-500' },
  { amount: 5000, label: 'ダイヤモンド', icon: Diamond, color: 'bg-blue-500' },
];

export default function TipModal({ 
  isOpen, 
  onClose, 
  recipientName, 
  recipientId,
  postId,
  voicePostId 
}: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSendTip = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    
    if (!amount || amount < 100) {
      toast.error('100円以上の金額を指定してください');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_user_id: recipientId,
          amount,
          message,
          post_id: postId,
          voice_post_id: voicePostId
        })
      });

      if (!response.ok) throw new Error('Failed to send tip');

      toast.success(`${recipientName}さんに¥${amount}の投げ銭を送りました！`);
      onClose();
    } catch (error) {
      toast.error('投げ銭の送信に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">投げ銭を送る</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {recipientName}さんを応援しよう！
          </p>
        </div>

        <div className="p-6">
          {/* 定額オプション */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {tipAmounts.map((tip) => {
              const Icon = tip.icon;
              return (
                <button
                  key={tip.amount}
                  onClick={() => {
                    setSelectedAmount(tip.amount);
                    setCustomAmount('');
                  }}
                  className={`p-4 rounded-xl border-2 transition ${
                    selectedAmount === tip.amount
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 ${tip.color} text-white rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="font-semibold">¥{tip.amount}</div>
                  <div className="text-xs text-gray-600">{tip.label}</div>
                </button>
              );
            })}
          </div>

          {/* カスタム金額 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              その他の金額
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="100"
                min="100"
                step="100"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">最小金額: ¥100</p>
          </div>

          {/* メッセージ */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メッセージ（任意）
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="応援しています！"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          {/* 合計金額表示 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">投げ銭金額</span>
              <span className="text-2xl font-bold text-pink-500">
                ¥{(selectedAmount || parseInt(customAmount) || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 送信ボタン */}
          <button
            onClick={handleSendTip}
            disabled={isProcessing || (!selectedAmount && !customAmount)}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              isProcessing || (!selectedAmount && !customAmount)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-pink-500 text-white hover:bg-pink-600'
            }`}
          >
            {isProcessing ? '処理中...' : '投げ銭を送る'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            投げ銭の30%は手数料として差し引かれます
          </p>
        </div>
      </div>
    </div>
  );
}