# 🗄️ Bachelo Supabase マイグレーション

## 🚀 AI開発者向けクイックスタート

### MCP推奨ワークフロー（最速）

```bash
# 1. プロジェクト確認
mcp__supabase__list_projects
mcp__supabase__get_project

# 2. 現在のテーブル確認
mcp__supabase__list_tables

# 3. エンハンス機能マイグレーション適用
mcp__supabase__apply_migration --name "enhanced_board_features" --query "$(cat migrations/021_enhanced_board_features.sql)"

# 4. TypeScript型生成
mcp__supabase__generate_typescript_types

# 5. セキュリティ確認
mcp__supabase__get_advisors --type security
```

## 📁 ファイル構成（簡素化済み）

### 🎯 推奨使用ファイル

1. **`migrations/021_enhanced_board_features.sql`** ⭐⭐⭐
   - 2025年1月最新のエンハンス機能
   - 12個の新テーブル（リアクション、トレンド、通知、イベント）
   - **AI開発者はこれのみ使用推奨**

2. **`safe-migration.sql`** ⭐⭐
   - レガシーサポート用
   - エラー発生時の修復用

### 📂 アーカイブファイル
- `fix-all-errors.sql` - 緊急修復用
- `reset-and-migrate.sql` - 完全リセット用（全データ削除）
- `test-queries.sql` - 動作確認用

## 🎯 実装済みエンハンス機能

### 新実装テーブル（12個）

```sql
-- リアクションシステム
post_reactions              -- 12種類のリアクション

-- ユーザーエンゲージメント
user_reputation            -- レピュテーション・スコアリング
user_follows              -- フォローシステム
post_bookmarks            -- ブックマーク機能

-- トレンド・分析
trending_topics           -- トレンド分析
content_quality_scores    -- 投稿品質スコア
user_activity_logs        -- ユーザー行動ログ

-- 通知システム
board_notifications       -- 9種類の通知

-- イベント機能
board_events              -- 7種類のイベント
event_participants        -- イベント参加者

-- タグシステム
board_tags, post_tags     -- タグ管理・関連付け
```

### 実装済みENUM型

```sql
-- リアクションタイプ
reaction_type: like, love, laugh, wow, sad, angry, support, thanks, celebrate, agree, question, heart

-- 通知タイプ
notification_type: reply, reaction, mention, follow, award, trending, system, event, milestone

-- イベントタイプ
event_type: contest, challenge, ama, collaboration, theme_week, voting, celebration

-- イベントステータス
event_status: planned, active, voting, ended, cancelled
```

## ⚡ 開発での使用例

### 新機能の追加
```bash
# 1. 新しいマイグレーション作成
mcp__supabase__apply_migration --name "add_new_feature" --query "
CREATE TABLE new_feature_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ...
);
"

# 2. 型生成
mcp__supabase__generate_typescript_types

# 3. セキュリティ確認
mcp__supabase__get_advisors --type security
```

### データ操作
```bash
# 現在のデータ確認
mcp__supabase__execute_sql --query "SELECT COUNT(*) FROM board_posts;"

# エンハンス機能の動作確認
mcp__supabase__execute_sql --query "
SELECT 
  reaction_type, 
  COUNT(*) 
FROM post_reactions 
GROUP BY reaction_type;
"
```

### ログ・デバッグ
```bash
# APIログ確認
mcp__supabase__get_logs --service api

# データベースログ確認  
mcp__supabase__get_logs --service postgres

# パフォーマンス分析
mcp__supabase__get_advisors --type performance
```

## 🛡️ セキュリティ設定

### 開発環境（現在）
- RLS: 無効化済み（開発の利便性のため）
- 匿名アクセス: 許可
- IP制限: アプリケーションレベルで実装

### 本番環境（要設定）
```sql
-- RLS有効化
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;

-- 基本ポリシー例
CREATE POLICY "誰でも読み取り可能" ON board_posts
  FOR SELECT USING (true);

CREATE POLICY "認証済みユーザーのみ投稿可能" ON board_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 🔍 トラブルシューティング

### よくある問題

| 問題 | MCP解決方法 |
|------|-------------|
| 接続エラー | `mcp__supabase__list_projects` で確認 |
| テーブル不存在 | `mcp__supabase__list_tables` で確認 |
| マイグレーション失敗 | `mcp__supabase__get_logs --service postgres` |
| パフォーマンス問題 | `mcp__supabase__get_advisors --type performance` |
| セキュリティ警告 | `mcp__supabase__get_advisors --type security` |

### 緊急時対応

```bash
# 1. 現在の状態確認
mcp__supabase__list_tables
mcp__supabase__get_logs --service postgres

# 2. バックアップ的対応（手動SQLファイル使用）
# Supabase Dashboard > SQL Editor で safe-migration.sql を実行

# 3. 完全リセット（最終手段 - 全データ削除）
# reset-and-migrate.sql を実行
```

## 📊 現在のデータベース状況

- **総テーブル数**: 36テーブル
- **エンハンス機能**: 完全実装済み
- **パフォーマンス**: 最適化済み（インデックス、ビュー）
- **セキュリティ**: 開発環境設定

## 🎯 AI開発者への推奨事項

1. **MCP最優先**: 手動SQL編集は非推奨
2. **段階的開発**: 小さなマイグレーションを積み重ね
3. **定期監視**: セキュリティ・パフォーマンスアドバイザー活用
4. **型安全性**: TypeScript型生成を忘れずに
5. **ログ確認**: エラー時は必ずログチェック

---

**💡 MCPを活用して効率的なデータベース開発を！**  
**詳細は [CLAUDE.md](../CLAUDE.md) を参照してください。**