import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, logSuspiciousActivity, getClientIP, addSecurityHeaders } from '@/lib/security'

// Rate limiting: 5 попыток в минуту
const loginRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 минута
})

export async function POST(request: NextRequest) {
  const response = NextResponse.next()
  
  try {
    // Проверяем rate limit
    const rateLimitResult = loginRateLimit(request)
    
    if (!rateLimitResult.success) {
      // Логируем подозрительную активность
      logSuspiciousActivity('rate_limit', {
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        path: request.nextUrl.pathname
      })
      
      return addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'Слишком много попыток входа. Попробуйте через минуту.',
            retryAfter: Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000)
          },
          { status: 429 }
        )
      )
    }
    
    // Здесь должна быть логика входа (пока заглушка)
    return addSecurityHeaders(
      NextResponse.json({ message: 'Login endpoint - implement with NextAuth' })
    )
    
  } catch (error) {
    console.error('Ошибка в signin API:', error)
    
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      )
    )
  }
} 