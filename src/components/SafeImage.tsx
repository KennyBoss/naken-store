'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  sizes?: string
  quality?: number
  priority?: boolean
  className?: string
  width?: number
  height?: number
  style?: React.CSSProperties
}

export default function SafeImage({
  src,
  alt,
  fill,
  sizes,
  quality = 85,
  priority = false,
  className,
  width,
  height,
  style
}: SafeImageProps) {
  const [useNativeImg, setUseNativeImg] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ИСПРАВЛЕНО: оставляем локальные пути как есть для nginx
  const getImageSrc = (originalSrc: string) => {
    if (!originalSrc) return '/placeholder.jpg'
    
    // 🐛 ДЕБАГ: проверяем что приходит
    console.log('🔄 SafeImage получил путь:', originalSrc)
    
    // Оставляем пути как есть - nginx должен обслуживать /uploads/ статично
    return originalSrc
  }

  const imageSrc = getImageSrc(src)

  // Если src начинается с http/https или это base64, используем обычный img
  const isExternalUrl = imageSrc?.startsWith('http://') || imageSrc?.startsWith('https://') || imageSrc?.startsWith('data:')
  
  // Функция для обработки ошибок загрузки
  const handleError = () => {
    setUseNativeImg(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // Используем обычный img для внешних URL или если Next Image не сработал
  if (useNativeImg || isExternalUrl) {
    return (
      <img
        src={imageSrc || '/placeholder.jpg'}
        alt={alt}
        className={className}
        style={style}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = '/placeholder.jpg'
        }}
      />
    )
  }

  // Пробуем использовать Next.js Image
  if (fill) {
    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        <Image
          src={imageSrc || '/placeholder.jpg'}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={className}
          style={style}
          onError={handleError}
          onLoad={handleLoad}
        />
      </>
    )
  }

  // Для фиксированных размеров
  if (width && height) {
    return (
      <>
        {isLoading && (
          <div 
            className="bg-gray-100 animate-pulse" 
            style={{ width, height }}
          />
        )}
        <Image
          src={imageSrc || '/placeholder.jpg'}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          className={className}
          style={style}
          onError={handleError}
          onLoad={handleLoad}
        />
      </>
    )
  }

  // Если нет размеров, используем обычный img
  return (
    <img
      src={imageSrc || '/placeholder.jpg'}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.src = '/placeholder.jpg'
      }}
    />
  )
} 