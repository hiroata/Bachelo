const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase接続情報
const DB_HOST = 'db.dleqvbspjouczytoukctv.supabase.co';
const DB_PORT = '5432';
const DB_NAME = 'postgres';
const DB_USER = 'postgres';
const DB_PASSWORD = 'Ts%264032634';

const client = new Client({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ データベースに接続しました。');
    
    // 既存のテーブルを確認
    console.log('\n📋 既存のテーブルを確認中...');
    const existingTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`現在のテーブル数: ${existingTables.rows.length}`);
    if (existingTables.rows.length > 0) {
      console.log('既存のテーブル:');
      existingTables.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    // メインのマイグレーションを実行
    console.log('\n🚀 マイグレーションを開始します...');
    const migrationPath = path.join(__dirname, 'supabase', 'execute-all-migrations-complete.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`マイグレーションファイルが見つかりません: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // SQLを個別のステートメントに分割（改良版）
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    let inDollarQuote = false;
    
    const lines = migrationSQL.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // コメント行をスキップ
      if (trimmedLine.startsWith('--') && !inFunction && !inDollarQuote) {
        continue;
      }
      
      // $$クォートの開始/終了を検出
      if (line.includes('$$')) {
        inDollarQuote = !inDollarQuote;
      }
      
      // DO ブロックやFUNCTIONの開始/終了を検出
      if (trimmedLine.includes('DO $$') || trimmedLine.includes('CREATE OR REPLACE FUNCTION')) {
        inFunction = true;
      }
      
      currentStatement += line + '\n';
      
      // ステートメントの終了を検出
      if (!inDollarQuote && !inFunction && trimmedLine.endsWith(';')) {
        const cleanStatement = currentStatement.trim();
        if (cleanStatement && !cleanStatement.startsWith('--')) {
          statements.push(cleanStatement);
        }
        currentStatement = '';
      }
      
      // FUNCTIONやDOブロックの終了
      if (inFunction && trimmedLine.includes('$$') && trimmedLine.includes('LANGUAGE')) {
        inFunction = false;
        if (currentStatement.trim()) {
          statements.push(currentStatement.trim());
        }
        currentStatement = '';
      }
    }
    
    console.log(`\n実行するステートメント数: ${statements.length}`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // 各ステートメントを実行
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementPreview = statement.substring(0, 50).replace(/\n/g, ' ');
      
      try {
        // CREATE TYPE文の特別処理
        if (statement.includes('CREATE TYPE') && statement.includes('AS ENUM')) {
          const typeMatch = statement.match(/CREATE TYPE\s+(\w+)/);
          if (typeMatch) {
            const typeName = typeMatch[1];
            const checkResult = await client.query(
              "SELECT 1 FROM pg_type WHERE typname = $1",
              [typeName]
            );
            
            if (checkResult.rows.length > 0) {
              skipCount++;
              continue;
            }
          }
        }
        
        await client.query(statement);
        successCount++;
        
        // 進捗表示
        if ((i + 1) % 20 === 0) {
          console.log(`  進捗: ${i + 1}/${statements.length} (${Math.round((i + 1) / statements.length * 100)}%)`);
        }
        
      } catch (err) {
        // 既存オブジェクトエラーは無視
        if (err.message.includes('already exists')) {
          skipCount++;
        } else {
          errorCount++;
          errors.push({
            index: i + 1,
            preview: statementPreview,
            error: err.message,
            code: err.code
          });
          
          // 重要なエラーの場合は表示
          if (err.code === '42P01' || err.code === '42703' || err.code === '23505') {
            console.log(`\n❌ エラー (${i + 1}/${statements.length}): ${err.message}`);
            console.log(`   ステートメント: ${statementPreview}...`);
          }
        }
      }
    }
    
    // 結果サマリー
    console.log('\n' + '='.repeat(50));
    console.log('📊 マイグレーション結果:');
    console.log('='.repeat(50));
    console.log(`✅ 成功: ${successCount} ステートメント`);
    console.log(`⏭️  スキップ: ${skipCount} ステートメント (既存)`);
    console.log(`❌ エラー: ${errorCount} ステートメント`);
    
    if (errors.length > 0) {
      console.log('\n主なエラー:');
      const uniqueErrors = {};
      errors.forEach(e => {
        const key = e.code || e.error.substring(0, 50);
        if (!uniqueErrors[key]) {
          uniqueErrors[key] = [];
        }
        uniqueErrors[key].push(e);
      });
      
      Object.entries(uniqueErrors).slice(0, 5).forEach(([key, errs]) => {
        console.log(`\n  ${key}: ${errs.length}件`);
        console.log(`  例: ${errs[0].error}`);
      });
    }
    
    // 最終的なテーブル数を確認
    const finalTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`\n📋 最終テーブル数: ${finalTables.rows.length}`);
    
    // 主要なテーブルの存在確認
    const expectedTables = [
      'anonymous_voice_posts',
      'anonymous_post_comments',
      'anonymous_post_likes',
      'board_categories',
      'board_posts',
      'board_replies',
      'board_post_votes',
      'board_reply_votes',
      'boards',
      'threads',
      'posts',
      'reports',
      'ng_words',
      'chat_rooms',
      'user_profiles'
    ];
    
    console.log('\n主要テーブルの確認:');
    for (const table of expectedTables) {
      const exists = finalTables.rows.some(row => row.table_name === table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    }
    
    // サンプルデータの確認
    console.log('\n📊 サンプルデータの確認:');
    try {
      const categoriesCount = await client.query('SELECT COUNT(*) FROM board_categories');
      console.log(`  board_categories: ${categoriesCount.rows[0].count} 件`);
    } catch (err) {
      console.log('  board_categories: テーブルが存在しません');
    }
    
    try {
      const boardsCount = await client.query('SELECT COUNT(*) FROM boards');
      console.log(`  boards: ${boardsCount.rows[0].count} 件`);
    } catch (err) {
      console.log('  boards: テーブルが存在しません');
    }
    
    console.log('\n✅ マイグレーション処理が完了しました！');
    
  } catch (err) {
    console.error('\n❌ 致命的エラー:', err.message);
    throw err;
  } finally {
    await client.end();
    console.log('\nデータベース接続を閉じました。');
  }
}

// メイン実行
console.log('🚀 Bachelo データベースマイグレーション (クリーン版)');
console.log('=' + '='.repeat(49));
console.log('このスクリプトは既存のテーブルを保持しながら、');
console.log('不足しているテーブルとデータを追加します。');
console.log('=' + '='.repeat(49) + '\n');

runMigration().catch(err => {
  console.error('実行エラー:', err);
  process.exit(1);
});