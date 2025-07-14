import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// .env.localファイルを読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateData() {
  console.log('🚀 5ch型掲示板への移行を開始します...');

  try {
    // 1. カテゴリーから板を作成（既に作成済みの場合はスキップ）
    console.log('📋 板の確認...');
    const { count: boardCount } = await supabase
      .from('boards')
      .select('*', { count: 'exact', head: true });
    
    if (boardCount === 0) {
      console.log('❌ 板が見つかりません。先にマイグレーションを実行してください。');
      return;
    }
    console.log(`✅ ${boardCount}個の板を確認しました。`);

    // 2. 既存の投稿をスレッドに変換
    console.log('\n📝 既存の投稿をスレッドに変換中...');
    const { data: posts, error: postsError } = await supabase
      .from('board_posts')
      .select('*, category:board_categories(*)')
      .order('created_at', { ascending: true });

    if (postsError) {
      console.error('投稿の取得に失敗:', postsError);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('移行する投稿がありません。');
      return;
    }

    console.log(`${posts.length}個の投稿を移行します...`);

    // カテゴリーと板のマッピング
    const categoryToBoardMap: Record<string, string> = {
      '雑談': 'livejupiter',
      '恋愛': 'love',
      'ゲーム': 'gamesm',
      'アニメ・漫画': 'anime',
      '音楽': 'music',
      '映画・ドラマ': 'movie',
      'スポーツ': 'sports',
      '仕事・キャリア': 'job',
      '美容・ファッション': 'fashion',
      '料理・グルメ': 'food',
      '旅行': 'newsplus',
      'ペット': 'news',
      '健康・医療': 'health',
      'お金・投資': 'money',
      '学生': 'news4vip',
      '既婚者': 'morningcoffee',
      '独身': 'poverty',
      '地域': 'newsplus',
      '動画・画像': 'news',
      'イラスト・創作': 'comic'
    };

    // 板の取得
    const { data: boards } = await supabase
      .from('boards')
      .select('*');

    const boardMap = new Map(boards?.map(b => [b.slug, b.id]) || []);

    let threadNumber = 1;
    for (const post of posts) {
      // 適切な板を選択
      const boardSlug = post.category?.name 
        ? categoryToBoardMap[post.category.name] || 'news4vip'
        : 'news4vip';
      
      const boardId = boardMap.get(boardSlug);
      if (!boardId) {
        console.error(`板が見つかりません: ${boardSlug}`);
        continue;
      }

      // スレッドを作成
      const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert({
          board_id: boardId,
          thread_number: threadNumber++,
          title: post.title,
          created_at: post.created_at,
          last_post_at: post.updated_at || post.created_at,
          post_count: 1
        })
        .select()
        .single();

      if (threadError) {
        console.error('スレッド作成エラー:', threadError);
        continue;
      }

      // 最初のレス（>>1）を作成
      const { error: firstPostError } = await supabase
        .from('posts')
        .insert({
          thread_id: thread.id,
          post_number: 1,
          author_name: post.author_name || '名無しさん',
          author_email: post.author_email,
          content: post.content,
          created_at: post.created_at,
          ip_hash: post.ip_address,
          user_agent: post.user_agent
        });

      if (firstPostError) {
        console.error('最初のレス作成エラー:', firstPostError);
        continue;
      }

      // 返信を移行
      const { data: replies } = await supabase
        .from('board_replies')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (replies && replies.length > 0) {
        let replyNumber = 2;
        for (const reply of replies) {
          const { error: replyError } = await supabase
            .from('posts')
            .insert({
              thread_id: thread.id,
              post_number: replyNumber++,
              author_name: reply.author_name || '名無しさん',
              author_email: reply.author_email,
              content: reply.content,
              created_at: reply.created_at,
              ip_hash: reply.ip_address,
              user_agent: reply.user_agent
            });

          if (replyError) {
            console.error('返信の移行エラー:', replyError);
          }
        }

        // スレッドのレス数を更新
        await supabase
          .from('threads')
          .update({ 
            post_count: replyNumber - 1,
            last_post_at: replies[replies.length - 1].created_at 
          })
          .eq('id', thread.id);
      }

      // 画像を移行
      const { data: images } = await supabase
        .from('board_post_images')
        .select('*')
        .eq('post_id', post.id);

      if (images && images.length > 0) {
        const { data: firstPost } = await supabase
          .from('posts')
          .select('id')
          .eq('thread_id', thread.id)
          .eq('post_number', 1)
          .single();

        if (firstPost) {
          for (const image of images) {
            await supabase
              .from('post_images')
              .insert({
                post_id: firstPost.id,
                image_url: image.image_url,
                thumbnail_url: image.thumbnail_url,
                file_size: image.file_size,
                mime_type: image.mime_type,
                display_order: image.display_order
              });
          }
        }
      }

      console.log(`✅ スレッド「${post.title}」を移行しました`);
    }

    console.log('\n✨ 移行が完了しました！');

    // 統計情報を表示
    const { count: threadCount } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true });
    
    const { count: postCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    console.log('\n📊 移行結果:');
    console.log(`- スレッド数: ${threadCount}`);
    console.log(`- レス数: ${postCount}`);

  } catch (error) {
    console.error('移行中にエラーが発生しました:', error);
  }
}

// スクリプトを実行
migrateData();