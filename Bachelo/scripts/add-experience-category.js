/**
 * 体験談カテゴリーを追加するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addExperienceCategory() {
  console.log('💭 体験談カテゴリーの追加を開始...');
  
  try {
    // 既存の体験談カテゴリーを確認
    const { data: existing, error: fetchError } = await supabase
      .from('board_categories')
      .select('*')
      .or('slug.eq.experience,slug.eq.confession,slug.eq.体験談')
      .single();
    
    if (existing) {
      console.log('✅ 体験談カテゴリーは既に存在します:', existing);
      return;
    }
    
    // 体験談カテゴリーを挿入
    const { data, error } = await supabase
      .from('board_categories')
      .insert({
        name: '体験談',
        slug: 'experience',
        description: 'みんなの体験談を投稿・閲覧できる掲示板',
        display_order: 2, // 掲示板の次に表示
        icon: '💭',
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ カテゴリー挿入エラー:', error);
      return;
    }
    
    console.log('✅ 体験談カテゴリーの追加が完了しました！');
    console.log('追加されたカテゴリー:', data);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// スクリプト実行
addExperienceCategory();