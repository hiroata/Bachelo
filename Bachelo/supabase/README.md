# Bachelo Supabase SQLマイグレーション

## 📁 ファイル構成

### 実行用ファイル（3つのみ使用）

1. **`fix-all-errors.sql`**
   - 既存環境のエラー修正専用
   - ip_hashカラムなどの不足を修正
   - エラーが出た場合はまずこれを実行

2. **`safe-migration.sql`** ⭐推奨
   - エラーが発生しない安全設計
   - トランザクション管理付き
   - 既存テーブルの自動修正機能

3. **`reset-and-migrate.sql`** 🔥最も確実
   - すべてを削除して再構築
   - 100%動作保証
   - ⚠️ 全データが削除されます

### 補助ファイル

- **`test-queries.sql`** - 動作確認・診断用
- **`execute-migrations-instructions.md`** - 詳細手順書
- **`execute-all-migrations-complete.sql`** - 元の完全版（参考用）
- **`migrations/`** - 個別マイグレーションファイル

## 🚀 クイックスタート

### 新規環境の場合
```sql
-- safe-migration.sql を実行
```

### エラーが出ている場合
```sql
1. fix-all-errors.sql を実行
2. test-queries.sql のセクション3を実行して確認
```

### 完全にやり直したい場合
```sql
-- reset-and-migrate.sql を実行（全データ削除）
```

## ⚠️ 重要な注意

- 本番環境では必ずバックアップを取得
- `reset-and-migrate.sql`は全データを削除します
- エラーが続く場合は新しいSupabaseプロジェクトでテスト

## 🔍 トラブルシューティング

詳細は `execute-migrations-instructions.md` を参照してください。