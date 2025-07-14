/**
 * さらに盛り上がるホットなスレッドを追加
 * 日本一のアダルト掲示板を完成させる
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// より多様な投稿者名
const getVariedAuthor = () => {
  const types = [
    // 年齢・職業系
    ['JD', 'OL', '専門学生', '大学院生', 'フリーター', '派遣社員', '看護師', '保育士', '教師', '公務員'],
    ['18歳', '19歳', '20歳', '22歳', '24歳', '27歳', '29歳', '31歳', '34歳', '37歳'],
    
    // 特徴系
    ['巨乳', '美乳', 'スレンダー', 'モデル体型', 'ぽっちゃり', 'グラマー', '童顔', '清楚系', 'ギャル', '地味子'],
    ['ドM', 'ドS', '淫乱', 'むっつり', '処女', '非処女', 'ヤリマン', '経験少', 'テクニシャン', '素人'],
    
    // 状況系
    ['彼氏持ち', '彼氏なし', 'セフレ募集', '欲求不満', '性欲強め', 'オナ中毒', 'SEX依存', '寂しがり', '刺激欲しい', '変態願望'],
    
    // 地域系
    ['東京', '大阪', '名古屋', '福岡', '札幌', '仙台', '横浜', '神戸', '京都', '広島']
  ];
  
  const parts = [];
  // ランダムに2-3個の要素を組み合わせる
  const numParts = Math.floor(Math.random() * 2) + 2;
  for (let i = 0; i < numParts; i++) {
    const typeIndex = Math.floor(Math.random() * types.length);
    const type = types[typeIndex];
    parts.push(type[Math.floor(Math.random() * type.length)]);
  }
  
  return parts.join('・');
};

// ホットなスレッド
const hotThreads = [
  // 若い女性の告白系
  {
    title: '【閲覧注意】パパ活で月100万稼いでる女子大生だけど質問ある？',
    content: `都内の大学3年生です。
パパ活始めて1年で、今は月100万以上稼いでます。

親には内緒だけど、学費も生活費も全部自分で払ってる。
最初は抵抗あったけど、今は割り切ってます。

何でも聞いてください。`,
    category: 'questions',
    isHot: true
  },
  {
    title: '【体験談】初体験が3Pだった私の話',
    content: `18歳の時、初体験が彼氏とその友達との3Pでした。
今思えばとんでもないことだったけど...

詳しく話すとヤバいかもだけど、聞きたい人いる？
あの時の興奮は今でも忘れられない。`,
    category: 'confession',
    isHot: true
  },
  {
    title: '風俗で働いてるけど、客の9割が既婚者な件',
    content: `都内の高級デリヘルで働いてます。
お客さんの9割以上が既婚者で、奥さんの愚痴ばかり聞かされる。

でも指名も多いし、月収200万超えてるから辞められない。
同業の子いたら情報交換しない？`,
    category: 'general',
    isHot: true
  },

  // 過激な体験系
  {
    title: '【ガチ】彼氏に内緒で50人斬り達成しました',
    content: `付き合って2年の彼氏がいるけど、
裏では出会い系で遊びまくってて、ついに50人突破。

彼氏とのHじゃ物足りなくて...
バレたら終わりだけど、止められない。

みんなは浮気経験どれくらい？`,
    category: 'confession',
    isHot: true
  },
  {
    title: '露出癖が止まらない...公園でオナニーしちゃった',
    content: `最近露出癖がエスカレートしてて、
昨日ついに深夜の公園でオナニーしてしまいました。

誰かに見られたらと思うと興奮して...
同じような性癖の人いませんか？`,
    category: 'confession',
    isHot: true
  },

  // 不倫・浮気系
  {
    title: '【修羅場】旦那の浮気相手が実は私の親友だった',
    content: `先週、旦那の浮気が発覚。
相手を調べたら、なんと私の親友でした。

2人でよく遊んでたのに、裏では...
復讐したいけど、どうすればいい？`,
    category: 'questions',
    isHot: true
  },
  {
    title: '会社の新入社員（22歳）に告白されて不倫中',
    content: `35歳既婚OLです。
今年入った新入社員に告白されて、断れずに関係を持ってしまいました。

若い体力についていけないけど、久しぶりの恋愛感情に...
このまま続けていいのか悩んでます。`,
    category: 'confession',
    isHot: true
  },

  // 性癖・フェチ系
  {
    title: '【変態】使用済み下着を売って月30万稼いでる',
    content: `タイトル通りです。
使用済みの下着を売るビジネス始めて3ヶ月。

リピーターも増えて、今では月30万以上の収入に。
需要があるから供給してるだけだけど、これって変？`,
    category: 'general',
    isHot: true
  },
  {
    title: 'アナル開発されてから普通のSEXじゃイケなくなった',
    content: `元カレにアナル開発されてから、
普通の挿入じゃ全然イケなくなってしまいました。

新しい彼氏には言えないし...
同じ悩みの人いませんか？`,
    category: 'questions',
    isHot: true
  },

  // SNS・ネット系
  {
    title: '【実話】Twitterのエロ垢で1万フォロワー達成',
    content: `自撮りのエロ写真上げてたら1万フォロワー超えました。
顔は出してないけど、DMがすごいことに...

オフパコの誘いも多いけど、会ったことある人いる？
収益化も考えてるんだけど。`,
    category: 'general',
    isHot: true
  },
  {
    title: 'OnlyFansで月収100万超えたけど質問ある？',
    content: `25歳OLです。副業でOnlyFans始めて半年。
今では本業より稼いでます。

顔出しはしてないけど、それでもこれだけ稼げるとは...
興味ある人に始め方教えます。`,
    category: 'questions',
    isHot: true
  },

  // 学生・若者系
  {
    title: '【ヤバい】大学のサークルが実質乱交サークルだった',
    content: `普通のテニサーだと思って入ったら...
合宿とか飲み会の後は必ず乱交パーティー。

最初は引いたけど、今では積極的に参加してる自分がいる。
こんなサークル他にもある？`,
    category: 'confession',
    isHot: true
  },
  {
    title: '塾講師やってるけど、生徒の母親3人と関係持ってる',
    content: `個別指導塾でバイトしてる大学生です。
生徒の母親から誘われて、気づいたら3人と...

面談の時とか気まずいけど、相手から誘ってくるから断れない。
これってヤバい？`,
    category: 'confession',
    isHot: true
  },

  // 特殊プレイ系
  {
    title: '【募集】一緒に野外露出してくれる女性いませんか？',
    content: `30代男性です。野外露出が趣味で、
一緒に楽しんでくれる女性を探してます。

経験者優遇。初心者でも優しく教えます。
都内で活動してます。興味ある方はレスください。`,
    category: 'general',
    isHot: false
  },
  {
    title: 'SMホテルのバイト始めたら性癖歪んだ',
    content: `清掃バイトのつもりで入ったSMホテル。
毎日すごい光景を目にして、自分の性癖も変わってきた...

普通のSEXじゃ物足りなくなってきた。
同じような経験ある人いる？`,
    category: 'general',
    isHot: true
  }
];

// よりリアルな返信
const getEngagingReplies = () => {
  return [
    // 驚き・興味
    'マジかよ！詳細kwsk',
    'これはヤバい...続き気になる',
    'えっ、それでどうなったの？',
    '嘘だろ？証拠ある？',
    'すげぇ...俺には無理だわ',
    
    // 共感・経験談
    '私も似たような経験ある！',
    'わかる〜！私もそう',
    '俺も実は...',
    '経験者から言わせてもらうと',
    'あるあるｗ',
    
    // 質問・詳細希望
    'どこでやったの？',
    '相手はどんな人？',
    'バレたことない？',
    'もっと詳しく教えて',
    '写真とかある？',
    
    // 興奮・賞賛
    'エロすぎるだろ...',
    '勃起した',
    '濡れた...',
    'ヤバい、興奮する',
    '最高じゃん',
    
    // アドバイス・警告
    '気をつけた方がいいよ',
    'それは危険すぎる',
    'バレたら終わりだぞ',
    '程々にな',
    '身バレ注意',
    
    // 煽り・ツッコミ
    '嘘松乙',
    'はいはい妄想妄想',
    'で？',
    'それで？',
    '童貞の妄想かな？',
    
    // 依頼・誘い
    '俺ともやろうぜ',
    '今度一緒にどう？',
    'LINE交換しない？',
    '会える？',
    'DM送った'
  ];
};

async function addMoreHotThreads() {
  console.log('🔥 さらにホットなスレッド追加開始...');
  console.log('🏆 日本一のアダルト掲示板を目指して！');
  
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
    const replies = getEngagingReplies();
    
    for (const thread of hotThreads) {
      const category = categories.find(cat => cat.slug === thread.category);
      
      if (!category) {
        console.log(`⚠️  カテゴリー '${thread.category}' が見つかりません`);
        continue;
      }
      
      // 投稿を作成
      const viewCount = thread.isHot 
        ? Math.floor(Math.random() * 100000) + 50000  // 人気投稿は5万〜15万ビュー
        : Math.floor(Math.random() * 30000) + 5000;   // 通常投稿は5千〜3.5万ビュー
      
      const { data: post, error: postError } = await supabase
        .from('board_posts')
        .insert({
          category_id: category.id,
          title: thread.title,
          content: thread.content,
          author_name: getVariedAuthor(),
          author_email: `user${Math.floor(Math.random() * 100000)}@example.com`,
          view_count: viewCount,
          plus_count: Math.floor(viewCount / 50) + Math.floor(Math.random() * 200),
          minus_count: Math.floor(Math.random() * 30)
        })
        .select()
        .single();
      
      if (postError) {
        console.error(`❌ スレッド作成エラー:`, postError.message);
        continue;
      }
      
      console.log(`✅ "${thread.title}" を作成`);
      totalCreated++;
      
      // 人気投稿には多めの返信を追加
      const replyCount = thread.isHot 
        ? Math.floor(Math.random() * 50) + 50   // 人気投稿は50〜100返信
        : Math.floor(Math.random() * 30) + 10;  // 通常投稿は10〜40返信
      
      for (let i = 0; i < replyCount; i++) {
        const replyContent = replies[Math.floor(Math.random() * replies.length)];
        
        const { error: replyError } = await supabase
          .from('board_replies')
          .insert({
            post_id: post.id,
            author_name: getVariedAuthor(),
            content: replyContent,
            plus_count: Math.floor(Math.random() * 100),
            minus_count: Math.floor(Math.random() * 20)
          });
        
        if (replyError) {
          console.error(`❌ 返信作成エラー:`, replyError.message);
        }
      }
    }
    
    console.log(`\n🎉 合計 ${totalCreated} 個のホットなスレッドを作成しました！`);
    console.log('🏆 日本一のアダルト掲示板への道、着実に前進中！');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// スクリプト実行
addMoreHotThreads();