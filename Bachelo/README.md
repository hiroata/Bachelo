# BACHELO - アダルトボイスマーケットプレイスMVP

アダルトボイス特化型のオーダーメイドマーケットプレイスです。

## 技術スタック

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## セットアップ

### 1. 環境変数の設定

`.env.local.example`を`.env.local`にコピーして、以下の環境変数を設定：

```bash
cp .env.local.example .env.local
```

必要な環境変数：
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー
- `PAYMENT_API_KEY`: 決済APIキー（MVP版では使用しない）
- `CRON_SECRET`: Cronジョブ用のシークレット

### 2. Supabaseのセットアップ

1. [Supabase](https://app.supabase.com)で新規プロジェクトを作成
2. SQLエディタで`supabase/schema.sql`の内容を実行
3. Storageで`audio`バケットを作成（Publicにはしない）

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## デプロイ

### Vercelへのデプロイ

1. GitHubにリポジトリをプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

```bash
vercel --prod
```

## 主な機能

- **年齢確認**: 18歳以上のみ利用可能
- **ユーザー登録**: クリエイター/クライアントの2種類
- **クリエイター機能**:
  - プロフィール作成
  - 料金設定（10秒単位）
  - 注文管理
  - 音声アップロード
  - 売上管理
- **クライアント機能**:
  - クリエイター検索
  - ボイスオーダー
  - 注文履歴
- **タイムライン**: 無料音声投稿・視聴

## ストレージ制限対策

Supabase無料プラン（1GB）に対応するため：
- 投稿は7日で自動削除
- 注文音声は30日で削除
- 毎日0時に自動クリーンアップ実行

## セキュリティ

- Row Level Security (RLS)による厳格なアクセス制御
- 年齢確認の徹底
- 音声ファイルの直接アクセス防止
- 署名付きURLによる期限付きアクセス

## 開発コマンド

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# 本番サーバー
npm start

# 型チェック
npm run type-check

# リント
npm run lint
```

## 注意事項

- このMVP版は検証目的のみ
- 実際の決済処理は実装されていません（モック）
- Vercel Hobbyプランは商用利用不可
- 必ず利用規約とプライバシーポリシーを作成してください
