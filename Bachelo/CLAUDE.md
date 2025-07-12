# Bachelo - 開発者向け詳細技術ドキュメント

## 📄 ドキュメント体系

| ドキュメント | 対象読者 | 内容 |
|------------|---------|------|
| [README.md](./README.md) | 全員 | クイックスタート、プロジェクト概要 |
| **CLAUDE.md**（本文書） | 開発者 | 技術詳細、実装ガイド、コード規約 |
| [architecture.md](./docs/architecture.md) | アーキテクト | システム設計、スケーリング戦略 |
| [deployment-guide.md](./docs/deployment-guide.md) | DevOps | デプロイ手順、インフラ設定 |
| [supabase-simple-guide.md](./docs/supabase-simple-guide.md) | 開発者 | Supabase使用ガイド（SQL不要） |

## 🎯 プロジェクト概要

Bachelo（バチェロ）は、匿名音声掲示板を中心としたアダルトボイスマーケットプレイスです。

**コアコンセプト**: 無料音声掲示板で気に入った声を見つけて → 有料でカスタムボイスをリクエスト

## 🏗️ 技術スタック詳細

```
Frontend:  Next.js 14.2.30 (App Router) + TypeScript 5 + Tailwind CSS 3.4
Backend:   Next.js API Routes
Database:  Supabase (PostgreSQL)
Storage:   Supabase Storage
Auth:      Supabase Auth
Deploy:    Render（開発/ステージング）、Vercel（本番予定）
```

## 🚀 実装済み機能（2025年1月時点）

### ✅ コア機能
1. **音声掲示板**
   - カテゴリー別表示（女性/男性/カップル）
   - 匿名投稿機能（IPハッシュ化）
   - HTML5音声プレイヤー
   - リアルタイム更新（Supabase Realtime）
   - 自動クリーンアップ（7日で削除）

2. **テキスト掲示板（5ch風）**
   - カテゴリー別投稿（12カテゴリー）
   - 画像アップロード（最大4枚、各5MB以下）
   - 返信スレッド機能
   - 投票システム（+/-ボタン、重複防止付き）
   - リアルタイム返信数カウント
   - ページネーション（20件/ページ）
   - スレッド式掲示板（/girls/[board]/[thread]）

3. **セキュリティ・モデレーション**
   - 年齢確認ゲート（18歳以上、middleware実装）
   - 通報システム（投稿・返信の通報機能）
   - NGワード自動フィルタリング（severity 5段階）
   - 管理画面（/admin）でのモデレーション
   - IPアドレスハッシュ化（SHA-256）
   - XSS対策（DOMPurify）
   - レート制限（1分5投稿）
   - CSRFトークン検証
   - ファイル検証（形式・サイズ）

4. **データ管理**
   - Supabase Storage統合（voice-posts、images バケット）
   - PostgreSQLデータベース（24テーブル）
   - Row Level Security（開発時は無効化）
   - 自動クリーンアップ機能（cronジョブ）
   - カスケード削除（投稿削除時に関連データも削除）

5. **管理機能**
   - 管理者ダッシュボード（/admin）
   - 通報管理（承認/却下）
   - NGワード管理（CRUD操作）
   - 統計情報表示（投稿数、ユーザー数等）

## 📝 重要なコマンド

```bash
# 開発環境
npm run dev              # 開発サーバー起動
npm run type-check       # TypeScript型チェック
npm run lint             # ESLintチェック
npm run lint:fix         # ESLint自動修正

# ビルド・デプロイ
npm run build            # 本番ビルド
npm start                # 本番サーバー起動

# データベース操作
npm run seed:board       # 掲示板の初期データ投入
npm run seed:replies     # 返信データの投入
npm run update:reply-counts  # 返信数の更新
```

## 🎨 デザイン原則・コード規約

### UIデザイン
- **メインカラー**: ピンク（#ec4899）、ダークテーマ対応
- **レイアウト**: モバイルファースト、レスポンシブデザイン
- **インタラクション**: 直感的、最小限のクリック数
- **パフォーマンス**: 遅延読み込み、最適化されたレンダリング

### コーディング規約
```typescript
// ✅ 良い例：明確な型定義
interface BoardPost {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  ip_hash: string | null;
}

// ❌ 悪い例：any型の使用
const post: any = await getPost();

// ✅ 良い例：エラーハンドリング
try {
  const result = await createPost(data);
  return NextResponse.json(result);
} catch (error) {
  return handleError(error);
}

// ✅ 良い例：関数の単一責任
async function validatePostData(data: unknown): Promise<PostData> {
  return postSchema.parse(data);
}

async function sanitizePostContent(content: string): string {
  return DOMPurify.sanitize(content);
}
```

## 🔄 主要なファイル構成

```
/Bachelo/
├── app/
│   ├── (main)/
│   │   ├── voice-board/           # 音声掲示板ページ
│   │   ├── board/                 # テキスト掲示板
│   │   │   ├── page.tsx           # 一覧（Suspense対応）
│   │   │   └── post/[id]/page.tsx # 投稿詳細
│   │   ├── girls/                 # 5ch風掲示板
│   │   │   └── [board]/[thread]/  # スレッド表示
│   │   ├── creators/              # クリエイター一覧
│   │   └── dashboard/             # ダッシュボード
│   ├── admin/                     # 管理画面
│   │   ├── page.tsx               # ダッシュボード
│   │   └── moderation/            # モデレーション
│   ├── age-gate/                  # 年齢確認ページ
│   └── api/
│       ├── voice/upload/          # 音声投稿API
│       ├── board/                 # 掲示板API
│       │   ├── categories/        # カテゴリー取得
│       │   ├── posts/             # 投稿CRUD
│       │   │   └── [id]/vote/     # 投票機能
│       │   ├── replies/           # 返信機能
│       │   └── upload/            # 画像アップロード
│       ├── reports/               # 通報API
│       └── cleanup/               # 自動クリーンアップ
├── components/
│   ├── board/                     # 掲示板コンポーネント
│   │   ├── PostModal.tsx          # 投稿作成モーダル
│   │   └── ReplyModal.tsx         # 返信モーダル
│   └── ui/                        # 共通UIコンポーネント
│       └── ReportModal.tsx        # 通報モーダル
├── lib/
│   ├── storage/                   # ストレージ関連
│   ├── supabase/                  # Supabaseクライアント
│   │   ├── client.ts              # クライアント設定
│   │   └── helpers.ts             # ヘルパー関数
│   ├── validations/               # Zodスキーマ
│   └── utils/                     # ユーティリティ
│       ├── error-handler.ts       # エラーハンドラー
│       ├── ng-word-checker.ts     # NGワードチェッカー
│       └── rate-limiter.ts        # レート制限
├── hooks/
│   ├── useAuth.ts                 # 認証フック
│   └── useRealtimeVoicePosts.ts   # リアルタイム更新
├── types/
│   ├── board.ts                   # 掲示板型定義
│   └── database.ts                # Supabase型定義
└── middleware.ts                  # 年齢確認ミドルウェア
```

## ⚠️ セットアップ要件

### 環境変数（.env.local）
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# セキュリティ
CRON_SECRET=your_cron_secret_here

# 開発環境のみ
NEXT_PUBLIC_DEV_MODE=true  # 開発ツール有効化
```

### Supabaseセットアップ手順
1. **プロジェクト作成**
   - [Supabase](https://supabase.com)でアカウント作成
   - 新規プロジェクト作成（Region: 東京推奨）

2. **SQLマイグレーション実行**
   ```sql
   -- SQL Editorで実行
   -- 推奨: supabase/safe-migration.sql
   -- エラー時: supabase/fix-all-errors.sql
   -- 完全リセット: supabase/reset-and-migrate.sql
   ```

3. **Storageバケット作成**
   - Storage → New Bucket
   - `voice-posts`（公開設定）
   - `images`（公開設定）

4. **環境変数取得**
   - Settings → API
   - Project URL、anon key、service_role keyをコピー

## 🏗️ アーキテクチャ設計原則

### John Carmack（パフォーマンス最適化）
```typescript
// 最小限の再レンダリング
const PostList = memo(({ posts }: { posts: Post[] }) => {
  return posts.map(post => <PostCard key={post.id} post={post} />);
});

// 遅延読み込み
const AdminDashboard = lazy(() => import('@/app/admin/page'));
```

### Robert C. Martin（クリーンアーキテクチャ）
```typescript
// ビジネスロジックとUIの分離
// lib/services/post.service.ts
export class PostService {
  static async create(data: CreatePostDto): Promise<Post> {
    // ビジネスロジック
  }
}

// components/PostForm.tsx
function PostForm() {
  // UIロジックのみ
}
```

### Rob Pike（シンプルさ）
```typescript
// 明確で読みやすいコード
function isValidPost(post: unknown): post is Post {
  return post !== null && 
         typeof post === 'object' && 
         'id' in post && 
         'title' in post;
}
```

## 💡 開発のポイント

### 型安全性
```typescript
// すべてのAPIレスポンスに型を定義
type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Zodによる実行時バリデーション
const postSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
});
```

### エラーハンドリング
```typescript
// 統一されたエラーハンドリング
export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### パフォーマンス最適化
```typescript
// React Server Components活用
export default async function BoardPage() {
  const posts = await getPosts(); // サーバーサイドで実行
  return <PostList posts={posts} />;
}

// Suspense境界
<Suspense fallback={<PostListSkeleton />}>
  <PostList />
</Suspense>
```

## 🚦 今後の実装予定

### Phase 1: コア機能強化（1-2ヶ月）
- [ ] 有料リクエスト機能（Stripe決済）
- [ ] クリエイター収益管理
- [ ] 音声AI生成機能
- [ ] プッシュ通知（FCM）

### Phase 2: スケール対応（2-3ヶ月）
- [ ] Redis/Memcachedキャッシング
- [ ] CDN統合（Cloudflare）
- [ ] 画像最適化（WebP自動変換）
- [ ] 無限スクロール実装

### Phase 3: 品質向上（3-6ヶ月）
- [ ] Jestによるユニットテスト
- [ ] Playwrightによるe2eテスト
- [ ] Storybookコンポーネント管理
- [ ] CI/CD改善（GitHub Actions）

## 🐛 既知の問題と対策

### TypeScript型エラー対策
```typescript
// 一時的な回避策（段階的に改善中）
// @ts-ignore コメントの使用箇所を削減
// 正しい型定義への移行
```

### Renderデプロイ時の注意
- 無料プランは15分アクセスなしでスリープ
- 初回アクセス時に起動時間（約30秒）
- 環境変数の設定を確実に行う

### パフォーマンス最適化
```typescript
// 大量データ時のページネーション
const ITEMS_PER_PAGE = 20;

// 画像の遅延読み込み
<Image loading="lazy" ... />

// React.memoによるメモ化
const ExpensiveComponent = memo(({ data }) => {
  // 重い処理
});
```

## 📚 参考資料・関連ドキュメント

### プロジェクトドキュメント
- `README.md` - クイックスタートガイド
- `docs/architecture.md` - システム設計・スケーリング戦略
- `docs/deployment-guide.md` - デプロイ手順
- `docs/supabase-simple-guide.md` - Supabase使用ガイド
- `supabase/README.md` - SQLマイグレーション手順

### 外部リソース
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🔧 開発Tips

### デバッグ方法
```bash
# APIエラーの確認
npm run dev
# ブラウザ: Console + Network タブ

# TypeScript型エラー
npm run type-check

# Supabaseログ
# Dashboard → Logs → API logs
```

### よくあるエラーと対処法

1. **「RLS policy violation」エラー**
   ```typescript
   // 開発環境: RLS無効化済み
   // 本番環境: 適切なRLSポリシー設定必要
   ```

2. **「CORS error」エラー**
   ```typescript
   // API Routeでヘッダー設定
   headers: {
     'Access-Control-Allow-Origin': '*',
   }
   ```

3. **「Rate limit exceeded」エラー**
   ```typescript
   // レート制限調整
   const limiter = rateLimit({
     windowMs: 60 * 1000, // 1分
     max: 5, // 最大5リクエスト
   });
   ```

## 📅 更新履歴

### 2025-01-12
- SQLマイグレーションファイルの統廃合
- エラー処理の改善（100%動作保証版作成）
- ドキュメント体系の整理

### 2025-01-11
- 年齢確認ゲート実装
- 通報システム・管理画面追加
- NGワード自動フィルタリング
- 5ch風掲示板システム実装
- デプロイ先をRenderに変更

---

最終更新: 2025-01-12