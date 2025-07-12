# 🎤 Bachelo - 匿名音声掲示板＆アダルトボイスマーケットプレイス

## 🚀 クイックスタート（3分でセットアップ）

### 1. 環境準備
```bash
# リポジトリクローン
git clone https://github.com/yourusername/bachelo.git
cd bachelo/Bachelo

# 依存関係インストール
npm install
```

### 2. 環境変数設定
`.env.local`を作成：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret_here
```

### 3. Supabaseセットアップ
1. [Supabase](https://supabase.com)でプロジェクト作成
2. SQL Editorで`supabase/safe-migration.sql`を実行
3. Storageで以下のバケット作成：
   - `voice-posts`（公開）
   - `images`（公開）

### 4. 開発サーバー起動
```bash
npm run dev
# http://localhost:3000 でアクセス
```

## 📋 プロジェクト概要

Bacheloは、匿名で投稿できる音声掲示板を中心としたアダルトボイスマーケットプレイスです。

**主な機能：**
- 🎙️ 匿名音声投稿（女性/男性/カップル）
- 💬 5ch風テキスト掲示板
- 👍 投票システム（+/-ボタン）
- 🚨 通報・モデレーション機能
- 🔞 年齢確認ゲート（18歳以上）

## 🛠️ 技術スタック

- **Frontend**: Next.js 14.2.30 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deploy**: Render

## 📁 主要ディレクトリ構成

```
Bachelo/
├── app/              # Next.js App Router
│   ├── (main)/       # メインレイアウト
│   ├── api/          # APIルート
│   └── admin/        # 管理画面
├── components/       # Reactコンポーネント
├── lib/              # ユーティリティ
├── hooks/            # カスタムフック
├── types/            # TypeScript型定義
├── supabase/         # DBマイグレーション
└── docs/             # ドキュメント
```

## 🔧 主要コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # 本番ビルド
npm run start      # 本番サーバー起動
npm run lint       # ESLintチェック
npm run type-check # 型チェック
```

## 📚 詳細ドキュメント

- [開発者向け技術ドキュメント](./CLAUDE.md)
- [アーキテクチャ設計書](./docs/architecture.md)
- [デプロイメントガイド](./docs/deployment-guide.md)
- [Supabase簡単ガイド](./docs/supabase-simple-guide.md)
- [SQLマイグレーション手順](./supabase/README.md)

## 🚨 重要な注意事項

- 本番環境では必ずRLSを有効化してください
- 環境変数は絶対にGitにコミットしないでください
- 18歳以上のみ利用可能なコンテンツを含みます

## 🤝 貢献について

バグ報告や機能提案は[Issues](https://github.com/yourusername/bachelo/issues)へお願いします。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

© 2025 Bachelo. All rights reserved.