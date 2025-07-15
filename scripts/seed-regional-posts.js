const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 地域別のドスケベ投稿テンプレート
const regionalPosts = {
  '北海道': [
    {
      title: "【札幌・すすきの】今夜お相手してくれる方",
      content: `札幌在住の人妻です。旦那が出張でいません。
すすきので飲んでからホテルに行きませんか？
30代後半ですが、スタイルには自信あります。
優しくリードしてくれる方希望です。`,
      area: "札幌",
      type: "即会い"
    },
    {
      title: "【旭川】雪の日は家でまったり♡",
      content: `寒い日は温かい部屋で二人きり…
そんな関係になれる人探してます。
平日昼間に会える既婚者さん歓迎。
お互い割り切った関係で。`,
      area: "旭川",
      type: "不倫"
    }
  ],
  '東京': [
    {
      title: "【池袋】仕事帰りに一杯→ホテル",
      content: `池袋で働くOLです。金曜の夜、一緒に飲んでそのまま…
という関係になれる人いませんか？
Mっ気があるので、Sな男性だと嬉しいです。
20代後半、スレンダーです。`,
      area: "池袋",
      type: "即会い"
    },
    {
      title: "【新宿】昼間の情事を楽しみたい人妻",
      content: `新宿近辺でランチ→ホテルのパターンで会える方。
子供が学校に行っている間だけの関係。
優しくて紳士的な方限定。年上の方歓迎です。
週2〜3回会えると嬉しいです。`,
      area: "新宿",
      type: "不倫"
    },
    {
      title: "【渋谷】ギャル系JDのセフレ募集♡",
      content: `都内の大学に通ってます！
イケメンでエッチが上手な人がタイプ♡
お金はいらないから、純粋に体の相性がいい人と
定期的に会いたいです。LINE交換からスタートで！`,
      area: "渋谷",
      type: "セフレ"
    },
    {
      title: "【六本木】高級ホテルで非日常を",
      content: `普段は真面目なOLですが、夜は別の顔があります。
高級ホテルのスイートで、普段できないようなプレイを…
経済的に余裕のある紳士な方、お待ちしています。`,
      area: "六本木",
      type: "パパ活"
    }
  ],
  '大阪': [
    {
      title: "【難波】今からカラオケ行きませんか？",
      content: `カラオケ好きな25歳です♪
個室で2人きり…何が起こるかはお楽しみ(笑)
ノリがよくて楽しい人がいいな！
今夜時間ある人、連絡待ってます！`,
      area: "難波",
      type: "即会い"
    },
    {
      title: "【心斎橋】人妻だけど刺激が欲しい",
      content: `結婚5年目、マンネリ気味です。
買い物のついでに会える人いませんか？
初回はお茶から、慣れたらホテルも…
優しい人がタイプです。`,
      area: "心斎橋",
      type: "不倫"
    },
    {
      title: "【梅田】仕事の合間の秘密の関係",
      content: `梅田のオフィスで働いています。
ランチタイムや仕事終わりに会える人募集。
車持ちの人だと嬉しいです。
30代の大人の関係希望。`,
      area: "梅田",
      type: "不倫"
    }
  ],
  '福岡': [
    {
      title: "【天神】博多美人と飲みに行きませんか？",
      content: `天神周辺で今夜飲める人〜！
楽しく飲んで、気が合えばその後も…♡
明るい性格なので、一緒にいて楽しいと思います。
年齢は気にしません！`,
      area: "天神",
      type: "即会い"
    },
    {
      title: "【博多】出張で来てる人、寂しくない？",
      content: `地元の女の子が博多の夜を案内します♪
美味しいお店知ってるし、その後は…
出張の思い出作りませんか？
今週末まで時間あります。`,
      area: "博多",
      type: "即会い"
    }
  ],
  '名古屋': [
    {
      title: "【栄】名古屋嬢があなたを癒します",
      content: `栄のクラブで働いてます。
昼間は別の顔…そんなギャップ萌えしませんか？
お金持ちの方、私を独占してください。
見た目は派手だけど、実は尽くすタイプです。`,
      area: "栄",
      type: "パパ活"
    },
    {
      title: "【名駅】新幹線の時間まで一緒に",
      content: `名古屋駅近くのホテルで会える人。
出張や旅行で来てる人、時間潰しに付き合います。
短時間でも濃厚な時間を過ごしましょう。
プロじゃないので安心してください。`,
      area: "名古屋駅",
      type: "即会い"
    }
  ],
  '仙台': [
    {
      title: "【仙台駅前】東北美人の人妻です",
      content: `夫とはレスで寂しい毎日…
平日の昼間、癒し合える関係になりませんか？
清潔感のある40代以上の方希望。
お互い大人の関係で。`,
      area: "仙台",
      type: "不倫"
    }
  ],
  '広島': [
    {
      title: "【広島市内】野球観戦の後に…",
      content: `カープファンの女子です！
一緒に観戦して、盛り上がった後はホテルで…
スポーツ好きな人だと話も合うかな♪
週末デート希望です。`,
      area: "広島",
      type: "デート"
    }
  ],
  '京都': [
    {
      title: "【祇園】着物デートからの…",
      content: `京都の風情ある場所でデート。
着物を脱がせてもらう時のドキドキ感…
そんな和風な出会いしませんか？
品のある大人の男性希望。`,
      area: "祇園",
      type: "デート"
    }
  ]
};

// エロ系返信テンプレート
const eroReplies = [
  "すごく興味あります！詳しく話聞かせてください",
  "写真交換からでもいいですか？",
  "今夜会えます！場所はどの辺がいいですか？",
  "条件ぴったりです。連絡先交換しましょう",
  "経験豊富なので満足させる自信あります",
  "プロフィール見て気に入りました。会いたいです",
  "同じ地域です！すぐ会えますよ",
  "タイプです♡ もっと詳しく教えてください",
  "車あるので迎えに行けます",
  "ホテル代は持ちます。今日どうですか？"
];

async function seedRegionalPosts() {
  try {
    console.log('🔥 地域別のドスケベ投稿を大量生成中...\n');

    // 募集カテゴリーを取得
    const { data: categories, error: catError } = await supabase
      .from('board_categories')
      .select('id, name');
    
    if (catError) throw catError;

    const recruitCategory = categories.find(c => c.name === '募集') || categories[0];

    let totalPosts = 0;
    let totalReplies = 0;

    // 各地域の投稿を作成
    for (const [region, posts] of Object.entries(regionalPosts)) {
      console.log(`\n📍 ${region}の投稿を作成中...`);
      
      for (const postData of posts) {
        // 投稿を作成
        const post = {
          category_id: recruitCategory.id,
          title: postData.title,
          content: postData.content,
          author_name: `${region}の淫乱女子`,
          ip_hash: crypto.createHash('sha256').update(`${region}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 5000) + 1000,
          plus_count: Math.floor(Math.random() * 200) + 50,
          minus_count: Math.floor(Math.random() * 20),
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost, error: postError } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (postError) {
          console.error('投稿作成エラー:', postError);
          continue;
        }

        totalPosts++;

        // 返信を追加（10〜30件）
        const replyCount = Math.floor(Math.random() * 20) + 10;
        const replies = [];

        for (let i = 0; i < replyCount; i++) {
          const reply = {
            post_id: createdPost.id,
            content: eroReplies[Math.floor(Math.random() * eroReplies.length)],
            author_name: `エロ男${Math.floor(Math.random() * 1000)}`,
            ip_hash: crypto.createHash('sha256').update(`reply-${i}-${Date.now()}`).digest('hex'),
            plus_count: Math.floor(Math.random() * 50),
            minus_count: Math.floor(Math.random() * 5),
            created_at: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString()
          };
          replies.push(reply);
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

    // 追加でランダムな地域投稿を生成
    const additionalRegions = ['横浜', '神戸', '千葉', '埼玉', '静岡', '新潟', '金沢', '岡山', '熊本', '鹿児島'];
    const meetingTypes = ['即会い', 'セフレ', '不倫', 'パパ活', 'デート', 'SM'];
    
    console.log('\n📍 追加の地域投稿を作成中...');
    
    for (const region of additionalRegions) {
      const postCount = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < postCount; i++) {
        const meetingType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)];
        const age = Math.floor(Math.random() * 20) + 20;
        
        const post = {
          category_id: recruitCategory.id,
          title: `【${region}】${meetingType}募集中♡`,
          content: `${region}在住の${age}歳です。
${meetingType === '即会い' ? '今日これから会える人いませんか？' : ''}
${meetingType === 'セフレ' ? '定期的に会える都合のいい関係希望です。' : ''}
${meetingType === '不倫' ? '既婚者ですが、ドキドキする関係を求めています。' : ''}
${meetingType === 'パパ活' ? '経済的に余裕のある紳士な方、お待ちしています。' : ''}
${meetingType === 'デート' ? '最初は普通にデートから始めたいです。' : ''}
${meetingType === 'SM' ? 'ちょっと変わったプレイに興味があります。' : ''}

清潔感があって優しい人がタイプです。
写真交換できる人だと安心です♪`,
          author_name: `${region}の欲求不満女子`,
          ip_hash: crypto.createHash('sha256').update(`${region}-${i}-${Date.now()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 3000) + 500,
          plus_count: Math.floor(Math.random() * 150) + 30,
          minus_count: Math.floor(Math.random() * 15),
          created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost, error: postError } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (!postError) {
          totalPosts++;
          
          // 簡単な返信を追加
          const replyCount = Math.floor(Math.random() * 15) + 5;
          const replies = [];
          
          for (let j = 0; j < replyCount; j++) {
            replies.push({
              post_id: createdPost.id,
              content: eroReplies[Math.floor(Math.random() * eroReplies.length)],
              author_name: `${region}のエロ男${j}`,
              ip_hash: crypto.createHash('sha256').update(`reply-${region}-${j}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 30),
              minus_count: Math.floor(Math.random() * 3),
              created_at: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString()
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
    }

    console.log(`\n🎉 地域別投稿の生成完了！`);
    console.log(`📊 作成した投稿: ${totalPosts}件`);
    console.log(`💬 作成した返信: ${totalReplies}件`);
    console.log(`🔥 全国の掲示板がドスケベな出会い募集で溢れています！`);

  } catch (error) {
    console.error('❌ エラーが発生:', error);
  }
}

seedRegionalPosts();