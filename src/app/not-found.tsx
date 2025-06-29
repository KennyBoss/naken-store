'use client'

import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-light text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-light mb-6 text-gray-700">
          Страница не найдена
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Извините, страница которую вы ищете не существует или была перемещена.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            <Home size={20} />
            Главная страница
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            Назад
          </button>
        </div>
      </div>
    </div>
  )
} 