# 🚀 Render.com 直接デプロイガイド

## 方法1: Render CLI を使用（推奨）

### 1. Render CLI のインストール

```bash
# macOS/Linux
curl -sSL https://render.com/install.sh | sh

# Windows (PowerShell)
iwr https://render.com/install.ps1 -useb | iex

# または npm 経由
npm install -g @render-oss/render-cli
```

### 2. Render にログイン

```bash
render login
```

### 3. render.yaml の作成

```yaml
# render.yaml
services:
  - type: web
    name: bachelo
    env: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 18.x
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
```

### 4. デプロイ実行

```bash
# 現在のディレクトリをデプロイ
render up

# または特定のサービスをデプロイ
render deploy bachelo
```

## 方法2: Git なしで Docker を使用

### 1. Dockerfile の作成

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Docker イメージのビルドとプッシュ

```bash
# Docker イメージをビルド
docker build -t bachelo:latest .

# Render のレジストリにタグ付け
docker tag bachelo:latest registry.render.com/bachelo:latest

# Render にプッシュ
docker push registry.render.com/bachelo:latest
```

## 方法3: API を使用した直接デプロイ

### 1. デプロイスクリプトの作成

```bash
#!/bin/bash
# deploy-to-render.sh

# 環境変数
RENDER_API_KEY="your-render-api-key"
SERVICE_ID="srv-your-service-id"

# ビルド
echo "Building project..."
npm run build

# tarball 作成
echo "Creating deployment package..."
tar -czf deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next/cache \
  .

# Render API でデプロイ
echo "Deploying to Render..."
curl -X POST https://api.render.com/v1/services/${SERVICE_ID}/deploys \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "clearCache": "do_not_clear"
  }'

echo "Deployment triggered!"
```

### 2. スクリプトの実行

```bash
chmod +x deploy-to-render.sh
./deploy-to-render.sh
```

## 方法4: rsync を使用（Build Hook 経由）

### 1. Render で Build Hook を作成
Render ダッシュボード → Settings → Build & Deploy → Deploy Hook URL をコピー

### 2. デプロイスクリプト

```bash
#!/bin/bash
# quick-deploy.sh

# Build Hook URL
DEPLOY_HOOK="https://api.render.com/deploy/srv-xxxxx?key=xxxxx"

# ローカルでビルド
npm run build

# デプロイをトリガー
curl -X POST "$DEPLOY_HOOK"

echo "Deploy triggered via webhook!"
```

## 🎯 最も簡単な方法

### ワンライナーデプロイ

```bash
# 環境変数を設定後、以下を実行
npx render-deploy --service bachelo --env production
```

## 📝 注意事項

1. **環境変数**: Render のダッシュボードで事前に設定が必要
2. **ビルドサイズ**: 500MB 以下に収める必要がある
3. **タイムアウト**: ビルドは 20 分以内に完了する必要がある

## 🔑 API キーの取得方法

1. Render ダッシュボード → Account Settings
2. API Keys → Create API Key
3. キーを安全に保管

## 推奨コマンド（最速）

```bash
# 1. render.yaml がある場合
render up

# 2. Build Hook を使う場合
curl -X POST "https://api.render.com/deploy/srv-your-service-id?key=your-deploy-key"

# 3. CLI で特定サービスをデプロイ
render deploy bachelo --yes
```

---

これらの方法で GitHub を経由せずに直接 Render にデプロイできます。