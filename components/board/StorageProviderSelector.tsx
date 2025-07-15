'use client';

import { useState } from 'react';
import { Cloud, Database, HardDrive } from 'lucide-react';

export type StorageProvider = 'supabase' | 'local' | 'both';

interface StorageProviderSelectorProps {
  value: StorageProvider;
  onChange: (provider: StorageProvider) => void;
}

export default function StorageProviderSelector({
  value,
  onChange,
}: StorageProviderSelectorProps) {
  const options = [
    {
      value: 'supabase' as StorageProvider,
      label: 'Supabase Storage',
      description: 'クラウドストレージ（推奨）',
      icon: <Cloud className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      value: 'local' as StorageProvider,
      label: 'Local Storage',
      description: 'ローカルファイルシステム',
      icon: <HardDrive className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      value: 'both' as StorageProvider,
      label: 'Dual Storage',
      description: '両方に保存（バックアップ）',
      icon: <Database className="w-4 h-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-2">
        画像の保存先を選択してください
      </div>
      
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all
            ${value === option.value 
              ? `${option.borderColor} ${option.bgColor}` 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <input
            type="radio"
            name="storage-provider"
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value as StorageProvider)}
            className="mt-1"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={option.color}>
                {option.icon}
              </span>
              <span className="font-medium text-gray-900">
                {option.label}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {option.description}
            </div>
            
            {/* 追加の説明 */}
            {option.value === 'supabase' && (
              <div className="text-xs text-gray-500 mt-1">
                • 高い可用性とCDN配信
                • 自動バックアップ
                • スケーラブル
              </div>
            )}
            
            {option.value === 'local' && (
              <div className="text-xs text-gray-500 mt-1">
                • 高速アクセス
                • ローカル保存
                • 開発環境向け
              </div>
            )}
            
            {option.value === 'both' && (
              <div className="text-xs text-gray-500 mt-1">
                • 冗長性の確保
                • フォールバック対応
                • 最高の信頼性
              </div>
            )}
          </div>
        </label>
      ))}
      
      {/* 現在の選択の要約 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-1">
          選択中: {options.find(o => o.value === value)?.label}
        </div>
        <div className="text-xs text-gray-600">
          {value === 'supabase' && 'クラウドストレージにのみ保存されます'}
          {value === 'local' && 'ローカルファイルシステムにのみ保存されます'}
          {value === 'both' && 'クラウドとローカルの両方に保存されます'}
        </div>
      </div>
    </div>
  );
}