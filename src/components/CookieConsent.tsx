'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasConsent = localStorage.getItem('cookies-accepted')
      if (!hasConsent) {
        setIsVisible(true)
      }
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookies-accepted', 'true')
    setIsVisible(false)
    // Перезагружаем страницу для активации Yandex Metrika
    window.location.reload()
  }

  const declineCookies = () => {
    localStorage.setItem('cookies-accepted', 'false')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 m-4 sm:m-6">
      <div className="max-w-4xl mx-auto backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Градиентная полоска сверху */}
        <div className="w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
        
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🍪</div>
                <h3 className="text-lg font-medium text-gray-800">
                  Файлы cookie
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Мы используем cookie-файлы и Яндекс.Метрику для анализа посещаемости, 
                улучшения работы сайта и персонализации контента. Продолжая использование сайта, 
                вы соглашаетесь на обработку персональных данных согласно{' '}
                <a href="/privacy" className="text-teal-600 hover:text-teal-700 underline font-medium transition-colors">
                  Политике конфиденциальности
                </a>.
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={declineCookies}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm bg-white/40 border border-white/50 rounded-xl hover:bg-white/60 hover:shadow-lg transition-all duration-200"
              >
                Отклонить
              </button>
              <button
                onClick={acceptCookies}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 border border-white/20 rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-200"
              >
                Принять
              </button>
              <button
                onClick={declineCookies}
                className="p-2.5 text-gray-500 hover:text-gray-700 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl hover:bg-white/40 transition-all duration-200"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 