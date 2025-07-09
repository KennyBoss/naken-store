'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Bookmark, Eye, Star } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/utils'
import ReviewStars from './ReviewStars'
import SafeImage from './SafeImage'

interface ProductCardProps {
  id: string
  slug?: string
  name: string
  price: number
  salePrice?: number
  images: string
  size?: {
    name: string
    russianSize: string
  }
  color?: {
    name: string
    hexCode: string
  }
  averageRating?: number
  reviewCount?: number
}

export default function ProductCard({ 
  id, 
  slug,
  name, 
  price, 
  salePrice, 
  images, 
  size,
  color,
  averageRating = 0,
  reviewCount = 0
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { success } = useToast()
  const [isHovered, setIsHovered] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Парсим изображения из строки JSON
  let productImages: string[] = []
  try {
    productImages = JSON.parse(images || '[]')
  } catch (e) {
    productImages = []
  }

  const finalPrice = salePrice || price
  const hasDiscount = salePrice && salePrice < price
  const discountPercent = hasDiscount ? Math.round(((price - salePrice) / price) * 100) : 0

  // 🚀 ПРИОРИТЕТНАЯ ЗАГРУЗКА: первое изображение всегда показываем первым
  const primaryImage = productImages[0] || '/placeholder.jpg'
  const isMainProduct = productImages.length > 0 // Определяем основной товар по наличию изображений

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAddingToCart(true)
    try {
      await addToCart({
        productId: id,
        quantity: 1,
      })
      success(`"${name}" добавлен в корзину`)
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Link href={`/product/${slug || id}`}>
      <div
        className="group relative backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl overflow-hidden hover:bg-white/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
          <SafeImage
            src={primaryImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={isMainProduct ? 90 : 75} // 🚀 Высокое качество для основных товаров
            priority={isMainProduct} // 🚀 ПРИОРИТЕТ: для товаров с изображениями
            className="object-contain bg-white/50 transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Quick Actions - скрываем на мобильных для экономии места */}
          <div className={`hidden sm:flex absolute top-2 right-2 sm:top-3 sm:right-3 flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
            <button className="w-8 h-8 sm:w-10 sm:h-10 backdrop-blur-md bg-white/30 border border-white/40 rounded-full flex items-center justify-center shadow-lg hover:bg-white/50 transition-all duration-200">
              <Bookmark size={14} className="sm:w-4 sm:h-4 text-teal-600" />
            </button>
            <button className="w-8 h-8 sm:w-10 sm:h-10 backdrop-blur-md bg-white/30 border border-white/40 rounded-full flex items-center justify-center shadow-lg hover:bg-white/50 transition-all duration-200">
              <Eye size={14} className="sm:w-4 sm:h-4 text-teal-600" />
            </button>
          </div>

          {/* Add to Cart Button - всегда видима на мобильных */}
          <div className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 sm:opacity-100 translate-y-2 sm:translate-y-0'}`}>
            <button className="w-8 h-8 sm:w-10 sm:h-10 backdrop-blur-md bg-teal-500/90 border border-white/40 rounded-full flex items-center justify-center shadow-lg hover:bg-teal-600/90 transition-all duration-200">
              <ShoppingCart size={14} className="sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Product Info - компактная версия для мобильных */}
        <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
          <h3 className="text-gray-800 text-sm sm:text-base font-medium leading-tight line-clamp-2 group-hover:text-teal-700 transition-colors">
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              {formatPrice(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>

          {/* Size and Color - компактно */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            {size && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {size.russianSize || size.name}
              </span>
            )}
            {color && (
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.hexCode }}
                />
                <span className="text-xs text-gray-500">
                  {color.name}
                </span>
              </div>
            )}
          </div>

          {/* Rating - только на десктопе */}
          {averageRating > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    className={`${i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({reviewCount})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
} 