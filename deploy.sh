#!/bin/bash

# Render Deploy Hook URL を設定
# ダッシュボードから取得してください
DEPLOY_HOOK_URL="https://api.render.com/deploy/srv-YOUR-SERVICE-ID?key=YOUR-DEPLOY-KEY"

echo "🚀 Deploying to Render.com..."

# デプロイをトリガー
response=$(curl -s -X POST "$DEPLOY_HOOK_URL")

if [ $? -eq 0 ]; then
    echo "✅ Deploy triggered successfully!"
    echo "📊 Response: $response"
    echo "🔍 Check your Render dashboard for deploy status"
else
    echo "❌ Deploy failed!"
    exit 1
fi