import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ width: string; height: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { width, height } = await params
    
    const w = parseInt(width)
    const h = parseInt(height)
    
    // Валидация размеров
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0 || w > 2000 || h > 2000) {
      return new NextResponse('Invalid dimensions', { status: 400 })
    }

    // Создаем SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <circle cx="${w/2}" cy="${h/2}" r="24" fill="#e9ecef"/>
        <rect x="${w/2 - 12}" y="${h/2 - 12}" width="24" height="24" fill="#6c757d" rx="2"/>
        <rect x="${w/2 - 8}" y="${h/2 - 8}" width="6" height="6" fill="#f8f9fa" rx="1"/>
        <rect x="${w/2 + 2}" y="${h/2 - 8}" width="6" height="6" fill="#f8f9fa" rx="1"/>
        <rect x="${w/2 - 8}" y="${h/2 + 2}" width="16" height="4" fill="#f8f9fa" rx="2"/>
        <text x="${w/2}" y="${h/2 + 50}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#6c757d">
          ${w} × ${h}
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })

  } catch (error) {
    console.error('Ошибка генерации placeholder:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 