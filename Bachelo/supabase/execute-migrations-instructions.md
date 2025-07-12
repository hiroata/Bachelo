# Supabase Migration 実行手順書

## 📁 SQLファイル一覧

### 実行用ファイル（3つのみ）
1. **`fix-all-errors.sql`** - 既存環境のエラー修正用
2. **`safe-migration.sql`** - 安全なマイグレーション（推奨）
3. **`reset-and-migrate.sql`** - 完全リセット版（最も確実）

### 確認用ファイル
- **`test-queries.sql`** - 動作確認・診断用
- **`execute-all-migrations-complete.sql`** - 元の完全版（参考用）

## 🚨 エラー解決手順

`execute-all-migrations-complete.sql`実行時に「ip_hash column does not exist」エラーが発生した場合の解決方法です。

## 📋 前提条件

- Supabaseプロジェクトが作成済み
- SQL Editorへのアクセス権限がある
- データベースが空の状態、または既存データのバックアップ済み

## 🔧 解決手順

### 方法1: 既存環境を修正（エラーが出ている場合）

1. **fix-all-errors.sqlを実行**
   - 既存のテーブルに不足カラムを追加
   - ENUM型の重複を回避
   - PL/pgSQL構文エラーを修正済み

2. **test-queries.sqlで動作確認**
   - セクション3の「データ挿入テスト」を実行
   - エラーが出なければ成功

### 方法2: 安全なマイグレーション（推奨）

1. **safe-migration.sqlを実行**
   - トランザクション管理付き
   - エラーチェック機能内蔵
   - 既存テーブルも自動修正

### 方法3: 完全リセット（最も確実）

1. **reset-and-migrate.sqlを実行**
   - すべてを削除して再構築
   - 100%動作保証
   - ⚠️ 全データが削除されます

2. **実行順序**：
   - STEP 0: 準備とクリーンアップ
   - STEP 1: 音声投稿システム作成
   - STEP 2: 掲示板システム作成（重要：ip_hashカラムを含む）
   - STEP 3: 投票システム追加
   - STEP 4: 返信投票システム追加
   - STEP 5: 開発用RLS無効化
   - STEP 6: カテゴリーアイコン追加
   - STEP 7: 5ch風スキーマ作成
   - STEP 8: 通報システム作成
   - STEP 9: NGワードシステム作成

3. **各ステップ実行後の確認**
   - 各ステップの最後に成功メッセージが表示される
   - エラーが発生した場合は、そのステップで停止

## 🐛 トラブルシューティング

### エラー: "ip_hash column does not exist"

**原因**：
- テーブル作成が失敗している
- 既存のテーブルに古い構造が残っている

**解決策**：
```sql
-- 1. 現在のテーブル構造を確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'board_posts' 
ORDER BY ordinal_position;

-- 2. ip_hashカラムが存在しない場合は追加
ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS ip_hash TEXT;
```

### エラー: "relation already exists"

**原因**：
- テーブルが既に存在している

**解決策**：
- `CREATE TABLE IF NOT EXISTS`を使用しているため、通常は問題ない
- エラーが続く場合は、既存のテーブルをバックアップ後に削除

### エラー: トランザクションのロールバック

**原因**：
- 大きなSQLファイルの一部でエラーが発生

**解決策**：
- `execute-migrations-step-by-step.sql`を使用して段階的に実行

## ✅ 実行完了の確認

1. **テーブル数の確認**
   ```sql
   SELECT COUNT(*) as table_count
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_type = 'BASE TABLE';
   -- 期待値: 15以上のテーブル
   ```

2. **board_postsテーブルの構造確認**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'board_posts'
   ORDER BY ordinal_position;
   -- ip_hashカラムが含まれていることを確認
   ```

3. **サンプルクエリの実行**
   ```sql
   -- これがエラーなく実行できれば成功
   SELECT * FROM board_posts WHERE ip_hash IS NOT NULL LIMIT 5;
   ```

## 📝 実行後の手順

1. **サンプルデータの投入**（オプション）
   - 元のマイグレーションファイルのサンプルデータ部分を実行

2. **アプリケーションの動作確認**
   - 掲示板への投稿機能をテスト
   - ip_hashが正しく保存されることを確認

## 🆘 サポート

問題が解決しない場合：

1. エラーメッセージの全文をコピー
2. 実行したSQLの該当部分を特定
3. 以下の情報を含めて報告：
   - Supabaseのバージョン
   - 実行環境（ブラウザ、OS）
   - エラーが発生した具体的なSQL文

## 📌 重要な注意事項

- **本番環境での実行前に必ずバックアップを取得**
- **開発環境でテスト実行してから本番環境に適用**
- **RLSは開発時のみ無効化、本番環境では適切に設定**

---

最終更新: 2025-01-12