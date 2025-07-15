import { z } from 'zod'

// 音声投稿のバリデーションスキーマ
export const voicePostSchema = z.object({
  category: z.enum(['female', 'male', 'couple'], {
    errorMap: () => ({ message: 'カテゴリーを選択してください' })
  }),
  nickname: z.string()
    .min(1, 'ニックネームを入力してください')
    .max(50, 'ニックネームは50文字以内で入力してください')
    .regex(/^[^<>'"]+$/, '使用できない文字が含まれています'),
  message: z.string()
    .min(1, 'メッセージを入力してください')
    .max(100, 'メッセージは100文字以内で入力してください')
    .regex(/^[^<>'"]+$/, '使用できない文字が含まれています'),
  audioFile: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, '音声ファイルは10MB以下にしてください')
    .refine((file) => file.type.startsWith('audio/'), '音声ファイルを選択してください')
})

export type VoicePostInput = z.infer<typeof voicePostSchema>

// コメント投稿のバリデーションスキーマ
export const commentSchema = z.object({
  nickname: z.string()
    .min(1, 'ニックネームを入力してください')
    .max(50, 'ニックネームは50文字以内で入力してください'),
  content: z.string()
    .min(1, 'コメントを入力してください')
    .max(200, 'コメントは200文字以内で入力してください')
})

export type CommentInput = z.infer<typeof commentSchema>

// バリデーションエラーメッセージをフォーマット
export function formatValidationErrors(errors: z.ZodError): string[] {
  return errors.errors.map(error => {
    const field = error.path.join('.')
    return `${field}: ${error.message}`
  })
}