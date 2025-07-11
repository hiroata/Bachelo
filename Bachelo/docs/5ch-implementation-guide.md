# 5ch型掲示板システム実装ガイド

## 📌 実装完了内容

### 1. データベース構造
- **boards**: 板管理テーブル（なんJ、ニュー速VIP等）
- **threads**: スレッド管理テーブル
- **posts**: レス管理テーブル
- **post_anchors**: アンカー（>>1等）管理
- **post_images**: 画像アップロード対応

### 2. 主要機能
- ✅ 板→スレッド→レスの階層構造
- ✅ レス番号システム（1〜1000）
- ✅ アンカー機能（>>1, >>2-5等）
- ✅ ID表示（IPハッシュベース）
- ✅ sage機能（メール欄）
- ✅ 1000レス自動ロック
- ✅ スレッドの勢い計算
- ✅ dat落ち対応（is_archived）

### 3. ページ構成
- `/5ch` - 板一覧
- `/[board]` - スレッド一覧（例: /livejupiter）
- `/test/read/[board]/[thread]` - スレッド詳細（5ch互換URL）
- `/[board]/create` - スレッド作成

## 🚀 セットアップ手順

### 1. Supabaseでマイグレーション実行
以下の順番でSQLを実行してください：

```sql
-- 1. 5ch型スキーマ作成
supabase/migrations/012_create_5ch_schema.sql

-- 2. 初期板データ投入
supabase/migrations/013_insert_initial_boards.sql
```

### 2. 既存データの移行（オプション）
既存の掲示板データがある場合：

```bash
npm run migrate:5ch
```

### 3. 動作確認
1. `http://localhost:3000/5ch` にアクセス
2. 板を選択してスレッド一覧を表示
3. スレッドを作成・レスを投稿

## 📊 初期板一覧

### ニュース系
- **ニュース速報+** (/newsplus)
- **ニュース速報** (/news)
- **ニュー速VIP** (/news4vip)

### 雑談系
- **なんでも実況J** (/livejupiter) - なんJ
- **モーニング娘。（狼）** (/morningcoffee)
- **嫌儲** (/poverty)

### 趣味系
- **ゲーム速報** (/gamesm)
- **アニメ** (/anime)
- **漫画** (/comic)
- **音楽** (/music)
- **映画** (/movie)
- **スポーツ** (/sports)

### 生活系
- **ファッション** (/fashion)
- **料理・グルメ** (/food)
- **恋愛** (/love)
- **仕事** (/job)
- **お金** (/money)

### 専門系
- **プログラミング** (/tech)
- **科学** (/science)
- **健康** (/health)

## 🔧 カスタマイズ

### 板の追加
```sql
INSERT INTO boards (slug, name, description, category, default_name) VALUES
('your_board', '板名', '説明', 'カテゴリー', 'デフォルト名無し');
```

### 板ごとの設定変更
```sql
UPDATE boards 
SET settings = jsonb_build_object(
  'enable_id', true,      -- ID表示
  'enable_trip', true,    -- トリップ対応
  'thread_autosage', 1000 -- 自動sage
)
WHERE slug = 'your_board';
```

## 📈 今後の拡張予定

### Phase 1: パフォーマンス最適化
- Redisキャッシュ導入
- インデックス最適化
- CDN統合

### Phase 2: 追加機能
- トリップ機能
- BE（ID末尾）対応
- スレッド検索
- 過去ログ倉庫
- NGワード/NGID

### Phase 3: 管理機能
- 管理画面
- スレッド/レス削除（あぼーん）
- IP規制
- スレッドストッパー

## 🐛 既知の問題

1. **画像アップロード未実装**
   - post_imagesテーブルは作成済みだが、UIは未実装

2. **リアルタイム更新なし**
   - 現在は手動リロードが必要

3. **モバイル最適化不完全**
   - レスポンシブ対応は基本的な部分のみ

## 💡 Tips

### スレッドURL形式
- 新形式: `/test/read/livejupiter/1234567890`
- 板slug + スレッド番号で構成

### sage進行
- メール欄に「sage」と入力するとスレッドが上がらない
- 名前が緑色で表示される

### アンカー
- `>>1` で特定レスへのアンカー
- `>>1-5` で範囲指定
- クリックでジャンプ、ホバーでプレビュー（実装予定）

## 📝 移行スクリプト

既存のboard_posts/board_repliesからの移行：

```bash
cd scripts
npm run ts-node migrate-to-5ch.ts
```

これにより：
- board_posts → threads + posts（レス番号1）
- board_replies → posts（レス番号2以降）
- カテゴリー → 適切な板にマッピング

移行後は旧テーブルは残るので、問題なければ手動で削除してください。