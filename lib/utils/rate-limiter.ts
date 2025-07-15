interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.records.get(identifier);

    if (!record || now > record.resetTime) {
      this.records.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.records.entries());
    for (const [key, record] of entries) {
      if (now > record.resetTime) {
        this.records.delete(key);
      }
    }
  }
}

// グローバルインスタンス
export const postRateLimiter = new RateLimiter(5, 60000); // 1分間に5投稿まで
export const uploadRateLimiter = new RateLimiter(10, 300000); // 5分間に10ファイルまで

// 定期的なクリーンアップ
if (typeof window === 'undefined') {
  setInterval(() => {
    postRateLimiter.cleanup();
    uploadRateLimiter.cleanup();
  }, 60000);
}