const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 過激な投稿テンプレート
const extremePosts = [
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
禁断の関係だからこそ、より激しく燃え上がるのかもしれません。`
  },
  {
    title: "息子との一線を越えてしまった母親です",
    content: `45歳の主婦です。大学生の息子と関係を持ってしまいました。
夫とはレスで、息子が慰めてくれているうちに...
「お母さん、一人で寂しそうだから」と言って抱きしめてくれた時、
女としての感情が爆発してしまいました。
息子は私を「女性として愛してる」と言ってくれます。
母親失格だと分かっていますが、もう息子なしでは生きられません。`
  },
  {
    title: "深夜の公園で全裸散歩してきました",
    content: `昨夜、近所の公園で服を全部脱いで散歩しました。
誰かに見られるかもしれないスリルがたまりません。
月明かりの下、裸で歩く開放感は最高でした。
風が肌に当たる感覚、草の上を裸足で歩く感覚...
全てが新鮮で興奮しました。

次はもっと人通りのある場所に挑戦したいです。
コンビニの前とか、駅の近くとか...
見つかりそうでスリル満点の場所で試してみたい。`
  },
  {
    title: "毎日5回はしちゃう私って異常？",
    content: `朝起きて1回、昼休みに1回、帰宅後2回、寝る前1回。
もう我慢できなくて、仕事中もトイレでしちゃうことも。
オナニー中毒かもしれません。でも気持ちよすぎてやめられない。

特に最近買ったバイブが最高で、使うたびに何度もイってしまいます。
クリとGスポット同時責めで、もう頭が真っ白に...
みんなはどのくらいの頻度でしてるんですか？
私だけこんなにエッチなのかな...`
  },
  {
    title: "隣の奥さんと不倫関係になりました",
    content: `隣に住む美人奥さん（35歳）と関係を持ってしまいました。
旦那さんが出張中にゴミ出しで会った時から始まって...
最初は軽い世間話だったのに、気づけば彼女の家で密会するように。
「旦那とはレスで...」と寂しそうに話す彼女を放っておけませんでした。

彼女の家で抱き合っている時、隣にいる旦那さんのことを考えると興奮します。
バレるかもしれないスリルと、人妻を抱いている背徳感がたまりません。`
  },
  {
    title: "M女調教日記〜新しい世界への扉",
    content: `SMクラブで調教を受け始めて半年。
縛られることで解放される不思議な感覚にハマっています。
痛みと快楽の境界線で感じる恍惚は言葉では表現できません。
最近は首輪をつけて街を歩くこともあります。
ご主人様との関係が人生で一番充実しています。

ムチで叩かれる痛みが、だんだん快楽に変わっていくんです。
涙を流しながらも「もっと」と求めてしまう自分が不思議で...`
  },
  {
    title: "電車内でスカートの中を見せつけて",
    content: `満員電車でわざとパンツを見せています。
男性の視線を感じると興奮してしまいます。
最近はもっと大胆になりたくて、下着をつけないことも。
視線を感じながらの通勤が楽しみで仕方ありません。

昨日は座席に座っている時に、足を開いて向かいの男性に見せつけました。
その人の視線が私の股間に釘付けになっているのが分かって...`
  },
  {
    title: "レイプされた夜のことを思い出すと...",
    content: `3年前にレイプされました。でも不思議なことに、
その時のことを思い出すと体が熱くなってしまいます。
恐怖だったはずなのに、なぜか興奮してしまう自分が分からなくて...
同じような経験をした方はいませんか？

あの男性の荒い息づかいや、力強い手の感触を思い出すと
体が勝手に反応してしまうんです。`
  },
  {
    title: "叔父との秘密の関係に溺れています",
    content: `20歳の女子大生です。父の弟である叔父（42歳）と関係があります。
高校の時から叔父に憧れていて、成人してから告白しました。
「いけないことだけど...」と言いながらも受け入れてくれた叔父。
今では週末に叔父のマンションで過ごすのが唯一の楽しみです。

叔父の大人の余裕と優しさに包まれていると安心します。
血のつながりがあることの罪悪感と、それを越える愛情と...`
  },
  {
    title: "従兄弟と温泉旅行で一線を越えました",
    content: `先週、親戚の従兄弟と二人で温泉旅行に行きました。
いとこ同士で仲が良く、昔からよく一緒に遊んでいました。
温泉で裸を見合った時から空気が変わって...
夜、同じ布団で寝ることになり、気づけば求め合っていました。

「いとこだからダメだよね」と言いながらも止められませんでした。
帰ってきてからも毎日連絡を取り合っています。`
  }
];

// 返信テンプレート
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
  "周りにバレないよう気をつけて",
  "私も露出癖があります",
  "見つからないように気をつけて！",
  "私は昼間のベランダで裸になってます",
  "露出の興奮ってやめられないよね",
  "どこの公園？私も参加したい",
  "私も1日3回は普通です",
  "健康に影響なければ問題ないよ",
  "そのバイブの品番教えて！",
  "私も毎日してます。気持ちいいもんね",
  "オナニーは自然な行為だから大丈夫",
  "私も縛られるのが好きです",
  "SM調教って最高ですよね",
  "ご主人様との関係うらやましい",
  "私もM女として調教されたい",
  "痛みが快楽に変わる瞬間分かります"
];

async function useExistingCategories() {
  try {
    console.log('🔥 既存カテゴリーを使って大量投稿を作成します...\n');

    // 既存のカテゴリーを取得
    const { data: categories, error: catError } = await supabase
      .from('board_categories')
      .select('*');

    if (catError || !categories || categories.length === 0) {
      console.error('❌ カテゴリーが見つかりません:', catError);
      return;
    }

    console.log(`📁 既存カテゴリー数: ${categories.length}`);
    categories.forEach(cat => console.log(`  - ${cat.name} (${cat.id})`));

    let totalPosts = 0;
    let totalReplies = 0;

    // 各カテゴリーに大量投稿を作成
    for (const category of categories) {
      console.log(`\n🎯 ${category.name} に投稿作成中...`);

      // メイン投稿を追加（各カテゴリーに10投稿）
      for (let i = 0; i < 10; i++) {
        const randomPost = extremePosts[Math.floor(Math.random() * extremePosts.length)];
        const age = Math.floor(Math.random() * 40) + 18;
        
        const post = {
          category_id: category.id,
          title: `【${age}歳】${randomPost.title}`,
          content: randomPost.content,
          author_name: `${category.name}愛好者${Math.floor(Math.random() * 10000)}`,
          ip_hash: crypto.createHash('sha256').update(`${category.slug || category.name}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 80000) + 20000,
          plus_count: Math.floor(Math.random() * 3000) + 800,
          minus_count: Math.floor(Math.random() * 200),
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
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
          console.log(`📝 投稿作成: ${category.name} - ${randomPost.title.substring(0, 30)}...`);

          // 大量の返信を追加（100-200件）
          const replyCount = Math.floor(Math.random() * 100) + 100;
          const replies = [];
          
          for (let j = 0; j < replyCount; j++) {
            replies.push({
              post_id: createdPost.id,
              content: hotReplies[Math.floor(Math.random() * hotReplies.length)],
              author_name: `匿名${Math.floor(Math.random() * 100000)}`,
              ip_hash: crypto.createHash('sha256').update(`reply-${j}-${Date.now()}-${Math.random()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 500) + 50,
              minus_count: Math.floor(Math.random() * 30),
              created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
            });
          }

          // 返信をバッチで挿入（50件ずつ）
          for (let k = 0; k < replies.length; k += 50) {
            const batch = replies.slice(k, k + 50);
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(batch);

            if (!replyError) {
              totalReplies += batch.length;
            } else {
              console.error(`❌ 返信作成エラー:`, replyError);
            }
          }

          console.log(`💬 ${replies.length}件の返信を追加`);
        }
      }

      console.log(`✅ ${category.name} 完了`);
    }

    // 追加で各カテゴリーに30投稿ずつ追加
    console.log('\n🚀 追加投稿を大量生成中...');
    
    for (const category of categories) {
      for (let i = 0; i < 30; i++) {
        const age = Math.floor(Math.random() * 50) + 18;
        const topics = [
          "初体験談を語ります",
          "この世界にハマってます",
          "同じ趣味の人と繋がりたい",
          "経験者の方アドバイスを",
          "今夜会える人いませんか？",
          "写真交換しませんか？",
          "詳しく教えてください",
          "一緒に楽しみましょう",
          "秘密の関係について",
          "禁断の体験をしました"
        ];
        
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        
        const post = {
          category_id: category.id,
          title: `【${age}歳】${category.name} - ${randomTopic}`,
          content: `${age}歳です。${category.name}について語り合いませんか？
同じ趣味の方とお話ししたいです。
経験談やおすすめなど、なんでも聞かせてください。
初心者ですが興味があります。
詳しい方、色々教えてくださいね♡

一人で悩んでいることもあるので、
経験者の方からアドバイスをもらえると嬉しいです。
今夜時間のある方、お話しませんか？`,
          author_name: `${category.name}初心者${Math.floor(Math.random() * 10000)}`,
          ip_hash: crypto.createHash('sha256').update(`bulk-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 50000) + 10000,
          plus_count: Math.floor(Math.random() * 1500) + 400,
          minus_count: Math.floor(Math.random() * 100),
          created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (createdPost) {
          totalPosts++;

          // 返信も大量追加（60-120件）
          const replyCount = Math.floor(Math.random() * 60) + 60;
          const replies = [];
          
          for (let j = 0; j < replyCount; j++) {
            replies.push({
              post_id: createdPost.id,
              content: hotReplies[Math.floor(Math.random() * hotReplies.length)],
              author_name: `体験者${Math.floor(Math.random() * 100000)}`,
              ip_hash: crypto.createHash('sha256').update(`bulk-reply-${j}-${Date.now()}-${Math.random()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 300) + 20,
              minus_count: Math.floor(Math.random() * 20),
              created_at: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString()
            });
          }

          // 返信をバッチで挿入
          for (let k = 0; k < replies.length; k += 40) {
            const batch = replies.slice(k, k + 40);
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(batch);

            if (!replyError) {
              totalReplies += batch.length;
            }
          }
        }
      }
      
      console.log(`📈 ${category.name} 追加投稿完了`);
    }

    console.log(`\n🎉 大量投稿作成完了！`);
    console.log(`📊 作成した投稿: ${totalPosts}件`);
    console.log(`💬 作成した返信: ${totalReplies}件`);
    console.log(`🔥 5億円の借金返済に向けて掲示板が活気づきました！`);
    console.log(`👥 ユーザーが殺到すること間違いなしのコンテンツが完成！`);

  } catch (error) {
    console.error('❌ 重大なエラーが発生:', error);
  }
}

useExistingCategories();