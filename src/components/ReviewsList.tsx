'use client'

import { useState, useEffect } from 'react'
import ReviewCard from './ReviewCard'
import AddReviewForm from './AddReviewForm'
import ReviewStars from './ReviewStars'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  user: {
    name?: string
    email?: string
  }
}

interface ReviewsListProps {
  productId: string
  productSlug?: string
}

export default function ReviewsList({ productId, productSlug }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: [0, 0, 0, 0, 0] // 1-5 звезд
  })

  const loadReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reviews?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [productId])

  const handleReviewAdded = () => {
    loadReviews()
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Статистика отзывов */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Отзывы ({stats.totalReviews})
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showForm ? 'Скрыть форму' : 'Написать отзыв'}
          </button>
        </div>

        {stats.totalReviews > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ReviewStars rating={stats.averageRating} size="lg" />
              <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
              <span className="text-gray-500">из 5</span>
            </div>
            
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${stats.totalReviews > 0 
                          ? (stats.ratingDistribution[star - 1] / stats.totalReviews) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                  <span className="w-8 text-gray-500">
                    {stats.ratingDistribution[star - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Форма добавления отзыва */}
      {showForm && (
        <AddReviewForm 
          productId={productId} 
          onReviewAdded={handleReviewAdded}
        />
      )}

      {/* Список отзывов */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Пока нет отзывов</p>
            <p className="text-sm">Будьте первым, кто оставит отзыв!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))
        )}
      </div>
    </div>
  )
} 