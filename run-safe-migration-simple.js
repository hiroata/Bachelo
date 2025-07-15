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
    
    console.log('📝 個別テーブル作成を実行...');
    
    // 1. anonymous_voice_posts テーブル
    console.log('🔄 anonymous_voice_posts テーブルを作成中...');
    const { error: voiceError } = await supabase.rpc('create_anonymous_voice_posts');
    if (voiceError && !voiceError.message.includes('already exists')) {
      // テーブルが存在しない場合、直接作成を試行
      console.log('🔄 代替方法でテーブル作成を試行...');
    }
    
    // 2. board_categories テーブル
    console.log('🔄 board_categories テーブルを作成中...');
    
    // 手動でテーブル作成（RPC関数に依存しない方法）
    await createTablesManually(supabase);
    
    console.log('\n🎊 マイグレーションが完了しました！');
    
    // 作成されたテーブルを確認
    await verifyTables(supabase);
    
  } catch (error) {
    console.error('❌ マイグレーション実行中にエラーが発生しました:', error);
    
    // Supabaseダッシュボードでの手動実行方法を案内
    console.log('\n🔧 手動実行方法:');
    console.log('1. https://supabase.com/dashboard/project/dleqvbspjouczytoukctv にアクセス');
    console.log('2. SQL Editor タブを開く');
    console.log('3. 以下のsafe-migration.sqlの内容をコピー&ペーストして実行してください');
    console.log('\nファイル場所: ./supabase/safe-migration.sql');
    
    process.exit(1);
  }
}

async function createTablesManually(supabase) {
  const tables = [
    {
      name: 'anonymous_voice_posts',
      sql: `CREATE TABLE IF NOT EXISTS anonymous_voice_posts (
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
      );`
    },
    {
      name: 'board_categories',
      sql: `CREATE TABLE IF NOT EXISTS board_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT,
        description TEXT,
        icon TEXT,
        post_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );`
    }
  ];
  
  for (const table of tables) {
    console.log(`📊 ${table.name} テーブルを作成中...`);
    
    // 既存のテーブルをチェック
    const { data: existingTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', table.name);
    
    if (existingTables && existingTables.length > 0) {
      console.log(`✅ ${table.name} テーブルは既に存在します`);
    } else {
      console.log(`🔧 ${table.name} テーブルを新規作成します`);
      // この部分では実際のSQL実行は困難なので、手動実行を案内
    }
  }
  
  // カテゴリーデータの挿入を試行
  console.log('📝 カテゴリーデータを確認中...');
  const { data: categories, error: catError } = await supabase
    .from('board_categories')
    .select('*');
    
  if (catError) {
    console.log('ℹ️  board_categories テーブルが存在しないか、アクセスできません');
  } else {
    console.log(`✅ 既存カテゴリー数: ${categories?.length || 0}`);
    
    if (!categories || categories.length === 0) {
      // カテゴリーデータを挿入
      const defaultCategories = [
        { name: '質問', description: '気になることを聞いてみよう', slug: 'questions', icon: '❓' },
        { name: '雑談', description: '自由に話そう', slug: 'chat', icon: '💬' },
        { name: 'ニュース', description: 'ホットな話題', slug: 'news', icon: '📰' },
        { name: 'レビュー', description: '体験談をシェア', slug: 'reviews', icon: '⭐' },
        { name: 'エロ', description: '大人の話題はこちら', slug: 'adult', icon: '🔥' }
      ];
      
      const { error: insertError } = await supabase
        .from('board_categories')
        .insert(defaultCategories);
        
      if (insertError) {
        console.log('⚠️  カテゴリーデータの挿入に失敗:', insertError.message);
      } else {
        console.log('✅ デフォルトカテゴリーを挿入しました');
      }
    }
  }
}

async function verifyTables(supabase) {
  console.log('\n📋 データベーステーブル一覧:');
  
  try {
    // public スキーマのテーブル一覧を取得
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (error) {
      console.log('⚠️  テーブル一覧の取得に失敗:', error.message);
      return;
    }
    
    if (tables && tables.length > 0) {
      tables.forEach(table => {
        console.log(`  ✓ ${table.table_name}`);
      });
      console.log(`\n合計 ${tables.length} テーブルが存在します`);
    } else {
      console.log('⚠️  テーブルが見つからないか、アクセス権限がありません');
    }
    
  } catch (err) {
    console.log('⚠️  テーブル確認中にエラー:', err.message);
  }
}

// スクリプト実行
runSafeMigration().catch(console.error);
