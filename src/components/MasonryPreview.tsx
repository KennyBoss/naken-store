'use client'

import { useState, useEffect } from 'react'
// import { MASONRY_SIZES } from '@/lib/image-processing'

interface SizeOption {
  key: string
  width: number
  height: number
  ratio: string
  category: string
  description: string
}

interface MasonryPreviewProps {
  onSizeSelect?: (sizeKey: string) => void
  selectedSize?: string
  showUpload?: boolean
}

export default function MasonryPreview({ onSizeSelect, selectedSize, showUpload = false }: MasonryPreviewProps) {
  const [sizes, setSizes] = useState<SizeOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/upload/sizes')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSizes(data.allSizes)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const categories = {
    square: sizes.filter(s => s.category === 'square'),
    portrait: sizes.filter(s => s.category === 'portrait'),
    landscape: sizes.filter(s => s.category === 'landscape'),
    special: sizes.filter(s => s.category === 'special')
  }

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Размеры изображений для Masonry сетки
        </h2>
        <p className="text-gray-600">
          Выберите размер или загрузите изображение для автоматического определения
        </p>
      </div>

      {/* Категории размеров */}
      {Object.entries(categories).map(([categoryKey, categoryItems]) => (
        <div key={categoryKey} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 capitalize border-b pb-2">
            {getCategoryTitle(categoryKey)} ({categoryItems.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryItems.map((size) => (
              <div
                key={size.key}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedSize === size.key 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSizeSelect?.(size.key)}
              >
                {/* Превью размера */}
                <div className="flex items-center justify-center mb-3 bg-gray-100 rounded">
                  <div
                    className="bg-gradient-to-br from-blue-400 to-purple-500 rounded shadow-sm"
                    style={{
                      width: Math.min(size.width / 2, 120),
                      height: Math.min(size.height / 2, 120),
                      maxWidth: '120px',
                      maxHeight: '120px'
                    }}
                  />
                </div>

                {/* Информация о размере */}
                <div className="text-center space-y-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {size.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {size.width} × {size.height}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {size.ratio}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">
                    {size.description}
                  </p>
                </div>

                {/* Индикатор выбора */}
                {selectedSize === size.key && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Специальные опции */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Специальные опции
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Автоматический размер */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedSize === 'auto' 
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSizeSelect?.('auto')}
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Автоматически</h4>
              <p className="text-xs text-gray-600">
                Размер определится автоматически на основе исходного изображения
              </p>
            </div>
          </div>

          {/* Случайный размер */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedSize === 'random' 
                ? 'border-purple-500 bg-purple-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSizeSelect?.('random')}
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Случайный</h4>
              <p className="text-xs text-gray-600">
                Случайный размер для создания интересной Masonry сетки
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ограничения */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Ограничения загрузки:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Минимальный размер: 300×300 пикселей</li>
          <li>• Максимальный размер: 1600×2400 пикселей</li>
          <li>• Максимальный размер файла: 5 МБ</li>
          <li>• Форматы: JPEG, PNG, WebP</li>
          <li>• Изображения автоматически оптимизируются</li>
        </ul>
      </div>
    </div>
  )
}

function getCategoryTitle(key: string): string {
  const titles: Record<string, string> = {
    square: '🟧 Квадратные',
    portrait: '📱 Портретные', 
    landscape: '🖼️ Альбомные',
    special: '✨ Специальные'
  }
  return titles[key] || key
} 