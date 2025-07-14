const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// より詳細でリアリティのある体験談
const qualityPosts = [
  {
    title: "【32歳人妻】息子の家庭教師と一線を越えてしまった話",
    content: `結婚10年目、小学6年生の息子がいる専業主婦です。

息子の成績が心配で、3ヶ月前から大学生の家庭教師をお願いしていました。
爽やかで真面目な22歳の青年。最初は息子の勉強を見てもらうだけの関係でした。

でも、夫は仕事で帰りが遅く、週末もゴルフ。
息子が塾に行っている火曜日の午後、彼と2人きりになることが増えました。

「奥さん、今日も綺麗ですね」
最初はお世辞だと思っていた彼の言葉。でも、彼の視線が私の胸元や脚に注がれているのに気づいてしまって…

ある日、お茶を出そうとした時、手が触れました。
一瞬の沈黙の後、彼が「奥さん…」と私の手を握ってきて。

「だめよ、私は人妻なの」
口ではそう言いながら、手を離せない自分がいました。

気がつけば、リビングのソファで激しくキスを交わしていました。
「こんなの初めて…」彼の若い体に触れた瞬間、10年間忘れていた女の感覚が蘇って。

それから毎週火曜日が待ち遠しくて仕方ありません。
罪悪感はあります。でも、もう止められない…`,
    author_name: "罪深い母親",
    category: "不倫",
    tags: ["人妻", "年下", "家庭教師", "不倫", "背徳"],
    age: "32歳",
    location: "神奈川"
  },
  {
    title: "【26歳OL】会社の倉庫で上司に調教された日々",
    content: `都内の商社で働く普通のOLでした。
入社4年目、仕事も慣れてきた頃、部署異動で新しい上司（45歳）の下につくことに。

最初は厳しいだけの上司だと思っていました。
でも、残業で2人きりになった夜、彼の本性を知ることになります。

「君、Mでしょ？」
倉庫で在庫確認をしていた時、突然耳元で囁かれました。

「え？何を言って…」
否定しようとした私の言葉を、彼は唇で塞ぎました。

抵抗しようとしたのに、体が勝手に反応してしまって。
「ほら、濡れてる」スカートの中に手を入れられ、そう言われた時、何も言い返せませんでした。

それから、彼の調教が始まりました。
昼休みに倉庫に呼び出されては、目隠しをされて…
「声を出したらバレるよ」と言われながら、必死に声を押し殺して。

最初は嫌だったはずなのに、いつの間にか自分から倉庫に向かうように。
「もっと激しくしてください」なんて、自分から懇願するようになってしまいました。

普通のOLの顔をしながら、体には彼につけられた痕が。
この二重生活、もう抜け出せません…`,
    author_name: "調教されたOL",
    category: "SM",
    tags: ["OL", "上司", "調教", "羞恥", "倉庫"],
    age: "26歳",
    location: "東京"
  },
  {
    title: "【21歳女子大生】バイト先の人妻店長に筆下ろしされた話",
    content: `地方から上京してきた大学3年生です。
コンビニバイトを始めて、そこで出会ったのが美人店長（35歳）でした。

童貞だった自分に優しくしてくれる店長。
「彼女いないの？」「かわいいのにもったいない」
そんな言葉に舞い上がっていました。

ある日の深夜シフト、店長と2人きり。
「今日は暇ね。裏で休憩しましょ」と事務所に誘われました。

缶コーヒーを飲んでいると、店長が隣に座ってきて。
「女の子と、キスしたことある？」
首を横に振ると、「じゃあ、練習してあげる」と唇を重ねられました。

頭が真っ白になりながらも、柔らかい感触に夢中になって。
気がつけば、店長のブラウスのボタンを外していました。

「初めてなの？じゃあ、優しく教えてあげる」
バックヤードの休憩スペースで、21年間の童貞を卒業しました。

「奥まで入ってる…すごく硬い…」
人妻の色っぽい声を聞きながら、必死に腰を動かしました。

今でも深夜シフトの時は、店長に「指導」してもらっています。
「今日は違う体位を教えてあげる」って言われると、もう我慢できません…`,
    author_name: "童貞卒業くん",
    category: "年上",
    tags: ["童貞", "人妻", "年上", "バイト", "筆下ろし"],
    age: "21歳",
    location: "東京"
  },
  {
    title: "【28歳保育士】保護者のパパと車内で何度も…",
    content: `保育園で働いて6年目。子供は大好きだけど、彼氏はいません。

きっかけは、5歳の男の子のパパ（38歳）でした。
いつも奥さんの代わりにお迎えに来る、優しそうなパパ。

「先生、いつもありがとうございます」
その笑顔に、いつしか特別な感情を抱くようになっていました。

運動会の後、片付けを手伝ってくれた彼。
「先生、駅まで送りますよ」と車に乗せてもらいました。

車内で他愛ない話をしているうち、
「先生、実は妻とうまくいってなくて…」と打ち明けられました。

慰めようと手を重ねた瞬間、彼が振り向いて。
そのままキスをされ、抵抗できませんでした。

「ここじゃ…」と言いかけた私に、
「じゃあ、場所を変えよう」と、人気のない駐車場へ。

狭い車内で、制服のままで抱かれました。
「先生の制服姿、ずっと興奮してた」と言われ、
罪悪感と快感で頭がおかしくなりそうでした。

今では週に2回、お迎えの後に「ドライブ」しています。
後部座席に移動して、激しく求め合う関係に。

他の保護者には絶対バレないように…でも、もうやめられません`,
    author_name: "いけない先生",
    category: "不倫",
    tags: ["保育士", "不倫", "車内", "保護者", "制服"],
    age: "28歳",
    location: "千葉"
  },
  {
    title: "【35歳バツイチ】息子の友達にハマってしまった夏",
    content: `離婚して3年、高校生の息子と2人暮らしです。

夏休み、息子が友達を連れてきました。
18歳、日焼けした肌に筋肉質な体。若い男の子のエネルギーに圧倒されました。

「おばさん、めっちゃ美人ですね」
軽い挨拶のつもりだったんでしょう。でも、久しぶりに女として見られた気がして。

息子が部活で出かけた日、彼だけが遊びに来ました。
「息子いないけど？」「おばさんに会いに来ました」

冗談だと思って笑っていたら、真剣な顔で
「本気です。おばさんのこと、女として見てます」

ダメだと分かっていても、若い体に抱きしめられた瞬間、
すべての理性が吹き飛びました。

「おばさんって呼ばないで」「じゃあ、名前で呼びます…美香さん」

昼間のリビングで、息子が帰ってくるまでの時間、
18歳の激しさに翻弄されました。

「こんなに激しいの久しぶり…」
3年ぶりの快感に、恥も外聞もなく声をあげてしまいました。

今も週3回、息子がいない時間を見計らって会っています。
母親失格かもしれない。でも、女としての幸せを手放せません…`,
    author_name: "ダメ母",
    category: "年下",
    tags: ["バツイチ", "年下", "息子の友達", "年の差", "背徳"],
    age: "35歳",
    location: "埼玉"
  }
];

// 人気の返信パターン
const popularReplies = [
  "すごく興奮しました。続きが聞きたいです",
  "私も同じような経験があります。お気持ちわかります",
  "文章がリアルで、情景が目に浮かびます",
  "これは実話ですか？詳細をもっと教えてください",
  "ドキドキしながら読みました。私も経験してみたい",
  "罪悪感と快感の描写が上手ですね",
  "年齢差のある関係っていいですよね",
  "場所とシチュエーションがエロいです",
  "私も人妻ですが、共感してしまいました",
  "若い子の激しさ、羨ましいです"
];

async function seedQualityContent() {
  try {
    console.log('🔥 高品質なアダルトコンテンツを生成中...\n');

    // カテゴリー取得
    const { data: categories, error: catError } = await supabase
      .from('board_categories')
      .select('id, name');
    
    if (catError) throw catError;

    const categoryMap = {};
    categories.forEach(cat => {
      if (cat.name === '不倫') categoryMap['不倫'] = cat.id;
      if (cat.name === '体験談') categoryMap['体験談'] = cat.id;
      if (cat.name === 'エロ') categoryMap['エロ'] = cat.id;
    });

    // 高品質な投稿を作成
    for (const postData of qualityPosts) {
      const categoryId = categoryMap[postData.category] || categoryMap['体験談'] || categories[0].id;
      
      const post = {
        category_id: categoryId,
        title: postData.title,
        content: postData.content,
        author_name: postData.author_name,
        ip_hash: crypto.createHash('sha256').update(`${postData.author_name}-${Date.now()}`).digest('hex'),
        view_count: Math.floor(Math.random() * 50000) + 10000,
        plus_count: Math.floor(Math.random() * 1000) + 200,
        minus_count: Math.floor(Math.random() * 50),
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

      console.log(`✅ 作成: ${postData.title}`);

      // タグを投稿に関連付け（タグテーブルがある場合）
      // ここでは仮実装

      // 人気のある返信を追加
      const replyCount = Math.floor(Math.random() * 30) + 20;
      const replies = [];
      
      for (let i = 0; i < replyCount; i++) {
        const replyContent = popularReplies[Math.floor(Math.random() * popularReplies.length)];
        const reply = {
          post_id: createdPost.id,
          content: replyContent,
          author_name: `匿名${Math.floor(Math.random() * 1000)}`,
          ip_hash: crypto.createHash('sha256').update(`reply-${i}-${Date.now()}`).digest('hex'),
          plus_count: Math.floor(Math.random() * 100),
          minus_count: Math.floor(Math.random() * 10),
          created_at: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString()
        };
        replies.push(reply);
      }

      if (replies.length > 0) {
        const { error: replyError } = await supabase
          .from('board_replies')
          .insert(replies);
        
        if (replyError) {
          console.error('返信作成エラー:', replyError);
        } else {
          console.log(`  └─ ${replies.length}件の返信を追加`);
        }
      }
    }

    console.log('\n🎉 高品質コンテンツの生成が完了しました！');

  } catch (error) {
    console.error('❌ エラーが発生:', error);
  }
}

seedQualityContent();