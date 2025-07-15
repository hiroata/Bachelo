const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// バイラルコンテンツのテンプレート
const viralContent = {
  'SNS連動企画': [
    {
      title: "【拡散希望】#バチェロ告白チャレンジ がTwitterでトレンド入り！",
      content: `Twitterで話題沸騰中！

#バチェロ告白チャレンジ

【参加方法】
1. 誰にも言えなかった秘密をツイート
2. ハッシュタグ #バチェロ告白チャレンジ をつける
3. このスレッドのURLも一緒にツイート

現在の参加者：3,456人
トレンド順位：日本12位

【豪華賞品】
🥇 1位：Amazon券10万円
🥈 2位：高級ホテルペアチケット
🥉 3位：大人のおもちゃセット

最もバズった告白投稿者に賞品プレゼント！

締切：72時間後

さあ、あなたも参加して！`,
      viral: true,
      hashtags: ['#バチェロ告白チャレンジ', '#大人の告白', '#秘密暴露']
    },
    {
      title: "【YouTube連動】有名YouTuberがバチェロの投稿を読み上げ配信決定！",
      content: `超ビッグニュース！

チャンネル登録者数100万人超えの
某エロ系YouTuberが、バチェロの投稿を
読み上げる生配信を行うことが決定！

【配信詳細】
日時：今週土曜日 22:00〜
内容：バチェロの過激投稿を読み上げ＆コメント

選ばれる投稿の条件：
・過激度が高い
・ストーリー性がある
・コメントが盛り上がっている

あなたの投稿が読まれるかも！？

今すぐ過激な体験談を投稿して、
YouTubeデビューのチャンスを掴もう！

※個人情報は伏せて読み上げます`,
      platform: 'YouTube',
      potential_reach: '100万人'
    }
  ],
  'インフルエンサーコラボ': [
    {
      title: "【衝撃】元AV女優の〇〇がバチェロに降臨！質問受付中",
      content: `みんな〜！元AV女優の〇〇です♡

引退してから初めて、こういう掲示板に来ました！
今日は特別に、みんなの質問に答えちゃいます♪

聞きたいこと：
・AV撮影の裏話
・プライベートのエッチ事情
・テクニックの秘密
・業界の闇
・引退後の生活

なんでも聞いて！
タブーなしで答えるよ〜

証拠写真もアップするかも？（規約の範囲内で）

【認証済み】本人確認済みです

コメントで質問してね！
いいねが多い質問から答えていきます♡`,
      verified: true,
      celebrity: true
    },
    {
      title: "【コラボ】有名風俗嬢5人が業界の裏側を大暴露！",
      content: `風俗業界の現役トップ嬢5人が集結！

参加者：
・〇〇（ソープ/月収300万）
・△△（デリヘル/指名数No.1）
・□□（ヘルス/10年のベテラン）
・◇◇（M性感/プレイのカリスマ）
・☆☆（人妻デリ/元OL）

今から2時間限定で質問受付！

【暴露予定のトピック】
・お客様の変態リクエストTOP10
・稼げる嬢と稼げない嬢の違い
・危険な客の見分け方
・業界の暗黙のルール
・プライベートでもエッチは好き？

どんどん質問して！
ヤバい話もぶっちゃけます！`,
      time_limited: '2時間限定',
      participants: 5
    }
  ],
  'リアルイベント連動': [
    {
      title: "【オフ会】バチェロ初の大人限定オフ会開催決定！",
      content: `ついに実現！バチェロ公式オフ会！

【イベント詳細】
日時：来月第3土曜日 20:00〜
場所：都内某所（参加者にのみ通知）
参加費：男性5000円/女性2000円
定員：男女各50名

【内容】
・参加者同士の交流会
・匿名での告白タイム
・カップル成立企画
・秘密のアフターパーティー（希望者のみ）

【参加条件】
・20歳以上
・バチェロ投稿歴3回以上
・顔出しOK（マスク可）

申込みは先着順！
詳細はDMで！

※真剣な出会いを求める方限定
※既婚者も参加OK（自己責任で）`,
      event_type: 'オフライン',
      capacity: 100
    },
    {
      title: "【配信】今夜23時〜朝5時！エロ談義生配信マラソン",
      content: `今夜は寝かせない！

6時間ぶっ通しエロトーク配信決定！

【タイムテーブル】
23:00 オープニング〜初体験話
00:00 変態性癖カミングアウト大会
01:00 セフレvs恋人 大討論会
02:00 不倫経験者による座談会
03:00 過激な体験談発表会
04:00 深夜の告白タイム
05:00 エンディング

【参加方法】
・コメントで参加
・音声通話も可能（希望者）
・匿名参加OK

【特典】
最後まで参加した人には
限定コンテンツプレゼント！

今夜は一緒に朝まで語り明かそう！`,
      duration: '6時間',
      interactive: true
    }
  ],
  'コンテスト企画': [
    {
      title: "【賞金100万】エロ小説コンテスト開催！プロ作家が審査",
      content: `バチェロ史上最高額！賞金総額100万円！

【エロ小説コンテスト】

テーマ：「禁断の恋」
文字数：5000字〜20000字
締切：1ヶ月後

【賞金】
🥇 大賞：50万円
🥈 準大賞：20万円
🥉 入賞：10万円×3名

【審査員】
・官能小説家の〇〇先生
・元編集者の△△氏
・AV監督の□□氏

【応募方法】
1. 作品を投稿
2. タイトルに【コンテスト応募】を付ける
3. 応募完了！

あなたの妄想を形にして
賞金をゲットしよう！

※盗作は失格
※過度な暴力表現はNG`,
      prize_money: '100万円',
      judges: 'プロ作家'
    }
  ],
  '限定コンテンツ': [
    {
      title: "【先着100名】有料エロ動画を無料配布！条件あり",
      content: `期間限定！太っ腹企画！

通常5000円の有料アダルト動画を
先着100名様に無料プレゼント！

【配布動画】
・素人カップルの本気セックス（60分）
・人妻の不倫現場隠し撮り（45分）
・レズビアンカップルの日常（30分）

【取得条件】
1. このスレッドに体験談を投稿
2. 他の人の投稿に10件以上コメント
3. バチェロを3人以上に紹介

条件クリアしたらDMで申請！
先着順なのでお早めに！

残り枠：67名`,
      limited: true,
      remaining: 67
    }
  ]
};

// バイラル系の返信
const viralReplies = [
  "これは参加するしかない！",
  "RT拡散しました！",
  "友達にもシェアした！",
  "賞金ほしい〜！",
  "YouTubeで見たい！",
  "オフ会行きたい！",
  "これはバズる予感",
  "もう参加しちゃった♪",
  "みんなで盛り上げよう！",
  "歴史的イベントだ！",
  "参加条件クリア！",
  "楽しみすぎる〜",
  "絶対見逃せない",
  "準備完了！",
  "カウントダウン開始！"
];

async function createViralContent() {
  try {
    console.log('🚀 バイラルコンテンツを投入中...\n');

    const { data: categories } = await supabase
      .from('board_categories')
      .select('*');

    if (!categories || categories.length === 0) {
      console.error('❌ カテゴリーが見つかりません');
      return;
    }

    let totalPosts = 0;
    let totalReplies = 0;

    // バイラルコンテンツを作成
    for (const [contentType, posts] of Object.entries(viralContent)) {
      console.log(`\n📱 ${contentType}を作成中...`);

      for (const postData of posts) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        const post = {
          category_id: category.id,
          title: postData.title,
          content: postData.content,
          author_name: postData.verified ? '認証済みアカウント' : `バイラル企画${Math.floor(Math.random() * 100)}`,
          ip_hash: crypto.createHash('sha256').update(`viral-${Date.now()}-${Math.random()}`).digest('hex'),
          view_count: Math.floor(Math.random() * 100000) + 50000, // 超高閲覧数
          plus_count: Math.floor(Math.random() * 5000) + 3000, // 超高評価
          minus_count: Math.floor(Math.random() * 200), // 少なめのマイナス
          created_at: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString()
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
          console.log(`✅ バイラル作成: ${postData.title.substring(0, 40)}...`);

          // バイラル投稿には大量の返信
          const replyCount = Math.floor(Math.random() * 300) + 200;
          const replies = [];

          for (let i = 0; i < replyCount; i++) {
            const baseReply = viralReplies[Math.floor(Math.random() * viralReplies.length)];
            
            // 時々詳細な返信を追加
            let fullReply = baseReply;
            if (Math.random() < 0.4) {
              const additions = [
                `\n\n${i + 1}番目に参加しました！`,
                `\n\nもう${Math.floor(Math.random() * 100)}人も参加してる！`,
                `\n\n友達${Math.floor(Math.random() * 10) + 2}人誘った！`,
                `\n\nTwitterでも話題になってる！`,
                `\n\nこれは歴史に残るイベント！`
              ];
              fullReply += additions[Math.floor(Math.random() * additions.length)];
            }

            // 返信の投稿時間を分散
            const timeDiff = (i / replyCount) * 6 * 60 * 60 * 1000;
            const replyTime = new Date(Date.now() - (6 * 60 * 60 * 1000 - timeDiff));

            replies.push({
              post_id: createdPost.id,
              content: fullReply,
              author_name: `参加者${Math.floor(Math.random() * 10000)}`,
              ip_hash: crypto.createHash('sha256').update(`viral-reply-${i}-${Date.now()}-${Math.random()}`).digest('hex'),
              plus_count: Math.floor(Math.random() * 200) + 50,
              minus_count: Math.floor(Math.random() * 10),
              created_at: replyTime.toISOString()
            });
          }

          // 返信をバッチ挿入
          for (let j = 0; j < replies.length; j += 50) {
            const batch = replies.slice(j, j + 50);
            const { error: replyError } = await supabase
              .from('board_replies')
              .insert(batch);

            if (!replyError) {
              totalReplies += batch.length;
            }
          }

          console.log(`💬 ${replies.length}件の熱狂的な返信を追加`);
        }
      }
    }

    // リアルタイムランキング投稿も作成
    console.log('\n🏆 リアルタイムランキング投稿を作成中...');
    
    const rankingPosts = [
      "【速報】今週の人気投稿TOP10発表！1位の投稿がヤバすぎる",
      "【ランキング】最もいいねされた告白TOP5！全部読んだ？",
      "【殿堂入り】歴代最高のエロ投稿が更新された件",
      "【月間MVP】今月最も過激だった投稿者を表彰します",
      "【統計】バチェロユーザーの性癖ランキング2024年版"
    ];

    for (const title of rankingPosts) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const post = {
        category_id: category.id,
        title: title,
        content: `詳細はコメント欄で発表中！\n\n毎時更新される最新ランキングをチェック！\n\nあなたの投稿もランクインしてるかも？`,
        author_name: `ランキング速報`,
        ip_hash: crypto.createHash('sha256').update(`ranking-${Date.now()}-${Math.random()}`).digest('hex'),
        view_count: Math.floor(Math.random() * 80000) + 40000,
        plus_count: Math.floor(Math.random() * 4000) + 2000,
        minus_count: Math.floor(Math.random() * 100),
        created_at: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString()
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

    console.log(`\n🎊 バイラルコンテンツ投入完了！`);
    console.log(`🚀 新規バイラル投稿: ${totalPosts}件`);
    console.log(`💬 熱狂的な返信: ${totalReplies}件`);
    console.log(`📈 総投稿数: ${finalCount || 0}件`);
    console.log(`🔥 SNS連動でさらなる拡散を狙います！`);
    console.log(`💰 話題性MAXで収益爆上げ確定！`);

  } catch (error) {
    console.error('❌ エラー発生:', error);
  }
}

createViralContent();