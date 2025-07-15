// 統合AIサービス

import {
  AIGenerateOptions,
  AIGenerateResponse,
  AIServiceError,
  ImageGenerateOptions,
  ImageGenerateResponse
} from './types';
import { getProvider } from './providers';
import { apiConfigManager } from './api-configuration';

export class UnifiedAIService {
  private abortControllers: Map<string, AbortController> = new Map();

  async generateText(options: AIGenerateOptions): Promise<AIGenerateResponse> {
    const provider = getProvider(options.provider);
    if (!provider) {
      throw new AIServiceError('プロバイダーが見つかりません', 'PROVIDER_NOT_FOUND');
    }

    const config = apiConfigManager.getConfiguration(options.provider);
    if (!config && provider.requiresApiKey) {
      throw new AIServiceError('APIキーが設定されていません', 'API_KEY_MISSING');
    }

    // 既存のリクエストをキャンセル
    const requestId = `${options.provider}-${Date.now()}`;
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      switch (options.provider) {
        case 'grok':
          return await this.generateWithGrok(options, config?.apiKey || '', abortController.signal);
        case 'groq':
          return await this.generateWithGroq(options, config?.apiKey || '', abortController.signal);
        case 'openrouter':
          return await this.generateWithOpenRouter(options, config?.apiKey || '', abortController.signal);
        case 'cohere':
          return await this.generateWithCohere(options, config?.apiKey || '', abortController.signal);
        default:
          throw new AIServiceError('未対応のプロバイダーです', 'UNSUPPORTED_PROVIDER');
      }
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  async generateImage(options: ImageGenerateOptions): Promise<ImageGenerateResponse> {
    const config = apiConfigManager.getConfiguration('stable-diffusion');
    const baseUrl = config?.baseUrl || 'http://127.0.0.1:7860';

    try {
      const response = await fetch(`${baseUrl}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: options.prompt,
          negative_prompt: options.negativePrompt || '',
          steps: options.steps || 20,
          cfg_scale: options.cfgScale || 7,
          width: options.width || 512,
          height: options.height || 512,
          seed: options.seed || -1,
          sampler_name: options.sampler || 'Euler a',
          override_settings: {
            sd_model_checkpoint: options.model
          }
        })
      });

      if (!response.ok) {
        throw AIServiceError.createAPIError('stable-diffusion', response.status, 'Image generation failed');
      }

      const data = await response.json();
      return {
        images: data.images || [],
        info: data.info ? JSON.parse(data.info) : undefined
      };
    } catch (error) {
      if (error instanceof AIServiceError) throw error;
      
      throw new AIServiceError(
        'Stable Diffusion WebUIに接続できません。Automatic1111が起動していることを確認してください。',
        'CONNECTION_ERROR',
        undefined,
        'stable-diffusion'
      );
    }
  }

  private async generateWithGrok(
    options: AIGenerateOptions,
    apiKey: string,
    signal: AbortSignal
  ): Promise<AIGenerateResponse> {
    const provider = getProvider('grok')!;
    const response = await fetch(provider.endpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || provider.models[0].id,
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
        stream: options.stream || false
      }),
      signal
    });

    if (!response.ok) {
      throw AIServiceError.createAPIError('grok', response.status, await response.text());
    }

    if (options.stream && response.body) {
      return await this.handleStreamingResponse(response, options);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }

  private async generateWithGroq(
    options: AIGenerateOptions,
    apiKey: string,
    signal: AbortSignal
  ): Promise<AIGenerateResponse> {
    const provider = getProvider('groq')!;
    const response = await fetch(provider.endpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || provider.models[0].id,
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
        stream: options.stream || false
      }),
      signal
    });

    if (!response.ok) {
      throw AIServiceError.createAPIError('groq', response.status, await response.text());
    }

    if (options.stream && response.body) {
      return await this.handleStreamingResponse(response, options);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }

  private async generateWithOpenRouter(
    options: AIGenerateOptions,
    apiKey: string,
    signal: AbortSignal
  ): Promise<AIGenerateResponse> {
    const provider = getProvider('openrouter')!;
    const response = await fetch(provider.endpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Bachelo BBS'
      },
      body: JSON.stringify({
        model: options.model || provider.models[0].id,
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
        stream: options.stream || false
      }),
      signal
    });

    if (!response.ok) {
      throw AIServiceError.createAPIError('openrouter', response.status, await response.text());
    }

    if (options.stream && response.body) {
      return await this.handleStreamingResponse(response, options);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }

  private async generateWithCohere(
    options: AIGenerateOptions,
    apiKey: string,
    signal: AbortSignal
  ): Promise<AIGenerateResponse> {
    const provider = getProvider('cohere')!;
    
    // Cohereのメッセージ形式に変換
    const message = options.messages[options.messages.length - 1].content;
    const chatHistory = options.messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: msg.content
    }));

    const response = await fetch(provider.endpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || provider.models[0].id,
        message: message,
        chat_history: chatHistory,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
        stream: options.stream || false
      }),
      signal
    });

    if (!response.ok) {
      throw AIServiceError.createAPIError('cohere', response.status, await response.text());
    }

    if (options.stream && response.body) {
      return await this.handleCohereStreamingResponse(response, options);
    }

    const data = await response.json();
    return {
      content: data.text,
      usage: {
        promptTokens: data.meta?.tokens?.input_tokens || 0,
        completionTokens: data.meta?.tokens?.output_tokens || 0,
        totalTokens: (data.meta?.tokens?.input_tokens || 0) + (data.meta?.tokens?.output_tokens || 0)
      }
    };
  }

  private async handleStreamingResponse(
    response: Response,
    options: AIGenerateOptions
  ): Promise<AIGenerateResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let content = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0].delta.content || '';
              content += delta;
              
              if (options.onChunk) {
                options.onChunk(delta);
              }
            } catch (e) {
              // パースエラーは無視
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { content };
  }

  private async handleCohereStreamingResponse(
    response: Response,
    options: AIGenerateOptions
  ): Promise<AIGenerateResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let content = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.event_type === 'text-generation') {
                const text = parsed.text || '';
                content += text;
                
                if (options.onChunk) {
                  options.onChunk(text);
                }
              }
            } catch (e) {
              // パースエラーは無視
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { content };
  }

  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }
}

// シングルトンインスタンス
export const aiService = new UnifiedAIService();