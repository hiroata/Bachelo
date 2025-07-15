const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ライブディスカッションテーマ
const liveDiscussions = {
  '深夜の本音トーク': [
    {
      title: "【深夜限定】今夜のオカズ画像をシェアする会",
      content: `深夜2時だからこそできる本音トーク！

今夜のオカズにした画像や動画、エロサイトをシェアしよう！

【ルール】
・違法なものはNG
・お互いの性癖を否定しない
・新しい発見があったら感謝する
・明日には忘れる（深夜の秘密）

俺から始めるわ。
最近ハマってるのは人妻もの。
特に「旦那が隣の部屋にいるのに...」系がヤバい。

みんなは今夜何で抜く予定？
おすすめあったら教えて！`,
      timeLimit: '朝5時まで'
    },
    {
      title: "【エロ通話】今すぐ声聞きたい人いる？",
      content: `寂しくて眠れない...
誰か声聞かせてくれる人いない？

25歳女、都内住み。
今日は彼氏と喧嘩して一人。

エロい話でもなんでもいいから
誰かと繋がっていたい気分。

【希望】
・優しい声の人
・30分くらい話せる人
・変態すぎない人（ちょっとはOK）

DMで連絡待ってます。
早い者勝ち♡`,
      timeLimit: '30分限定'
    }
  ],
  'ランキングバトル': [
    {
      title: "【投票】今月のMVPエロ投稿を決めよう！",
      content: `毎月恒例！今月の最優秀エロ投稿を決める時間だ！

【ノミネート作品】
1️⃣「上司の奥さんとの3ヶ月」- 不倫ドキュメント
2️⃣「露出狂になった経緯」- 覚醒体験談  
3️⃣「スワッピング初体験」- 夫婦交換レポート
4️⃣「風俗嬢が語る裏側」- 業界暴露話
5️⃣「近親相姦の境界線」- タブー告白

投票理由も書いてくれると嬉しい！
優勝者には「エロ神」の称号を授与！

現在の投票数：
1️⃣: 89票
2️⃣: 76票
3️⃣: 95票
4️⃣: 112票
5️⃣: 134票`,
      timeLimit: '今夜23:59まで'
    },
    {
      title: "【バトル】巨乳vs貧乳！永遠の対決に決着を",
      content: `ついに決着をつける時が来た！

巨乳派 vs 貧乳派

それぞれの魅力を語って投票しよう！

【巨乳派の主張】
・包容力がある
・パイズリ最高
・触り心地が天国
・母性を感じる

【貧乳派の主張】  
・感度が高い
・スレンダーな体型
・乳首が綺麗
・将来垂れない

中間派は認めない！
どちらかに投票せよ！

現在：巨乳派 524票 vs 貧乳派 489票`,
      voteOptions: ['巨乳派', '貧乳派']
    }
  ],
  'エロゲーム企画': [
    {
      title: "【ゲーム】エロ大喜利大会開催！優勝賞品あり",
      content: `第1回エロ大喜利大会！

お題：「セックス中に言われて一番萎えるセリフ」

【現在の回答】
・「あ、母さんから電話」
・「元カレの方が大きかった」
・「今日生理来ちゃった」
・「隣の部屋で子供が起きた」
・「明日早いから手短に」

優勝者にはアマギフ3000円！
面白い回答にはボーナスポイント！

締切：今夜22時
結果発表：23時`,
      prize: 'Amazonギフト券3000円'
    },
    {
      title: "【チキンレース】どこまでエロい体験談書ける？",
      content: `エロ体験談チキンレース開催！

ルール：
1. 実体験を書く（嘘はダメ）
2. 徐々に過激にしていく
3. 一番過激だけど削除されない投稿が優勝

現在のトップ：
「電車で痴漢に遭って感じてしまった話」

これを超える体験談を投稿しろ！
ただし規約違反は即失格！

参加者全員に参加賞あり！`,
      challengeType: 'エスカレーション'
    }
  ],
  '相談ライブ': [
    {
      title: "【緊急相談】セフレが本気になってきた...助けて",
      content: `リアルタイムで相談させて...

セフレ（28歳男）が最近おかしい。
「好きだ」とか「付き合おう」とか言い出した。

私（32歳既婚）としては体だけの関係がよかったのに。
旦那にバレるリスクも上がるし...

でも体の相性は最高なんだよね。
このまま関係続けるべき？
それとも切るべき？

みんなの意見聞かせて！
【投票】
A. 関係を続ける
B. きっぱり切る  
C. 冷却期間を置く`,
      needsAdvice: true
    },
    {
      title: "【人生相談】風俗で働くか真剣に悩んでます",
      content: `26歳、借金200万。
普通のOLじゃ返済できない。

風俗で働くことを真剣に考えてる。
でも怖いし、病気も心配。
家族にバレたら...

経験者の人いたら、リアルな話聞かせてください。
・月収はどれくらい？
・危険な目に遭った？
・精神的にきつい？
・やめ時は？

批判はいらない。
真剣なアドバイスだけお願い。`,
      seriousTopic: true
    }
  ],
  'エロ実況': [
    {
      title: "【実況】合コンからお持ち帰りまでを完全生中継",
      content: `19:00 合コンスタート！
相手：商社マン3人、CA2人

19:15 乾杯！めっちゃイケメンいる！
19:30 となりの席ゲット。ボディタッチ開始
19:45 「かわいいね」って言われた！
20:00 二次会の相談中。カラオケ行くことに
20:30 カラオケ到着。個室やばい
20:45 手繋がれた！！！
21:00 キスされそう...
21:15 キスした♡ 
21:30 ホテル誘われた...どうしよう
21:45 ホテル向かってます！

【続きはDMで】`,
      realtime: true
    },
    {
      title: "【生配信】今から人妻とダブル不倫してきます",
      content: `お互い既婚者同士の禁断の関係。
今から月1の密会です。

場所：都内某所のシティホテル
時間：14時〜17時（旦那には仕事と嘘）

【実況予定】
14:00 ホテルロビーで待ち合わせ
14:15 チェックイン（ドキドキ）
14:30 部屋で乾杯
15:00 本番開始
16:30 シャワータイム
17:00 解散

応援コメントが多ければ
詳細レポートします！`,
      updateInterval: '30分ごと'
    }
  ]
};

// 盛り上がる返信パターン
const excitingReplyPatterns = [
  // 応援系
  "頑張れ！応援してる！",
  "実況楽しみにしてる！",
  "これは期待！続き早く！",
  "ワクワクが止まらない",
  
  // 共感系
  "めっちゃわかる！私も同じ",
  "まさに今その状況",
  "経験ある！アドバイスするよ",
  "その気持ち痛いほどわかる",
  
  // 興奮系
  "やばい！興奮する！",
  "これは熱い展開！",
  "続きが気になりすぎる！",
  "今夜は眠れない！",
  
  // 参加系
  "私も参加したい！",
  "次は俺も挑戦する！",
  "仲間に入れて！",
  "一緒にやろう！",
  
  // アドバイス系
  "それなら○○がおすすめ",
  "私の経験では××だった",
  "注意点は△△だよ",
  "成功の秘訣教える"
];

async function createLiveDiscussions() {
  try {
    console.log('🔴 LIVE！リアルタイムディスカッションを作成中...\n');

    const { data: categories } = await supabase
      .from('board_categories')
      .select('*');

    if (!categories || categories.length === 0) {
      console.error('❌ カテゴリーが見つかりません');
      return;
    }

    let totalPosts = 0;
    let totalReplies = 0;
    let totalImages = 0;

    // 各ディスカッションタイプを作成
    for (const [discussionType, posts] of Object.entries(liveDiscussions)) {
      console.log(`\n🎯 ${discussionType}を作成中...`);

      for (const postData of posts) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        const post = {
          category_id: category.id,
          title: postData.title,
          content: postData.content,
          author_name: `${discussionType}主催者${Math.floor(Math.random() * 1000)}`,
          ip_hash: crypto.createHash('sha256').update(`live-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 30000) + 10000,
          plus_count: Math.floor(Math.random() * 2000) + 500,
          minus_count: Math.floor(Math.random() * 100),
          created_at: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString() // 2時間以内
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
          console.log(`✅ LIVE作成: ${postData.title}`);

          // リアルタイム感のある返信を生成
          const replyCount = Math.floor(Math.random() * 200) + 150; // 多めの返信
          const replies = [];
          
          // 時系列で返信を作成
          for (let i = 0; i < replyCount; i++) {
            const timeDiff = (i / replyCount) * 2 * 60 * 60 * 1000; // 2時間に分散
            const replyTime = new Date(Date.now() - (2 * 60 * 60 * 1000 - timeDiff));
            
            let replyContent = excitingReplyPatterns[Math.floor(Math.random() * excitingReplyPatterns.length)];
            
            // 実況系の場合は時間に応じた返信
            if (postData.realtime && i > replyCount * 0.7) {
              replyContent = "まだ見てる！続き楽しみ！";
            } else if (postData.updateInterval && i % 10 === 0) {
              replyContent = `${Math.floor(i / 10) * 30}分経過！どうなった？`;
            }
            
            // 投票系の場合
            if (postData.voteOptions && Math.random() < 0.4) {
              const vote = postData.voteOptions[Math.floor(Math.random() * postData.voteOptions.length)];
              replyContent = `${vote}に一票！理由は...`;
            }
            
            // より詳細な返信を追加
            if (Math.random() < 0.3) {
              const additions = [
                "\n\n詳しく説明すると...",
                "\n\n私の体験では...",
                "\n\nちなみに補足すると...",
                "\n\n関連する話だけど..."
              ];
              replyContent += additions[Math.floor(Math.random() * additions.length)];
            }

            replies.push({
              post_id: createdPost.id,
              content: replyContent,
              author_name: `参加者${Math.floor(Math.random() * 5000)}`,
              ip_hash: crypto.createHash('sha256').update(`reply-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 100) + 5,
              minus_count: Math.floor(Math.random() * 10),
              created_at: replyTime.toISOString()
            });
          }

          // 返信をバッチ挿入
          for (let j = 0; j < replies.length; j += 30) {
            const batch = replies.slice(j, j + 30);
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(batch);

            if (!replyError) {
              totalReplies += batch.length;
            }
          }

          console.log(`💬 ${replies.length}件のライブ返信を追加`);
          
          // 画像投稿も時々追加（エロ画像ではなく関連画像として）
          if (Math.random() < 0.3 && createdPost.id) {
            const imageCount = Math.floor(Math.random() * 3) + 1;
            const images = [];
            
            for (let k = 0; k < imageCount; k++) {
              images.push({
                post_id: createdPost.id,
                image_url: `https://picsum.photos/800/600?random=${Date.now()}-${k}`,
                thumbnail_url: `https://picsum.photos/200/150?random=${Date.now()}-${k}`,
                created_at: new Date().toISOString()
              });
            }
            
            const { error: imageError } = await supabase
              .from('board_post_images')
              .insert(images);
              
            if (!imageError) {
              totalImages += images.length;
              console.log(`📸 ${images.length}枚の画像を追加`);
            }
          }
        }
      }
    }

    // ホットトピックスも作成
    console.log('\n🔥 本日のホットトピックスを作成中...');
    
    const hotTopics = [
      "【炎上中】有名人の不倫スキャンダルについて語ろう",
      "【議論】AIとのバーチャルセックスは浮気になる？",
      "【速報】新しい出会い系アプリがヤバすぎる件",
      "【検証】媚薬は本当に効果があるのか試してみた",
      "【告発】悪質な出会い系サイトの手口を暴露する"
    ];

    for (const topic of hotTopics) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const post = {
        category_id: category.id,
        title: `${topic}【コメント殺到中】`,
        content: `現在この話題で持ちきり！\n\nみんなの意見を聞かせて！\n\n※荒らしは通報します\n※個人情報の投稿は禁止\n\n健全な議論をお願いします。`,
        author_name: `話題の提供者${Math.floor(Math.random() * 100)}`,
        ip_hash: crypto.createHash('sha256').update(`hot-${Date.now()}-${Math.random()}`).digest('hex'),
        view_count: Math.floor(Math.random() * 50000) + 30000,
        plus_count: Math.floor(Math.random() * 3000) + 1000,
        minus_count: Math.floor(Math.random() * 300) + 100,
        created_at: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString()
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

    // 最終統計
    const { count: finalCount } = await supabase
      .from('board_posts')
      .select('*', { count: 'exact', head: true });

    console.log(`\n🎊 ライブディスカッション作成完了！`);
    console.log(`🔴 新規LIVE投稿: ${totalPosts}件`);
    console.log(`💬 リアルタイム返信: ${totalReplies}件`);
    console.log(`📸 画像投稿: ${totalImages}件`);
    console.log(`📈 総投稿数: ${finalCount || 0}件`);
    console.log(`🔥 24時間盛り上がり続ける掲示板の完成！`);

  } catch (error) {
    console.error('❌ エラー発生:', error);
  }
}

createLiveDiscussions();