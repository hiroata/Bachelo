const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// リアルな投稿タイトル生成
const titles = [
  "初めての体験談を聞いてください",
  "人妻ですが欲求不満で...",
  "主人に内緒で会いたい",
  "30代の性欲について相談",
  "束縛されたい願望があります",
  "年下の男性が好きな理由",
  "声フェチの方いますか？",
  "毎晩妄想が止まりません",
  "セックスレスで悩んでいます",
  "不倫願望が抑えられない",
  "SMに興味があります",
  "オナニーの頻度について",
  "年上女性の魅力とは",
  "初体験の思い出",
  "理想のプレイについて",
  "寝取られ願望があります",
  "複数プレイに興味が...",
  "露出願望を満たしたい",
  "マッチングアプリでの出会い",
  "車内でのスリルが忘れられない",
  "声だけで感じてしまいます",
  "匂いフェチなんです",
  "筋肉質な男性が好き",
  "優しく責められたい",
  "激しく求められたい",
  "コスプレHの魅力",
  "野外でしたことある人",
  "おもちゃを使ってみたい",
  "言葉責めされたい",
  "縛られる快感について"
];

// リアルな投稿内容生成
const contentTemplates = [
  "こんばんは。{age}歳の{status}です。最近{problem}で悩んでいます。{desire}したいのですが、{obstacle}で困っています。同じような経験の方いませんか？",
  "初投稿です。{location}在住の{age}歳です。{fetish}なのですが、なかなか理解してもらえません。{experience}があって、それ以来{feeling}です。",
  "{greeting}。実は{secret}なんです。{partner}には内緒ですが、{fantasy}を想像すると{reaction}してしまいます。こんな私は変でしょうか？",
  "誰にも言えない願望があります。{desire}されることを想像すると、{physical}してしまいます。{age}歳になってもこんな欲求があるのは普通ですか？",
  "{time}になると{urge}が抑えられません。{method}で{frequency}しています。{guilt}けど、{satisfaction}です。アドバイスください。"
];

// ランダム要素
const ages = ["20", "25", "28", "30", "32", "35", "38", "40", "42", "45", "48", "50"];
const statuses = ["人妻", "主婦", "OL", "独身女性", "バツイチ", "シングルマザー"];
const locations = ["東京", "大阪", "名古屋", "福岡", "札幌", "横浜", "京都", "神戸"];
const problems = ["欲求不満", "性欲が強すぎること", "刺激が足りないこと", "マンネリ", "寂しさ"];

// 返信内容テンプレート
const replyTemplates = [
  "わかります！私も同じです。{experience}したことがあります。",
  "すごく興奮しました。もっと詳しく聞かせてください。",
  "{age}歳の{status}です。お気持ちよくわかります。",
  "私も{fetish}です！ぜひお話ししたいです。",
  "刺激的な投稿ですね。{reaction}してしまいました。",
  "同じ悩みを持っています。一緒に{activity}しませんか？",
  "素敵な投稿ですね。{location}なら会えるかも？",
  "もっと聞きたいです。詳細を教えてください。",
  "共感しかありません。私も{similar}な経験があります。",
  "ドキドキしながら読みました。続きが気になります。"
];

// 著者名生成
const authorNames = [
  "寂しい人妻", "欲求不満な主婦", "ムラムラOL", "エロ妻", "変態願望女子",
  "秘密の関係希望", "刺激を求めて", "夜の蝶", "濡れる人妻", "いけない主婦",
  "セフレ募集中", "SM初心者", "ドM女子", "痴女系", "清楚系ビッチ",
  "不倫願望", "年下好き", "おじさま好き", "声フェチ女子", "匂いフェチ"
];

async function generateHashedIP(index) {
  const fakeIP = `192.168.${Math.floor(index / 255)}.${index % 255}`;
  return crypto.createHash('sha256').update(fakeIP).digest('hex');
}

async function seedMassivePosts() {
  try {
    console.log('🚀 大量の投稿データを作成開始...\n');

    // カテゴリー取得
    const { data: categories, error: catError } = await supabase
      .from('board_categories')
      .select('id, name');
    
    if (catError) throw catError;
    
    // エロ系カテゴリーを優先
    const adultCategories = categories.filter(c => 
      ['エロ', '体験談', '相談', '募集'].includes(c.name)
    );
    const preferredCategories = adultCategories.length > 0 ? adultCategories : categories;

    // 100件の投稿を作成
    const posts = [];
    for (let i = 0; i < 100; i++) {
      const category = preferredCategories[i % preferredCategories.length];
      const ipHash = await generateHashedIP(i);
      
      // コンテンツ生成
      const title = titles[i % titles.length] + (i > 29 ? ` Part${Math.floor(i/30)}` : '');
      const template = contentTemplates[i % contentTemplates.length];
      const content = template
        .replace('{age}', ages[Math.floor(Math.random() * ages.length)])
        .replace('{status}', statuses[Math.floor(Math.random() * statuses.length)])
        .replace('{location}', locations[Math.floor(Math.random() * locations.length)])
        .replace('{problem}', problems[Math.floor(Math.random() * problems.length)])
        .replace('{desire}', ['責められ', '支配され', '愛され', '求められ'][Math.floor(Math.random() * 4)])
        .replace('{obstacle}', ['勇気がなくて', '相手がいなくて', '罪悪感があって'][Math.floor(Math.random() * 3)])
        .replace('{fetish}', ['声フェチ', '匂いフェチ', '筋肉フェチ', 'ドM'][Math.floor(Math.random() * 4)])
        .replace('{experience}', ['一度だけ経験', '何度か経験', '最近体験'][Math.floor(Math.random() * 3)])
        .replace('{feeling}', ['忘れられません', '興奮が止まりません', '毎日思い出します'][Math.floor(Math.random() * 3)])
        .replace('{greeting}', ['こんばんは', 'はじめまして', '夜分失礼します'][Math.floor(Math.random() * 3)])
        .replace('{secret}', ['実は変態', '隠れドM', 'むっつりスケベ'][Math.floor(Math.random() * 3)])
        .replace('{partner}', ['夫', '彼氏', 'パートナー'][Math.floor(Math.random() * 3)])
        .replace('{fantasy}', ['激しいプレイ', '複数プレイ', '野外プレイ'][Math.floor(Math.random() * 3)])
        .replace('{reaction}', ['濡れて', '興奮', 'ムラムラ'][Math.floor(Math.random() * 3)])
        .replace('{time}', ['夜中', '一人の時', '寝る前'][Math.floor(Math.random() * 3)])
        .replace('{urge}', ['性欲', '妄想', '欲求'][Math.floor(Math.random() * 3)])
        .replace('{method}', ['一人で', 'おもちゃを使って', '想像しながら'][Math.floor(Math.random() * 3)])
        .replace('{frequency}', ['毎日', '週に数回', '我慢できない時'][Math.floor(Math.random() * 3)])
        .replace('{guilt}', ['罪悪感はある', '恥ずかしい', 'いけないと思う'][Math.floor(Math.random() * 3)])
        .replace('{satisfaction}', ['満足できません', '物足りません', 'もっと欲しいです'][Math.floor(Math.random() * 3)])
        .replace('{activity}', ['お話し', '妄想を共有', '秘密の関係に'][Math.floor(Math.random() * 3)])
        .replace('{similar}', ['似たよう', '同じよう', 'そんな'][Math.floor(Math.random() * 3)])
        .replace('{physical}', ['体が熱く', '濡れて', 'ドキドキ'][Math.floor(Math.random() * 3)]);
      
      const post = {
        category_id: category.id,
        title: title,
        content: content,
        author_name: authorNames[i % authorNames.length] + (i >= authorNames.length ? i : ''),
        ip_hash: ipHash,
        view_count: Math.floor(Math.random() * 5000) + 100,
        plus_count: Math.floor(Math.random() * 100),
        minus_count: Math.floor(Math.random() * 20),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      posts.push(post);
    }

    // バッチで投稿を挿入
    console.log('📝 100件の投稿を作成中...');
    const { data: createdPosts, error: postError } = await supabase
      .from('board_posts')
      .insert(posts)
      .select('id, title');
    
    if (postError) throw postError;
    console.log(`✅ ${createdPosts.length}件の投稿を作成しました！`);

    // 1000件の返信を作成
    console.log('\n💬 1000件の返信を作成中...');
    const replies = [];
    
    for (let i = 0; i < 1000; i++) {
      const post = createdPosts[Math.floor(Math.random() * createdPosts.length)];
      const replyTemplate = replyTemplates[i % replyTemplates.length];
      const ipHash = await generateHashedIP(i + 1000);
      
      const content = replyTemplate
        .replace('{experience}', ['似たような経験', '同じ経験', '違う経験'][Math.floor(Math.random() * 3)])
        .replace('{age}', ages[Math.floor(Math.random() * ages.length)])
        .replace('{status}', statuses[Math.floor(Math.random() * statuses.length)])
        .replace('{fetish}', ['同じフェチ', '違うフェチ', '複数のフェチ'][Math.floor(Math.random() * 3)])
        .replace('{reaction}', ['興奮', '共感', 'ドキドキ'][Math.floor(Math.random() * 3)])
        .replace('{activity}', ['お話', '体験を共有', '一緒に楽しみ'][Math.floor(Math.random() * 3)])
        .replace('{location}', locations[Math.floor(Math.random() * locations.length)])
        .replace('{similar}', ['同じ', '似た', 'もっとすごい'][Math.floor(Math.random() * 3)]);
      
      const reply = {
        post_id: post.id,
        content: content,
        author_name: `匿名${i + 1}`,
        ip_hash: ipHash,
        plus_count: Math.floor(Math.random() * 50),
        minus_count: Math.floor(Math.random() * 10),
        created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      replies.push(reply);
      
      // 100件ごとにバッチ挿入
      if (replies.length === 100) {
        const { error } = await supabase
          .from('board_replies')
          .insert(replies);
        
        if (error) {
          console.error(`❌ 返信挿入エラー: ${error.message}`);
        } else {
          console.log(`✅ ${i + 1}件目まで完了`);
        }
        replies.length = 0;
      }
    }

    // 残りの返信を挿入
    if (replies.length > 0) {
      const { error } = await supabase
        .from('board_replies')
        .insert(replies);
      
      if (error) {
        console.error(`❌ 最後の返信挿入エラー: ${error.message}`);
      }
    }

    console.log('\n🎉 すべてのデータ作成が完了しました！');
    console.log('📊 掲示板が活気を取り戻しました！');

  } catch (error) {
    console.error('❌ エラーが発生:', error);
  }
}

seedMassivePosts();