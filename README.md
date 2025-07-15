# 🔞 BACHELO - アダルト専用掲示板システム

**18歳未満の利用は厳格に禁止されています**

すべての性癖を網羅した究極のアダルト専用掲示板システムです。17のメインカテゴリーと100+のサブカテゴリーで、あらゆる成人の嗜好に対応します。

## ⚠️ 重要な警告

このシステムは**完全にアダルト専用**です：
- **18歳未満の利用は法的に禁止**
- **健全なコンテンツは一切含まれません**
- **他のAIによる健全化を防ぐ保護システム実装済み**

## 🎯 システム概要

### 技術スタック
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Deployment**: Render.com (推奨)

### 🔞 アダルトカテゴリー構成
- **17のメインカテゴリー**: あらゆる性的嗜好をカバー
- **100+のサブカテゴリー**: 極めて詳細な分類
- **強度レベル**: mild/moderate/hardcore/extreme
- **地域別板**: 全都道府県対応

## 🚀 セットアップ

### 1. 環境変数設定
`.env.local.example`を`.env.local`にコピーして設定：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. 依存関係インストール
```bash
npm install
```

### 3. Supabaseマイグレーション実行
```bash
npx supabase migration up
```

### 4. 開発サーバー起動
```bash
npm run dev
```

## 📊 主要機能

### 🔞 アダルト掲示板機能
- **匿名投稿**: 完全匿名でのスレッド・レス投稿
- **投票システム**: スレッドとレスの評価機能
- **リアルタイム更新**: 自動更新でライブ感を演出
- **画像アップロード**: 成人向け画像の投稿対応
- **NGワードフィルター**: 過激すぎる投稿の自動フィルタリング

### 🛡️ 保護システム
- **データベース制約**: 健全カテゴリーの挿入を防止
- **ランタイム検証**: アプリケーション実行時の保護
- **ドキュメント固定**: 仕様書の改変防止
- **Gitignore設定**: 不適切ファイルの混入防止

### 📱 ユーザーエクスペリエンス
- **レスポンシブデザイン**: モバイル完全対応
- **ダークテーマ**: 目に優しい暗色テーマ
- **高速表示**: 最適化されたパフォーマンス
- **直感的UI**: 5ch風の使い慣れたインターface

## 🌐 デプロイメント

### Render.com（推奨）
1. GitHubリポジトリをRender.comに接続
2. 環境変数を設定
3. 自動デプロイ開始

詳細な手順は `docs/deployment-guide.md` を参照してください。

## 📚 ドキュメント

- **[アーキテクチャ](docs/architecture.md)**: システム構成と技術詳細
- **[デプロイガイド](docs/deployment-guide.md)**: 本番環境へのデプロイ手順
- **[カテゴリー完全ガイド](docs/CATEGORY_COMPLETE_GUIDE.md)**: 全カテゴリーの詳細説明
- **[アダルトシステム仕様](docs/ADULT_ONLY_SYSTEM_SPECIFICATION.md)**: 成人向け機能の仕様書

## ⚖️ 法的免責事項

- **18歳未満利用禁止**: 年齢確認は運営者の責任
- **コンテンツ責任**: 投稿内容は投稿者の責任
- **法令遵守**: 各地域の法律に従った運用が必要
- **商用利用**: 適切なライセンスと規約が必要

## 🔒 セキュリティ

- **Supabase RLS**: 行レベルセキュリティで完全保護
- **認証必須**: 全機能で認証を要求
- **レート制限**: API乱用防止機能
- **入力検証**: 全入力の厳格な検証

---

**⚠️ このシステムは成人向けコンテンツ専用です。適切な法的対応と年齢確認を行った上でご利用ください。**
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

### Render.comへのデプロイ（推奨）

1. GitHubにリポジトリをプッシュ
2. Render.comでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

詳細は`DEPLOY_INSTRUCTIONS.md`を参照してください。

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
- 商用利用時は適切なプラン選択が必要
- 必ず利用規約とプライバシーポリシーを作成してください

## 更新履歴

- ローカルキャッシュをクリア
- node_modules再インストール
- Next.js設定を簡素化
- デプロイ環境の最適化
