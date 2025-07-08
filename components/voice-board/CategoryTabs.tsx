'use client'

interface CategoryTabsProps {
  activeCategory: 'female' | 'male' | 'couple'
  onCategoryChange: (category: 'female' | 'male' | 'couple') => void
}

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const categories = [
    { 
      id: 'female', 
      label: '女性の声', 
      emoji: '👩',
      bgColor: 'bg-pink-500',
      borderColor: 'border-pink-500'
    },
    { 
      id: 'male', 
      label: '男性の声', 
      emoji: '👨',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-500'
    },
    { 
      id: 'couple', 
      label: 'カップルの声', 
      emoji: '💑',
      bgColor: 'bg-cyan-500',
      borderColor: 'border-cyan-500'
    }
  ] as const

  return (
    <div className="bg-white px-4 py-6 border-b-4 border-gray-800">
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`relative flex flex-col items-center p-4 rounded-full transition-all ${
              activeCategory === category.id ? 'scale-110' : 'scale-100'
            }`}
          >
            {/* 円形背景 */}
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center text-3xl
              border-4 ${category.borderColor} ${category.bgColor}
              ${activeCategory === category.id ? 'ring-4 ring-offset-2 ring-gray-300' : ''}
            `}>
              <span className="text-white">{category.emoji}</span>
            </div>
            
            {/* ラベル */}
            <span className={`
              mt-2 px-3 py-1 rounded-full text-sm font-medium text-white
              ${category.bgColor}
            `}>
              {category.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}