# 🚀 Render.com デプロイ修正ガイド

## 🚨 現在のエラー
```
Error: either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!
```

## 🔧 修正手順

### 1. Render.comダッシュボードでの環境変数設定

1. **Render.comダッシュボードにログイン**
   - https://dashboard.render.com/

2. **Bacheloサービスを選択**

3. **Environment タブをクリック**

4. **以下の環境変数を追加**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dleqvbspjouczytouktv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZXF2YnNwam91Y3p5dG91a3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA4NzU3NTMsImV4cCI6MjAzNjQ1MTc1M30.your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   CRON_SECRET=your_cron_secret_here
   ```

### 2. 修正済みコード

以下のファイルを修正しました：

#### `next.config.js`
- build時の環境変数フォールバック追加

#### `lib/supabase/client.ts`
- build時のモッククライアント追加

#### `lib/supabase/server.ts`
- build時のモッククライアント追加

### 3. 再デプロイ

環境変数を設定後、**Manual Deploy** または **Redeploy** を実行してください。

## 🎯 期待される結果

- ✅ ビルドが成功
- ✅ 静的ページ生成が完了
- ✅ 40個のページエラーが解決
- ✅ サイトが正常に動作

## 🔍 デバッグ方法

### ビルドログ確認
```bash
# ビルドログでエラーがないか確認
npm run build
```

### 環境変数確認
```bash
# 環境変数が正しく設定されているか確認
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 📞 サポート

デプロイが失敗する場合は：
1. 環境変数が正しく設定されているか再確認
2. Render.comのログを確認
3. GitHub repositoryの最新コミットを確認

---

**最終更新**: 2025-01-16
**修正者**: Claude Code Assistant