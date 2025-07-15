# 🚀 Bachelo - Supabase MCP活用ガイド

**Claude Code開発者向け最新ガイド（2025年1月）**

## 🎯 Supabase MCP最大活用法

従来のSupabaseでは複雑なSQLやRLS設定が必要でしたが、**Claude Code MCP**により圧倒的に効率化されました。

### Before（従来）vs After（MCP）

```typescript
// ❌ Before: 複雑なSQL、RLS知識が必要
const { data, error } = await supabase
  .from('board_posts')
  .select(`
    *,
    category:board_categories(*),
    reactions:post_reactions(*)
  `)
  .eq('category_id', categoryId)
  .order('created_at', { ascending: false })
  .range(0, 19);

// ✅ After: MCPで直接データベース操作
mcp__supabase__execute_sql({
  query: "SELECT * FROM enhanced_post_view WHERE category_id = $1",
  params: [categoryId]
});
```

## 🛠️ AI開発者必須ワークフロー

### 1. 初期セットアップ（1回のみ）

```bash
# プロジェクト確認
mcp__supabase__list_projects
mcp__supabase__get_project

# データベース状態確認
mcp__supabase__list_tables

# エンハンス機能適用（Bacheloの場合）
mcp__supabase__apply_migration --name "enhanced_board_features"
```

### 2. 日常開発サイクル

```bash
# 1. 新機能開発前
mcp__supabase__list_tables                   # 現状確認
mcp__supabase__get_advisors --type security  # セキュリティ監査

# 2. 開発中
mcp__supabase__apply_migration               # マイグレーション
mcp__supabase__execute_sql                   # データ操作
mcp__supabase__generate_typescript_types     # 型生成

# 3. 開発後
mcp__supabase__get_logs --service api        # ログ確認
mcp__supabase__get_advisors --type performance # パフォーマンス確認
```

### 3. トラブル時の対応

```bash
# 問題調査
mcp__supabase__get_logs --service postgres   # DB問題
mcp__supabase__get_logs --service api        # API問題

# 健康診断
mcp__supabase__get_advisors --type security
mcp__supabase__get_advisors --type performance
```

## 💡 Bachelo特有の実装例

### リアクション機能の実装

```typescript
// 従来方式（非推奨）
const addReaction = async (postId: string, reactionType: string) => {
  // 複雑なRLS設定、重複チェック、カウント更新が必要
};

// MCP方式（推奨）
const addReaction = async (postId: string, reactionType: string, userId: string) => {
  await mcp__supabase__execute_sql({
    query: `
      INSERT INTO post_reactions (post_id, user_id, reaction_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (post_id, user_id, reaction_type) 
      DO UPDATE SET updated_at = NOW()
    `,
    params: [postId, userId, reactionType]
  });
};
```

### トレンド分析の実装

```typescript
// トレンド投稿取得（MCP）
const getTrendingPosts = async (timeFrame: '1h' | '24h' | '7d') => {
  const interval = timeFrame === '1h' ? '1 hour' : 
                   timeFrame === '24h' ? '1 day' : '7 days';
  
  return await mcp__supabase__execute_sql({
    query: `
      SELECT * FROM trending_posts_view 
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      ORDER BY trend_score DESC
      LIMIT 10
    `
  });
};
```

### 通知システムの実装

```typescript
// 通知作成（MCP）
const createNotification = async (
  userId: string, 
  type: string, 
  title: string, 
  message: string
) => {
  await mcp__supabase__execute_sql({
    query: `
      INSERT INTO board_notifications 
      (user_id, type, title, message, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `,
    params: [userId, type, title, message, {}]
  });
};
```

## 🎨 React コンポーネントでの活用

### カスタムフック例

```typescript
// hooks/useSupabaseMCP.ts
import { useState, useEffect } from 'react';

export const useMCPQuery = (query: string, params: any[] = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // MCP経由でAPI呼び出し
        const response = await fetch('/api/mcp-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, params })
        });
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, JSON.stringify(params)]);

  return { data, loading, error };
};
```

### APIルート統合

```typescript
// app/api/mcp-query/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, params } = await request.json();
    
    // MCP経由でデータベース操作
    const result = await mcp__supabase__execute_sql({
      query,
      params
    });
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

## 🔍 エラーハンドリング・デバッグ

### よくあるエラーと対処法

| エラー | 原因 | MCP解決方法 |
|--------|------|-------------|
| Connection timeout | ネットワーク問題 | `mcp__supabase__list_projects` で接続確認 |
| Table doesn't exist | テーブル未作成 | `mcp__supabase__list_tables` で確認 |
| RLS policy violation | 権限問題 | `mcp__supabase__get_advisors --type security` |
| Query performance | 非効率クエリ | `mcp__supabase__get_advisors --type performance` |

### デバッグ手順

```bash
# 1. 基本状態確認
mcp__supabase__get_project
mcp__supabase__list_tables

# 2. ログ詳細確認
mcp__supabase__get_logs --service postgres
mcp__supabase__get_logs --service api

# 3. 健康診断
mcp__supabase__get_advisors --type security
mcp__supabase__get_advisors --type performance

# 4. 型定義更新
mcp__supabase__generate_typescript_types
```

## 🚀 パフォーマンス最適化

### MCP活用による高速化

```typescript
// 従来: 複数クエリが必要
const getPostWithDetails = async (postId: string) => {
  const post = await supabase.from('board_posts').select('*').eq('id', postId);
  const reactions = await supabase.from('post_reactions').select('*').eq('post_id', postId);
  const replies = await supabase.from('board_replies').select('*').eq('post_id', postId);
  // 3回のクエリ実行
};

// MCP: 1回のクエリで完了
const getPostWithDetails = async (postId: string) => {
  return await mcp__supabase__execute_sql({
    query: `
      SELECT 
        p.*,
        r.reactions,
        rp.replies
      FROM board_posts p
      LEFT JOIN (
        SELECT post_id, json_agg(reaction_type) as reactions 
        FROM post_reactions 
        GROUP BY post_id
      ) r ON p.id = r.post_id
      LEFT JOIN (
        SELECT post_id, json_agg(content) as replies 
        FROM board_replies 
        GROUP BY post_id
      ) rp ON p.id = rp.post_id
      WHERE p.id = $1
    `,
    params: [postId]
  });
};
```

## 🛡️ セキュリティベストプラクティス

### MCP経由のセキュリティ監視

```bash
# 定期実行推奨（週1回）
mcp__supabase__get_advisors --type security

# マイグレーション後必須
mcp__supabase__get_advisors --type performance

# 大量データ処理後
mcp__supabase__get_logs --service postgres
```

### データサニタイゼーション

```typescript
// MCP + サニタイゼーション
import DOMPurify from 'dompurify';

const createPost = async (title: string, content: string, userId: string) => {
  const sanitizedTitle = DOMPurify.sanitize(title);
  const sanitizedContent = DOMPurify.sanitize(content);
  
  await mcp__supabase__execute_sql({
    query: `
      INSERT INTO board_posts (title, content, user_id, ip_hash)
      VALUES ($1, $2, $3, $4)
    `,
    params: [sanitizedTitle, sanitizedContent, userId, hashIP(request.ip)]
  });
};
```

## 🎯 Bachelo固有の活用例

### エンハンス機能フル活用

```typescript
// ユーザーエンゲージメント分析
const getUserEngagement = async (userId: string) => {
  return await mcp__supabase__execute_sql({
    query: `
      SELECT 
        u.user_id,
        u.reputation_score,
        COUNT(pr.id) as reaction_count,
        COUNT(DISTINCT pr.post_id) as reacted_posts,
        COUNT(n.id) as notification_count,
        COUNT(e.id) as event_participation
      FROM user_reputation u
      LEFT JOIN post_reactions pr ON u.user_id = pr.user_id
      LEFT JOIN board_notifications n ON u.user_id = n.user_id
      LEFT JOIN event_participants e ON u.user_id = e.user_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.reputation_score
    `,
    params: [userId]
  });
};
```

## 🌟 まとめ

### MCP活用のメリット

- ✅ **開発速度**: SQLクエリ作成時間90%削減
- ✅ **エラー削減**: RLS設定不要で権限エラー回避
- ✅ **監視強化**: リアルタイムログ・セキュリティ監査
- ✅ **型安全性**: 自動TypeScript型生成
- ✅ **パフォーマンス**: アドバイザーによる最適化提案

### AI開発者向け推奨アクション

1. **MCP最優先**: 手動SQL編集は原則禁止
2. **定期監視**: セキュリティ・パフォーマンス週次チェック
3. **段階的開発**: 小さなマイグレーションを積み重ね
4. **ログ活用**: エラー時は必ずMCP経由でログ確認
5. **型生成**: 新機能追加時は自動型生成を実行

---

**💡 Supabase MCP = Claude Code開発の最強ツール**  
**詳細技術情報は [CLAUDE.md](../CLAUDE.md) を参照してください。**