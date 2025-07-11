/**
 * カテゴリー拡充スクリプト
 * 既存のカテゴリーを更新し、新しいカテゴリーを追加
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const expandedCategories = [
  // エンタメ系
  { name: '雑談', slug: 'general', description: '自由に話せる雑談掲示板', display_order: 1 },
  { name: '質問', slug: 'questions', description: '質問や相談ができる掲示板', display_order: 2 },
  { name: 'ニュース', slug: 'news', description: '最新ニュースや話題を共有', display_order: 3 },
  { name: '趣味', slug: 'hobby', description: '趣味の話題で盛り上がろう', display_order: 4 },
  { name: '地域', slug: 'local', description: '地域の情報交換', display_order: 5 },
  
  // ライフスタイル系
  { name: '恋愛', slug: 'love', description: '恋愛相談や体験談', display_order: 6 },
  { name: '仕事', slug: 'work', description: '仕事の悩みや転職情報', display_order: 7 },
  { name: '美容', slug: 'beauty', description: '美容・コスメ・ダイエット', display_order: 8 },
  { name: 'ファッション', slug: 'fashion', description: 'ファッション・コーディネート', display_order: 9 },
  { name: 'グルメ', slug: 'food', description: '食べ物・レストラン情報', display_order: 10 },
  
  // エンタメ・趣味系
  { name: 'ゲーム', slug: 'game', description: 'ゲーム全般の話題', display_order: 11 },
  { name: 'アニメ・漫画', slug: 'anime', description: 'アニメ・漫画・ラノベ', display_order: 12 },
  { name: '音楽', slug: 'music', description: '音楽・アーティスト情報', display_order: 13 },
  { name: '映画・ドラマ', slug: 'movie', description: '映画・ドラマ・配信作品', display_order: 14 },
  { name: 'スポーツ', slug: 'sports', description: 'スポーツ観戦・実況', display_order: 15 },
  
  // コミュニティ系
  { name: '既婚者', slug: 'married', description: '夫婦・家族の話題', display_order: 16 },
  { name: '独身', slug: 'single', description: '独身生活・婚活', display_order: 17 },
  { name: '学生', slug: 'student', description: '学生生活・受験・就活', display_order: 18 },
  { name: 'ペット', slug: 'pet', description: 'ペット自慢・飼育相談', display_order: 19 },
  { name: '健康', slug: 'health', description: '健康・病気・メンタルヘルス', display_order: 20 },
];

async function expandCategories() {
  console.log('🚀 カテゴリー拡充を開始...');
  
  try {
    // 既存のカテゴリーを確認
    const { data: existingCategories, error: fetchError } = await supabase
      .from('board_categories')
      .select('slug');
    
    if (fetchError) {
      console.error('❌ カテゴリー取得エラー:', fetchError);
      return;
    }
    
    const existingSlugs = existingCategories.map(cat => cat.slug);
    console.log(`📋 既存カテゴリー数: ${existingSlugs.length}`);
    
    // 新しいカテゴリーのみ抽出
    const newCategories = expandedCategories.filter(
      cat => !existingSlugs.includes(cat.slug)
    );
    
    console.log(`✨ 追加するカテゴリー数: ${newCategories.length}`);
    
    if (newCategories.length > 0) {
      // 新しいカテゴリーを挿入
      const { data, error } = await supabase
        .from('board_categories')
        .insert(newCategories);
      
      if (error) {
        console.error('❌ カテゴリー挿入エラー:', error);
        return;
      }
      
      console.log('✅ カテゴリーの追加が完了しました！');
      
      // 追加されたカテゴリーを表示
      newCategories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.slug})`);
      });
    } else {
      console.log('ℹ️  すべてのカテゴリーは既に存在します');
    }
    
    // 既存カテゴリーの表示順を更新
    console.log('\n📊 表示順を更新中...');
    
    for (const category of expandedCategories) {
      const { error: updateError } = await supabase
        .from('board_categories')
        .update({ 
          display_order: category.display_order,
          description: category.description 
        })
        .eq('slug', category.slug);
      
      if (updateError) {
        console.error(`❌ ${category.name}の更新エラー:`, updateError);
      }
    }
    
    console.log('✅ 表示順の更新が完了しました！');
    
    // 最終確認
    const { data: finalCategories, error: finalError } = await supabase
      .from('board_categories')
      .select('*')
      .order('display_order');
    
    if (!finalError && finalCategories) {
      console.log(`\n📈 合計カテゴリー数: ${finalCategories.length}`);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// スクリプト実行
expandCategories();