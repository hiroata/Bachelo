const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllRegions() {
  console.log('🗾 全国地域投稿の詳細確認...\n');
  
  try {
    // 地域別の投稿数を集計
    const { data: posts } = await supabase
      .from('board_posts')
      .select('title')
      .like('title', '%【%】%')
      .order('created_at', { ascending: false });
    
    // 地域名を抽出して集計
    const regionCounts = {};
    posts.forEach(post => {
      const match = post.title.match(/【(.+?)】/);
      if (match) {
        const location = match[1];
        regionCounts[location] = (regionCounts[location] || 0) + 1;
      }
    });
    
    // 地域別に集計結果を表示
    console.log('📊 地域別投稿数:');
    console.log('=====================================');
    
    // 地域を都道府県別にグループ化
    const prefectures = {
      '北海道': ['札幌', '旭川', '函館', '帯広', '釧路', '苫小牧', '小樽', '北見', '室蘭', '千歳'],
      '東北': ['仙台', '青森', '盛岡', '秋田', '山形', '福島', '郡山', '八戸', '弘前', '米沢'],
      '関東': ['東京', '新宿', '渋谷', '横浜', '千葉', 'さいたま', '川崎', '相模原', '船橋', '八王子', '柏', '藤沢', '六本木', '池袋', '秋葉原'],
      '北陸・甲信越': ['新潟', '金沢', '富山', '福井', '長野', '松本', '上田', '高岡', '小松', '上越'],
      '東海': ['名古屋', '静岡', '浜松', '岐阜', '四日市', '豊橋', '豊田', '岡崎', '一宮', '津'],
      '関西・近畿': ['大阪', '京都', '神戸', '奈良', '和歌山', '大津', '堺', '東大阪', '姫路', '西宮', '難波', '梅田', '心斎橋'],
      '中国': ['広島', '岡山', '下関', '倉敷', '福山', '山口', '鳥取', '松江', '呉', '尾道'],
      '四国': ['高松', '松山', '高知', '徳島', '今治', '新居浜', '西条', '丸亀', '宇和島', '鳴門'],
      '九州・沖縄': ['福岡', '北九州', '熊本', '鹿児島', '長崎', '大分', '宮崎', '佐賀', '那覇', '沖縄市', '天神', '博多'],
      '全国': ['全国', 'オンライン', 'どこでも', '相談', '移動可']
    };
    
    let grandTotal = 0;
    for (const [region, cities] of Object.entries(prefectures)) {
      console.log(`\n🌍 ${region}:`);
      let regionTotal = 0;
      
      const cityCounts = cities.map(city => {
        const count = regionCounts[city] || 0;
        regionTotal += count;
        return { city, count };
      }).filter(item => item.count > 0);
      
      cityCounts.forEach(({ city, count }) => {
        console.log(`   ${city}: ${count}件`);
      });
      
      // その他の地域名も検索
      Object.keys(regionCounts).forEach(location => {
        if (location.includes(region.split('・')[0]) && !cities.includes(location)) {
          const count = regionCounts[location];
          console.log(`   ${location}: ${count}件`);
          regionTotal += count;
        }
      });
      
      console.log(`   小計: ${regionTotal}件`);
      grandTotal += regionTotal;
    }
    
    console.log('\n=====================================');
    console.log(`📊 総投稿数: ${grandTotal}件`);
    console.log('=====================================');
    
    // 返信数も確認
    const { count: replyCount } = await supabase
      .from('board_replies')
      .select('*', { count: 'exact', head: true });
    
    console.log(`💬 総返信数: ${replyCount}件`);
    console.log('=====================================');
    
    // 人気投稿TOP10
    console.log('\n🔥 人気投稿TOP10:');
    const { data: popularPosts } = await supabase
      .from('board_posts')
      .select('title, view_count, plus_count')
      .like('title', '%【%】%')
      .order('view_count', { ascending: false })
      .limit(10);
    
    popularPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   閲覧数: ${post.view_count}, いいね: ${post.plus_count}`);
    });
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

checkAllRegions();