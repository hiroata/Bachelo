/**
 * 既存カテゴリーに追加のスレッドを作成
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const getRandomAuthor = () => {
  const names = [
    '名無しさん', '通りすがり', 'エロ好き', '初心者', '経験者',
    'ヤリチン', 'ヤリマン', '処女', '童貞', 'セフレ募集中',
    '人妻', 'JD', 'OL', 'フリーター', '主婦',
    'イケメン', 'ブサメン', 'デブ専', '巨根', '早漏'
  ];
  return names[Math.floor(Math.random() * names.length)];
};

const generalThreads = {
  'general': [
    {
      title: '今日ヤった人いる？',
      content: '今日エッチした人いる？\n報告待ってるｗ'
    },
    {
      title: '【雑談】みんなの性癖教えて',
      content: 'みんなの変な性癖教えてくれ\n俺は匂いフェチ'
    },
    {
      title: '童貞卒業したいんだが',
      content: '25歳童貞です。\nどうやったら卒業できますか？'
    },
    {
      title: 'セフレの作り方',
      content: 'セフレってどうやって作るの？\n経験者教えて'
    },
    {
      title: '一番エロかった体験談書いてけ',
      content: 'タイトル通り\n俺から書くわ'
    }
  ],
  
  'questions': [
    {
      title: '女の子に聞きたい！男のどこに興奮する？',
      content: '女性の意見が聞きたいです\n男のどんなところにエロさを感じますか？'
    },
    {
      title: '初体験の平均年齢って？',
      content: 'みんな何歳で初体験した？\n俺まだなんだけど遅い？'
    },
    {
      title: 'オナニーの頻度どれくらい？',
      content: '男女問わず聞きたい\nみんなどれくらいの頻度でしてる？'
    }
  ],
  
  'love': [
    {
      title: '彼女とマンネリ化してきた',
      content: '付き合って1年の彼女がいるけど\n最近マンネリ化してきた...\nどうすればいい？'
    },
    {
      title: '好きな人が風俗で働いてた',
      content: '好きな女の子が風俗で働いてることが判明\nどうすればいい？'
    }
  ],
  
  'confession': [
    {
      title: '【告白】上司と不倫してる',
      content: '既婚者だけど会社の上司と関係持ってる\n誰にも言えないからここで吐き出させて'
    },
    {
      title: '親友の彼女とヤってしまった',
      content: 'タイトル通り最低なことをしてしまった\n罪悪感がヤバい'
    },
    {
      title: '援交してた過去',
      content: '学生時代に援交してました\n今は普通に結婚してるけど旦那には言えない'
    }
  ],
  
  'married': [
    {
      title: '【既婚者】レスで辛い',
      content: '結婚5年目だけど1年以上レス\n性欲の処理どうしてる？'
    },
    {
      title: '妻が淡白すぎる',
      content: '妻とのエッチがつまらない\n淡白すぎて物足りない'
    }
  ],
  
  'single': [
    {
      title: '【独身】セフレ何人いる？',
      content: '独身のみんなセフレ何人いる？\n俺は3人'
    },
    {
      title: 'マッチングアプリでヤれる？',
      content: 'マッチングアプリ始めようと思うんだけど\n実際ヤれるの？'
    }
  ],
  
  'beauty': [
    {
      title: '【美容】アンダーヘアの処理どうしてる？',
      content: '女性に聞きたい\nアンダーヘアの処理どうしてる？'
    }
  ],
  
  'health': [
    {
      title: '【健康】性病検査行ったことある？',
      content: 'みんな性病検査行ってる？\nどれくらいの頻度で行くべき？'
    }
  ]
};

async function seedMoreThreads() {
  console.log('📝 追加スレッドのシード開始...');
  
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
    for (const [slug, threads] of Object.entries(generalThreads)) {
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
            author_email: `anon${Math.floor(Math.random() * 10000)}@example.com`,
            view_count: Math.floor(Math.random() * 5000) + 100,
            plus_count: Math.floor(Math.random() * 100) + 10,
            minus_count: Math.floor(Math.random() * 20)
          })
          .select()
          .single();
        
        if (postError) {
          console.error(`❌ スレッド作成エラー:`, postError.message);
          continue;
        }
        
        console.log(`  ✅ "${thread.title}" を作成`);
        totalCreated++;
        
        // 返信を追加
        const replyCount = Math.floor(Math.random() * 10) + 5;
        for (let i = 0; i < replyCount; i++) {
          const replies = [
            'それな',
            'わかる',
            '俺も俺も',
            'エロいな',
            'kwsk',
            '詳しく',
            'うｐ',
            'いいね',
            'もっと聞かせて',
            'それでそれで？',
            '続きはよ',
            'マジかよ',
            'やべぇな',
            'うらやま',
            '画像ある？',
            'どこ住み？',
            'Line交換しよ',
            '嘘乙',
            'ガチなら証拠見せて',
            'エッッッ'
          ];
          
          const { error: replyError } = await supabase
            .from('board_replies')
            .insert({
              post_id: post.id,
              author_name: getRandomAuthor(),
              content: replies[Math.floor(Math.random() * replies.length)],
              plus_count: Math.floor(Math.random() * 30),
              minus_count: Math.floor(Math.random() * 10)
            });
          
          if (replyError) {
            console.error(`❌ 返信作成エラー:`, replyError.message);
          }
        }
      }
    }
    
    console.log(`\n🎉 合計 ${totalCreated} 個の追加スレッドを作成しました！`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// スクリプト実行
seedMoreThreads();