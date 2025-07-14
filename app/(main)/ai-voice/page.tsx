'use client';

import { useState } from 'react';
import { Mic, Sparkles, Play, Download, Loader, Volume2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const voiceStyles = [
  { id: 'sweet', name: '甘い声', description: '優しく甘い声質' },
  { id: 'sexy', name: 'セクシー', description: '大人の色気のある声' },
  { id: 'cute', name: 'かわいい', description: '明るく可愛らしい声' },
  { id: 'cool', name: 'クール', description: '落ち着いたクールな声' },
  { id: 'mature', name: '大人', description: '成熟した大人の女性の声' }
];

const scenarios = [
  { id: 'morning', name: 'おはよう', sample: 'おはよう。今日も一日頑張ってね。' },
  { id: 'night', name: 'おやすみ', sample: 'おやすみなさい。いい夢見てね。' },
  { id: 'praise', name: '褒める', sample: 'すごいね！よく頑張ったね。' },
  { id: 'comfort', name: '慰める', sample: '大丈夫だよ。私がそばにいるから。' },
  { id: 'flirt', name: '甘える', sample: 'もっと一緒にいたいな...' }
];

export default function AIVoicePage() {
  const [selectedStyle, setSelectedStyle] = useState('sweet');
  const [customText, setCustomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerate = async () => {
    if (!customText.trim()) {
      toast.error('テキストを入力してください');
      return;
    }

    if (customText.length > 200) {
      toast.error('200文字以内で入力してください');
      return;
    }

    setIsGenerating(true);
    
    try {
      // TODO: 実際のAI音声生成APIを実装
      // 現在はモックレスポンス
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // モック音声URL
      setGeneratedAudio('/mock-audio.mp3');
      toast.success('音声を生成しました！');
    } catch (error) {
      toast.error('音声生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScenarioClick = (scenario: typeof scenarios[0]) => {
    setCustomText(scenario.sample);
  };

  const handlePlay = () => {
    if (generatedAudio) {
      // TODO: 実際の音声再生処理
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  const handleDownload = () => {
    if (generatedAudio) {
      // TODO: 実際のダウンロード処理
      toast.success('ダウンロードを開始しました');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-full mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">AI音声生成</h1>
        <p className="text-gray-600">
          お好みの声質でカスタム音声を作成できます
        </p>
      </div>

      {/* 声質選択 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">声質を選択</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {voiceStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-3 rounded-lg border-2 transition ${
                selectedStyle === style.id
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{style.name}</div>
              <div className="text-xs text-gray-600 mt-1">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* シナリオ選択 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">シナリオから選ぶ</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioClick(scenario)}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left"
            >
              <div className="font-medium text-sm">{scenario.name}</div>
              <div className="text-xs text-gray-600 mt-1 line-clamp-2">{scenario.sample}</div>
            </button>
          ))}
        </div>
      </div>

      {/* テキスト入力 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">読み上げテキスト</h2>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="読み上げたいテキストを入力してください（200文字まで）"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          maxLength={200}
        />
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">
            {customText.length}/200文字
          </span>
          <button
            onClick={() => setCustomText('')}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            クリア
          </button>
        </div>
      </div>

      {/* 生成ボタン */}
      <div className="text-center mb-8">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !customText.trim()}
          className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition ${
            isGenerating || !customText.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              音声を生成
            </>
          )}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          ※ プレミアム会員は月10回まで無料
        </p>
      </div>

      {/* 生成結果 */}
      {generatedAudio && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">生成された音声</h3>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlay}
                  className={`p-3 rounded-full transition ${
                    isPlaying
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {isPlaying ? (
                    <Volume2 className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                <div>
                  <div className="font-medium">カスタム音声</div>
                  <div className="text-sm text-gray-600">
                    {voiceStyles.find(v => v.id === selectedStyle)?.name} • {customText.slice(0, 20)}...
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
              >
                <Download className="w-4 h-4" />
                ダウンロード
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>• 生成された音声は24時間後に自動削除されます</p>
            <p>• 商用利用には別途ライセンスが必要です</p>
          </div>
        </div>
      )}
    </div>
  );
}