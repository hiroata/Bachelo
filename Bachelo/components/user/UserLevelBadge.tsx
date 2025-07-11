'use client';

import { useEffect, useState } from 'react';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';

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

interface UserLevelBadgeProps {
  userId: string;
  displayName: string;
  showDetails?: boolean;
  onPointsUpdate?: (points: number) => void;
}

export default function UserLevelBadge({ 
  userId, 
  displayName, 
  showDetails = false,
  onPointsUpdate 
}: UserLevelBadgeProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (userId) {
      loadOrCreateProfile();
    }
  }, [userId, displayName]);

  const loadOrCreateProfile = async () => {
    try {
      // プロフィールを取得
      let { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!existingProfile) {
        // プロフィールが存在しない場合は作成
        const { data: newProfile, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            display_name: displayName
          })
          .select()
          .single();

        if (error) throw error;
        existingProfile = newProfile;
      } else if (existingProfile.display_name !== displayName) {
        // 表示名が変わった場合は更新
        await supabase
          .from('user_profiles')
          .update({ display_name: displayName })
          .eq('user_id', userId);
      }

      setProfile(existingProfile);
      if (onPointsUpdate) {
        onPointsUpdate(existingProfile.total_points);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'text-purple-600 bg-purple-100';
    if (level >= 15) return 'text-red-600 bg-red-100';
    if (level >= 10) return 'text-orange-600 bg-orange-100';
    if (level >= 5) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 20) return <Trophy className="w-4 h-4" />;
    if (level >= 10) return <Star className="w-4 h-4" />;
    if (level >= 5) return <Award className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const getNextLevelPoints = (level: number) => {
    // 次のレベルに必要なポイント: (level)^2 * 100
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

  if (loading || !profile) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
        <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
        <span>Loading...</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      {/* レベルバッジ */}
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(profile.level)}`}>
        {getLevelIcon(profile.level)}
        <span>Lv.{profile.level}</span>
      </span>

      {/* 詳細表示 */}
      {showDetails && (
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            {profile.total_points.toLocaleString()}pt
          </span>
          <span>投稿: {profile.post_count}</span>
          <span>❤️ {profile.liked_count}</span>
          
          {/* レベル進捗バー */}
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-500"
              style={{ width: `${getCurrentLevelProgress()}%` }}
            />
          </div>
          <span className="text-xs">
            次のLvまで: {getNextLevelPoints(profile.level) - profile.total_points}pt
          </span>
        </div>
      )}

      {/* バッジ表示 */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="flex items-center gap-1">
          {profile.badges.slice(0, 3).map((badge, index) => (
            <span key={index} className="text-sm" title={badge.name}>
              {badge.icon}
            </span>
          ))}
          {profile.badges.length > 3 && (
            <span className="text-xs text-gray-500">+{profile.badges.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}