// AIプロバイダーの定義

import { AIProvider } from './types';

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'grok',
    name: 'Grok 3 (X.AI)',
    icon: '🤖',
    description: '最新のGrok 3 miniモデル。高速で効率的な推論が可能。',
    keyPrefix: 'xai-',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    requiresApiKey: true,
    isAvailable: true,
    models: [
      {
        id: 'grok-3-mini',
        name: 'Grok 3 Mini',
        description: '高速・効率的なGrok 3の軽量版',
        maxTokens: 131072,
        contextWindow: 131072,
        isDefault: true,
        capabilities: ['text-generation', 'code', 'creative-writing', 'analysis']
      }
    ]
  },
  {
    id: 'groq',
    name: 'Groq (無料)',
    icon: '⚡',
    description: '高速な推論エンジン。Llama 3やMixtralなどのオープンモデルを利用可能。',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    requiresApiKey: true,
    isAvailable: true,
    isFree: true,
    models: [
      {
        id: 'llama-3.1-70b-versatile',
        name: 'Llama 3.1 70B',
        description: 'Meta Llama 3.1の70Bモデル',
        maxTokens: 8000,
        contextWindow: 32768,
        isDefault: true,
        capabilities: ['text-generation', 'code', 'analysis']
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        description: 'Mistral AIのMoEモデル',
        maxTokens: 32768,
        contextWindow: 32768,
        capabilities: ['text-generation', 'code']
      },
      {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B',
        description: 'GoogleのGemma 2モデル',
        maxTokens: 8192,
        contextWindow: 8192,
        capabilities: ['text-generation', 'conversation']
      }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (無料枠あり)',
    icon: '🌐',
    description: '複数のAIモデルにアクセス可能。一部モデルは無料で利用可能。',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    requiresApiKey: true,
    isAvailable: true,
    isFree: true,
    models: [
      {
        id: 'google/gemma-2-9b-it:free',
        name: 'Gemma 2 9B (無料)',
        description: 'Google Gemma 2の無料版',
        maxTokens: 8192,
        contextWindow: 8192,
        isDefault: true,
        capabilities: ['text-generation']
      },
      {
        id: 'meta-llama/llama-3.2-3b-instruct:free',
        name: 'Llama 3.2 3B (無料)',
        description: 'Meta Llama 3.2の軽量版',
        maxTokens: 8192,
        contextWindow: 8192,
        capabilities: ['text-generation']
      },
      {
        id: 'microsoft/phi-3-mini-128k-instruct:free',
        name: 'Phi-3 Mini (無料)',
        description: 'Microsoftの小型モデル',
        maxTokens: 4096,
        contextWindow: 128000,
        capabilities: ['text-generation', 'code']
      }
    ]
  },
  {
    id: 'cohere',
    name: 'Cohere (無料枠あり)',
    icon: '🔷',
    description: 'Command Rモデル。トライアルAPIキーで利用可能。',
    endpoint: 'https://api.cohere.ai/v1/chat',
    requiresApiKey: true,
    isAvailable: true,
    isFree: true,
    models: [
      {
        id: 'command-r',
        name: 'Command R',
        description: 'Cohereの最新モデル',
        maxTokens: 4096,
        contextWindow: 128000,
        isDefault: true,
        capabilities: ['text-generation', 'rag', 'tool-use']
      },
      {
        id: 'command-r-plus',
        name: 'Command R+',
        description: '高性能版Command R',
        maxTokens: 4096,
        contextWindow: 128000,
        capabilities: ['text-generation', 'rag', 'tool-use', 'analysis']
      }
    ]
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    icon: '🎨',
    description: 'ローカルのAutomatic1111 WebUIを使用した画像生成',
    endpoint: 'http://127.0.0.1:7860',
    requiresApiKey: false,
    isAvailable: true,
    isFree: true,
    models: [
      {
        id: 'sd-default',
        name: 'デフォルトモデル',
        description: 'WebUIで設定されているモデル',
        maxTokens: 0,
        contextWindow: 0,
        isDefault: true,
        capabilities: ['image-generation']
      }
    ]
  }
];

export function getProvider(providerId: string): AIProvider | undefined {
  return AI_PROVIDERS.find(p => p.id === providerId);
}

export function getFreeProviders(): AIProvider[] {
  return AI_PROVIDERS.filter(p => p.isFree);
}

export function getAvailableProviders(): AIProvider[] {
  return AI_PROVIDERS.filter(p => p.isAvailable);
}