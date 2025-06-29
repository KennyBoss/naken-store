'use client'

import { useState, useEffect } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Автоматически скрываем splash screen через 3 секунды
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500) // Даем время на анимацию скрытия
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center opacity-0 transition-opacity duration-500 pointer-events-none">
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Логотип с анимацией */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 animate-pulse">
            NAKEN
          </h1>
          <p className="text-xl text-teal-500 mt-2 animate-bounce">
            Стильная одежда
          </p>
        </div>

        {/* Анимированный загрузчик */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Текст загрузки */}
        <p className="text-gray-600 animate-pulse">
          Загружаем лучшую одежду для вас...
        </p>
      </div>
    </div>
  )
} 