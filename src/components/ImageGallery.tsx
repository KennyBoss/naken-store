'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  initialIndex: number
  productName: string
}

export default function ImageGallery({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex, 
  productName 
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // ИСПРАВЛЕНО: обрабатываем локальные пути uploads
  const getImageSrc = (originalSrc: string) => {
    if (!originalSrc) return '/placeholder.jpg'
    
    // Если путь начинается с /uploads/, добавляем полный URL
    if (originalSrc.startsWith('/uploads/')) {
      return `https://naken.store${originalSrc}`
    }
    
    return originalSrc
  }

  // Обновляем текущий индекс когда меняется начальный
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // Блокируем скролл когда галерея открыта
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Обработка клавиш
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Touch handlers для swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isSwipe = Math.abs(distance) > 50
    
    if (isSwipe) {
      if (distance > 0) {
        // Swipe left - следующая картинка
        goToNext()
      } else {
        // Swipe right - предыдущая картинка
        goToPrevious()
      }
    }
  }

  if (!isOpen || images.length === 0) return null

  const currentImageSrc = getImageSrc(images[currentIndex])

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h3 className="font-semibold text-sm truncate">{productName}</h3>
            <p className="text-xs text-white/70">
              {currentIndex + 1} из {images.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={currentImageSrc}
          alt={`${productName} - фото ${currentIndex + 1}`}
          fill
          sizes="100vw"
          quality={90} // Высокое качество для детального просмотра
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          className="object-contain"
          onError={(e) => {
            console.log('🖼️ Ошибка загрузки изображения в галерее:', currentImageSrc)
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />

        {/* Navigation buttons - только если больше одной картинки */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </>
        )}
      </div>

      {/* Bottom indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                currentIndex === index ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Swipe indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
          <p className="text-white text-xs">Свайп ← → для листания</p>
        </div>
      )}
    </div>
  )
} 