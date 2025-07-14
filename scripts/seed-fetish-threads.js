/**
 * 性癖カテゴリーごとのサンプルスレッドを作成するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ランダムな投稿者名を生成
const getRandomAuthor = () => {
  const names = [
    '名無しさん', '匿名希望', 'エロ紳士', '変態仮面', '夜の帝王',
    'ドM子', 'サド侯爵', '露出狂', '素人童貞', '経験者',
    'フェチ好き', '初心者', 'ベテラン', '調教師', '奴隷志願',
    'NTR愛好家', '人妻好き', '巨乳星人', '貧乳教徒', 'ぽちゃ専'
  ];
  return names[Math.floor(Math.random() * names.length)];
};

// サンプルスレッドデータ
const sampleThreads = {
  'masochist': [
    {
      title: '【M男】初めて女王様に調教されました',
      content: `先週、SMクラブで初めて女王様に調教していただきました。
最初は緊張しましたが、優しく導いてくれて...
詳しく聞きたい人いますか？`,
      replies: 15
    },
    {
      title: 'M女だけど質問ある？',
      content: `タイトル通りです。
20代後半のOLで、彼氏に調教されてます。
なんでも聞いてください。`,
      replies: 32
    },
    {
      title: '【相談】彼女にMだと告白したい',
      content: `付き合って3ヶ月の彼女がいます。
自分がMだということをまだ言えていません。
どうやって切り出せばいいでしょうか？`,
      replies: 8
    }
  ],
  
  'sadist': [
    {
      title: 'S男が教える調教テクニック',
      content: `需要があれば、これまでの経験から学んだ調教テクニックを共有します。
相手の同意は絶対条件です。
興味ある人いる？`,
      replies: 45
    },
    {
      title: '【S女】ペット募集してる？って聞かれるけど',
      content: `最近よく「ペット募集してますか？」ってDMが来る。
みんなはどうやって相手見つけてる？`,
      replies: 23
    }
  ],
  
  'exhibitionism': [
    {
      title: '【露出】深夜の公園で...',
      content: `昨日、人がいない深夜の公園で露出してきました。
スリルがたまらない...
同じ趣味の人いる？`,
      replies: 28
    },
    {
      title: '露出デートしてくれる彼女が欲しい',
      content: `タイトルの通りです。
一緒に露出プレイを楽しめる彼女を探してます。
そんな女性っているのかな？`,
      replies: 19
    }
  ],
  
  'ntr': [
    {
      title: '【NTR】妻を他の男に...',
      content: `実は妻を他の男性に抱かせる妄想が止まりません。
同じような性癖の人いますか？
実行した人の話も聞きたいです。`,
      replies: 67
    },
    {
      title: '寝取られ願望がある女です',
      content: `彼氏の前で他の男性と...という妄想をしてしまいます。
おかしいでしょうか？`,
      replies: 54
    }
  ],
  
  'foot-fetish': [
    {
      title: '【足フェチ】美脚OLの話',
      content: `職場にめちゃくちゃ美脚のOLさんがいて、
毎日その人の脚ばかり見てしまいます。
同じような人いる？`,
      replies: 41
    }
  ],
  
  'milf': [
    {
      title: '【人妻】40代だけどまだまだ現役',
      content: `40代の人妻です。
夫とはレスですが、まだまだ性欲はあります。
同じような方いませんか？`,
      replies: 89
    },
    {
      title: '熟女好きが集まるスレ',
      content: `熟女の魅力について語りましょう。
20代の若い女性にはない魅力がありますよね。`,
      replies: 76
    }
  ],
  
  'cosplay': [
    {
      title: '【コスプレH】メイド服でご奉仕',
      content: `彼氏にメイド服でご奉仕するのが好きです。
他にもコスプレH好きな人いる？`,
      replies: 34
    }
  ],
  
  'affair': [
    {
      title: '【不倫】職場の上司と...',
      content: `既婚者ですが、職場の上司と関係を持ってしまいました。
罪悪感はありますが、やめられません...`,
      replies: 103
    }
  ],
  
  'outdoor': [
    {
      title: '【車内】ドライブデートからの...',
      content: `昨日、彼女とドライブデートしてきました。
人気のない場所で車内で...
みんなは車内プレイの経験ある？`,
      replies: 52
    }
  ]
};

async function seedFetishThreads() {
  console.log('🔞 性癖スレッドのシード開始...');
  
  try {
    // カテゴリーを取得
    const { data: categories, error: catError } = await supabase
      .from('board_categories')
      .select('id, slug, name');
    
    if (catError) {
      console.error('❌ カテゴリー取得エラー:', catError);
      return;
    }
    
    let totalCreated = 0;
    
    // 各カテゴリーにスレッドを作成
    for (const [slug, threads] of Object.entries(sampleThreads)) {
      const category = categories.find(cat => cat.slug === slug);
      
      if (!category) {
        console.log(`⚠️  カテゴリー '${slug}' が見つかりません`);
        continue;
      }
      
      console.log(`\n📁 ${category.name} カテゴリーにスレッド作成中...`);
      
      for (const thread of threads) {
        // 投稿を作成
        const { data: post, error: postError } = await supabase
          .from('board_posts')
          .insert({
            category_id: category.id,
            title: thread.title,
            content: thread.content,
            author_name: getRandomAuthor(),
            author_email: `user${Math.floor(Math.random() * 1000)}@example.com`,
            view_count: Math.floor(Math.random() * 1000) + 100,
            plus_count: Math.floor(Math.random() * 50) + 5,
            minus_count: Math.floor(Math.random() * 10),
            replies_count: thread.replies || 0
          })
          .select()
          .single();
        
        if (postError) {
          console.error(`❌ スレッド作成エラー:`, postError);
          continue;
        }
        
        console.log(`  ✅ "${thread.title}" を作成`);
        totalCreated++;
        
        // いくつかの返信も作成
        const replyCount = Math.min(thread.replies || 0, 5);
        for (let i = 0; i < replyCount; i++) {
          const replyContent = getRandomReply(category.slug);
          const { error: replyError } = await supabase
            .from('board_replies')
            .insert({
              post_id: post.id,
              author_name: getRandomAuthor(),
              content: replyContent,
              plus_count: Math.floor(Math.random() * 20),
              minus_count: Math.floor(Math.random() * 5)
            });
          
          if (replyError) {
            console.error(`❌ 返信作成エラー:`, replyError);
          }
        }
      }
    }
    
    console.log(`\n🎉 合計 ${totalCreated} 個のスレッドを作成しました！`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// ランダムな返信を生成
function getRandomReply(categorySlug) {
  const replies = {
    'masochist': [
      'すごく興味あります！詳しく聞かせてください',
      '私も同じような経験があります',
      'どこのお店ですか？',
      '初心者でも大丈夫ですか？',
      'うらやましい...'
    ],
    'sadist': [
      'テクニック教えてほしいです',
      '相手の反応はどうでした？',
      '注意点とかありますか？',
      '経験談もっと聞きたい',
      'パートナー募集してますか？'
    ],
    'default': [
      'わかる〜',
      '続きが気になります',
      'もっと詳しく！',
      '似たような経験あります',
      'すごいですね',
      'ドキドキしました',
      '羨ましい限りです'
    ]
  };
  
  const categoryReplies = replies[categorySlug] || replies.default;
  return categoryReplies[Math.floor(Math.random() * categoryReplies.length)];
}

// スクリプト実行
seedFetishThreads();