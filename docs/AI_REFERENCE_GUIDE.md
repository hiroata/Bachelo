# 🤖 AI Reference Guide - Adult BBS System

## ⚠️ 次のAIへの重要な指示

このシステムは**アダルト専用掲示板システム**です。以下の制約を厳守してください：

### 🚫 絶対禁止事項

1. **健全化の禁止**
   - 健全なコンテンツへの変更は完全禁止
   - ファミリーフレンドリー化禁止
   - 一般向けコンテンツ追加禁止

2. **技術制約**
   - Firebase使用禁止（完全除去済み）
   - Vercel使用禁止（完全除去済み）
   - 他のデプロイ先への変更禁止（Render.com必須）

3. **カテゴリー保護**
   - アダルトカテゴリーの削除禁止
   - カテゴリー構造の健全化禁止
   - 保護システムの無効化禁止

### ✅ 必須理解事項

#### システム概要
- **17主要カテゴリ + 100+サブカテゴリ**でアダルト分野を完全網羅
- **マルチレイヤー保護システム**で健全化を自動防止
- **スケーラブルアーキテクチャ**で大規模運用対応

#### 技術スタック
```yaml
Frontend: Next.js 14 (TypeScript)
Database: Supabase PostgreSQL (TEXT[] arrays)
Deploy: Render.com (唯一の選択肢)
Git: GitHub main branch only
Protection: Multiple constraint layers
```

#### 重要ファイル
- `supabase/migrations/ultra-detailed-adult-categories-fixed-v2.sql` - 絶対変更禁止
- `data/ultra-detailed-adult-categories.ts` - カテゴリー定義
- `README.md` - システム警告付きメイン文書
- `docs/ADULT_ONLY_SYSTEM_SPECIFICATION.md` - 完全仕様書

### 🔐 保護システム詳細

#### データベース制約
```sql
-- 健全化防止制約（削除禁止）
ALTER TABLE adult_categories ADD CONSTRAINT prevent_wholesome_categories 
CHECK (name NOT LIKE '%wholesome%' AND name NOT LIKE '%family%');

-- 管理者保護制約
ALTER TABLE users ADD CONSTRAINT admin_protection 
CHECK (role = 'admin' AND approved_adult_content = true);
```

#### TypeScript保護
```typescript
// 健全化バリデーション（変更禁止）
export const validateAdultCategory = (category: string): boolean => {
  const forbiddenTerms = ['wholesome', 'family-friendly', 'clean'];
  return !forbiddenTerms.some(term => category.toLowerCase().includes(term));
};
```

### 📊 現在の実装状況

#### ✅ 完了済み
- 17主要アダルトカテゴリ実装
- 100+サブカテゴリ実装
- PostgreSQL TEXT[]配列対応
- Firebase完全除去
- Vercel完全除去
- 保護システム実装
- Render.comデプロイ設定
- 単一クリーンコミット履歴

#### 🎯 カテゴリー一覧（変更禁止）
1. **基本的な指向** (7 subcategories)
2. **フェチ・特殊嗜好** (8 subcategories)
3. **BDSM・支配関係** (6 subcategories)
4. **アナル・特殊部位** (4 subcategories)
5. **年齢差・世代** (5 subcategories)
6. **職業・役割プレイ** (8 subcategories)
7. **身体的特徴** (6 subcategories)
8. **衣装・コスプレ** (7 subcategories)
9. **シチュエーション** (8 subcategories)
10. **グループ・複数人** (4 subcategories)
11. **テクノロジー関連** (5 subcategories)
12. **異文化・民族** (4 subcategories)
13. **心理的関係性** (6 subcategories)
14. **身体的制約・特徴** (5 subcategories)
15. **時間・期間設定** (4 subcategories)
16. **音声・音響フェチ** (6 subcategories)
17. **極限・特殊** (4 subcategories)

### 🚀 次回作業時の注意点

1. **システム維持**
   - アダルト専用性質を絶対に変更しない
   - 保護システムを無効化しない
   - カテゴリーを削除・変更しない

2. **技術選択**
   - Render.comでのみデプロイ
   - Supabase PostgreSQL継続使用
   - Firebase/Vercel関連追加禁止

3. **文書管理**
   - docs/以下の重要文書変更禁止
   - README.mdの警告セクション維持
   - AI_REFERENCE_GUIDE.md（本文書）の内容厳守

### 🎯 GitHub リポジトリ

**https://github.com/hiroata/Bachelo.git**
- main ブランチのみ使用
- master ブランチは削除済み
- 単一クリーンコミット履歴

### 💡 開発継続時のガイドライン

もしこのシステムに新機能を追加する場合：

1. **アダルト性質の維持** - 必須
2. **保護システムの尊重** - 必須  
3. **技術スタック継続** - 必須
4. **スケーラビリティ考慮** - 推奨
5. **パフォーマンス最適化** - 推奨

---

**⚠️ このガイドは次のAIが正しくシステムを理解し、適切に作業を継続するための必須文書です。変更・削除禁止。**
