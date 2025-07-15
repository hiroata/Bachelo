# 📚 Bachelo - クイックリファレンス

## 🎯 AI開発者向けチートシート

### Supabase MCP コマンド

```bash
# 必須確認
mcp__supabase__list_projects                    # プロジェクト一覧
mcp__supabase__get_project                      # プロジェクト詳細
mcp__supabase__list_tables                      # テーブル一覧

# 開発ワークフロー
mcp__supabase__apply_migration                  # マイグレーション適用
mcp__supabase__execute_sql                      # SQL実行
mcp__supabase__generate_typescript_types        # 型生成

# 監視・デバッグ
mcp__supabase__get_logs --service api           # APIログ
mcp__supabase__get_logs --service postgres      # DBログ
mcp__supabase__get_advisors --type security     # セキュリティ監査
mcp__supabase__get_advisors --type performance  # パフォーマンス監査
```

### 主要ファイル構成

```
重要度: ⭐⭐⭐ (最重要) ⭐⭐ (重要) ⭐ (参考)

⭐⭐⭐ app/(main)/board/page.tsx              # メイン掲示板
⭐⭐⭐ app/(main)/board/post/[id]/page.tsx    # 投稿詳細
⭐⭐⭐ app/(main)/layout.tsx                  # ヘッダー・ナビ
⭐⭐⭐ components/board/ReactionBar.tsx       # リアクション機能
⭐⭐⭐ components/ui/NotificationCenter.tsx   # 通知システム

⭐⭐ app/(main)/events/page.tsx               # イベント一覧
⭐⭐ components/board/TrendingWidget.tsx      # トレンド表示
⭐⭐ components/board/EventCard.tsx           # イベントカード
⭐⭐ supabase/migrations/021_enhanced_board_features.sql

⭐ app/api/reactions/route.ts                 # リアクションAPI
⭐ app/api/trending/route.ts                  # トレンドAPI
⭐ app/api/notifications/route.ts             # 通知API
⭐ app/api/events/route.ts                    # イベントAPI
```

### 実装済み機能マップ

```
✅ 完了済み (Production Ready)
├── 🎯 リアクションシステム (12種類)
├── 📈 トレンド分析 (1h/24h/7d)
├── 🔔 通知システム (9種類)
├── 🎪 イベント機能 (7種類)
├── 👑 ユーザーランキング
├── 📊 アクティビティログ
├── 🔐 セキュリティ (年齢ゲート、通報、NGワード)
└── 🛡️ 管理機能 (モデレーション、統計)

🎯 次期目標 (High Priority)
├── 📱 モバイル対応・レスポンシブ改善
├── 🌙 ダークモード実装
├── ⚡ パフォーマンス最適化 (画像、キャッシング)
├── 🎨 UI/UXアニメーション
└── ♿ アクセシビリティ対応

💡 将来構想 (Medium Priority)
├── 💬 リアルタイムチャット
├── 🎤 音声投稿・再生システム
├── 🤖 AI モデレーション強化
└── 💰 収益化システム (Stripe)
```

### データベーススキーマ (36テーブル)

```
コア機能 (24テーブル)
├── board_categories, board_posts, board_replies
├── anonymous_voice_posts, anonymous_post_comments
├── reports, ng_words, user_points
└── live_chat_rooms, live_chat_messages

エンハンス機能 (12テーブル - 2025年1月新実装)
├── post_reactions (リアクション)
├── user_reputation (レピュテーション)
├── trending_topics (トレンド)
├── board_notifications (通知)
├── board_events, event_participants (イベント)
├── post_bookmarks (ブックマーク)
├── user_follows (フォロー)
├── user_activity_logs (アクティビティ)
├── content_quality_scores (品質スコア)
└── board_tags, post_tags (タグ)
```

### よく使うコード例

#### リアクション追加
```typescript
<ReactionBar
  postId={postId}
  userId={userId}
  showLabels={true}
  className="border-t pt-4"
/>
```

#### 通知センター
```typescript
<NotificationCenter userId={userId} />
```

#### トレンド表示
```typescript
<TrendingWidget />
```

#### MCP使用例
```typescript
// 新しいマイグレーション
await mcp__supabase__apply_migration({
  name: "add_new_feature",
  query: "CREATE TABLE new_table (...)"
});

// セキュリティ確認
const security = await mcp__supabase__get_advisors({ 
  type: "security" 
});
```

### トラブルシューティング

| 問題 | 解決方法 |
|------|----------|
| 接続エラー | `mcp__supabase__list_projects` で確認 |
| 型エラー | `mcp__supabase__generate_typescript_types` |
| DB問題 | `mcp__supabase__get_logs --service postgres` |
| パフォーマンス | `mcp__supabase__get_advisors --type performance` |
| セキュリティ | `mcp__supabase__get_advisors --type security` |

### 開発優先順位

```
🔥 緊急度: 高
1. モバイルレスポンシブ対応
2. パフォーマンス最適化 (画像読み込み)
3. ダークモード実装

⚡ 重要度: 中
4. UI/UXアニメーション改善
5. アクセシビリティ対応
6. 無限スクロール実装

💡 将来: 低
7. リアルタイムチャット
8. 音声機能拡張
9. AI モデレーション
```

### セキュリティチェックリスト

```
定期実行推奨
□ mcp__supabase__get_advisors --type security
□ mcp__supabase__get_advisors --type performance
□ SQLインジェクション対策確認
□ XSS対策確認 (DOMPurify)
□ CSRF対策確認
□ レート制限動作確認
□ RLS設定確認 (本番のみ)
```

---

**💡 このリファレンスを常に手元に置いて効率的に開発しましょう！**