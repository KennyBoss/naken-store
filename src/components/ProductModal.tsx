'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ShoppingCart, Bookmark, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/utils'
import ImageGallery from './ImageGallery'
import SafeImage from './SafeImage'

interface Product {
  id: string
  name: string
  slug?: string
  description?: string
  price: number
  salePrice?: number
  sku: string
  stock: number
  images: string
  published: boolean
  sizes?: Array<{
    id: string
    productId: string
    sizeId: string
    stock: number
    size: {
      id: string
      name: string
      russianSize: string
    }
  }>
  color?: {
    id: string
    name: string
    hexCode: string
  }
  createdAt: Date
  updatedAt: Date
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  allProducts: Product[]
  onNavigate: (direction: 'up' | 'down') => void
}

export default function ProductModal({ 
  isOpen, 
  onClose, 
  productId, 
  allProducts,
  onNavigate 
}: ProductModalProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { success, error } = useToast()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSizeId, setSelectedSizeId] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  // Gallery state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  // Modal ref (без touch/swipe функций)
  const modalRef = useRef<HTMLDivElement>(null)

  // Получаем текущий товар
  useEffect(() => {
    const currentProduct = allProducts.find(p => p.id === productId)
    setProduct(currentProduct || null)
    setSelectedImageIndex(0)
    setSelectedSizeId('')
    setQuantity(1)
  }, [productId, allProducts])

  // Обработка клавиш
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowUp':
          e.preventDefault()
          onNavigate('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          onNavigate('down')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onNavigate])

  // 🔒 МИНИМАЛЬНАЯ блокировка - только overflow на body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  // ✅ Убираем все touch handlers - оставляем только CSS блокировку

  if (!isOpen || !product) return null

  // Деструктуризация с проверкой на null
  const { 
    name, 
    description, 
    price, 
    salePrice, 
    sku, 
    images: productImages,
    sizes,
    color
  } = product;

  let images = [];
  try {
    images = JSON.parse(productImages || '[]')
  } catch (e) {
    images = []
  }

  const displayPrice = product.price

  const handleAddToCart = async () => {
    // Проверяем, если у товара есть размеры, то размер должен быть выбран
    if (product.sizes && product.sizes.length > 0 && !selectedSizeId) {
      error('Пожалуйста, выберите размер')
      return
    }
    
    setIsAddingToCart(true)
    try {
      await addToCart({
        productId: product.id,
        quantity,
        sizeId: selectedSizeId || undefined
      })
      success(`"${product.name}" добавлен в корзину`)
      onClose()
    } catch (err) {
      error('Не удалось добавить товар в корзину')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      success('Удалено из сохраненных')
    } else {
      addToWishlist(product.id)
      success('Добавлено в сохраненные')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - более светлый и без градиента */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
              {/* Modal - оптимизированный для всех экранов */}
      <div 
        ref={modalRef}
        className="relative w-full h-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl sm:h-auto sm:max-h-[90vh] md:max-h-[85vh] sm:mx-4 md:mx-6 lg:mx-8 bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        
        {/* Navigation Buttons - чистый белый с тенью */}
        <button
          onClick={() => onNavigate('up')}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        
        <button
          onClick={() => onNavigate('down')}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>

        {/* Close Button - адаптивный */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
        >
          <X size={16} className="sm:w-5 sm:h-5 text-gray-600" />
        </button>

        {/* 🚫 SWIPE ОТКЛЮЧЕН - чтобы не мешать кнопкам на мобильных */}

        {/* Left Side - Images - 🖼️ ПОКАЗЫВАЕМ ПОЛНОЕ ИЗОБРАЖЕНИЕ */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100 min-h-[50vh] sm:min-h-[55vh] md:min-h-[65vh] lg:min-h-[70vh] xl:min-h-[75vh]">
          {images.length > 0 ? (
            <>
              <div 
                className="relative w-full h-full cursor-pointer md:cursor-default p-4"
                onClick={() => setIsGalleryOpen(true)}
              >
                <div className="relative w-full h-full bg-white rounded-lg shadow-sm overflow-hidden">
                  <SafeImage
                    src={images[selectedImageIndex] || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-contain hover:scale-105 transition-transform duration-300 p-2"
                    priority
                  />
                </div>
                
                {/* Mobile tap indicator - в стиле сайта */}
                <div className="md:hidden absolute bottom-2 right-2 z-10">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-white/20">
                    <span className="flex items-center gap-1">
                      <span>🔍</span>
                      <span>Увеличить</span>
                    </span>
                  </div>
                </div>
                
                {/* Overlay gradient для лучшей читаемости */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/5 pointer-events-none"></div>
              </div>
              


              {/* 🚀 ИСПРАВЛЕНО: Индикаторы только в галерее, не в карточке товара */}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">Фото товара</span>
            </div>
          )}
        </div>

        {/* Right Side - Details - адаптивная ширина */}
        <div className="w-full md:w-[400px] lg:w-[450px] xl:w-[500px] flex flex-col bg-white overflow-y-auto" style={{ touchAction: 'pan-y' }}>
          {/* Header - оптимизированные размеры текста */}
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 sm:mb-3 leading-tight">{name}</h1>
            
            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">{formatPrice(displayPrice)}</span>
            </div>
          </div>

          {/* Content - оптимизированные отступы и размеры */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
            {/* Description */}
            {description && (
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Описание</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{description}</p>
              </div>
            )}

            {/* Sizes - оптимизированные кнопки */}
            {sizes && sizes.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Размер</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {sizes.map((productSize) => (
                    <button
                      key={productSize.id}
                      onClick={() => setSelectedSizeId(productSize.sizeId)}
                      disabled={productSize.stock === 0}
                      className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        selectedSizeId === productSize.sizeId
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                          : productSize.stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="block sm:hidden">{productSize.size.name}</span>
                      <span className="hidden sm:block">{productSize.size.name} ({productSize.size.russianSize})</span>
                      {productSize.stock === 0 && <span className="hidden sm:inline"> - нет</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity - компактный stepper */}
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Количество</h3>
              <div className="flex items-center gap-3 sm:gap-4 bg-gray-100 rounded-lg p-1 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-black transition-colors rounded-lg hover:bg-white"
                >
                  <span className="text-lg sm:text-xl">−</span>
                </button>
                <div className="min-w-[32px] sm:min-w-[40px] text-center font-medium text-gray-900 text-sm sm:text-base">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-black transition-colors rounded-lg hover:bg-white"
                >
                  <span className="text-lg sm:text-xl">+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer - компактные кнопки */}
          <div className="p-3 sm:p-4 md:p-6 border-t border-gray-200 space-y-2 sm:space-y-3 bg-gray-50">
            {/* Main CTA */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock < 1}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 sm:py-4 rounded-xl font-medium hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/20 text-sm sm:text-base"
            >
              <ShoppingCart size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{isAddingToCart ? 'Добавление...' : 'Добавить в корзину'}</span>
              <span className="sm:hidden">{isAddingToCart ? 'Добавление...' : 'В корзину'}</span>
            </button>
            
            {/* Secondary actions */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleWishlistToggle}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 sm:py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 sm:gap-2"
              >
                <Bookmark 
                  size={16} 
                  className={`sm:w-[18px] sm:h-[18px] ${isInWishlist(product.id) ? 'text-teal-500 fill-current' : ''}`} 
                />
                <span className="text-xs sm:text-sm">{isInWishlist(product.id) ? 'Сохранено' : 'Сохранить'}</span>
              </button>

              <button className="bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-gray-50 transition-colors">
                <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>

            {/* Stock info */}
            <div className="text-center text-xs sm:text-sm">
              {product.stock > 0 ? (
                <span className="text-green-600">✓ В наличии</span>
              ) : (
                <span className="text-red-600">Нет в наличии</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={images}
        initialIndex={selectedImageIndex}
        productName={product.name}
      />
    </div>
  )
} 