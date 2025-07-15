/**
 * 性癖カテゴリーごとのサンプルスレッドを作成するスクリプト（シンプル版）
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
詳しく聞きたい人いますか？`
    },
    {
      title: 'M女だけど質問ある？',
      content: `タイトル通りです。
20代後半のOLで、彼氏に調教されてます。
なんでも聞いてください。`
    },
    {
      title: '【相談】彼女にMだと告白したい',
      content: `付き合って3ヶ月の彼女がいます。
自分がMだということをまだ言えていません。
どうやって切り出せばいいでしょうか？`
    }
  ],
  
  'sadist': [
    {
      title: 'S男が教える調教テクニック',
      content: `需要があれば、これまでの経験から学んだ調教テクニックを共有します。
相手の同意は絶対条件です。
興味ある人いる？`
    },
    {
      title: '【S女】ペット募集してる？って聞かれるけど',
      content: `最近よく「ペット募集してますか？」ってDMが来る。
みんなはどうやって相手見つけてる？`
    }
  ],
  
  'exhibitionism': [
    {
      title: '【露出】深夜の公園で...',
      content: `昨日、人がいない深夜の公園で露出してきました。
スリルがたまらない...
同じ趣味の人いる？`
    },
    {
      title: '露出デートしてくれる彼女が欲しい',
      content: `タイトルの通りです。
一緒に露出プレイを楽しめる彼女を探してます。
そんな女性っているのかな？`
    }
  ],
  
  'ntr': [
    {
      title: '【NTR】妻を他の男に...',
      content: `実は妻を他の男性に抱かせる妄想が止まりません。
同じような性癖の人いますか？
実行した人の話も聞きたいです。`
    },
    {
      title: '寝取られ願望がある女です',
      content: `彼氏の前で他の男性と...という妄想をしてしまいます。
おかしいでしょうか？`
    }
  ],
  
  'foot-fetish': [
    {
      title: '【足フェチ】美脚OLの話',
      content: `職場にめちゃくちゃ美脚のOLさんがいて、
毎日その人の脚ばかり見てしまいます。
同じような人いる？`
    }
  ],
  
  'milf': [
    {
      title: '【人妻】40代だけどまだまだ現役',
      content: `40代の人妻です。
夫とはレスですが、まだまだ性欲はあります。
同じような方いませんか？`
    },
    {
      title: '熟女好きが集まるスレ',
      content: `熟女の魅力について語りましょう。
20代の若い女性にはない魅力がありますよね。`
    }
  ],
  
  'cosplay': [
    {
      title: '【コスプレH】メイド服でご奉仕',
      content: `彼氏にメイド服でご奉仕するのが好きです。
他にもコスプレH好きな人いる？`
    }
  ],
  
  'affair': [
    {
      title: '【不倫】職場の上司と...',
      content: `既婚者ですが、職場の上司と関係を持ってしまいました。
罪悪感はありますが、やめられません...`
    }
  ],
  
  'outdoor': [
    {
      title: '【車内】ドライブデートからの...',
      content: `昨日、彼女とドライブデートしてきました。
人気のない場所で車内で...
みんなは車内プレイの経験ある？`
    }
  ],
  
  'big-breasts': [
    {
      title: '巨乳の彼女ができました',
      content: `Hカップの彼女ができて天国です。
巨乳好きの人、語りましょう！`
    }
  ],
  
  'small-breasts': [
    {
      title: '貧乳こそ至高',
      content: `貧乳・微乳の魅力について語るスレです。
小さい胸の何がそんなに良いのか熱く語ります。`
    }
  ],
  
  'chubby': [
    {
      title: 'ぽっちゃり女子との体験談',
      content: `ぽっちゃりした女の子と付き合ってます。
柔らかくて最高です。同じ趣味の人いる？`
    }
  ],
  
  'anal': [
    {
      title: '【アナル開発】初心者向けガイド',
      content: `アナルプレイに興味あるけど怖い...という人向けに
安全な開発方法を共有します。`
    }
  ],
  
  'group': [
    {
      title: '【3P】初体験してきました',
      content: `昨日、初めて3Pを経験しました。
想像以上に興奮しました...詳細聞きたい人いる？`
    }
  ],
  
  'bdsm': [
    {
      title: '【緊縛】縄の選び方と基本',
      content: `緊縛に興味ある初心者向けに、
安全な縄の選び方と基本的な縛り方を解説します。`
    }
  ],
  
  'training': [
    {
      title: '調教日記をつけてます',
      content: `パートナーとの調教プレイの記録をつけています。
同じような人いますか？`
    }
  ],
  
  'amateur': [
    {
      title: '【ナンパ】成功率を上げるコツ',
      content: `ナンパで知り合った女性と関係を持つことが多いです。
成功のコツを共有します。`
    }
  ],
  
  'offline-meetup': [
    {
      title: 'オフ会からの展開',
      content: `SNSのオフ会で知り合った人と...
みんなはオフ会での出会いある？`
    }
  ],
  
  'uniform': [
    {
      title: '制服プレイの魅力',
      content: `セーラー服、ブレザー、ナース服...
制服プレイの魅力について語りましょう。`
    }
  ],
  
  'humiliation': [
    {
      title: '羞恥プレイのアイデア募集',
      content: `パートナーとの羞恥プレイのアイデアを募集してます。
みんなはどんなプレイしてる？`
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
            minus_count: Math.floor(Math.random() * 10)
          })
          .select()
          .single();
        
        if (postError) {
          console.error(`❌ スレッド作成エラー:`, postError.message);
          continue;
        }
        
        console.log(`  ✅ "${thread.title}" を作成`);
        totalCreated++;
        
        // いくつかの返信も作成
        const replyCount = Math.floor(Math.random() * 5) + 2;
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
            console.error(`❌ 返信作成エラー:`, replyError.message);
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
    'ntr': [
      '興奮しますね...',
      '実際にやった人の話聞きたい',
      '相手はどうやって見つけました？',
      'パートナーの反応は？',
      '妄想だけで終わらせるのがもったいない'
    ],
    'milf': [
      '熟女最高ですよね',
      '経験豊富な女性は違いますね',
      '若い子にはない魅力があります',
      '包容力がたまらない',
      'もっと詳しく聞きたいです'
    ],
    'default': [
      'わかる〜',
      '続きが気になります',
      'もっと詳しく！',
      '似たような経験あります',
      'すごいですね',
      'ドキドキしました',
      '羨ましい限りです',
      'えっちですね...',
      '興奮しました',
      'いいなぁ'
    ]
  };
  
  const categoryReplies = replies[categorySlug] || replies.default;
  return categoryReplies[Math.floor(Math.random() * categoryReplies.length)];
}

// スクリプト実行
seedFetishThreads();