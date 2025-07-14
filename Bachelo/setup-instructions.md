# BACHELO セットアップ手順

## 環境構築

### 1. Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトの設定から以下の情報を取得：
   - Project URL
   - Anon Key
   - Service Role Key

### 2. 環境変数の設定
`.env.local` ファイルを編集して、実際の値を設定：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. データベースのセットアップ
Supabaseダッシュボードの SQL エディタで以下を実行：

```sql
-- supabase/migrations/001_create_anonymous_voice_posts.sql の内容をコピーして実行
```

### 4. ストレージバケットの作成
1. Supabaseダッシュボードの Storage セクションへ移動
2. 新しいバケット「voice-posts」を作成
3. Public バケットとして設定

### 5. 開発サーバーの起動
```bash
npm install
npm run dev
```

## 動作確認

1. ブラウザで http://localhost:3000 にアクセス
2. 「スピード検索」ページが表示されることを確認
3. 「＋ 音声を投稿」ボタンをクリックして投稿モーダルが開くことを確認

## トラブルシューティング

### Supabase接続エラーが発生する場合
- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトがアクティブか確認
- ネットワーク接続を確認

### 音声アップロードが失敗する場合
- ストレージバケットが作成されているか確認
- バケットがPublicに設定されているか確認
- ファイルサイズが10MB以下か確認