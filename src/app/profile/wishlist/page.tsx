'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookmarkIcon, ShoppingCartIcon, TrashIcon } from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/utils'

export default function WishlistPage() {
  const { items, isLoading, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { success, error } = useToast()

  // loadWishlist уже вызывается автоматически в WishlistProvider

  const handleRemoveFromWishlist = async (productId: string, productName: string) => {
    try {
      await removeFromWishlist(productId)
      success(`"${productName}" удален из сохраненных`)
    } catch (err) {
      error('Ошибка при удалении из сохраненных')
    }
  }

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart({ productId, quantity: 1 })
      success(`"${productName}" добавлен в корзину`)
    } catch (err) {
      error('Не удалось добавить товар в корзину')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookmarkIcon className="h-8 w-8 text-teal-500" />
            <h1 className="text-3xl font-light text-gray-900">Сохраненные</h1>
          </div>
          <p className="text-gray-600 font-light">
            {items.length > 0 
              ? `У вас ${items.length} сохраненных товаров`
              : 'Ваш список сохраненных товаров пуст'
            }
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <BookmarkIcon className="h-16 w-16 text-teal-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Ваш список сохраненных товаров пуст
            </h3>
            <p className="text-gray-500 mb-6 font-light">
              Сохраняйте товары, чтобы не потерять их
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300"
            >
              Перейти к покупкам
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const product = item.product
              const price = product.price
              

              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    {(() => {
                      let images = []
                      try {
                        images = JSON.parse(product.images || '[]')
                      } catch (e) {
                        images = []
                      }
                      return (
                        <Image
                          src={images[0] || '/api/placeholder/300/300'}
                          alt={product.name}
                          fill
                          className="object-contain bg-gray-50"
                        />
                      )
                    })()}
                    


                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRemoveFromWishlist(product.id, product.name)}
                        className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        title="Удалить из сохраненных"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-teal-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xl font-semibold text-gray-900">
                        {formatPrice(Number(price))}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product.id, product.name)}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 px-4 rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <ShoppingCartIcon className="w-4 h-4" />
                        В корзину
                      </button>
                      
                      <Link
                        href={`/product/${product.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium text-center"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 