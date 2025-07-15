// 環境変数ローダー（lpプロジェクトのパターンを参考）

export class EnvLoader {
  private cache: Map<string, string> = new Map();

  constructor() {
    this.loadFromEnvironment();
  }

  private loadFromEnvironment() {
    // Next.jsの環境変数から読み込み
    if (typeof window !== 'undefined') {
      Object.keys(window).forEach(key => {
        if (key.startsWith('NEXT_PUBLIC_')) {
          this.cache.set(key.replace('NEXT_PUBLIC_', ''), (window as any)[key]);
        }
      });
    }

    // process.envからも読み込み（サーバーサイド）
    if (typeof process !== 'undefined' && process.env) {
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('NEXT_PUBLIC_')) {
          const value = process.env[key];
          if (value) {
            this.cache.set(key.replace('NEXT_PUBLIC_', ''), value);
          }
        }
      });
    }
  }

  get(key: string): string | undefined {
    // 優先順位: セッションストレージ → 環境変数 → ローカルストレージ
    if (typeof window !== 'undefined') {
      const sessionValue = sessionStorage.getItem(`TEMP_${key}`);
      if (sessionValue) return sessionValue;

      const localValue = localStorage.getItem(key);
      if (localValue) return localValue;
    }

    return this.cache.get(key);
  }

  set(key: string, value: string, temporary = true): void {
    if (typeof window !== 'undefined') {
      if (temporary) {
        sessionStorage.setItem(`TEMP_${key}`, value);
      } else {
        localStorage.setItem(key, value);
      }
    }
    this.cache.set(key, value);
  }

  remove(key: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`TEMP_${key}`);
      localStorage.removeItem(key);
    }
    this.cache.delete(key);
  }

  clear(): void {
    if (typeof window !== 'undefined') {
      // AI関連のキーのみクリア
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('TEMP_') && key.includes('_API_KEY')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      // ローカルストレージからもAI関連のキーをクリア
      const localKeysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('_API_KEY')) {
          localKeysToRemove.push(key);
        }
      }
      
      localKeysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    this.cache.clear();
    this.loadFromEnvironment();
  }
}

// シングルトンインスタンス
export const envLoader = new EnvLoader();