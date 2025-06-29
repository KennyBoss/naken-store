'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/context/ToastContext'
import ReviewStars from './ReviewStars'
import { Send } from 'lucide-react'

interface AddReviewFormProps {
  productId: string
  onReviewAdded?: () => void
}

export default function AddReviewForm({ productId, onReviewAdded }: AddReviewFormProps) {
  const { data: session } = useSession()
  const { success, error } = useToast()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!session) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border">
        <p className="text-gray-600 mb-4">Для добавления отзыва необходимо войти в аккаунт</p>
        <button 
          onClick={() => window.location.href = '/auth/signin'}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          Войти
        </button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      error('Пожалуйста, поставьте оценку')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка добавления отзыва')
      }

      success('Отзыв успешно добавлен!')
      setRating(0)
      setComment('')
      onReviewAdded?.()
    } catch (err) {
      error(err instanceof Error ? err.message : 'Ошибка добавления отзыва')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Оставить отзыв</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ваша оценка *
        </label>
        <ReviewStars 
          rating={rating} 
          interactive 
          onRatingChange={setRating} 
          size="lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Комментарий
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Поделитесь впечатлениями о товаре..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-vertical min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 символов
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Отправка...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Опубликовать отзыв
          </>
        )}
      </button>
    </form>
  )
} 