const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 環境変数または設定から接続情報を取得
const dbConfig = {
  host: process.env.SUPABASE_DB_HOST || 'localhost',
  port: process.env.SUPABASE_DB_PORT || 5432,
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  user: process.env.SUPABASE_DB_USER || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || '',
  ssl: process.env.SUPABASE_DB_SSL === 'false' ? false : { rejectUnauthorized: false }
};

async function runMigration() {
  console.log('Bachelo データベースマイグレーション（環境変数版）を開始します...');
  
  // 接続情報の確認
  if (!dbConfig.host || dbConfig.host === 'localhost') {
    console.log('\n⚠️  データベース接続情報が設定されていません。');
    console.log('\n以下の環境変数を設定してください:');
    console.log('SUPABASE_DB_HOST=あなたのSupabaseホスト');
    console.log('SUPABASE_DB_PORT=5432');
    console.log('SUPABASE_DB_NAME=postgres');
    console.log('SUPABASE_DB_USER=postgres');
    console.log('SUPABASE_DB_PASSWORD=あなたのパスワード');
    console.log('SUPABASE_DB_SSL=true');
    
    console.log('\nまたは、Supabaseダッシュボードを使用してください:');
    console.log('1. https://supabase.com/dashboard にログイン');
    console.log('2. プロジェクトを選択');
    console.log('3. SQL Editorタブに移動');
    console.log('4. execute-all-migrations-complete.sqlの内容をコピー&ペースト');
    console.log('5. "Run"ボタンをクリック');
    return;
  }
  
  const client = new Client(dbConfig);
  
  try {
    console.log(`データベースに接続中... (${dbConfig.host}:${dbConfig.port})`);
    await client.connect();
    console.log('✅ データベースに接続しました。');
    
    // マイグレーションファイルの読み込み
    const migrationPath = path.join(__dirname, 'supabase', 'execute-all-migrations-complete.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ マイグレーションファイルが見つかりません:', migrationPath);
      return;
    }
    
    console.log('📖 マイグレーションファイルを読み込み中...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 マイグレーションを実行中...');
    console.log('（これには少し時間がかかる場合があります）');
    
    await client.query(migrationSQL);
    
    console.log('✅ マイグレーションが正常に完了しました！');
    
    // テーブル数を確認
    const result = await client.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(`📊 作成されたテーブル数: ${result.rows[0].count}`);
    
    // サンプルデータの確認
    const postCount = await client.query("SELECT COUNT(*) FROM board_posts");
    console.log(`📝 投稿数: ${postCount.rows[0].count}`);
    
    const categoryCount = await client.query("SELECT COUNT(*) FROM board_categories");
    console.log(`📂 カテゴリー数: ${categoryCount.rows[0].count}`);
    
  } catch (err) {
    console.error('❌ エラーが発生しました:', err.message);
    
    if (err.code === 'ENOTFOUND') {
      console.log('\n🔧 DNS解決エラーです。以下を確認してください:');
      console.log('1. ホスト名が正しいか');
      console.log('2. インターネット接続が正常か');
      console.log('3. ファイアウォールがブロックしていないか');
    } else if (err.code === 'ECONNREFUSED') {
      console.log('\n🔧 接続拒否エラーです。以下を確認してください:');
      console.log('1. ポート番号が正しいか');
      console.log('2. データベースサーバーが稼働しているか');
    } else if (err.code === '28000') {
      console.log('\n🔧 認証エラーです。以下を確認してください:');
      console.log('1. ユーザー名とパスワードが正しいか');
      console.log('2. データベース名が正しいか');
    }
  } finally {
    await client.end();
  }
}

// 使用方法の表示
console.log('='.repeat(60));
console.log('Bachelo Database Migration Tool (環境変数版)');
console.log('='.repeat(60));

runMigration();
