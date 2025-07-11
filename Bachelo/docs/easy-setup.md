# 🚀 超簡単！掲示板セットアップガイド

## 📋 必要なもの
- Supabaseアカウント（無料）
- 環境変数の設定

## 🎯 3分でセットアップ完了！

### 方法1: 自動セットアップ（推奨）🤖

1. **アプリを起動**
   ```bash
   npm run dev
   ```

2. **掲示板ページにアクセス**
   ```
   http://localhost:3000/board
   ```

3. **完了！** 
   - アプリが自動でテーブルをチェック
   - 存在しない場合は自動でセットアップ
   - カテゴリーも自動で作成

### 方法2: セットアップAPIを直接実行 🔧

ブラウザまたはcurlで以下にアクセス：
```bash
# 基本セットアップ
curl http://localhost:3000/api/setup/board

# サンプル投稿も含めたセットアップ
curl -X POST http://localhost:3000/api/setup/board \
  -H "Content-Type: application/json" \
  -d '{"includeSamples": true}'
```

## ⚠️ 初回のみ必要な作業

Supabaseのテーブル作成だけは手動で行う必要があります：

1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. 以下のSQLを実行：

```sql
-- 最小限の掲示板テーブル
CREATE TABLE IF NOT EXISTS board_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS board_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES board_categories(id),
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  plus_count INTEGER DEFAULT 0,
  minus_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSを無効化（開発用）
ALTER TABLE board_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts DISABLE ROW LEVEL SECURITY;
```

## 🎉 これで完了！

掲示板が使えるようになりました。あとはユーザーが投稿するだけ！

## 💡 トラブルシューティング

### エラーが出る場合
1. 環境変数が正しく設定されているか確認
2. Supabaseのプロジェクトがアクティブか確認
3. ネットワーク接続を確認

### もっとシンプルにしたい場合
将来的には以下の選択肢も検討中：
- ローカルSQLite版（設定不要）
- メモリ内データベース版（テスト用）
- JSONファイル版（超簡易版）