# Bachelo デプロイメントガイド

## Renderを選ぶ理由

### 開発・テスト環境として最適
- **無料プランあり** - 初期費用なしでスタート可能
- **簡単なセットアップ** - GitHubリポジトリと連携するだけ
- **自動デプロイ** - プッシュ時に自動でデプロイ
- **環境変数管理** - UIから簡単に設定可能
- **HTTPS自動対応** - SSL証明書の設定不要
- **PostgreSQL無料** - データベースも無料で利用可能

### Vercelとの比較
| 機能 | Render | Vercel |
|------|---------|---------|
| Next.js対応 | ✅ | ✅（公式推奨） |
| 無料プラン | ✅（750時間/月） | ✅（商用利用制限） |
| スリープ機能 | あり（15分） | なし |
| ビルド時間 | 3-5分 | 1-2分 |
| カスタムドメイン | 有料プランのみ | 無料プランでも可 |
| サーバーサイド処理 | フル対応 | 一部制限あり |

## 前提条件

### 必要なもの
1. GitHubアカウント
2. Renderアカウント（無料）
3. Supabaseプロジェクト（セットアップ済み）
4. Node.js 18以上

### 確認事項
- ローカルで `npm run build` が成功すること
- Supabaseのテーブルとマイグレーションが完了していること
- 環境変数が準備されていること

## セットアップ手順

### 1. GitHubリポジトリの準備
```bash
# 最新のコードをプッシュ
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Renderでの新規プロジェクト作成
1. [Render Dashboard](https://dashboard.render.com)にログイン
2. 「New +」→「Web Service」を選択
3. GitHubアカウントを連携
4. リポジトリを選択

### 3. ビルド設定
```yaml
Name: bachelo
Region: Singapore (アジアに近い)
Branch: main
Root Directory: ./Bachelo (プロジェクトのパスを指定)
Build Command: npm install && npm run build
Start Command: npm start
```

### 4. 環境設定
- **Instance Type**: Free
- **Environment**: Node

## 環境変数設定

### Renderダッシュボードで設定
「Environment」タブで以下を追加：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# セキュリティ設定
CRON_SECRET=your_cron_secret_here

# Node.js設定
NODE_ENV=production
```

### 環境変数の取得方法
1. **Supabase URL & Keys**
   - Supabaseダッシュボード → Settings → API
   - Project URLとAPI Keysをコピー

2. **CRON_SECRET**
   - ランダムな文字列を生成
   ```bash
   openssl rand -base64 32
   ```

## デプロイ実行

### 初回デプロイ
1. すべての設定を確認
2. 「Create Web Service」をクリック
3. ビルドログを監視（3-5分）
4. 成功したらURLが表示される

### デプロイの確認
```bash
# APIエンドポイントのテスト
curl https://your-app.onrender.com/api/board/categories

# ヘルスチェック
curl https://your-app.onrender.com/api/health
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー
**症状**: "Module not found" エラー
```bash
# 解決方法
npm install
npm run build  # ローカルで確認
git add package-lock.json
git commit -m "Fix dependencies"
git push
```

#### 2. 500エラー
**症状**: ページアクセス時に500エラー
```bash
# チェックリスト
1. 環境変数が正しく設定されているか確認
2. Supabaseの接続を確認
3. ビルドコマンドが正しいか確認
4. ログでエラーの詳細を確認
```

#### 3. スリープからの復帰が遅い
**症状**: 初回アクセスに30秒以上かかる
```bash
# 対策
1. 定期的にアクセスするcronジョブを設定
2. Uptime Robotなどの監視サービスを使用
3. 有料プランへのアップグレードを検討
```

#### 4. Supabase接続エラー
**症状**: "Failed to connect to Supabase"
```bash
# 確認手順
1. Supabase URLが正しいか確認
2. API Keyが正しいか確認
3. Supabaseのダッシュボードでプロジェクトが起動しているか確認
4. RLSポリシーが適切に設定されているか確認
```

### ログの確認方法
1. Renderダッシュボード → 「Logs」タブ
2. フィルター機能で絞り込み
3. エラーメッセージを検索

## 本番環境のベストプラクティス

### セキュリティ
1. **環境変数の管理**
   - 本番用の強力なキーを使用
   - 定期的にローテーション
   - GitHubにコミットしない

2. **アクセス制御**
   - CORSの適切な設定
   - レート制限の実装
   - IPホワイトリスト（必要な場合）

### パフォーマンス最適化
1. **キャッシング戦略**
   ```typescript
   // API Routeでのキャッシュ設定
   export const revalidate = 60; // 60秒キャッシュ
   ```

2. **画像最適化**
   - Next.js Image Componentの使用
   - 適切なフォーマット（WebP）
   - CDNの活用

3. **データベース最適化**
   - インデックスの追加
   - 不要なクエリの削減
   - Connection Poolingの設定

### スケーリング
1. **無料プランの限界**
   - 月750時間（約31日間）
   - 512MBメモリ
   - 0.1 CPU

2. **有料プランへの移行タイミング**
   - アクティブユーザーが100人を超えたら
   - レスポンスタイムが重要になったら
   - スリープ解除の待ち時間が問題になったら

## 監視とメンテナンス

### 監視ツールの設定
1. **Uptime Robot（無料）**
   - 5分間隔でヘルスチェック
   - ダウンタイム通知
   - レスポンスタイム記録

2. **Render Metrics**
   - CPU使用率
   - メモリ使用率
   - リクエスト数

### 定期メンテナンス
1. **週次タスク**
   - ログの確認
   - エラー率の監視
   - パフォーマンス指標の確認

2. **月次タスク**
   - 依存関係の更新
   - セキュリティパッチの適用
   - バックアップの確認

3. **クリーンアップジョブ**
   ```bash
   # Render Cron Jobsで設定
   0 3 * * * curl -X POST https://your-app.onrender.com/api/cleanup \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

## コスト管理

### 無料プランで運用するコツ
1. **効率的なリソース使用**
   - 不要なログを削減
   - 画像のサイズ最適化
   - キャッシュの活用

2. **トラフィック管理**
   - robots.txtでクローラー制限
   - 不要なAPIコールの削減

### 有料プランの選択
| プラン | 料金 | CPU | メモリ | 特徴 |
|--------|------|-----|--------|------|
| Free | $0 | 0.1 | 512MB | 15分でスリープ |
| Starter | $7/月 | 0.5 | 512MB | スリープなし |
| Standard | $25/月 | 1.0 | 2GB | オートスケール |

## まとめ

### Renderが適している場合
- 開発・ステージング環境
- 小規模なプロジェクト
- コストを抑えたい場合
- フルスタックアプリケーション

### 他のオプションを検討すべき場合
- 大規模なトラフィックが予想される
- ミリ秒単位のレスポンスが必要
- エッジコンピューティングが必要
- 複雑なインフラ要件がある

## 参考リンク
- [Render Documentation](https://render.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)