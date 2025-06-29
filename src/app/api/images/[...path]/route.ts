import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const imagePath = pathSegments.join('/')
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    
    // Проверяем безопасность пути
    if (!fullPath.startsWith(path.join(process.cwd(), 'public'))) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // Читаем файл
    const imageBuffer = await readFile(fullPath)
    
    // Определяем MIME тип
    const ext = path.extname(fullPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    }
    
    const contentType = mimeTypes[ext] || 'application/octet-stream'
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Image API error:', error)
    return new NextResponse('Not Found', { status: 404 })
  }
} 