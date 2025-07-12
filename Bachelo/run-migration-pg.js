const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'db.dleqvbspjouczytoukctv.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Ts%264032634',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('データベースに接続しました。');
    
    const migrationPath = path.join(__dirname, 'supabase', 'execute-all-migrations-complete.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('マイグレーションを実行中...');
    await client.query(migrationSQL);
    
    console.log('✅ マイグレーションが正常に完了しました！');
    
    // テーブル数を確認
    const result = await client.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(`作成されたテーブル数: ${result.rows[0].count}`);
    
  } catch (err) {
    console.error('エラー:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();