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
    console.log('データベースに接続しました。');
    
    // 1. まず修正スクリプトを実行
    console.log('\n1. 既存の制約とデータの修正を実行中...');
    const fixPath = path.join(__dirname, 'supabase', 'fix-migration.sql');
    const fixSQL = fs.readFileSync(fixPath, 'utf8');
    
    try {
      await client.query(fixSQL);
      console.log('✅ 修正スクリプトが正常に実行されました。');
    } catch (err) {
      console.log('ℹ️  一部の修正はスキップされました（テーブルが存在しない可能性があります）');
    }
    
    // 2. メインのマイグレーションを実行
    console.log('\n2. メインマイグレーションを実行中...');
    const migrationPath = path.join(__dirname, 'supabase', 'execute-all-migrations-complete.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // SQLを個別のステートメントに分割
    const statements = migrationSQL
      .split(/;\s*$/gm)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < statements.length; i++) {
      let statement = statements[i];
      
      // DO ブロックやCREATE FUNCTIONなどの複数行ステートメントを処理
      if (statement.includes('$$') || statement.includes('DO $$')) {
        // 複数のステートメントを結合
        while (i + 1 < statements.length && !statement.includes('$$;')) {
          i++;
          statement += ';' + statements[i];
        }
      }
      
      // ENUM型の作成を特別に処理
      if (statement.includes('CREATE TYPE') && statement.includes('AS ENUM')) {
        try {
          // 既存の型をチェック
          const typeName = statement.match(/CREATE TYPE\s+(\w+)/)[1];
          const checkResult = await client.query(
            "SELECT 1 FROM pg_type WHERE typname = $1",
            [typeName]
          );
          
          if (checkResult.rows.length > 0) {
            console.log(`ℹ️  型 ${typeName} は既に存在します。スキップします。`);
            successCount++;
            continue;
          }
        } catch (err) {
          // エラーは無視して実行を続ける
        }
      }
      
      try {
        await client.query(statement + ';');
        successCount++;
        
        // 進捗を表示
        if (successCount % 10 === 0) {
          console.log(`  実行済み: ${successCount}/${statements.length}`);
        }
      } catch (err) {
        errorCount++;
        
        // ON CONFLICT エラーの場合は詳細を表示
        if (err.message.includes('ON CONFLICT')) {
          errors.push({
            statement: statement.substring(0, 100) + '...',
            error: 'ON CONFLICT エラー - UNIQUE制約が見つかりません'
          });
        } else if (!err.message.includes('already exists')) {
          // 既存オブジェクトエラー以外は記録
          errors.push({
            statement: statement.substring(0, 100) + '...',
            error: err.message
          });
        }
      }
    }
    
    console.log(`\n✅ マイグレーション完了！`);
    console.log(`  成功: ${successCount}ステートメント`);
    console.log(`  エラー: ${errorCount}ステートメント`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  以下のエラーが発生しました:');
      errors.slice(0, 5).forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.error}`);
        console.log(`     ステートメント: ${e.statement}`);
      });
      
      if (errors.length > 5) {
        console.log(`  ... 他 ${errors.length - 5} 件のエラー`);
      }
    }
    
    // テーブル数を確認
    const result = await client.query(`
      SELECT COUNT(*) 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    console.log(`\n📊 作成されたテーブル数: ${result.rows[0].count}`);
    
    // 主要なテーブルの存在確認
    const tables = [
      'anonymous_voice_posts',
      'board_categories',
      'board_posts',
      'boards',
      'threads',
      'posts',
      'reports',
      'ng_words',
      'chat_rooms',
      'user_profiles'
    ];
    
    console.log('\n📋 主要テーブルの確認:');
    for (const table of tables) {
      const exists = await client.query(
        "SELECT 1 FROM information_schema.tables WHERE table_name = $1",
        [table]
      );
      console.log(`  ${exists.rows.length > 0 ? '✅' : '❌'} ${table}`);
    }
    
  } catch (err) {
    console.error('致命的エラー:', err.message);
  } finally {
    await client.end();
    console.log('\nデータベース接続を閉じました。');
  }
}

console.log('Bachelo データベースマイグレーション (修正版)');
console.log('=====================================');
runMigration();