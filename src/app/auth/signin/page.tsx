'use client'

import { useState, Suspense, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, KeyRound, LogIn, Loader2, Mail, Smartphone, Lock, Eye, EyeOff } from 'lucide-react'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const errorParam = searchParams.get('error')

  const [authMethod, setAuthMethod] = useState<'oauth' | 'password' | 'code'>('oauth')
  const [authType, setAuthType] = useState<'phone' | 'email'>('phone') // для кодов
  const [step, setStep] = useState<'contact' | 'code'>('contact')
  const [contact, setContact] = useState('')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useState(() => {
    if (errorParam) {
      setError('Неверный код или срок его действия истек.')
    }
  })

  // Вход через Google
  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch (err) {
      setError('Ошибка входа через Google')
      setLoading(false)
    }
  }

  // Вход по email + пароль
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials-password', {
        email,
        password,
        redirect: false,
        callbackUrl
      })
      
      if (result?.error) {
        setError('Неверный email или пароль')
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (err: any) {
      setError('Ошибка авторизации')
    } finally {
      setLoading(false)
    }
  }

  // Отправка кода (SMS/Email)
  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const endpoint = authType === 'phone' ? '/api/auth/send-sms' : '/api/auth/send-email'
      const payload = authType === 'phone' ? { phone: contact } : { email: contact }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки кода')
      }
      
      setStep('code')
    } catch (err: any) {
      setError(err.message || `Не удалось отправить код на ${authType === 'phone' ? 'телефон' : 'email'}`)
    } finally {
      setLoading(false)
    }
  }

  // Вход по коду
  const handleCodeSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const credentials = authType === 'phone' 
        ? { phone: contact, code }
        : { email: contact, code }

      const result = await signIn(authType, {
        ...credentials,
        redirect: false,
        callbackUrl
      })
      
      if (result?.error) {
        setError('Неверный код')
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (err: any) {
      setError('Ошибка авторизации')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep('contact')
    setContact('')
    setCode('')
    setError('')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {authMethod === 'oauth' ? (
                <LogIn size={28} className="text-white" />
              ) : authMethod === 'password' ? (
                <Lock size={28} className="text-white" />
              ) : step === 'contact' ? (
                authType === 'phone' ? <Phone size={28} className="text-white" /> : <Mail size={28} className="text-white" />
              ) : (
                <KeyRound size={28} className="text-white" />
              )}
            </div>
            <h1 className="text-2xl font-light text-gray-900 mb-2">
              {authMethod === 'oauth' ? 'Вход в аккаунт' : 
               authMethod === 'password' ? 'Вход по паролю' :
               step === 'contact' ? 'Вход или регистрация' : 'Введите код'}
            </h1>
            <p className="text-gray-600 text-sm font-light">
              {authMethod === 'oauth' ? 'Выберите удобный способ входа' :
               authMethod === 'password' ? 'Введите ваш email и пароль' :
               step === 'contact' 
                ? `Мы отправим код подтверждения на ваш ${authType === 'phone' ? 'номер' : 'email'}`
                : `Код отправлен на ${authType === 'phone' ? 'номер' : 'email'} ${contact}`
              }
            </p>
          </div>

          {error && (
            <div className="backdrop-blur-sm bg-red-100/50 border border-red-200/50 text-red-700 p-3 rounded-xl mb-6 text-sm text-center font-light">
              {error}
            </div>
          )}

          {/* Выбор метода авторизации */}
          {authMethod === 'oauth' && (
            <div className="space-y-4">
              {/* Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 backdrop-blur-sm bg-white/70 border border-white/40 rounded-xl hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-light text-gray-700">Войти через Google</span>
              </button>

              {/* Разделитель */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/40"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/20 text-gray-500 font-light">или</span>
                </div>
              </div>

              {/* Кнопки других методов */}
              <button
                onClick={() => setAuthMethod('password')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl hover:bg-white/50 transition-all duration-300 text-gray-700 font-light"
              >
                <Lock size={20} />
                Войти по паролю
              </button>

              <button
                onClick={() => setAuthMethod('code')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl hover:bg-white/50 transition-all duration-300 text-gray-700 font-light"
              >
                <KeyRound size={20} />
                Войти по коду
              </button>
            </div>
          )}

          {/* Форма входа по паролю */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-light text-gray-700 mb-1">
                  Email адрес
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="w-full pl-10 pr-4 py-3 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 font-light" 
                    placeholder="example@mail.ru"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-light text-gray-700 mb-1">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'}
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="w-full pl-10 pr-12 py-3 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 font-light" 
                    placeholder="Введите пароль"
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
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg font-light flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300 border border-white/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                {loading ? 'Вход...' : 'Войти'}
              </button>
              <button 
                type="button" 
                onClick={() => setAuthMethod('oauth')} 
                className="w-full text-gray-600 hover:text-teal-600 text-sm font-light transition-colors"
              >
                ← Другие способы входа
              </button>
            </form>
          )}

          {/* Форма входа по коду */}
          {authMethod === 'code' && (
            <>
              {/* Переключатель типа авторизации */}
              {step === 'contact' && (
                <div className="flex backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setAuthType('phone')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-light transition-all duration-300 ${
                      authType === 'phone'
                        ? 'bg-white/70 text-teal-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                    }`}
                  >
                    <Smartphone size={16} />
                    Телефон
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthType('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-light transition-all duration-300 ${
                      authType === 'email'
                        ? 'bg-white/70 text-teal-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                    }`}
                  >
                    <Mail size={16} />
                    Email
                  </button>
                </div>
              )}

              {step === 'contact' ? (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="contact" className="block text-sm font-light text-gray-700 mb-1">
                      {authType === 'phone' ? 'Номер телефона' : 'Email адрес'}
                    </label>
                    <div className="relative">
                      {authType === 'phone' ? (
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      ) : (
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      )}
                      <input 
                        id="contact" 
                        name="contact" 
                        type={authType === 'phone' ? 'tel' : 'email'}
                        value={contact} 
                        onChange={e => setContact(e.target.value)} 
                        required 
                        className="w-full pl-10 pr-4 py-3 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 font-light" 
                        placeholder={authType === 'phone' ? '+7 (999) 999-99-99' : 'example@mail.ru'}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg font-light flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300 border border-white/20"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                    {loading ? 'Отправка...' : 'Получить код'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setAuthMethod('oauth')} 
                    className="w-full text-gray-600 hover:text-teal-600 text-sm font-light transition-colors"
                  >
                    ← Другие способы входа
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-light text-gray-700 mb-1">
                      Код подтверждения
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <input 
                        id="code" 
                        name="code" 
                        type="text" 
                        value={code} 
                        onChange={e => setCode(e.target.value)} 
                        required 
                        className="w-full pl-10 pr-4 py-3 backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 font-light" 
                        placeholder={authType === 'phone' ? '1234' : '123456'}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 font-light">
                      {authType === 'phone' 
                        ? 'SMS код из 4 цифр (смотрите в консоли сервера)' 
                        : 'Email код из 6 цифр (смотрите в консоли сервера)'
                      }
                    </p>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg font-light flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300 border border-white/20"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                    {loading ? 'Проверка...' : 'Войти'}
                  </button>
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="w-full text-gray-600 hover:text-teal-600 text-sm font-light transition-colors"
                  >
                    Изменить {authType === 'phone' ? 'номер' : 'email'}
                  </button>
                </form>
              )}
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-teal-600 transition-colors inline-flex items-center gap-1 font-light">
              <ArrowLeft size={16} />
              Вернуться в магазин
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Загрузка...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
} 