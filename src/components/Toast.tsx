'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X, AlertCircle, Info, XCircle } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose: () => void
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
}

// Стили в стиле сайта с glass morphism эффектами
const styles = {
  success: {
    container: 'backdrop-blur-md bg-emerald-50/90 border border-emerald-200/60 shadow-xl shadow-emerald-500/20',
    stripe: 'bg-gradient-to-r from-emerald-500 to-green-500',
    text: 'text-emerald-800',
    icon: 'text-emerald-600'
  },
  error: {
    container: 'backdrop-blur-md bg-red-50/90 border border-red-200/60 shadow-xl shadow-red-500/20',
    stripe: 'bg-gradient-to-r from-red-500 to-pink-500',
    text: 'text-red-800',
    icon: 'text-red-600'
  },
  info: {
    container: 'backdrop-blur-md bg-teal-50/90 border border-teal-200/60 shadow-xl shadow-teal-500/20',
    stripe: 'bg-gradient-to-r from-teal-500 to-cyan-500',
    text: 'text-teal-800',
    icon: 'text-teal-600'
  },
  warning: {
    container: 'backdrop-blur-md bg-amber-50/90 border border-amber-200/60 shadow-xl shadow-amber-500/20',
    stripe: 'bg-gradient-to-r from-amber-500 to-orange-500',
    text: 'text-amber-800',
    icon: 'text-amber-600'
  },
}

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const Icon = icons[type]
  const style = styles[type]

  useEffect(() => {
    // Анимация появления
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    // Анимация исчезновения
    const hideTimer = setTimeout(() => {
      setIsExiting(true)
      setIsVisible(false)
      setTimeout(onClose, 300) // Задержка для анимации
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`max-w-sm w-full transition-all duration-300 ease-out transform ${
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100 scale-100' 
          : isExiting
          ? 'translate-y-2 opacity-0 scale-95'
          : '-translate-y-2 opacity-0 scale-95'
      }`}
    >
      <div className={`rounded-xl overflow-hidden ${style.container}`}>
        {/* Градиентная полоска сверху как в cookie consent */}
        <div className={`w-full h-1 ${style.stripe}`}></div>
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium break-words leading-relaxed ${style.text}`}>
                {message}
              </p>
            </div>
            <button
              onClick={handleClose}
              className={`${style.icon} hover:opacity-70 transition-all duration-200 flex-shrink-0 ml-2 mt-0.5 hover:scale-110`}
              aria-label="Закрыть уведомление"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 