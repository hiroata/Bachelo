# 地域別掲示板ポータル

2ちゃんねる風のクラシックなUI/UXを持つ地域別掲示板システムです。

## 機能

- 🗾 **地域別掲示板** - 全国8地方（北海道〜九州・沖縄）の地域ごとに独立した掲示板
- 💬 **クラシックな掲示板機能** - スレッド作成、レス投稿
- 📊 **sage/age機能** - sageでスレッドを上げない投稿が可能
- 🔐 **トリップ機能** - 名前#キーで個人認証
- 🆔 **ID表示** - 日付とIPアドレスから生成される一意のID
- 🗑️ **投稿削除** - パスワード認証による投稿削除

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: SQLite
- **ORM**: Prisma

## セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env

# データベースのセットアップ
npm run prisma:generate
npm run prisma:migrate dev
npm run prisma:seed

# 開発サーバーの起動
npm run dev
```

## 環境変数

`.env`ファイルに以下を設定：

```env
DATABASE_URL="file:./dev.db"
```

## デプロイ

### Vercel

1. このリポジトリをフォーク
2. Vercelでプロジェクトを作成
3. 環境変数を設定
4. デプロイ

### その他の環境

PostgreSQLを使用する場合は、`prisma/schema.prisma`のproviderを`postgresql`に変更してください。

## ライセンス

MIT

---

🤖 Generated with [Claude Code](https://claude.ai/code)