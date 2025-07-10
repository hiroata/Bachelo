const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません。.env.localファイルを確認してください。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateReplyCounts() {
  try {
    console.log('すべての投稿の返信数を更新中...');
    
    // すべての投稿を取得
    const { data: posts, error: postsError } = await supabase
      .from('board_posts')
      .select('id, title');
    
    if (postsError) {
      console.error('投稿の取得エラー:', postsError);
      return;
    }
    
    console.log(`${posts.length}件の投稿を処理中...`);
    
    // 各投稿の返信数を更新
    for (const post of posts) {
      const { count, error: countError } = await supabase
        .from('board_replies')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      if (countError) {
        console.error(`返信数カウントエラー (${post.title}):`, countError);
        continue;
      }
      
      const { error: updateError } = await supabase
        .from('board_posts')
        .update({ replies_count: count || 0 })
        .eq('id', post.id);
      
      if (updateError) {
        console.error(`更新エラー (${post.title}):`, updateError);
      } else {
        console.log(`✓ ${post.title}: ${count || 0}件の返信`);
      }
    }
    
    console.log('\n✅ 返信数の更新が完了しました！');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
updateReplyCounts();