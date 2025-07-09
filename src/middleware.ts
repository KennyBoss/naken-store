import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { addSecurityHeaders, rateLimit, logSuspiciousActivity, getClientIP } from '@/lib/security'

// Global rate limiting: 1000 запросов в минуту на IP (для разработки)
const globalRateLimit = rateLimit({
  maxRequests: 1000,
  windowMs: 60 * 1000,
})

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth
    const { pathname } = req.nextUrl

    // Дебаг информация для админских маршрутов
    if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
      console.log('🔍 Middleware проверка admin маршрута:', {
        path: pathname,
        hasToken: !!token,
        tokenRole: token?.role,
        tokenSub: token?.sub,
        timestamp: new Date().toISOString()
      })
    }

    // Глобальный rate limiting
    const rateLimitResult = globalRateLimit(req)
    if (!rateLimitResult.success) {
      logSuspiciousActivity('rate_limit', {
        ip: getClientIP(req),
        userAgent: req.headers.get('user-agent') || undefined,
        path: pathname
      })
      
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Слишком много запросов' },
          { status: 429 }
        )
      )
    }

    // Проверяем админские маршруты (исключая страницу логина админа)
    if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
      if (!token?.role || token.role !== 'ADMIN') {
        console.log('❌ Доступ к админке запрещен:', {
          path: pathname,
          hasToken: !!token,
          tokenRole: token?.role,
          reason: !token ? 'no_token' : !token.role ? 'no_role' : token.role !== 'ADMIN' ? 'wrong_role' : 'unknown'
        })
        
        logSuspiciousActivity('unauthorized_access', {
          ip: getClientIP(req),
          userAgent: req.headers.get('user-agent') || undefined,
          path: pathname,
          userId: token?.sub
        })
        // Перенаправляем на админ-логин, а не на обычный вход
        return NextResponse.redirect(new URL('/admin-login?error=AccessDenied', req.url))
      }
      
      console.log('✅ Доступ к админке разрешен:', {
        path: pathname,
        role: token.role,
        userId: token.sub
      })
    }

    // Проверяем профильные маршруты
    if (pathname.startsWith('/profile')) {
      console.log('🔍 Проверка профиля:', {
        path: pathname,
        hasToken: !!token,
        tokenSub: token?.sub,
        tokenRole: token?.role
      })
      if (!token) {
        console.log('❌ Перенаправление на вход из профиля:', pathname)
        return NextResponse.redirect(new URL('/auth/signin?callbackUrl=' + encodeURIComponent(pathname), req.url))
      }
    }

    // Проверяем checkout (требует авторизации)
    if (pathname.startsWith('/checkout')) {
      console.log('🔍 Проверка checkout:', {
        path: pathname,
        hasToken: !!token,
        tokenSub: token?.sub,
        tokenRole: token?.role
      })
      if (!token) {
        console.log('❌ Перенаправление на вход из checkout:', pathname)
        return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/checkout', req.url))
      }
    }

    // Добавляем защитные заголовки ко всем ответам
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Дебаг для авторизации
        if (pathname.startsWith('/admin')) {
          console.log('🔍 Middleware authorized callback:', {
            path: pathname,
            hasToken: !!token,
            tokenRole: token?.role
          })
        }
        
        // Публичные маршруты (всегда доступны)
        const publicRoutes = [
          '/',
          '/intro',
          '/product',
          '/cart',
          '/auth',
          '/admin-login',
          '/contacts',      // 🔥 Важные страницы
          '/delivery',      // 🔥 SEO страницы
          '/payment',       // 🔥 Должны быть доступны
          '/returns',       // 🔥 Всем пользователям
          '/terms',         // 🔥 Без авторизации
          '/privacy',       // 🔥 
          '/offer',         // 🔥 
          '/catalog',       // 🔥 Каталог если есть
          '/api/auth',
          '/api/products',
          '/api/categories',
          '/api/placeholder',
          '/api/search',
          '/api/reviews',
          '/api/upload'
          // 🔧 УДАЛЕН /api/uploads - он не нужен, nginx обслуживает /uploads/ напрямую
        ]

        // Проверяем публичные маршруты
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // Админские маршруты требуют роль ADMIN
        if (pathname.startsWith('/admin')) {
          const isAuthorized = token?.role === 'ADMIN'
          console.log('🔍 Admin route authorization:', {
            path: pathname,
            isAuthorized,
            tokenRole: token?.role
          })
          return isAuthorized
        }

        // Профильные маршруты требуют авторизации
        if (pathname.startsWith('/profile')) {
          console.log('🔍 Authorized callback профиль:', {
            path: pathname,
            hasToken: !!token,
            tokenSub: token?.sub,
            authorized: !!token
          })
          return !!token
        }

        // Checkout требует авторизации
        if (pathname.startsWith('/checkout')) {
          console.log('🔍 Authorized callback checkout:', {
            path: pathname,
            hasToken: !!token,
            tokenSub: token?.sub,
            authorized: !!token
          })
          return !!token
        }

        // API маршруты корзины и заказов требуют авторизации
        if (pathname.startsWith('/api/cart') || pathname.startsWith('/api/orders')) {
          return !!token
        }

        // По умолчанию разрешаем доступ
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, llms.txt (теперь в public/, автоматически исключены)
     * - sitemap.xml (генерируется динамически)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 