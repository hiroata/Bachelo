import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient();
    
    // 1. boardsテーブルが存在するかチェック
    const { data: existingBoards, error: checkError } = await supabase
      .from('boards')
      .select('id')
      .limit(1);
      
    if (!checkError) {
      // テーブルが既に存在する場合
      const { count } = await supabase
        .from('boards')
        .select('*', { count: 'exact', head: true });
        
      if (count && count > 0) {
        return NextResponse.json({ 
          success: true, 
          message: `既に${count}個の板が存在します` 
        });
      }
    }
    
    // 2. 初期板データを投入
    const boards = [
      // ニュース系
      { slug: 'newsplus', name: 'ニュース速報+', description: '最新ニュースについて語る板', category: 'ニュース', display_order: 1, default_name: '名無しさん' },
      { slug: 'news', name: 'ニュース速報', description: 'ニュース全般', category: 'ニュース', display_order: 2, default_name: '名無しさん' },
      { slug: 'news4vip', name: 'ニュー速VIP', description: 'なんでも雑談', category: 'ニュース', display_order: 3, default_name: '以下、名無しにかわりましてVIPがお送りします' },
      
      // 雑談系
      { slug: 'livejupiter', name: 'なんでも実況J', description: 'なんJ', category: '雑談', display_order: 10, default_name: '風吹けば名無し' },
      { slug: 'morningcoffee', name: 'モーニング娘。（狼）', description: 'ハロプロ・芸能雑談', category: '雑談', display_order: 11, default_name: '名無し募集中。。。' },
      { slug: 'poverty', name: '嫌儲', description: 'ニュース雑談', category: '雑談', display_order: 12, default_name: '番組の途中ですがアフィサイトへの転載は禁止です' },
      
      // 趣味系
      { slug: 'gamesm', name: 'ゲーム速報', description: 'ゲーム総合', category: '趣味', display_order: 20, default_name: '名無しさん' },
      { slug: 'anime', name: 'アニメ', description: 'アニメ作品について', category: '趣味', display_order: 21, default_name: '名無しさん' },
      { slug: 'comic', name: '漫画', description: '漫画作品について', category: '趣味', display_order: 22, default_name: '名無しさん' },
      { slug: 'music', name: '音楽', description: '音楽全般', category: '趣味', display_order: 23, default_name: '名無しさん' },
      { slug: 'movie', name: '映画', description: '映画作品について', category: '趣味', display_order: 24, default_name: '名無しさん' },
      { slug: 'sports', name: 'スポーツ', description: 'スポーツ全般', category: '趣味', display_order: 25, default_name: '名無しさん' },
      
      // 生活系
      { slug: 'fashion', name: 'ファッション', description: 'ファッション・美容', category: '生活', display_order: 30, default_name: '名無しさん' },
      { slug: 'food', name: '料理・グルメ', description: '食べ物・料理について', category: '生活', display_order: 31, default_name: '名無しさん' },
      { slug: 'love', name: '恋愛', description: '恋愛相談・体験談', category: '生活', display_order: 32, default_name: '名無しさん' },
      { slug: 'job', name: '仕事', description: '仕事・転職・キャリア', category: '生活', display_order: 33, default_name: '名無しさん' },
      { slug: 'money', name: 'お金', description: '投資・節約・マネー', category: '生活', display_order: 34, default_name: '名無しさん' },
      
      // 専門系
      { slug: 'tech', name: 'プログラミング', description: 'IT技術・プログラミング', category: '専門', display_order: 40, default_name: '名無しさん' },
      { slug: 'science', name: '科学', description: '科学・学問', category: '専門', display_order: 41, default_name: '名無しさん' },
      { slug: 'health', name: '健康', description: '健康・医療', category: '専門', display_order: 42, default_name: '名無しさん' }
    ];
    
    const { error: insertError } = await supabase
      .from('boards')
      .insert(boards);
      
    if (insertError) {
      console.error('板の作成に失敗:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: insertError.message 
      }, { status: 500 });
    }
    
    // 3. 板ごとの設定を更新
    const { error: updateError } = await supabase
      .from('boards')
      .update({
        settings: {
          require_email: false,
          enable_id: true,
          enable_trip: true,
          max_file_size: 5242880,
          allowed_file_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          thread_autosage: 1000,
          thread_autoarchive: 1000
        }
      })
      .is('settings', null);
      
    if (updateError) {
      console.error('設定の更新に失敗:', updateError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${boards.length}個の板を作成しました`,
      boards: boards.length
    });
    
  } catch (error) {
    console.error('セットアップエラー:', error);
    return NextResponse.json({ 
      success: false, 
      error: '板の作成に失敗しました' 
    }, { status: 500 });
  }
}