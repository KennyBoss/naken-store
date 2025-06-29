'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Lock, Eye, EyeOff, User, Mail, Phone } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { success, error } = useToast()
  
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
  })
  
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await update() // Обновляем сессию
        success('Профиль успешно обновлен')
      } else {
        const data = await response.json()
        error(data.error || 'Ошибка обновления профиля')
      }
    } catch (err) {
      error('Не удалось обновить профиль')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSet = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)

    if (passwordData.password !== passwordData.confirmPassword) {
      error('Пароли не совпадают')
      setPasswordLoading(false)
      return
    }

    if (passwordData.password.length < 6) {
      error('Пароль должен содержать минимум 6 символов')
      setPasswordLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordData.password,
          email: formData.email
        }),
      })

      if (response.ok) {
        success('Пароль успешно установлен! Теперь вы можете входить по email+пароль')
        setPasswordData({ password: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        error(data.error || 'Ошибка установки пароля')
      }
    } catch (err) {
      error('Не удалось установить пароль')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    )
  }

  const hasPassword = session.user?.email && session.user?.name // Предполагаем что у пользователей с Google OAuth есть email и name

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={20} />
            Назад
          </button>
          <h1 className="text-3xl font-light text-gray-900">Настройки профиля</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Основная информация */}
          <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-6">
            <h2 className="text-xl font-light mb-6 flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-white/20 rounded-lg">
                <User size={20} className="text-teal-600" />
              </div>
              Основная информация
            </h2>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Имя
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 font-light"
                    placeholder="Ваше имя"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 font-light"
                    placeholder="example@mail.ru"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Телефон
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 font-light"
                    placeholder="+7 (999) 999-99-99"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg font-light flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300 border border-white/20"
              >
                <Save size={20} />
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </div>

          {/* Установка пароля */}
          <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-6">
            <h2 className="text-xl font-light mb-6 flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-white/20 rounded-lg">
                <Lock size={20} className="text-teal-600" />
              </div>
              {hasPassword ? 'Изменить пароль' : 'Установить пароль'}
            </h2>

            <div className="mb-4 p-4 backdrop-blur-sm bg-teal-50/50 border border-teal-200/50 rounded-xl">
              <p className="text-sm text-teal-800 font-light">
                {hasPassword 
                  ? 'Установите новый пароль для входа по email'
                  : 'Установите пароль, чтобы входить по email без кодов подтверждения'
                }
              </p>
            </div>

            <form onSubmit={handlePasswordSet} className="space-y-4">
              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  {hasPassword ? 'Новый пароль' : 'Пароль'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 font-light"
                    placeholder="Минимум 6 символов"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 font-light"
                    placeholder="Повторите пароль"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-green-600 hover:shadow-lg font-light flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300 border border-white/20"
              >
                <Lock size={20} />
                {passwordLoading ? 'Установка...' : (hasPassword ? 'Изменить пароль' : 'Установить пароль')}
              </button>
            </form>
          </div>
        </div>

        {/* Выход */}
        <div className="mt-8 text-center">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-red-600 hover:text-red-800 font-light transition-colors"
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  )
} 