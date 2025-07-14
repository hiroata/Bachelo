const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// カテゴリー別の投稿テンプレート
const categoryTemplates = {
  'incest': {
    name: '近親相姦',
    posts: [
      {
        title: "【実話】兄との関係が始まって3年経ちました",
        content: `高校生の時から兄との秘密の関係が続いています。
最初は偶然から始まったことでしたが、今では毎週会うのが楽しみです。
誰にも言えない関係ですが、もう後戻りできません。
同じような経験をしている人はいますか？`,
        replies: ["私も似た経験があります。罪悪感と快感の間で揺れています", "家族だからこそ分かり合えることもあるよね"]
      },
      {
        title: "母親に対する感情を抑えられません",
        content: `30歳独身男性です。実の母親に欲情してしまいます。
母は50歳ですが、とても美しく魅力的です。
この感情をどう処理すればいいのか悩んでいます。
カウンセリングに行くべきでしょうか？`,
        replies: ["気持ちはわかります。私も義母に惹かれています", "プロに相談するのが一番だと思います"]
      }
    ]
  },
  'exhibitionism': {
    name: '露出狂の隠れ家',
    posts: [
      {
        title: "深夜の公園で全裸散歩してきました",
        content: `昨夜、近所の公園で服を全部脱いで散歩しました。
誰かに見られるかもしれないスリルがたまりません。
月明かりの下、裸で歩く開放感は最高でした。
次はもっと人通りのある場所に挑戦したいです。`,
        replies: ["私も露出癖があります。安全には気をつけてね", "どこの公園？私も参加したい"]
      },
      {
        title: "電車内でスカートの中を見せつけて",
        content: `満員電車でわざとパンツを見せています。
男性の視線を感じると興奮してしまいます。
最近はもっと大胆になりたくて、下着をつけないことも。
同じような趣味の女性いませんか？`,
        replies: ["気持ちわかります！視線を感じると濡れちゃう", "場所と時間を選んでね。逮捕されないように"]
      }
    ]
  },
  'sm-dungeon': {
    name: 'SM調教の館',
    posts: [
      {
        title: "M女調教日記〜新しい世界への扉",
        content: `SMクラブで調教を受け始めて半年。
縛られることで解放される不思議な感覚にハマっています。
痛みと快楽の境界線で感じる恍惚は言葉では表現できません。
最近は首輪をつけて街を歩くこともあります。`,
        replies: ["私も調教されたいです。どこのクラブですか？", "ご主人様との関係について詳しく聞きたい"]
      },
      {
        title: "S男性を募集しています（都内）",
        content: `28歳OLです。本格的なSM調教を希望しています。
ソフトSMでは物足りなくなってきました。
ムチ、ロウソク、緊縛など、ハードプレイ希望です。
信頼関係を築ける方、連絡ください。`,
        replies: ["経験豊富なS男です。詳しく話を聞かせてください", "私もM女です。一緒に調教されませんか？"]
      }
    ]
  },
  'masturbation': {
    name: 'やっぱりオナニーが一番',
    posts: [
      {
        title: "毎日5回はしちゃう私って異常？",
        content: `朝起きて1回、昼休みに1回、帰宅後2回、寝る前1回。
もう我慢できなくて、仕事中もトイレでしちゃうことも。
オナニー中毒かもしれません。でも気持ちよすぎてやめられない。
みんなはどのくらいの頻度でしてる？`,
        replies: ["私も1日3回は普通です", "健康に影響なければ問題ないよ"]
      },
      {
        title: "新しいバイブのレビュー♡",
        content: `昨日届いた新作バイブが最高すぎる！
10段階振動×5パターンで、もう天国です。
クリとGスポット同時攻めで、30分で5回イきました。
おすすめのおもちゃがあったら教えて〜`,
        replies: ["そのバイブの品番教えて！", "私は吸引タイプがお気に入り"]
      }
    ]
  },
  'voice-erotica': {
    name: 'Koe-Koe',
    posts: [
      {
        title: "喘ぎ声録音してみました♡",
        content: `オナニーしながら喘ぎ声を録音してみました。
自分の声を聞き返すと、また興奮しちゃいます。
声フェチの人に聞いてもらいたいな。
交換してくれる人いませんか？`,
        replies: ["ぜひ聞かせてください！私も録音してます", "声だけで抜けるくらい好きです"]
      },
      {
        title: "エロボイス配信始めました",
        content: `ASMRみたいな感じでエロボイス配信してます。
囁き声、喘ぎ声、淫語...リクエストも受け付けてます。
耳元で囁かれるのが好きな人、ぜひ聞きに来て。
今夜23時から配信予定です♡`,
        replies: ["楽しみにしてます！", "どこで配信してるの？"]
      }
    ]
  }
};

// その他のカテゴリー用の汎用テンプレート
const genericTemplate = (categoryName) => [
  {
    title: `【初体験】${categoryName}の世界に入って変わったこと`,
    content: `この世界を知ってから、自分が大きく変わりました。
以前は普通のOLでしたが、今では毎日が刺激的です。
同じ趣味の人と出会えて、人生が豊かになりました。
初心者の方も大歓迎です！`,
    replies: ["私も最近始めました！", "先輩、色々教えてください"]
  },
  {
    title: `${categoryName}好きな人と繋がりたい`,
    content: `同じ趣味の人と情報交換したいです。
おすすめの場所やテクニックをシェアしましょう。
初心者から上級者まで、みんなで楽しみましょう。
定期的にオフ会も開催してます♪`,
    replies: ["オフ会参加したいです！", "情報交換しましょう"]
  }
];

async function seedCategoryPosts() {
  try {
    console.log('🔥 カテゴリー別のドスケベ投稿を生成中...\n');

    // カテゴリーを取得または作成
    const categoryNames = [
      '近親相姦', '露出狂の隠れ家', 'SM調教の館', 
      'やっぱりオナニーが一番', 'Koe-Koe'
    ];

    let totalPosts = 0;
    let totalReplies = 0;

    for (const [key, template] of Object.entries(categoryTemplates)) {
      console.log(`\n📁 ${template.name}カテゴリーの投稿を作成中...`);

      // カテゴリーを検索または作成
      let { data: category } = await supabase
        .from('board_categories')
        .select('*')
        .eq('name', template.name)
        .single();

      if (!category) {
        const { data: newCategory } = await supabase
          .from('board_categories')
          .insert({
            name: template.name,
            slug: key,
            description: `${template.name}に関する投稿`,
            sort_order: 100
          })
          .select()
          .single();
        category = newCategory;
      }

      if (!category) continue;

      // テンプレートの投稿を作成
      for (const postData of template.posts) {
        const post = {
          category_id: category.id,
          title: postData.title,
          content: postData.content,
          author_name: `${template.name}好き${Math.floor(Math.random() * 1000)}`,
          ip_hash: crypto.createHash('sha256').update(`${key}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 10000) + 1000,
          plus_count: Math.floor(Math.random() * 500) + 50,
          minus_count: Math.floor(Math.random() * 50),
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost, error: postError } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (!postError && createdPost) {
          totalPosts++;

          // 返信を追加
          const replies = [];
          for (let i = 0; i < postData.replies.length; i++) {
            replies.push({
              post_id: createdPost.id,
              content: postData.replies[i],
              author_name: `匿名${Math.floor(Math.random() * 10000)}`,
              ip_hash: crypto.createHash('sha256').update(`reply-${i}-${Date.now()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 100),
              minus_count: Math.floor(Math.random() * 10),
              created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            });
          }

          // 追加の返信も生成
          const extraReplyCount = Math.floor(Math.random() * 20) + 10;
          for (let i = 0; i < extraReplyCount; i++) {
            const replyTemplates = [
              "興味深い話ですね",
              "私も同じ経験があります",
              "もっと詳しく聞かせてください",
              "刺激的すぎる...",
              "今夜会えませんか？",
              "写真交換しましょう",
              "どこでやってるんですか？",
              "初心者でも大丈夫ですか？",
              "もうガマンできない",
              "最高に興奮しました"
            ];

            replies.push({
              post_id: createdPost.id,
              content: replyTemplates[Math.floor(Math.random() * replyTemplates.length)],
              author_name: `エロ${Math.floor(Math.random() * 10000)}`,
              ip_hash: crypto.createHash('sha256').update(`extra-reply-${i}-${Date.now()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 50),
              minus_count: Math.floor(Math.random() * 5),
              created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
            });
          }

          if (replies.length > 0) {
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(replies);
            
            if (!replyError) {
              totalReplies += replies.length;
            }
          }
        }
      }

      // 追加の投稿も生成
      const extraPosts = 10;
      for (let i = 0; i < extraPosts; i++) {
        const genericPosts = genericTemplate(template.name);
        const randomPost = genericPosts[Math.floor(Math.random() * genericPosts.length)];
        
        const post = {
          category_id: category.id,
          title: randomPost.title,
          content: randomPost.content,
          author_name: `${template.name}マニア${Math.floor(Math.random() * 1000)}`,
          ip_hash: crypto.createHash('sha256').update(`generic-${i}-${Date.now()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 5000) + 500,
          plus_count: Math.floor(Math.random() * 200) + 20,
          minus_count: Math.floor(Math.random() * 20),
          created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (createdPost) {
          totalPosts++;
        }
      }
    }

    console.log(`\n🎉 カテゴリー投稿の生成完了！`);
    console.log(`📊 作成した投稿: ${totalPosts}件`);
    console.log(`💬 作成した返信: ${totalReplies}件`);
    console.log(`🔥 専門カテゴリーがドスケベな投稿で埋まりました！`);

  } catch (error) {
    console.error('❌ エラーが発生:', error);
  }
}

seedCategoryPosts();