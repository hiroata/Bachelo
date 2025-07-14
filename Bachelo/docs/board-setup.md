# 掲示板機能セットアップガイド

## 1. Supabase設定

### API Keys取得
1. Supabaseダッシュボードにログイン
2. Settings → API Keysページへ移動
3. 以下の値をコピー：
   - `anon` (public) key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) key → `SUPABASE_SERVICE_ROLE_KEY`
4. Project URLは Settings → General → Project URL からコピー

### 環境変数設定
1. `.env.local`ファイルを作成（`.env.local.example`を参考）
2. 取得した値を設定

```bash
cp .env.local.example .env.local
# エディタで.env.localを編集
```

## 2. データベース設定

### マイグレーション実行
1. Supabaseダッシュボード → SQL Editor
2. 以下のファイルの内容を順番に実行：
   - `/supabase/migrations/001_create_anonymous_voice_posts.sql`
   - `/supabase/migrations/002_create_board_system.sql`

### Storage設定
1. Storage → New bucket
2. バケット名：`images`（掲示板画像用）
3. Public bucketとして作成
4. RLSポリシー設定（任意）

## 3. 掲示板機能の確認

### 開発サーバー起動
```bash
npm run dev
```

### アクセス
- http://localhost:3000/board

### 機能テスト
1. **投稿作成**
   - 「新規投稿」ボタンをクリック
   - カテゴリ、名前、タイトル、本文を入力
   - 画像は最大4枚まで添付可能

2. **投稿閲覧**
   - 投稿一覧からタイトルをクリック
   - 詳細ページで内容確認
   - 閲覧数が自動カウント

3. **返信機能**
   - 投稿詳細ページで「返信する」ボタン
   - 返信への返信も可能（スレッド形式）

4. **カテゴリフィルタ**
   - 上部のカテゴリボタンで絞り込み
   - 「すべて」で全投稿表示

## 4. セキュリティ設定

### レート制限
- 1分間に5投稿まで（IPアドレスベース）
- `/lib/utils/rate-limiter.ts`で調整可能

### 入力制限
- タイトル：200文字まで
- 本文：10000文字まで
- 返信：5000文字まで
- 画像：1ファイル5MB、合計4枚まで

### XSS対策
- DOMPurifyによる自動サニタイズ
- 許可タグ：p, br, strong, em, u, a, blockquote, ul, ol, li

## 5. カスタマイズ

### カテゴリ追加/編集
SQLエディタで以下を実行：
```sql
INSERT INTO board_categories (name, slug, description, display_order) 
VALUES ('新カテゴリ', 'new-category', '説明', 5);
```

### デザイン変更
- `/app/(main)/board/page.tsx` - 一覧ページ
- `/app/(main)/board/post/[id]/page.tsx` - 詳細ページ
- Tailwind CSSクラスで調整

### 機能追加案
- 検索機能強化
- タグ機能
- いいね/ブックマーク
- 管理者機能
- 通報機能

## トラブルシューティング

### 投稿できない
1. 環境変数が正しく設定されているか確認
2. Supabaseのテーブルが作成されているか確認
3. ブラウザのコンソールでエラーを確認

### 画像がアップロードできない
1. Storageバケット「images」が作成されているか確認
2. バケットがPublicに設定されているか確認
3. ファイルサイズが5MB以下か確認

### レート制限エラー
- 1分待ってから再投稿
- 開発環境では`/lib/utils/rate-limiter.ts`で制限を調整可能