# 5ch型大規模掲示板アーキテクチャ設計書

## 🎯 目標：5chのような大規模掲示板システム

### 現在の実装状況
- ✅ 基本的な投稿・返信機能
- ✅ カテゴリー分類（20カテゴリー）
- ✅ 画像アップロード
- ✅ 投票システム
- ✅ 削除機能（30分制限）

### 5ch化に必要な機能

## 📊 データベース設計の拡張

### 1. 板（Board）システム
```sql
-- 板テーブル（カテゴリーを板に拡張）
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,        -- なんJ、ニュー速VIP等
  slug VARCHAR(50) UNIQUE NOT NULL,   -- /livejupiter/
  description TEXT,
  category VARCHAR(50),               -- ニュース、雑談、趣味等
  settings JSONB DEFAULT '{}',        -- 板ごとの設定
  max_threads INTEGER DEFAULT 1000,   -- 最大スレッド数
  default_name VARCHAR(50) DEFAULT '名無しさん',
  created_at TIMESTAMP DEFAULT NOW()
);

-- スレッドテーブル（現在のboard_postsを拡張）
CREATE TABLE threads (
  id BIGSERIAL PRIMARY KEY,          -- 数値IDでパフォーマンス向上
  board_id UUID REFERENCES boards(id),
  thread_number INTEGER NOT NULL,     -- スレッド番号
  title VARCHAR(200) NOT NULL,
  author_name VARCHAR(100),
  author_email VARCHAR(100),
  author_id VARCHAR(20),             -- ID:xxxx形式
  content TEXT NOT NULL,
  ip_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_post_at TIMESTAMP DEFAULT NOW(),
  post_count INTEGER DEFAULT 1,
  is_archived BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  UNIQUE(board_id, thread_number)
);

-- レステーブル
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT REFERENCES threads(id) ON DELETE CASCADE,
  post_number INTEGER NOT NULL,      -- レス番号
  author_name VARCHAR(100),
  author_email VARCHAR(100),
  author_id VARCHAR(20),
  content TEXT NOT NULL,
  ip_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  -- アンカー関連
  anchors INTEGER[] DEFAULT '{}',    -- >>1,5,10 等への参照
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  UNIQUE(thread_id, post_number)
);

-- インデックス（高速化）
CREATE INDEX idx_threads_board_last_post ON threads(board_id, last_post_at DESC);
CREATE INDEX idx_threads_board_created ON threads(board_id, created_at DESC);
CREATE INDEX idx_posts_thread_number ON posts(thread_id, post_number);
CREATE INDEX idx_posts_anchors ON posts USING GIN(anchors);
```

## 🚀 パフォーマンス最適化

### 1. キャッシュ戦略
```typescript
// Redis/Upstashを使用したキャッシュ
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// スレッド一覧のキャッシュ（1分間）
export async function getCachedThreadList(boardId: string) {
  const cacheKey = `board:${boardId}:threads`;
  const cached = await redis.get(cacheKey);
  
  if (cached) return cached;
  
  const threads = await fetchThreadsFromDB(boardId);
  await redis.setex(cacheKey, 60, JSON.stringify(threads));
  return threads;
}
```

### 2. データベース最適化
```sql
-- パーティショニング（月ごとにテーブル分割）
CREATE TABLE posts_2025_01 PARTITION OF posts
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- マテリアライズドビュー（人気スレッド）
CREATE MATERIALIZED VIEW popular_threads AS
SELECT 
  t.*,
  COUNT(p.id) as reply_count,
  MAX(p.created_at) as last_reply_at
FROM threads t
LEFT JOIN posts p ON t.id = p.thread_id
WHERE t.created_at > NOW() - INTERVAL '7 days'
GROUP BY t.id
ORDER BY reply_count DESC;

-- 定期的に更新
REFRESH MATERIALIZED VIEW CONCURRENTLY popular_threads;
```

## 📱 5ch特有の機能実装

### 1. レス番号とアンカー機能
```typescript
// lib/utils/anchor-parser.ts
export function parseAnchors(content: string): number[] {
  const anchorPattern = />>(\d+)/g;
  const anchors: number[] = [];
  let match;
  
  while ((match = anchorPattern.exec(content)) !== null) {
    anchors.push(parseInt(match[1]));
  }
  
  return [...new Set(anchors)]; // 重複除去
}

// アンカーをリンクに変換
export function renderAnchors(content: string, threadId: string): string {
  return content.replace(/>>(\d+)/g, (match, num) => {
    return `<a href="#${num}" class="anchor" data-post="${num}">${match}</a>`;
  });
}
```

### 2. ID表示システム
```typescript
// 日付ベースのID生成（5ch方式）
export function generatePostId(ipHash: string): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(5, 10).replace('-', '');
  const hash = ipHash.slice(0, 8);
  return `ID:${dateStr}${hash}`;
}
```

### 3. 1000レス制限と次スレ機能
```typescript
// スレッドが1000に達したら自動的にロック
export async function checkThreadLimit(threadId: string) {
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('thread_id', threadId);
    
  if (count >= 1000) {
    await supabase
      .from('threads')
      .update({ is_locked: true })
      .eq('id', threadId);
      
    // 次スレ作成を促す
    return { shouldCreateNext: true, currentPart: getCurrentPart(threadTitle) };
  }
}
```

## 🔧 実装ロードマップ

### Phase 1: 基盤整備（1週間）
1. データベーススキーマの移行
2. 板システムの実装
3. スレッド型への移行

### Phase 2: 5ch機能実装（2週間）
1. レス番号システム
2. アンカー機能
3. ID表示
4. sage機能
5. トリップ機能

### Phase 3: パフォーマンス最適化（1週間）
1. Redisキャッシュ導入
2. CDN設定（Cloudflare）
3. 画像最適化
4. データベースインデックス調整

### Phase 4: スケーラビリティ（2週間）
1. Read Replicaの設定
2. ロードバランサー
3. 非同期ジョブキュー（BullMQ）
4. モニタリング（Sentry、NewRelic）

## 💰 コスト見積もり

### 小規模（〜10万PV/月）
- Supabase Pro: $25/月
- Vercel Pro: $20/月
- Upstash Redis: $0〜10/月
- 合計: 約$55/月

### 中規模（〜100万PV/月）
- Supabase Pro: $25/月
- Vercel Pro: $20/月
- Upstash Redis: $50/月
- Cloudflare Pro: $20/月
- 合計: 約$115/月

### 大規模（1000万PV/月〜）
- Supabase Enterprise: カスタム価格
- Vercel Enterprise: カスタム価格
- 専用サーバー検討

## 🎯 次のステップ

1. **データベース移行スクリプトの作成**
2. **板システムの実装**
3. **スレッド型UIへの変更**

どこから始めますか？