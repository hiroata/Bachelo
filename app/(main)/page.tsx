import { redirect } from 'next/navigation'

export default async function HomePage() {
  // メインページにアクセスしたら掲示板にリダイレクト
  redirect('/board')
}