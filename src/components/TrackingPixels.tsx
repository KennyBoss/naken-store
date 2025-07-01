import { prisma } from '@/lib/db'
import Script from 'next/script'

interface TrackingPixel {
  id: string
  name: string
  type: string
  pixelId: string
  code?: string | null
  isActive: boolean
  placement: string
}

interface TrackingPixelsProps {
  placement: 'HEAD' | 'BODY_START' | 'BODY_END'
}

// Генерация кода для Яндекс.Метрики
const generateYandexMetrika = (pixelId: string) => {
  return `
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");

    ym(${pixelId}, "init", {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:true,
      ecommerce:"dataLayer"
    });
  `
}

// Генерация кода для Google Analytics
const generateGoogleAnalytics = (pixelId: string) => {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${pixelId}');
  `
}

// Генерация кода для Facebook Pixel
const generateFacebookPixel = (pixelId: string) => {
  return `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `
}

// Генерация кода для VK Pixel
const generateVKPixel = (pixelId: string) => {
  return `
    !function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src='https://vk.com/js/api/openapi.js?169',t.onload=function(){VK.Retargeting.Init("${pixelId}"),VK.Retargeting.Hit()},document.head.appendChild(t)}();
  `
}

// Генерация кода для Google Ads
const generateGoogleAds = (pixelId: string) => {
  return `
    gtag('config', '${pixelId}');
  `
}

// Генерация кода по типу пикселя
const generatePixelCode = (pixel: TrackingPixel): string => {
  switch (pixel.type) {
    case 'YANDEX_METRIKA':
      return generateYandexMetrika(pixel.pixelId)
    case 'GOOGLE_ANALYTICS':
      return generateGoogleAnalytics(pixel.pixelId)
    case 'FACEBOOK_PIXEL':
      return generateFacebookPixel(pixel.pixelId)
    case 'VK_PIXEL':
      return generateVKPixel(pixel.pixelId)
    case 'GOOGLE_ADS':
      return generateGoogleAds(pixel.pixelId)
    case 'CUSTOM_HTML':
      return pixel.code || ''
    default:
      return ''
  }
}

// Получение внешних скриптов для загрузки
const getExternalScripts = (pixel: TrackingPixel): string | null => {
  switch (pixel.type) {
    case 'GOOGLE_ANALYTICS':
    case 'GOOGLE_ADS':
      return `https://www.googletagmanager.com/gtag/js?id=${pixel.pixelId}`
    default:
      return null
  }
}

export default async function TrackingPixels({ placement }: TrackingPixelsProps) {
  let pixels: TrackingPixel[] = []
  try {
    pixels = await prisma.trackingPixel.findMany({
      where: {
        isActive: true,
        placement: placement,
      },
      orderBy: { createdAt: 'asc' },
    })
  } catch (error) {
    console.error(`Ошибка загрузки пикселей для placement=${placement}:`, error)
    return null // Не рендерим ничего в случае ошибки
  }

  if (pixels.length === 0) {
    return null
  }

  return (
    <>
      {pixels.map((pixel) => {
        // Обработка CUSTOM_HTML
        if (pixel.type === 'CUSTOM_HTML') {
          if (!pixel.code) return null

          // Для HEAD, предполагаем, что это скрипт или тег, который можно вставить.
          // Оборачиваем в Script, чтобы Next.js правильно его обработал.
          // Это не сработает для <meta>, но сработает для верификационных скриптов.
          if (placement === 'HEAD') {
            return (
              <Script
                key={pixel.id}
                id={`tracking-pixel-${pixel.id}`}
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: pixel.code }}
              />
            )
          }
          
          // Для BODY, вставляем как есть в div. Подойдет для виджетов.
          return <div key={pixel.id} dangerouslySetInnerHTML={{ __html: pixel.code }} />
        }

        // Обработка остальных пикселей
        const externalScript = getExternalScripts(pixel)
        const pixelCode = generatePixelCode(pixel)

        return (
          <div key={pixel.id}>
            {/* Внешние скрипты */}
            {externalScript && (
              <Script
                src={externalScript}
                strategy="afterInteractive"
                async
              />
            )}

            {/* Код пикселя */}
            {pixelCode && (
              <Script
                id={`tracking-pixel-${pixel.id}`}
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: pixelCode,
                }}
              />
            )}

            {/* Noscript для Яндекс.Метрики */}
            {pixel.type === 'YANDEX_METRIKA' && (
              <noscript>
                <div>
                  <img
                    src={`https://mc.yandex.ru/watch/${pixel.pixelId}`}
                    style={{ position: 'absolute', left: '-9999px' }}
                    alt=""
                  />
                </div>
              </noscript>
            )}

            {/* Noscript для Facebook Pixel */}
            {pixel.type === 'FACEBOOK_PIXEL' && (
              <noscript>
                <img
                  height="1"
                  width="1"
                  style={{ display: 'none' }}
                  src={`https://www.facebook.com/tr?id=${pixel.pixelId}&ev=PageView&noscript=1`}
                  alt=""
                />
              </noscript>
            )}
          </div>
        )
      })}
    </>
  )
} 