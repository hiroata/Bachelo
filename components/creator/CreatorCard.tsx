import Link from 'next/link'
import { Database } from '@/types/database'
import { PlayCircle } from 'lucide-react'

type Creator = Database['public']['Tables']['profiles']['Row']

interface CreatorCardProps {
  creator: Creator
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link href={`/creators/${creator.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xl font-bold">
                {creator.display_name[0]}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {creator.display_name}
            </h3>
            <p className="text-sm text-gray-500">@{creator.username}</p>
            
            {creator.bio && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {creator.bio}
              </p>
            )}
            
            {creator.tags && creator.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {creator.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="mt-3 flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-pink-500">
                  ¥{creator.price_per_10sec?.toLocaleString() || '---'}
                </span>
                <span className="text-sm text-gray-500 ml-1">/ 10秒</span>
              </div>
              
              {creator.sample_voice_url && (
                <button className="flex items-center space-x-1 text-pink-500 hover:text-pink-600">
                  <PlayCircle size={20} />
                  <span className="text-sm">サンプル</span>
                </button>
              )}
            </div>
            
            {creator.average_delivery_hours && (
              <p className="mt-2 text-xs text-gray-500">
                平均納期: {creator.average_delivery_hours}時間以内
              </p>
            )}
          </div>
        </div>
        
        {!creator.is_accepting_orders && (
          <div className="mt-4 text-center text-sm text-red-500 font-medium">
            現在受付停止中
          </div>
        )}
      </div>
    </Link>
  )
}