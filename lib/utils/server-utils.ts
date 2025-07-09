import crypto from 'crypto'

/**
 * IPアドレスをハッシュ化（プライバシー保護）
 * サーバーサイドでのみ実行
 */
export function hashIPAddress(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex')
}