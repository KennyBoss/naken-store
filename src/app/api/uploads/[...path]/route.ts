import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

// Простое определение MIME типов для основных форматов изображений
const getMimeType = (filePath: string): string => {
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    
    // Определяем базовый путь для uploads
    let uploadsBasePath: string;
    
    if (process.env.NODE_ENV === 'production') {
      // В production проверяем несколько возможных путей
      const possiblePaths = [
        process.env.UPLOADS_PATH,
        '/root/naken-store/public/uploads',
        join(process.cwd(), 'public', 'uploads'),
        join(process.cwd(), '..', 'public', 'uploads'), // для standalone
      ].filter(Boolean) as string[];
      
      uploadsBasePath = possiblePaths.find(path => existsSync(path)) || possiblePaths[0];
    } else {
      uploadsBasePath = join(process.cwd(), 'public', 'uploads');
    }
    
    const filePath = join(uploadsBasePath, ...params.path);
    
    console.log(`🔍 Поиск файла: ${filePath}`);
    console.log(`📁 База uploads: ${uploadsBasePath}`);
    
    // Проверяем существование файла
    if (!existsSync(filePath)) {
      console.log(`❌ Файл не найден: ${filePath}`);
      return new NextResponse('File not found', { status: 404 });
    }

    // Читаем файл
    const fileBuffer = readFileSync(filePath);
    
    // Определяем MIME тип
    const mimeType = getMimeType(filePath);
    
    console.log(`✅ Файл загружен успешно: ${filePath} (${mimeType})`);
    
    // Возвращаем файл с правильными заголовками
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Ошибка при обслуживании файла:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 