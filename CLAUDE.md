# VoiceEros - プロジェクトコンテキスト

## 🎯 プロジェクト概要

VoiceEros（ボイスエロス）は、匿名で投稿できる無料音声掲示板を中心とした、アダルトボイスマーケットプレイスです。

**コアコンセプト**: 無料音声掲示板で気に入った声を見つけて → 有料でカスタムボイスをリクエスト

## 🏗️ 技術スタック

```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS
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
   - リアルタイム更新

2. **テキスト掲示板**
   - カテゴリー別投稿
   - 画像アップロード（最大4枚）
   - 返信スレッド機能
   - ページネーション

3. **データ永続化**
   - Supabase Storage統合
   - PostgreSQLデータベース
   - 匿名投稿用テーブル設計

4. **セキュリティ**
   - ファイル検証（形式・サイズ）
   - Row Level Security (RLS)
   - IPアドレスハッシュ化
   - XSS対策（DOMPurify）
   - レート制限

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
```

## 🎨 デザイン原則

- **メインカラー**: ピンク（#ec4899）
- **レイアウト**: モバイルファースト、シンプル
- **インタラクション**: 直感的、最小限のクリック

## 🔄 主要なファイル構成

```
/app/(main)/
  - voice-board/           # 音声掲示板ページ
  - board/                 # テキスト掲示板ページ
    - page.tsx            # 掲示板一覧（Suspense対応）
    - post/[id]/page.tsx  # 投稿詳細ページ
/app/api/
  - voice/upload/          # 音声投稿API
  - board/                 # 掲示板API
    - categories/         # カテゴリー取得
    - posts/              # 投稿CRUD
    - replies/            # 返信機能
    - upload/             # 画像アップロード
/components/
  - voice-board/          # 音声掲示板コンポーネント
  - ui/                   # 共通UIコンポーネント
/lib/
  - storage/              # ストレージ関連
  - validations/          # バリデーション
  - utils/                # ユーティリティ
    - error-handler.ts    # サーバー用エラーハンドラー
    - error-handler.client.ts # クライアント用エラーハンドラー
/hooks/
  - useRealtimeVoicePosts # リアルタイム更新
/supabase/migrations/     # DBマイグレーション
```

## ⚠️ セットアップ要件

### 環境変数（.env.local）
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret_here
```

### Supabaseセットアップ
1. プロジェクト作成
2. SQLマイグレーション実行
   - 001_init.sql（基本テーブル）
   - 002_create_board_system.sql（掲示板テーブル）
3. Storageバケット作成
   - 「voice-posts」（公開設定）
   - 「images」（掲示板画像用）

## 🚦 残タスク

1. **テストコード作成**
2. **有料リクエスト機能**
3. **パフォーマンス最適化**
   - 無限スクロール
   - キャッシング戦略
   - 遅延読み込み
4. **ESLint警告の修正**
   - 未使用変数の削除
   - useEffect依存配列の修正
   - any型の適切な型定義


## 💡 開発のポイント

- 型チェックとリントを必ず実行
- エラーハンドリング
  - サーバー側: `lib/utils/error-handler.ts`
  - クライアント側: `lib/utils/error-handler.client.ts`
- バリデーションは`zod`スキーマで統一
- ファイルサイズ制限
  - 音声: 10MB以下
  - 画像: 5MB以下
- APIルートには`export const dynamic = 'force-dynamic'`を設定
- `useSearchParams`使用時はSuspense境界でラップ

## 📚 参考資料

- `REPAIR_SUMMARY.md` - 修繕計画の実行結果
- `setup-instructions.md` - セットアップ手順
- `supabase/migrations/` - データベース設計
- `.env.local.example` - 環境変数の例

## 🐛 既知の問題と対策

1. **Vercelビルドエラー（ENOENT）**
   - Next.js内部の最適化ファイルエラー
   - アプリケーションの動作には影響なし

2. **古いコミットでのビルド**
   - Vercelが時々古いコミットを使用する
   - 新しいコミットをプッシュして強制更新

## 📅 最終更新: 2025-07-08
- エラーハンドラーをクライアント/サーバー用に分離
- 全APIルートに動的レンダリング設定を追加
- 掲示板ページのSuspense境界を修正