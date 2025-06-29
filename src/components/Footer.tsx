'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Footer() {
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
        console.error('Ошибка загрузки логотипа в футере:', error)
        setSiteLogo('')
      } finally {
        setLogoLoading(false)
      }
    }

    loadSiteLogo()
  }, [])
  return (
    <footer className="backdrop-blur-md bg-white/50 border-t border-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          {/* Left side */}
          <div className="flex items-center gap-6">
            <Link href="/" className="font-light text-gray-900 text-lg">
              {logoLoading ? (
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : siteLogo && siteLogo !== '/images/logo.png' ? (
                <Image
                  src={siteLogo}
                  alt="NAKEN Store"
                  width={80}
                  height={30}
                  className="h-6 w-auto object-contain"
                  onError={() => setSiteLogo('')}
                />
              ) : (
                'NAKEN'
              )}
            </Link>
            <span className="text-gray-600 font-light">© 2024</span>
          </div>
          
          {/* Center links */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/delivery" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
              Доставка
            </Link>
            <Link href="/payment" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
              Оплата
            </Link>
            <Link href="/returns" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
              Возврат
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
              Конфиденциальность
            </Link>
            <Link href="/offer" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
              Оферта
            </Link>
            <Link href="/contacts" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
              Контакты
            </Link>
          </div>
          
          {/* Right side */}
          <div className="text-gray-600 font-light">
            +7 (920) 994-07-07
          </div>
        </div>
      </div>
    </footer>
  )
} 