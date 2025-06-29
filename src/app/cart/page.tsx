'use client'

import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCartIcon } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function CartPage() {
  const { items, total, isLoading, updateQuantity, removeFromCart, clearCart } = useCart()
  const { success, error } = useToast()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl p-12 max-w-md mx-auto">
              <ShoppingCartIcon className="h-16 w-16 text-teal-300 mx-auto mb-4" />
              <h3 className="text-xl font-light text-gray-900 mb-2">
                Корзина пуста
              </h3>
              <p className="text-gray-600 font-light mb-6">
                Добавьте товары из каталога, чтобы они появились здесь
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-light rounded-full hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300 border border-white/20"
              >
                Перейти к покупкам
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(id)
    } else {
      await updateQuantity(id, newQuantity)
    }
  }

  const handleRemoveFromCart = async (id: string, productName: string) => {
    try {
      await removeFromCart(id)
      success(`"${productName}" удален из корзины`)
    } catch (err) {
      error('Ошибка при удалении из корзины')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCartIcon className="h-8 w-8 text-teal-500" />
            <h1 className="text-3xl font-light text-gray-900">Корзина</h1>
          </div>
          <p className="text-gray-600 font-light">
            {items.length > 0 
              ? `У вас ${items.reduce((sum, item) => sum + item.quantity, 0)} товаров в корзине`
              : 'Ваша корзина пуста'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const price = item.product.price

                return (
                  <div key={item.id} className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl hover:bg-white/30 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                      {(() => {
                        let images = []
                        try {
                          images = JSON.parse(item.product.images || '[]')
                        } catch (e) {
                          images = []
                        }
                        return (
                          <Image
                            src={images[0] || '/api/placeholder/300/300'}
                            alt={item.product.name}
                            fill
                            className="object-contain bg-white/50"
                            onError={(e) => {
                              console.log('🖼️ Ошибка загрузки изображения в корзине:', images[0])
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              // Показываем fallback div
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <span class="text-gray-400 text-sm font-light">Изображение недоступно</span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        )
                      })()}
                      


                      {/* Remove button */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRemoveFromCart(item.id, item.product.name)}
                          className="backdrop-blur-md bg-red-500/80 text-white rounded-full p-2 hover:bg-red-600/80 transition-colors border border-white/20"
                          title="Удалить из корзины"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <Link href={`/product/${item.product.id}`}>
                        <h3 className="text-lg font-light text-gray-900 mb-2 hover:text-teal-600 transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>



                      {/* Product info - показываем только выбранный размер */}
                      <div className="flex gap-2 mb-3 text-sm text-gray-600">
                        {item.sizeId && item.product.sizes && (() => {
                          const selectedSize = item.product.sizes.find((ps: any) => ps.sizeId === item.sizeId)
                          return selectedSize && (
                            <span className="backdrop-blur-sm bg-white/30 border border-white/40 px-2 py-1 rounded-full font-light">
                              Размер: {selectedSize.size.name} ({selectedSize.size.russianSize})
                            </span>
                          )
                        })()}
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-xl font-light text-gray-900">
                          {formatPrice(Number(price))}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600 font-light">Количество:</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm bg-white/30 border border-white/40 hover:bg-white/50 transition-all duration-200"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-light">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm bg-white/30 border border-white/40 hover:bg-white/50 transition-all duration-200"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-center backdrop-blur-sm bg-gradient-to-r from-teal-50/30 to-cyan-50/30 border border-white/40 py-2 rounded-xl">
                        <span className="text-lg font-light text-teal-700">
                          {formatPrice(Number(price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Clear Cart Button */}
            {items.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 transition-colors text-sm font-light"
                >
                  Очистить корзину
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl p-6 sticky top-4">
              <h2 className="text-xl font-light text-gray-900 mb-6">Итого</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 font-light">
                  <span>Товары ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-light">
                  <span>Доставка</span>
                  <span className="text-green-600">Бесплатно</span>
                </div>
                <hr className="border-white/30" />
                <div className="flex justify-between text-xl font-light text-gray-900">
                  <span>К оплате</span>
                  <span className="text-teal-600">{formatPrice(total)}</span>
                </div>
              </div>

              <Link 
                href="/checkout"
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300 text-center font-light block mb-4 border border-white/20"
              >
                🚀 Оформить заказ
              </Link>

              <Link
                href="/"
                className="w-full backdrop-blur-sm bg-white/30 text-gray-700 py-3 px-6 rounded-xl hover:bg-white/50 transition-all duration-200 text-center font-light block border border-white/40"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 