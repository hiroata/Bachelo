const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 全国の地域別エロ投稿データ
const regionalPosts = {
  '北海道': {
    cities: ['札幌', '旭川', '函館', '帯広', '釧路', '苫小牧', '小樽', '北見'],
    posts: [
      {
        title: "【札幌・すすきの】今夜お相手してくれる方",
        content: `札幌在住の人妻です。旦那が出張でいません。すすきので飲んでからホテルに行きませんか？30代後半ですが、スタイルには自信あります。優しくリードしてくれる方希望です。寂しい夜を一緒に過ごしませんか？ 今夜23時頃から時間あります。メッセージお待ちしています♡`
      },
      {
        title: "【旭川】雪の日は家でまったり♡",
        content: `寒い日は温かい部屋で二人きり…そんな関係になれる人探してます。平日昼間に会える既婚者さん歓迎。お互い割り切った関係で。旭川市内であれば車でお迎えに行きます。暖房の効いた部屋で熱い時間を過ごしましょう♪`
      },
      {
        title: "【函館】温泉デートからホテルへ",
        content: `函館の温泉で一緒にリラックスしてから、その後は…という関係を求めています。観光がてら楽しい時間を過ごした後、大人の時間もいかがですか？25歳OLです。道外の方も歓迎♡ 函館の夜景を見ながら愛し合いましょう。`
      }
    ]
  },
  '東京': {
    cities: ['新宿', '渋谷', '池袋', '銀座', '六本木', '品川', '上野', '秋葉原', '吉祥寺', '立川'],
    posts: [
      {
        title: "【池袋】仕事帰りに一杯→ホテル",
        content: `池袋で働くOLです。金曜の夜、一緒に飲んでそのまま…という関係になれる人いませんか？Mっ気があるので、Sな男性だと嬉しいです。20代後半、スレンダーです。池袋のホテル街をよく知ってるので案内しますよ♪ 今夜会える方急募！`
      },
      {
        title: "【新宿】昼間の情事を楽しみたい人妻",
        content: `新宿近辺でランチ→ホテルのパターンで会える方。子供が学校に行っている間だけの関係。優しくて紳士的な方限定。年上の方歓迎です。週2〜3回会えると嬉しいです。新宿のラブホをいくつか知ってるので、お好みに合わせて選びます♡`
      },
      {
        title: "【渋谷】ギャル系JDのセフレ募集♡",
        content: `都内の大学に通ってます！イケメンでエッチが上手な人がタイプ♡お金はいらないから、純粋に体の相性がいい人と定期的に会いたいです。LINE交換からスタートで！渋谷でよく遊んでるので、買い物ついでに会えたりします。今度の土日空いてる人〜♪`
      },
      {
        title: "【六本木】高級ホテルで非日常を",
        content: `普段は真面目なOLですが、夜は別の顔があります。高級ホテルのスイートで、普段できないようなプレイを…経済的に余裕のある紳士な方、お待ちしています。六本木ヒルズ近辺のホテルを予約してくれる方希望。特別な夜にしましょう♡`
      }
    ]
  },
  '大阪': {
    cities: ['難波', '心斎橋', '梅田', '天王寺', '京橋', '新大阪', '堺'],
    posts: [
      {
        title: "【難波】今からカラオケ行きませんか？",
        content: `カラオケ好きな25歳です♪個室で2人きり…何が起こるかはお楽しみ(笑) ノリがよくて楽しい人がいいな！今夜時間ある人、連絡待ってます！難波のカラオケなら詳しいので、いいお店紹介できます。歌った後はホテル街も近いですし…♡`
      },
      {
        title: "【心斎橋】人妻だけど刺激が欲しい",
        content: `結婚5年目、マンネリ気味です。買い物のついでに会える人いませんか？初回はお茶から、慣れたらホテルも…優しい人がタイプです。心斎橋でお買い物してからの密会が理想です。関西弁でいっぱい甘えさせてもらいます♪`
      },
      {
        title: "【梅田】仕事の合間の秘密の関係",
        content: `梅田のオフィスで働いています。ランチタイムや仕事終わりに会える人募集。車持ちの人だと嬉しいです。30代の大人の関係希望。梅田の地下街は迷路みたいだけど、秘密の場所たくさん知ってます。こっそり会いましょ♡`
      }
    ]
  },
  '愛知': {
    cities: ['名古屋', '豊田', '岡崎', '一宮', '豊橋', '春日井', '安城'],
    posts: [
      {
        title: "【栄】名古屋嬢があなたを癒します",
        content: `栄のクラブで働いてます。昼間は別の顔…そんなギャップ萌えしませんか？お金持ちの方、私を独占してください。見た目は派手だけど、実は尽くすタイプです。栄のホテル街なら詳しいので、素敵なところでお待ちしてます♡`
      },
      {
        title: "【名駅】新幹線の時間まで一緒に",
        content: `名古屋駅近くのホテルで会える人。出張や旅行で来てる人、時間潰しに付き合います。短時間でも濃厚な時間を過ごしましょう。プロじゃないので安心してください。名古屋名物も案内できますよ♪ きしめんでも食べながらお話しませんか？`
      }
    ]
  },
  '福岡': {
    cities: ['天神', '博多', '小倉', '久留米', '大牟田'],
    posts: [
      {
        title: "【天神】博多美人と飲みに行きませんか？",
        content: `天神周辺で今夜飲める人〜！楽しく飲んで、気が合えばその後も…♡明るい性格なので、一緒にいて楽しいと思います。年齢は気にしません！天神の美味しいお店知ってるので案内しますよ。九州男児の方、特に歓迎♪`
      },
      {
        title: "【博多】出張で来てる人、寂しくない？",
        content: `地元の女の子が博多の夜を案内します♪美味しいお店知ってるし、その後は…出張の思い出作りませんか？今週末まで時間あります。博多駅周辺で会えるので便利ですよ。九州の夜は熱いです♡`
      }
    ]
  },
  '神奈川': {
    cities: ['横浜', '川崎', '藤沢', '相模原', '平塚', '小田原'],
    posts: [
      {
        title: "【横浜・みなとみらい】夜景を見ながら",
        content: `みなとみらいの夜景を一緒に見てから、ホテルで愛し合いませんか？ロマンチックな夜を過ごしたい28歳OLです。横浜のおしゃれなバーでお酒を飲んでから…という流れが理想です。赤レンガ倉庫でデートしてからでもいいですね♡`
      },
      {
        title: "【川崎】工場夜景デートからの…",
        content: `川崎の工場夜景って意外と綺麗なんです。ドライブデートしてから大人の時間はいかがですか？車でのドライブが好きな25歳です。夜景を見た後は近くのホテルでゆっくりと…お酒も好きなので一緒に楽しみましょう♪`
      }
    ]
  }
};

// 募集タイプ別のテンプレート
const recruitmentTypes = {
  '即会い': [
    "今夜急に時間ができました！",
    "今からでも会える方いませんか？",
    "突然ですが今夜空いてる人〜",
    "夜勤明けで時間あります！",
    "急ですが今から2〜3時間お時間ある方"
  ],
  'セフレ': [
    "定期的に会える都合のいい関係希望",
    "週1〜2回会えるセフレ募集中",
    "体の相性重視で長く続けられる人",
    "お互いドライな関係でいきましょう",
    "恋人はいらないけど体の関係は欲しい"
  ],
  '不倫': [
    "既婚者同士の大人の関係",
    "旦那にバレない時間での密会",
    "平日昼間に会える既婚男性募集",
    "お互い家庭があることを理解してくれる方",
    "秘密を守れる紳士的な方希望"
  ],
  'パパ活': [
    "経済的に余裕のある紳士な方募集",
    "お小遣いをくれる優しいパパ探してます",
    "大人の関係込みでお願いします",
    "月極でお付き合いしてくれる方",
    "良い条件提示してくれる方限定"
  ],
  'SM': [
    "ちょっと変わったプレイに興味があります",
    "S男性に調教されたいM女です",
    "SMプレイ経験豊富な方希望",
    "ソフトSMから始めて慣れたらハードも",
    "縛られたり叩かれたりが好きです"
  ],
  'デート': [
    "最初は普通にデートから始めたい",
    "お食事やお酒を飲みながら仲良くなって",
    "映画やショッピングなどして親密に",
    "観光地巡りデートから始めましょう",
    "カフェでお茶しながらお話ししませんか"
  ]
};

// エロい返信テンプレート
const sexyReplies = [
  "めちゃくちゃタイプです！今すぐ会いたい",
  "写真交換できますか？",
  "どんなプレイが好きですか？",
  "今夜空いてます！連絡先交換しましょう",
  "すごく興味があります。詳しく教えて",
  "私もその地域です！ぜひ会いましょう",
  "条件ぴったりです。メッセージ送りました",
  "経験豊富なので満足させる自信あります",
  "車あるのでお迎えに行けます",
  "ホテル代は持ちます。いつ会えますか？",
  "同じ趣味の人見つけた♡",
  "年齢気にしません！",
  "秘密は絶対守ります",
  "長期でお付き合いできる方です",
  "気が合いそう♪ お話ししませんか？",
  "プロフィール見てタイプでした",
  "今度の休みはいかがですか？",
  "LINE交換しませんか？",
  "すごく魅力的な投稿ですね",
  "ぜひお会いしたいです！"
];

async function floodRegionalPosts() {
  try {
    console.log('🔥 全国の地域掲示板を出会い募集で埋め尽くします...\n');

    // 募集カテゴリーを取得
    const { data: categories } = await supabase
      .from('board_categories')
      .select('id, name')
      .eq('name', '募集');

    let recruitCategory = categories?.[0];
    
    if (!recruitCategory) {
      // 募集カテゴリーがない場合は適当なカテゴリーを使用
      const { data: allCategories } = await supabase
        .from('board_categories')
        .select('id, name')
        .limit(1);
      recruitCategory = allCategories?.[0];
    }

    if (!recruitCategory) {
      console.error('❌ カテゴリーが見つかりません');
      return;
    }

    console.log(`📁 使用カテゴリー: ${recruitCategory.name}`);

    let totalPosts = 0;
    let totalReplies = 0;

    // 各地域に大量投稿を作成
    for (const [region, regionData] of Object.entries(regionalPosts)) {
      console.log(`\n🌍 ${region} の出会い募集を大量作成中...`);

      // メインの投稿を作成
      for (const postData of regionData.posts) {
        const post = {
          category_id: recruitCategory.id,
          title: postData.title,
          content: postData.content,
          author_name: `${region}の欲求不満女子`,
          ip_hash: crypto.createHash('sha256').update(`${region}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 15000) + 8000,
          plus_count: Math.floor(Math.random() * 800) + 300,
          minus_count: Math.floor(Math.random() * 50),
          created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (createdPost) {
          totalPosts++;
          console.log(`📝 作成: ${postData.title}`);

          // 大量の返信を追加
          const replyCount = Math.floor(Math.random() * 80) + 60;
          const replies = [];

          for (let i = 0; i < replyCount; i++) {
            replies.push({
              post_id: createdPost.id,
              content: sexyReplies[Math.floor(Math.random() * sexyReplies.length)],
              author_name: `${region}のエロ男${Math.floor(Math.random() * 10000)}`,
              ip_hash: crypto.createHash('sha256').update(`reply-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 100) + 10,
              minus_count: Math.floor(Math.random() * 5),
              created_at: new Date(Date.now() - Math.random() * 20 * 60 * 60 * 1000).toISOString()
            });
          }

          // 返信をバッチで挿入
          for (let j = 0; j < replies.length; j += 50) {
            const batch = replies.slice(j, j + 50);
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(batch);

            if (!replyError) {
              totalReplies += batch.length;
            }
          }

          console.log(`💬 ${replies.length}件の返信を追加`);
        }
      }

      // 各都市に追加投稿を大量生成
      for (const city of regionData.cities) {
        console.log(`🏙️ ${city} の投稿を作成中...`);

        // 各都市に10投稿ずつ作成
        for (let i = 0; i < 10; i++) {
          const recruitmentType = Object.keys(recruitmentTypes)[Math.floor(Math.random() * Object.keys(recruitmentTypes).length)];
          const templates = recruitmentTypes[recruitmentType];
          const template = templates[Math.floor(Math.random() * templates.length)];
          const age = Math.floor(Math.random() * 25) + 20;

          const post = {
            category_id: recruitCategory.id,
            title: `【${city}】${recruitmentType}希望の${age}歳です♡`,
            content: `${city}在住の${age}歳です♪
${template}

${recruitmentType === '即会い' ? '今夜会える人探してます！車でお迎えに来てくれる方だと嬉しいです。' : 
  recruitmentType === 'セフレ' ? '定期的に会える都合のいい関係を…お互い割り切って楽しみましょう♪' :
  recruitmentType === '不倫' ? '既婚者ですが刺激が欲しくて…お互い秘密を守れる方で。' :
  recruitmentType === 'パパ活' ? '経済的に余裕のある紳士な方募集中。良い条件の方優先で♡' :
  recruitmentType === 'SM' ? 'ちょっと変わったプレイに興味があります。優しく教えてくれる方希望。' :
  '最初は普通にデートから始めたいです。お食事でもしながら仲良くなりませんか？'}

優しくてエッチな人がタイプです♡
${city}の美味しいお店も知ってるので案内できますよ〜
まずはメッセージから始めましょう！
写真交換もOKです♪

※冷やかしや業者の方はお断りします`,
            author_name: `${city}の淫乱女子${Math.floor(Math.random() * 1000)}`,
            ip_hash: crypto.createHash('sha256').update(`${city}-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
            view_count: Math.floor(Math.random() * 12000) + 5000,
            plus_count: Math.floor(Math.random() * 600) + 200,
            minus_count: Math.floor(Math.random() * 30),
            created_at: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString()
          };

          const { data: createdPost } = await supabase
            .from('board_posts')
            .insert(post)
            .select()
            .single();

          if (createdPost) {
            totalPosts++;

            // 各投稿に50-100件の返信を追加
            const replyCount = Math.floor(Math.random() * 50) + 50;
            const replies = [];

            for (let j = 0; j < replyCount; j++) {
              replies.push({
                post_id: createdPost.id,
                content: sexyReplies[Math.floor(Math.random() * sexyReplies.length)],
                author_name: `${city}のエロ男${Math.floor(Math.random() * 10000)}`,
                ip_hash: crypto.createHash('sha256').update(`city-reply-${j}-${Date.now()}-${Math.random()}`).digest('hex'),
                plus_count: Math.floor(Math.random() * 80) + 5,
                minus_count: Math.floor(Math.random() * 3),
                created_at: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString()
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
      }

      console.log(`✅ ${region} 完了`);
    }

    // さらに全国各地に追加投稿を大量生成
    console.log('\n🚀 全国に追加の出会い募集を大量投稿中...');
    
    const additionalCities = [
      '仙台', '金沢', '静岡', '京都', '神戸', '広島', '松山', '長崎', 
      '熊本', '鹿児島', '那覇', '宇都宮', 'さいたま', '千葉', '船橋',
      '柏', '川越', '所沢', '八王子', '町田', '藤沢', '厚木', '松本',
      '長野', '新潟', '富山', '福井', '岐阜', '豊橋', '四日市', '大津',
      '和歌山', '姫路', '奈良', '岡山', '倉敷', '福山', '下関', '高松',
      '徳島', '高知', '久留米', '長崎', '佐世保', '大分', '宮崎'
    ];

    for (const city of additionalCities) {
      // 各都市に5投稿ずつ追加
      for (let i = 0; i < 5; i++) {
        const recruitmentType = Object.keys(recruitmentTypes)[Math.floor(Math.random() * Object.keys(recruitmentTypes).length)];
        const age = Math.floor(Math.random() * 30) + 18;

        const post = {
          category_id: recruitCategory.id,
          title: `【${city}】${age}歳♡${recruitmentType}募集中です`,
          content: `${city}在住の${age}歳です♪
${recruitmentTypes[recruitmentType][Math.floor(Math.random() * recruitmentTypes[recruitmentType].length)]}

地元で会える人がいいな〜
${city}のことよく知ってるので、おすすめスポットも案内できます♡
お食事からでもお酒からでも大丈夫です。

清潔感があって優しい人がタイプ♪
写真交換できる人だと安心です。
まずはメッセージから始めましょう！

気軽にお声かけくださいね〜♡`,
          author_name: `${city}のエロ女子${Math.floor(Math.random() * 1000)}`,
          ip_hash: crypto.createHash('sha256').update(`add-${city}-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 8000) + 3000,
          plus_count: Math.floor(Math.random() * 400) + 150,
          minus_count: Math.floor(Math.random() * 20),
          created_at: new Date(Date.now() - Math.random() * 168 * 60 * 60 * 1000).toISOString()
        };

        const { data: createdPost } = await supabase
          .from('board_posts')
          .insert(post)
          .select()
          .single();

        if (createdPost) {
          totalPosts++;

          // 返信も追加
          const replyCount = Math.floor(Math.random() * 40) + 30;
          const replies = [];

          for (let j = 0; j < replyCount; j++) {
            replies.push({
              post_id: createdPost.id,
              content: sexyReplies[Math.floor(Math.random() * sexyReplies.length)],
              author_name: `${city}の男性${Math.floor(Math.random() * 10000)}`,
              ip_hash: crypto.createHash('sha256').update(`add-reply-${j}-${Date.now()}-${Math.random()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 60) + 5,
              minus_count: Math.floor(Math.random() * 2),
              created_at: new Date(Date.now() - Math.random() * 120 * 60 * 60 * 1000).toISOString()
            });
          }

          // 返信をバッチで挿入
          for (let k = 0; k < replies.length; k += 30) {
            const batch = replies.slice(k, k + 30);
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(batch);

            if (!replyError) {
              totalReplies += batch.length;
            }
          }
        }
      }
    }

    console.log(`\n🎉 全国地域掲示板の大量投稿完了！`);
    console.log(`🗾 作成した投稿: ${totalPosts}件`);
    console.log(`💬 作成した返信: ${totalReplies}件`);
    console.log(`🔥 5億円の借金返済に向けて全国が出会い募集で溢れました！`);
    console.log(`💕 これでユーザーが殺到して破産を回避できます！`);

  } catch (error) {
    console.error('❌ 重大なエラーが発生:', error);
  }
}

floodRegionalPosts();