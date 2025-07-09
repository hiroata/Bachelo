import crypto from 'crypto'

// 2ch互換のトリップ生成
export function generateTrip(key: string): string {
  // 簡易版実装（本来はDES-cryptベースだが、ここではSHA-1を使用）
  const salt = key.slice(0, 2).padEnd(2, 'H')
  const hash = crypto
    .createHash('sha1')
    .update(salt + key)
    .digest('base64')
    .replace(/[+/]/g, '.')
    .slice(0, 10)
  
  return `◆${hash}`
}

// 名前からトリップキーを抽出
export function extractTripKey(name: string): { name: string; tripKey?: string } {
  const tripIndex = name.indexOf('#')
  if (tripIndex === -1) {
    return { name }
  }
  
  return {
    name: name.slice(0, tripIndex),
    tripKey: name.slice(tripIndex + 1)
  }
}