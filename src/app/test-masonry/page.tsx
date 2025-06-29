'use client'

import { useState } from 'react'
import MasonryPreview from '@/components/MasonryPreview'

export default function TestMasonryPage() {
  const [selectedSize, setSelectedSize] = useState<string>('auto')
  const [uploadedImages, setUploadedImages] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('sizePreference', selectedSize)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        
        if (result.success) {
          setUploadedImages(prev => [...prev, result])
        } else {
          alert(`Ошибка загрузки ${file.name}: ${result.error}`)
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error)
        alert(`Ошибка загрузки ${file.name}`)
      }
    }

    setUploading(false)
    // Очищаем input
    event.target.value = ''
  }

  const clearImages = () => {
    setUploadedImages([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Тест Masonry сетки изображений
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Демонстрация системы загрузки изображений с автоматической обработкой 
            для создания красивой Masonry сетки как в Pinterest
          </p>
        </div>

        {/* Блок загрузки */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <label className="flex-1">
              <span className="text-sm font-medium text-gray-700 block mb-2">
                Выберите изображения:
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50"
              />
            </label>
            
            {uploadedImages.length > 0 && (
              <button
                onClick={clearImages}
                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Очистить
              </button>
            )}
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Загрузка и обработка...</span>
            </div>
          )}

          <div className="text-sm text-gray-500">
            Выбранный размер: <span className="font-medium">
              {selectedSize === 'auto' ? 'Автоматический' : 
               selectedSize === 'random' ? 'Случайный' :
               selectedSize.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Результаты загрузки */}
        {uploadedImages.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Загруженные изображения ({uploadedImages.length})
            </h3>
            
            {/* Masonry сетка */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="break-inside-avoid bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={image.url}
                    alt={`Загруженное изображение ${index + 1}`}
                    className="w-full h-auto object-cover"
                    style={{
                      aspectRatio: `${image.metadata.width}/${image.metadata.height}`
                    }}
                  />
                  <div className="p-3 text-xs space-y-1">
                    <div className="font-medium text-gray-900">
                      {image.metadata.sizeKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                    <div className="text-gray-600">
                      {image.metadata.width} × {image.metadata.height} • {image.metadata.ratio}
                    </div>
                    <div className="text-gray-500">
                      {Math.round(image.metadata.processedSize / 1024)}KB 
                      {image.metadata.compressionRatio > 0 && (
                        <span className="text-green-600 ml-1">
                          (-{image.metadata.compressionRatio}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Превью размеров */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <MasonryPreview
            selectedSize={selectedSize}
            onSizeSelect={setSelectedSize}
          />
        </div>
      </div>
    </div>
  )
} 