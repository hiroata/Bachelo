const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 返信テンプレート
const replyTemplates = [
  "めちゃくちゃタイプです！ぜひお会いしたいです",
  "条件ぴったりです。連絡先交換しませんか？",
  "すごく興味あります！詳しくお話聞かせてください",
  "今夜会えますか？すぐにでも会いたいです",
  "写真交換できますか？お互い確認してから会いましょう",
  "車あるので迎えに行けますよ！",
  "ホテル代は全額持ちます。いつがいいですか？",
  "同じ地域なのですぐ会えます！",
  "プロフィール見て一目惚れしました♡",
  "経験豊富なので満足させる自信あります",
  "優しくリードしますから安心してください",
  "年齢は気にしません！タイプならOKです",
  "すごく魅力的な投稿ですね",
  "こんな素敵な人と出会えるなんて！",
  "まさに理想の人です！ぜひ繋がりたいです",
  "清潔感には自信あります",
  "お小遣いも渡せます。金額は相談で",
  "今週末なら会えます！どうですか？",
  "LINE交換からでもいいですか？",
  "どんなプレイが好きですか？何でも対応できます"
];

async function addRegionalReplies() {
  console.log('💬 地域投稿への返信を追加中...\n');
  
  try {
    // 地域名を含む投稿を取得
    const regionKeywords = ['札幌', '東京', '大阪', '福岡', '名古屋', '仙台', '広島', '京都', '新潟', '横浜', '神戸', '熊本', '那覇'];
    let allPosts = [];
    
    for (const keyword of regionKeywords) {
      const { data: posts } = await supabase
        .from('board_posts')
        .select('*')
        .ilike('title', `%【${keyword}%`)
        .limit(50);
      
      if (posts) {
        allPosts = [...allPosts, ...posts];
      }
    }
    
    console.log(`📊 返信を追加する投稿数: ${allPosts.length}件`);
    
    let totalReplies = 0;
    
    // 各投稿に返信を追加
    for (const post of allPosts) {
      // 既存の返信数を確認
      const { count: existingReplies } = await supabase
        .from('board_replies')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      // 既に返信がある場合はスキップ
      if (existingReplies > 10) {
        continue;
      }
      
      // 10-30件の返信を追加
      const replyCount = Math.floor(Math.random() * 21) + 10;
      const replies = [];
      
      for (let i = 0; i < replyCount; i++) {
        const replyContent = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
        const postDate = new Date(post.created_at);
        const replyDate = new Date(postDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
        
        replies.push({
          post_id: post.id,
          content: replyContent,
          author_name: `エロ男${Math.floor(Math.random() * 10000)}`,
          ip_hash: crypto.createHash('sha256').update(`reply-${post.id}-${i}-${Date.now()}`).digest('hex'),
          plus_count: Math.floor(Math.random() * 30) + 1,
          minus_count: Math.floor(Math.random() * 3),
          created_at: replyDate.toISOString()
        });
      }
      
      // 返信を挿入
      if (replies.length > 0) {
        const { error } = await supabase
          .from('board_replies')
          .insert(replies);
        
        if (!error) {
          totalReplies += replies.length;
          console.log(`✅ ${post.title} に ${replies.length}件の返信を追加`);
        } else {
          console.error(`❌ 返信追加エラー:`, error);
        }
      }
    }
    
    console.log(`\n🎉 完了！合計 ${totalReplies}件の返信を追加しました`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

addRegionalReplies();