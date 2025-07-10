import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// カテゴリデータ
const categories = [
  { id: '1', name: '雑談', slug: 'general', display_order: 1 },
  { id: '2', name: '質問', slug: 'question', display_order: 2 },
  { id: '3', name: 'ニュース', slug: 'news', display_order: 3 },
  { id: '4', name: 'レビュー', slug: 'review', display_order: 4 },
];

// サンプル投稿データ
const samplePosts = [
  {
    category_id: '1',
    title: '【雑談】BACHELOの掲示板について語ろう',
    author_name: '管理人',
    content: `BACHELOの掲示板へようこそ！

ここは音声投稿サイトBACHELOの総合掲示板です。
みんなで楽しく語り合いましょう。

・誹謗中傷は禁止
・個人情報の投稿は控えてください
・楽しく平和に利用しましょう`,
    is_pinned: true,
  },
  {
    category_id: '1',
    title: '初めて来ました！よろしくお願いします',
    author_name: 'ゆうた',
    content: `はじめまして！友達に教えてもらってこのサイトに来ました。
音声投稿って面白そうですね。

みなさんどんな感じで使ってますか？
初心者なので色々教えてください！`,
  },
  {
    category_id: '2',
    title: '音声投稿のコツを教えてください',
    author_name: 'あおい',
    content: `音声投稿を始めたばかりなんですが、
みなさんどんな機材使ってますか？

スマホのマイクだけだと音質がイマイチで...
おすすめのマイクとか録音アプリあれば教えてください！`,
  },
  {
    category_id: '1',
    title: '深夜の雑談スレ',
    author_name: '夜更かしさん',
    content: `眠れない人集まれ〜

今日も夜更かししちゃってます。
みんな何してる？

最近は音声配信聞きながら寝落ちするのが日課になってきた`,
  },
  {
    category_id: '3',
    title: '【速報】新機能「ライブ配信」が追加されるらしい',
    author_name: '情報通',
    content: `運営からの発表によると、
来月からライブ配信機能が実装されるみたいです！

リアルタイムで音声配信できるようになるとか。
これは盛り上がりそう！

詳細はまだ不明ですが、期待大ですね`,
  },
  {
    category_id: '4',
    title: '【レビュー】Blue Yeti マイク買ってみた',
    author_name: 'ガジェット好き',
    content: `音声投稿用にBlue Yetiのマイク買いました！

【良い点】
・音質がクリアで聞きやすい
・USBで簡単接続
・見た目がカッコいい

【悪い点】
・ちょっと重い
・値段が高め（2万円くらい）

総合的には買ってよかったです！
音声投稿のクオリティが格段に上がりました`,
  },
  {
    category_id: '1',
    title: 'おすすめの音声投稿者教えて！',
    author_name: 'リスナー初心者',
    content: `最近このサイト使い始めたんですが、
みなさんのおすすめの投稿者さんいますか？

ジャンルは問わないので、
面白い人や癒される人など教えてください！

フォローしてみます〜`,
  },
  {
    category_id: '2',
    title: 'BGMって使っていいの？',
    author_name: '著作権気になるマン',
    content: `音声投稿にBGM入れたいんですが、
著作権とか大丈夫でしょうか？

フリー素材のサイトとかあれば
教えてもらえると嬉しいです。

みなさんどうしてますか？`,
  },
  {
    category_id: '1',
    title: '【定期】朝の挨拶スレ',
    author_name: '早起きさん',
    content: `おはようございます！

今日も一日がんばりましょう〜
朝から音声投稿チェックしてます。

今日の予定は何ですか？
私は仕事終わったら新しい音声撮る予定！`,
  },
  {
    category_id: '3',
    title: '利用者数が10万人突破！',
    author_name: 'お祝い係',
    content: `おめでとうございます！
BACHELOの利用者数が10万人を突破したそうです！

これからもどんどん盛り上がっていきそうですね。
記念キャンペーンとかやってくれないかな〜

みんなで盛り上げていきましょう！`,
  },
];

async function seedBoardData() {
  try {
    console.log('カテゴリを作成中...');
    
    // カテゴリを作成
    for (const category of categories) {
      const { error } = await supabase
        .from('board_categories')
        .upsert(category, { onConflict: 'id' });
      
      if (error) {
        console.error(`カテゴリ作成エラー (${category.name}):`, error);
      } else {
        console.log(`✓ カテゴリ作成: ${category.name}`);
      }
    }

    console.log('\n投稿を作成中...');
    
    // 投稿を作成
    for (const post of samplePosts) {
      const postData = {
        ...post,
        author_email: '',
        ip_address: '127.0.0.1',
        user_agent: 'SeedScript/1.0',
      };
      
      const { error } = await supabase
        .from('board_posts')
        .insert(postData);
      
      if (error) {
        console.error(`投稿作成エラー (${post.title}):`, error);
      } else {
        console.log(`✓ 投稿作成: ${post.title}`);
      }
    }

    console.log('\n✅ シードデータの作成が完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
seedBoardData();