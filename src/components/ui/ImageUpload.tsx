'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, GripVertical } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  keepAspectRatio?: boolean
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  keepAspectRatio = true
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

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

  // 🔥 НОВЫЕ ФУНКЦИИ ДЛЯ DRAG & DROP СОРТИРОВКИ
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleImageDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null) return
    
    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    
    // Удаляем перетаскиваемый элемент
    newImages.splice(draggedIndex, 1)
    
    // Вставляем на новое место
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newImages.splice(insertIndex, 0, draggedImage)
    
    onImagesChange(newImages)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const moveToFirst = (index: number) => {
    if (index === 0) return
    
    const newImages = [...images]
    const imageToMove = newImages[index]
    
    // Удаляем изображение с текущей позиции
    newImages.splice(index, 1)
    // Вставляем в начало
    newImages.unshift(imageToMove)
    
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onClick={openFileDialog}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          Перетащите изображения сюда или нажмите для выбора
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Поддерживаются: JPG, PNG, GIF (макс. {maxImages} файлов)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          handleFiles(files)
        }}
        className="hidden"
      />

      {/* Uploaded Images Grid with Drag & Drop */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Изображения ({images.length}/{maxImages})
            </h3>
            {images.length > 1 && (
              <p className="text-xs text-gray-500">
                Перетащите изображения для изменения порядка
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragLeave={handleImageDragLeave}
                onDrop={(e) => handleImageDrop(e, index)}
                className={`relative group bg-white rounded-lg border-2 transition-all duration-200 ${
                  index === 0 
                    ? 'border-green-500 shadow-lg ring-2 ring-green-200' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  dragOverIndex === index 
                    ? 'border-blue-500 bg-blue-50 scale-105' 
                    : ''
                } ${
                  draggedIndex === index 
                    ? 'opacity-50 scale-95' 
                    : ''
                }`}
              >
                {/* Главное изображение индикатор */}
                {index === 0 && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      Главное
                    </span>
                  </div>
                )}

                {/* Drag Handle */}
                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/80 rounded-md p-1 shadow-sm cursor-move">
                    <GripVertical size={16} className="text-gray-600" />
                  </div>
                </div>

                {/* Image */}
                <div className="aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={image}
                    alt={`Изображение ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                </div>

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveToFirst(index)
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors"
                      title="Сделать главным"
                    >
                      На первое место
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(image)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md transition-colors"
                    title="Удалить"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Position indicator */}
                <div className="absolute bottom-2 right-2 bg-white/80 text-gray-800 text-xs font-bold px-2 py-1 rounded-full">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" />
            <span className="text-sm text-gray-600">Загрузка изображений...</span>
          </div>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 