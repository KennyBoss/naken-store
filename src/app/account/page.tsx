'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { User, Phone, Mail, Calendar, Settings } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-2">Личный кабинет</h1>
          <p className="text-gray-600">Управляйте своим аккаунтом и заказами</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                <User size={20} />
                Личная информация
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'Пользователь'} 
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={24} className="text-gray-500" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-medium">
                      {session.user.name || 'Пользователь'}
                    </h3>
                    <p className="text-gray-600">
                      {session.user.role === 'ADMIN' ? 'Администратор' : 'Покупатель'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {session.user.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone size={18} className="text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Телефон</p>
                        <p className="font-medium">{session.user.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {session.user.email && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail size={18} className="text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{session.user.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300">
                    Редактировать профиль
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders - заглушка */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium mb-6">Последние заказы</h2>
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p>У вас пока нет заказов</p>
                <Link 
                  href="/" 
                  className="inline-block mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300"
                >
                  Начать покупки
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium mb-4">Быстрые действия</h3>
              
              <div className="space-y-3">
                <Link 
                  href="/orders" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar size={18} className="text-gray-600" />
                  <span>Мои заказы</span>
                </Link>
                
                <Link 
                  href="/cart" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings size={18} className="text-gray-600" />
                  <span>Корзина</span>
                </Link>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Settings size={18} className="text-gray-600" />
                  <span>Настройки</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="font-medium mb-4">Статистика</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Всего заказов</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Потрачено</span>
                  <span className="font-medium">0 ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Статус</span>
                  <span className="font-medium text-green-600">Активный</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 