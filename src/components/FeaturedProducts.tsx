'use client'

import Image from 'next/image' // ВОЗВРАЩАЕМ для оптимизации изображений!
import { StarIcon, BookmarkIcon, ShareIcon, Loader2, ShoppingCartIcon } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/context/ToastContext'
import { useSearch } from '@/context/SearchContext'
import { formatPrice } from '@/lib/utils'
import ProductModal from './ProductModal'

interface ProductWithRating {
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
  averageRating?: number
  reviewCount?: number
  createdAt: Date
  updatedAt: Date
}

export default function FeaturedProducts() {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { success, error } = useToast()
  const { searchQuery } = useSearch()
  
  // Состояние для infinite scroll
  const [products, setProducts] = useState<ProductWithRating[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithRating[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [allProductsLoaded, setAllProductsLoaded] = useState(false)
  
  // 🎯 КРУТАЯ ФУНКЦИЯ ДЛЯ СЛУЧАЙНЫХ ИЗОБРАЖЕНИЙ!
  const getRandomImageIndex = (productId: string, images: string[], globalIndex: number): number => {
    if (images.length <= 1) return 0
    
    // Создаем стабильный но меняющийся seed на основе:
    // 1. ID товара (для стабильности одного товара)
    // 2. Текущей страницы (чтобы при новых загрузках менялось)
    // 3. Глобального индекса (чтобы даже одинаковые товары имели разные картинки)
    let hash = 0
    const seedString = `${productId}-${page}-${globalIndex}`
    
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

  // Ref для блокировки дублированных запросов
  const isLoadingRef = useRef(false)
  // Ref для предотвращения двойных запросов
  const lastTriggeredPageRef = useRef(0)

  // Функция загрузки данных с бесконечным циклом
  const fetchProducts = useCallback(async (pageNum: number): Promise<void> => {
    if (isLoadingRef.current) {
      console.log(`⏸️ Пропускаем загрузку страницы ${pageNum} - уже идёт загрузка`)
      return
    }
    
    // Сохраняем текущую позицию скролла перед загрузкой
    const currentScroll = window.scrollY
    
    isLoadingRef.current = true
    setLoading(true)
    console.log(`🔄 Загружаем страницу ${pageNum} с перемешиванием`)
    
    try {
      // Добавляем shuffle=true для постоянной рандомизации
      const response = await fetch(`/api/products?page=${pageNum}&limit=24&shuffle=true`)
      if (response.ok) {
        const result = await response.json()
        console.log(`📦 Получили ${result.data.length} товаров для страницы ${pageNum}`)
        
        // Если API вернуло пустой массив, значит товары закончились.
        // Начинаем заново с первой страницы.
        if (result.data.length === 0 && pageNum > 1) {
            console.log('🔄 Товары закончились, начинаем заново с 1 страницы.')
            setPage(1) 
            // Сбрасываем защиту от дублирования, чтобы первая страница могла загрузиться снова
            lastTriggeredPageRef.current = 0 
            return; // Выходим, чтобы useEffect для page сделал новый запрос
        }

        setProducts(prev => {
          // Просто добавляем новые товары в конец, не проверяя на уникальность,
          // чтобы создать эффект бесконечной ленты.
          const newProducts = [...prev, ...result.data];
          console.log(`✅ Добавлено ${result.data.length} товаров. Всего: ${newProducts.length}`);
          return newProducts;
        })
            
        // Восстанавливаем скролл после добавления товаров
        requestAnimationFrame(() => {
          if (Math.abs(window.scrollY - currentScroll) > 100) {
            window.scrollTo({ top: currentScroll, behavior: 'instant' })
          }
        })
        
        // Лента теперь всегда "бесконечная"
        setHasMore(true)
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки товаров:', err)
    } finally {
      isLoadingRef.current = false
      setLoading(false)
      console.log(`✅ Завершили загрузку страницы ${pageNum}`)
    }
  }, [page]) // Зависимость только от page

  // Простой и надежный скролл-триггер
  useEffect(() => {
    const handleScroll = () => {
      // Блокируем если загружается или есть поиск
      if (isLoadingRef.current || !hasMore || searchQuery.trim()) return
      
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight
      const scrollPercent = (scrollTop + clientHeight) / scrollHeight
      
      // Загружаем когда достигли 90% страницы
      if (scrollPercent >= 0.90) {
        const nextPage = page + 1
        
        // Проверяем что не загружали уже эту страницу
        if (lastTriggeredPageRef.current >= nextPage) {
          console.log(`⏸️ Страница ${nextPage} уже запущена (last=${lastTriggeredPageRef.current}), пропускаем`)
          return
        }
        
        console.log(`🚀 Скролл триггер: ${Math.round(scrollPercent * 100)}% - загружаем страницу ${nextPage}`)
        
        // Запоминаем что запустили эту страницу
        lastTriggeredPageRef.current = nextPage
        
        setPage(prevPage => {
          console.log(`📄 Переключаем с ${prevPage} на ${nextPage}`)
          return nextPage
        })
      }
    }

     // Debounce 200ms для быстрого реагирования
     let scrollTimeout: NodeJS.Timeout
     const debouncedScroll = () => {
       clearTimeout(scrollTimeout)
       scrollTimeout = setTimeout(handleScroll, 200)
     }

    window.addEventListener('scroll', debouncedScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(scrollTimeout)
    }
  }, [hasMore, searchQuery, page])

  // Загружаем данные при изменении страницы
  useEffect(() => {
    fetchProducts(page)
  }, [page, fetchProducts])

  // Поиск товаров через API вместо фильтрации массива
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    const searchProducts = async () => {
      try {
        console.log(`🔍 API поиск: "${searchQuery}"`)
        // Сбрасываем флаг при поиске
        setAllProductsLoaded(false)
        console.log(`🔓 Флаг allProductsLoaded сброшен для поиска`)
        
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`)
        if (response.ok) {
          const results = await response.json()
          console.log(`✅ API поиск вернул ${results.length} товаров`)
          setFilteredProducts(results)
        }
      } catch (err) {
        console.error("API search error:", err)
      }
    }

    const debounceSearch = setTimeout(() => {
      searchProducts()
    }, 300)

    return () => clearTimeout(debounceSearch)

  }, [searchQuery])

  // Отдельный эффект для обновления товаров без поиска
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Товары уже дедублицированы при добавлении, просто обновляем
      setFilteredProducts(products)
      console.log(`📦 Обновлены товары: ${products.length} товаров`)
      
      // Только сбрасываем hasMore при переходе от поиска к обычному просмотру
      // НЕ сбрасываем если товары уже все загружены
    }
  }, [products, searchQuery])

  // Открытие модалки
  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId)
    setIsModalOpen(true)
  }

  // Навигация в модалке
  const handleModalNavigate = (direction: 'up' | 'down') => {
    if (!selectedProductId) return
    
    const currentIndex = filteredProducts.findIndex(p => p.id === selectedProductId)
    let newIndex
    
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredProducts.length - 1
    } else {
      newIndex = currentIndex < filteredProducts.length - 1 ? currentIndex + 1 : 0
    }
    
    setSelectedProductId(filteredProducts[newIndex].id)
  }

  // Обработка wishlist
  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
      success('Товар удален из избранного')
    } else {
      addToWishlist(productId)
      success('Товар добавлен в избранное')
    }
  }

  // 🚀 УЛУЧШЕННАЯ ФУНКЦИЯ ДЛЯ ПРИОРИТЕТНОЙ ЗАГРУЗКИ ПЕРВОГО ФОТО
  const getImageToDisplay = (productId: string, images: string[], globalIndex: number, isFirstLoad: boolean = false) => {
    if (images.length === 0) return null
    
    // 🔥 ПЕРВОЕ ИЗОБРАЖЕНИЕ ВСЕГДА ЗАГРУЖАЕТСЯ ПЕРВЫМ ПРИ ЗАПУСКЕ САЙТА
    if (isFirstLoad && globalIndex < 8) {
      return images[0] // Первые 8 товаров показывают главное изображение
    }
    
    // Для остальных случаев - рандомное изображение
    if (images.length === 1) return images[0]
    
    // Создаем стабильный но меняющийся seed на основе:
    // 1. ID товара (для стабильности одного товара)
    // 2. Текущей страницы (чтобы при новых загрузках менялось)
    // 3. Глобального индекса (чтобы даже одинаковые товары имели разные картинки)
    let hash = 0
    const seedString = `${productId}-${page}-${globalIndex}`
    
    for (let i = 0; i < seedString.length; i++) {
      const char = seedString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    
    // Превращаем hash в индекс от 0 до images.length-1
    const randomIndex = Math.abs(hash) % images.length
    return images[randomIndex]
  }

  return (
    <>
      <section className="py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Заголовок в стиле checkout */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-gray-800">Каталог товаров</h1>
            <p className="text-gray-600 font-light mt-2">Откройте для себя нашу коллекцию</p>
          </div>
          
          {/* Показываем количество результатов поиска */}
          {searchQuery && (
            <div className="mb-6 text-center backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-6">
              <p className="text-lg text-gray-700 font-light">
                По запросу "{searchQuery}" найдено {filteredProducts.length} товар
                {filteredProducts.length === 1 ? '' : filteredProducts.length < 5 ? 'а' : 'ов'}
              </p>
              {filteredProducts.length === 0 ? (
                <p className="text-gray-600 font-light mt-2">Попробуйте изменить поисковый запрос</p>
              ) : (
                <p className="text-sm text-gray-600 font-light mt-1">Показаны только результаты поиска</p>
              )}
            </div>
          )}

          {/* Masonry Grid */}
          <div className="masonry-grid">
            {filteredProducts.map((product, index) => {
              // Защита от неполных данных, особенно после поиска
              if (!product || !product.id || !product.name || !product.price) {
                return null;
              }

              let images = []
              try {
                images = JSON.parse(product.images || '[]')
                // Фильтруем только валидные URL или относительные пути
                images = images.filter((img: string) => {
                  try {
                    // Проверяем абсолютные URL
                    new URL(img)
                    return true
                  } catch {
                    // Проверяем относительные пути (начинающиеся с /)
                    return img.startsWith('/')
                  }
                })
              } catch (e) {
                images = []
              }
              
              // 🚀 НОВАЯ ЛОГИКА: первое фото для начальной загрузки, рандом для остальных
              const isFirstLoad = page === 1 // Определяем первую загрузку страницы
              const imageToShow = getImageToDisplay(product.id, images, index, isFirstLoad)
              
              return (
                <div
                  key={`${product.id}-${index}`}
                  onClick={() => handleProductClick(product.id)}
                  className="group relative backdrop-blur-sm bg-white/20 border border-white/30 overflow-hidden cursor-pointer block rounded-xl hover:bg-white/30 hover:shadow-lg transition-all duration-300 masonry-item animate-fade-in"
                  style={{ 
                    animationDelay: `${(index % 12) * 50}ms`
                  }}
                >
                  {/* Image Container - адаптивная высота */}
                  <div className="relative overflow-hidden rounded-t-xl" style={{ paddingBottom: '133.33%' }}>
                    {images.length > 0 && imageToShow ? (
                      <Image
                        src={imageToShow}
                        alt={product.name || 'Товар'}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain bg-white/50 group-hover:scale-105 transition-transform duration-500"
                        priority={index < 8 && isFirstLoad} // 🚀 ПРИОРИТЕТ: только для первых 8 товаров при первой загрузке
                        quality={index < 4 ? 85 : 75} // 🚀 Повышенное качество для главных изображений
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        loading={index < 8 && isFirstLoad ? "eager" : "lazy"} // 🚀 EAGER загрузка для первых изображений
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-4xl">📦</div>
                      </div>
                    )}

                    {/* Sale Badge */}
                    {product.salePrice && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                          -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                        </span>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={(e) => handleWishlistToggle(e, product.id)}
                        className={`w-8 h-8 rounded-full backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg transition-all duration-200 ${
                          isInWishlist(product.id)
                            ? 'bg-red-500/90 text-white'
                            : 'bg-white/30 text-gray-700 hover:bg-white/50'
                        }`}
                      >
                        <BookmarkIcon size={14} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                      </button>
                      
                      <button className="w-8 h-8 rounded-full backdrop-blur-md bg-white/30 border border-white/40 text-gray-700 flex items-center justify-center shadow-lg hover:bg-white/50 transition-all duration-200">
                        <ShareIcon size={14} />
                      </button>
                    </div>

                    {/* Stock indicator */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute bottom-3 left-3 z-10">
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                          Осталось: {product.stock}
                        </span>
                      </div>
                    )}

                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium">
                          Нет в наличии
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info - только название */}
                  <div className="p-3 sm:p-4">
                    <h3 className="text-gray-800 text-sm font-light leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Skeleton Loader - показываем красивые карточки во время загрузки */}
          {loading && !searchQuery && (
            <>
              {/* Небольшое сообщение о загрузке */}
              <div className="flex justify-center items-center py-4 mt-4">
                <div className="flex items-center space-x-2 text-gray-600 backdrop-blur-sm bg-white/20 border border-white/30 rounded-full px-6 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-light">Загружаем ещё товары...</span>
                </div>
              </div>
              
              <div className="masonry-grid mt-4">
              {[...Array(8)].map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="masonry-item"
                >
                  <div className="relative backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl overflow-hidden h-full group">
                    {/* Skeleton Image */}
                    <div className="relative h-[95%] bg-gradient-to-br from-gray-200/30 via-gray-100/30 to-gray-200/30 rounded-t-xl overflow-hidden">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer transform -skew-x-12"></div>
                      
                      {/* Floating skeleton elements для имитации контента */}
                      <div className="absolute inset-4 space-y-2 opacity-20">
                        <div className="h-2 bg-gray-400/30 rounded w-3/4 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-2 bg-gray-400/30 rounded w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      
                      {/* Price area skeleton */}
                      <div className="absolute bottom-2 left-2 right-2 space-y-1 opacity-30">
                        <div className="h-3 bg-gray-300/40 rounded w-2/3 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        <div className="h-2 bg-gray-300/30 rounded w-1/3 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                    
                    {/* Skeleton Text */}
                    <div className="px-1 py-0.5 h-[5%] flex items-center justify-center">
                      <div className="h-2 bg-gray-300/40 rounded w-3/4 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}

          {/* Бесконечная лента - сообщения о конце нет */}
        </div>
      </section>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={selectedProductId || ''}
        allProducts={filteredProducts}
        onNavigate={handleModalNavigate}
      />
    </>
  )
}

 