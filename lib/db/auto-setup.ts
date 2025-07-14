import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * 掲示板の自動セットアップ
 * テーブルが存在しない場合は自動で作成し、初期データを投入
 */
export class BoardAutoSetup {
  private supabase;
  
  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * セットアップのメイン処理
   */
  async setup(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🚀 掲示板の自動セットアップを開始...');
      
      // 1. テーブルの存在確認
      const tablesExist = await this.checkTablesExist();
      
      if (!tablesExist) {
        console.log('📦 テーブルが存在しません。作成します...');
        await this.createTables();
      } else {
        console.log('✅ テーブルは既に存在します');
      }
      
      // 2. カテゴリーの確認と作成
      const categoriesExist = await this.checkCategoriesExist();
      
      if (!categoriesExist) {
        console.log('📝 初期カテゴリーを作成します...');
        await this.createInitialCategories();
      } else {
        console.log('✅ カテゴリーは既に存在します');
      }
      
      console.log('🎉 セットアップ完了！');
      return { success: true, message: 'セットアップが完了しました' };
      
    } catch (error) {
      console.error('❌ セットアップエラー:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'セットアップに失敗しました' 
      };
    }
  }

  /**
   * テーブルの存在確認
   */
  private async checkTablesExist(): Promise<boolean> {
    try {
      // board_categoriesテーブルに簡単なクエリを実行
      const { error } = await this.supabase
        .from('board_categories')
        .select('id')
        .limit(1);
      
      // エラーがなければテーブルは存在する
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * カテゴリーの存在確認
   */
  private async checkCategoriesExist(): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('board_categories')
      .select('id')
      .limit(1);
    
    return !error && data && data.length > 0;
  }

  /**
   * テーブルの作成
   */
  private async createTables(): Promise<void> {
    // 注意: Supabase JSクライアントでは直接的なCREATE TABLE文は実行できません
    // これらのSQLはSupabaseダッシュボードで一度だけ実行する必要があります
    // または、Supabase CLIのマイグレーション機能を使用します
    
    throw new Error(`
      テーブルの自動作成にはSupabaseダッシュボードでのSQL実行が必要です。
      以下のファイルのSQLを順番に実行してください：
      1. /supabase/migrations/002_create_board_system.sql
      2. /supabase/migrations/003_add_voting_system.sql
      
      または、より簡単な方法として、以下のコマンドを実行してください：
      npx supabase db push
    `);
  }

  /**
   * 初期カテゴリーの作成
   */
  private async createInitialCategories(): Promise<void> {
    const categories = [
      { name: '雑談', slug: 'general', description: '自由に話せる雑談掲示板', display_order: 1 },
      { name: '質問', slug: 'questions', description: '質問や相談ができる掲示板', display_order: 2 },
      { name: 'ニュース', slug: 'news', description: '最新ニュースや話題を共有', display_order: 3 },
      { name: '趣味', slug: 'hobby', description: '趣味の話題で盛り上がろう', display_order: 4 },
      { name: '地域', slug: 'local', description: '地域の情報交換', display_order: 5 },
    ];

    const { error } = await this.supabase
      .from('board_categories')
      .insert(categories);

    if (error) {
      throw new Error(`カテゴリーの作成に失敗: ${error.message}`);
    }
  }

  /**
   * サンプル投稿の作成（オプション）
   */
  async createSamplePosts(): Promise<void> {
    // 最初のカテゴリーを取得
    const { data: categories } = await this.supabase
      .from('board_categories')
      .select('id')
      .limit(1);

    if (!categories || categories.length === 0) return;

    const samplePosts = [
      {
        category_id: categories[0].id,
        author_name: '管理人',
        title: '掲示板へようこそ！',
        content: 'この掲示板は誰でも自由に投稿できます。楽しく交流しましょう！',
        ip_address: '127.0.0.1',
      },
      {
        category_id: categories[0].id,
        author_name: '匿名さん',
        title: 'はじめまして',
        content: 'よろしくお願いします〜',
        ip_address: '127.0.0.2',
      },
    ];

    await this.supabase
      .from('board_posts')
      .insert(samplePosts);
  }
}

/**
 * シングルトンインスタンス
 */
let setupInstance: BoardAutoSetup | null = null;

export async function runBoardSetup(): Promise<{ success: boolean; message: string }> {
  if (!setupInstance) {
    setupInstance = new BoardAutoSetup();
  }
  return await setupInstance.setup();
}