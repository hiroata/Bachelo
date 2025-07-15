const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 近親相姦カテゴリー専用の超過激投稿
const incestPosts = [
  {
    title: "【実話】兄との関係が3年続いています",
    content: `高3の時から兄（当時大学生）との肉体関係が続いています。
最初は兄が酔っ払って私の部屋に入ってきたのがきっかけでした。
「誰にも言うな」と言われましたが、実は私も兄を男として意識していたので...
両親が出かけている間は必ず求め合ってしまいます。
罪悪感はありますが、兄の体なしではもう生きていけません。
同じような体験をしている人はいますか？`,
    replies: [
      "私も弟と関係があります。血のつながりがあるからこそ興奋します",
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
同じような経験のある方、お話しませんか？`,
    replies: [
      "私も息子と関係があります。罪悪感より愛おしさが勝ります",
      "母親だって女性ですもの。自然なことだと思います",
      "息子さんも大人なら問題ないのでは？",
      "私は娘の立場でしたが、父との関係は特別でした",
      "家族愛の究極の形かもしれませんね",
      "詳しいことを教えてください",
      "私も息子をそういう目で見てしまうことが...",
      "血のつながりを越えた愛ですね",
      "周りには絶対言えないけど、理解できます",
      "母息子の関係って一番美しいかも"
    ]
  },
  {
    title: "妹と毎晩求め合ってしまいます",
    content: `大学生の兄です。高校生の妹と肉体関係があります。
妹の方から誘ってきたのが始まりでした。
「お兄ちゃんが好き」と言われて、我慢できませんでした。
今では両親が寝た後、毎晩妹の部屋で愛し合っています。
妹は「お兄ちゃんの子供が欲しい」と言いますが...
どうしたらいいか分からなくなっています。
血のつながった妹を愛してしまう自分が分からない。`,
    replies: [
      "妹さんも同意してるなら愛し合えばいいじゃん",
      "兄妹愛って純粋で美しいと思う",
      "私も兄のことを男として見てます",
      "血がつながってても愛に変わりはない",
      "妹さんの気持ちを大切にしてあげて",
      "うらやましい関係ですね",
      "私たち姉弟も同じような感じです",
      "家族だからこそ信頼して体を預けられる",
      "子供のことは慎重に考えて",
      "妹さんとの時間を大切にして"
    ]
  },
  {
    title: "叔父との秘密の関係に溺れています",
    content: `20歳の女子大生です。父の弟である叔父（42歳）と関係があります。
高校の時から叔父に憧れていて、成人してから告白しました。
「いけないことだけど...」と言いながらも受け入れてくれた叔父。
今では週末に叔父のマンションで過ごすのが唯一の楽しみです。
年上の男性の優しさと、血のつながりがあることの安心感。
この関係をどう思いますか？`,
    replies: [
      "叔父さんとの関係、素敵ですね",
      "年の差もあって大人の関係って感じ",
      "私も叔父に恋してました",
      "血がつながってるからこそ特別な絆",
      "お互い大人なら問題ないでしょう",
      "叔父さんも優しい人なんですね",
      "私の場合は従兄との関係でした",
      "家族だからこそ信頼できるパートナー",
      "年上の親戚男性って魅力的ですよね",
      "素敵な関係だと思います"
    ]
  },
  {
    title: "従兄弟と温泉旅行で一線を越えました",
    content: `先週、親戚の従兄弟と二人で温泉旅行に行きました。
いとこ同士で仲が良く、昔からよく一緒に遊んでいました。
温泉で裸を見合った時から空気が変わって...
夜、同じ布団で寝ることになり、気づけば求め合っていました。
「いとこだからダメだよね」と言いながらも止められませんでした。
帰ってきてからも毎日連絡を取り合っています。
いとこ同士の恋愛ってどう思いますか？`,
    replies: [
      "いとこ同士なら法的には問題ないですよ",
      "私もいとこと付き合ってました",
      "血のつながりが薄いから大丈夫じゃない？",
      "温泉での出来事、ドラマチックですね",
      "自然な流れだったんですね",
      "いとこなら結婚もできますし",
      "私も親戚の人に恋したことがあります",
      "家族に近い存在だからこそ安心できる",
      "素敵な恋愛だと思います",
      "その後どうなったか気になります"
    ]
  }
];

// 返信用のテンプレート
const hotReplies = [
  "詳しく聞かせてください...興味深いです",
  "私も似たような経験があります",
  "血のつながりがあるからこそ特別なんですよね",
  "家族愛の究極の形だと思います",
  "もっと詳しく教えて！",
  "うらやましい関係ですね",
  "私も同じような悩みを抱えています",
  "愛に血のつながりは関係ないと思う",
  "続きが気になります...",
  "お互いが愛し合ってるなら問題ないのでは？",
  "写真とか見せてもらえませんか？",
  "今度会いませんか？",
  "私の体験談も聞いて欲しいです",
  "禁断の関係だからこそ燃え上がる",
  "家族だからこそ信頼できる関係",
  "私も告白しようかな...",
  "血がつながってても愛は愛",
  "どんなプレイをしてるんですか？",
  "妊娠の心配はしてる？",
  "周りにバレないよう気をつけて"
];

async function seedMassiveIncestPosts() {
  try {
    console.log('🔥 近親相姦カテゴリーに大量投稿を作成中...\n');

    // 近親相姦カテゴリーを取得または作成
    let { data: category } = await supabase
      .from('board_categories')
      .select('*')
      .eq('name', '近親相姦')
      .single();

    if (!category) {
      const { data: newCategory } = await supabase
        .from('board_categories')
        .insert({
          name: '近親相姦',
          slug: 'incest',
          description: '禁断の世界、家族との体験談',
          sort_order: 1
        })
        .select()
        .single();
      category = newCategory;
    }

    if (!category) {
      console.error('カテゴリーを作成できませんでした');
      return;
    }

    let totalPosts = 0;
    let totalReplies = 0;

    // メイン投稿を作成
    for (const postData of incestPosts) {
      const post = {
        category_id: category.id,
        title: postData.title,
        content: postData.content,
        author_name: `禁断の愛${Math.floor(Math.random() * 1000)}`,
        ip_hash: crypto.createHash('sha256').update(`incest-${Date.now()}-${Math.random()}`).digest('hex'),
        view_count: Math.floor(Math.random() * 20000) + 5000,
        plus_count: Math.floor(Math.random() * 800) + 200,
        minus_count: Math.floor(Math.random() * 50),
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { data: createdPost, error: postError } = await supabase
        .from('board_posts')
        .insert(post)
        .select()
        .single();

      if (!postError && createdPost) {
        totalPosts++;
        console.log(`📝 投稿作成: ${postData.title}`);

        // 固定返信を追加
        const fixedReplies = postData.replies.map((reply, index) => ({
          post_id: createdPost.id,
          content: reply,
          author_name: `匿名${Math.floor(Math.random() * 10000)}`,
          ip_hash: crypto.createHash('sha256').update(`reply-${index}-${Date.now()}`).digest('hex'),
          plus_count: Math.floor(Math.random() * 200) + 20,
          minus_count: Math.floor(Math.random() * 10),
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));

        // 追加のランダム返信を生成
        const extraReplyCount = Math.floor(Math.random() * 40) + 30;
        const extraReplies = [];
        for (let i = 0; i < extraReplyCount; i++) {
          extraReplies.push({
            post_id: createdPost.id,
            content: hotReplies[Math.floor(Math.random() * hotReplies.length)],
            author_name: `近親愛好者${Math.floor(Math.random() * 10000)}`,
            ip_hash: crypto.createHash('sha256').update(`extra-reply-${i}-${Date.now()}`).digest('hex'),
            plus_count: Math.floor(Math.random() * 100) + 10,
            minus_count: Math.floor(Math.random() * 5),
            created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        const allReplies = [...fixedReplies, ...extraReplies];
        
        if (allReplies.length > 0) {
          const { error: replyError } = await supabase
            .from('board_replies')
            .insert(allReplies);
          
          if (!replyError) {
            totalReplies += allReplies.length;
            console.log(`💬 ${allReplies.length}件の返信を追加`);
          }
        }
      }
    }

    // 追加の投稿を大量生成
    const additionalTitles = [
      "【緊急】姉との関係がバレそうです",
      "父親を男として見てしまう娘です",
      "母親との入浴でムラムラしてしまいます",
      "弟の成長した体に興奮してしまいます",
      "義父との関係に溺れています",
      "従姉妹との秘密の逢瀬",
      "血のつながった家族との愛情表現",
      "兄弟姉妹での初体験について",
      "親子の愛が恋愛感情に変わった瞬間",
      "家族だからこそできるプレイ",
      "近親婚への憧れについて",
      "血族との子作りについて考える",
      "家族旅行で一線を越えた話",
      "実の親との禁断の夜",
      "兄妹で始めた秘密の関係"
    ];

    for (let i = 0; i < 50; i++) {
      const title = additionalTitles[Math.floor(Math.random() * additionalTitles.length)];
      const age = Math.floor(Math.random() * 30) + 18;
      
      const post = {
        category_id: category.id,
        title: `【${age}歳】${title}`,
        content: `${age}歳です。家族との特別な関係について相談があります。
詳しくは書けませんが、血のつながった家族との間に
普通ではない感情を抱いてしまっています。
同じような経験をお持ちの方、アドバイスをください。
一人で悩んでいて辛いです...`,
        author_name: `家族愛${Math.floor(Math.random() * 10000)}`,
        ip_hash: crypto.createHash('sha256').update(`additional-${i}-${Date.now()}`).digest('hex'),
        view_count: Math.floor(Math.random() * 15000) + 3000,
        plus_count: Math.floor(Math.random() * 400) + 100,
        minus_count: Math.floor(Math.random() * 30),
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
        const replyCount = Math.floor(Math.random() * 25) + 15;
        const replies = [];
        for (let j = 0; j < replyCount; j++) {
          replies.push({
            post_id: createdPost.id,
            content: hotReplies[Math.floor(Math.random() * hotReplies.length)],
            author_name: `体験者${Math.floor(Math.random() * 10000)}`,
            ip_hash: crypto.createHash('sha256').update(`reply-add-${j}-${Date.now()}`).digest('hex'),
            plus_count: Math.floor(Math.random() * 80) + 5,
            minus_count: Math.floor(Math.random() * 3),
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
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

    console.log(`\n🎉 近親相姦カテゴリーの大量投稿完了！`);
    console.log(`📊 作成した投稿: ${totalPosts}件`);
    console.log(`💬 作成した返信: ${totalReplies}件`);
    console.log(`🔥 禁断の投稿で掲示板が溢れました！`);

  } catch (error) {
    console.error('❌ エラーが発生:', error);
  }
}

seedMassiveIncestPosts();