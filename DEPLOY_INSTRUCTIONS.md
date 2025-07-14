# Bacheloデプロイ手順

## Render.comへのデプロイ（推奨）

**Render.com**を使用してNext.jsアプリケーションをデプロイします。

### 1. GitHubにプッシュ
```bash
git add -A
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Render.comでデプロイ

1. [Render.com](https://render.com)にアクセス
2. GitHubアカウントでサインイン
3. 「New +」→「Web Service」をクリック
4. GitHubリポジトリ「hiroata/Bachelo」を選択
5. 以下の設定を入力：

   - **Name**: bachelo
   - **Root Directory**: Bachelo
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

6. 環境変数を追加（Settingsタブ）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`

7. 「Create Web Service」をクリック

### 3. デプロイ完了

5-10分でデプロイが完了し、URLが提供されます。

## 代替案：Railway

もしRenderが使えない場合は、[Railway](https://railway.app)も同様に簡単です：

1. GitHubと連携
2. リポジトリを選択
3. 環境変数を設定
4. デプロイ！

## まとめ

Render.comが最も簡単で推奨されるデプロイ方法です。Supabaseとの相性も良好です。