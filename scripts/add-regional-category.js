/**
 * 地域カテゴリーを追加するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addRegionalCategory() {
  console.log('🗾 地域カテゴリーの追加を開始...');
  
  try {
    // 既存の地域カテゴリーを確認
    const { data: existing, error: fetchError } = await supabase
      .from('board_categories')
      .select('*')
      .or('slug.eq.regional,slug.eq.region,slug.eq.local')
      .order('display_order');
    
    if (existing && existing.length > 0) {
      console.log('✅ 地域関連カテゴリーは既に存在します:', existing);
      
      // slugがregionalでない場合は更新
      const needsUpdate = existing.find(cat => cat.slug !== 'regional');
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('board_categories')
          .update({
            slug: 'regional',
            name: '地域',
            icon: '🗾',
            description: '地域別の掲示板'
          })
          .eq('id', needsUpdate.id);
        
        if (!updateError) {
          console.log('✅ 地域カテゴリーを更新しました');
        }
      }
      return;
    }
    
    // 地域カテゴリーを挿入
    const { data, error } = await supabase
      .from('board_categories')
      .insert({
        name: '地域',
        slug: 'regional',
        description: '地域別の掲示板',
        display_order: 5,
        icon: '🗾',
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ カテゴリー挿入エラー:', error);
      return;
    }
    
    console.log('✅ 地域カテゴリーの追加が完了しました！');
    console.log('追加されたカテゴリー:', data);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// スクリプト実行
addRegionalCategory();