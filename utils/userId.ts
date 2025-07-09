import crypto from 'crypto'

// IPアドレスと日付からユーザーIDを生成
export function generateUserId(ipAddress: string, date: Date = new Date()): string {
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
  const seed = `${ipAddress}_${dateStr}`
  
  const hash = crypto
    .createHash('sha256')
    .update(seed)
    .digest('base64')
    .replace(/[+/=]/g, '') // URLセーフな文字のみ
    .slice(0, 8)
  
  return `ID:${hash}`
}