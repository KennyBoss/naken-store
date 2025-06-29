import { NextResponse } from 'next/server';
import { readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Определяем возможные пути uploads
    const possiblePaths = [
      process.env.UPLOADS_PATH,
      '/root/naken-store/public/uploads',
      join(process.cwd(), 'public', 'uploads'),
      join(process.cwd(), '..', 'public', 'uploads'),
    ].filter(Boolean) as string[];
    
    const diagnostics = {
      environment: process.env.NODE_ENV,
      cwd: process.cwd(),
      uploadsPath: process.env.UPLOADS_PATH,
      pathsChecked: [] as any[],
      foundPath: null as string | null,
      files: [] as string[],
      totalFiles: 0,
    };
    
    // Проверяем каждый путь
    for (const path of possiblePaths) {
      const exists = existsSync(path);
      const pathInfo = {
        path,
        exists,
        files: 0,
        sampleFiles: [] as string[]
      };
      
      if (exists) {
        try {
          const files = readdirSync(path);
          pathInfo.files = files.length;
          pathInfo.sampleFiles = files.slice(0, 5); // первые 5 файлов
          
          if (!diagnostics.foundPath) {
            diagnostics.foundPath = path;
            diagnostics.files = files;
            diagnostics.totalFiles = files.length;
          }
        } catch (error) {
          pathInfo.sampleFiles = [`Error reading: ${error}`];
        }
      }
      
      diagnostics.pathsChecked.push(pathInfo);
    }
    
    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Diagnostic failed', 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 