'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Bookmark, Eye } from 'lucide-react'
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

  let productImages: string[] = []
  try {
    productImages = JSON.parse(images || '[]')
  } catch (e) {
    productImages = []
  }

  const displayPrice = salePrice || price
  const originalPrice = salePrice ? price : null
  const discountPercent = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0

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
            src={productImages[0] || '/placeholder.jpg'}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={85}
            priority={false} // Приоритет только для hero изображений
            className="object-contain bg-white/50 transition-transform duration-500 group-hover:scale-110"
          />
          


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
          <div className={`absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'sm:opacity-0 sm:translate-y-2 opacity-100 translate-y-0'}`}>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="w-full backdrop-blur-md bg-gradient-to-r from-teal-500/80 to-cyan-500/80 border border-white/20 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 hover:from-teal-600/80 hover:to-cyan-600/80 transition-all duration-200 disabled:bg-gray-400/70 text-sm sm:text-base font-light"
            >
              <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{isAddingToCart ? 'Добавление...' : 'В корзину'}</span>
              <span className="sm:hidden">{isAddingToCart ? '...' : '+'}</span>
            </button>
          </div>

          {/* Price overlay - показываем только на десктопе при наведении */}
          <div className={`hidden sm:block absolute bottom-0 left-0 right-0 backdrop-blur-md bg-gradient-to-t from-black/50 to-transparent p-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xl font-light text-white">
                {formatPrice(displayPrice)}
              </span>
              {originalPrice && (
                <span className="text-sm text-white/60 line-through font-light">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            {reviewCount > 0 && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <ReviewStars rating={averageRating} size="sm" />
                <span className="text-xs text-white/70 font-light">({reviewCount})</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info - показываем цену на мобильных */}
        <div className="p-3 sm:p-6">
          <h3 className="font-light text-sm sm:text-lg text-gray-800 line-clamp-2 leading-tight mb-2 sm:mb-0">{name}</h3>
          
          {/* Цена на мобильных */}
          <div className="sm:hidden flex items-center gap-2 mt-2">
            <span className="text-base font-light text-gray-800">
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through font-light">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          
          {/* Рейтинг на мобильных */}
          {reviewCount > 0 && (
            <div className="sm:hidden flex items-center gap-2 mt-1">
              <ReviewStars rating={averageRating} size="sm" />
              <span className="text-xs text-gray-500 font-light">({reviewCount})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
} 