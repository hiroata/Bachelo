import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient();
    
    // 閲覧数を増やす（まず現在の値を取得）
    const { data: currentPost } = await supabase
      .from('board_posts')
      .select('view_count')
      .eq('id', params.id)
      .single();
    
    if (currentPost) {
      await supabase
        .from('board_posts')
        .update({ view_count: (currentPost.view_count || 0) + 1 })
        .eq('id', params.id);
    }
    
    // 投稿データを取得
    const { data: post, error } = await supabase
      .from('board_posts')
      .select(`
        *,
        category:board_categories(*),
        images:board_post_images(*),
        replies:board_replies(*)
      `)
      .eq('id', params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - 投稿削除（30分以内の制限）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient();
    
    // IPアドレスを取得
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // 投稿を取得
    const { data: post, error: fetchError } = await supabase
      .from('board_posts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError) throw fetchError;
    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }

    // 作成から30分以内かチェック
    const createdAt = new Date(post.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (diffMinutes > 30) {
      return NextResponse.json(
        { error: '投稿から30分以上経過しているため削除できません' },
        { status: 403 }
      );
    }

    // IPアドレスが一致するかチェック（ハッシュ化されたIPで比較）
    if (post.ip_address !== ipHash) {
      return NextResponse.json(
        { error: 'この投稿を削除する権限がありません' },
        { status: 403 }
      );
    }

    // 関連する画像を削除
    const { data: images } = await supabase
      .from('board_post_images')
      .select('image_url')
      .eq('post_id', params.id);

    if (images && images.length > 0) {
      // Storageから画像を削除
      for (const image of images) {
        const path = image.image_url.split('/').pop();
        if (path) {
          await supabase.storage
            .from('images')
            .remove([path]);
        }
      }
    }

    // 投稿を削除（カスケードで関連データも削除される）
    const { error: deleteError } = await supabase
      .from('board_posts')
      .delete()
      .eq('id', params.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: '投稿の削除に失敗しました' },
      { status: 500 }
    );
  }
}