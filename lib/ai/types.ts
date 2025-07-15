// AI サービスの型定義

export interface AIProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  keyPrefix?: string;
  endpoint?: string;
  models: AIModel[];
  isAvailable: boolean;
  requiresApiKey: boolean;
  isFree?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  contextWindow: number;
  isDefault?: boolean;
  capabilities?: string[];
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerateOptions {
  provider: string;
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
  signal?: AbortSignal;
}

export interface AIGenerateResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export interface ImageGenerateOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  sampler?: string;
  model?: string;
}

export interface ImageGenerateResponse {
  images: string[]; // Base64 encoded images
  info?: {
    seed: number;
    steps: number;
    cfgScale: number;
    sampler: string;
    model: string;
  };
  error?: string;
}

export interface APIConfiguration {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  isValid: boolean;
  lastValidated?: Date;
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public provider?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIServiceError';
  }

  static createAPIError(provider: string, status: number, message: string, details?: any) {
    const errorMessages: Record<number, string> = {
      401: 'APIキーが無効です。設定を確認してください。',
      403: 'アクセスが拒否されました。APIキーの権限を確認してください。',
      404: 'エンドポイントが見つかりません。',
      429: 'レート制限に達しました。しばらく待ってから再試行してください。',
      500: 'サーバーエラーが発生しました。',
      503: 'サービスが利用できません。',
    };

    return new AIServiceError(
      errorMessages[status] || message,
      `${provider}_API_ERROR`,
      status,
      provider,
      details
    );
  }
}