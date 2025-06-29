'use client'

import { signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

export default function SignOutPage() {
  useEffect(() => {
    // Автоматический выход через 2 секунды
    const timer = setTimeout(() => {
      signOut({ callbackUrl: '/' })
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut size={24} className="text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Выход из аккаунта</h1>
          <p className="text-gray-600 text-sm mb-6">
            Вы выходите из своего аккаунта...
          </p>

          <div className="space-y-4">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full bg-teal-500 text-white py-3 rounded-xl hover:bg-teal-600 transition-colors font-medium"
            >
              Выйти сейчас
            </button>

            <Link 
              href="/"
              className="block w-full py-3 text-gray-600 hover:text-teal-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Остаться в аккаунте
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 