export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              本利用規約（以下「本規約」といいます）は、Bachelo（バチェロ）（以下「当サービス」といいます）の利用条件を定めるものです。
              ユーザーの皆様には、本規約に従って当サービスをご利用いただきます。
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
              <p className="text-gray-700 mb-2">
                本規約は、ユーザーと当サービス運営者との間の当サービスの利用に関わる一切の関係に適用されるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第2条（年齢制限）</h2>
              <p className="text-gray-700 mb-2">
                当サービスは18歳以上の方のみご利用いただけます。18歳未満の方の利用は固く禁止します。
              </p>
              <p className="text-gray-700">
                年齢を偽って利用した場合、ユーザー自身の責任となり、当サービスは一切の責任を負いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第3条（禁止事項）</h2>
              <p className="text-gray-700 mb-4">ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>児童ポルノや児童虐待にあたるコンテンツの投稿</li>
                <li>他者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
                <li>当サービスの運営を妨害するおそれのある行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>他者に成りすます行為</li>
                <li>反社会的勢力等への利益供与</li>
                <li>その他、当サービスが不適切と判断する行為</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第4条（コンテンツの取り扱い）</h2>
              <p className="text-gray-700 mb-2">
                ユーザーが投稿したコンテンツの著作権はユーザーに帰属します。
              </p>
              <p className="text-gray-700 mb-2">
                ただし、ユーザーは当サービスに対し、投稿コンテンツを使用、複製、編集、改変等する権利を無償で許諾するものとします。
              </p>
              <p className="text-gray-700">
                当サービスは、法令に反するコンテンツや不適切なコンテンツを予告なく削除する権利を有します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第5条（プライバシー）</h2>
              <p className="text-gray-700">
                当サービスは、ユーザーのプライバシーを尊重し、個人情報を適切に管理します。
                詳細は<a href="/privacy" className="text-pink-500 hover:text-pink-600 underline">プライバシーポリシー</a>をご確認ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第6条（免責事項）</h2>
              <p className="text-gray-700 mb-2">
                当サービスは、ユーザー間のトラブルについて一切責任を負いません。
              </p>
              <p className="text-gray-700 mb-2">
                当サービスに起因してユーザーに生じたあらゆる損害について、当サービスは一切の責任を負いません。
              </p>
              <p className="text-gray-700">
                ただし、当サービスの故意または重過失による場合は、この限りではありません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第7条（サービス内容の変更等）</h2>
              <p className="text-gray-700">
                当サービスは、ユーザーに通知することなく、サービス内容を変更または提供を中止することができるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第8条（利用規約の変更）</h2>
              <p className="text-gray-700">
                当サービスは、必要と判断した場合には、ユーザーに通知することなく本規約を変更することができるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第9条（準拠法・裁判管轄）</h2>
              <p className="text-gray-700 mb-2">
                本規約の解釈にあたっては、日本法を準拠法とします。
              </p>
              <p className="text-gray-700">
                当サービスに関して紛争が生じた場合には、東京地方裁判所を専属的合意管轄とします。
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