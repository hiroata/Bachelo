/**
 * 音声カテゴリーを追加するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addVoiceCategory() {
  console.log('🎤 音声カテゴリーの追加を開始...');
  
  try {
    // 既存の音声カテゴリーを確認
    const { data: existing, error: fetchError } = await supabase
      .from('board_categories')
      .select('*')
      .eq('slug', 'voice')
      .single();
    
    if (existing) {
      console.log('✅ 音声カテゴリーは既に存在します:', existing);
      return;
    }
    
    // 音声カテゴリーを挿入
    const { data, error } = await supabase
      .from('board_categories')
      .insert({
        name: '音声掲示板',
        slug: 'voice',
        description: '音声投稿専用の掲示板',
        display_order: 0, // 最初に表示
        icon: '🎤',
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ カテゴリー挿入エラー:', error);
      return;
    }
    
    console.log('✅ 音声カテゴリーの追加が完了しました！');
    console.log('追加されたカテゴリー:', data);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// スクリプト実行
addVoiceCategory();