'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Settings, Loader2, AlertCircle, X } from 'lucide-react';
import { AI_PROVIDERS, getAvailableProviders } from '@/lib/ai/providers';
import { aiService } from '@/lib/ai/unified-service';
import { apiConfigManager } from '@/lib/ai/api-configuration';
import { createImageOptions, ASPECT_RATIOS, SAMPLER_PRESETS } from '@/lib/ai/stable-diffusion-helper';
import { toast } from 'react-hot-toast';

interface AIAssistPanelProps {
  onTextGenerated: (text: string) => void;
  onImageGenerated: (images: File[]) => void;
  initialPrompt?: string;
  category?: string;
}

export default function AIAssistPanel({
  onTextGenerated,
  onImageGenerated,
  initialPrompt = '',
  category = ''
}: AIAssistPanelProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [textPrompt, setTextPrompt] = useState(initialPrompt);
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('grok');
  const [selectedModel, setSelectedModel] = useState('grok-3-mini');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  // 利用可能なプロバイダーをチェック
  useEffect(() => {
    const checkProviders = async () => {
      const available: string[] = [];
      
      for (const provider of getAvailableProviders()) {
        if (!provider.requiresApiKey) {
          available.push(provider.id);
        } else {
          const config = apiConfigManager.getConfiguration(provider.id);
          if (config?.apiKey) {
            const isValid = await apiConfigManager.validateApiKey(provider.id);
            if (isValid) {
              available.push(provider.id);
            }
          }
        }
      }
      
      setAvailableProviders(available);
      
      // デフォルトプロバイダーの設定
      if (!available.includes(selectedProvider) && available.length > 0) {
        setSelectedProvider(available[0]);
      }
    };
    
    checkProviders();
  }, [selectedProvider]);

  // カテゴリベースのプロンプトテンプレート
  const getPromptTemplate = (type: 'text' | 'image') => {
    const templates: Record<string, { text: string; image: string }> = {
      'セックス体験談': {
        text: '刺激的で官能的な体験談を書いてください。リアルな描写と感情を含めて。',
        image: 'セクシーな女性、誘惑的なポーズ'
      },
      'オナニー実況': {
        text: '今まさにオナニーしているような実況形式で、感じている快感を詳細に。',
        image: '自慰行為をする美しい女性'
      },
      'フェラチオテクニック': {
        text: 'フェラチオの具体的なテクニックと、男性を喜ばせる方法を詳しく。',
        image: 'フェラチオをする女性、舌を出す'
      },
      default: {
        text: 'エロティックで刺激的な内容を書いてください。',
        image: 'セクシーで魅力的な女性'
      }
    };
    
    const template = templates[category] || templates.default;
    return type === 'text' ? template.text : template.image;
  };

  // テキスト生成
  const generateText = async () => {
    if (!textPrompt.trim()) {
      toast.error('プロンプトを入力してください');
      return;
    }
    
    if (!availableProviders.includes(selectedProvider)) {
      toast.error('選択したプロバイダーは利用できません');
      setShowSettings(true);
      return;
    }
    
    setLoading(true);
    try {
      const systemPrompt = `あなたはアダルト掲示板の投稿を作成するアシスタントです。
以下の指示に従って、エロティックで刺激的な内容を生成してください：
- 官能的で具体的な描写を含める
- 読者が興奮するような内容にする
- 日本語で自然な文章を書く
- ${category ? `カテゴリ「${category}」に適した内容にする` : ''}`;

      const response = await aiService.generateText({
        provider: selectedProvider,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: textPrompt }
        ],
        temperature: 0.8,
        maxTokens: 1000
      });
      
      if (response.content) {
        onTextGenerated(response.content);
        toast.success('テキストを生成しました');
      }
    } catch (error) {
      console.error('Text generation error:', error);
      toast.error('テキスト生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 画像生成
  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('画像の説明を入力してください');
      return;
    }
    
    const sdAvailable = availableProviders.includes('stable-diffusion');
    if (!sdAvailable) {
      toast.error('Stable Diffusion WebUIが起動していません');
      return;
    }
    
    setLoading(true);
    try {
      const options = createImageOptions(
        imagePrompt,
        'quality',
        'portrait',
        'portrait'
      );
      
      const response = await aiService.generateImage(options);
      
      if (response.images && response.images.length > 0) {
        const files = response.images.map((base64, index) => {
          const blob = base64ToBlob(base64);
          return new File([blob], `ai-generated-${Date.now()}-${index}.png`, {
            type: 'image/png'
          });
        });
        
        onImageGenerated(files);
        toast.success('画像を生成しました');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('画像生成に失敗しました。Automatic1111が起動していることを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  // Base64をBlobに変換
  const base64ToBlob = (base64: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  };

  // APIキー保存
  const saveApiKey = async (providerId: string, apiKey: string) => {
    apiConfigManager.setApiKey(providerId, apiKey);
    const isValid = await apiConfigManager.validateApiKey(providerId, apiKey);
    
    if (isValid) {
      toast.success('APIキーを保存しました');
      const available = [...availableProviders];
      if (!available.includes(providerId)) {
        available.push(providerId);
        setAvailableProviders(available);
      }
    } else {
      toast.error('APIキーが無効です');
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AIアシスト
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-200 rounded-lg transition"
          title="API設定"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">API設定</h4>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {AI_PROVIDERS.filter(p => p.requiresApiKey).map(provider => (
            <div key={provider.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {provider.name} APIキー
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder={`${provider.keyPrefix || ''}...`}
                  value={apiKeys[provider.id] || ''}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    [provider.id]: e.target.value
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <button
                  onClick={() => saveApiKey(provider.id, apiKeys[provider.id] || '')}
                  className="px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition text-sm"
                >
                  保存
                </button>
              </div>
              {provider.isFree && (
                <p className="text-xs text-green-600">✨ 無料で利用可能</p>
              )}
            </div>
          ))}
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Groq: <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">APIキー取得</a></p>
            <p>• OpenRouter: <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">APIキー取得</a></p>
            <p>• Cohere: <a href="https://dashboard.cohere.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">APIキー取得</a></p>
          </div>
        </div>
      )}

      {/* タブ切り替え */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2 px-4 rounded-lg transition ${
            activeTab === 'text'
              ? 'bg-purple-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          テキスト生成
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-2 px-4 rounded-lg transition ${
            activeTab === 'image'
              ? 'bg-purple-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ImageIcon className="w-4 h-4 inline mr-1" />
          画像生成
        </button>
      </div>

      {activeTab === 'text' && (
        <div className="space-y-3">
          {availableProviders.length > 1 && (
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            >
              {availableProviders.map(providerId => {
                const provider = AI_PROVIDERS.find(p => p.id === providerId);
                if (!provider) return null;
                return (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} {provider.isFree ? '(無料)' : ''}
                  </option>
                );
              })}
            </select>
          )}
          
          <textarea
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            placeholder={getPromptTemplate('text')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            disabled={loading}
          />
          
          <button
            onClick={generateText}
            disabled={loading || availableProviders.length === 0}
            className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                テキストを生成
              </>
            )}
          </button>
          
          {availableProviders.length === 0 && (
            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>APIキーが設定されていません。設定アイコンをクリックして設定してください。</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'image' && (
        <div className="space-y-3">
          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder={getPromptTemplate('image')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            disabled={loading}
          />
          
          <button
            onClick={generateImage}
            disabled={loading || !availableProviders.includes('stable-diffusion')}
            className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                画像を生成
              </>
            )}
          </button>
          
          {!availableProviders.includes('stable-diffusion') && (
            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>Stable Diffusion WebUIが起動していません。</p>
                <p className="text-xs mt-1">D:\AI\Programs\stable-diffusion-webui\webui-user.bat を実行してください。</p>
                <p className="text-xs">※ --api オプションが必要です</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}