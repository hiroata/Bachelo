/**
 * 性癖カテゴリーを追加するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const fetishCategories = [
  // 基本的な性癖
  { name: 'M男・M女', slug: 'masochist', description: 'M男性・M女性の体験談や願望', display_order: 25, icon: '🔗' },
  { name: 'S男・S女', slug: 'sadist', description: 'S男性・S女性の調教体験談', display_order: 26, icon: '👑' },
  { name: '露出', slug: 'exhibitionism', description: '露出プレイや野外体験談', display_order: 27, icon: '🌃' },
  { name: '羞恥', slug: 'humiliation', description: '羞恥プレイや恥ずかしい体験', display_order: 28, icon: '😳' },
  { name: 'NTR・寝取られ', slug: 'ntr', description: '寝取られ・寝取り体験談', display_order: 29, icon: '💔' },
  
  // フェチ系
  { name: '足フェチ', slug: 'foot-fetish', description: '足・脚フェチの体験談', display_order: 30, icon: '🦶' },
  { name: '巨乳フェチ', slug: 'big-breasts', description: '巨乳好きの体験談', display_order: 31, icon: '🍈' },
  { name: '貧乳フェチ', slug: 'small-breasts', description: '貧乳・微乳好きの体験談', display_order: 32, icon: '🌸' },
  { name: 'ぽっちゃり', slug: 'chubby', description: 'ぽっちゃり・むっちり好き', display_order: 33, icon: '🧸' },
  { name: '熟女・人妻', slug: 'milf', description: '熟女・人妻との体験談', display_order: 34, icon: '👩' },
  
  // プレイ系
  { name: 'アナル', slug: 'anal', description: 'アナルプレイ体験談', display_order: 35, icon: '🍑' },
  { name: '複数プレイ', slug: 'group', description: '3P・乱交などの体験談', display_order: 36, icon: '👥' },
  { name: 'コスプレ', slug: 'cosplay', description: 'コスプレHの体験談', display_order: 37, icon: '🎭' },
  { name: 'SM・緊縛', slug: 'bdsm', description: 'SM・緊縛プレイ体験談', display_order: 38, icon: '⛓️' },
  { name: '調教・奴隷', slug: 'training', description: '調教・奴隷プレイ体験談', display_order: 39, icon: '🎯' },
  
  // シチュエーション系
  { name: '不倫・浮気', slug: 'affair', description: '不倫・浮気の体験談', display_order: 40, icon: '💋' },
  { name: '素人・ナンパ', slug: 'amateur', description: '素人・ナンパ体験談', display_order: 41, icon: '🎲' },
  { name: 'オフパコ', slug: 'offline-meetup', description: 'オフ会・出会い系体験談', display_order: 42, icon: '📱' },
  { name: '車内・野外', slug: 'outdoor', description: '車内・野外プレイ体験談', display_order: 43, icon: '🚗' },
  { name: '学生・制服', slug: 'uniform', description: '学生・制服プレイ体験談', display_order: 44, icon: '🎒' }
];

async function addFetishCategories() {
  console.log('🔞 性癖カテゴリーの追加を開始...');
  
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
    const newCategories = fetishCategories.filter(
      cat => !existingSlugs.includes(cat.slug)
    );
    
    console.log(`✨ 追加する性癖カテゴリー数: ${newCategories.length}`);
    
    if (newCategories.length > 0) {
      // 新しいカテゴリーを挿入
      const { data, error } = await supabase
        .from('board_categories')
        .insert(newCategories);
      
      if (error) {
        console.error('❌ カテゴリー挿入エラー:', error);
        return;
      }
      
      console.log('✅ 性癖カテゴリーの追加が完了しました！');
      
      // 追加されたカテゴリーを表示
      newCategories.forEach(cat => {
        console.log(`  ${cat.icon} ${cat.name} (${cat.slug})`);
      });
    } else {
      console.log('ℹ️  すべての性癖カテゴリーは既に存在します');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// スクリプト実行
addFetishCategories();