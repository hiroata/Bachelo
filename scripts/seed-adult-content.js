const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// より過激でリアルな投稿タイトル
const explicitTitles = [
  "【人妻28歳】旦那とのセックスじゃ満足できなくて…",
  "【巨乳OL】会社のトイレでオナニーが日課です",
  "【ドM女子大生】縛られて犯されたい願望が止まらない",
  "【熟女45歳】若い男の子に調教されたい",
  "【淫乱妻】不倫相手と車内で激しく…",
  "【変態主婦】露出プレイにハマってしまいました",
  "【性欲モンスター】1日5回はオナニーしないと我慢できない",
  "【寝取られ願望】旦那の前で他の男に抱かれたい",
  "【アナル開発済み】お尻でイケる体になりました",
  "【潮吹き体質】ベッドがびしょ濡れになるまで…",
  "【複数プレイ経験】3人の男性に囲まれて…",
  "【野外露出】公園で全裸になった体験談",
  "【電話セックス】声だけで濡れてしまう私",
  "【オナ電募集】一緒にイキたい人いませんか？",
  "【即ハメOK】今すぐ会える人限定",
  "【中出し願望】生で奥まで注がれたい",
  "【フェラ大好き】咥えている時が一番幸せ",
  "【パイズリ自慢】Gカップで挟んであげる",
  "【騎乗位マニア】上で腰を振るのが大好き",
  "【バイブ収集】おもちゃのレビューします"
];

// より詳細でエロティックな投稿内容
const explicitContents = [
  `こんばんは…人妻の{name}です。
結婚して5年、旦那とは月1回あるかないかで、もう我慢の限界です。

最近、会社の年下の男の子（22歳）のことを考えながら、毎晩ひとりでしています。
彼の引き締まった体を想像しながら、指を入れて…クリトリスを擦りながら…
「あぁ…もっと奥まで…」って声が漏れちゃいます。

バイブも買いました。初めて使った時、あまりの気持ちよさに潮を吹いてしまって…
シーツがびしょびしょになるまでイキ続けました。

誰か私の寂しい体を満たしてくれる人いませんか？
できれば若くて体力のある人がいいです。激しく何度も求めてほしい…`,

  `変態OLの{name}です。実は私、会社でとんでもないことをしています。

昼休みになると、誰もいない会議室や非常階段で、スカートの中に手を入れて…
パンティをずらして、指でクリトリスをくりくりと…
誰かに見つかるかもしれないスリルで、余計に興奮してしまうんです。

この前なんて、上司との打ち合わせ中も、机の下でこっそり太ももを擦り合わせて…
パンティがぐしょぐしょになってしまいました。
会議が終わった後、トイレに駆け込んで、激しくオナニーしました。

最近はリモコンバイブを入れて出社することも…
誰かにバレたらどうしよう、でもバレたい…そんな気持ちでいっぱいです。`,

  `ドMな女子大生の{name}です。普段は真面目な優等生ですが、実は…

SMプレイに興味があって、縛られたり、目隠しされたり、言葉責めされたりすることを想像すると、
下着が濡れてしまいます。

「お前は俺の性奴隷だ」「もっと大きな声で鳴け」なんて言われたい…
手首を縛られて、足を大きく開かされて、恥ずかしい格好のまま何度もイカされたい…

アナルも開発してほしいです。最初は指1本から始めて、徐々に太いものを…
前と後ろ、両方同時に犯されることを想像すると、もう我慢できません。

私を調教してくれる、Sな男性いませんか？何でも従います…`,

  `熟女の{name}、45歳です。歳を重ねるごとに性欲が強くなって困っています。

特に若い男の子を見ると、もう理性が効かなくなってしまって…
スポーツジムで筋トレしている20代の男の子の汗ばんだ体を見ていると、
その場で押し倒したくなる衝動に駆られます。

家に帰ってからは、若い男優のAVを見ながら激しくオナニー。
「もっと激しく突いて！」「奥まで届いてる！」って叫びながら、
バイブとローターを同時に使って、何度も何度もイキ続けます。

本当は若い子に、熟女のテクニックを教えてあげたい。
フェラチオのやり方、女性をイカせる方法、全部教えてあげるから…`,

  `不倫にハマってしまった{name}です。いけないことだとわかっているのに…

会社の上司（既婚）との関係が1年続いています。
週に2〜3回、ラブホテルで激しく求め合っています。

「旦那とはもうしてないんだろ？」って聞かれながら突かれると、
罪悪感と快感で頭がおかしくなりそう。
「あなただけよ…あなたのが一番気持ちいい…」って答えながら、
腰を振ってしまう自分が情けないけど、止められません。

車の中でフェラチオすることも多くて、
運転中の彼のものを咥えながら、精液を飲み干すのが日課になってます。

この関係、どうなってしまうんだろう…でも、もう後戻りできない…`
];

// ユーザープロフィール用データ
const userProfiles = [
  { name: "淫乱妻みき", age: 28, area: "東京", intro: "セックスレスの人妻です。毎日ムラムラが止まりません。" },
  { name: "ドM女子大生りな", age: 21, area: "大阪", intro: "調教されたい願望があります。変態プレイ大歓迎。" },
  { name: "巨乳OLさやか", age: 26, area: "名古屋", intro: "Gカップを持て余しています。パイズリ得意です。" },
  { name: "熟女教師ゆり", age: 42, area: "福岡", intro: "若い男の子を食べるのが趣味。テクニックには自信あり。" },
  { name: "変態主婦あい", age: 35, area: "札幌", intro: "露出プレイにハマっています。一緒に野外プレイしませんか？" },
  { name: "性欲モンスターまな", age: 24, area: "横浜", intro: "1日5回はしないと落ち着きません。性欲強い人募集。" },
  { name: "アナル開発済みれい", age: 30, area: "京都", intro: "お尻でイケる体です。アナル好きな方いませんか？" },
  { name: "潮吹き女王みお", age: 27, area: "神戸", intro: "潮吹きが止まりません。ベッドをびしょ濡れにします。" },
  { name: "フェラ専門えり", age: 23, area: "仙台", intro: "咥えるのが大好き。喉奥まで入れられます。" },
  { name: "寝取られ妻ゆうこ", age: 32, area: "広島", intro: "旦那公認で他の男性を探しています。3P希望。" }
];

// より過激な返信
const explicitReplies = [
  "読んでて勃起しちゃいました…詳しく聞かせてください",
  "私も同じです！オフ会しませんか？",
  "今まさにこれ読みながらオナニーしてます",
  "写真交換しませんか？私の裸も送ります",
  "すごくエロいですね…続きが聞きたいです",
  "私のテクニックで満足させてあげますよ",
  "一緒にホテル行きませんか？今からでも",
  "もっとエロい体験あります。直接会って話しましょう",
  "これ読んで濡れちゃいました…",
  "私も参加したいです！複数プレイ希望"
];

async function seedAdultContent() {
  try {
    console.log('🔥 過激なアダルトコンテンツを大量生成中...\n');

    // カテゴリー取得
    const { data: categories, error: catError } = await supabase
      .from('board_categories')
      .select('id, name');
    
    if (catError) throw catError;

    // エロカテゴリーを優先
    const adultCategories = categories.filter(c => 
      ['エロ', '体験談', '募集', '相談'].includes(c.name)
    );

    // 200件の過激な投稿を作成
    const posts = [];
    for (let i = 0; i < 200; i++) {
      const category = adultCategories[i % adultCategories.length];
      const userProfile = userProfiles[i % userProfiles.length];
      const ipHash = crypto.createHash('sha256').update(`${i}-${Date.now()}`).digest('hex');
      
      const titleIndex = i % explicitTitles.length;
      const contentTemplate = explicitContents[i % explicitContents.length];
      
      const content = contentTemplate.replace(/{name}/g, userProfile.name);
      
      const post = {
        category_id: category.id,
        title: explicitTitles[titleIndex],
        content: content,
        author_name: userProfile.name,
        ip_hash: ipHash,
        view_count: Math.floor(Math.random() * 10000) + 1000,
        plus_count: Math.floor(Math.random() * 300) + 50,
        minus_count: Math.floor(Math.random() * 30),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      posts.push(post);
    }

    // 投稿を挿入
    console.log('💦 200件の過激な投稿を作成中...');
    for (let i = 0; i < posts.length; i += 20) {
      const batch = posts.slice(i, i + 20);
      const { data: createdPosts, error } = await supabase
        .from('board_posts')
        .insert(batch)
        .select('id, title, author_name');
      
      if (error) {
        console.error(`❌ バッチ ${i/20 + 1} エラー:`, error);
      } else {
        console.log(`✅ ${i + createdPosts.length}件完了`);
        
        // 各投稿に返信を追加
        for (const post of createdPosts) {
          const replyCount = Math.floor(Math.random() * 20) + 5;
          const replies = [];
          
          for (let j = 0; j < replyCount; j++) {
            const replyAuthor = userProfiles[Math.floor(Math.random() * userProfiles.length)];
            const reply = {
              post_id: post.id,
              content: explicitReplies[Math.floor(Math.random() * explicitReplies.length)],
              author_name: replyAuthor.name,
              ip_hash: crypto.createHash('sha256').update(`reply-${j}-${Date.now()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 50),
              minus_count: Math.floor(Math.random() * 5),
              created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
            };
            replies.push(reply);
          }
          
          if (replies.length > 0) {
            await supabase.from('board_replies').insert(replies);
          }
        }
      }
    }

    // 音声投稿も作成
    console.log('\n🎙️ エロボイス投稿を作成中...');
    const voicePosts = [];
    
    const voiceTitles = [
      "【喘ぎ声】イク時の声を録音しました",
      "【オナニー実況】バイブ使いながら録音",
      "【淫語】エッチな言葉責めしてあげる",
      "【耳舐め音】ぺろぺろ音フェチ向け",
      "【フェラ音】じゅぽじゅぽ音を再現"
    ];

    for (let i = 0; i < 50; i++) {
      const author = userProfiles[i % userProfiles.length];
      const voicePost = {
        title: voiceTitles[i % voiceTitles.length],
        description: `${author.name}のエロボイスです。ヘッドホン推奨♡`,
        audio_url: `https://example.com/audio/erotic-voice-${i}.mp3`,
        category: 'female',
        duration: Math.floor(Math.random() * 300) + 60,
        view_count: Math.floor(Math.random() * 5000) + 500,
        like_count: Math.floor(Math.random() * 500) + 100,
        ip_hash: crypto.createHash('sha256').update(`voice-${i}`).digest('hex'),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      voicePosts.push(voicePost);
    }

    const { error: voiceError } = await supabase
      .from('anonymous_voice_posts')
      .insert(voicePosts);
    
    if (voiceError) {
      console.error('❌ ボイス投稿エラー:', voiceError);
    } else {
      console.log('✅ 50件のエロボイス投稿完了！');
    }

    console.log('\n🎉 アダルトコンテンツの大量生成が完了しました！');
    console.log('💥 掲示板が再びドスケベな投稿で溢れています！');

  } catch (error) {
    console.error('❌ エラーが発生:', error);
  }
}

seedAdultContent();