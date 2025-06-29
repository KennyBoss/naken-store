'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Ошибка конфигурации сервера'
      case 'AccessDenied':
        return 'Доступ запрещён'
      case 'Verification':
        return 'Ошибка верификации'
      case 'Default':
        return 'Произошла ошибка входа'
      case 'CallbackError':
        return 'Ошибка обратного вызова'
      case 'OAuthSignin':
        return 'Ошибка входа через социальную сеть'
      case 'OAuthCallback':
        return 'Ошибка обратного вызова OAuth'
      case 'OAuthCreateAccount':
        return 'Ошибка создания аккаунта'
      case 'EmailCreateAccount':
        return 'Ошибка создания аккаунта через email'
      case 'Callback':
        return 'Ошибка обратного вызова'
      case 'OAuthAccountNotLinked':
        return 'Аккаунт уже связан с другим провайдером'
      case 'EmailSignin':
        return 'Ошибка отправки email'
      case 'CredentialsSignin':
        return 'Неверные данные для входа'
      case 'SessionRequired':
        return 'Требуется авторизация'
      default:
        return 'Произошла неизвестная ошибка'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка авторизации</h1>
          <p className="text-gray-600 text-sm mb-6">
            {getErrorMessage(error)}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm">
              Код ошибки: {error}
            </div>
          )}

          <div className="space-y-4">
            <Link 
              href="/auth/signin"
              className="block w-full bg-teal-500 text-white py-3 rounded-xl hover:bg-teal-600 transition-colors font-medium"
            >
              Попробовать снова
            </Link>

            <Link 
              href="/"
              className="block w-full py-3 text-gray-600 hover:text-teal-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Вернуться в магазин
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
} 