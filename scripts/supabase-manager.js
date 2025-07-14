#!/usr/bin/env node

/**
 * Supabase管理コマンドセンター
 * 使い方: npm run supabase:manage
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// カラーコード
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// メインメニュー
async function showMainMenu() {
  console.clear();
  console.log(`${colors.cyan}${colors.bright}=== Supabase 管理センター ===${colors.reset}\n`);
  console.log('1. 📊 データベース統計を表示');
  console.log('2. 🗃️  テーブル一覧を表示');
  console.log('3. 🔍 テーブルデータを確認');
  console.log('4. 🧹 古いデータをクリーンアップ');
  console.log('5. 📦 バックアップ実行');
  console.log('6. 🔐 RLSポリシーを確認');
  console.log('7. 📈 ストレージ使用量を確認');
  console.log('8. 🛠️  マイグレーション実行');
  console.log('9. ❌ 終了\n');

  rl.question('選択してください (1-9): ', async (choice) => {
    await handleMenuChoice(choice);
  });
}

// メニュー選択処理
async function handleMenuChoice(choice) {
  switch (choice) {
    case '1':
      await showDatabaseStats();
      break;
    case '2':
      await showTables();
      break;
    case '3':
      await checkTableData();
      break;
    case '4':
      await cleanupOldData();
      break;
    case '5':
      await backupDatabase();
      break;
    case '6':
      await checkRLSPolicies();
      break;
    case '7':
      await checkStorageUsage();
      break;
    case '8':
      await runMigration();
      break;
    case '9':
      console.log('\n👋 終了します');
      rl.close();
      process.exit(0);
    default:
      console.log(`${colors.red}無効な選択です${colors.reset}`);
      await waitForEnter();
      showMainMenu();
  }
}

// データベース統計表示
async function showDatabaseStats() {
  console.clear();
  console.log(`${colors.blue}${colors.bright}=== データベース統計 ===${colors.reset}\n`);

  try {
    // 各テーブルの件数を取得
    const tables = [
      'boards', 'threads', 'posts', 
      'board_posts', 'board_replies',
      'reports', 'ng_words', 'user_profiles'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`${colors.green}${table}:${colors.reset} ${count} 件`);
      }
    }

    // ストレージ統計
    console.log(`\n${colors.blue}ストレージバケット:${colors.reset}`);
    const buckets = ['voice-posts', 'images', 'board_images'];
    
    for (const bucket of buckets) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1000 });

      if (!error && data) {
        console.log(`${colors.green}${bucket}:${colors.reset} ${data.length} ファイル`);
      }
    }

  } catch (error) {
    console.error(`${colors.red}エラー:${colors.reset}`, error.message);
  }

  await waitForEnter();
  showMainMenu();
}

// テーブル一覧表示
async function showTables() {
  console.clear();
  console.log(`${colors.blue}${colors.bright}=== テーブル一覧 ===${colors.reset}\n`);

  const { data, error } = await supabase.rpc('get_table_list');

  if (error) {
    console.error(`${colors.red}エラー:${colors.reset}`, error.message);
  } else if (data) {
    data.forEach((table, index) => {
      console.log(`${index + 1}. ${colors.green}${table.table_name}${colors.reset}`);
    });
  }

  await waitForEnter();
  showMainMenu();
}

// テーブルデータ確認
async function checkTableData() {
  console.clear();
  console.log(`${colors.blue}${colors.bright}=== テーブルデータ確認 ===${colors.reset}\n`);

  rl.question('テーブル名を入力: ', async (tableName) => {
    rl.question('取得件数 (デフォルト: 10): ', async (limitStr) => {
      const limit = parseInt(limitStr) || 10;

      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(limit)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`${colors.red}エラー:${colors.reset}`, error.message);
        } else {
          console.log(`\n${colors.green}総件数: ${count} 件${colors.reset}`);
          console.log(`${colors.green}表示件数: ${data.length} 件${colors.reset}\n`);
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.error(`${colors.red}エラー:${colors.reset}`, error.message);
      }

      await waitForEnter();
      showMainMenu();
    });
  });
}

// 古いデータのクリーンアップ
async function cleanupOldData() {
  console.clear();
  console.log(`${colors.yellow}${colors.bright}=== 古いデータのクリーンアップ ===${colors.reset}\n`);
  console.log('7日以上前の音声投稿を削除します。');

  rl.question('実行しますか？ (y/N): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
          .from('anonymous_voice_posts')
          .delete()
          .lt('created_at', sevenDaysAgo.toISOString())
          .select();

        if (error) {
          console.error(`${colors.red}エラー:${colors.reset}`, error.message);
        } else {
          console.log(`${colors.green}✅ ${data?.length || 0} 件の古い投稿を削除しました${colors.reset}`);
        }
      } catch (error) {
        console.error(`${colors.red}エラー:${colors.reset}`, error.message);
      }
    }

    await waitForEnter();
    showMainMenu();
  });
}

// データベースバックアップ
async function backupDatabase() {
  console.clear();
  console.log(`${colors.blue}${colors.bright}=== データベースバックアップ ===${colors.reset}\n`);

  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  try {
    const tables = ['boards', 'threads', 'posts', 'board_posts', 'board_replies'];
    const backup = {};

    for (const table of tables) {
      console.log(`${colors.yellow}バックアップ中: ${table}...${colors.reset}`);
      const { data, error } = await supabase.from(table).select('*');
      
      if (!error && data) {
        backup[table] = data;
      }
    }

    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`${colors.green}✅ バックアップ完了: ${backupFile}${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}エラー:${colors.reset}`, error.message);
  }

  await waitForEnter();
  showMainMenu();
}

// RLSポリシー確認
async function checkRLSPolicies() {
  console.clear();
  console.log(`${colors.blue}${colors.bright}=== RLSポリシー確認 ===${colors.reset}\n`);

  try {
    const { data, error } = await supabase.rpc('get_rls_policies');

    if (error) {
      console.error(`${colors.red}エラー:${colors.reset}`, error.message);
    } else if (data) {
      data.forEach(policy => {
        console.log(`${colors.green}テーブル:${colors.reset} ${policy.table_name}`);
        console.log(`${colors.yellow}ポリシー:${colors.reset} ${policy.policy_name}`);
        console.log(`${colors.cyan}有効:${colors.reset} ${policy.enabled ? 'はい' : 'いいえ'}\n`);
      });
    }
  } catch (error) {
    console.error(`${colors.red}エラー:${colors.reset}`, error.message);
  }

  await waitForEnter();
  showMainMenu();
}

// ストレージ使用量確認
async function checkStorageUsage() {
  console.clear();
  console.log(`${colors.blue}${colors.bright}=== ストレージ使用量 ===${colors.reset}\n`);

  const buckets = ['voice-posts', 'images', 'board_images'];
  let totalSize = 0;

  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1000 });

      if (!error && data) {
        const bucketSize = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
        totalSize += bucketSize;
        
        console.log(`${colors.green}${bucket}:${colors.reset}`);
        console.log(`  ファイル数: ${data.length}`);
        console.log(`  使用量: ${formatBytes(bucketSize)}\n`);
      }
    } catch (error) {
      console.error(`${colors.red}${bucket} エラー:${colors.reset}`, error.message);
    }
  }

  console.log(`${colors.cyan}総使用量: ${formatBytes(totalSize)}${colors.reset}`);

  await waitForEnter();
  showMainMenu();
}

// マイグレーション実行
async function runMigration() {
  console.clear();
  console.log(`${colors.yellow}${colors.bright}=== マイグレーション実行 ===${colors.reset}\n`);

  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const migrations = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log('利用可能なマイグレーション:');
  migrations.forEach((m, i) => {
    console.log(`${i + 1}. ${m}`);
  });

  console.log('\n※ マイグレーションはSupabase Dashboard経由で実行することを推奨します。');

  await waitForEnter();
  showMainMenu();
}

// ヘルパー関数
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function waitForEnter() {
  return new Promise(resolve => {
    rl.question('\nEnterキーを押してメニューに戻る...', resolve);
  });
}

// アプリケーション開始
console.log(`${colors.cyan}${colors.bright}Supabase管理センターを起動しています...${colors.reset}`);
showMainMenu();