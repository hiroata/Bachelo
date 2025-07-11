# 掲示板機能のセットアップ手順

## 問題
掲示板機能がエラーを出している原因は、Supabaseデータベースにboard関連のテーブルがまだ作成されていないためです。

## 解決手順

### 1. Supabaseダッシュボードにログイン
1. https://supabase.com にアクセス
2. プロジェクトを選択

### 2. SQLエディタで以下のマイグレーションを実行

以下のSQLファイルを順番に実行してください：

1. **002_create_board_system.sql** - 掲示板の基本テーブル作成
2. **003_add_voting_system.sql** - 投票機能の追加
3. **004_complete_voting_system.sql** - 投票システムの完成
4. **005_cleanup_and_setup.sql** - クリーンアップとセットアップ
5. **006_add_reply_voting.sql** - 返信への投票機能追加

これらのファイルは `/supabase/migrations/` フォルダーにあります。

### 3. RLSの無効化（開発中のみ）

開発を簡単にするため、一時的にRLSを無効化できます：

```sql
-- RLSを無効化（開発中のみ推奨）
ALTER TABLE board_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_reply_votes DISABLE ROW LEVEL SECURITY;
```

### 4. 確認
1. Supabaseダッシュボードの「Table Editor」でテーブルが作成されているか確認
2. サイトをリロードして、エラーが解消されているか確認

## Renderでのデプロイについて

### メリット
- 無料プランがある
- 自動デプロイが簡単
- 環境変数の管理が楽
- PostgreSQLデータベースも無料で使える

### デメリット
- 無料プランはスリープ機能あり（15分間アクセスがないとスリープ）
- 初回アクセス時に起動に時間がかかる
- 無料プランは月750時間の制限

### 推奨
- 開発・テスト用途：Render無料プランで十分
- 本番環境：有料プラン（$7/月〜）またはVercelを検討

## トラブルシューティング

もしまだエラーが出る場合：

1. ブラウザの開発者ツールでネットワークタブを確認
2. `/api/board/categories` のレスポンスを確認
3. Supabaseのログを確認（Dashboard > Logs）