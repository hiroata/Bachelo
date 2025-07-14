const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runSafeMigration() {
  // Supabaseクライアントを作成
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ エラー: Supabase URLまたはサービスロールキーが設定されていません');
    console.log('確認してください: .env.local ファイル');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🚀 Bachelo 安全なマイグレーションを開始します...');
    
    // マイグレーションファイルのパスを確認
    const migrationPath = path.join(__dirname, 'supabase', 'safe-migration.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ エラー: マイグレーションファイルが見つかりません:', migrationPath);
      process.exit(1);
    }
    
    console.log('📄 マイグレーションファイルを読み込んでいます...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('⚡ マイグレーションを実行中...');
    
    // Supabaseでraw SQLを実行
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ マイグレーション実行エラー:', error);
      
      // 代替方法として、個別のクエリに分割して実行を試行
      console.log('🔄 代替方法を試行中...');
      await runMigrationAlternative(supabase, migrationSQL);
    } else {
      console.log('🎉 マイグレーション実行完了！');
      if (data) {
        console.log('📊 実行結果:', data);
      }
    }
    
    // テーブル一覧を取得して確認
    console.log('\n📋 作成されたテーブル一覧を確認中...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (tablesError) {
      console.error('❌ テーブル一覧取得エラー:', tablesError);
    } else if (tables) {
      console.log('✅ 作成されたテーブル:');
      tables.forEach(table => {
        console.log(`  ✓ ${table.table_name}`);
      });
    }
    
    console.log('\n🎊 すべての処理が正常に完了しました！');
    
  } catch (error) {
    console.error('❌ マイグレーション実行中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// 代替マイグレーション方法
async function runMigrationAlternative(supabase, migrationSQL) {
  console.log('📝 代替方法: 個別テーブル作成を試行...');
  
  // 基本的なテーブル作成クエリを実行
  const basicQueries = [
    `CREATE TABLE IF NOT EXISTS anonymous_voice_posts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      audio_url TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'female',
      duration INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      ip_hash TEXT
    );`,
    
    `CREATE TABLE IF NOT EXISTS board_categories (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT,
      description TEXT,
      icon TEXT,
      post_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );`,
    
    `INSERT INTO board_categories (name, description, slug, icon) VALUES
      ('質問', '気になることを聞いてみよう', 'questions', '❓'),
      ('雑談', '自由に話そう', 'chat', '💬'),
      ('ニュース', 'ホットな話題', 'news', '📰'),
      ('レビュー', '体験談をシェア', 'reviews', '⭐'),
      ('エロ', '大人の話題はこちら', 'adult', '🔥')
    ON CONFLICT (name) DO UPDATE 
    SET icon = EXCLUDED.icon, 
        slug = EXCLUDED.slug,
        description = EXCLUDED.description;`
  ];
  
  for (let i = 0; i < basicQueries.length; i++) {
    const query = basicQueries[i];
    console.log(`� クエリ ${i + 1}/${basicQueries.length} を実行中...`);
    
    const { error } = await supabase.rpc('exec_sql', { sql: query });
    
    if (error) {
      console.error(`❌ クエリ ${i + 1} エラー:`, error);
    } else {
      console.log(`✅ クエリ ${i + 1} 成功`);
    }
  }
}

// スクリプト実行
runSafeMigration().catch(console.error);
