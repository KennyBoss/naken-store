import { NextRequest, NextResponse } from 'next/server'

// Rate limiting в памяти (для production используйте Redis)
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Очистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  keyGenerator?: (req: NextRequest) => string
}

// Rate limiting middleware
export function rateLimit(options: RateLimitOptions) {
  return (req: NextRequest) => {
    const key = options.keyGenerator ? options.keyGenerator(req) : getClientIP(req)
    const now = Date.now()
    
    const entry = rateLimitMap.get(key)
    
    if (!entry) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      })
      return { success: true, remaining: options.maxRequests - 1 }
    }
    
    if (now > entry.resetTime) {
      entry.count = 1
      entry.resetTime = now + options.windowMs
      return { success: true, remaining: options.maxRequests - 1 }
    }
    
    entry.count++
    
    if (entry.count > options.maxRequests) {
      return { 
        success: false, 
        remaining: 0,
        resetTime: entry.resetTime
      }
    }
    
    return { 
      success: true, 
      remaining: options.maxRequests - entry.count
    }
  }
}

// Получение IP клиента
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP.trim()
  }
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }
  
  return '127.0.0.1'
}

// Валидация входных данных
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    // Удаляем потенциально опасные символы
    .replace(/[<>]/g, '')
    // Ограничиваем длину
    .slice(0, 1000)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// CSRF токен генерация (простая реализация)
export function generateCSRFToken(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64')
}

export function verifyCSRFToken(token: string): boolean {
  // В простой реализации проверяем что токен не пустой
  // В production используйте более надежную проверку
  return typeof token === 'string' && token.length > 10
}

// Эти функции перенесены в API routes так как не работают в Edge Runtime

// Защитные заголовки
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Content Type Options
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Frame Options
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return response
}

// Логирование подозрительной активности
export function logSuspiciousActivity(
  type: 'failed_login' | 'rate_limit' | 'invalid_token' | 'unauthorized_access',
  details: {
    ip: string
    userAgent?: string
    userId?: string
    path?: string
    data?: unknown
  }
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    ip: details.ip,
    userAgent: details.userAgent,
    userId: details.userId,
    path: details.path,
    data: details.data
  }
  
  // В development логируем в консоль
  if (process.env.NODE_ENV === 'development') {
    console.warn('🚨 SECURITY:', logEntry)
  }
  
  // В production отправляйте в систему мониторинга
  // await sendToSecurityService(logEntry)
}

// Проверка загружаемых файлов
export function validateFile(file: File): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('Неподдерживаемый тип файла')
  }
  
  if (file.size > maxSize) {
    errors.push('Файл слишком большой (максимум 5MB)')
  }
  
  // Проверка имени файла на подозрительные символы
  if (/[<>:"/\\|?*]/.test(file.name)) {
    errors.push('Недопустимые символы в имени файла')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Проверка SQL инъекций (базовая)
export function detectSQLInjection(input: string): boolean {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'EXECUTE', 'SCRIPT', 'UNION', 'OR 1=1', 'OR 1', 'OR TRUE',
    '--', '/*', '*/', 'xp_', 'sp_'
  ]
  
  const upperInput = input.toUpperCase()
  return sqlKeywords.some(keyword => upperInput.includes(keyword))
}

// Проверка админских прав и авторизации перенесены в API routes
// так как getServerSession не работает в Edge Runtime middleware 