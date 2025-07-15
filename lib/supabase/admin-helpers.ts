/**
 * Supabase管理用ヘルパー関数
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// 管理者用Supabaseクライアント
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// データベース統計を取得
export async function getDatabaseStats() {
  const supabase = createAdminClient();
  
  const tables = [
    'boards', 'threads', 'posts', 
    'board_posts', 'board_replies',
    'reports', 'ng_words', 'user_profiles'
  ];
  
  const stats: Record<string, number> = {};
  
  for (const table of tables) {
    const { count } = await supabase
      .from(table as any)
      .select('*', { count: 'exact', head: true });
    
    stats[table] = count || 0;
  }
  
  return stats;
}

// 古いデータの自動クリーンアップ
export async function cleanupOldData(daysOld: number = 7) {
  const supabase = createAdminClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const results = {
    voicePosts: 0,
    boardImages: 0,
    errors: [] as string[]
  };
  
  // 古い音声投稿を削除
  try {
    const { data: oldVoicePosts } = await supabase
      .from('anonymous_voice_posts')
      .select('id, voice_url')
      .lt('created_at', cutoffDate.toISOString());
    
    if (oldVoicePosts) {
      for (const post of oldVoicePosts) {
        // ストレージからファイルを削除
        if (post.voice_url) {
          const path = post.voice_url.split('/').pop();
          if (path) {
            await supabase.storage
              .from('voice-posts')
              .remove([`voice/${path}`]);
          }
        }
        
        // データベースから削除
        await supabase
          .from('anonymous_voice_posts')
          .delete()
          .eq('id', post.id);
        
        results.voicePosts++;
      }
    }
  } catch (error) {
    results.errors.push(`音声投稿クリーンアップエラー: ${error}`);
  }
  
  return results;
}

// バッチ処理用ヘルパー
export async function batchProcess<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<void>
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processor(batch);
    
    // レート制限対策
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// データベースヘルスチェック
export async function checkDatabaseHealth() {
  const supabase = createAdminClient();
  const health = {
    status: 'healthy' as 'healthy' | 'warning' | 'error',
    issues: [] as string[],
    recommendations: [] as string[]
  };
  
  // 1. 大きなテーブルをチェック
  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });
  
  if (postCount && postCount > 100000) {
    health.status = 'warning';
    health.issues.push('postsテーブルが10万件を超えています');
    health.recommendations.push('古いデータのアーカイブを検討してください');
  }
  
  // 2. 孤立したデータをチェック
  const { data: orphanedImages } = await supabase
    .from('board_post_images')
    .select('id')
    .is('post_id', null);
  
  if (orphanedImages && orphanedImages.length > 0) {
    health.issues.push(`${orphanedImages.length}件の孤立した画像があります`);
    health.recommendations.push('孤立した画像のクリーンアップを実行してください');
  }
  
  // 3. インデックスの推奨
  const { data: slowQueries } = await supabase.rpc('get_slow_queries');
  if (slowQueries && slowQueries.length > 0) {
    health.status = 'warning';
    health.issues.push('パフォーマンスの問題があるクエリが検出されました');
    health.recommendations.push('インデックスの追加を検討してください');
  }
  
  return health;
}

// マイグレーション実行状態の確認
export async function checkMigrationStatus() {
  const supabase = createAdminClient();
  
  try {
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version, executed_at')
      .order('version', { ascending: false })
      .limit(10);
    
    if (error) {
      // schema_migrationsテーブルがない場合
      return {
        hasTable: false,
        migrations: []
      };
    }
    
    return {
      hasTable: true,
      migrations: data || []
    };
  } catch (error) {
    return {
      hasTable: false,
      migrations: [],
      error: error
    };
  }
}

// ストレージ使用量の詳細を取得
export async function getStorageDetails() {
  const supabase = createAdminClient();
  const buckets = ['voice-posts', 'images', 'board_images'];
  const details: Record<string, any> = {};
  
  for (const bucket of buckets) {
    try {
      const { data } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1000 });
      
      if (data) {
        const totalSize = data.reduce((sum, file) => {
          return sum + (file.metadata?.size || 0);
        }, 0);
        
        details[bucket] = {
          fileCount: data.length,
          totalSize: totalSize,
          averageSize: data.length > 0 ? totalSize / data.length : 0,
          largestFile: data.reduce((max, file) => {
            const size = file.metadata?.size || 0;
            return size > (max.size || 0) ? { name: file.name, size } : max;
          }, { name: '', size: 0 })
        };
      }
    } catch (error) {
      details[bucket] = { error: error };
    }
  }
  
  return details;
}

// セキュリティ監査
export async function performSecurityAudit() {
  const supabase = createAdminClient();
  const audit = {
    rlsEnabled: {} as Record<string, boolean>,
    publicAccess: [] as string[],
    recommendations: [] as string[]
  };
  
  // RLSチェック
  const tables = ['profiles', 'board_posts', 'reports', 'user_memberships'];
  
  for (const table of tables) {
    try {
      const { data } = await supabase.rpc('check_rls_enabled', { table_name: table });
      audit.rlsEnabled[table] = data || false;
      
      if (!data) {
        audit.recommendations.push(`${table}テーブルでRLSを有効にしてください`);
      }
    } catch (error) {
      // エラーは無視
    }
  }
  
  // パブリックアクセスチェック
  const { data: policies } = await supabase.rpc('get_public_policies');
  if (policies) {
    audit.publicAccess = policies.map((p: any) => p.table_name);
  }
  
  return audit;
}