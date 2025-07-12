const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const client = new Client({
  host: 'db.dleqvbspjouczytouktv.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Ts%264032634',
  ssl: { rejectUnauthorized: false }
});

// Sample forum content for population
const sampleCategories = [
  { name: '質問', slug: 'questions', description: '技術的な質問や相談', icon: '❓' },
  { name: '雑談', slug: 'general', description: '自由な話題で交流', icon: '💬' },
  { name: 'ニュース', slug: 'news', description: '最新情報やお知らせ', icon: '📰' },
  { name: 'レビュー', slug: 'reviews', description: '商品やサービスのレビュー', icon: '⭐' },
  { name: 'テクノロジー', slug: 'tech', description: 'IT・プログラミング関連', icon: '💻' },
  { name: 'エンターテイメント', slug: 'entertainment', description: '映画・音楽・ゲーム', icon: '🎮' },
  { name: '趣味', slug: 'hobbies', description: '趣味全般について', icon: '🎨' },
  { name: '生活', slug: 'lifestyle', description: '日常生活・ライフハック', icon: '🏠' }
];

const samplePosts = [
  {
    title: 'プログラミング初心者におすすめの言語は？',
    content: 'プログラミングを始めたいのですが、どの言語から学ぶのがおすすめでしょうか？',
    category: 'questions',
    author: 'プログラミング初心者'
  },
  {
    title: '今日のコーヒーブレイク',
    content: '今日はとても良い天気ですね。皆さんはどんな一日を過ごしていますか？',
    category: 'general',
    author: 'コーヒー好き'
  },
  {
    title: '新しいスマートフォンが発表されました',
    content: '最新の技術が搭載された新製品が話題になっています。',
    category: 'news',
    author: 'テックニュース'
  },
  {
    title: 'おすすめのカフェレビュー',
    content: '駅前の新しいカフェに行ってきました。雰囲気も良くてコーヒーも美味しかったです。',
    category: 'reviews',
    author: 'カフェ探検家'
  },
  {
    title: 'Reactの最新機能について',
    content: '最新のReact 18の新機能について議論しましょう。',
    category: 'tech',
    author: 'React開発者'
  },
  {
    title: '今月のおすすめ映画',
    content: '話題の新作映画を見てきました。ストーリーが素晴らしかったです。',
    category: 'entertainment',
    author: '映画好き'
  },
  {
    title: 'ガーデニング始めました',
    content: 'ベランダでハーブを育て始めました。初心者でも簡単にできるものはありますか？',
    category: 'hobbies',
    author: '植物初心者'
  },
  {
    title: '在宅ワークの効率的な環境作り',
    content: '在宅ワークを快適にするためのデスク環境について相談したいです。',
    category: 'lifestyle',
    author: 'リモートワーカー'
  }
];

const sampleReplies = [
  'とても参考になりました！',
  'ありがとうございます。',
  '同感です。',
  '私も同じような経験があります。',
  'もっと詳しく教えてください。',
  'おすすめありがとうございます。',
  '試してみます！',
  '素晴らしい情報ですね。'
];

async function diagnoseDatabase() {
  console.log('=== データベース診断開始 ===\n');
  
  try {
    await client.connect();
    console.log('✅ データベース接続成功\n');
    
    // テーブル存在確認
    const tablesQuery = `
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('📊 既存テーブル一覧:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name} (${row.table_type})`);
    });
    console.log(`\n合計: ${tablesResult.rows.length} テーブル\n`);
    
    // RLS状態確認
    const rlsQuery = `
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    const rlsResult = await client.query(rlsQuery);
    console.log('🔒 RLS (Row Level Security) 状態:');
    rlsResult.rows.forEach(row => {
      console.log(`  - ${row.tablename}: ${row.rowsecurity ? 'ON' : 'OFF'}`);
    });
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ データベース診断エラー:', error.message);
    return false;
  }
}

async function fixDatabaseIssues() {
  console.log('=== データベース問題修正開始 ===\n');
  
  try {
    // RLS無効化（開発環境用）
    console.log('🔓 RLS無効化中...');
    const tables = ['board_categories', 'board_posts', 'board_replies', 'boards', 'threads', 'posts'];
    
    for (const table of tables) {
      try {
        await client.query(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);
        console.log(`  ✅ ${table} RLS無効化`);
      } catch (error) {
        console.log(`  ⚠️ ${table} テーブルが存在しないか、既に無効化済み`);
      }
    }
    
    console.log('\n✅ RLS無効化完了\n');
    return true;
  } catch (error) {
    console.error('❌ データベース修正エラー:', error.message);
    return false;
  }
}

async function populateDatabase() {
  console.log('=== データベース投入開始 ===\n');
  
  try {
    // カテゴリー投入
    console.log('📝 カテゴリー投入中...');
    
    for (const category of sampleCategories) {
      try {
        const result = await client.query(
          `INSERT INTO board_categories (name, slug, description, icon, is_active) 
           VALUES ($1, $2, $3, $4, true) 
           ON CONFLICT (name) DO UPDATE SET 
           description = EXCLUDED.description, 
           icon = EXCLUDED.icon
           RETURNING id;`,
          [category.name, category.slug, category.description, category.icon]
        );
        console.log(`  ✅ カテゴリー「${category.name}」投入完了`);
      } catch (error) {
        console.log(`  ⚠️ カテゴリー「${category.name}」スキップ: ${error.message}`);
      }
    }
    
    // 投稿投入
    console.log('\n📄 投稿投入中...');
    
    for (const post of samplePosts) {
      try {
        // カテゴリーIDを取得
        const categoryResult = await client.query(
          'SELECT id FROM board_categories WHERE slug = $1',
          [post.category]
        );
        
        if (categoryResult.rows.length === 0) {
          console.log(`  ⚠️ カテゴリー「${post.category}」が見つかりません`);
          continue;
        }
        
        const categoryId = categoryResult.rows[0].id;
        
        // 投稿を挿入
        const postResult = await client.query(
          `INSERT INTO board_posts (category_id, title, content, author_name) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id;`,
          [categoryId, post.title, post.content, post.author]
        );
        
        const postId = postResult.rows[0].id;
        console.log(`  ✅ 投稿「${post.title}」投入完了`);
        
        // 各投稿にランダムな返信を追加
        const replyCount = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < replyCount; i++) {
          const randomReply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
          await client.query(
            `INSERT INTO board_replies (post_id, content, author_name) 
             VALUES ($1, $2, $3);`,
            [postId, randomReply, `匿名ユーザー${i + 1}`]
          );
        }
        console.log(`    💬 ${replyCount}件の返信を追加`);
        
      } catch (error) {
        console.log(`  ❌ 投稿「${post.title}」エラー: ${error.message}`);
      }
    }
    
    console.log('\n✅ データベース投入完了\n');
    return true;
  } catch (error) {
    console.error('❌ データベース投入エラー:', error.message);
    return false;
  }
}

async function generateStatistics() {
  console.log('=== 統計情報生成 ===\n');
  
  try {
    // カテゴリー統計
    const categoryStats = await client.query(`
      SELECT c.name, COUNT(p.id) as post_count
      FROM board_categories c
      LEFT JOIN board_posts p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY post_count DESC;
    `);
    
    console.log('📊 カテゴリー別投稿数:');
    categoryStats.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.post_count}件`);
    });
    
    // 返信統計
    const replyStats = await client.query(`
      SELECT COUNT(*) as total_replies
      FROM board_replies;
    `);
    
    console.log(`\n💬 総返信数: ${replyStats.rows[0].total_replies}件`);
    
    // 総投稿数
    const postStats = await client.query(`
      SELECT COUNT(*) as total_posts
      FROM board_posts;
    `);
    
    console.log(`📄 総投稿数: ${postStats.rows[0].total_posts}件\n`);
    
    return true;
  } catch (error) {
    console.error('❌ 統計情報生成エラー:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Bachelo データベース診断・修正・投入ツール\n');
  
  try {
    // Step 1: 診断
    const diagnosed = await diagnoseDatabase();
    if (!diagnosed) {
      console.log('❌ 診断に失敗しました。処理を中止します。');
      return;
    }
    
    // Step 2: 問題修正
    const fixed = await fixDatabaseIssues();
    if (!fixed) {
      console.log('⚠️ 一部の修正に失敗しましたが、処理を続行します。');
    }
    
    // Step 3: データ投入
    const populated = await populateDatabase();
    if (!populated) {
      console.log('❌ データ投入に失敗しました。');
      return;
    }
    
    // Step 4: 統計生成
    await generateStatistics();
    
    console.log('🎉 全ての処理が完了しました！');
    console.log('\n次のステップ:');
    console.log('1. http://localhost:3000 でアプリケーションを確認');
    console.log('2. 追加のカテゴリーや投稿を管理画面から追加');
    console.log('3. 本番環境にデプロイする前にRLSを再有効化');
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error.message);
  } finally {
    await client.end();
    console.log('\n📡 データベース接続を終了しました。');
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  diagnoseDatabase,
  fixDatabaseIssues,
  populateDatabase,
  generateStatistics
};