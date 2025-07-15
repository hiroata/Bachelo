const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMorePosts() {
  try {
    console.log('🔥 追加の投稿を作成中...\n');

    // カテゴリー取得
    const { data: categories, error: catError } = await supabase
      .from('board_categories')
      .select('id, name, slug')
      .limit(10);
    
    if (catError) throw catError;
    console.log(`✅ ${categories.length}個のカテゴリーを取得`);

    // 投稿データ
    const posts = [
      {
        category_id: categories[0].id,
        title: '【32歳人妻】夫の友人と関係を持ってしまいました',
        content: '結婚7年目、子供が2人いる主婦です。夫の友人が家に来た時、夫が酔って寝てしまい、2人きりになってしまいました。お酒の勢いもあって、リビングのソファーで激しく求め合ってしまいました。罪悪感と快感で頭がおかしくなりそうです。',
        author_name: '罪深き人妻',
        view_count: 4532,
        plus_count: 543,
        minus_count: 32
      },
      {
        category_id: categories[1].id,
        title: '【レズビアン】女性同士の濃厚な関係',
        content: '30歳のOLです。同僚の女性と恋愛関係にあります。お互いの体を舐め合い、指で愛撫し合う関係が3年続いています。女性同士だからこそ分かる敏感な部分を責め合い、何度も絶頂に達します。',
        author_name: '百合の花',
        view_count: 6789,
        plus_count: 890,
        minus_count: 45
      },
      {
        category_id: categories[2].id,
        title: '【スカトロ】汚物プレイに目覚めました',
        content: '変態的な性癖を告白します。最近、排泄物を使ったプレイに興奮するようになりました。パートナーの排泄する姿を見たり、汚物を体に塗りつけたりすることで、異常な興奮を覚えます。',
        author_name: 'スカトロマニア',
        view_count: 2345,
        plus_count: 234,
        minus_count: 567
      },
      {
        category_id: categories[3].id,
        title: '【SMクラブ】女王様として君臨しています',
        content: 'SMクラブで女王様として働いています。男性客を縛り上げ、鞭で打ち、言葉責めで精神的に支配します。土下座させて靴を舐めさせたり、ペニスを踏みつけたりして、M男を調教する快感は最高です。',
        author_name: 'サディスト女王',
        view_count: 8901,
        plus_count: 1234,
        minus_count: 89
      },
      {
        category_id: categories[4].id,
        title: '【足フェチ】女性の足の匂いで興奮します',
        content: '異常な足フェチです。女性の素足、特に1日中パンプスを履いた後の蒸れた足の匂いを嗅ぐと、即座に勃起してしまいます。足指を舐めたり、足裏を顔に押し付けられたりすることが最高の快感です。',
        author_name: '足奴隷',
        view_count: 5678,
        plus_count: 789,
        minus_count: 123
      },
      {
        category_id: categories[5].id,
        title: '【デブ専】ぽっちゃり女性が大好きです',
        content: '痩せた女性には全く興味がありません。体重80kg以上のぽっちゃり女性の、柔らかい肉体に包まれることが最高の幸せです。太った女性の汗の匂い、肉の揺れ、全てが愛おしいです。',
        author_name: 'デブ専男',
        view_count: 3456,
        plus_count: 456,
        minus_count: 234
      },
      {
        category_id: categories[6].id,
        title: '【電車痴漢】満員電車での密着プレイ',
        content: '満員電車での痴漢プレイが大好きです。知らない男性に背後から密着され、スカートの中に手を入れられる感覚がたまりません。声を出せない状況で、下着の中を弄られて濡れてしまいます。',
        author_name: '痴漢願望女',
        view_count: 9876,
        plus_count: 1567,
        minus_count: 345
      },
      {
        category_id: categories[7].id,
        title: '【69体位】同時フェラとクンニが最高',
        content: '69体位が一番好きな体位です。お互いの性器を同時に舐め合い、快感を与え合う。相手の反応を感じながら、自分も快感を得る。この相互奉仕の体位で、同時に絶頂を迎える瞬間が最高です。',
        author_name: 'シックスナイン愛好家',
        view_count: 7890,
        plus_count: 1098,
        minus_count: 87
      },
      {
        category_id: categories[8].id,
        title: '【大人のおもちゃ】バイブコレクション100本突破',
        content: 'アダルトグッズマニアです。バイブ、ローター、ディルド、アナルプラグなど、コレクションは100本を超えました。毎晩違うおもちゃを使って、新しい快感を開発しています。最近のお気に入りは、遠隔操作できるバイブです。',
        author_name: 'おもちゃマニア',
        view_count: 6543,
        plus_count: 876,
        minus_count: 98
      },
      {
        category_id: categories[9].id,
        title: '【スワッピング】夫婦交換の快感',
        content: '夫婦でスワッピングを楽しんでいます。月に1回、同じ趣味の夫婦と4人で会い、パートナーを交換してセックスします。夫が他の女性と交わる姿を見ながら、私も他の男性に抱かれる背徳感は格別です。',
        author_name: 'スワッピング妻',
        view_count: 8765,
        plus_count: 1345,
        minus_count: 234
      }
    ];

    // 投稿を作成
    console.log('\n💦 投稿を作成中...');
    for (const post of posts) {
      const ipHash = crypto.createHash('sha256').update(`${Date.now()}-${Math.random()}`).digest('hex');
      
      const { data, error } = await supabase
        .from('board_posts')
        .insert({
          ...post,
          ip_hash: ipHash,
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select('id, title');
      
      if (error) {
        console.error(`❌ エラー: ${post.title}`, error.message);
      } else {
        console.log(`✅ 作成: ${post.title}`);
        
        // 返信も追加
        const replyCount = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < replyCount; i++) {
          const replies = [
            'すごくエロい話ですね！続きが聞きたいです',
            '私も同じ経験があります。詳しく教えてください',
            'これは興奮しますね...読んでて濡れちゃいました',
            'もっと過激な体験談を聞かせてください',
            '実際に会ってみたいです。連絡先交換しませんか？'
          ];
          
          await supabase.from('board_replies').insert({
            post_id: data[0].id,
            content: replies[Math.floor(Math.random() * replies.length)],
            author_name: `エロ好き${Math.floor(Math.random() * 1000)}`,
            ip_hash: crypto.createHash('sha256').update(`reply-${Date.now()}-${Math.random()}`).digest('hex'),
            plus_count: Math.floor(Math.random() * 100),
            minus_count: Math.floor(Math.random() * 10)
          });
        }
      }
    }

    console.log('\n🎉 投稿の追加が完了しました！');

  } catch (error) {
    console.error('❌ エラーが発生:', error);
  }
}

addMorePosts();