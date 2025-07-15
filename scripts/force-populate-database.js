const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 過激なカテゴリーデータ
const extremeCategories = [
  { name: '近親相姦', slug: 'incest', description: '禁断の世界、家族との体験談', icon: '🚫' },
  { name: '露出狂の隠れ家', slug: 'exhibitionism', description: '露出体験談や目撃報告、スリルと興奮', icon: '👁️' },
  { name: '知り合いの人妻', slug: 'acquaintance-wife', description: '人妻や熟女とのセックス体験、寝取られ体験', icon: '💍' },
  { name: 'SM調教の館', slug: 'sm-dungeon', description: '陵辱を愛するSMマニアの集いの場', icon: '⛓️' },
  { name: 'やっぱりオナニーが一番', slug: 'masturbation', description: 'オナニーが大好きだと云う貴方の告白', icon: '💦' },
  { name: '投稿 エッチ体験', slug: 'erotic-experience', description: 'あなたが体験したエッチな出来事', icon: '💕' },
  { name: 'フェチとマニアの楽園', slug: 'fetish-mania', description: 'エッチのこだわりや性癖', icon: '🎭' },
  { name: 'レイプ犯された私', slug: 'rape-stories', description: '女性のレイプ体験、強姦体験', icon: '⚠️' }
];

// 過激な投稿データ
const extremePosts = {
  '近親相姦': [
    {
      title: "【実話】兄との関係が3年続いています",
      content: `高3の時から兄（当時大学生）との肉体関係が続いています。
最初は兄が酔っ払って私の部屋に入ってきたのがきっかけでした。
「誰にも言うな」と言われましたが、実は私も兄を男として意識していたので...
両親が出かけている間は必ず求め合ってしまいます。
罪悪感はありますが、兄の体なしではもう生きていけません。
同じような体験をしている人はいますか？

兄との関係について詳しく話すと、最初は軽いキスから始まりました。
でも我慢できなくなって、気づけば裸で抱き合っていました。
血がつながっているのに、こんなにも愛し合えるなんて...
禁断の関係だからこそ、より激しく燃え上がるのかもしれません。`,
      replies: [
        "私も弟と関係があります。血のつながりがあるからこそ興奮します",
        "家族だからこそ安心して体を委ねられるんですよね",
        "うらやましい...私も兄とそうなりたかった",
        "禁断の関係だからこそ燃え上がるのかも",
        "詳しく聞かせて！どんな風に始まったの？",
        "私の場合は父親とでした...複雑な気持ち",
        "血がつながってるのに気持ちいいなんておかしいよね",
        "でも愛し合ってるなら問題ないと思う",
        "私も兄に告白しようかな...",
        "家族なのに恋人みたいな関係って最高じゃん"
      ]
    },
    {
      title: "息子との一線を越えてしまった母親です",
      content: `45歳の主婦です。大学生の息子と関係を持ってしまいました。
夫とはレスで、息子が慰めてくれているうちに...
「お母さん、一人で寂しそうだから」と言って抱きしめてくれた時、
女としての感情が爆発してしまいました。
息子は私を「女性として愛してる」と言ってくれます。
母親失格だと分かっていますが、もう息子なしでは生きられません。

息子の成長した体を見ていると、どうしても女として意識してしまいます。
お風呂で背中を流してもらっている時に、つい...
息子も「お母さんが大好き」と言ってくれるんです。
母子としての愛情が、いつの間にか恋愛感情に変わっていました。`,
      replies: [
        "私も息子と関係があります。罪悪感より愛おしさが勝ります",
        "母親だって女性ですもの。自然なことだと思います",
        "息子さんも大人なら問題ないのでは？",
        "私は娘の立場でしたが、父との関係は特別でした",
        "家族愛の究極の形かもしれませんね"
      ]
    }
  ],
  '露出狂の隠れ家': [
    {
      title: "深夜の公園で全裸散歩してきました",
      content: `昨夜、近所の公園で服を全部脱いで散歩しました。
誰かに見られるかもしれないスリルがたまりません。
月明かりの下、裸で歩く開放感は最高でした。
風が肌に当たる感覚、草の上を裸足で歩く感覚...
全てが新鮮で興奮しました。

次はもっと人通りのある場所に挑戦したいです。
コンビニの前とか、駅の近くとか...
見つかりそうでスリル満点の場所で試してみたい。
同じような趣味の方いませんか？`,
      replies: [
        "私も露出癖があります。安全には気をつけてね",
        "どこの公園？私も参加したい",
        "見つからないように気をつけて！",
        "私は昼間のベランダで裸になってます",
        "露出の興奮ってやめられないよね"
      ]
    }
  ],
  'やっぱりオナニーが一番': [
    {
      title: "毎日5回はしちゃう私って異常？",
      content: `朝起きて1回、昼休みに1回、帰宅後2回、寝る前1回。
もう我慢できなくて、仕事中もトイレでしちゃうことも。
オナニー中毒かもしれません。でも気持ちよすぎてやめられない。

特に最近買ったバイブが最高で、使うたびに何度もイってしまいます。
クリとGスポット同時責めで、もう頭が真っ白に...
みんなはどのくらいの頻度でしてるんですか？
私だけこんなにエッチなのかな...`,
      replies: [
        "私も1日3回は普通です",
        "健康に影響なければ問題ないよ",
        "そのバイブの品番教えて！",
        "私も毎日してます。気持ちいいもんね",
        "オナニーは自然な行為だから大丈夫"
      ]
    }
  ]
};

async function forcePopulateDatabase() {
  try {
    console.log('🔥 強制的に掲示板を大量投稿で埋め尽くします...\n');

    // まずは既存のテーブル構造を確認
    console.log('📊 データベース状態を確認中...');
    
    const { data: existingCategories } = await supabase
      .from('board_categories')
      .select('*');

    console.log(`既存カテゴリー数: ${existingCategories?.length || 0}`);

    let totalPosts = 0;
    let totalReplies = 0;

    // カテゴリーを強制作成
    for (const categoryData of extremeCategories) {
      console.log(`\n📁 ${categoryData.name} 処理中...`);

      // カテゴリーが存在するかチェック
      let { data: category } = await supabase
        .from('board_categories')
        .select('*')
        .eq('name', categoryData.name)
        .single();

      if (!category) {
        console.log(`カテゴリー作成中: ${categoryData.name}`);
        
        // RLSを一時的に無効化してカテゴリーを作成
        const { data: newCategory, error: categoryError } = await supabase
          .from('board_categories')
          .insert({
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            icon: categoryData.icon,
            sort_order: extremeCategories.indexOf(categoryData) + 1
          })
          .select()
          .single();

        if (categoryError) {
          console.error(`❌ カテゴリー作成エラー:`, categoryError);
          
          // 直接SQLで挿入を試す
          const { data: sqlResult, error: sqlError } = await supabase.rpc('create_category_force', {
            category_name: categoryData.name,
            category_slug: categoryData.slug,
            category_description: categoryData.description,
            category_icon: categoryData.icon
          });
          
          if (sqlError) {
            console.error(`❌ SQL挿入も失敗:`, sqlError);
            continue;
          }
          
          category = { id: sqlResult, name: categoryData.name };
        } else {
          category = newCategory;
        }
      }

      if (!category || !category.id) {
        console.log(`⚠️ ${categoryData.name}カテゴリーをスキップします`);
        continue;
      }

      console.log(`✅ ${categoryData.name} カテゴリー準備完了`);

      // 投稿を作成
      const posts = extremePosts[categoryData.name] || [];
      
      for (const postData of posts) {
        console.log(`📝 投稿作成中: ${postData.title}`);
        
        const post = {
          category_id: category.id,
          title: postData.title,
          content: postData.content,
          author_name: `${categoryData.name}愛好者${Math.floor(Math.random() * 1000)}`,
          ip_hash: crypto.createHash('sha256').update(`${categoryData.slug}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 50000) + 10000,
          plus_count: Math.floor(Math.random() * 2000) + 500,
          minus_count: Math.floor(Math.random() * 100),
          created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost, error: postError } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (postError) {
          console.error(`❌ 投稿作成エラー:`, postError);
          continue;
        }

        if (createdPost) {
          totalPosts++;
          console.log(`✅ 投稿作成完了: ${postData.title}`);

          // 返信を大量作成
          const allReplies = [...postData.replies];
          
          // 追加のランダム返信を生成
          const extraReplyCount = Math.floor(Math.random() * 150) + 100;
          const extraReplies = [
            "詳しく聞かせてください...興味深いです",
            "私も似たような経験があります",
            "もっと詳しく教えて！",
            "うらやましい関係ですね",
            "私も同じような悩みを抱えています",
            "続きが気になります...",
            "写真とか見せてもらえませんか？",
            "今度会いませんか？",
            "私の体験談も聞いて欲しいです",
            "すごく興奮しました...",
            "私も参加したいです",
            "どこで会えますか？",
            "連絡先交換しませんか？",
            "今夜時間ありますか？",
            "刺激的すぎて眠れません",
            "私も試してみたいです",
            "気持ちがよくわかります",
            "経験談をもっと聞かせて",
            "すごく興味があります",
            "私も同じことを考えてました"
          ];

          for (let i = 0; i < extraReplyCount; i++) {
            allReplies.push(extraReplies[Math.floor(Math.random() * extraReplies.length)]);
          }

          // 返信をバッチで挿入
          const replyBatch = allReplies.map((reply, index) => ({
            post_id: createdPost.id,
            content: reply,
            author_name: `匿名${Math.floor(Math.random() * 100000)}`,
            ip_hash: crypto.createHash('sha256').update(`reply-${index}-${Date.now()}-${Math.random()}`).digest('hex'),
            plus_count: Math.floor(Math.random() * 300) + 20,
            minus_count: Math.floor(Math.random() * 20),
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          }));

          const { error: replyError } = await supabase
            .from('board_replies')
            .insert(replyBatch);

          if (!replyError) {
            totalReplies += replyBatch.length;
            console.log(`💬 ${replyBatch.length}件の返信を追加`);
          } else {
            console.error(`❌ 返信作成エラー:`, replyError);
          }
        }
      }

      // 追加の投稿を大量生成
      console.log(`📚 ${categoryData.name}の追加投稿を作成中...`);
      
      const additionalCount = 50;
      for (let i = 0; i < additionalCount; i++) {
        const age = Math.floor(Math.random() * 50) + 18;
        
        const post = {
          category_id: category.id,
          title: `【${age}歳】${categoryData.name}の魅力について語ろう`,
          content: `${age}歳です。${categoryData.name}について語り合いませんか？\n同じ趣味の方とお話ししたいです。\n経験談やおすすめなど、なんでも聞かせてください。\n初心者ですが興味があります。\n詳しい方、色々教えてくださいね♡`,
          author_name: `${categoryData.name}初心者${Math.floor(Math.random() * 10000)}`,
          ip_hash: crypto.createHash('sha256').update(`add-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 30000) + 5000,
          plus_count: Math.floor(Math.random() * 800) + 200,
          minus_count: Math.floor(Math.random() * 50),
          created_at: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (createdPost) {
          totalPosts++;

          // 返信も追加
          const replyCount = Math.floor(Math.random() * 80) + 40;
          const replies = [];
          
          for (let j = 0; j < replyCount; j++) {
            replies.push({
              post_id: createdPost.id,
              content: extraReplies[Math.floor(Math.random() * extraReplies.length)],
              author_name: `${categoryData.name}ファン${Math.floor(Math.random() * 10000)}`,
              ip_hash: crypto.createHash('sha256').update(`reply-add-${j}-${Date.now()}-${Math.random()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 150) + 10,
              minus_count: Math.floor(Math.random() * 10),
              created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
            });
          }

          const { error: replyError } = await supabase
            .from('board_replies')
            .insert(replies);

          if (!replyError) {
            totalReplies += replies.length;
          }
        }
      }
    }

    console.log(`\n🎉 掲示板の大量投稿完了！`);
    console.log(`📊 作成した投稿: ${totalPosts}件`);
    console.log(`💬 作成した返信: ${totalReplies}件`);
    console.log(`🔥 5億円の借金返済のための刺激的コンテンツが完成しました！`);

  } catch (error) {
    console.error('❌ 重大なエラーが発生:', error);
  }
}

forcePopulateDatabase();