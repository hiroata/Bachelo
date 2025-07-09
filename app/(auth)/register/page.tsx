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
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  displayName: z.string()
    .min(1, '表示名を入力してください')
    .max(20, '表示名は20文字以下で入力してください'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })
  
  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    
    try {
      // 1. Supabase認証でユーザー作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })
      
      if (authError) throw authError
      
      // 2. プロフィール作成（シンプル版）
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          username: data.email.split('@')[0], // メールアドレスの@前をユーザー名として使用
          display_name: data.displayName,
          role: 'client', // デフォルトでクライアントとして登録
        })
      
      if (profileError) throw profileError
      
      toast.success('登録完了！メールを確認してください')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || '登録に失敗しました')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
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
            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
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
                placeholder="6文字以上"
                {...register('password')}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
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
                placeholder="ニックネーム"
                {...register('displayName')}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
              )}
            </div>
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