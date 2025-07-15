/**
 * Supabase専用のエラーハンドリングユーティリティ
 * Supabaseのエラーをわかりやすいメッセージに変換します
 */

import { PostgrestError } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Supabaseエラーの種類
 */
export enum SupabaseErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  INVALID_UUID = 'INVALID_UUID',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * カスタムエラークラス
 */
export class SupabaseError extends Error {
  constructor(
    public type: SupabaseErrorType,
    public message: string,
    public originalError?: PostgrestError | Error | unknown,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

/**
 * Supabaseのエラーコードを判定してわかりやすいエラーに変換
 */
export function parseSupabaseError(error: PostgrestError | Error): SupabaseError {
  // PostgrestErrorの場合
  if ('code' in error && 'message' in error) {
    const pgError = error as PostgrestError;
    
    switch (pgError.code) {
      case '42501':
        return new SupabaseError(
          SupabaseErrorType.PERMISSION_DENIED,
          'アクセス権限がありません。ログインが必要な可能性があります。',
          error,
          403
        );
        
      case '23505':
        return new SupabaseError(
          SupabaseErrorType.DUPLICATE_KEY,
          'すでに同じデータが存在します。',
          error,
          409
        );
        
      case '23503':
        return new SupabaseError(
          SupabaseErrorType.FOREIGN_KEY_VIOLATION,
          '関連するデータが見つかりません。',
          error,
          400
        );
        
      case '22P02':
        return new SupabaseError(
          SupabaseErrorType.INVALID_UUID,
          '不正なID形式です。',
          error,
          400
        );
        
      case 'PGRST116':
        return new SupabaseError(
          SupabaseErrorType.NOT_FOUND,
          'データが見つかりません。',
          error,
          404
        );
        
      default:
        // その他のPostgreSQLエラー
        if (pgError.message.includes('rate limit')) {
          return new SupabaseError(
            SupabaseErrorType.RATE_LIMIT,
            'リクエストが多すぎます。しばらく待ってから再試行してください。',
            error,
            429
          );
        }
    }
  }
  
  // 一般的なエラーメッセージのパターンマッチング
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('fetch failed') || errorMessage.includes('network')) {
    return new SupabaseError(
      SupabaseErrorType.CONNECTION_ERROR,
      'サーバーへの接続に失敗しました。ネットワーク接続を確認してください。',
      error,
      503
    );
  }
  
  if (errorMessage.includes('not found')) {
    return new SupabaseError(
      SupabaseErrorType.NOT_FOUND,
      'データが見つかりません。',
      error,
      404
    );
  }
  
  // 不明なエラー
  return new SupabaseError(
    SupabaseErrorType.UNKNOWN,
    'エラーが発生しました。しばらく待ってから再試行してください。',
    error,
    500
  );
}

/**
 * APIルートでのエラーハンドリング
 */
export function handleSupabaseError(error: PostgrestError | Error | unknown): NextResponse {
  const supabaseError = parseSupabaseError(error as PostgrestError | Error);
  
  // 開発環境では詳細なエラー情報を含める
  const isDev = process.env.NODE_ENV === 'development';
  
  return NextResponse.json(
    {
      error: {
        type: supabaseError.type,
        message: supabaseError.message,
        ...(isDev && {
          details: supabaseError.originalError,
          stack: supabaseError.stack
        })
      }
    },
    { status: supabaseError.statusCode }
  );
}

/**
 * try-catchブロックを簡潔に書くためのラッパー
 */
export async function withSupabaseErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    onError?: (error: SupabaseError) => void;
    defaultValue?: T;
  } = {}
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    const supabaseError = parseSupabaseError(error as Error);
    
    if (options.onError) {
      options.onError(supabaseError);
    } else {
      console.error('Supabaseエラー:', {
        type: supabaseError.type,
        message: supabaseError.message,
        originalError: supabaseError.originalError
      });
    }
    
    return options.defaultValue;
  }
}

/**
 * フロントエンド用のエラーメッセージ取得
 */
export function getErrorMessage(error: SupabaseError | Error | unknown): string {
  if (error instanceof SupabaseError) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'error' in error && 
      typeof error.error === 'object' && error.error && 'message' in error.error) {
    return (error.error as { message: string }).message;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  
  return 'エラーが発生しました。';
}

/**
 * エラーのトースト表示用ヘルパー
 */
export function getToastMessage(error: SupabaseError | Error | unknown): {
  title: string;
  description: string;
  type: 'error' | 'warning';
} {
  const supabaseError = error instanceof SupabaseError 
    ? error 
    : parseSupabaseError(error as Error);
  
  switch (supabaseError.type) {
    case SupabaseErrorType.PERMISSION_DENIED:
      return {
        title: 'アクセス拒否',
        description: supabaseError.message,
        type: 'error'
      };
      
    case SupabaseErrorType.RATE_LIMIT:
      return {
        title: 'リクエスト制限',
        description: supabaseError.message,
        type: 'warning'
      };
      
    case SupabaseErrorType.NOT_FOUND:
      return {
        title: 'データなし',
        description: supabaseError.message,
        type: 'warning'
      };
      
    default:
      return {
        title: 'エラー',
        description: supabaseError.message,
        type: 'error'
      };
  }
}