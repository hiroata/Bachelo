const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// エキサイティングなコンテンツテンプレート
const excitingContent = {
  'トレンディング': [
    {
      title: "【緊急討論】セフレvs恋人、どっちが幸せ？",
      content: `皆さんに聞きたいことがあります！

セフレと恋人、本当に幸せなのはどっち？

私（26歳女）は今、2つの選択肢で悩んでいます：
1. 体の相性抜群だけど将来性ゼロのセフレ（32歳既婚）
2. 優しいけど体の相性イマイチな彼氏（28歳独身）

セフレとは週2で会って、毎回最高の時間を過ごしてます。
でも既婚者だし、このまま続けても未来はない...

彼氏は結婚も考えてくれてるけど、正直、夜は物足りない。
でも安定した将来は約束されてる。

【アンケート】
A. 情熱的なセフレ関係
B. 安定した恋人関係
C. 両方キープ
D. どっちも切って新しい出会い

皆さんの本音を聞かせてください！
経験談もぜひ！`,
      tags: ['トレンド', '議論', 'アンケート']
    },
    {
      title: "【衝撃告白】旦那の親友と不倫してしまいました",
      content: `もう誰にも言えないので、ここで告白させてください。

結婚5年目、子供2人の34歳主婦です。
先月から旦那の親友（独身38歳）と関係を持ってしまっています。

きっかけは旦那の浮気発覚でした。
傷ついた私を慰めてくれたのが、皮肉にも旦那の親友だったんです。

「俺があいつだったら、絶対お前を大切にする」

その言葉に、崩れ落ちるように彼の腕の中へ...

今では週に3回は会っています。
旦那は私の浮気に全く気づいていません。
むしろ最近は優しくなりました（罪悪感？）

このまま続けるのは最低だとわかっています。
でも、彼といる時だけが本当の自分でいられるんです。

同じような経験をした方、いますか？
この先どうすればいいのか、アドバイスください。`,
      tags: ['不倫', '衝撃', '相談']
    },
    {
      title: "【実況中継】今から浮気相手の家に行きます",
      content: `リアルタイム投稿です！

今から浮気相手（上司・45歳既婚）の家に向かってます。
奥さんは実家に帰省中で、今夜から3日間は二人きり。

ドキドキが止まりません...
電車の中で既に濡れてきちゃってます。

【現在地】渋谷駅
【到着予定】19:30頃

今夜は彼の家で初めて朝まで過ごせる。
いつもはラブホで2時間だけだったから...

持ち物チェック：
☑️ セクシーな下着（新品）
☑️ ボディクリーム（いい香り）
☑️ おもちゃ（彼のリクエスト）
☑️ 避妊具

実況更新していきます！
応援コメントお願いします♡

【追記19:15】もうすぐ最寄り駅！心臓バクバク
【追記19:28】家の前に到着。いってきます！`,
      tags: ['実況', 'リアルタイム', '不倫']
    }
  ],
  'バズり投稿': [
    {
      title: "【検証】1週間で何人とヤれるか試してみた結果...",
      content: `26歳OLです。
失恋のショックで自暴自棄になり、とんでもない検証をしてしまいました。

「1週間で何人の男性と関係を持てるか」

マッチングアプリを総動員して挑戦した結果...

月曜日：元カレ（よりを戻そうと言われて）
火曜日：マッチングアプリで知り合った会社員（28歳）
水曜日：ジムのトレーナー（25歳）
木曜日：合コンで知り合った医者（35歳）
金曜日：行きつけのバーの常連客（40歳）
土曜日：昼は大学の同級生（26歳）、夜は別の人（32歳）
日曜日：朝まで過ごした人と2回戦

合計8人（9回）という結果に...

全員と避妊はしましたが、今思うと恐ろしいことをしました。
でも不思議と後悔はしていません。
むしろ自信がつきました。

批判は覚悟しています。
でも同じような経験した人、いませんか？`,
      tags: ['検証', '体験談', '衝撃']
    },
    {
      title: "【議論】経験人数を正直に言うべき？それとも少なめに？",
      content: `永遠のテーマかもしれませんが...

新しい彼氏に「今まで何人と付き合った？」と聞かれました。

本当の人数：43人（28歳女）
彼に言った人数：5人

正直、大学時代はかなり遊んでました。
社会人になってからも出会いが多くて...

でも43人って言ったら確実に引かれる。
だから5人って嘘をつきました。

友達に相談したら意見が真っ二つ：
・「嘘も愛情」派：過去は過去、今が大事
・「正直が一番」派：後でバレたら最悪

【アンケート】
みんなは経験人数、正直に言う？
A. 正直に全部言う
B. 少なめに言う（÷3〜5くらい）
C. 極端に少なく言う（3人以下）
D. 聞かれても答えない

ちなみに彼の経験人数は12人だそうです。
（これも本当かわかりませんが...）`,
      tags: ['アンケート', '恋愛', '議論']
    }
  ],
  'チャレンジ企画': [
    {
      title: "【チャレンジ】24時間で知らない人とホテルに行けるか？",
      content: `YouTuberじゃないけど、チャレンジ企画やります！

【ルール】
・今から24時間以内
・今日初めて会う人限定
・ナンパでもアプリでもOK
・証拠写真は撮らない（プライバシー保護）
・場所は都内限定

22歳女子大生、見た目は中の上くらい？
普段はそんなに積極的じゃないけど、
友達に「度胸ないでしょ」って言われて悔しくて...

【10:00】 チャレンジスタート！
【10:30】 渋谷でナンパ待ち→スルーされまくり
【11:45】 アプリで速攻マッチした人とランチ約束
【13:00】 ランチ中。イケメンだけどチャラい...
【15:00】 ランチの人は却下。次を探す
【16:30】 表参道でナンパされた！32歳商社マン
【18:00】 飲みに誘われた。いい感じかも？
【20:00】 かなり酔ってきた...
【21:30】 ホテル打診された！どうしよう...
【22:00】 チャレンジ成功！

感想：意外と簡単だった。でも虚しい。
もう二度とやりません（たぶん）`,
      tags: ['チャレンジ', '実況', '企画']
    },
    {
      title: "【企画】エロい告白選手権！優勝者に賞金1万円！",
      content: `盛り上げ企画第一弾！

あなたの一番エロい体験を告白してください！
最もエキサイティングな告白をした人に賞金1万円！

【応募条件】
・実体験であること（創作NG）
・500文字以上
・違法行為はNG
・個人特定される情報は伏せる

【審査基準】
・エロさ（40点）
・リアリティ（30点）
・文章力（20点）
・インパクト（10点）

【現在のエントリー】
1. 「電車で見知らぬ人と...」@匿名希望A
2. 「上司の奥さんと部下の私」@不倫女子
3. 「修学旅行の夜の大乱交」@アラサーOL
4. 「ママ友4人での秘密の関係」@欲求不満妻

締切：今週日曜日23:59
結果発表：月曜日20:00

どんどん応募してください！
コメント欄で感想も大歓迎！`,
      tags: ['企画', 'コンテスト', '賞金']
    }
  ],
  '過激な質問': [
    {
      title: "【アンケート】一番ヤバかった場所はどこ？",
      content: `エッチした場所で一番ヤバかったところ教えて！

私のランキング：
🥇 会社の会議室（昼休み、鍵なし）
🥈 彼氏の実家（両親在宅、隣の部屋）
🥉 図書館の個室（大学の試験期間中）

その他の経験：
・カラオケ（店員に見られた）
・観覧車（下から丸見えだった？）
・プール��更衣室（子供が入ってきて焦った）
・公園のトイレ（汚いけど興奮した）
・車の中（警察に職質された）

一番スリリングだったのは会議室かな。
いつ誰が入ってくるかわからない状況で...
今思い出してもゾクゾクする。

みんなの「ヤバい場所」教えて！
・場所
・シチュエーション
・バレそうになった度（5段階）
・また���たい度（5段階）

変態自慢大会しましょ♡`,
      tags: ['アンケート', '体験談', '過激']
    },
    {
      title: "【本音】ぶっちゃけ浮気や不倫って悪いこと？",
      content: `炎上覚悟で本音を言います。

浮気や不倫って、本当にそんなに悪いことなの？

私（29歳既婚女性）の持論：
・人間は一人だけを愛し続けるようにできてない
・恋愛感情と性欲は別物
・バレなければ誰も傷つかない
・むしろ夫婦関係が良くなることもある

実際、私は結婚3年目から定期的に浮気してます。
相手は固定で、お互い割り切った関係。
家庭は壊したくないし、彼も同じ考え。

浮気のおかげで？夫婦関係は良好。
夫にも優しくできるし、セックスレスにもならない。
ストレス発散できて、毎日楽しい。

【質問】
1. 浮気・不倫は絶対悪だと思う？
2. バレなければOKだと思う？
3. 相手が浮気してても知らなければ幸せ？
4. 一生一人だけを愛せる自信ある？

きれいごと抜きで、本音を聞かせてください。`,
      tags: ['議論', '不倫', '本音']
    }
  ]
};

// エキサイティングな返信パターン
const excitingReplies = {
  agreement: [
    "完全に同意！私も全く同じこと考えてた",
    "これは真理。みんな本音では分かってるはず",
    "やっと本音で話せる人見つけた！",
    "正論すぎてぐうの音も出ない"
  ],
  disagreement: [
    "いやいや、それは違うでしょ！",
    "その考えはヤバすぎる...",
    "気持ちは分かるけど、一線は越えちゃダメ",
    "それで本当に幸せなの？"
  ],
  experience: [
    "私もまさに今、同じ状況です...",
    "経験者として言わせてもらうと",
    "昔の私を見てるみたい",
    "その気持ち、痛いほど分かる"
  ],
  curiosity: [
    "もっと詳しく聞きたい！",
    "続きが気になって仕方ない",
    "その後どうなったの？",
    "詳細kwsk!!!"
  ],
  excitement: [
    "これは盛り上がる話題！",
    "久々に面白い投稿見た",
    "この流れは祭りの予感",
    "バズり確定でしょこれ"
  ]
};

async function createExcitingContent() {
  try {
    console.log('🔥 掲示板を更にエキサイティングに！\n');

    // カテゴリーを取得
    const { data: categories } = await supabase
      .from('board_categories')
      .select('*');

    if (!categories || categories.length === 0) {
      console.error('❌ カテゴリーが見つかりません');
      return;
    }

    let totalPosts = 0;
    let totalReplies = 0;

    // エキサイティングなコンテンツを作成
    for (const [contentType, posts] of Object.entries(excitingContent)) {
      console.log(`\n🎯 ${contentType}を作成中...`);

      for (const postData of posts) {
        // ランダムなカテゴリーを選択（話題性重視）
        const targetCategory = categories[Math.floor(Math.random() * categories.length)];

        const post = {
          category_id: targetCategory.id,
          title: postData.title,
          content: postData.content,
          author_name: `話題の投稿者${Math.floor(Math.random() * 1000)}`,
          ip_hash: crypto.createHash('sha256').update(`exciting-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 50000) + 20000, // 高い閲覧数
          plus_count: Math.floor(Math.random() * 3000) + 1000, // 高い評価
          minus_count: Math.floor(Math.random() * 500) + 100, // 議論を呼ぶ投稿
          // is_pinned: Math.random() < 0.3, // 30%の確率でピン留め（フィールドが存在しない）
          created_at: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString() // 6時間以内
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
          console.log(`✅ 作成: ${postData.title}`);

          // より多くの返信を生成（話題性のある投稿）
          const replyCount = Math.floor(Math.random() * 150) + 100;
          const replies = [];

          for (let i = 0; i < replyCount; i++) {
            // 返信のタイプをランダムに選択
            const replyTypes = Object.keys(excitingReplies);
            const replyType = replyTypes[Math.floor(Math.random() * replyTypes.length)];
            const replyTemplates = excitingReplies[replyType];
            const baseReply = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];

            // 詳細な返信を生成
            let fullReply = baseReply;
            
            if (Math.random() < 0.5) { // 50%の確率で詳細を追加
              switch(replyType) {
                case 'experience':
                  fullReply += `\n\n私の場合は${Math.floor(Math.random() * 5) + 1}年前から始まって、今でも続いています。`;
                  break;
                case 'disagreement':
                  fullReply += `\n\nそんなことしてたら絶対後悔するよ。私の友達がまさにそれで...`;
                  break;
                case 'curiosity':
                  fullReply += `\n\n特に気になるのは、相手の反応！どんな感じだった？`;
                  break;
                case 'excitement':
                  fullReply += `\n\nこういう本音トーク、もっと増えてほしい！`;
                  break;
              }
            }

            // 返信に対する返信（議論の深まり）
            if (i > 20 && Math.random() < 0.3) {
              fullReply = `>>${Math.floor(Math.random() * i) + 1}\n${fullReply}`;
            }

            replies.push({
              post_id: createdPost.id,
              content: fullReply,
              author_name: `${replyType}派${Math.floor(Math.random() * 5000)}`,
              ip_hash: crypto.createHash('sha256').update(`reply-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 200) + 10,
              minus_count: Math.floor(Math.random() * 50), // 議論を呼ぶ返信
              created_at: new Date(Date.now() - Math.random() * 5 * 60 * 60 * 1000).toISOString()
            });
          }

          // 返信をバッチで挿入
          for (let j = 0; j < replies.length; j += 30) {
            const batch = replies.slice(j, j + 30);
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(batch);

            if (!replyError) {
              totalReplies += batch.length;
            } else {
              console.error(`❌ 返信作成エラー:`, replyError);
            }
          }

          console.log(`💬 ${replies.length}件の白熱した議論を追加`);
        }
      }
    }

    // リアルタイム風の投稿も追加
    console.log('\n⚡ リアルタイム風投稿を作成中...');
    
    const realtimePosts = [
      "【速報】今まさに浮気相手とホテルなう",
      "【実況】合コンで速攻お持ち帰り狙い中",
      "【生配信】人妻だけど今から不倫相手に会います",
      "【リアルタイム】上司に告白される5秒前",
      "【実況中】元カレから「やり直したい」LINE来た"
    ];

    for (const title of realtimePosts) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const post = {
        category_id: category.id,
        title: `${title}【コメントで応援して】`,
        content: `リアルタイムで更新していきます！\n\n今の状況：準備中\nドキドキ度：★★★★★\n\n【更新予定】\n5分後：現場到着\n10分後：接触開始\n30分後：進展報告\n\n応援コメントお願いします！\n\n※プライバシー保護のため詳細は伏せます`,
        author_name: `リアルタイム実況${Math.floor(Math.random() * 100)}`,
        ip_hash: crypto.createHash('sha256').update(`realtime-${Date.now()}-${Math.random()}`).digest('hex'),
        view_count: Math.floor(Math.random() * 10000) + 5000,
        plus_count: Math.floor(Math.random() * 500) + 200,
        minus_count: Math.floor(Math.random() * 20),
        created_at: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString() // 30分以内
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

    // 最終確認
    const { count: finalCount } = await supabase
      .from('board_posts')
      .select('*', { count: 'exact', head: true });

    console.log(`\n🎊 エキサイティングコンテンツ投入完了！`);
    console.log(`🔥 新規投稿: ${totalPosts}件`);
    console.log(`💬 白熱議論: ${totalReplies}件`);
    console.log(`📈 総投稿数: ${finalCount || 0}件`);
    console.log(`⚡ 掲示板が更に盛り上がること間違いなし！`);
    console.log(`💰 話題性のあるコンテンツで収益アップ！`);

  } catch (error) {
    console.error('❌ エラー発生:', error);
  }
}

createExcitingContent();