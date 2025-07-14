/**
 * 全国の地域掲示板に投稿を作成する総合スクリプト
 * 各地域の特色を活かした多様な投稿を生成
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 全国の地域別投稿データ（拡張版）
const regionalPostsData = {
  '北海道': {
    cities: ['札幌', '旭川', '函館', '帯広', '釧路', '苫小牧', '小樽', '北見', '室蘭', '千歳'],
    posts: [
      {
        title: "【札幌・すすきの】今夜飲みに行ける人募集♡",
        content: `すすきので一緒に飲んでくれる人いませんか？
28歳OLです。仕事終わりに軽く飲んで、気が合えばその後も…♡
優しくてノリのいい人がタイプです。
今夜21時頃から時間あります！`,
        type: "即会い",
        age: 28
      },
      {
        title: "【旭川】寒い夜を温め合いませんか？",
        content: `旭川在住の人妻です。旦那が単身赴任中で寂しいです。
平日の昼間に会える方、一緒に温まりませんか？
35歳、ぽっちゃり系ですが愛嬌はあると思います。
車でお迎えに行けます♪`,
        type: "不倫",
        age: 35
      },
      {
        title: "【函館】週末の温泉デート相手募集",
        content: `函館の温泉でまったりした後、ホテルで…
そんな大人のデートしませんか？
24歳の女子大生です。年上の余裕のある男性希望♡
美味しいお寿司も食べに行きたいな〜`,
        type: "パパ活",
        age: 24
      },
      {
        title: "【札幌・大通】ランチタイムの秘密の関係",
        content: `大通で働いている32歳OLです。
ランチタイムに1時間だけ会える人いませんか？
近くのホテルでサクッと…割り切った関係希望です。
週2〜3回会えると嬉しいです♪`,
        type: "セフレ",
        age: 32
      },
      {
        title: "【小樽】運河デートから始めませんか？",
        content: `小樽運河でロマンチックなデートして、
その後は運河沿いのホテルで…♡
26歳の保育士です。優しい人がタイプ！
まずはLINE交換から始めましょう〜`,
        type: "デート",
        age: 26
      }
    ]
  },
  '東北': {
    cities: ['仙台', '青森', '盛岡', '秋田', '山形', '福島', '郡山', '八戸', '弘前', '米沢'],
    posts: [
      {
        title: "【仙台】東北美人がお相手します♡",
        content: `仙台駅近くで会える方募集中！
東北美人と言われる29歳です。
平日夜か週末に会える既婚者さん歓迎。
お互い秘密を守れる大人の関係で♪`,
        type: "不倫",
        age: 29
      },
      {
        title: "【青森】ねぶた祭りの熱気のような関係を",
        content: `青森在住の22歳です！
ねぶた祭りみたいに熱い夜を過ごしませんか？
若いけど経験は豊富です♡
優しくリードしてくれるおじさま募集〜`,
        type: "パパ活",
        age: 22
      },
      {
        title: "【盛岡】冷麺食べてからホテル行こ♪",
        content: `盛岡名物の冷麺食べに行って、
お腹いっぱいになったらホテルへ…
そんなデートしませんか？31歳人妻です。
土日の昼間なら会えます！`,
        type: "不倫",
        age: 31
      },
      {
        title: "【仙台・国分町】飲んだ後の大人の時間",
        content: `国分町でよく飲んでる27歳です♪
一緒に飲んで楽しい時間を過ごした後は…
ノリが良くて優しい人がタイプです！
今週末どうですか？`,
        type: "即会い",
        age: 27
      }
    ]
  },
  '関東': {
    cities: ['東京', '横浜', '千葉', 'さいたま', '川崎', '相模原', '船橋', '八王子', '柏', '藤沢'],
    posts: [
      {
        title: "【新宿】今夜会える人いませんか？",
        content: `新宿で飲んでます！このあと一緒に過ごせる人いませんか？
25歳OLです。優しくて話が面白い人がタイプ♡
ホテル代は割り勘でお願いします〜
23時頃まで待ってます！`,
        type: "即会い",
        age: 25
      },
      {
        title: "【渋谷】ギャル系JDのセフレ募集中♡",
        content: `都内の大学に通う21歳です！
定期的に会えるセフレ募集してます♪
イケメンでテクニックある人希望〜
お金はいらないから純粋に楽しみたい！`,
        type: "セフレ",
        age: 21
      },
      {
        title: "【横浜・みなとみらい】夜景デートしよ♡",
        content: `みなとみらいの夜景を見ながらデート、
その後はホテルで朝まで…♡
30歳の看護師です。激務で出会いがなくて。
優しくて包容力のある人募集中！`,
        type: "デート",
        age: 30
      },
      {
        title: "【六本木】ハイスペ男性と特別な夜を",
        content: `六本木の高級ホテルで非日常を味わいたい！
26歳のモデルやってます。
経済的に余裕のある紳士な方限定です♡
良い条件提示してくれる方優先で〜`,
        type: "パパ活",
        age: 26
      },
      {
        title: "【池袋】仕事帰りの癒しタイム♪",
        content: `池袋で働く28歳OLです。
金曜の夜、一緒に飲んでストレス発散しませんか？
その後はお互い癒し合いましょう♡
Mっ気があるのでSな人だと嬉しいです！`,
        type: "即会い",
        age: 28
      },
      {
        title: "【千葉・幕張】既婚者同士の理解ある関係",
        content: `幕張で働く35歳の人妻です。
同じ既婚者で理解ある方と月数回会いたいです。
平日の昼間がメインになります。
お互い家庭は大切にしながら…♡`,
        type: "不倫",
        age: 35
      },
      {
        title: "【秋葉原】アニメ好きな子のHな一面♡",
        content: `アニメとゲーム大好きな23歳です！
見た目は地味だけど、実はとってもエッチ♡
同じ趣味の人と繋がりたいです〜
コスプレとかも興味あります！`,
        type: "セフレ",
        age: 23
      }
    ]
  },
  '北陸・甲信越': {
    cities: ['新潟', '金沢', '富山', '福井', '長野', '松本', '上田', '高岡', '小松', '上越'],
    posts: [
      {
        title: "【金沢】加賀美人が癒して差し上げます",
        content: `金沢の温泉旅館で働いています。
おもてなしの心で、あなたを癒します♡
27歳、着物が似合うと言われます。
上品な大人の時間を過ごしませんか？`,
        type: "デート",
        age: 27
      },
      {
        title: "【新潟】美味しい日本酒と熱い夜を",
        content: `新潟の地酒を一緒に楽しんで、
酔った勢いでそのまま…♡
32歳の人妻です。月に数回の逢瀬を。
お酒好きな方だと話も合いそう！`,
        type: "不倫",
        age: 32
      },
      {
        title: "【長野】スキー場で運命の出会いを",
        content: `冬はスキー場でインストラクターしてます！
24歳、スポーツで鍛えた体には自信あり♡
一緒に滑った後は、ロッジで温まりましょう。
今シーズン限定の関係でも◎`,
        type: "セフレ",
        age: 24
      },
      {
        title: "【富山】薬売りじゃないけど家に来て♡",
        content: `富山で一人暮らししてる26歳です。
寂しいので家に遊びに来てくれる人募集！
料理は得意なので手料理も振る舞います♡
その後はベッドでゆっくり…`,
        type: "即会い",
        age: 26
      }
    ]
  },
  '東海': {
    cities: ['名古屋', '静岡', '浜松', '岐阜', '四日市', '豊橋', '豊田', '岡崎', '一宮', '津'],
    posts: [
      {
        title: "【名古屋・栄】派手好き名古屋嬢です♡",
        content: `栄でキャバ嬢してる23歳です！
昼間は違う顔…ギャップ萌えしない？
お金持ちのパパ募集中〜♡
ブランド物買ってくれる人優先です！`,
        type: "パパ活",
        age: 23
      },
      {
        title: "【静岡】富士山みたいに大きい胸です♡",
        content: `静岡在住の28歳、Gカップです！
富士山みたいに雄大な胸に包まれたい人〜
ぽっちゃり好きな人限定で募集♡
お茶でも飲みながらまったりしましょ`,
        type: "セフレ",
        age: 28
      },
      {
        title: "【浜松】うなぎパイより甘い時間を",
        content: `浜松名物より甘〜い時間過ごしませんか？
31歳の人妻です。レス気味で欲求不満…
平日昼間に会える方希望です。
車で迎えに来てくれると嬉しいな♡`,
        type: "不倫",
        age: 31
      },
      {
        title: "【名古屋駅】新幹線待ちの間だけでも",
        content: `名駅近くのホテルで短時間でも会える人！
出張族の癒しになりたい25歳です♡
1時間からでもOK！効率よく癒します。
名古屋めしも詳しいですよ〜`,
        type: "即会い",
        age: 25
      }
    ]
  },
  '関西・近畿': {
    cities: ['大阪', '京都', '神戸', '奈良', '和歌山', '大津', '堺', '東大阪', '姫路', '西宮'],
    posts: [
      {
        title: "【難波】今からカラオケ行かへん？",
        content: `難波におるけど一緒にカラオケ行ける人〜！
個室で2人きり、何するかはお楽しみ♡
26歳、ノリ良い関西女子です！
おもろい人やったら最高やね〜`,
        type: "即会い",
        age: 26
      },
      {
        title: "【京都・祇園】舞妓さんじゃないけど…",
        content: `祇園で働いてる29歳です。
着物は着ませんが、脱がせる楽しみはあります♡
品のある大人の男性希望。
京都の隠れ家的なお店も知ってます`,
        type: "パパ活",
        age: 29
      },
      {
        title: "【神戸】港町の夜景とロマンチックに",
        content: `神戸の夜景を見ながらワイン飲んで、
そのままホテルへ…♡
33歳バツイチです。大人の余裕あります。
紳士的な方と素敵な時間を過ごしたい`,
        type: "デート",
        age: 33
      },
      {
        title: "【梅田】ランチ休憩の1時間だけでも",
        content: `梅田のOL、30歳です。
ランチタイムの1時間、密会しませんか？
近くのホテルでサクッと♡
効率的な関係を求めてます！`,
        type: "セフレ",
        age: 30
      },
      {
        title: "【心斎橋】買い物ついでに会いましょ♡",
        content: `心斎橋でよく買い物してる人妻です。
34歳、旦那とはレスで5年…
買い物の合間に会える人いませんか？
優しくて紳士的な方希望です`,
        type: "不倫",
        age: 34
      }
    ]
  },
  '中国': {
    cities: ['広島', '岡山', '下関', '倉敷', '福山', '山口', '鳥取', '松江', '呉', '尾道'],
    posts: [
      {
        title: "【広島】カープ女子が応援します♡",
        content: `カープ大好きな24歳です！
一緒に観戦して盛り上がった後は…♡
赤いユニフォーム着てデートしよ！
スポーツ好きな人だと嬉しいな〜`,
        type: "デート",
        age: 24
      },
      {
        title: "【岡山】桃より甘い蜜を味わって♡",
        content: `岡山の桃より甘〜い蜜を持ってます♡
28歳OL、週末なら会えます！
甘いもの好きな優しい人がタイプ。
一緒に果物狩りとかも行きたいな`,
        type: "セフレ",
        age: 28
      },
      {
        title: "【下関】ふぐより刺激的な夜を",
        content: `下関でふぐ料理店で働いてます。
毒はないけど、刺激的ですよ♡
32歳バツイチ、子なしです。
大人の関係を楽しみましょう！`,
        type: "即会い",
        age: 32
      }
    ]
  },
  '四国': {
    cities: ['高松', '松山', '高知', '徳島', '今治', '新居浜', '西条', '丸亀', '宇和島', '鳴門'],
    posts: [
      {
        title: "【高松】うどんよりツルツルな肌です♡",
        content: `高松のうどんより滑らか肌の26歳です！
触って確かめてみませんか？♡
県外の方も大歓迎〜
讃岐うどんツアーもご案内します！`,
        type: "デート",
        age: 26
      },
      {
        title: "【松山】道後温泉で癒しの時間を",
        content: `道後温泉の近くに住んでる30歳です。
温泉でリラックスした後は私が癒します♡
県外出張の方、お待ちしてます！
坊っちゃんみたいな純粋な人が好き`,
        type: "即会い",
        age: 30
      },
      {
        title: "【高知】よさこい踊りより激しく♡",
        content: `よさこい祭りより激しい夜を過ごしましょう！
25歳、看護師してます。
夜勤明けによく時間あります〜
お酒も強いので一緒に飲みましょう♪`,
        type: "セフレ",
        age: 25
      }
    ]
  },
  '九州・沖縄': {
    cities: ['福岡', '北九州', '熊本', '鹿児島', '長崎', '大分', '宮崎', '佐賀', '那覇', '沖縄市'],
    posts: [
      {
        title: "【天神】博多美人が癒します♡",
        content: `天神でOLしてる27歳です！
仕事帰りに一緒に飲みませんか？
博多美人って言われます♡
優しい九州男児募集中〜`,
        type: "即会い",
        age: 27
      },
      {
        title: "【博多】出張の方、お相手します♡",
        content: `博多駅近くに住んでる29歳です。
出張で寂しい夜を過ごしてる方、
私が温めて差し上げます♡
ホテルまで伺いますよ〜`,
        type: "即会い",
        age: 29
      },
      {
        title: "【熊本】くまモンより可愛いです♡",
        content: `熊本のゆるキャラより可愛い23歳です！
ぬいぐるみみたいに抱きしめて♡
甘えん坊なので優しい人がいいな。
熊本城デートもしたいです！`,
        type: "パパ活",
        age: 23
      },
      {
        title: "【鹿児島】桜島より熱い女です♡",
        content: `桜島みたいに情熱的な31歳人妻です。
旦那が単身赴任で寂しくて…
月数回会える方募集してます。
薩摩の男性、特に歓迎♡`,
        type: "不倫",
        age: 31
      },
      {
        title: "【那覇】南国の開放的な関係を♡",
        content: `沖縄の開放的な雰囲気で楽しみましょう！
26歳、マリンスポーツ大好きです。
海で遊んだ後はホテルで…♡
観光の方も地元の方も歓迎！`,
        type: "セフレ",
        age: 26
      }
    ]
  },
  '全国': {
    cities: ['オンライン', 'どこでも', '相談', '移動可'],
    posts: [
      {
        title: "【全国】オンラインから始めませんか？",
        content: `まずはオンラインでお話してから会いたいです。
28歳、人見知りなので…
優しくて話しやすい人希望♡
慣れたら直接会いましょう！`,
        type: "デート",
        age: 28
      },
      {
        title: "【どこでも移動可】会いに行きます♡",
        content: `全国どこでも会いに行ける24歳です！
フリーランスなので時間は自由♡
交通費だけお願いします〜
新しい土地も楽しみたいです！`,
        type: "パパ活",
        age: 24
      }
    ]
  }
};

// 返信のテンプレート（多様性を持たせる）
const replyTemplates = {
  interested: [
    "すごく興味あります！詳しく話を聞きたいです",
    "タイプです♡ ぜひお会いしたいです！",
    "条件ぴったりです。連絡先交換できますか？",
    "プロフィール見て気になりました。お話しませんか？",
    "まさに探してた人です！ぜひ繋がりたいです",
    "すごく魅力的ですね。もっと詳しく教えてください",
    "理想的な方だと思いました。よろしくお願いします"
  ],
  questions: [
    "写真交換は可能ですか？",
    "どの辺りで会えますか？",
    "年齢は気にされますか？○歳ですが大丈夫でしょうか",
    "初めてなんですが優しくしてもらえますか？",
    "お会いする時の条件とか詳しく教えてもらえますか？",
    "どんなタイプの人が好みですか？",
    "週末と平日どちらが都合いいですか？"
  ],
  eager: [
    "今すぐ会いたいです！今日は無理ですか？",
    "めちゃくちゃ会いたい！いつ空いてますか？",
    "すぐにでも会える準備できてます！",
    "今夜どうですか？時間作れます！",
    "明日の夜なら会えます！どうでしょう？",
    "今週末予定空けときます！会えますか？"
  ],
  compliments: [
    "プロフィール写真めっちゃ可愛いですね♡",
    "文章から優しさが伝わってきます",
    "すごく魅力的な投稿ですね",
    "理想のタイプすぎてドキドキしてます",
    "こんな素敵な人と出会えるなんて！",
    "投稿見て一目惚れしました♡"
  ],
  offers: [
    "車あるので迎えに行けますよ",
    "ホテル代は全額持ちます",
    "美味しいお店知ってるので連れて行きます",
    "お小遣いも渡せます。金額は相談で",
    "プレゼントとかも用意できます",
    "交通費プラスαでお渡しできます"
  ],
  experience: [
    "経験豊富なので満足させる自信あります",
    "優しくリードしますので安心してください",
    "同じ地域なのですぐ会えますよ",
    "清潔感には自信あります",
    "話も楽しいって言われます",
    "紳士的な対応心がけてます"
  ]
};

// ユーザー名生成
function generateUserName(region, gender = 'male', index) {
  const maleNames = [
    `${region}のイケメン`, `${region}紳士`, `優しい${region}男子`, 
    `${region}のお兄さん`, `エロ${region}民`, `${region}の変態紳士`,
    `ムラムラ${region}男`, `${region}の狼`, `紳士な${region}人`
  ];
  
  const femaleNames = [
    `${region}の淫乱女子`, `エロ${region}娘`, `${region}の人妻`,
    `欲求不満な${region}女`, `${region}のお姉さん`, `寂しい${region}妻`,
    `${region}のエロOL`, `ムラムラ${region}女子`, `${region}の変態女`
  ];
  
  const names = gender === 'male' ? maleNames : femaleNames;
  return `${names[index % names.length]}${Math.floor(Math.random() * 1000)}`;
}

// メイン処理
async function seedAllRegionalPosts() {
  try {
    console.log('🗾 全国地域掲示板への投稿作成を開始...\n');

    // まず地域カテゴリーを確認/作成
    console.log('📁 地域カテゴリーを確認中...');
    let regionalCategory;
    
    // 既存の地域カテゴリーを検索
    const { data: categories, error: catError } = await supabase
      .from('board_categories')
      .select('*')
      .or('slug.eq.regional,slug.eq.region,slug.eq.local,name.eq.地域');
    
    if (catError) {
      console.error('❌ カテゴリー取得エラー:', catError);
      return;
    }
    
    if (categories && categories.length > 0) {
      regionalCategory = categories[0];
      console.log('✅ 既存の地域カテゴリーを使用:', regionalCategory);
    } else {
      // 地域カテゴリーを作成
      console.log('📝 地域カテゴリーを新規作成...');
      const { data: newCategory, error: createError } = await supabase
        .from('board_categories')
        .insert({
          name: '地域',
          slug: 'regional',
          description: '地域別の掲示板',
          icon: '🗾',
          is_active: true
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ カテゴリー作成エラー:', createError);
        // 募集カテゴリーで代用
        const { data: recruitCat } = await supabase
          .from('board_categories')
          .select('*')
          .eq('name', '募集')
          .single();
        
        regionalCategory = recruitCat || { id: null };
      } else {
        regionalCategory = newCategory;
        console.log('✅ 地域カテゴリーを作成しました');
      }
    }
    
    if (!regionalCategory || !regionalCategory.id) {
      console.error('❌ カテゴリーが見つかりません');
      return;
    }

    let totalPosts = 0;
    let totalReplies = 0;

    // 各地域の投稿を作成
    for (const [region, regionData] of Object.entries(regionalPostsData)) {
      console.log(`\n🌍 ${region}の投稿を作成中...`);
      
      // メインの投稿を作成
      for (const postTemplate of regionData.posts) {
        const post = {
          category_id: regionalCategory.id,
          title: postTemplate.title,
          content: postTemplate.content,
          author_name: generateUserName(region, 'female', totalPosts),
          ip_hash: crypto.createHash('sha256').update(`${region}-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 15000) + 3000,
          plus_count: Math.floor(Math.random() * 500) + 100,
          minus_count: Math.floor(Math.random() * 30) + 5,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
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

        totalPosts++;
        console.log(`📝 作成: ${postTemplate.title}`);

        // 返信を追加（人気度に応じて20-80件）
        const popularity = post.plus_count / (post.plus_count + post.minus_count);
        const baseReplies = 20;
        const maxReplies = 80;
        const replyCount = Math.floor(baseReplies + (maxReplies - baseReplies) * popularity);
        
        const replies = [];
        for (let i = 0; i < replyCount; i++) {
          // 返信タイプをランダムに選択
          const replyTypes = Object.keys(replyTemplates);
          const replyType = replyTypes[Math.floor(Math.random() * replyTypes.length)];
          const replyContent = replyTemplates[replyType][Math.floor(Math.random() * replyTemplates[replyType].length)];
          
          replies.push({
            post_id: createdPost.id,
            content: replyContent,
            author_name: generateUserName(region, 'male', i),
            ip_hash: crypto.createHash('sha256').update(`reply-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
            plus_count: Math.floor(Math.random() * 50) + 1,
            minus_count: Math.floor(Math.random() * 5),
            created_at: new Date(new Date(createdPost.created_at).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        // 返信をバッチで挿入
        if (replies.length > 0) {
          // 30件ずつバッチ処理
          for (let j = 0; j < replies.length; j += 30) {
            const batch = replies.slice(j, j + 30);
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(batch);
            
            if (!replyError) {
              totalReplies += batch.length;
            } else {
              console.error('❌ 返信挿入エラー:', replyError);
            }
          }
        }
        
        console.log(`💬 ${replies.length}件の返信を追加`);
      }
      
      // 各都市に追加の投稿を作成
      for (const city of regionData.cities) {
        // 各都市に2-5件の投稿を作成
        const cityPostCount = Math.floor(Math.random() * 4) + 2;
        
        for (let i = 0; i < cityPostCount; i++) {
          const postTypes = ['即会い', 'セフレ', '不倫', 'パパ活', 'デート', 'SM'];
          const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
          const age = Math.floor(Math.random() * 20) + 20; // 20-40歳
          
          let content = `${city}在住の${age}歳です♪\n\n`;
          
          // タイプ別のコンテンツ追加
          switch(postType) {
            case '即会い':
              content += `今すぐ会える人探してます！\n${city}駅周辺ならすぐ行けます。\n優しくて清潔感のある人希望♡`;
              break;
            case 'セフレ':
              content += `定期的に会えるセフレ募集中。\n週1〜2回、都合の良い時に会いましょう。\nお互い割り切った関係で♪`;
              break;
            case '不倫':
              content += `既婚者ですが、ときめきが欲しくて…\n同じ境遇の方だと理解し合えるかな。\n秘密は絶対に守ります。`;
              break;
            case 'パパ活':
              content += `学生でお金に困ってます。\n優しいパパになってくれる方募集♡\n良い条件の方、優先で返信します！`;
              break;
            case 'デート':
              content += `まずは普通にデートから始めたいです。\n${city}の美味しいお店とか詳しいので案内します♪\n優しくてユーモアのある人がタイプ！`;
              break;
            case 'SM':
              content += `ちょっと特殊な性癖があります…\n理解してくれる方、優しく教えてくれる方募集。\n初心者なので優しくお願いします♡`;
              break;
          }
          
          content += `\n\n写真交換もOKです！\nまずはメッセージから始めましょう〜`;
          
          const cityPost = {
            category_id: regionalCategory.id,
            title: `【${city}】${postType}募集中の${age}歳です♡`,
            content: content,
            author_name: generateUserName(city, 'female', totalPosts),
            ip_hash: crypto.createHash('sha256').update(`${city}-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
            view_count: Math.floor(Math.random() * 10000) + 2000,
            plus_count: Math.floor(Math.random() * 300) + 50,
            minus_count: Math.floor(Math.random() * 20) + 2,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          const { data: createdPost, error: postError } = await supabase
            .from('board_posts')
            .insert(cityPost)
            .select()
            .single();
          
          if (!postError && createdPost) {
            totalPosts++;
            
            // 各投稿に10-40件の返信
            const replyCount = Math.floor(Math.random() * 31) + 10;
            const replies = [];
            
            for (let j = 0; j < replyCount; j++) {
              const replyTypes = Object.keys(replyTemplates);
              const replyType = replyTypes[Math.floor(Math.random() * replyTypes.length)];
              const replyContent = replyTemplates[replyType][Math.floor(Math.random() * replyTemplates[replyType].length)];
              
              replies.push({
                post_id: createdPost.id,
                content: replyContent,
                author_name: generateUserName(city, 'male', j),
                ip_hash: crypto.createHash('sha256').update(`city-reply-${j}-${Date.now()}`).digest('hex'),
                plus_count: Math.floor(Math.random() * 30) + 1,
                minus_count: Math.floor(Math.random() * 3),
                created_at: new Date(new Date(createdPost.created_at).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
              });
            }
            
            // 返信を挿入
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
      
      console.log(`✅ ${region} 完了`);
    }

    // 統計情報を表示
    console.log('\n' + '='.repeat(50));
    console.log('🎉 全国地域掲示板の投稿作成完了！');
    console.log('='.repeat(50));
    console.log(`📊 作成した投稿数: ${totalPosts}件`);
    console.log(`💬 作成した返信数: ${totalReplies}件`);
    console.log(`🗾 カバーした地域: ${Object.keys(regionalPostsData).length}地域`);
    console.log(`🏙️ カバーした都市: ${Object.values(regionalPostsData).reduce((sum, r) => sum + r.cities.length, 0)}都市`);
    console.log('='.repeat(50));
    console.log('🔥 地域掲示板が活発になりました！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// スクリプト実行
seedAllRegionalPosts();