# 🚀 Bachelo - AI引き継ぎ総合ドキュメント

## 📅 最終更新: 2025-01-16

## ⚠️ 重要：プロジェクト概要

**Bachelo（バチェロ）**は、成人向けコミュニティプラットフォームです。技術的に高度な実装を目指しており、以下の特徴があります：

- **対象**: 18歳以上の成人ユーザー
- **目的**: 匿名性を保ちつつ安全なコミュニケーション環境を提供
- **技術**: Next.js 14 + Supabase による最新のWebアプリケーション

## 🛠️ 技術スタック

### フロントエンド
- **Framework**: Next.js 14.2.30 (App Router)
- **Language**: TypeScript (strict mode 推奨)
- **Styling**: Tailwind CSS 3.4.17
- **Icons**: Lucide React

### バックエンド
- **API**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth（Anonymous + Email）
- **Deployment**: Render.com

### 開発環境
- **Node**: 18.x以上
- **Package Manager**: npm
- **IDE**: VS Code推奨

## 📁 プロジェクト構造

```
Bachelo/
├── app/                    # Next.js App Router
│   ├── (main)/            # メインレイアウト適用ページ
│   │   ├── board/         # 掲示板機能
│   │   ├── events/        # イベント機能
│   │   └── dashboard/     # ユーザーダッシュボード
│   ├── (auth)/            # 認証関連ページ
│   ├── admin/             # 管理画面
│   └── api/               # API Routes
├── components/            # Reactコンポーネント
│   ├── board/            # 掲示板関連
│   ├── ui/               # 共通UI
│   └── error/            # エラー処理
├── lib/                   # ユーティリティ
│   ├── supabase/         # Supabaseクライアント
│   ├── utils/            # 汎用ユーティリティ
│   └── validations/      # Zodスキーマ
├── hooks/                 # カスタムフック
├── types/                 # TypeScript型定義
├── scripts/               # 開発/運用スクリプト
└── supabase/             # データベース
    └── migrations/       # SQLマイグレーション

```

## 🔥 現在の状態と課題

### ✅ 完了済み機能
1. **基本的な掲示板機能**
   - 投稿の作成・閲覧・削除
   - 返信機能
   - 投票システム（+/-）
   - カテゴリー分類
   - 地域別投稿

2. **リアルタイム機能**
   - 通知システム
   - トレンド表示
   - ホットスレッド

3. **ユーザー機能**
   - 匿名投稿
   - ユーザープロファイル
   - ポイントシステム
   - レベル・バッジ

4. **管理機能**
   - NGワード検出
   - レポート機能
   - モデレーション

### 🐛 既知の問題

#### 重大（Critical）
1. **TypeScript設定**
   - `strict: false`のため型エラーが隠れている
   - 100箇所以上の`any`型使用
   - **推奨対応**: strict mode有効化

2. **console.log残存**
   - 128ファイルに1041箇所
   - **推奨対応**: ロガーシステムへの移行

3. **エラーハンドリング**
   - API間で不統一
   - **推奨対応**: 統一エラーハンドラー実装

#### 高優先度（High）
- React Hook依存配列の不備
- ハードコーディングされた値（定数化必要）
- 一部の大きなコンポーネント（分割推奨）

#### 修正済み
- ✅ `/api/notifications`と`/api/trending`の500エラー
- ✅ ErrorBoundaryのクラッシュ
- ✅ undefined.slice()エラー

## 🗄️ データベース構造

### 主要テーブル
```sql
-- 掲示板投稿
board_posts (
  id, category_id, title, content, author_name,
  view_count, reply_count, plus_count, minus_count,
  region, created_at, updated_at, ip_hash
)

-- 返信
board_replies (
  id, post_id, content, author_name,
  plus_count, minus_count, created_at, ip_hash
)

-- カテゴリー
board_categories (
  id, name, slug, description, icon,
  display_order, is_active
)

-- 通知
user_notifications (
  id, user_id, type, title, message,
  related_post_id, is_read, created_at
)

-- その他
board_events          # イベント
user_profiles         # プロファイル
user_reputation       # レピュテーション
trending_topics       # トレンドトピック
post_reactions        # リアクション
```

### ビュー
- `trending_posts_view` - トレンド投稿計算済みビュー
- `enhanced_post_view` - 投稿詳細ビュー

## 🚀 開発コマンド

### 基本コマンド
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check

# Lint
npm run lint
npm run lint:fix

# データベースマイグレーション
npx supabase migration up
```

### Supabase MCP コマンド
```bash
# プロジェクト情報
mcp__supabase__list_projects
mcp__supabase__get_project --id dleqvbspjouczytouktv

# データベース操作
mcp__supabase__execute_sql --project_id dleqvbspjouczytouktv --query "SELECT ..."
mcp__supabase__apply_migration --project_id dleqvbspjouczytouktv

# ログ確認
mcp__supabase__get_logs --project_id dleqvbspjouczytouktv --service api
mcp__supabase__get_logs --project_id dleqvbspjouczytouktv --service postgres

# 監査
mcp__supabase__get_advisors --project_id dleqvbspjouczytouktv --type security
```

## 🎯 推奨される次のステップ

### 即座に対応すべき
1. **TypeScript strict mode 有効化**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true
     }
   }
   ```

2. **console.log除去**
   - 開発用ロガー（`lib/utils/logger.ts`）を使用
   - 本番環境では無効化

3. **any型の解消**
   - 具体的な型定義に置き換え
   - Supabaseの型生成機能を活用

### 短期的に実施
1. **統一エラーハンドリング**
   - APIルート用の共通エラーハンドラー
   - クライアント用のエラー境界強化

2. **定数管理**
   - マジックナンバーの定数化
   - 設定ファイルの整理

3. **コンポーネント分割**
   - 714行の`board/page.tsx`を分割
   - カスタムフックの活用

### 長期的な改善
1. **テスト追加**
   - Jest + React Testing Library
   - E2Eテスト（Playwright）

2. **パフォーマンス最適化**
   - React.memoの追加活用
   - 画像の遅延読み込み
   - コード分割

3. **セキュリティ強化**
   - RLSポリシーの見直し
   - CSRF対策
   - レート制限

## 📚 重要な参考資料

### プロジェクト内ドキュメント
- `/CLAUDE.md` - 開発履歴と制約事項
- `/docs/QUICK-REFERENCE.md` - クイックリファレンス
- `/ERROR_CHECK_SUMMARY.md` - 最新のエラーチェック結果

### 外部リソース
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Render.com Deployment Guide](https://docs.render.com/)

## 🔐 環境変数

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dleqvbspjouczytouktv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret
```

## 🚨 注意事項

1. **プロジェクトID**: `dleqvbspjouczytouktv`（変更不可）
2. **デプロイ先**: Render.com（他のサービス使用禁止）
3. **ブランチ**: mainブランチのみ使用
4. **データベース**: 既存のテーブル構造を大幅に変更しない

## 💡 開発のヒント

1. **エラーが発生したら**
   - まずログを確認（Supabase MCPコマンド使用）
   - ErrorBoundaryでキャッチされているか確認
   - 型エラーの可能性を考慮

2. **新機能追加時**
   - 既存のパターンに従う
   - 型定義を先に作成
   - エラーハンドリングを忘れない

3. **パフォーマンス問題**
   - React DevToolsでレンダリング確認
   - データベースインデックスを確認
   - 不要な再レンダリングを防ぐ

---

このドキュメントは、次のAI開発者がプロジェクトを引き継ぐ際の包括的なガイドです。
質問や不明点がある場合は、コードベースとデータベースを直接確認することをお勧めします。

頑張ってください！ 🚀