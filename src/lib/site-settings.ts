import { prisma } from './db'

export interface SiteSetting {
  key: string
  value: string
  type: string
  category: string
  description?: string
}

export interface SiteSettingsData {
  site_title: string
  site_description: string
  site_logo: string
  site_keywords: string
  site_author: string
}

// Настройки по умолчанию
const DEFAULT_SETTINGS: Record<string, SiteSetting> = {
  site_title: {
    key: 'site_title',
    value: 'NAKEN Store - Стильная одежда для легендарных людей',
    type: 'text',
    category: 'seo',
    description: 'Основной заголовок сайта'
  },
  site_description: {
    key: 'site_description',
    value: 'Интернет-магазин стильной одежды NAKEN. Мужская и женская одежда высокого качества ✅ Бесплатная доставка от 3000₽ ✅ Скидки до 50% ✅ Примерка при получении ✅ Возврат 14 дней',
    type: 'textarea',
    category: 'seo',
    description: 'Описание сайта для поисковых систем'
  },
  site_logo: {
    key: 'site_logo',
    value: '/images/logo.png',
    type: 'image',
    category: 'branding',
    description: 'Логотип сайта'
  },
  site_keywords: {
    key: 'site_keywords',
    value: 'одежда интернет магазин, NAKEN Store, мужская одежда, женская одежда, стильная одежда',
    type: 'text',
    category: 'seo',
    description: 'Ключевые слова для SEO'
  },
  site_author: {
    key: 'site_author',
    value: 'NAKEN Store',
    type: 'text',
    category: 'general',
    description: 'Автор сайта'
  }
}

// Получить все настройки сайта
export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const defaultData: SiteSettingsData = {
      site_title: DEFAULT_SETTINGS.site_title.value,
      site_description: DEFAULT_SETTINGS.site_description.value,
      site_logo: DEFAULT_SETTINGS.site_logo.value,
      site_keywords: DEFAULT_SETTINGS.site_keywords.value,
      site_author: DEFAULT_SETTINGS.site_author.value
    }

    // @ts-ignore - временно игнорируем ошибку типов после миграции
    const settings = await prisma.siteSettings.findMany()
    
    if (settings.length === 0) {
      // Создаем дефолтные настройки
      await initializeDefaultSettings()
      return defaultData
    }

    const settingsObject = settings.reduce((acc: SiteSettingsData, setting: any) => {
      acc[setting.key as keyof SiteSettingsData] = setting.value
      return acc
    }, {} as SiteSettingsData)

    // Заполняем отсутствующие настройки дефолтными значениями
    return {
      ...defaultData,
      ...settingsObject
    }
  } catch (error) {
    console.error('Ошибка получения настроек сайта:', error)
    return {
      site_title: DEFAULT_SETTINGS.site_title.value,
      site_description: DEFAULT_SETTINGS.site_description.value,
      site_logo: DEFAULT_SETTINGS.site_logo.value,
      site_keywords: DEFAULT_SETTINGS.site_keywords.value,
      site_author: DEFAULT_SETTINGS.site_author.value
    }
  }
}

// Получить конкретную настройку
export async function getSiteSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    // @ts-ignore - временно игнорируем ошибку типов после миграции
    const setting = await prisma.siteSettings.findUnique({
      where: { key }
    })
    
    return setting?.value || DEFAULT_SETTINGS[key]?.value || defaultValue
  } catch (error) {
    console.error(`Ошибка получения настройки ${key}:`, error)
    return DEFAULT_SETTINGS[key]?.value || defaultValue
  }
}

// Инициализация дефолтных настроек
export async function initializeDefaultSettings(): Promise<void> {
  try {
    const promises = Object.values(DEFAULT_SETTINGS).map(setting =>
      // @ts-ignore - временно игнорируем ошибку типов после миграции
      prisma.siteSettings.upsert({
        where: { key: setting.key },
        update: {},
        create: setting
      })
    )
    
    await Promise.all(promises)
    console.log('Дефолтные настройки сайта инициализированы')
  } catch (error) {
    console.error('Ошибка инициализации настроек:', error)
  }
}

export { DEFAULT_SETTINGS } 