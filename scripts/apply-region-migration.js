require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyRegionMigration() {
  console.log('🚀 地域機能マイグレーションを適用中...');
  
  try {
    // マイグレーションファイルを読み込み
    const migrationPath = path.join(__dirname, '../supabase/migrations/023_add_region_support.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // SQLを実行
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ マイグレーションエラー:', error);
      return;
    }
    
    console.log('✅ 地域機能マイグレーションが正常に適用されました！');
    
    // 地域別の投稿数を確認
    const { data: regionCounts, error: countError } = await supabase
      .from('board_posts')
      .select('region')
      .order('region');
      
    if (!countError && regionCounts) {
      const counts = regionCounts.reduce((acc, post) => {
        acc[post.region] = (acc[post.region] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 地域別投稿数:');
      Object.entries(counts).forEach(([region, count]) => {
        console.log(`  ${region}: ${count}件`);
      });
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

applyRegionMigration();