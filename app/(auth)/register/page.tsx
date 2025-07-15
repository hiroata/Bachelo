'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  username: z.string()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(20, 'ユーザー名は20文字以下で入力してください')
    .regex(/^[a-zA-Z0-9_]+$/, '英数字とアンダースコアのみ使用できます'),
  displayName: z.string()
    .min(1, '表示名を入力してください')
    .max(30, '表示名は30文字以下で入力してください'),
  role: z.enum(['creator', 'client'], {
    required_error: '役割を選択してください',
  }),
  birthDate: z.string().min(1, '生年月日を入力してください'),
  terms: z.boolean().refine(val => val === true, {
    message: '利用規約に同意する必要があります',
  }),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })
  
  const selectedRole = watch('role')
  
  const onSubmit = async (data: RegisterForm) => {
    // 年齢確認（18歳以上）
    const birthDate = new Date(data.birthDate)
    const age = new Date().getFullYear() - birthDate.getFullYear()
    if (age < 18) {
      toast.error('18歳未満の方はご利用いただけません')
      return
    }
    
    setIsLoading(true)
    
    try {
      // 1. Supabase認証でユーザー作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })
      
      if (authError) throw authError
      
      // 2. プロフィール作成
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          username: data.username,
          display_name: data.displayName,
          role: data.role,
        })
      
      if (profileError) throw profileError
      
      // 3. 年齢確認済みCookie設定
      document.cookie = `age_verified=true; max-age=${60 * 60 * 24 * 30}; path=/`
      
      toast.success('登録完了！メールを確認してください')
      router.push('/dashboard')
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || '登録に失敗しました')
      } else {
        toast.error('登録に失敗しました')
      }
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            新規アカウント作成
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="font-medium text-pink-600 hover:text-pink-500">
              ログイン
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* 役割選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                アカウントタイプ
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    value="client"
                    {...register('role')}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 rounded-lg cursor-pointer peer-checked:border-pink-500 peer-checked:bg-pink-50 hover:border-gray-400">
                    <div className="font-medium">クライアント</div>
                    <div className="text-sm text-gray-500">ボイスを購入する</div>
                  </div>
                </label>
                
                <label className="relative">
                  <input
                    type="radio"
                    value="creator"
                    {...register('role')}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 rounded-lg cursor-pointer peer-checked:border-pink-500 peer-checked:bg-pink-50 hover:border-gray-400">
                    <div className="font-medium">クリエイター</div>
                    <div className="text-sm text-gray-500">ボイスを販売する</div>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
            
            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            {/* ユーザー名 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                ユーザー名（半角英数字）
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input
                  id="username"
                  type="text"
                  {...register('username')}
                  className="flex-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-none rounded-r-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            
            {/* 表示名 */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                表示名
              </label>
              <input
                id="displayName"
                type="text"
                {...register('displayName')}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
              )}
            </div>
            
            {/* 生年月日 */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                生年月日
              </label>
              <input
                id="birthDate"
                type="date"
                {...register('birthDate')}
                max={new Date().toISOString().split('T')[0]}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
              )}
            </div>
            
            {/* 利用規約 */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                {...register('terms')}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                <Link href="/terms" className="text-pink-600 hover:text-pink-500">
                  利用規約
                </Link>
                および
                <Link href="/privacy" className="text-pink-600 hover:text-pink-500">
                  プライバシーポリシー
                </Link>
                に同意します
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
            size="lg"
          >
            アカウントを作成
          </Button>
        </form>
      </div>
    </div>
  )
}