import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '地域別掲示板ポータル',
  description: '全国各地の地域に特化した2ちゃんねる風クラシック掲示板',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <div className="bbs-container">
          <header className="p-4 border-b-2 border-gray-600">
            <h1 className="text-2xl font-bold">
              <a href="/" className="text-black hover:no-underline">
                地域別掲示板ポータル
              </a>
            </h1>
            <nav className="mt-2 text-sm">
              <a href="/" className="text-bbs-link hover:underline mr-4">
                トップページ
              </a>
              <span className="text-gray-600">全国の地域別掲示板</span>
            </nav>
          </header>
          <div className="flex">
            <main className="flex-grow p-4">
              {children}
            </main>
            <aside className="w-1/4 p-4 border-l border-gray-400">
              <h2 className="font-bold mb-2">掲示板の使い方</h2>
              <ul className="text-sm space-y-1">
                <li>・地域を選んで掲示板へ</li>
                <li>・スレッドを立てて議論</li>
                <li>・sage機能でスレッドを上げない</li>
                <li>・名前#でトリップ生成</li>
                <li>・削除PASSで投稿削除</li>
              </ul>
              
              <h2 className="font-bold mt-6 mb-2">機能について</h2>
              <ul className="text-sm space-y-1">
                <li>・地域別の話題を共有</li>
                <li>・匿名での投稿が可能</li>
                <li>・クラシックな2ch風UI</li>
              </ul>
            </aside>
          </div>
          <footer className="p-4 border-t border-gray-600 text-center text-sm">
            © 2024 地域別掲示板ポータル
          </footer>
        </div>
      </body>
    </html>
  )
}