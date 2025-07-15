import { toast } from 'react-hot-toast'

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export interface ErrorResponse {
  error: string
  code?: string
  details?: Record<string, unknown> | string | number | boolean | null
}

/**
 * ユーザーフレンドリーなエラーメッセージを返す
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    // Supabaseのエラーメッセージを処理
    if (error.message.includes('duplicate key')) {
      return 'すでに登録されています'
    }
    if (error.message.includes('violates foreign key')) {
      return '関連データが見つかりません'
    }
    if (error.message.includes('JWT')) {
      return 'セッションの有効期限が切れました。再度ログインしてください'
    }
    if (error.message.includes('Failed to fetch')) {
      return 'ネットワークエラーが発生しました。接続を確認してください'
    }
    
    return error.message
  }

  return '予期しないエラーが発生しました'
}

/**
 * エラーハンドリングユーティリティ
 */
export function handleError(error: unknown, showToast = true): void {
  const message = getErrorMessage(error)
  
  console.error('Error occurred:', error)
  
  if (showToast) {
    toast.error(message)
  }
}

/**
 * APIエラーレスポンスを生成
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage = 'エラーが発生しました'
): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code
    }
  }

  const message = getErrorMessage(error)
  
  return {
    error: message || defaultMessage
  }
}

/**
 * フォームバリデーションエラー
 */
export interface ValidationError {
  field: string
  message: string
}

export class ValidationErrors extends Error {
  constructor(public errors: ValidationError[]) {
    super('入力内容にエラーがあります')
    Object.setPrototypeOf(this, ValidationErrors.prototype)
  }
}

/**
 * 非同期処理のラッパー（エラーハンドリング付き）
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    handleError(errorMessage || error)
    return null
  }
}