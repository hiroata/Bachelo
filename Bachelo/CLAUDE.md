# Bachelo - プロジェクトコンテキスト

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
Deploy:    Vercel
```

## 🚀 実装済み機能

### ✅ コア機能
1. **音声掲示板**
   - カテゴリー別表示（女性/男性/カップル）
   - 匿名投稿機能
   - 音声再生プレイヤー
   - リアルタイム更新 (Supabase Realtime)

2. **テキスト掲示板**
   - カテゴリー別投稿
   - 画像アップロード（最大4枚、各5MB以下）
   - 返信スレッド機能
   - 投票システム（+/-ボタン）
   - リアルタイム返信数カウント
   - ページネーション

3. **データ永続化**
   - Supabase Storage統合
   - PostgreSQLデータベース
   - Row Level Security (RLS)
   - 自動クリーンアップ機能

4. **セキュリティ**
   - ファイル検証（形式・サイズ）
   - IPアドレスハッシュ化
   - XSS対策（DOMPurify）
   - レート制限
   - CSRFトークン検証
   - 年齢確認ゲート（middleware）

## 📝 重要なコマンド

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

## 🎨 デザイン原則

- **メインカラー**: ピンク（#ec4899）
- **レイアウト**: モバイルファースト、レスポンシブ
- **インタラクション**: 直感的、最小限のクリック
- **パフォーマンス**: 遅延読み込み、最適化されたレンダリング

## 🔄 主要なファイル構成

```
/Bachelo/
├── app/
│   ├── (main)/
│   │   ├── voice-board/           # 音声掲示板ページ
│   │   ├── board/                 # テキスト掲示板
│   │   │   ├── page.tsx           # 一覧（Suspense対応）
│   │   │   └── post/[id]/page.tsx # 投稿詳細
│   │   ├── creators/              # クリエイター一覧
│   │   ├── dashboard/             # ダッシュボード
│   │   └── layout.tsx             # 共通レイアウト
│   └── api/
│       ├── voice/upload/          # 音声投稿API
│       ├── board/                 # 掲示板API
│       │   ├── categories/        # カテゴリー取得
│       │   ├── posts/             # 投稿CRUD
│       │   │   └── [id]/vote/     # 投票機能
│       │   ├── replies/           # 返信機能
│       │   │   └── [id]/vote/     # 返信投票
│       │   └── upload/            # 画像アップロード
│       └── cleanup/               # 自動クリーンアップ
├── components/
│   ├── board/                     # 掲示板コンポーネント
│   │   ├── PostModal.tsx          # 投稿作成モーダル
│   │   └── ReplyModal.tsx         # 返信モーダル
│   ├── voice-board/               # 音声掲示板コンポーネント
│   └── ui/                        # 共通UIコンポーネント
├── lib/
│   ├── storage/                   # ストレージ関連
│   ├── supabase/                  # Supabaseクライアント
│   ├── validations/               # Zodスキーマ
│   └── utils/                     # ユーティリティ
│       ├── error-handler.ts       # サーバー用エラーハンドラー
│       └── error-handler.client.ts # クライアント用
├── hooks/
│   ├── useAuth.ts                 # 認証フック
│   └── useRealtimeVoicePosts.ts   # リアルタイム更新
├── types/
│   ├── board.ts                   # 掲示板型定義
│   └── database.ts                # Supabase型定義
├── scripts/                       # シードスクリプト
└── supabase/migrations/           # DBマイグレーション
```

## ⚠️ セットアップ要件

### 環境変数（.env.local）
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret_here
```

### Supabaseセットアップ
1. **プロジェクト作成**
2. **SQLマイグレーション実行（順番に実行）**
   - 001_create_anonymous_voice_posts.sql（音声投稿）
   - 002_create_board_system.sql（掲示板）
   - 003_add_voting_system.sql（投票システム）
   - 004_complete_voting_system.sql（投票完成）
   - 005_cleanup_and_setup.sql（クリーンアップ）
   - 006_add_reply_voting.sql（返信投票）
   - 007_add_sample_votes.sql（サンプルデータ）
   - 008_add_more_replies.sql（追加返信）
3. **Storageバケット作成**
   - 「voice-posts」（公開設定）
   - 「images」（掲示板画像用、公開設定）

## 🏗️ アーキテクチャ設計原則

### John Carmack（パフォーマンス最適化）
- 最小限の再レンダリング
- メモ化による最適化
- 遅延読み込みの活用

### Robert C. Martin（クリーンアーキテクチャ）
- 単一責任の原則（SRP）
- 依存性逆転の原則（DIP）
- ビジネスロジックとUIの分離

### Rob Pike（シンプルさ）
- 明確で読みやすいコード
- 小さく集中したコンポーネント
- 過度な抽象化を避ける

## 💡 開発のポイント

### 型安全性
- すべての`any`型を排除
- 厳格な型チェック（`tsc --noEmit`）
- Zodによる実行時バリデーション

### エラーハンドリング
- サーバー側: `lib/utils/error-handler.ts`
- クライアント側: `lib/utils/error-handler.client.ts`
- 統一されたエラーレスポンス形式

### パフォーマンス
- React Server Components活用
- Suspense境界の適切な配置
- 画像の遅延読み込み
- APIルートで`export const dynamic = 'force-dynamic'`

### コード品質
- ESLint/Prettierによる自動フォーマット
- useEffectの依存配列を正確に管理
- useCallbackによる関数メモ化
- コンポーネントの適切な分割

## 🚦 今後の実装予定

1. **有料リクエスト機能**
   - 決済システム統合
   - クリエイター管理画面
   - 収益分配システム

2. **パフォーマンス最適化**
   - 無限スクロール実装
   - Redis/Memcachedキャッシング
   - CDN統合

3. **機能拡張**
   - プッシュ通知
   - DM機能
   - ランキングシステム
   - タグ検索機能

4. **テスト**
   - Jestによるユニットテスト
   - Playwrightによるe2eテスト
   - Storybookによるコンポーネント管理

## 🐛 既知の問題と対策

1. **ESLint設定の競合**
   - ルートディレクトリの.eslintrc.jsonを削除済み
   - Bacheloディレクトリの設定を使用

2. **Vercelビルドエラー（ENOENT）**
   - Next.js内部の最適化ファイルエラー
   - アプリケーションの動作には影響なし

3. **Supabase Realtimeの型エラー**
   - `postgres_changes as any`で一時的に対処
   - Supabaseライブラリの更新待ち

## 📚 参考資料

- `setup-instructions.md` - 詳細なセットアップ手順
- `supabase/migrations/` - データベース設計書
- `docs/` - 追加ドキュメント
- `.env.local.example` - 環境変数テンプレート

## 📅 最終更新: 2025-01-10

### 主な変更点
- プロジェクト名をBacheloに統一
- TypeScript型定義を完全に改善
- コンポーネントの分割とリファクタリング
- 重複ディレクトリの整理
- エラーハンドリングの統一
- React Hooksの最適化