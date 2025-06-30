'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, ShoppingCart, Bookmark } from 'lucide-react'
import type { ProductWithSizeColor } from '@/types'
import ReviewsList from '@/components/ReviewsList'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import JsonLdProduct from '@/components/JsonLdProduct'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { success, error } = useToast()
  
  const [product, setProduct] = useState<ProductWithSizeColor | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSizeId, setSelectedSizeId] = useState<string>('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Доступные размеры и цвета (можно будет получать из ProductVariant)
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const colors = ['Чёрный', 'Белый', 'Серый', 'Синий', 'Красный']

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
          
          // 🚀 Трекинг просмотра для SEO аналитики
          fetch(`/api/products/${params.slug}/view`, { method: 'POST' })
            .catch(() => {}) // Не критично если не получится
        } else {
          router.push('/404')
        }
      } catch (error) {
        console.error('Ошибка загрузки товара:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug, router])

  const handleAddToCart = async () => {
    if (!product) return
    
    // Проверяем выбран ли размер, если у товара есть размеры
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
      
      success(`Товар "${product.name}" добавлен в корзину`)
    } catch (err) {
      console.error('Ошибка добавления в корзину:', err)
      error('Не удалось добавить товар в корзину')
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка товара...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Товар не найден</div>
      </div>
    )
  }

  let productImages: string[] = []
  
  try {
    productImages = JSON.parse(product.images || '[]')
  } catch (e) {
    productImages = []
  }

  const price = product.salePrice || product.price
  const originalPrice = product.salePrice ? product.price : null
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://naken.store'
  
  // Breadcrumbs для JSON-LD
  const breadcrumbItems = [
    { name: 'Главная', url: baseUrl },
    { name: 'Каталог', url: `${baseUrl}/catalog` },
    { name: product.name, url: `${baseUrl}/product/${product.slug}` }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD структурированные данные для SEO */}
      <ProductJsonLd product={{
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        images: product.images,
        sku: product.sku,
        stock: product.stock,
        slug: product.slug,
        createdAt: product.createdAt.toString(),
        updatedAt: product.updatedAt.toString()
      }} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      
      {/* GEO оптимизированная Schema.org разметка для ИИ */}
      <JsonLdProduct product={product} />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          Назад
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              <Image
                src={productImages[selectedImageIndex] || '/api/placeholder/600/600'}
                alt={product.name}
                fill
                className="object-contain bg-white"
                priority
              />

            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-black'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-light mb-3 sm:mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-900">{formatPrice(price)}</span>
                {originalPrice && (
                  <span className="text-sm sm:text-base lg:text-xl text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-sm sm:text-base font-medium mb-2">Описание</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Sizes Display - выбор размера */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-base font-medium mb-2 sm:mb-3">Выберите размер</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((productSize) => (
                    <button
                      key={productSize.id}
                      onClick={() => setSelectedSizeId(productSize.sizeId)}
                      disabled={productSize.stock === 0}
                      className={`py-1.5 px-3 sm:py-2 sm:px-4 border-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        selectedSizeId === productSize.sizeId
                          ? 'border-black bg-black text-white'
                          : productSize.stock === 0
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <span className="block sm:hidden">{productSize.size.name}</span>
                      <span className="hidden sm:block">{productSize.size.name} (рос. {productSize.size.russianSize})</span>
                      {productSize.stock === 0 && <span className="hidden sm:inline"> - нет</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}



            {/* Quantity */}
            <div>
              <h3 className="text-sm sm:text-base font-medium mb-2 sm:mb-3">Количество</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors rounded text-lg sm:text-xl"
                >
                  -
                </button>
                <span className="w-8 sm:w-12 text-center font-medium text-sm sm:text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors rounded text-lg sm:text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock < 1}
                className="flex-1 bg-black text-white py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg text-sm sm:text-base font-medium"
              >
                <ShoppingCart size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{isAddingToCart ? 'Добавление...' : 'Добавить в корзину'}</span>
                <span className="sm:hidden">{isAddingToCart ? 'Добавление...' : 'В корзину'}</span>
              </button>
              
              <button className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors rounded-lg">
                <Bookmark size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            
            {/* Quick Order Button */}
            <div className="pt-2 sm:pt-3">
              <Link
                href="/checkout"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-colors rounded-lg font-medium text-sm sm:text-base"
              >
                🚀 <span className="hidden sm:inline">Заказать с T-Pay</span><span className="sm:hidden">T-Pay</span>
              </Link>
              <p className="text-center text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                <span className="hidden sm:inline">Современная оплата через Т-Банк и банковские карты</span>
                <span className="sm:hidden">Быстрая оплата картой</span>
              </p>
            </div>

            {/* Stock Info */}
            <div className="text-xs sm:text-sm text-gray-600">
              {product.stock > 0 ? (
                <span className="text-green-600">✓ В наличии ({product.stock} шт.)</span>
              ) : (
                <span className="text-red-600">Нет в наличии</span>
              )}
            </div>

            {/* Product Details */}
            <div className="border-t pt-4 sm:pt-6 space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-medium">Детали товара</h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <div>Артикул: {product.sku}</div>
                <div>Добавлен: {new Date(product.createdAt).toLocaleDateString('ru-RU')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section - важно для Featured Snippets */}
        {product.faq && (() => {
          try {
            const faqs = JSON.parse(product.faq)
            if (faqs.length > 0) {
              return (
                <div className="mt-8 sm:mt-12 lg:mt-16">
                  <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6">Часто задаваемые вопросы</h2>
                  <div className="space-y-4">
                    {faqs.map((faq: { question: string; answer: string }, index: number) => (
                      <details key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <summary className="cursor-pointer font-medium text-sm sm:text-base">
                          {faq.question}
                        </summary>
                        <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              )
            }
          } catch (e) {
            return null
          }
          return null
        })()}

        {/* Reviews Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <ReviewsList productId={product.id} productSlug={product.slug} />
        </div>
      </div>
    </div>
  )
} 