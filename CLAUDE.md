# 🔞 Adult BBS System - Claude Development Guide

## ⚠️ 系統概要
**アダルト専用掲示板システム** - すべての性癖に対応した包括的カテゴリー設計

### 🎯 コアミッション
- 17主要カテゴリ + 100+サブカテゴリで全性癖をカバー
- マルチレイヤー保護システム（健全化防止）
- Firebase/Vercel完全除去済み
- Render.com統一デプロイ戦略

## 📊 技術スタック状況

### ✅ 採用技術
- **Next.js 14** (TypeScript)
- **Supabase PostgreSQL** (with TEXT[] arrays)
- **Render.com** (デプロイ)
- **GitHub** (https://github.com/hiroata/Bachelo.git)

### ❌ 除去済み技術
- Firebase (完全削除)
- Vercel (完全削除)
- 健全コンテンツ (完全排除)

## 🔐 保護システム概要

### データベース保護
```sql
-- カテゴリー削除防止制約
ALTER TABLE adult_categories ADD CONSTRAINT prevent_wholesome_categories 
CHECK (name NOT LIKE '%wholesome%' AND name NOT LIKE '%family%');

-- 管理者権限制限
ALTER TABLE users ADD CONSTRAINT admin_protection 
CHECK (role = 'admin' AND approved_adult_content = true);
```

### TypeScript保護
```typescript
// 健全化防止バリデーション
export const validateAdultCategory = (category: string): boolean => {
  const forbiddenTerms = ['wholesome', 'family-friendly', 'clean'];
  return !forbiddenTerms.some(term => category.toLowerCase().includes(term));
};
## 📁 主要ファイル構造

### 重要実装ファイル

- `supabase/migrations/ultra-detailed-adult-categories-fixed-v2.sql`
- `data/ultra-detailed-adult-categories.ts`  
- `lib/protection-system.ts`
- `components/auth/adult-verification.tsx`

### 設定ファイル

- `render.yaml` (デプロイ設定)
- `.gitignore` (Firebase/Vercelブロック)
- `package.json` (依存関係)

## 🚀 開発履歴

### 2024年12月22日 - Day 3

#### 23:30 - ドキュメント統合作業

- 重複markdownファイル統合
- AI参照用最適化
- 不要ファイル削除

#### 23:00 - システム最終クリーンアップ完了

1. **Firebase完全除去**
   - firebase-debug.log削除
   - .firebase/ディレクトリ削除
   - 全依存関係除去

2. **Vercel完全削除**
   - vercel.json削除
   - README/DEPLOY等からVercel参照削除
   - Render.com戦略に統一

3. **Git履歴整理**
   - 単一クリーンコミットに圧縮
   - 大容量ファイル除去
   - メインブランチにプッシュ

#### 22:00 - 保護システム強化

- データベース制約強化
- TypeScript型保護追加
- ドキュメント保護実装

### ⚠️ 重要な制限事項

1. **システム変更禁止**
   - 健全コンテンツへの変更は完全禁止
   - アダルト専用システムとして固定
   - 保護メカニズムの削除禁止

2. **技術制約**
   - Firebase使用禁止（完全除去済み）
   - Vercel使用禁止（完全除去済み）
   - Render.com必須使用

3. **デプロイメント**
   - GitHub: https://github.com/hiroata/Bachelo.git
   - メインブランチのみ使用
   - Render.com経由でのみデプロイ
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

2. **デプロイ最適化**
   - Render.com対応の設定に統一
   - 軽量化とパフォーマンス向上

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