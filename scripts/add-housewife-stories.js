/**
 * 主婦・人妻の秘密の体験談を追加するスクリプト
 * 日本一のアダルト掲示板を目指して盛り上げる
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// リアルな投稿者名
const getHousewifeAuthor = () => {
  const names = [
    '人妻A子', '秘密主婦', '昼顔妻', '欲求不満妻', '新婚妻',
    '三十路妻', '四十路妻', 'セレブ妻', '団地妻', 'パート妻',
    '専業主婦', '兼業主婦', '若妻', '熟女妻', 'エロ妻',
    '淫乱妻', '清楚妻', '美人妻', 'ぽっちゃり妻', '巨乳妻'
  ];
  const ages = ['26歳', '28歳', '32歳', '35歳', '38歳', '40歳', '42歳', '45歳'];
  const locations = ['東京', '大阪', '名古屋', '福岡', '札幌', '横浜', '神戸', '京都'];
  
  const name = names[Math.floor(Math.random() * names.length)];
  const age = ages[Math.floor(Math.random() * ages.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  
  return Math.random() > 0.5 ? `${name}（${age}）` : `${location}の${name}`;
};

// 主婦・人妻の体験談スレッド
const housewifeStories = [
  // 不倫・浮気系
  {
    title: '【衝撃】旦那の部下と関係を持ってしまいました...',
    content: `結婚5年目の32歳主婦です。
先月、旦那の会社の飲み会に参加した時、旦那の部下（27歳）と意気投合してしまい...
その後、何度か2人で会うようになってしまいました。

罪悪感はありますが、久しぶりに女として見られて嬉しくて...
同じような経験ある方いますか？`,
    category: 'confession',
    isHot: true
  },
  {
    title: '【秘密】子供の習い事の先生と...',
    content: `35歳、子供2人の母親です。
息子のスイミングスクールのコーチ（25歳）がイケメンで、
最初は目の保養程度だったんですが、個人レッスンをお願いしてから関係が...

若い体に夢中になってしまいました。
このままではいけないと分かっているのに止められません。`,
    category: 'confession',
    isHot: true
  },
  {
    title: '【告白】ママ友の旦那と不倫してます',
    content: `同じマンションのママ友の旦那さんと不倫関係になって半年。
最初は相談に乗ってもらっているだけだったのに...

ママ友には申し訳ないけど、彼との時間が楽しくて。
バレたら終わりだと分かっているけど...`,
    category: 'confession',
    isHot: true
  },

  // セックスレス系
  {
    title: '【相談】レス10年...性欲が爆発しそうです',
    content: `40歳主婦です。旦那とは10年以上レスです。
最近、性欲が強くなってきて自分でも驚いています。

アダルトグッズを買ったり、出会い系サイトを見たり...
このままだと一線を越えてしまいそうで怖いです。

同じような悩みを持つ方、どうやって解消していますか？`,
    category: 'questions',
    isHot: true
  },
  {
    title: '昼間の情事にハマってしまった主婦です',
    content: `38歳、レス5年の主婦です。
先月、マッチングアプリで知り合った男性と昼間に会うようになりました。

平日の昼間、旦那も子供もいない時間...
久しぶりの快感に溺れています。

もう普通の主婦には戻れないかも...`,
    category: 'confession',
    isHot: true
  },

  // 性癖・願望系
  {
    title: '【本音】実は変態願望がある主婦の集い',
    content: `普段は普通の主婦を演じていますが、実は変態的な願望があります。

・複数の男性に...
・野外で...
・拘束されて...

表向きは清楚な主婦なので誰にも言えません。
同じような秘密を持つ方いませんか？`,
    category: 'general',
    isHot: true
  },
  {
    title: '旦那には言えない性癖があります',
    content: `30歳の新婚妻です。
実はMな性癖があるのですが、優しい旦那には言えません。

独身時代はSMクラブに通っていました。
結婚してから封印していますが、最近また行きたくて...

同じような悩みの方いますか？`,
    category: 'questions',
    isHot: true
  },

  // パート先・職場系
  {
    title: '【体験談】パート先の店長と倉庫で...',
    content: `42歳のパート主婦です。
スーパーでパートをしているのですが、若い店長（28歳）に迫られて...

最初は断っていたのですが、褒められて舞い上がってしまい、
ついに倉庫で関係を持ってしまいました。

それ以来、仕事中もドキドキして...`,
    category: 'confession',
    isHot: true
  },
  {
    title: 'コンビニバイトで大学生と...',
    content: `35歳主婦です。深夜のコンビニバイトを始めたら、
一緒に働く大学生（20歳）がめちゃくちゃタイプで...

ある日、彼から告白されて断れませんでした。
15歳も年下なのに、体の相性が良すぎて...`,
    category: 'confession',
    isHot: true
  },

  // 近所・ご近所系
  {
    title: '【危険】隣の旦那さんと...',
    content: `マンションの隣に住む夫婦の旦那さんと関係を持ってしまいました。
エレベーターで2人きりになった時に...

お互い既婚者なのに止められません。
いつバレるか不安ですが、スリルがたまらなくて...`,
    category: 'confession',
    isHot: true
  },
  {
    title: '町内会の集まりがきっかけで',
    content: `38歳主婦です。町内会の役員をしているのですが、
一緒に役員をしている男性（45歳）と急接近...

打ち合わせと称して2人で会うようになり、
先週ついにホテルに行ってしまいました。`,
    category: 'confession',
    isHot: true
  },

  // 出会い系・ネット系
  {
    title: '【報告】出会い系で会った人数が50人超えました',
    content: `36歳の主婦です。レスが原因で出会い系を始めて2年。
ついに会った人数が50人を超えました。

最初は罪悪感でいっぱいでしたが、
今では新しい出会いが楽しみで仕方ありません。

私みたいな主婦、他にもいますか？`,
    category: 'general',
    isHot: true
  },
  {
    title: 'Twitter裏垢で繋がった人と',
    content: `Twitter裏垢で知り合った年下男性と会ってきました。
DMでのやり取りがエロすぎて、会う前から濡れてました。

実際会ったら想像以上にタイプで...
詳細聞きたい人いる？`,
    category: 'confession',
    isHot: true
  },

  // 願望・妄想系
  {
    title: '【妄想】若い男の子に襲われたい',
    content: `40歳主婦の妄想です。
息子の友達（大学生）がよく家に遊びに来るのですが、
その中の1人がすごくタイプで...

彼に押し倒されたらどうしよう...なんて妄想してしまいます。
実際にはありえないけど、考えるだけで...`,
    category: 'general',
    isHot: true
  },
  {
    title: '複数プレイへの憧れ',
    content: `32歳主婦です。AVでよく見る複数プレイに憧れています。
旦那1人じゃ物足りなくて...

2人以上の男性に責められたい。
こんな願望、おかしいでしょうか？`,
    category: 'questions',
    isHot: false
  },

  // リアル体験系
  {
    title: '【実話】義父に手を出されて...',
    content: `同居している義父（60歳）に手を出されました。
最初は嫌だったのですが、旦那とレスだったこともあり...

今では義父との関係が楽しみになってしまいました。
最低だと分かっていますが...`,
    category: 'confession',
    isHot: true
  },
  {
    title: 'デリバリーの配達員と',
    content: `ウーバーの配達員がイケメンで、つい誘ってしまいました。
最初は冗談のつもりだったのに、向こうもその気になって...

玄関先でキスして、そのまま...
また同じ人に配達してもらいたい。`,
    category: 'confession',
    isHot: true
  },

  // 性生活改善系
  {
    title: '【相談】40代でも性欲は衰えない？',
    content: `43歳主婦です。40代になってから逆に性欲が強くなりました。
旦那は淡白で相手にしてくれません。

オナニーの回数も増えて、1日3回することも...
更年期の影響？それとも私だけ？`,
    category: 'questions',
    isHot: false
  },
  {
    title: 'アダルトグッズにハマった主婦',
    content: `レス解消のために買ったバイブにハマってしまいました。
最初は抵抗があったけど、今では手放せません。

最近はもっと刺激的なグッズが欲しくて...
おすすめありますか？`,
    category: 'general',
    isHot: false
  },

  // 過激系
  {
    title: '【過激】野外プレイにハマってます',
    content: `35歳主婦です。最近、野外プレイの快感を知ってしまいました。
人に見られるかもしれないスリルがたまらなくて...

公園、駐車場、ビルの屋上...
どんどんエスカレートしていく自分が怖い。`,
    category: 'confession',
    isHot: true
  },
  {
    title: '3Pを経験してしまいました',
    content: `出会い系で知り合った2人の男性と3Pしてきました。
人生初の経験で、最初は怖かったけど...

想像以上に気持ちよくて、また経験したいと思ってしまいます。
私、変態でしょうか？`,
    category: 'confession',
    isHot: true
  }
];

// リアルな返信を生成
const getRealisticReplies = (threadType) => {
  const supportiveReplies = [
    'わかります！私も同じような経験があります。',
    'お気持ちよくわかります。私もレスで悩んでます...',
    '勇気を出して書いてくれてありがとう。私だけじゃなかった。',
    '35歳主婦です。すごく共感しました。',
    '私も似たような状況です。お互い頑張りましょう。',
    'よくぞ言ってくれました！私も実は...'
  ];

  const curiousReplies = [
    'もっと詳しく聞きたいです！',
    '続きが気になります...',
    'えっ、それでどうなったんですか？',
    'すごい...詳細希望です',
    'ドキドキしながら読みました',
    '私も経験してみたい...'
  ];

  const excitedReplies = [
    'エロすぎる！！',
    'めちゃくちゃ興奮しました',
    '読んでて濡れちゃった...',
    'これは熱い展開',
    'もっと聞きたい！続き希望！',
    'ヤバい、想像しちゃう'
  ];

  const adviceReplies = [
    'バレないように気をつけてくださいね',
    'お互い既婚者なら慎重に...',
    '幸せならいいと思います',
    '自分の人生なんだから楽しんで',
    '後悔しないようにね',
    '一度きりの人生だもん'
  ];

  const allReplies = [...supportiveReplies, ...curiousReplies, ...excitedReplies, ...adviceReplies];
  return allReplies;
};

async function addHousewifeStories() {
  console.log('💋 主婦・人妻の体験談追加開始...');
  console.log('🔥 日本一のアダルト掲示板を目指して！');
  
  try {
    // カテゴリーを取得
    const { data: categories, error: catError } = await supabase
      .from('board_categories')
      .select('id, slug, name');
    
    if (catError) {
      console.error('❌ カテゴリー取得エラー:', catError);
      return;
    }
    
    let totalCreated = 0;
    const possibleReplies = getRealisticReplies();
    
    for (const story of housewifeStories) {
      const category = categories.find(cat => cat.slug === story.category);
      
      if (!category) {
        console.log(`⚠️  カテゴリー '${story.category}' が見つかりません`);
        continue;
      }
      
      // 投稿を作成
      const viewCount = story.isHot 
        ? Math.floor(Math.random() * 50000) + 10000  // 人気投稿は1万〜6万ビュー
        : Math.floor(Math.random() * 10000) + 1000;  // 通常投稿は1千〜1万ビュー
      
      const { data: post, error: postError } = await supabase
        .from('board_posts')
        .insert({
          category_id: category.id,
          title: story.title,
          content: story.content,
          author_name: getHousewifeAuthor(),
          author_email: `wife${Math.floor(Math.random() * 10000)}@example.com`,
          view_count: viewCount,
          plus_count: Math.floor(viewCount / 100) + Math.floor(Math.random() * 100),
          minus_count: Math.floor(Math.random() * 20)
        })
        .select()
        .single();
      
      if (postError) {
        console.error(`❌ スレッド作成エラー:`, postError.message);
        continue;
      }
      
      console.log(`✅ "${story.title}" を作成`);
      totalCreated++;
      
      // 人気投稿には多めの返信を追加
      const replyCount = story.isHot 
        ? Math.floor(Math.random() * 30) + 20  // 人気投稿は20〜50返信
        : Math.floor(Math.random() * 15) + 5;   // 通常投稿は5〜20返信
      
      for (let i = 0; i < replyCount; i++) {
        const replyContent = possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
        const isHousewifeReply = Math.random() > 0.3; // 70%の確率で主婦からの返信
        
        const { error: replyError } = await supabase
          .from('board_replies')
          .insert({
            post_id: post.id,
            author_name: isHousewifeReply ? getHousewifeAuthor() : getRandomAuthor(),
            content: replyContent,
            plus_count: Math.floor(Math.random() * 50),
            minus_count: Math.floor(Math.random() * 10)
          });
        
        if (replyError) {
          console.error(`❌ 返信作成エラー:`, replyError.message);
        }
      }
    }
    
    console.log(`\n🎉 合計 ${totalCreated} 個の主婦体験談を作成しました！`);
    console.log('🔥 日本一のアダルト掲示板への第一歩！');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// ランダムな投稿者名（一般用）
function getRandomAuthor() {
  const names = [
    '名無しさん', 'エロ好き男', '興味津々', '覗き見野郎', 'ムラムラ君',
    '変態紳士', '童貞', '素人童貞', 'ヤリチン', '経験者',
    '既婚者', 'バツイチ', '独身貴族', '会社員', 'フリーター'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

// スクリプト実行
addHousewifeStories();