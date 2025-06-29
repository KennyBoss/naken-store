import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/site-settings'

export async function GET() {
  try {
    const settings = await getSiteSettings()
    
    // Возвращаем только публичные настройки
    return NextResponse.json({
      site_title: settings.site_title,
      site_logo: settings.site_logo,
      site_description: settings.site_description
    })
  } catch (error) {
    console.error('Ошибка получения настроек через API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch settings',
        site_title: 'NAKEN Store',
        site_logo: '',
        site_description: 'Интернет-магазин стильной одежды'
      }, 
      { status: 500 }
    )
  }
} 