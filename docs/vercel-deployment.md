# Vercelデプロイメントガイド

## 1. 環境変数の設定

### Vercelダッシュボードで設定
1. Vercelプロジェクトページを開く
2. Settings → Environment Variables
3. 以下の環境変数を追加：

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dleqvbspjouczytouktv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (service role key) |

4. すべての環境（Production, Preview, Development）に適用

## 2. デプロイ前の確認事項

### ローカルでのビルド確認
```bash
npm run build
```

### 型チェックとリント
```bash
npm run type-check
npm run lint
```

## 3. デプロイ方法

### 方法1: Git Push（推奨）
```bash
git add .
git commit -m "Add board feature"
git push origin main
```
Vercelが自動的にデプロイを開始

### 方法2: Vercel CLI
```bash
npm i -g vercel
vercel
```

## 4. デプロイ後の確認

### 必須確認項目
- [ ] トップページが正常に表示される
- [ ] `/board` 掲示板ページが表示される
- [ ] 新規投稿が作成できる
- [ ] 画像アップロードが機能する
- [ ] 返信機能が動作する

### エラーが発生した場合
1. Vercelダッシュボード → Functions → Logs でエラーログを確認
2. 環境変数が正しく設定されているか確認
3. Supabaseのテーブルが作成されているか確認

## 5. カスタムドメイン設定（オプション）

1. Settings → Domains
2. カスタムドメインを追加
3. DNSレコードを設定

## 6. パフォーマンス最適化

### 画像最適化
- Next.js Image componentを使用
- Vercelの自動画像最適化を活用

### キャッシュ設定
```javascript
// next.config.mjs に追加
module.exports = {
  images: {
    domains: ['dleqvbspjouczytouktv.supabase.co'],
  },
}
```

## トラブルシューティング

### ビルドエラー
- `npm install` を実行
- node_modulesを削除して再インストール
- package-lock.jsonを削除して再生成

### 環境変数エラー
- Vercelダッシュボードで環境変数を確認
- 変数名のタイポをチェック
- 再デプロイを実行

### 500エラー
- Function Logsでエラー詳細を確認
- Supabaseの接続を確認
- APIルートのエラーハンドリングを確認