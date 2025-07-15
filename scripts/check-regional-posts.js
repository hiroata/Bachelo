const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRegionalPosts() {
  console.log('🔍 地域投稿の確認中...\n');
  
  try {
    // 地域カテゴリーを確認
    const { data: categories } = await supabase
      .from('board_categories')
      .select('*')
      .or('slug.eq.regional,slug.eq.region,name.eq.地域');
    
    console.log('📁 地域カテゴリー:', categories);
    
    if (categories && categories.length > 0) {
      const regionalCategoryId = categories[0].id;
      
      // 地域投稿数を確認
      const { data: posts, count } = await supabase
        .from('board_posts')
        .select('*', { count: 'exact', head: false })
        .eq('category_id', regionalCategoryId)
        .limit(10);
      
      console.log(`\n📊 地域カテゴリーの投稿数: ${count}件`);
      
      // 最新の投稿をいくつか表示
      console.log('\n📝 最新の地域投稿:');
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   作成者: ${post.author_name}`);
        console.log(`   閲覧数: ${post.view_count}, いいね: ${post.plus_count}\n`);
      });
    } else {
      console.log('❌ 地域カテゴリーが見つかりません');
    }
    
    // タイトルに地域名を含む投稿も検索
    const regionKeywords = ['札幌', '東京', '大阪', '福岡', '名古屋', '仙台', '広島', '京都'];
    console.log('\n🔍 地域名を含む投稿を検索中...');
    
    for (const keyword of regionKeywords) {
      const { count } = await supabase
        .from('board_posts')
        .select('*', { count: 'exact', head: true })
        .ilike('title', `%【${keyword}%`);
      
      if (count > 0) {
        console.log(`【${keyword}】を含む投稿: ${count}件`);
      }
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

checkRegionalPosts();