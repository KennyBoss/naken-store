'use client'

import { formatDate } from '@/lib/utils'
import ReviewStars from './ReviewStars'
import { User } from 'lucide-react'

interface ReviewCardProps {
  id: string
  rating: number
  comment?: string
  createdAt: Date | string
  user: {
    name?: string
    email?: string
  }
}

export default function ReviewCard({ 
  rating, 
  comment, 
  createdAt, 
  user 
}: ReviewCardProps) {
  const displayName = user.name || user.email?.split('@')[0] || 'Анонимный пользователь'
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{displayName}</h4>
            <p className="text-sm text-gray-500">{formatDate(createdAt)}</p>
          </div>
        </div>
        <ReviewStars rating={rating} size="sm" />
      </div>
      
      {comment && (
        <p className="text-gray-700 leading-relaxed">{comment}</p>
      )}
    </div>
  )
} 