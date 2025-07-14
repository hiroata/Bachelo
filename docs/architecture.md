# 🔞 Adult BBS System - アーキテクチャ設計書

## ⚠️ システム概要

**アダルト専用掲示板システム** - すべての性癖に対応した包括的掲示板プラットフォーム

### 🎯 コアミッション

- **17主要カテゴリ + 100+サブカテゴリ**で全性癖をカバー
- **マルチレイヤー保護システム**で健全化を防止
- **スケーラブルアーキテクチャ**で大規模運用対応

## 🏗️ アーキテクチャ概要

### 技術スタック

```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:   Next.js API Routes + PostgreSQL Functions
Database:  Supabase PostgreSQL (TEXT[] arrays)
Storage:   Supabase Storage (音声・画像)
Auth:      Supabase Auth (成人認証付き)
Deploy:    Render.com (Firebase/Vercel除去済み)
```

### システム構成

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Client    │────▶│  Next.js App │────▶│   Supabase DB   │
│  (Browser)  │◀────│  (Render.com)│◀────│  (PostgreSQL)   │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                     │                      │
       │            ┌────────▼────────┐            │
       │            │ Protection      │            │
       └────────────┤ System Layer    │────────────┘
                    └─────────────────┘
```
                                 Supabase Storage
```

### 主要機能
1. **音声掲示板** - カテゴリー別音声投稿・再生
2. **テキスト掲示板** - 画像付き投稿・返信・投票
3. **リアルタイム更新** - Supabase Realtime
4. **セキュリティ** - RLS、レート制限、年齢確認

## 📊 5ch型掲示板システムの設計

### システムアーキテクチャ
```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│   Client    │────▶│    Next.js   │────▶│   PostgreSQL   │
│  (Browser)  │◀────│  App Router  │◀────│   (Supabase)   │
└─────────────┘     └──────────────┘     └────────────────┘
        │                   │                      │
        └───────┬───────────┴──────────────────────┘
                │              ┌─────────────┐
                └─────────────▶│    Redis    │
                              │   (Cache)    │
                              └─────────────┘
```

### ページ階層構造
```
/5ch                          # 板一覧
├── /[board]                  # スレッド一覧（例: /livejupiter）
├── /test/read/[board]/[id]   # スレッド詳細（5ch互換URL）
└── /[board]/create           # スレッド作成
```

## 💾 データベース設計

### 現在のスキーマ（シンプル版）
```sql
-- 音声投稿
anonymous_voice_posts
├── id (UUID)
├── title
├── category
├── audio_url
└── created_at

-- テキスト掲示板
board_posts
├── id (UUID)
├── category
├── title
├── content
└── created_at

board_replies
├── id (UUID)
├── post_id (FK)
├── content
└── created_at
```

### 5ch型拡張スキーマ
```sql
-- 板管理
boards
├── id (UUID)
├── slug (UNIQUE)      # /livejupiter/
├── name               # なんJ
├── category
├── settings (JSONB)
└── default_name

-- スレッド管理
threads
├── id (BIGSERIAL)
├── board_id (FK)
├── thread_number
├── title
├── author_name
├── post_count
├── last_post_at
└── is_archived

-- レス管理
posts
├── id (BIGSERIAL)
├── thread_id (FK)
├── post_number        # 1〜1000
├── author_name
├── author_id          # ID:xxxx形式
├── content
├── anchors[]          # >>1,5,10への参照
└── created_at

-- インデックス戦略
CREATE INDEX idx_threads_board_last_post ON threads(board_id, last_post_at DESC);
CREATE INDEX idx_posts_thread_number ON posts(thread_id, post_number);
CREATE INDEX idx_posts_anchors ON posts USING GIN(anchors);
```

## 🚀 スケーリング戦略

### トラフィック規模別アーキテクチャ

#### 小規模（〜10万PV/月）
```
現在の構成で対応可能
- Supabase Free/Pro
- Render.com Free/Pro
- 基本的なキャッシュ
```

#### 中規模（〜100万PV/月）
```
┌──────────┐     ┌─────────────┐     ┌──────────────┐
│ Cloudflare├────▶│  Render.com │────▶│   Supabase   │
│    CDN    │     │   Services  │     │     Pro      │
└──────────┘     └─────────────┘     └──────────────┘
                        │                     │
                        └─────────────────────┘
                              │
                        ┌──────────┐
                        │  Redis   │
                        │ (Upstash)│
                        └──────────┘
```

#### 大規模（1000万PV/月〜）
```
┌───────────┐    ┌──────────────┐    ┌─────────────┐
│CloudFlare │───▶│Load Balancer │───▶│  App Server │
│    CDN    │    └──────────────┘    │   Cluster   │
└───────────┘                         └─────────────┘
                                            │
                  ┌─────────────────────────┴─────────┐
                  │                                   │
            ┌─────────────┐                    ┌─────────────┐
            │  Primary DB │◀──────────────────▶│Read Replica │
            └─────────────┘                    └─────────────┘
                  │
            ┌─────────────┐
            │Redis Cluster│
            └─────────────┘
```

## ⚡ パフォーマンス最適化

### 1. キャッシュ戦略
```typescript
// Redis層でのキャッシュ
- スレッド一覧: 60秒
- 人気スレッド: 5分
- 板設定: 1時間
- 静的コンテンツ: CDN永続

// Next.js層でのキャッシュ
- ISR (Incremental Static Regeneration)
- Dynamic Route Segments
- Streaming SSR
```

### 2. データベース最適化
```sql
-- パーティショニング（月単位）
CREATE TABLE posts_2025_01 PARTITION OF posts
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- マテリアライズドビュー（人気スレッド）
CREATE MATERIALIZED VIEW popular_threads AS
SELECT t.*, COUNT(p.id) as reply_count
FROM threads t
LEFT JOIN posts p ON t.id = p.thread_id
WHERE t.created_at > NOW() - INTERVAL '7 days'
GROUP BY t.id;
```

### 3. API最適化
```typescript
// バッチ処理
- 複数レスの一括取得
- アンカー解決の最適化
- 画像の遅延読み込み

// 非同期処理
- ジョブキュー（Bull/BullMQ）
- バックグラウンドタスク
- Webhookの非同期処理
```

## 🔒 セキュリティアーキテクチャ

### 多層防御アプローチ
```
┌─────────────────────────────────────────┐
│            CloudFlare WAF               │
├─────────────────────────────────────────┤
│          Rate Limiting (API)            │
├─────────────────────────────────────────┤
│        CSRF Protection (Next.js)        │
├─────────────────────────────────────────┤
│      Row Level Security (Supabase)      │
├─────────────────────────────────────────┤
│     Input Validation (Zod + DOMPurify)  │
└─────────────────────────────────────────┘
```

### セキュリティ実装
1. **認証・認可**
   - Supabase Auth
   - JWT検証
   - セッション管理

2. **データ保護**
   - IPアドレスのハッシュ化
   - 個人情報の暗号化
   - SQLインジェクション対策

3. **アクセス制御**
   - レート制限
   - CORS設定
   - 年齢確認ゲート

## 🔮 将来の拡張計画

### Phase 1: 基盤強化（1-2ヶ月）
- [ ] 5ch型データベーススキーマへの移行
- [ ] 板システムの実装
- [ ] レス番号・アンカー機能
- [ ] キャッシュシステム導入

### Phase 2: 機能拡充（2-3ヶ月）
- [ ] トリップ機能
- [ ] 画像アップロード最適化
- [ ] 検索機能（Elasticsearch）
- [ ] 過去ログ倉庫

### Phase 3: スケール対応（3-6ヶ月）
- [ ] マイクロサービス化
- [ ] Kubernetes導入
- [ ] グローバルCDN
- [ ] 多言語対応

### Phase 4: 収益化機能（6ヶ月〜）
- [ ] 有料会員システム
- [ ] クリエイター支援機能
- [ ] NFT/暗号通貨決済
- [ ] API公開（有料）

## 📈 監視・運用

### モニタリングスタック
```
Application Monitoring: Sentry
Performance Monitoring: New Relic / DataDog
Uptime Monitoring: UptimeRobot
Log Management: LogRocket
Analytics: Google Analytics / Plausible
```

### アラート設定
- レスポンスタイム > 1秒
- エラー率 > 1%
- データベース接続エラー
- ストレージ使用率 > 80%

## 💰 インフラコスト見積もり

### 小規模運用（〜10万PV/月）
| サービス | プラン | 月額 |
|---------|--------|------|
| Supabase | Pro | $25 |
| Render.com | Pro | $7 |
| Upstash Redis | Free | $0 |
| **合計** | | **$32** |

### 中規模運用（〜100万PV/月）
| サービス | プラン | 月額 |
|---------|--------|------|
| Supabase | Pro | $25 |
| Render.com | Pro | $20 |
| Upstash Redis | Pay as you go | $50 |
| Cloudflare | Pro | $20 |
| **合計** | | **$115** |

### 大規模運用（1000万PV/月〜）
- カスタム見積もりが必要
- 専用インフラへの移行を検討
- 月額 $1,000〜 を想定

## 🎯 アーキテクチャ設計原則

### 1. **John Carmack - パフォーマンス最優先**
- 最小限の抽象化
- データ局所性の重視
- プロファイリングベースの最適化

### 2. **Robert C. Martin - クリーンアーキテクチャ**
- ビジネスロジックの分離
- 依存性の逆転
- テスタビリティの確保

### 3. **Rob Pike - シンプルさの追求**
- 明確なインターフェース
- 小さなコンポーネント
- 組み合わせ可能な設計

## 📚 参考資料

- [Next.js App Router Documentation](https://nextjs.org/docs)
- [Supabase Architecture](https://supabase.com/docs/guides/architecture)
- [5ch Technical Overview](https://5ch.net/)
- [High Scalability Patterns](http://highscalability.com/)

---

最終更新: 2025-01-11