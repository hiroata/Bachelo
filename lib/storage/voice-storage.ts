import { createClient } from '@/lib/supabase/client'

// 許可される音声ファイルのMIMEタイプ
const ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/aac',
  'audio/m4a'
]

// ファイルサイズの上限（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024

export interface UploadVoiceFileOptions {
  file: File
  category: 'female' | 'male' | 'couple'
}

export interface UploadVoiceFileResult {
  url: string
  filePath: string
  fileSize: number
  mimeType: string
  duration?: number
}

/**
 * 音声ファイルの検証
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'ファイルサイズは10MB以下にしてください' }
  }

  // MIMEタイプチェック
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: '音声ファイル形式が無効です' }
  }

  return { valid: true }
}

/**
 * ユニークなファイル名を生成
 */
function generateUniqueFileName(originalName: string, category: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 10)
  const extension = originalName.split('.').pop() || 'mp3'
  return `${category}/${timestamp}_${randomStr}.${extension}`
}

/**
 * 音声ファイルをSupabase Storageにアップロード
 */
export async function uploadVoiceFile({
  file,
  category
}: UploadVoiceFileOptions): Promise<UploadVoiceFileResult> {
  const supabase = createClient()

  // ファイル検証
  const validation = validateAudioFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // ユニークなファイル名を生成
  const filePath = generateUniqueFileName(file.name, category)

  // Supabase Storageにアップロード
  const { data, error } = await supabase.storage
    .from('voice-posts')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`アップロードに失敗しました: ${error.message}`)
  }

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('voice-posts')
    .getPublicUrl(filePath)

  return {
    url: publicUrl,
    filePath: data.path,
    fileSize: file.size,
    mimeType: file.type
  }
}

/**
 * 音声ファイルを削除
 */
export async function deleteVoiceFile(filePath: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from('voice-posts')
    .remove([filePath])

  if (error) {
    throw new Error(`ファイルの削除に失敗しました: ${error.message}`)
  }
}

/**
 * 音声ファイルの長さを取得（ブラウザで実行）
 */
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const objectUrl = URL.createObjectURL(file)

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl)
      resolve(Math.round(audio.duration))
    })

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('音声ファイルの読み込みに失敗しました'))
    })

    audio.src = objectUrl
  })
}

/**
 * IPアドレスをハッシュ化（プライバシー保護）
 * サーバーサイドで実行する必要があるため、APIルートに移動
 */
export function hashIPAddress(ip: string): string {
  // クライアントサイドでは仮の実装
  // 実際のハッシュ化はサーバーサイドで実行
  return 'client-hash-' + btoa(ip)
}