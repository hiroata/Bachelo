# BACHELO - アダルトボイスマーケットプレイス & 匿名掲示板

アダルトボイス特化型のオーダーメイドマーケットプレイス + 5ch風匿名掲示板機能

## 🎯 プロジェクト概要

Bachelo（バチェロ）は、匿名で投稿できる無料音声掲示板を中心とした、アダルトボイスマーケットプレイスです。

**コアコンセプト**: 無料音声掲示板で気に入った声を見つけて → 有料でカスタムボイスをリクエスト

## 🏗️ 技術スタック

```
Frontend:  Next.js 14.2.30 (App Router) + TypeScript 5 + Tailwind CSS 3.4
Backend:   Next.js API Routes
Database:  Supabase (PostgreSQL)
Storage:   Supabase Storage
Auth:      Supabase Auth
Deploy:    Vercel / Render
```

## 🚀 主な機能

### ✅ 音声掲示板
- カテゴリー別表示（女性/男性/カップル）
- 匿名投稿機能
- 音声再生プレイヤー
- リアルタイム更新 (Supabase Realtime)

### ✅ テキスト掲示板（5ch風）
- カテゴリー別投稿
- 画像アップロード（最大4枚、各5MB以下）
- 返信スレッド機能
- 投票システム（+/-ボタン）
- リアルタイム返信数カウント
- ページネーション

### ✅ マーケットプレイス機能
- 年齢確認（18歳以上）
- クリエイター登録・プロフィール作成
- 料金設定（10秒単位）
- オーダー管理・音声納品
- 売上管理ダッシュボード

## 📋 クイックスタート（3分でセットアップ）

### 1️⃣ Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウント作成
2. 新しいプロジェクトを作成
3. Settings → API から以下をコピー：
   - Project URL
   - anon public key
   - service_role key（サーバーサイド用）

### 2️⃣ 環境変数の設定

`.env.local`ファイルを作成：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# クリーンアップ用（オプション）
CRON_SECRET=your_cron_secret_here
```

### 3️⃣ 初期テーブルの作成（初回のみ）

SupabaseダッシュボードのSQL Editorで実行：

```sql
-- 掲示板の基本テーブル
CREATE TABLE IF NOT EXISTS board_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS board_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES board_categories(id),
  author_name VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  plus_count INTEGER DEFAULT 0,
  minus_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 開発用：RLSを一時的に無効化
ALTER TABLE board_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts DISABLE ROW LEVEL SECURITY;
```

### 4️⃣ アプリケーションの起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 5️⃣ 自動セットアップ完了！

http://localhost:3000/board にアクセスすると、残りのテーブルとカテゴリーが自動で作成されます！

## 📝 詳細セットアップ（必要に応じて）

### データベースの完全セットアップ

掲示板の全機能を使用する場合は、以下のマイグレーションを順番に実行：

1. `/supabase/migrations/001_create_anonymous_voice_posts.sql` - 音声投稿
2. `/supabase/migrations/002_create_board_system.sql` - 掲示板システム
3. `/supabase/migrations/003_add_voting_system.sql` - 投票機能
4. `/supabase/migrations/004_complete_voting_system.sql` - 投票機能完成
5. `/supabase/migrations/005_cleanup_and_setup.sql` - クリーンアップ
6. `/supabase/migrations/006_add_reply_voting.sql` - 返信投票

### Storageバケットの作成

1. Supabaseダッシュボード → Storage
2. 以下のバケットを作成（全てPublic）：
   - `voice-posts` - 音声ファイル用
   - `images` - 掲示板画像用

### サンプルデータの投入

```bash
# 掲示板の初期データ
npm run seed:board

# 返信データ
npm run seed:replies

# 返信数の更新
npm run update:reply-counts
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# リント
npm run lint

# ビルド
npm run build

# 本番サーバー起動
npm start

# データベースシード
npm run seed:board      # 掲示板の初期データ投入
npm run seed:replies    # 返信データの投入
npm run update:reply-counts  # 返信数の更新
```

## 🚀 デプロイ

### Vercelへのデプロイ（推奨）

1. GitHubにリポジトリをプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

```bash
vercel --prod
```

### Renderへのデプロイ（無料プランあり）

**メリット**:
- 無料プランがある
- 自動デプロイが簡単
- PostgreSQLデータベースも無料

**デメリット**:
- 無料プランは15分間アクセスがないとスリープ
- 初回アクセス時に起動時間がかかる
- 月750時間の制限

## 🔒 セキュリティ機能

- **レート制限**: 1分間に5投稿まで（IPアドレスベース）
- **入力制限**: 
  - タイトル: 200文字
  - 本文: 10,000文字
  - 返信: 5,000文字
  - 画像: 1ファイル5MB、合計4枚まで
- **XSS対策**: DOMPurifyによる自動サニタイズ
- **年齢確認**: ミドルウェアによる18歳以上確認
- **CSRFトークン**: API保護

## 🐛 トラブルシューティング

### Supabase接続エラー
- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトがアクティブか確認
- ネットワーク接続を確認

### 投稿できない
1. ブラウザのコンソールでエラーを確認
2. Supabaseのテーブルが作成されているか確認
3. RLSが無効化されているか確認

### 画像アップロードの失敗
1. Storageバケット「images」が作成されているか確認
2. バケットがPublicに設定されているか確認
3. ファイルサイズが5MB以下か確認

### レート制限エラー
- 1分待ってから再投稿
- 開発環境では`/lib/utils/rate-limiter.ts`で調整可能

## 💾 ストレージ制限対策

Supabase無料プラン（1GB）に対応：
- 投稿は7日で自動削除
- 注文音声は30日で削除
- 毎日0時に自動クリーンアップ実行

## 📚 プロジェクト構成

```
/app              # Next.js App Router
  /(main)         # メインレイアウト
    /board        # テキスト掲示板
    /voice-board  # 音声掲示板
  /api            # APIエンドポイント
/components       # Reactコンポーネント
/lib              # ユーティリティ・設定
/hooks            # カスタムフック
/types            # TypeScript型定義
/scripts          # 管理スクリプト
/supabase         # マイグレーション
```

## ⚠️ 注意事項

- このMVP版は検証目的のみ
- 実際の決済処理は実装されていません（モック）
- 本番環境では必ずRLSを有効化してください
- 利用規約とプライバシーポリシーを必ず作成してください

## 📅 最終更新: 2025-01-11
