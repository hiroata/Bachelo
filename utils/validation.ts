// バリデーション関数
export function validateThreadTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return 'スレッドタイトルを入力してください'
  }
  if (title.length > 255) {
    return 'スレッドタイトルは255文字以内で入力してください'
  }
  return null
}

export function validatePostBody(body: string): string | null {
  if (!body || body.trim().length === 0) {
    return '本文を入力してください'
  }
  if (body.length > 10000) {
    return '本文は10000文字以内で入力してください'
  }
  return null
}

export function validateName(name: string | undefined): string | null {
  if (name && name.length > 100) {
    return '名前は100文字以内で入力してください'
  }
  return null
}

export function validateEmail(email: string | undefined): string | null {
  if (email && email.length > 100) {
    return 'E-mailは100文字以内で入力してください'
  }
  return null
}

// sage判定
export function isSage(email: string | undefined | null): boolean {
  if (!email) return false
  const normalized = email.toLowerCase().trim()
  return normalized === 'sage' || normalized === 'ｓａｇｅ' // 半角・全角対応
}