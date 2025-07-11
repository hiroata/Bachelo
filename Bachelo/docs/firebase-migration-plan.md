# Firebase移行計画書

## 現在の構成（Supabase + Vercel）
- **データベース**: Supabase (PostgreSQL)
- **ストレージ**: Supabase Storage
- **認証**: Supabase Auth
- **デプロイ**: Vercel
- **リアルタイム**: Supabase Realtime

## Firebase移行のメリット・デメリット

### メリット ✅
1. **統合環境**: 認証、DB、ストレージ、ホスティングが1つのプラットフォームで完結
2. **認証の簡単さ**: Firebase Authは設定が簡単で、多くのプロバイダーに対応
3. **無料枠が豊富**: 小規模なアプリケーションなら無料で運用可能
4. **CDNが内蔵**: Firebase Hostingは自動的にCDNで配信される

### デメリット ❌
1. **データベースの違い**: 
   - Firestore（NoSQL）への移行が必要
   - PostgreSQLの強力なクエリ機能が使えない
   - リレーショナルな設計の再考が必要
2. **Next.js制限**: 
   - Firebase HostingはNext.jsのすべての機能をサポートしていない
   - App RouterのServer Componentsは制限あり
   - APIルートはCloud Functionsに移行必要
3. **移行コスト**: 
   - すべてのコードの書き換えが必要
   - データマイグレーションが複雑

## 3つの選択肢

### オプション1: 完全Firebase移行 🔄
```
- Firebase Auth（認証）
- Firestore（データベース）
- Firebase Storage（ファイル）
- Firebase Hosting（フロントエンド）
- Cloud Functions（APIルート）
```

### オプション2: ハイブリッド構成 🌐
```
- Firebase Auth（認証のみ）
- Supabase（データベース・ストレージ）
- Vercel（ホスティング）
```

### オプション3: 現状維持 + Supabase Auth改善 ⚡
```
- Supabase Auth（改善して使用）
- Supabase（データベース・ストレージ）
- Vercel（ホスティング）
```

## 推奨: オプション2（ハイブリッド構成）

### 理由
1. **認証だけFirebase**: 認証の使いやすさを活かせる
2. **データベースは維持**: PostgreSQLの強力な機能を維持
3. **移行コスト最小**: 認証部分のみの変更で済む
4. **柔軟性**: 将来的にどちらにも移行可能

### 実装手順

#### Phase 1: Firebase Auth統合
```typescript
// 1. Firebase設定
npm install firebase

// 2. lib/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

#### Phase 2: 認証フックの変更
```typescript
// hooks/useAuth.ts
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      // SupabaseのDBにユーザー情報を同期
      if (user) {
        syncUserToSupabase(user);
      }
    });
  }, []);
  
  return { user };
}
```

#### Phase 3: Supabaseとの連携
```typescript
// Firebase UIDをSupabaseのユーザーIDとして使用
async function syncUserToSupabase(firebaseUser) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: firebaseUser.uid,
      email: firebaseUser.email,
      // その他のユーザー情報
    });
}
```

## コスト比較

### 現在（Supabase + Vercel）
- Supabase Free: 無料（500MB DB、1GB ストレージ、50,000 MAU）
- Vercel Free: 無料（100GB帯域幅）

### Firebase
- Spark Plan（無料）: 1GB Firestore、5GB Storage、50,000認証/月
- Blaze Plan（従量課金）: $0.06/100k読み取り、$0.18/100k書き込み

## 決定事項

どの方向に進むか決めていただければ、具体的な実装を進めます：

1. **オプション2（推奨）**: Firebase Auth + Supabase DB
2. **オプション1**: 完全Firebase移行
3. **オプション3**: 現状維持

また、Firebase Authを使う場合は以下の情報が必要です：
- Firebaseプロジェクトの作成
- 認証プロバイダーの選択（メール/パスワード、Google、Twitter等）