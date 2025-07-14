# 🚀 Bachelo - Supabase 簡単ガイド

このガイドでは、**SQLを書かずに**Supabaseを使う方法を説明します。

## 📋 目次

1. [基本的な考え方](#基本的な考え方)
2. [データの取得](#データの取得)
3. [データの作成・更新・削除](#データの作成更新削除)
4. [ファイルアップロード](#ファイルアップロード)
5. [リアルタイム更新](#リアルタイム更新)
6. [よくある使用例](#よくある使用例)
7. [トラブルシューティング](#トラブルシューティング)

## 基本的な考え方

従来のSupabase:
```typescript
// ❌ SQLやRLSの知識が必要
const { data, error } = await supabase
  .from('board_posts')
  .select('*, category:board_categories(*)')
  .eq('category_id', categoryId)
  .order('created_at', { ascending: false })
  .range(0, 19)
```

新しい方法:
```typescript
// ✅ ヘルパー関数を使う（SQLを書かない）
const result = await db.getPaginated('board_posts', {
  page: 1,
  filters: { category_id: categoryId }
});
```

## データの取得

### 1. フロントエンド（React）での使用

```tsx
import { useBoardPosts, useCategories } from '@/hooks/useSupabaseQuery';

function BoardPage() {
  // カテゴリー一覧を取得
  const { categories, loading: categoriesLoading } = useCategories();
  
  // 投稿一覧を取得（ページネーション付き）
  const { data, loading, error, refetch } = useBoardPosts(categoryId, page);
  
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;
  
  return (
    <div>
      {data.items.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      <Pagination 
        currentPage={data.currentPage}
        totalPages={data.totalPages}
      />
    </div>
  );
}
```

### 2. APIルート（サーバー側）での使用

```typescript
// app/api/board/posts/route.ts
import * as db from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  // ページネーション付きで取得
  const posts = await db.getPaginated('board_posts', {
    page: 1,
    perPage: 20
  });
  
  return NextResponse.json(posts);
}
```

## データの作成・更新・削除

### フロントエンドから

```tsx
import { useMutation } from '@/hooks/useSupabaseQuery';

function CreatePostForm() {
  const { create, loading } = useMutation();
  
  const handleSubmit = async (data) => {
    try {
      // APIルート経由で作成（自動的にサニタイズされる）
      const newPost = await create('board_posts', {
        title: data.title,
        content: data.content,
        category_id: data.categoryId,
        author_name: data.authorName
      });
      
      toast.success('投稿を作成しました！');
    } catch (error) {
      toast.error('エラーが発生しました');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* フォーム要素 */}
    </form>
  );
}
```

### APIルートで

```typescript
// 投稿を作成
export async function POST(request: NextRequest) {
  const data = await request.json();
  
  // ヘルパー関数で簡単に作成
  const newPost = await db.create('board_posts', {
    title: DOMPurify.sanitize(data.title),
    content: DOMPurify.sanitize(data.content),
    category_id: data.category_id,
    author_name: data.author_name
  });
  
  return NextResponse.json(newPost);
}

// 投稿を更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  
  const updatedPost = await db.update('board_posts', params.id, {
    title: data.title,
    content: data.content
  });
  
  return NextResponse.json(updatedPost);
}

// 投稿を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.remove('board_posts', params.id);
  return NextResponse.json({ success: true });
}
```

## ファイルアップロード

```typescript
// 画像をアップロード
const handleImageUpload = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { publicUrl } = await db.uploadFile(
    'images',           // バケット名
    fileName,           // ファイルパス
    file,              // ファイル本体
    { contentType: file.type }
  );
  
  return publicUrl;
};

// 複数画像をアップロード
const uploadMultipleImages = async (files: File[]) => {
  const uploadPromises = files.map(file => handleImageUpload(file));
  const urls = await Promise.all(uploadPromises);
  return urls;
};
```

## リアルタイム更新

```tsx
// 音声投稿をリアルタイムで取得
function VoiceBoard() {
  const { posts, loading } = useVoicePosts('female', { 
    realtime: true  // リアルタイム更新を有効化
  });
  
  return (
    <div>
      {posts.map(post => (
        <VoicePostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// カスタムリアルタイム処理
function CustomRealtimeComponent() {
  const [posts, setPosts] = useState([]);
  
  useRealtimeSubscription('board_posts', {
    onInsert: (newPost) => {
      // 新しい投稿が追加されたとき
      setPosts(prev => [newPost, ...prev]);
      toast.info('新しい投稿があります！');
    },
    onUpdate: (updatedPost) => {
      // 投稿が更新されたとき
      setPosts(prev => prev.map(p => 
        p.id === updatedPost.id ? updatedPost : p
      ));
    }
  });
  
  return <PostList posts={posts} />;
}
```

## よくある使用例

### 投票機能の実装

```typescript
// APIルート: app/api/board/posts/[id]/vote/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { voteType } = await request.json();
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // 投票を追加（重複チェック付き）
  const result = await db.addVote(
    'board_post_votes',
    params.id,
    ip,
    voteType
  );
  
  // 投票数を再計算
  const counts = await db.recalculateVotes('board_posts', params.id);
  
  return NextResponse.json({
    action: result.action,
    plusCount: counts.plusCount,
    minusCount: counts.minusCount
  });
}
```

### 返信機能の実装

```typescript
// 返信を追加してカウントを更新
export async function createReply(postId: string, replyData: any) {
  return await db.withTransaction(async () => {
    // 1. 返信を作成
    const reply = await db.create('board_replies', {
      post_id: postId,
      author_name: replyData.authorName,
      content: replyData.content
    });
    
    // 2. 返信数を自動更新
    await db.updateReplyCount(postId);
    
    return reply;
  });
}
```

### 検索機能

```typescript
// カスタム検索（プリセットクエリを使用）
const searchPosts = async (keyword: string) => {
  // 最新の投稿から検索
  const recent = await db.queries.getLatestPosts(100);
  
  // キーワードでフィルタリング
  const filtered = recent.data.filter(post => 
    post.title.includes(keyword) || 
    post.content.includes(keyword)
  );
  
  return filtered;
};
```

## トラブルシューティング

### よくあるエラーと対処法

1. **「permission denied」エラー**
   ```typescript
   // ❌ RLSが有効な場合
   const { data, error } = await supabase.from('posts').select();
   
   // ✅ APIルート経由で取得
   const response = await fetch('/api/board/posts');
   const data = await response.json();
   ```

2. **「invalid input syntax for type uuid」エラー**
   ```typescript
   // ❌ 不正なID形式
   await db.getById('board_posts', 'invalid-id');
   
   // ✅ 正しいUUID形式
   await db.getById('board_posts', '123e4567-e89b-12d3-a456-426614174000');
   ```

3. **リアルタイム更新が動かない**
   ```typescript
   // ✅ テーブル名とイベントを正しく指定
   useRealtimeSubscription('board_posts', {  // テーブル名は正確に
     event: 'INSERT',  // または 'UPDATE', 'DELETE', '*'
     onInsert: (payload) => console.log('新規追加:', payload)
   });
   ```

### デバッグ方法

```typescript
// 1. エラーの詳細を確認
try {
  const data = await db.create('board_posts', postData);
} catch (error) {
  console.error('Supabaseエラー:', error);
  // エラーの詳細がコンソールに表示される
}

// 2. 実行されるクエリを確認（開発時のみ）
if (process.env.NODE_ENV === 'development') {
  console.log('実行するデータ:', postData);
}
```

## 🎉 まとめ

このガイドで紹介した方法を使えば：

- ✅ SQLを書かずにSupabaseを使える
- ✅ RLSの複雑な設定が不要
- ✅ TypeScriptの型安全性を維持
- ✅ エラーハンドリングが統一される
- ✅ 再利用可能なコードが増える

困ったときは、このガイドを参照するか、`/lib/supabase/helpers.ts`のコードを確認してください。