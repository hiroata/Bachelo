// APIキー管理システム

import { envLoader } from './env-loader';
import { getProvider } from './providers';
import { APIConfiguration } from './types';

export class ApiConfigurationManager {
  private configurations: Map<string, APIConfiguration> = new Map();
  
  constructor() {
    this.loadConfigurations();
  }

  private loadConfigurations(): void {
    const providers = ['grok', 'groq', 'openrouter', 'cohere'];
    
    providers.forEach(providerId => {
      const apiKey = this.getApiKey(providerId);
      if (apiKey) {
        this.configurations.set(providerId, {
          provider: providerId,
          apiKey,
          isValid: false,
          baseUrl: this.getBaseUrl(providerId)
        });
      }
    });

    // Stable Diffusionは特別扱い（APIキー不要）
    this.configurations.set('stable-diffusion', {
      provider: 'stable-diffusion',
      apiKey: '',
      baseUrl: envLoader.get('STABLE_DIFFUSION_URL') || 'http://127.0.0.1:7860',
      isValid: false
    });
  }

  getApiKey(providerId: string): string | undefined {
    const provider = getProvider(providerId);
    if (!provider) return undefined;

    const keyName = `${providerId.toUpperCase()}_API_KEY`;
    return envLoader.get(keyName);
  }

  getBaseUrl(providerId: string): string | undefined {
    const urlName = `${providerId.toUpperCase()}_BASE_URL`;
    return envLoader.get(urlName);
  }

  setApiKey(providerId: string, apiKey: string, temporary = true): void {
    const provider = getProvider(providerId);
    if (!provider) return;

    const keyName = `${providerId.toUpperCase()}_API_KEY`;
    envLoader.set(keyName, apiKey, temporary);

    this.configurations.set(providerId, {
      provider: providerId,
      apiKey,
      isValid: false,
      baseUrl: this.getBaseUrl(providerId)
    });
  }

  setBaseUrl(providerId: string, baseUrl: string, temporary = true): void {
    const urlName = `${providerId.toUpperCase()}_BASE_URL`;
    envLoader.set(urlName, baseUrl, temporary);

    const config = this.configurations.get(providerId);
    if (config) {
      config.baseUrl = baseUrl;
    }
  }

  removeApiKey(providerId: string): void {
    const keyName = `${providerId.toUpperCase()}_API_KEY`;
    envLoader.remove(keyName);
    this.configurations.delete(providerId);
  }

  getConfiguration(providerId: string): APIConfiguration | undefined {
    return this.configurations.get(providerId);
  }

  async validateApiKey(providerId: string, apiKey?: string): Promise<boolean> {
    const provider = getProvider(providerId);
    if (!provider) return false;

    const keyToValidate = apiKey || this.getApiKey(providerId);
    if (!keyToValidate && provider.requiresApiKey) return false;

    // APIキーの形式チェック
    if (provider.keyPrefix && keyToValidate && !keyToValidate.startsWith(provider.keyPrefix)) {
      return false;
    }

    // 実際のAPI呼び出しによる検証
    try {
      const response = await this.testConnection(providerId, keyToValidate);
      
      const config = this.configurations.get(providerId) || {
        provider: providerId,
        apiKey: keyToValidate || '',
        isValid: false
      };
      
      config.isValid = response;
      config.lastValidated = new Date();
      this.configurations.set(providerId, config);
      
      return response;
    } catch (error) {
      return false;
    }
  }

  private async testConnection(providerId: string, apiKey?: string): Promise<boolean> {
    const provider = getProvider(providerId);
    if (!provider) return false;

    try {
      switch (providerId) {
        case 'stable-diffusion':
          // Stable Diffusionの接続テスト
          const baseUrl = this.getBaseUrl(providerId) || provider.endpoint;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const response = await fetch(`${baseUrl}/sdapi/v1/options`, {
            method: 'GET',
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId));
          return response.ok;

        case 'grok':
        case 'groq':
        case 'openrouter':
          // ChatCompletion互換APIのテスト
          const endpoint = provider.endpoint;
          if (!endpoint) return false;
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
          }
          
          if (providerId === 'openrouter') {
            headers['HTTP-Referer'] = window.location.origin;
            headers['X-Title'] = 'Bachelo BBS';
          }
          
          const controller2 = new AbortController();
          const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
          const testResponse = await fetch(endpoint.replace('/chat/completions', '/models'), {
            method: 'GET',
            headers,
            signal: controller2.signal
          }).finally(() => clearTimeout(timeoutId2));
          
          return testResponse.ok;

        case 'cohere':
          // Cohere APIのテスト
          if (!apiKey) return false;
          
          const controller3 = new AbortController();
          const timeoutId3 = setTimeout(() => controller3.abort(), 5000);
          const cohereResponse = await fetch('https://api.cohere.ai/v1/check-api-key', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'application/json'
            },
            signal: controller3.signal
          }).finally(() => clearTimeout(timeoutId3));
          
          return cohereResponse.ok;

        default:
          return false;
      }
    } catch (error) {
      console.error(`Connection test failed for ${providerId}:`, error);
      return false;
    }
  }

  getAllConfigurations(): APIConfiguration[] {
    return Array.from(this.configurations.values());
  }

  getValidConfigurations(): APIConfiguration[] {
    return this.getAllConfigurations().filter(config => config.isValid);
  }

  clearAll(): void {
    envLoader.clear();
    this.configurations.clear();
    this.loadConfigurations();
  }
}

// シングルトンインスタンス
export const apiConfigManager = new ApiConfigurationManager();