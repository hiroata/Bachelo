const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 全カテゴリーとその投稿
const categoriesAndPosts = {
  '近親相姦': {
    slug: 'incest',
    description: '禁断の世界、家族との体験談',
    posts: [
      {
        title: "【実話】兄との関係が3年続いています",
        content: `高3の時から兄（当時大学生）との肉体関係が続いています。最初は兄が酔っ払って私の部屋に入ってきたのがきっかけでした。「誰にも言うな」と言われましたが、実は私も兄を男として意識していたので...両親が出かけている間は必ず求め合ってしまいます。罪悪感はありますが、兄の体なしではもう生きていけません。同じような体験をしている人はいますか？`
      },
      {
        title: "息子との一線を越えてしまった母親です",
        content: `45歳の主婦です。大学生の息子と関係を持ってしまいました。夫とはレスで、息子が慰めてくれているうちに...「お母さん、一人で寂しそうだから」と言って抱きしめてくれた時、女としての感情が爆発してしまいました。息子は私を「女性として愛してる」と言ってくれます。母親失格だと分かっていますが、もう息子なしでは生きられません。`
      },
      {
        title: "妹と毎晩求め合ってしまいます",
        content: `大学生の兄です。高校生の妹と肉体関係があります。妹の方から誘ってきたのが始まりでした。「お兄ちゃんが好き」と言われて、我慢できませんでした。今では両親が寝た後、毎晩妹の部屋で愛し合っています。妹は「お兄ちゃんの子供が欲しい」と言いますが...どうしたらいいか分からなくなっています。`
      }
    ]
  },
  '露出狂の隠れ家': {
    slug: 'exhibitionism',
    description: '露出体験談や目撃報告、スリルと興奮',
    posts: [
      {
        title: "深夜の公園で全裸散歩してきました",
        content: `昨夜、近所の公園で服を全部脱いで散歩しました。誰かに見られるかもしれないスリルがたまりません。月明かりの下、裸で歩く開放感は最高でした。次はもっと人通りのある場所に挑戦したいです。同じような趣味の方いませんか？`
      },
      {
        title: "電車内でスカートの中を見せつけて",
        content: `満員電車でわざとパンツを見せています。男性の視線を感じると興奮してしまいます。最近はもっと大胆になりたくて、下着をつけないことも。同じような趣味の女性いませんか？視線を感じながらの通勤が楽しみで仕方ありません。`
      }
    ]
  },
  '知り合いの人妻': {
    slug: 'acquaintance-wife',
    description: '人妻や熟女とのセックス体験、寝取られ体験',
    posts: [
      {
        title: "隣の奥さんと不倫関係になりました",
        content: `隣に住む美人奥さん（35歳）と関係を持ってしまいました。旦那さんが出張中にゴミ出しで会った時から始まって...最初は軽い世間話だったのに、気づけば彼女の家で密会するように。「旦那とはレスで...」と寂しそうに話す彼女を放っておけませんでした。`
      },
      {
        title: "ママ友との秘密の関係",
        content: `同じ幼稚園のママ友と不倫しています。お互い既婚者ですが、子供を預けている間の時間を使って...最初はお茶をするだけでしたが、だんだん深い関係に。女同士だからこそ分かり合える部分があって、今では離れられません。`
      }
    ]
  },
  'SM調教の館': {
    slug: 'sm-dungeon',
    description: '陵辱を愛するSMマニアの集いの場',
    posts: [
      {
        title: "M女調教日記〜新しい世界への扉",
        content: `SMクラブで調教を受け始めて半年。縛られることで解放される不思議な感覚にハマっています。痛みと快楽の境界線で感じる恍惚は言葉では表現できません。最近は首輪をつけて街を歩くこともあります。ご主人様との関係が人生で一番充実しています。`
      },
      {
        title: "S男性を募集しています（都内）",
        content: `28歳OLです。本格的なSM調教を希望しています。ソフトSMでは物足りなくなってきました。ムチ、ロウソク、緊縄など、ハードプレイ希望です。信頼関係を築ける方、連絡ください。平日夜か週末に調教をお願いしたいです。`
      }
    ]
  },
  'やっぱりオナニーが一番': {
    slug: 'masturbation',
    description: 'オナニーが大好きだと云う貴方の舌白',
    posts: [
      {
        title: "毎日5回はしちゃう私って異常？",
        content: `朝起きて1回、昼休みに1回、帰宅後2回、寝る前1回。もう我慢できなくて、仕事中もトイレでしちゃうことも。オナニー中毒かもしれません。でも気持ちよすぎてやめられない。みんなはどのくらいの頻度でしてるんですか？私だけこんなにエッチなのかな...`
      },
      {
        title: "新しいバイブのレビュー♡",
        content: `昨日届いた新作バイブが最高すぎる！10段階振動×5パターンで、もう天国です。クリとGスポット同時攻めで、30分で5回イきました。今まで使ったおもちゃの中で一番気持ちいい♡ おすすめのおもちゃがあったら教えて〜`
      }
    ]
  }
};

// 返信テンプレート
const replies = [
  "私も同じような経験があります！",
  "詳しく聞かせてください...",
  "すごく興味深い話ですね",
  "うらやましい関係ですね",
  "もっと詳しく教えて！",
  "私も参加したいです",
  "写真とか見せてもらえませんか？",
  "今度会いませんか？",
  "すごく興奮しました...",
  "私の場合は...",
  "気持ちがよくわかります",
  "続きが気になります",
  "私も同じような悩みが...",
  "刺激的すぎて眠れません",
  "ぜひお話したいです",
  "経験談をもっと聞かせて",
  "私も試してみたいです",
  "どこで会えますか？",
  "連絡先交換しませんか？",
  "今夜時間ありますか？"
];

async function createAllCategoriesAndPosts() {
  try {
    console.log('🔥 全カテゴリーと大量投稿を作成中...\n');

    let totalPosts = 0;
    let totalReplies = 0;
    let totalCategories = 0;

    for (const [categoryName, categoryData] of Object.entries(categoriesAndPosts)) {
      console.log(`\n📁 ${categoryName} カテゴリー作成中...`);

      // カテゴリーを作成または取得
      let { data: category } = await supabase
        .from('board_categories')
        .select('*')
        .eq('name', categoryName)
        .single();

      if (!category) {
        const { data: newCategory } = await supabase
          .from('board_categories')
          .insert({
            name: categoryName,
            slug: categoryData.slug,
            description: categoryData.description,
            sort_order: totalCategories + 1
          })
          .select()
          .single();
        category = newCategory;
        totalCategories++;
      }

      if (!category) {
        console.error(`❌ ${categoryName}カテゴリーの作成に失敗`);
        continue;
      }

      console.log(`✅ ${categoryName} カテゴリー作成完了`);

      // 投稿を作成
      for (const postData of categoryData.posts) {
        const post = {
          category_id: category.id,
          title: postData.title,
          content: postData.content,
          author_name: `${categoryName}愛好者${Math.floor(Math.random() * 1000)}`,
          ip_hash: crypto.createHash('sha256').update(`${categoryData.slug}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 25000) + 5000,
          plus_count: Math.floor(Math.random() * 1000) + 300,
          minus_count: Math.floor(Math.random() * 50),
          created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (createdPost) {
          totalPosts++;
          console.log(`📝 投稿作成: ${postData.title}`);

          // 大量の返信を追加
          const replyCount = Math.floor(Math.random() * 100) + 50;
          const postReplies = [];
          
          for (let i = 0; i < replyCount; i++) {
            postReplies.push({
              post_id: createdPost.id,
              content: replies[Math.floor(Math.random() * replies.length)],
              author_name: `匿名${Math.floor(Math.random() * 100000)}`,
              ip_hash: crypto.createHash('sha256').update(`reply-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 200) + 10,
              minus_count: Math.floor(Math.random() * 10),
              created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
          }

          if (postReplies.length > 0) {
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(postReplies);
            
            if (!replyError) {
              totalReplies += postReplies.length;
              console.log(`💬 ${postReplies.length}件の返信を追加`);
            }
          }
        }
      }

      // 追加の投稿を生成
      const additionalPosts = 20;
      for (let i = 0; i < additionalPosts; i++) {
        const post = {
          category_id: category.id,
          title: `【${Math.floor(Math.random() * 40) + 18}歳】${categoryName}について語りたい`,
          content: `${categoryName}に関する体験談や相談があります。同じような興味を持つ方とお話ししたいです。詳しいことは直接お話しできればと思います。経験者の方、初心者の方、どなたでも歓迎です。一緒に楽しい時間を過ごしませんか？`,
          author_name: `体験者${Math.floor(Math.random() * 10000)}`,
          ip_hash: crypto.createHash('sha256').update(`add-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 15000) + 2000,
          plus_count: Math.floor(Math.random() * 500) + 100,
          minus_count: Math.floor(Math.random() * 25),
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (createdPost) {
          totalPosts++;

          // 返信も追加
          const replyCount = Math.floor(Math.random() * 30) + 20;
          const postReplies = [];
          
          for (let j = 0; j < replyCount; j++) {
            postReplies.push({
              post_id: createdPost.id,
              content: replies[Math.floor(Math.random() * replies.length)],
              author_name: `${categoryName}ファン${Math.floor(Math.random() * 10000)}`,
              ip_hash: crypto.createHash('sha256').update(`reply-add-${j}-${Date.now()}-${Math.random()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 100) + 5,
              minus_count: Math.floor(Math.random() * 5),
              created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
            });
          }

          if (postReplies.length > 0) {
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(postReplies);
            
            if (!replyError) {
              totalReplies += postReplies.length;
            }
          }
        }
      }
    }

    console.log(`\n🎉 全カテゴリーと投稿の作成完了！`);
    console.log(`📁 作成したカテゴリー: ${totalCategories}件`);
    console.log(`📊 作成した投稿: ${totalPosts}件`);
    console.log(`💬 作成した返信: ${totalReplies}件`);
    console.log(`🔥 掲示板が刺激的な投稿で溢れました！`);

  } catch (error) {
    console.error('❌ エラーが発生:', error);
  }
}

createAllCategoriesAndPosts();