/**
 * 新しいマイグレーションファイル（016, 017）を実行するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function runMigrations() {
  console.log('🚀 新しいマイグレーションを実行します...');
  
  const migrations = [
    '016_create_live_chat_system.sql',
    '017_create_user_points_system.sql'
  ];
  
  for (const migration of migrations) {
    console.log(`\n📄 ${migration} を実行中...`);
    
    try {
      const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migration);
      const sql = await fs.readFile(filePath, 'utf8');
      
      // SQLを実行
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        // rpcが存在しない場合は、直接実行を試みる
        console.log('⚠️  exec_sql RPCが利用できません。Supabaseダッシュボードから手動で実行してください。');
        console.log('\n以下のSQLをSupabaseのSQLエディタで実行してください:');
        console.log('-----------------------------------');
        console.log(sql);
        console.log('-----------------------------------\n');
      } else {
        console.log(`✅ ${migration} の実行が完了しました`);
      }
    } catch (error) {
      console.error(`❌ ${migration} の実行中にエラーが発生しました:`, error.message);
    }
  }
  
  console.log('\n📋 マイグレーション手順:');
  console.log('1. Supabaseダッシュボードにログイン');
  console.log('2. SQL Editorセクションに移動');
  console.log('3. 上記のSQLを順番に実行');
  console.log('4. 各SQLの実行後、成功メッセージを確認');
  
  console.log('\n💡 ヒント: マイグレーションファイルは以下にあります:');
  console.log('- supabase/migrations/016_create_live_chat_system.sql');
  console.log('- supabase/migrations/017_create_user_points_system.sql');
}

// スクリプト実行
runMigrations();