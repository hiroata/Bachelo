import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';


export const dynamic = 'force-dynamic';

interface PointAction {
  post: number;
  reply: number;
  liked: number;
  hot_post: number;
  trending_post: number;
  daily_login: number;
}

const POINT_VALUES: PointAction = {
  post: 10,        // 投稿作成
  reply: 5,        // 返信作成
  liked: 2,        // いいねをもらう
  hot_post: 50,    // ホット投稿になる
  trending_post: 30, // トレンド投稿になる
  daily_login: 5   // デイリーログイン
};

export async function POST(request: NextRequest) {
  try {
    const { userId, action, referenceId } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const points = POINT_VALUES[action as keyof PointAction];
    if (!points) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // ポイント履歴を追加
    const { error: historyError } = await supabase
      .from('point_history')
      .insert({
        user_id: userId,
        points,
        action,
        reference_id: referenceId
      });
    
    if (historyError) {
      console.error('Error adding point history:', historyError);
      return NextResponse.json({ error: 'Failed to add points' }, { status: 500 });
    }
    
    // ユーザープロファイルを更新
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    const newTotalPoints = profile.total_points + points;
    const newCurrentPoints = profile.current_points + points;
    const newLevel = Math.floor(Math.sqrt(newTotalPoints / 100)) + 1;
    
    // カウントを更新
    const updateData: any = {
      total_points: newTotalPoints,
      current_points: newCurrentPoints,
      level: newLevel,
      updated_at: new Date().toISOString()
    };
    
    if (action === 'post') {
      updateData.post_count = profile.post_count + 1;
    } else if (action === 'reply') {
      updateData.reply_count = profile.reply_count + 1;
    } else if (action === 'liked') {
      updateData.liked_count = profile.liked_count + 1;
    }
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
    
    // バッジチェック
    await checkAndAwardBadges(supabase, userId, updatedProfile);
    
    // レベルアップチェック
    const leveledUp = newLevel > profile.level;
    
    return NextResponse.json({
      points: points,
      totalPoints: newTotalPoints,
      currentLevel: newLevel,
      leveledUp,
      profile: updatedProfile
    });
    
  } catch (error) {
    console.error('Error in points API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// バッジ付与チェック
async function checkAndAwardBadges(supabase: any, userId: string, profile: any) {
  try {
    // すべてのバッジを取得
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*');
    
    if (!allBadges) return;
    
    const currentBadgeIds = profile.badges?.map((b: any) => b.id) || [];
    const newBadges = [];
    
    for (const badge of allBadges) {
      if (currentBadgeIds.includes(badge.id)) continue;
      
      let earned = false;
      
      switch (badge.type) {
        case 'post_count':
          earned = profile.post_count >= badge.threshold;
          break;
        case 'level':
          earned = profile.level >= badge.threshold;
          break;
        case 'liked_count':
          earned = profile.liked_count >= badge.threshold;
          break;
      }
      
      if (earned) {
        newBadges.push({
          id: badge.id,
          name: badge.name,
          icon: badge.icon,
          earned_at: new Date().toISOString()
        });
      }
    }
    
    if (newBadges.length > 0) {
      const allUserBadges = [...(profile.badges || []), ...newBadges];
      await supabase
        .from('user_profiles')
        .update({ badges: allUserBadges })
        .eq('user_id', userId);
    }
    
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}

// レベル取得API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const supabase = createClient();
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    return NextResponse.json({ profile });
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}