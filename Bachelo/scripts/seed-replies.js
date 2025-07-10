const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません。.env.localファイルを確認してください。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// サンプル返信データ
const sampleReplies = [
  // 最初の投稿への返信
  {
    postTitle: '【雑談】BACHELOの掲示板について語ろう',
    replies: [
      {
        author_name: 'エロゲ好き',
        content: `>>1
乙です！
掲示板ができて嬉しいです。
これから盛り上げていきましょう！`,
      },
      {
        author_name: '初心者',
        content: `音声投稿サイトなのに掲示板もあるんですね。
交流の場があるのはありがたいです。

みなさんよろしくお願いします〜`,
      },
      {
        author_name: '古参ユーザー',
        content: `ついに掲示板実装きたー！
前から要望出してたから嬉しい

管理人さんお疲れ様です`,
      },
    ],
  },
  // 2つ目の投稿への返信
  {
    postTitle: '初めて来ました！よろしくお願いします',
    replies: [
      {
        author_name: 'ベテラン',
        content: `>>1
ようこそ！
音声投稿は最初は緊張するけど、慣れると楽しいよ

まずは他の人の投稿聞いてみるといいかも`,
      },
      {
        author_name: 'サポーター',
        content: `いらっしゃい〜
分からないことがあったら気軽に聞いてね

優しい人が多いから大丈夫だよ`,
      },
      {
        author_name: '同じく新人',
        content: `私も最近始めたばかりです！
一緒に頑張りましょう〜

お互い初心者同士、情報交換しましょ`,
      },
    ],
  },
  // 3つ目の投稿への返信
  {
    postTitle: '音声投稿のコツを教えてください',
    replies: [
      {
        author_name: 'マイク詳しい人',
        content: `マイクはピンキリだけど、最初は安いので十分だよ
個人的にはAudio-TechnicaのAT2020USBがコスパ良くておすすめ

スマホなら外部マイク使うだけでも全然違う`,
      },
      {
        author_name: '録音マニア',
        content: `録音アプリはAudacityがフリーで高機能！
ノイズ除去とか編集も簡単にできるよ

あと部屋は静かな場所で、布団とかで音を吸収させると良い`,
      },
      {
        author_name: 'プロ投稿者',
        content: `機材も大事だけど、一番は声の出し方かな
リラックスして、聞いてる人に話しかけるイメージで

最初は台本作って練習するのもアリ`,
      },
    ],
  },
  // レビュー投稿への返信
  {
    postTitle: '【レビュー】Blue Yeti マイク買ってみた',
    replies: [
      {
        author_name: '購入検討中',
        content: `詳しいレビューありがとう！
ちょうどBlue Yeti気になってたんだ

2万は高いけど、音質良いなら投資する価値ありそう`,
      },
      {
        author_name: 'Yeti使い',
        content: `自分も使ってる！
確かに重いけど、その分安定感あるよね

USBで簡単なのが一番のメリットだと思う`,
      },
      {
        author_name: '別マイク推し',
        content: `Blue Yetiもいいけど、
RODE NT-USBも同じ価格帯でおすすめだよ

比較動画とかYouTubeにあるから見てみて`,
      },
    ],
  },
  // ニュース投稿への返信
  {
    postTitle: '【速報】新機能「ライブ配信」が追加されるらしい',
    replies: [
      {
        author_name: 'わくわく',
        content: `マジか！！！
ライブ配信きたらもっと盛り上がるね

リアルタイムで反応もらえるの楽しみ`,
      },
      {
        author_name: '心配性',
        content: `ライブは緊張するなぁ...
録音と違って編集できないし

でも挑戦してみたい気持ちもある`,
      },
      {
        author_name: '期待大',
        content: `投げ銭機能とかもつくのかな？
収益化できるようになったら嬉しい

プロの声優さんとか参入してきそう`,
      },
    ],
  },
];

async function seedReplies() {
  try {
    console.log('投稿を検索中...');
    
    for (const postData of sampleReplies) {
      // タイトルで投稿を検索
      const { data: posts, error: searchError } = await supabase
        .from('board_posts')
        .select('id')
        .eq('title', postData.postTitle)
        .limit(1);
      
      if (searchError || !posts || posts.length === 0) {
        console.log(`✗ 投稿が見つかりません: ${postData.postTitle}`);
        continue;
      }
      
      const postId = posts[0].id;
      console.log(`\n投稿「${postData.postTitle}」に返信を追加中...`);
      
      // 返信を追加
      for (const reply of postData.replies) {
        const replyData = {
          post_id: postId,
          author_name: reply.author_name,
          author_email: '',
          content: reply.content,
          ip_address: '127.0.0.1',
          user_agent: 'SeedScript/1.0',
        };
        
        const { error } = await supabase
          .from('board_replies')
          .insert(replyData);
        
        if (error) {
          console.error(`✗ 返信作成エラー (${reply.author_name}):`, error.message);
        } else {
          console.log(`✓ 返信追加: ${reply.author_name}`);
        }
      }
      
      // 返信数を更新
      const { data: replyCount } = await supabase
        .from('board_replies')
        .select('id', { count: 'exact' })
        .eq('post_id', postId);
      
      if (replyCount) {
        await supabase
          .from('board_posts')
          .update({ replies_count: replyCount.length })
          .eq('id', postId);
      }
    }
    
    console.log('\n✅ 返信の追加が完了しました！');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
seedReplies();