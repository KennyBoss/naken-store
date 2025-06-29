import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ConditionalLayout from '@/components/ConditionalLayout'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { ToastProvider } from '@/context/ToastContext'
import { SearchProvider } from '@/context/SearchContext'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'
// import { Toaster } from 'react-hot-toast' // Убираем в пользу кастомного Toast
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/JsonLd'
import JsonLdOrganization from '@/components/JsonLdOrganization'
import TrackingPixelsStatic from '@/components/TrackingPixelsStatic'
import YandexMetrika from '@/components/YandexMetrika'
import CookieConsent from '@/components/CookieConsent'
import OnlineChat from '@/components/OnlineChat'
import { getSiteSettings } from '@/lib/site-settings'

// 🚀 LCP КРИТИЧНО: агрессивная оптимизация шрифтов!
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'optional', // КРИТИЧНО! Не блокирует рендеринг если шрифт не загрузился
  preload: true,
  weight: ['400', '500'], // Загружаем только нужные веса
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: 'optional', // Не блокирует
  preload: false, // Второстепенный шрифт
  weight: ['400'], // Только один вес
});

// Динамическое генерирование метаданных на основе настроек сайта
export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings()
  
  return {
    metadataBase: new URL('https://naken.store'),
    title: siteSettings.site_title,
    description: siteSettings.site_description,
    keywords: siteSettings.site_keywords,
    authors: [{ name: siteSettings.site_author }],
    creator: siteSettings.site_author,
    publisher: siteSettings.site_author,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: "KhjyTp6qCAxl2YEKLtdtPl3UaT2Cn6AUwFWKWU_IkRg",
      // yandex: "yandex-verification-code"
    },
    alternates: {
      canonical: 'https://naken.store',
    },
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      url: 'https://naken.store',
      siteName: siteSettings.site_author,
      title: siteSettings.site_title,
      description: siteSettings.site_description,
      images: [{
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: siteSettings.site_author,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteSettings.site_title,
      description: siteSettings.site_description,
      images: ['/og-image.jpg'],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* DNS prefetch и preconnect для ускорения загрузки */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//naken.store" />
        
        {/* Preload критических ресурсов для устранения render-blocking */}
        {/* Убираем неправильные preload ссылки - Next.js сам генерирует нужные */}
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#14b8a6" />
        <meta name="theme-color" content="#14b8a6" />
        
        {/* 🚀 LCP КРИТИЧНО: Critical CSS inline для первого экрана */}
        <style>{`
          html{scroll-behavior:smooth}
          body{margin:0;padding:0;font-family:var(--font-inter),system-ui,sans-serif;background:linear-gradient(135deg,#f9fafb 0%,#f3f4f6 100%);min-height:100vh}
          .masonry-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;padding:1rem 0}
          @media(max-width:640px){.masonry-grid{grid-template-columns:repeat(2,1fr);gap:0.75rem}}
          .masonry-item{break-inside:avoid;margin-bottom:1rem}
          .animate-fade-in{animation:fadeIn 0.6s ease-out forwards}
          @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          .backdrop-blur-sm{backdrop-filter:blur(4px)}
          .bg-white\\/20{background-color:rgba(255,255,255,0.2)}
          .border-white\\/30{border-color:rgba(255,255,255,0.3)}
        `}</style>
        
        {/* 🚀 LCP: критические SEO данные перенесены в body для ускорения рендеринга */}
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {/* 🚀 LCP: минимум блокирующих компонентов в начале body */}
        
        <SessionProviderWrapper>
          <ToastProvider>
            <SearchProvider>
              <CartProvider>
                <WishlistProvider>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                  <CookieConsent />
                  <OnlineChat />
                  {/* Используем кастомный ToastProvider вместо react-hot-toast */}
                </WishlistProvider>
              </CartProvider>
            </SearchProvider>
          </ToastProvider>
        </SessionProviderWrapper>
        
        {/* 🚀 LCP: все не-критичные компоненты в конце для ускорения */}
        
        {/* JSON-LD структурированные данные */}
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <JsonLdOrganization />
        
        {/* Аналитика и трекинг - загружаем после LCP */}
        <Suspense fallback={null}>
          <YandexMetrika />
        </Suspense>
        
        <Suspense fallback={null}>
          <TrackingPixelsStatic placement="HEAD" />
        </Suspense>
        
        <Suspense fallback={null}>
          <TrackingPixelsStatic placement="BODY_START" />
        </Suspense>
        
        <Suspense fallback={null}>
          <TrackingPixelsStatic placement="BODY_END" />
        </Suspense>
      </body>
    </html>
  );
}
