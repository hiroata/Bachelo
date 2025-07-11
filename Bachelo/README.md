# BACHELO - アダルトボイスマーケットプレイス & 匿名掲示板

アダルトボイス特化型のオーダーメイドマーケットプレイス + 5ch風匿名掲示板機能

## 技術スタック

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 🚀 超簡単セットアップ（3分で完了！）

### 1. 環境変数の設定

`.env.local`ファイルを作成して、以下を設定：

```bash
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたの公開キー
```

### 2. アプリを起動して掲示板にアクセス

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000/board にアクセスすると、**自動でセットアップが完了します！** 🎉

### 3. Supabaseの初期設定（初回のみ）

掲示板機能を使うには、Supabaseで以下のSQLを一度だけ実行：

```sql
-- 掲示板の基本テーブル（これだけでOK！）
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
  plus_count INTEGER DEFAULT 0,
  minus_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- セキュリティを一時的に無効化（開発用）
ALTER TABLE board_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts DISABLE ROW LEVEL SECURITY;
```


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

### 🔥 NEW! 匿名掲示板機能
- **5ch風インターフェース**: 誰でも気軽に投稿
- **カテゴリー別投稿**: 雑談、質問、ニュースなど
- **投票システム**: 投稿への評価（+/-ボタン）
- **自動セットアップ**: 面倒な設定不要！

### 🎤 音声マーケットプレイス
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
