const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Supabase接続情報
const DB_HOST = 'db.dleqvbspjouczytoukctv.supabase.co';
const DB_PORT = '5432';
const DB_NAME = 'postgres';
const DB_USER = 'postgres';
const DB_PASSWORD = 'Ts%264032634'; // 本番環境では環境変数から取得すべき

async function runMigration() {
  try {
    console.log('Bachelo データベースマイグレーションを開始します...');
    
    // マイグレーションファイルのパスを確認
    const migrationPath = path.join(__dirname, 'supabase', 'execute-all-migrations-complete.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('エラー: マイグレーションファイルが見つかりません:', migrationPath);
      process.exit(1);
    }
    
    console.log('マイグレーションファイルを読み込んでいます...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // PostgreSQL接続URLを構築
    const connectionUrl = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    
    // psqlコマンドを使用してマイグレーションを実行
    console.log('データベースに接続しています...');
    
    // psqlがインストールされているか確認
    exec('psql --version', (error) => {
      if (error) {
        console.error('\npsqlがインストールされていません。');
        console.log('\n代替方法: Supabaseダッシュボードを使用してください:');
        console.log('1. https://supabase.com/dashboard/project/dleqvbspjouczytoukctv を開く');
        console.log('2. SQL Editorタブに移動');
        console.log('3. execute-all-migrations-complete.sqlの内容をコピー&ペースト');
        console.log('4. "Run"ボタンをクリック');
        
        // Node.js用の代替方法を提供
        console.log('\nまたは、pgパッケージを使用する方法:');
        console.log('npm install pg');
        console.log('その後、run-migration-pg.jsを実行してください。');
        
        // pgを使用するバージョンのスクリプトを作成
        createPgVersion();
        return;
      }
      
      // psqlを使用してマイグレーションを実行
      const psqlCommand = `psql "${connectionUrl}" -f "${migrationPath}"`;
      
      console.log('マイグレーションを実行中...');
      exec(psqlCommand, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          console.error('マイグレーションエラー:', error.message);
          if (stderr) {
            console.error('詳細:', stderr);
          }
          process.exit(1);
        }
        
        console.log('\n✅ マイグレーションが正常に完了しました！');
        if (stdout) {
          console.log('\n実行結果:', stdout);
        }
      });
    });
    
  } catch (err) {
    console.error('エラーが発生しました:', err.message);
    process.exit(1);
  }
}

function createPgVersion() {
  const pgScript = `const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: '${DB_HOST}',
  port: ${DB_PORT},
  database: '${DB_NAME}',
  user: '${DB_USER}',
  password: '${DB_PASSWORD}',
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
    console.log(\`作成されたテーブル数: \${result.rows[0].count}\`);
    
  } catch (err) {
    console.error('エラー:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();`;

  fs.writeFileSync(path.join(__dirname, 'run-migration-pg.js'), pgScript);
  console.log('\nrun-migration-pg.jsを作成しました。');
}

runMigration();
