# 🔞 Adult BBS System - デプロイ手順

## ⚠️ 重要な制限事項

**このシステムはアダルト専用です。健全コンテンツへの変更は禁止されています。**

## 🚀 Render.comへのデプロイ（唯一の推奨方法）

### 前提条件

- GitHub: https://github.com/hiroata/Bachelo.git (main ブランチ)
- Firebase/Vercel は完全に除去済み
- アダルト専用保護システム実装済み

### 1. GitHubプッシュ確認

```bash
git add -A
git commit -m "Deploy adult BBS system to production"
git push origin main
```

### 2. Render.com設定

1. [Render.com](https://render.com) アクセス
2. GitHubアカウントでサインイン
3. 「New +」→「Web Service」
4. リポジトリ「hiroata/Bachelo」選択
5. 設定項目：

   - **Name**: bachelo-adult-bbs
   - **Root Directory**: (ルート)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18.17.0+

### 3. 環境変数設定 (Settings タブ)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
```

### 4. アダルト専用データベース確認

デプロイ前に以下のマイグレーションが適用されていることを確認：

```sql
-- 重要：ultra-detailed-adult-categories-fixed-v2.sql
-- 17主要カテゴリ + 100+サブカテゴリ
-- 健全化防止制約
```

## 🔐 セキュリティ設定

### ドメイン制限

```yaml
# render.yaml (既に設定済み)
services:
  - type: web
    name: bachelo-adult
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

### アダルト検証

1. **年齢確認ゲート**: 自動実装済み
2. **成人向けコンテンツ警告**: 表示済み
3. **未成年アクセス制限**: 有効

## ❌ 禁止事項

1. **Firebase使用禁止** - 完全に除去済み
2. **Vercel使用禁止** - 完全に除去済み  
3. **健全コンテンツ追加禁止** - 保護システムで防御
4. **カテゴリ削除禁止** - データベース制約で防御

## 🎯 デプロイ後確認事項

1. **アダルトカテゴリ表示確認**
2. **保護システム動作確認**
3. **年齢確認ゲート機能確認**
4. **Firebase/Vercel完全除去確認**
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