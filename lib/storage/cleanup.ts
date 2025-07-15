import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// ストレージクリーンアップ関数（Cronジョブまたは手動実行用）
export async function cleanupExpiredContent() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const results = {
    expiredPosts: 0,
    oldOrders: 0,
    totalFreed: 0,
  }
  
  try {
    // 1. 期限切れの投稿を削除（7日以上前）
    const { data: expiredPosts } = await supabase
      .from('voice_posts')
      .select('id, audio_url')
      .lt('expires_at', new Date().toISOString())
    
    if (expiredPosts && expiredPosts.length > 0) {
      for (const post of expiredPosts) {
        // ストレージから音声削除
        const fileName = extractFileName(post.audio_url)
        if (fileName) {
          const { error } = await supabase.storage
            .from('audio')
            .remove([`posts/${fileName}`])
          
          if (!error) {
            results.expiredPosts++
          }
        }
      }
      
      // データベースから投稿を削除
      await supabase
        .from('voice_posts')
        .delete()
        .lt('expires_at', new Date().toISOString())
    }
    
    // 2. 古い注文の音声を削除（30日以上前の完了済み注文）
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const { data: oldOrders } = await supabase
      .from('orders')
      .select('id, audio_url')
      .eq('status', 'completed')
      .lt('delivered_at', thirtyDaysAgo.toISOString())
      .not('audio_url', 'is', null)
    
    if (oldOrders && oldOrders.length > 0) {
      for (const order of oldOrders) {
        // URLから音声は既に期限切れなので、DBのURLをnullに更新
        await supabase
          .from('orders')
          .update({ audio_url: null })
          .eq('id', order.id)
        
        results.oldOrders++
      }
    }
    
    // 3. ストレージ使用量を計算
    const storageUsage = await getStorageUsage(supabase)
    
    console.log('Cleanup completed:', {
      ...results,
      currentUsage: storageUsage,
    })
    
    return {
      success: true,
      ...results,
      currentUsage: storageUsage,
    }
  } catch (error) {
    console.error('Cleanup error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ストレージ使用量を取得
export async function getStorageUsage(supabase: ReturnType<typeof createClient<Database>>) {
  try {
    // 各バケットのファイルリストを取得
    const buckets = ['audio']
    let totalSize = 0
    let totalFiles = 0
    
    for (const bucket of buckets) {
      // posts フォルダ
      const { data: postFiles } = await supabase.storage
        .from(bucket)
        .list('posts', { limit: 1000 })
      
      // orders フォルダ  
      const { data: orderFiles } = await supabase.storage
        .from(bucket)
        .list('orders', { limit: 1000 })
      
      const allFiles = [...(postFiles || []), ...(orderFiles || [])]
      
      totalFiles += allFiles.length
      totalSize += allFiles.reduce((sum, file) => {
        return sum + (file.metadata?.size || 0)
      }, 0)
    }
    
    const usageGB = totalSize / (1024 * 1024 * 1024)
    const usageMB = totalSize / (1024 * 1024)
    
    return {
      totalFiles,
      totalSize,
      usageGB: usageGB.toFixed(2),
      usageMB: usageMB.toFixed(2),
      percentUsed: ((usageGB / 1) * 100).toFixed(1), // 1GB制限
      remainingMB: (1024 - usageMB).toFixed(2),
    }
  } catch (error) {
    console.error('Failed to get storage usage:', error)
    return null
  }
}

// URLからファイル名を抽出
function extractFileName(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    return pathParts[pathParts.length - 1]
  } catch {
    return null
  }
}

// 定期実行用のクリーンアップタスク
export async function scheduledCleanup() {
  console.log('Starting scheduled cleanup...')
  
  const result = await cleanupExpiredContent()
  
  // 使用量が80%を超えたら警告
  if (result.success && 'currentUsage' in result && result.currentUsage) {
    const usage = parseFloat(result.currentUsage.percentUsed)
    if (usage > 80) {
      console.warn(`Storage usage is high: ${usage}%`)
      // TODO: 管理者に通知を送る
    }
  }
  
  return result
}