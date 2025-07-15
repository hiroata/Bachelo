/**
 * 性癖カテゴリーを追加するスクリプト（iconなし版）
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const fetishCategories = [
  // 基本的な性癖
  { name: 'M男・M女', slug: 'masochist', description: 'M男性・M女性の体験談や願望', display_order: 25 },
  { name: 'S男・S女', slug: 'sadist', description: 'S男性・S女性の調教体験談', display_order: 26 },
  { name: '露出', slug: 'exhibitionism', description: '露出プレイや野外体験談', display_order: 27 },
  { name: '羞恥', slug: 'humiliation', description: '羞恥プレイや恥ずかしい体験', display_order: 28 },
  { name: 'NTR・寝取られ', slug: 'ntr', description: '寝取られ・寝取り体験談', display_order: 29 },
  
  // フェチ系
  { name: '足フェチ', slug: 'foot-fetish', description: '足・脚フェチの体験談', display_order: 30 },
  { name: '巨乳フェチ', slug: 'big-breasts', description: '巨乳好きの体験談', display_order: 31 },
  { name: '貧乳フェチ', slug: 'small-breasts', description: '貧乳・微乳好きの体験談', display_order: 32 },
  { name: 'ぽっちゃり', slug: 'chubby', description: 'ぽっちゃり・むっちり好き', display_order: 33 },
  { name: '熟女・人妻', slug: 'milf', description: '熟女・人妻との体験談', display_order: 34 },
  
  // プレイ系
  { name: 'アナル', slug: 'anal', description: 'アナルプレイ体験談', display_order: 35 },
  { name: '複数プレイ', slug: 'group', description: '3P・乱交などの体験談', display_order: 36 },
  { name: 'コスプレ', slug: 'cosplay', description: 'コスプレHの体験談', display_order: 37 },
  { name: 'SM・緊縛', slug: 'bdsm', description: 'SM・緊縛プレイ体験談', display_order: 38 },
  { name: '調教・奴隷', slug: 'training', description: '調教・奴隷プレイ体験談', display_order: 39 },
  
  // シチュエーション系
  { name: '不倫・浮気', slug: 'affair', description: '不倫・浮気の体験談', display_order: 40 },
  { name: '素人・ナンパ', slug: 'amateur', description: '素人・ナンパ体験談', display_order: 41 },
  { name: 'オフパコ', slug: 'offline-meetup', description: 'オフ会・出会い系体験談', display_order: 42 },
  { name: '車内・野外', slug: 'outdoor', description: '車内・野外プレイ体験談', display_order: 43 },
  { name: '学生・制服', slug: 'uniform', description: '学生・制服プレイ体験談', display_order: 44 }
];

async function addFetishCategories() {
  console.log('🔞 性癖カテゴリーの追加を開始...');
  
  try {
    let successCount = 0;
    
    for (const category of fetishCategories) {
      const { data, error } = await supabase
        .from('board_categories')
        .insert({
          name: category.name,
          slug: category.slug,
          description: category.description,
          display_order: category.display_order,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️  ${category.name} は既に存在します`);
        } else {
          console.error(`❌ ${category.name} の挿入エラー:`, error.message);
        }
      } else {
        console.log(`✅ ${category.name} を追加しました`);
        successCount++;
      }
    }
    
    console.log(`\n🎉 ${successCount} 個のカテゴリーを追加しました！`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// スクリプト実行
addFetishCategories();