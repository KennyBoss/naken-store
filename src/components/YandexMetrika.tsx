'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    ym: any;
  }
}

export default function YandexMetrika() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [cookiesAccepted, setCookiesAccepted] = useState(false)

  // Проверяем согласие на cookies
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasConsent = localStorage.getItem('cookies-accepted') === 'true'
      setCookiesAccepted(hasConsent)
    }
  }, [])

  // Отслеживаем изменения URL для SPA переходов
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ym && cookiesAccepted) {
      const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      window.ym(102911798, 'hit', url)
    }
  }, [pathname, searchParams, cookiesAccepted])

  // Не загружаем метрику без согласия
  if (!cookiesAccepted) {
    return null
  }

  return (
    <>
      {/* Yandex.Metrika counter */}
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(102911798, "init", {
              defer: true,
              clickmap: true,
              trackLinks: true,
              accurateTrackBounce: true,
              webvisor: true,
              ecommerce: "dataLayer"
            });
          `
        }}
      />
      
      {/* NoScript fallback */}
      <noscript>
        <div>
          <img 
            src="https://mc.yandex.ru/watch/102911798" 
            style={{ position: 'absolute', left: '-9999px' }} 
            alt="" 
          />
        </div>
      </noscript>
    </>
  )
} 