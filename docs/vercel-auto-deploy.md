# Vercel自動デプロイ設定ガイド

## GitHubとVercelの連携設定

### 1. Vercelプロジェクト設定
1. Vercelダッシュボード → プロジェクト選択
2. **Settings** → **Git**

### 2. Git Integration設定
以下を確認・設定：

#### Production Branch
- Branch: `main`
- 自動デプロイ: ✅ 有効

#### Preview Branches
- All Branches: ✅ 有効（プルリクエストごとにプレビュー環境を作成）

### 3. GitHub Integration確認
1. **Connected Git Repository**
   - Repository: `hiroata/Bachelo`
   - ✅ 接続済み

2. **Deploy Hooks**（オプション）
   - 特定のイベントでデプロイをトリガー

### 4. 自動デプロイの流れ
```
1. git push origin main
   ↓
2. GitHubがVercelに通知
   ↓
3. Vercelが自動ビルド開始
   ↓
4. ビルド成功後、自動デプロイ
```

## トラブルシューティング

### 自動デプロイが動作しない場合

#### 1. GitHub App権限確認
1. GitHub → Settings → Applications → Vercel
2. Repository accessで`Bachelo`が選択されているか確認

#### 2. Vercelで再接続
1. Settings → Git → Disconnect
2. Connect Git Repository → GitHub → Bacheloを選択

#### 3. Webhook確認
GitHub → リポジトリ → Settings → Webhooks
- Vercelのwebhookが存在するか確認

### ビルド通知設定

#### Vercelダッシュボード
1. Settings → Notifications
2. 以下を設定可能：
   - Email通知
   - Slack通知
   - Discord通知

#### GitHub Actions（オプション）
```yaml
name: Vercel Deploy Status
on:
  deployment_status:
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify deploy status
        run: echo "Deploy ${{ github.event.deployment_status.state }}"
```

## 推奨設定

### 1. ブランチ保護
```
main ブランチ:
- プルリクエスト必須
- ビルドチェック必須
- 自動マージ設定
```

### 2. 環境変数管理
```
Production: 本番環境の変数
Preview: 開発環境の変数
```

### 3. ビルド最適化
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## コマンドライン操作

### Vercel CLI
```bash
# インストール
npm i -g vercel

# ログイン
vercel login

# 手動デプロイ
vercel

# 本番デプロイ
vercel --prod

# ログ確認
vercel logs
```

### 便利なスクリプト
```json
// package.json
{
  "scripts": {
    "deploy": "vercel",
    "deploy:prod": "vercel --prod"
  }
}
```