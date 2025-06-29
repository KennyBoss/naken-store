'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCartIcon, UserIcon, SearchIcon, XIcon, ShoppingBagIcon, CreditCardIcon, TruckIcon, LogOut, Settings, BookmarkIcon } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useSearch } from '@/context/SearchContext'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

export default function Navbar() {
  const { itemCount } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { searchQuery, setSearchQuery, clearSearch: clearGlobalSearch } = useSearch()
  const { data: session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [siteLogo, setSiteLogo] = useState<string>('')
  const [logoLoading, setLogoLoading] = useState(true)

  // Загружаем настройки логотипа через API
  useEffect(() => {
    const loadSiteLogo = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const settings = await response.json()
          setSiteLogo(settings.site_logo || '')
        } else {
          setSiteLogo('')
        }
      } catch (error) {
        console.error('Ошибка загрузки логотипа:', error)
        setSiteLogo('')
      } finally {
        setLogoLoading(false)
      }
    }

    loadSiteLogo()
  }, [])

  const clearSearch = () => {
    clearGlobalSearch()
    setIsSearchExpanded(false)
  }

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Верхняя часть с логотипом, кнопкой и иконками */}
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              {logoLoading ? (
                <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
              ) : siteLogo && siteLogo !== '/images/logo.png' ? (
                <div className="flex items-center">
                  <Image
                    src={siteLogo}
                    alt="NAKEN Store"
                    width={120}
                    height={40}
                    className="h-8 w-auto object-contain"
                    onError={() => setSiteLogo('')}
                  />
                </div>
              ) : (
                <span className="text-xl sm:text-2xl font-semibold text-gray-900">NAKEN</span>
              )}
            </Link>

            {/* Кнопка "Как заказать" - всегда видна */}
            <div className="flex-1 flex justify-center mx-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base"
              >
                Как заказать?
              </button>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">

              {/* User menu */}
              <div className="relative">
                {session ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 sm:p-2 text-teal-600 hover:text-teal-800 transition-colors"
                  >
                    {session.user.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'Пользователь'} 
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                    <span className="hidden sm:inline text-sm">
                      {session.user.name || session.user.phone || 'Пользователь'}
                    </span>
                  </button>
                ) : (
                  <Link href="/auth/signin" className="p-1.5 sm:p-2 text-teal-600 hover:text-teal-800 transition-colors">
                    <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Link>
                )}

                {/* User dropdown menu */}
                {showUserMenu && session && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-medium text-sm">{session.user.name}</p>
                      <p className="text-xs text-gray-600">{session.user.phone || session.user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Мой профиль
                      </Link>
                      <Link 
                        href="/profile/orders" 
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Мои заказы
                      </Link>
                      {session.user.role === 'ADMIN' && (
                        <>
                          <Link 
                            href="/admin" 
                            className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors border-t border-gray-200 text-teal-600 font-medium"
                            onClick={() => setShowUserMenu(false)}
                          >
                            🔧 Админ-панель
                          </Link>
                          <Link 
                            href="/admin/chat" 
                            className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-teal-600 font-medium"
                            onClick={() => setShowUserMenu(false)}
                          >
                            💬 Управление чатами
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => {
                          signOut()
                          setShowUserMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Выйти
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist link */}
              <Link href="/profile/wishlist" className="p-1.5 sm:p-2 text-teal-600 hover:text-teal-800 transition-colors relative">
                <BookmarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-medium flex items-center justify-center shadow-sm">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="p-1.5 sm:p-2 text-teal-600 hover:text-teal-800 transition-colors relative">
                <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-xs font-medium flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Интегрированный поиск - адаптивный */}
          <div className="pb-3 sm:pb-4 relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchExpanded(true)}
                onBlur={() => setTimeout(() => setIsSearchExpanded(false), 200)}
                placeholder="Поиск товаров..."
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all duration-200 placeholder-gray-500"
              />
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <XIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Показываем только популярные запросы при фокусе на пустом поле */}
            {isSearchExpanded && searchQuery.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm text-gray-500 font-medium">Популярные:</span>
                    {['Джинсы', 'Рубашки', 'Платья', 'Куртки', 'Футболки', 'Сумки'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


      </nav>

      {/* Модальное окно "Как заказать" */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-md bg-white/90 border border-white/30 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            {/* Кнопка закрытия */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XIcon className="h-6 w-6" />
            </button>

            {/* Заголовок */}
            <h2 className="text-2xl font-light text-gray-900 mb-6 text-center">
              Как заказать на NAKEN?
            </h2>

            {/* 3 шага */}
            <div className="space-y-6">
              {/* Шаг 1 */}
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-light text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="font-light text-gray-900">Выберите товар</h3>
                  </div>
                  <p className="text-gray-600 text-sm font-light">
                    Используйте поиск, фильтры по размерам и цветам. Добавляйте в избранное и сравнивайте!
                  </p>
                </div>
              </div>

              {/* Шаг 2 */}
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-light text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCardIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="font-light text-gray-900">Оформите заказ</h3>
                  </div>
                  <p className="text-gray-600 text-sm font-light">
                    Быстрое оформление или через аккаунт. Оплата картой онлайн (T-Bank, ЮKassa) или при получении!
                  </p>
                </div>
              </div>

              {/* Шаг 3 */}
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-light text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TruckIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="font-light text-gray-900">Отслеживайте заказ</h3>
                  </div>
                  <p className="text-gray-600 text-sm font-light">
                    Войдите через Google, SMS или email-код. Статусы заказов в реальном времени!
                  </p>
                </div>
              </div>
            </div>



            {/* Кнопки действий */}
            <div className="mt-8 space-y-3">
              <Link
                href="/cart"
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-light hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                Перейти в корзину
              </Link>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-white/80 text-gray-700 py-2.5 rounded-xl font-light hover:bg-white transition-all duration-300 border border-gray-200"
              >
                Понятно, спасибо!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 