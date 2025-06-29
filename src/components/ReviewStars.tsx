'use client'

import { Star } from 'lucide-react'

interface ReviewStarsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}

export default function ReviewStars({ 
  rating, 
  size = 'md', 
  interactive = false, 
  onRatingChange 
}: ReviewStarsProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  const handleStarClick = (star: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(star)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => handleStarClick(star)}
          className={`
            ${sizeClasses[size]} 
            ${interactive ? 'hover:scale-110 transition-transform cursor-pointer' : 'cursor-default'}
          `}
        >
          <Star
            className={`
              w-full h-full transition-colors
              ${star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
              }
              ${interactive && 'hover:text-yellow-300'}
            `}
          />
        </button>
      ))}
    </div>
  )
} 