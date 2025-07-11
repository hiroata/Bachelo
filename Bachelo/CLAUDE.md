# Bachelo - 開発者向け詳細技術ドキュメント

## 📄 ドキュメントの役割分担

- **README.md**: ユーザー向けのクイックスタートガイド（3分でセットアップ）
- **CLAUDE.md**: 開発者向けの詳細な技術情報、アーキテクチャ、実装の詳細

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
Deploy:    Render (旧: Vercel)
```

## 🚀 実装済み機能

### ✅ コア機能
1. **音声掲示板**
   - カテゴリー別表示（女性/男性/カップル）
   - 匿名投稿機能
   - 音声再生プレイヤー
   - リアルタイム更新 (Supabase Realtime)

2. **テキスト掲示板（5ch風）**
   - カテゴリー別投稿
   - 画像アップロード（最大4枚、各5MB以下）
   - 返信スレッド機能
   - 投票システム（+/-ボタン）
   - リアルタイム返信数カウント
   - ページネーション
   - スレッド式掲示板（/girls/[board]/[thread]）

3. **セキュリティ・モデレーション**
   - 年齢確認ゲート（18歳以上、middleware実装）
   - 通報システム（投稿・返信の通報機能）
   - NGワード自動フィルタリング
   - 管理画面（/admin）でのモデレーション
   - IPアドレスハッシュ化
   - XSS対策（DOMPurify）
   - レート制限（1分5投稿）
   - CSRFトークン検証
   - ファイル検証（形式・サイズ）

4. **データ管理**
   - Supabase Storage統合
   - PostgreSQLデータベース
   - Row Level Security (RLS) - 開発時は無効化
   - 自動クリーンアップ機能（7日で投稿削除）
   - カスケード削除（投稿削除時に関連データも削除）

5. **管理機能**
   - 管理者ダッシュボード（/admin）
   - 通報管理（承認/却下）
   - NGワード管理
   - 統計情報表示

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
│   │   ├── girls/                 # 5ch風掲示板
│   │   │   └── [board]/[thread]/  # スレッド表示
│   │   ├── creators/              # クリエイター一覧
│   │   ├── dashboard/             # ダッシュボード
│   │   └── layout.tsx             # 共通レイアウト
│   ├── admin/                     # 管理画面
│   │   ├── page.tsx               # ダッシュボード
│   │   ├── layout.tsx             # 管理画面レイアウト
│   │   └── moderation/            # モデレーション
│   ├── age-gate/                  # 年齢確認ページ
│   └── api/
│       ├── voice/upload/          # 音声投稿API
│       ├── board/                 # 掲示板API
│       │   ├── categories/        # カテゴリー取得
│       │   ├── posts/             # 投稿CRUD
│       │   │   └── [id]/vote/     # 投票機能
│       │   ├── replies/           # 返信機能
│       │   │   └── [id]/vote/     # 返信投票
│       │   └── upload/            # 画像アップロード
│       ├── reports/               # 通報API
│       │   └── [id]/              # 通報処理
│       └── cleanup/               # 自動クリーンアップ
├── components/
│   ├── board/                     # 掲示板コンポーネント
│   │   ├── PostModal.tsx          # 投稿作成モーダル
│   │   └── ReplyModal.tsx         # 返信モーダル
│   ├── voice-board/               # 音声掲示板コンポーネント
│   └── ui/                        # 共通UIコンポーネント
│       └── ReportModal.tsx        # 通報モーダル
├── lib/
│   ├── storage/                   # ストレージ関連
│   ├── supabase/                  # Supabaseクライアント
│   ├── validations/               # Zodスキーマ
│   └── utils/                     # ユーティリティ
│       ├── error-handler.ts       # サーバー用エラーハンドラー
│       ├── error-handler.client.ts # クライアント用
│       ├── ng-word-checker.ts     # NGワードチェッカー
│       └── rate-limiter.ts        # レート制限
├── hooks/
│   ├── useAuth.ts                 # 認証フック
│   └── useRealtimeVoicePosts.ts   # リアルタイム更新
├── types/
│   ├── board.ts                   # 掲示板型定義
│   └── database.ts                # Supabase型定義
├── scripts/                       # シードスクリプト
├── supabase/migrations/           # DBマイグレーション（001-015）
└── middleware.ts                  # 年齢確認ミドルウェア
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
   - 009_disable_rls_for_easier_development.sql（開発用RLS無効化）
   - 010_add_category_icons.sql（カテゴリーアイコン）
   - 011_add_cascade_deletes.sql（カスケード削除）
   - 012_create_5ch_schema.sql（5ch風掲示板）
   - 013_insert_initial_boards.sql（初期掲示板データ）
   - 014_create_reports_system.sql（通報システム）
   - 015_create_ng_words_system.sql（NGワードシステム）
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
   - 決済システム統合（Stripe）
   - クリエイター収益管理
   - 自動振込システム

2. **パフォーマンス最適化**
   - 無限スクロール実装
   - Redis/Memcachedキャッシング
   - CDN統合（Cloudflare）
   - 画像最適化（WebP変換）

3. **機能拡張**
   - プッシュ通知（FCM）
   - WebSocket対応チャット
   - AI音声生成機能
   - タグ検索・フィルタリング
   - ユーザープロフィール機能

4. **品質向上**
   - Jestによるユニットテスト
   - Playwrightによるe2eテスト
   - Storybookによるコンポーネント管理
   - CI/CD改善（GitHub Actions）

## 🐛 既知の問題と対策

1. **TypeScript型エラー対策**
   - 一部の型定義で`any`を使用（段階的に改善中）
   - Supabase Realtime関連の型エラー
   - ビルド時は`tsc --noEmit`でチェック

2. **Renderデプロイ時の注意**
   - 無料プランは15分アクセスなしでスリープ
   - 初回アクセス時に起動時間がかかる
   - 環境変数の設定を確実に行う

3. **パフォーマンス最適化**
   - 大量データ時のページネーション必須
   - 画像の遅延読み込み実装済み
   - React.memoによるメモ化を活用

4. **セキュリティ考慮事項**
   - 本番環境では必ずRLSを有効化
   - 環境変数の適切な管理
   - CSRFトークンの実装確認

## 📚 参考資料

- `README.md` - ユーザー向けクイックスタートガイド
- `setup-instructions.md` - 詳細なセットアップ手順
- `supabase/migrations/` - データベース設計書
- `.env.local.example` - 環境変数テンプレート

## 🔧 開発Tips

### デバッグ方法
```bash
# APIエラーの確認
npm run dev
# ブラウザのコンソールとNetwork タブを確認

# TypeScript型エラーの確認
npm run type-check

# Supabaseログの確認
# Supabaseダッシュボード → Logs → API logs
```

### よくあるエラーと対処法
1. **「RLS policy violation」エラー**
   - 開発環境: 009_disable_rls_for_easier_development.sql を実行
   - 本番環境: 適切なRLSポリシーを設定

2. **「CORS error」エラー**
   - 環境変数のSUPABASE_URLが正しいか確認
   - Supabaseダッシュボードで許可ドメインを設定

3. **「Rate limit exceeded」エラー**
   - `/lib/utils/rate-limiter.ts`でレート制限を調整
   - 本番環境ではRedis導入を検討

## 📅 最終更新: 2025-01-11

### 主な変更点
- 年齢確認ゲート（middleware）実装
- 通報システム・管理画面の追加
- NGワード自動フィルタリング機能
- 5ch風掲示板システムの実装
- デプロイ先をVercelからRenderに変更
- 開発者向けドキュメントとして役割を明確化