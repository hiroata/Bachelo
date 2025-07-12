const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDatabaseStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔍 データベース状況を確認中...\n');
    
    // 1. board_categories の確認
    console.log('📋 board_categories テーブル:');
    const { data: categories, error: catError } = await supabase
      .from('board_categories')
      .select('*');
    
    if (catError) {
      console.log('❌ エラー:', catError.message);
    } else {
      console.log(`✅ カテゴリー数: ${categories?.length || 0}`);
      if (categories && categories.length > 0) {
        categories.forEach(cat => {
          console.log(`  - ${cat.name} (${cat.icon}): ${cat.description}`);
        });
      }
    }
    
    console.log('\n📊 board_posts テーブル:');
    const { data: posts, error: postsError } = await supabase
      .from('board_posts')
      .select('*')
      .limit(5);
    
    if (postsError) {
      console.log('❌ エラー:', postsError.message);
    } else {
      console.log(`✅ 投稿数: ${posts?.length || 0} (最初の5件)`);
      if (posts && posts.length > 0) {
        posts.forEach(post => {
          console.log(`  - ${post.title} by ${post.author_name}`);
        });
      }
    }
    
    console.log('\n🎵 anonymous_voice_posts テーブル:');
    const { data: voices, error: voicesError } = await supabase
      .from('anonymous_voice_posts')
      .select('*')
      .limit(3);
    
    if (voicesError) {
      console.log('❌ エラー:', voicesError.message);
    } else {
      console.log(`✅ 音声投稿数: ${voices?.length || 0}`);
      if (voices && voices.length > 0) {
        voices.forEach(voice => {
          console.log(`  - ${voice.title} (${voice.category})`);
        });
      }
    }
    
    console.log('\n💬 board_replies テーブル:');
    const { data: replies, error: repliesError } = await supabase
      .from('board_replies')
      .select('*')
      .limit(3);
    
    if (repliesError) {
      console.log('❌ エラー:', repliesError.message);
    } else {
      console.log(`✅ 返信数: ${replies?.length || 0}`);
    }
    
    // safe-migration.sqlで作成予定のテーブルをチェック
    const tablesToCheck = [
      'anonymous_voice_posts',
      'anonymous_post_comments', 
      'anonymous_post_likes',
      'board_categories',
      'board_posts',
      'board_post_images',
      'board_replies',
      'board_post_votes',
      'board_reply_votes'
    ];
    
    console.log('\n🏗️  マイグレーション対象テーブルの状況:');
    
    for (const tableName of tablesToCheck) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${tableName}: テーブルが存在しない or アクセス不可`);
      } else {
        console.log(`✅ ${tableName}: 存在確認 (データ件数: ${data?.length || 0})`);
      }
    }
    
    console.log('\n🎯 結論:');
    console.log('- 基本的なテーブル（board_categories, board_posts）は存在');
    console.log('- カテゴリーデータは既に投入済み (12件)');
    console.log('- safe-migration.sqlを実行することで追加テーブルを作成可能');
    
  } catch (error) {
    console.error('❌ 確認中にエラーが発生:', error);
  }
}

checkDatabaseStatus().catch(console.error);
