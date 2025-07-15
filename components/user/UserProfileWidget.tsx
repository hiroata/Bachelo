'use client';

import { useEffect, useState } from 'react';
import { Trophy, Star, MessageSquare, Heart, TrendingUp, Award, Crown } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import UserLevelBadge from './UserLevelBadge';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  level: number;
  total_points: number;
  current_points: number;
  post_count: number;
  reply_count: number;
  liked_count: number;
  badges: any[];
}

export default function UserProfileWidget() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [monthlyMVP, setMonthlyMVP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_name') || '名無しさん';
    
    if (!userId) {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_id', newUserId);
      localStorage.setItem('user_name', userName);
    }
    
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const userName = localStorage.getItem('user_name') || '名無しさん';
      
      // 自分のプロフィール取得
      let { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!userProfile && userId) {
        // プロフィールがない場合は作成
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            display_name: userName
          })
          .select()
          .single();
        userProfile = newProfile;
      }
      
      setProfile(userProfile);
      
      // トップユーザー取得
      const { data: topUsersData } = await supabase
        .from('user_profiles')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(5);
      
      setTopUsers(topUsersData || []);
      
      // 今月のMVP取得
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data: mvpData } = await supabase
        .from('monthly_mvp')
        .select('*')
        .eq('month', currentMonth)
        .single();
      
      setMonthlyMVP(mvpData);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextLevelPoints = (level: number) => {
    return level * level * 100;
  };

  const getCurrentLevelProgress = () => {
    if (!profile) return 0;
    
    const currentLevelPoints = (profile.level - 1) * (profile.level - 1) * 100;
    const nextLevelPoints = getNextLevelPoints(profile.level);
    const pointsInCurrentLevel = profile.total_points - currentLevelPoints;
    const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints;
    
    return Math.min(100, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          ユーザーランキング
        </h2>
      </div>

      {/* 自分のステータス */}
      {profile && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">あなたのステータス</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{profile.display_name}</span>
              <UserLevelBadge 
                userId={profile.user_id} 
                displayName={profile.display_name}
                showDetails={false}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">レベル進捗</span>
                <span className="font-medium">{profile.total_points.toLocaleString()} / {getNextLevelPoints(profile.level).toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${getCurrentLevelProgress()}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-600">投稿</div>
                <div className="font-semibold">{profile.post_count}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-600">返信</div>
                <div className="font-semibold">{profile.reply_count}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-600">❤️</div>
                <div className="font-semibold">{profile.liked_count}</div>
              </div>
            </div>
            
            {/* バッジ */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="pt-2">
                <div className="text-xs text-gray-600 mb-1">獲得バッジ</div>
                <div className="flex flex-wrap gap-1">
                  {profile.badges.map((badge, index) => (
                    <span 
                      key={index} 
                      className="text-lg" 
                      title={badge.name}
                    >
                      {badge.icon}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 月間MVP */}
      {monthlyMVP && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">今月のMVP</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">{monthlyMVP.display_name}</span>
            <span className="text-sm text-yellow-700">
              {monthlyMVP.total_points.toLocaleString()}pt
            </span>
          </div>
        </div>
      )}

      {/* トップランカー */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">トップランカー</h3>
        <div className="space-y-2">
          {topUsers.map((user, index) => (
            <div 
              key={user.id}
              className={`flex items-center justify-between p-2 rounded ${
                index === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-bold ${
                  index === 0 ? 'text-yellow-600' : 
                  index === 1 ? 'text-gray-500' : 
                  index === 2 ? 'text-orange-600' : 
                  'text-gray-400'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <div className="font-medium text-sm">{user.display_name}</div>
                  <div className="text-xs text-gray-500">Lv.{user.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">
                  {user.total_points.toLocaleString()}pt
                </div>
                <div className="text-xs text-gray-500">
                  投稿{user.post_count} ❤️{user.liked_count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ポイント説明 */}
      <div className="px-4 pb-4">
        <details className="group">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            ポイントの獲得方法 ▼
          </summary>
          <div className="mt-2 text-xs text-gray-600 space-y-1 bg-gray-50 rounded p-3">
            <div>📝 投稿作成: +10pt</div>
            <div>💬 返信: +5pt</div>
            <div>❤️ いいねをもらう: +2pt</div>
            <div>🔥 ホット投稿: +50pt</div>
            <div>📈 トレンド入り: +30pt</div>
            <div>🌅 デイリーログイン: +5pt</div>
          </div>
        </details>
      </div>
    </div>
  );
}