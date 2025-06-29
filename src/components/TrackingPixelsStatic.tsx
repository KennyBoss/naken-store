'use client'

import Script from 'next/script'

interface TrackingPixelsStaticProps {
  placement: 'HEAD' | 'BODY_START' | 'BODY_END'
}

export default function TrackingPixelsStatic({ placement }: TrackingPixelsStaticProps) {
  // Только HEAD размещение с Яндекс.Метрикой 3663988
  if (placement !== 'HEAD') {
    return null
  }
  
  return (
    <>
      {/* Яндекс.Метрика 3663988 - статичная версия */}
      <Script
        id="yandex-metrika-3663988"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");

            ym(3663988, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true,
              ecommerce:"dataLayer"
            });
            
            console.log('🎯 Яндекс.Метрика 3663988 загружена (статично)');
          `
        }}
      />
      
      {/* Noscript для Яндекс.Метрики */}
      <noscript>
        <div>
          <img 
            src="https://mc.yandex.ru/watch/3663988" 
            style={{ position: 'absolute', left: '-9999px' }} 
            alt="" 
          />
        </div>
      </noscript>
    </>
  )
} 