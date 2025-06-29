'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  keepAspectRatio?: boolean  // Новый параметр для сохранения пропорций
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  keepAspectRatio = true  // По умолчанию сохраняем пропорции для товаров
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }, [])

  const handleFiles = async (files: File[]) => {
    // Фильтруем только изображения
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('Пожалуйста, выберите файлы изображений')
      return
    }

    // Проверяем лимит
    if (images.length + imageFiles.length > maxImages) {
      alert(`Максимум ${maxImages} изображений`)
      return
    }

    setUploading(true)
    const newImages: string[] = []

    for (const file of imageFiles) {
      try {
        // Показываем прогресс
        const fileId = file.name + Date.now()
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        const formData = new FormData()
        formData.append('file', file)
        formData.append('keepRatio', keepAspectRatio.toString())

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          newImages.push(result.url)
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        } else {
          const errorData = await response.json()
          alert(`Ошибка загрузки ${file.name}: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Ошибка загрузки файла:', error)
        alert(`Ошибка загрузки ${file.name}`)
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages])
    }

    setUploading(false)
    setUploadProgress({})
    
    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (imageUrl: string) => {
    onImagesChange(images.filter(img => img !== imageUrl))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop зона */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 hover:bg-gray-50
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-75' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          ) : (
            <Upload className={`h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          )}
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Загружаем изображения...' : 'Перетащите изображения сюда'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              или нажмите для выбора файлов
            </p>
            <p className="text-xs text-gray-400 mt-2">
              JPG, PNG, WebP до 5MB • Максимум {maxImages} изображений
            </p>
          </div>
        </div>

        {/* Прогресс загрузки */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white rounded-lg p-3 shadow-lg border">
              <div className="text-xs text-gray-600 mb-2">Загружаем файлы...</div>
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="mb-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Превью загруженных изображений */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((image, index) => (
            <div key={image} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                <img
                  src={image}
                  alt={`Изображение ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Показываем placeholder если изображение не загрузилось
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const placeholder = target.nextElementSibling as HTMLElement
                    if (placeholder) placeholder.style.display = 'flex'
                  }}
                />
                <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              
              {/* Кнопка удаления */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(image)
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          hover:bg-red-600 focus:opacity-100"
              >
                <X size={14} />
              </button>

              {/* Индикатор порядка */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs 
                            px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Информация о количестве изображений */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {images.length} из {maxImages} изображений
        </span>
        {images.length > 0 && (
          <span className="text-xs">
            Первое изображение будет основным
          </span>
        )}
      </div>
    </div>
  )
} 