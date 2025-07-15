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

// Complete database schema setup
const setupQueries = [
  // Step 1: Create anonymous voice posts system
  `
  CREATE TABLE IF NOT EXISTS anonymous_voice_posts (
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
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS anonymous_post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES anonymous_voice_posts(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS anonymous_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES anonymous_voice_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    UNIQUE(post_id, ip_hash)
  );
  `,
  
  // Step 2: Create board system
  `
  CREATE TABLE IF NOT EXISTS board_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    description TEXT,
    icon TEXT,
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS board_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES board_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT DEFAULT '名無しさん',
    author_email TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    ip_hash TEXT,
    plus_count INTEGER DEFAULT 0,
    minus_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS board_post_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size INTEGER,
    mime_type TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS board_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES board_replies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT DEFAULT '名無しさん',
    author_email TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    plus_count INTEGER DEFAULT 0,
    minus_count INTEGER DEFAULT 0
  );
  `,
  
  // Step 3: Create voting system
  `
  CREATE TABLE IF NOT EXISTS board_post_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    UNIQUE(post_id, ip_hash)
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS board_reply_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reply_id UUID REFERENCES board_replies(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('plus', 'minus')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    UNIQUE(reply_id, ip_hash)
  );
  `,
  
  // Step 4: Create 5ch-style system
  `
  CREATE TABLE IF NOT EXISTS boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    display_order INTEGER DEFAULT 0,
    default_name TEXT DEFAULT '名無しさん',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    max_threads INTEGER DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    thread_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_post_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    post_count INTEGER DEFAULT 1,
    is_archived BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    UNIQUE(board_id, thread_number)
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    post_number INTEGER NOT NULL,
    author_name TEXT DEFAULT '名無しさん',
    author_email TEXT,
    author_id TEXT,
    author_trip TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    user_agent TEXT,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_reason TEXT,
    UNIQUE(thread_id, post_number)
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS post_anchors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    to_post_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS post_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Step 5: Create reporting system
  `
  CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'reply', 'thread')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    reporter_ip TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Step 6: Create NG words system
  `
  CREATE TABLE IF NOT EXISTS ng_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word TEXT NOT NULL UNIQUE,
    is_regex BOOLEAN DEFAULT false,
    action TEXT DEFAULT 'filter' CHECK (action IN ('filter', 'block', 'warn')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
  );
  `,
  
  // Step 7: Create user points system
  `
  CREATE TABLE IF NOT EXISTS user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_hash TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    last_post_at TIMESTAMPTZ,
    total_posts INTEGER DEFAULT 0,
    total_replies INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ip_hash)
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_ip TEXT NOT NULL,
    action TEXT NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Step 8: Create live chat system
  `
  CREATE TABLE IF NOT EXISTS live_chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_users INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  `
  CREATE TABLE IF NOT EXISTS live_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES live_chat_rooms(id) ON DELETE CASCADE,
    username TEXT DEFAULT 'Anonymous',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
  );
  `
];

// Index creation queries
const indexQueries = [
  'CREATE INDEX IF NOT EXISTS idx_anonymous_voice_posts_category ON anonymous_voice_posts(category);',
  'CREATE INDEX IF NOT EXISTS idx_anonymous_voice_posts_created_at ON anonymous_voice_posts(created_at);',
  'CREATE INDEX IF NOT EXISTS idx_board_posts_category_id ON board_posts(category_id);',
  'CREATE INDEX IF NOT EXISTS idx_board_posts_created_at ON board_posts(created_at);',
  'CREATE INDEX IF NOT EXISTS idx_board_replies_post_id ON board_replies(post_id);',
  'CREATE INDEX IF NOT EXISTS idx_threads_board_last_post ON threads(board_id, last_post_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_posts_thread_number ON posts(thread_id, post_number);',
  'CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);',
  'CREATE INDEX IF NOT EXISTS idx_user_points_ip_hash ON user_points(ip_hash);'
];

// Function creation queries
const functionQueries = [
  `
  CREATE OR REPLACE FUNCTION get_next_thread_number(board_uuid UUID)
  RETURNS INTEGER AS $$
  DECLARE
    next_number INTEGER;
  BEGIN
    SELECT COALESCE(MAX(thread_number), 0) + 1
    INTO next_number
    FROM threads
    WHERE board_id = board_uuid;
    
    RETURN next_number;
  END;
  $$ LANGUAGE plpgsql;
  `,
  
  `
  CREATE OR REPLACE FUNCTION get_next_post_number(thread_uuid UUID)
  RETURNS INTEGER AS $$
  DECLARE
    next_number INTEGER;
  BEGIN
    SELECT COALESCE(MAX(post_number), 0) + 1
    INTO next_number
    FROM posts
    WHERE thread_id = thread_uuid;
    
    RETURN next_number;
  END;
  $$ LANGUAGE plpgsql;
  `,
  
  `
  CREATE OR REPLACE FUNCTION update_thread_last_post()
  RETURNS TRIGGER AS $$
  BEGIN
    UPDATE threads
    SET 
      last_post_at = NEW.created_at,
      post_count = post_count + 1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.thread_id;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  `,
  
  `
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  `
];

// Trigger creation queries
const triggerQueries = [
  'DROP TRIGGER IF EXISTS trigger_update_thread_last_post ON posts;',
  `CREATE TRIGGER trigger_update_thread_last_post
   AFTER INSERT ON posts
   FOR EACH ROW
   EXECUTE FUNCTION update_thread_last_post();`,
   
  'DROP TRIGGER IF EXISTS update_board_categories_updated_at ON board_categories;',
  `CREATE TRIGGER update_board_categories_updated_at 
   BEFORE UPDATE ON board_categories
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
   
  'DROP TRIGGER IF EXISTS update_board_posts_updated_at ON board_posts;',
  `CREATE TRIGGER update_board_posts_updated_at 
   BEFORE UPDATE ON board_posts
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`
];

async function setupCompleteDatabase() {
  console.log('🚀 Bachelo 完全データベースセットアップ開始\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  try {
    await client.connect();
    console.log('✅ データベース接続成功\n');
    
    // Step 1: Create tables
    console.log('📊 テーブル作成中...');
    for (let i = 0; i < setupQueries.length; i++) {
      try {
        await client.query(setupQueries[i]);
        successCount++;
        console.log(`  ✅ テーブル ${i + 1}/${setupQueries.length} 作成完了`);
      } catch (error) {
        errorCount++;
        console.log(`  ⚠️ テーブル ${i + 1}/${setupQueries.length} スキップ: ${error.message.substring(0, 100)}...`);
      }
    }
    
    // Step 2: Create indexes
    console.log('\n🗂️ インデックス作成中...');
    for (let i = 0; i < indexQueries.length; i++) {
      try {
        await client.query(indexQueries[i]);
        console.log(`  ✅ インデックス ${i + 1}/${indexQueries.length} 作成完了`);
      } catch (error) {
        console.log(`  ⚠️ インデックス ${i + 1}/${indexQueries.length} スキップ: ${error.message.substring(0, 50)}...`);
      }
    }
    
    // Step 3: Create functions
    console.log('\n⚙️ 関数作成中...');
    for (let i = 0; i < functionQueries.length; i++) {
      try {
        await client.query(functionQueries[i]);
        console.log(`  ✅ 関数 ${i + 1}/${functionQueries.length} 作成完了`);
      } catch (error) {
        console.log(`  ⚠️ 関数 ${i + 1}/${functionQueries.length} スキップ: ${error.message.substring(0, 50)}...`);
      }
    }
    
    // Step 4: Create triggers
    console.log('\n🔧 トリガー作成中...');
    for (let i = 0; i < triggerQueries.length; i++) {
      try {
        await client.query(triggerQueries[i]);
        console.log(`  ✅ トリガー ${Math.floor((i + 1) / 2) + 1} 作成完了`);
      } catch (error) {
        console.log(`  ⚠️ トリガー ${Math.floor((i + 1) / 2) + 1} スキップ: ${error.message.substring(0, 50)}...`);
      }
    }
    
    // Step 5: Disable RLS
    console.log('\n🔓 RLS無効化中...');
    const tables = [
      'anonymous_voice_posts', 'anonymous_post_comments', 'anonymous_post_likes',
      'board_categories', 'board_posts', 'board_post_images', 'board_replies',
      'board_post_votes', 'board_reply_votes',
      'boards', 'threads', 'posts', 'post_anchors', 'post_images',
      'reports', 'ng_words', 'user_points', 'point_transactions',
      'live_chat_rooms', 'live_chat_messages'
    ];
    
    for (const table of tables) {
      try {
        await client.query(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);
        console.log(`  ✅ ${table} RLS無効化`);
      } catch (error) {
        console.log(`  ⚠️ ${table} RLS無効化スキップ`);
      }
    }
    
    // Step 6: Insert initial data
    console.log('\n📝 初期データ投入中...');
    
    // Categories
    const categories = [
      { name: '質問', slug: 'questions', description: '技術的な質問や相談', icon: '❓' },
      { name: '雑談', slug: 'general', description: '自由な話題で交流', icon: '💬' },
      { name: 'ニュース', slug: 'news', description: '最新情報やお知らせ', icon: '📰' },
      { name: 'レビュー', slug: 'reviews', description: '商品やサービスのレビュー', icon: '⭐' },
      { name: 'テクノロジー', slug: 'tech', description: 'IT・プログラミング関連', icon: '💻' },
      { name: 'エンターテイメント', slug: 'entertainment', description: '映画・音楽・ゲーム', icon: '🎮' }
    ];
    
    for (const category of categories) {
      try {
        await client.query(
          `INSERT INTO board_categories (name, slug, description, icon, is_active) 
           VALUES ($1, $2, $3, $4, true) 
           ON CONFLICT (name) DO NOTHING;`,
          [category.name, category.slug, category.description, category.icon]
        );
        console.log(`  ✅ カテゴリー「${category.name}」投入完了`);
      } catch (error) {
        console.log(`  ⚠️ カテゴリー「${category.name}」スキップ`);
      }
    }
    
    // Boards
    const boards = [
      { slug: 'newsplus', name: 'ニュース速報+', description: '最新ニュースについて語る板', category: 'ニュース' },
      { slug: 'livejupiter', name: 'なんでも実況J', description: 'なんJ', category: '雑談' },
      { slug: 'news4vip', name: 'ニュー速VIP', description: 'なんでも雑談', category: '雑談' },
      { slug: 'tech', name: 'プログラミング', description: 'IT技術・プログラミング', category: '専門' }
    ];
    
    for (const board of boards) {
      try {
        await client.query(
          `INSERT INTO boards (slug, name, description, category, default_name) 
           VALUES ($1, $2, $3, $4, '名無しさん') 
           ON CONFLICT (slug) DO NOTHING;`,
          [board.slug, board.name, board.description, board.category]
        );
        console.log(`  ✅ 板「${board.name}」投入完了`);
      } catch (error) {
        console.log(`  ⚠️ 板「${board.name}」スキップ`);
      }
    }
    
    // NG Words
    const ngWords = ['spam', 'advertisement', '広告', 'アダルト'];
    for (const word of ngWords) {
      try {
        await client.query(
          `INSERT INTO ng_words (word, action) VALUES ($1, 'filter') ON CONFLICT (word) DO NOTHING;`,
          [word]
        );
      } catch (error) {
        // Ignore errors for NG words
      }
    }
    
    // Live chat room
    try {
      await client.query(
        `INSERT INTO live_chat_rooms (name, description) 
         VALUES ('メインチャット', '一般的な雑談用チャットルーム') 
         ON CONFLICT DO NOTHING;`
      );
      console.log('  ✅ ライブチャットルーム作成完了');
    } catch (error) {
      console.log('  ⚠️ ライブチャットルーム作成スキップ');
    }
    
    // Step 7: Final statistics
    console.log('\n📊 最終統計情報:');
    
    const tableCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    
    const categoryCount = await client.query('SELECT COUNT(*) as count FROM board_categories;');
    const boardCount = await client.query('SELECT COUNT(*) as count FROM boards;');
    
    console.log(`  📋 総テーブル数: ${tableCount.rows[0].count}`);
    console.log(`  📂 カテゴリー数: ${categoryCount.rows[0].count}`);
    console.log(`  🏠 板数: ${boardCount.rows[0].count}`);
    console.log(`  ✅ 成功操作: ${successCount}`);
    console.log(`  ⚠️ スキップ操作: ${errorCount}`);
    
    console.log('\n🎉 データベースセットアップ完了！');
    console.log('\n次のステップ:');
    console.log('1. node diagnose-and-populate-database.js でサンプルデータを投入');
    console.log('2. npm run dev でアプリケーション起動');
    console.log('3. http://localhost:3000 で動作確認');
    
  } catch (error) {
    console.error('❌ セットアップエラー:', error.message);
  } finally {
    await client.end();
    console.log('\n📡 データベース接続終了');
  }
}

// Run setup
if (require.main === module) {
  setupCompleteDatabase();
}

module.exports = { setupCompleteDatabase };