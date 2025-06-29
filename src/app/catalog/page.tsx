'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FilterIcon, Loader2, BookmarkIcon, ShareIcon, ShoppingCartIcon } from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/utils'
import type { ProductWithSizeColor } from '@/types'
import ProductModal from '@/components/ProductModal'
import FashionFAQ from '@/components/FashionFAQ'

export default function CatalogPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductWithSizeColor[]>([])
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(4)
  
  // 🎯 КРУТАЯ ФУНКЦИЯ ДЛЯ СЛУЧАЙНЫХ ИЗОБРАЖЕНИЙ в каталоге!
  const getRandomImageIndex = (productId: string, images: string[], globalIndex: number): number => {
    if (images.length <= 1) return 0
    
    // Создаем стабильный но меняющийся seed на основе:
    // 1. ID товара (для стабильности одного товара) 
    // 2. Текущей страницы (чтобы при новых загрузках менялось)
    // 3. Глобального индекса (чтобы даже одинаковые товары имели разные картинки)
    let hash = 0
    const seedString = `${productId}-catalog-${page}-${globalIndex}`
    
    for (let i = 0; i < seedString.length; i++) {
      const char = seedString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    
    // Превращаем hash в индекс от 0 до images.length-1
    return Math.abs(hash) % images.length
  }
  
  // Modal state
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { success, error } = useToast()

  const getCardHeight = (index: number) => {
    // Явно разные высоты для Masonry эффекта
    const heights = [
      280,  // компактный
      400,  // высокий  
      500,  // очень высокий
      320,  // средний
      380,  // средне-высокий
      450,  // высокий+
      260,  // мини
      420,  // средне-высокий+
      300,  // компактный+
    ]
    
    // Псевдослучайность для Pinterest эффекта
    const seed = (index * 11 + index % 7) % heights.length
    return heights[seed]
  }

  // Определяем количество колонок на основе ширины экрана
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumns(1)
      else if (width < 1024) setColumns(2)
      else if (width < 1280) setColumns(3)
      else setColumns(4)
    }
    
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // Распределяем товары по колонкам
  const distributeProducts = () => {
    const cols: ProductWithSizeColor[][] = Array.from({ length: columns }, () => [])
    const heights = new Array(columns).fill(0)
    
    products.forEach((product, index) => {
      // Находим колонку с минимальной высотой
      const shortestCol = heights.indexOf(Math.min(...heights))
      cols[shortestCol].push(product)
      heights[shortestCol] += getCardHeight(index) + 80 // +80 для padding и margins
    })
    
    return cols
  }

  // Загрузка товаров
  const loadProducts = async (pageNum: number = 1, reset: boolean = false) => {
    if (loading) return
    
    setLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        sortBy: sortBy
      })
      
      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const result = await response.json()
        
        if (reset || pageNum === 1) {
          setProducts(result.data)
        } else {
          setProducts(prev => [...prev, ...result.data])
        }
        
        setHasMore(result.pagination.page < result.pagination.totalPages)
      }
    } catch (err) {
       console.error('Ошибка загрузки товаров:', err)
       error('Не удалось загрузить товары')
    } finally {
      setLoading(false)
    }
  }

  // Загрузка новых товаров
  const loadMoreProducts = async () => {
    if (loading || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    await loadProducts(nextPage, false)
  }

  // Сброс и перезагрузка при изменении фильтров
  const resetAndReload = () => {
    setPage(1)
    setHasMore(true)
    loadProducts(1, true)
  }

  // Загрузка данных при монтировании
  useEffect(() => {
    loadProducts(1, true)
  }, [])

  // Перезагрузка при изменении фильтров
  useEffect(() => {
    resetAndReload()
  }, [sortBy])

  // Intersection Observer для автоматической подгрузки
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, hasMore])

  // Hybrid архитектура: меняем URL + показываем модалку
  const handleProductClick = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product && product.slug) {
      // Меняем URL в браузере для SEO
      router.push(`/product/${product.slug}`)
      
      // Но показываем модалку для UX
      setSelectedProductId(productId)
      setIsModalOpen(true)
    }
  }

  // Навигация в модалке с обновлением URL
  const handleModalNavigate = (direction: 'up' | 'down') => {
    if (!selectedProductId) return
    
    const currentIndex = products.findIndex(p => p.id === selectedProductId)
    let newIndex
    
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : products.length - 1
    } else {
      newIndex = currentIndex < products.length - 1 ? currentIndex + 1 : 0
    }
    
    const newProduct = products[newIndex]
    if (newProduct && newProduct.slug) {
      // Обновляем URL
      router.push(`/product/${newProduct.slug}`)
      // Обновляем состояние модалки
      setSelectedProductId(newProduct.id)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Каталог товаров</h1>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-gray-600">Найдено {products.length} товаров</p>
              
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="popular">По популярности</option>
                <option value="price">Цена: низкая → высокая</option>
                <option value="price-desc">Цена: высокая → низкая</option>
                <option value="name">По названию</option>
                <option value="newest">Новинки</option>
              </select>
            </div>
          </div>

          {/* Products Grid - JavaScript Masonry */}
          <div className="flex-1">
            <div className="flex gap-4">
              {distributeProducts().map((columnProducts, colIndex) => (
                <div key={colIndex} className="flex-1 space-y-4">
                  {columnProducts.map((product, index) => {
                    let images = []
                    try {
                      images = JSON.parse(product.images || '[]')
                    } catch (e) {
                      images = []
                    }
                    
                    // 🎯 МАГИЯ! Получаем случайное изображение для каталога
                    const globalIndex = products.indexOf(product)
                    const randomImageIndex = getRandomImageIndex(product.id, images, globalIndex)
                    const randomImage = images[randomImageIndex] || images[0]
                    
    
                                          const price = product.price
                    
                    return (
                      <div 
                        key={product.id} 
                        onClick={() => handleProductClick(product.id)}
                        className="group relative backdrop-blur-sm bg-white/10 border border-white/20 overflow-hidden cursor-pointer rounded-xl hover:shadow-xl hover:bg-white/20 transition-all duration-500"
                      >
                        {/* Image Container - высота карточки меняется для эффекта Masonry */}
                        <div 
                          className="relative overflow-hidden rounded-t-2xl"
                          style={{ height: `${getCardHeight(globalIndex)}px` }}
                        >
                          {images.length > 0 ? (
                            <Image
                              src={randomImage || '/api/placeholder/300/400'}
                              alt={product.name}
                              fill
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-sm">Фото товара</span>
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
                            



                          
                            {/* Action buttons */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (isInWishlist(product.id)) {
                                    removeFromWishlist(product.id)
                                    success('Удалено из сохраненных')
                                  } else {
                                    addToWishlist(product.id)
                                    success('Добавлено в сохраненные')
                                  }
                                }}
                                className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                              >
                                <BookmarkIcon className={`w-4 h-4 ${isInWishlist(product.id) ? 'text-teal-500 fill-current' : 'text-teal-600'}`} />
                              </button>
                              <button className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors">
                                <ShareIcon className="w-4 h-4 text-teal-600" />
                              </button>
                            </div>
                            
                            {/* Bottom overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-full group-hover:translate-y-0">
                              {/* Price */}
                              <div className="flex items-center gap-2 mb-3 justify-center">
                                <span className="text-xl font-bold text-white">
                                  {formatPrice(price)}
                                </span>
                                {product.salePrice && (
                                  <span className="text-sm text-white/60 line-through">
                                    {formatPrice(product.price)}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      await addToCart({ productId: product.id, quantity: 1 })
                                      success(`"${product.name}" добавлен в корзину`)
                                    } catch (err) {
                                      error('Не удалось добавить товар в корзину')
                                    }
                                  }}
                                  className="flex-1 bg-teal-500 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors flex items-center justify-center gap-1"
                                >
                                  <ShoppingCartIcon className="w-4 h-4" />
                                  В корзину
                                </button>
                                <div className="flex-1 bg-white/20 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors cursor-pointer">
                                  Подробнее
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Info - минимальная область для названия */}
                        <div className="px-1 py-1">
                          <h3 className="font-light text-gray-800 line-clamp-2 text-xs text-center leading-tight">
                            {product.name}
                          </h3>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
              </div>
            )}

            {/* Load More Trigger */}
            <div ref={observerRef} className="h-4" />
            
            {/* No results */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Товары не найдены</p>
                <p className="text-gray-400">Попробуйте изменить фильтры</p>
              </div>
            )}
          </div>
          
          {/* GEO: FAQ для стилистических запросов в каталоге */}
          <div className="mt-16 border-t pt-12">
            <FashionFAQ category="style" />
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          // Возвращаемся к каталогу при закрытии модалки
          router.push('/catalog')
        }}
        productId={selectedProductId || ''}
        allProducts={products as any}
        onNavigate={handleModalNavigate}
      />
    </>
  )
} 