# VoiceEros - プロジェクトコンテキスト

## 🎯 プロジェクト概要

VoiceEros（ボイスエロス）は、匿名で投稿できる無料音声掲示板を中心とした、アダルトボイスマーケットプレイスです。

**コアコンセプト**: 無料音声掲示板で気に入った声を見つけて → 有料でカスタムボイスをリクエスト

## 🏗️ 技術スタック

```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:   Next.js API Routes
Database:  Supabase (PostgreSQL)
Storage:   Supabase Storage
Auth:      Supabase Auth
Deploy:    Vercel
```

## 🚀 実装済み機能

### ✅ コア機能
1. **音声掲示板**
   - カテゴリー別表示（女性/男性/カップル）
   - 匿名投稿機能
   - 音声再生プレイヤー
   - リアルタイム更新

2. **データ永続化**
   - Supabase Storage統合
   - PostgreSQLデータベース
   - 匿名投稿用テーブル設計

3. **セキュリティ**
   - ファイル検証（形式・サイズ）
   - Row Level Security (RLS)
   - IPアドレスハッシュ化

## 📝 重要なコマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# リント
npm run lint

# ビルド
npm run build
```

## 🎨 デザイン原則

- **メインカラー**: ピンク（#ec4899）
- **レイアウト**: モバイルファースト、シンプル
- **インタラクション**: 直感的、最小限のクリック

## 🔄 主要なファイル構成

```
/app/(main)/voice-board    # 音声掲示板ページ
/app/api/voice/upload      # 音声投稿API
/components/voice-board/   # 音声掲示板コンポーネント
  - AudioPlayer.tsx        # 音声再生プレイヤー
  - UploadModal.tsx        # 投稿モーダル
  - VoicePostCard.tsx      # 投稿カード
/lib/
  - storage/               # ストレージ関連
  - validations/           # バリデーション
  - utils/                 # ユーティリティ
/hooks/
  - useRealtimeVoicePosts  # リアルタイム更新
/supabase/migrations/      # DBマイグレーション
```

## ⚠️ セットアップ要件

### 環境変数（.env.local）
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Supabaseセットアップ
1. プロジェクト作成
2. SQLマイグレーション実行
3. Storageバケット「voice-posts」作成（公開設定）

## 🚦 残タスク

1. **テストコード作成**
2. **有料リクエスト機能**
3. **パフォーマンス最適化**
   - 無限スクロール
   - キャッシング戦略
   - 遅延読み込み


## 💡 開発のポイント

- 型チェックとリントを必ず実行
- エラーハンドリングは`lib/utils/error-handler.ts`を使用
- バリデーションは`zod`スキーマで統一
- 音声ファイルは10MB以下、許可された形式のみ

## 📚 参考資料

- `REPAIR_SUMMARY.md` - 修繕計画の実行結果
- `setup-instructions.md` - セットアップ手順
- `supabase/migrations/` - データベース設計