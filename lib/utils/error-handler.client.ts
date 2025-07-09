'use client'

import { toast } from 'react-hot-toast'
import { getErrorMessage } from './error-handler'

/**
 * エラーハンドリングユーティリティ (Client-side version with toast)
 */
export function handleError(error: unknown, showToast = true): void {
  const message = getErrorMessage(error)
  
  console.error('Client Error occurred:', error)
  
  if (showToast) {
    toast.error(message)
  }
}

export { getErrorMessage, AppError, createErrorResponse, ValidationErrors, type ErrorResponse, type ValidationError } from './error-handler'