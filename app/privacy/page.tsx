export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Bachelo（バチェロ）（以下「当サービス」といいます）は、ユーザーの個人情報保護を重要な責務と認識し、
              以下のプライバシーポリシーに基づき個人情報を取り扱います。
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 収集する情報</h2>
              <p className="text-gray-700 mb-4">当サービスは、以下の情報を収集することがあります：</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>IPアドレス（ハッシュ化して保存）</li>
                <li>ブラウザの種類、言語設定</li>
                <li>アクセス日時</li>
                <li>参照元URL</li>
                <li>投稿したコンテンツ（音声、画像、テキスト）</li>
                <li>クッキー情報</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 情報の利用目的</h2>
              <p className="text-gray-700 mb-4">収集した情報は以下の目的で利用します：</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>サービスの提供・運営</li>
                <li>ユーザーからのお問い合わせへの対応</li>
                <li>サービスの安全性及び品質の向上</li>
                <li>不正行為の防止</li>
                <li>利用規約違反の調査・対応</li>
                <li>統計データの作成（個人を特定できない形式）</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 個人情報の管理</h2>
              <p className="text-gray-700 mb-2">
                当サービスは、収集した個人情報を適切に管理し、以下の場合を除き第三者に開示しません：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく開示請求があった場合</li>
                <li>人の生命、身体または財産の保護のために必要な場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために必要な場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. セキュリティ対策</h2>
              <p className="text-gray-700">
                当サービスは、個人情報への不正アクセス、紛失、破損、改ざん、漏洩などを防ぐため、
                適切なセキュリティ対策を実施しています。IPアドレスはSHA-256でハッシュ化して保存し、
                元のIPアドレスを復元できない形で管理しています。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. クッキー（Cookie）</h2>
              <p className="text-gray-700 mb-2">
                当サービスは、ユーザー体験の向上のためクッキーを使用しています。
                クッキーは以下の目的で使用されます：
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>年齢確認状態の保持</li>
                <li>セッション管理</li>
                <li>利用状況の分析</li>
              </ul>
              <p className="text-gray-700 mt-4">
                ユーザーはブラウザの設定によりクッキーを無効にすることができますが、
                その場合サービスの一部機能が利用できなくなる可能性があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 匿名性について</h2>
              <p className="text-gray-700">
                当サービスは匿名での投稿を可能としていますが、
                法的要請があった場合や利用規約違反の調査のため、
                ハッシュ化されたIPアドレスや投稿時刻などの情報を使用することがあります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. データの保存期間</h2>
              <p className="text-gray-700">
                投稿されたコンテンツは、ユーザーが削除するか、
                利用規約違反により削除されるまで保存されます。
                アクセスログは最大90日間保存した後、自動的に削除されます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 未成年者の個人情報</h2>
              <p className="text-gray-700">
                当サービスは18歳未満の方の利用を禁止しており、
                18歳未満の方から故意に個人情報を収集することはありません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. プライバシーポリシーの変更</h2>
              <p className="text-gray-700">
                当サービスは、必要に応じてプライバシーポリシーを変更することがあります。
                重要な変更がある場合は、サービス内で通知します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. お問い合わせ</h2>
              <p className="text-gray-700">
                プライバシーポリシーに関するご質問やご意見は、
                サービス内のお問い合わせフォームよりご連絡ください。
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                制定日：2025年1月11日<br />
                最終更新日：2025年1月11日
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}