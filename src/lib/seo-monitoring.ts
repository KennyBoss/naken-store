// Система мониторинга SEO позиций для NAKEN Store

interface SEOMetrics {
  keyword: string
  position: number
  url: string
  searchVolume: number
  difficulty: number
  ctr: number
  date: Date
}

interface CompetitorData {
  domain: string
  keyword: string
  position: number
  title: string
  description: string
}

// Ключевые запросы для отслеживания
export const TARGET_KEYWORDS = {
  // Брендовые запросы (должны быть в топ-3)
  brand: [
    'NAKEN Store',
    'нейкен стор',
    'naken магазин одежды',
    'naken интернет магазин'
  ],
  
  // Категорийные запросы (цель топ-10)
  category: [
    'одежда в стиле old money',
    'аристократическая одежда',
    'элегантная одежда купить',
    'классическая одежда интернет',
    'стильная одежда премиум',
    'дизайнерская одежда россия'
  ],
  
  // Товарные запросы (цель топ-20)
  product: [
    'футболка old money',
    'худи классический стиль',
    'рубашка аристократическая',
    'брюки элегантные мужские',
    'платье в стиле old money',
    'свитер кашемировый'
  ],
  
  // Коммерческие запросы (высокая конверсия)
  commercial: [
    'купить одежду old money',
    'заказать стильную одежду',
    'одежда с доставкой москва',
    'интернет магазин одежды скидки',
    'качественная одежда недорого',
    'модная одежда 2025'
  ],
  
  // Long-tail запросы (низкая конкуренция)
  longTail: [
    'где купить одежду old money в москве',
    'футболка бежевая мужская размер M',
    'худи черный с капюшоном доставка',
    'одежда в стиле старых денег интернет',
    'аристократический стиль одежды купить'
  ]
}

// Конкуренты для анализа
export const COMPETITORS = [
  'zara.com',
  'hm.com',
  'befree.ru',
  'lamoda.ru',
  'wildberries.ru',
  'ozon.ru',
  'reserved.com',
  'pullbear.com'
]

// Функция проверки позиций (имитация API)
export async function checkSEOPositions(keywords: string[]): Promise<SEOMetrics[]> {
  const results: SEOMetrics[] = []
  
  for (const keyword of keywords) {
    // В реальности здесь будет API вызов к Serpstat, Ahrefs или SemRush
    const mockPosition = Math.floor(Math.random() * 100) + 1
    const mockVolume = getSearchVolume(keyword)
    
    results.push({
      keyword,
      position: mockPosition,
      url: `https://naken.store${getRelevantUrl(keyword)}`,
      searchVolume: mockVolume,
      difficulty: calculateKeywordDifficulty(keyword),
      ctr: calculateCTR(mockPosition),
      date: new Date()
    })
  }
  
  return results
}

// Определение объема поиска по ключевому слову
function getSearchVolume(keyword: string): number {
  const volumeMap: Record<string, number> = {
    'одежда интернет магазин': 45000,
    'купить одежду онлайн': 38000,
    'мужская одежда': 89000,
    'женская одежда': 125000,
    'одежда в стиле old money': 5200,
    'стильная одежда купить': 8900,
    'NAKEN Store': 850,
    'футболка old money': 1200
  }
  
  return volumeMap[keyword] || Math.floor(Math.random() * 10000) + 100
}

// Расчет сложности ключевого слова
function calculateKeywordDifficulty(keyword: string): number {
  if (keyword.includes('NAKEN') || keyword.includes('нейкен')) return 15 // Брендовые - легкие
  if (keyword.length > 40) return 25 // Long-tail - средние
  if (keyword.includes('купить') || keyword.includes('заказать')) return 65 // Коммерческие - сложные
  return 45 // Обычные
}

// Расчет CTR в зависимости от позиции
function calculateCTR(position: number): number {
  const ctrMap: Record<number, number> = {
    1: 28.5, 2: 15.7, 3: 11.0, 4: 8.0, 5: 7.2,
    6: 5.1, 7: 4.0, 8: 3.2, 9: 2.8, 10: 2.5
  }
  
  if (position <= 10) return ctrMap[position] || 2.0
  if (position <= 20) return 1.5
  if (position <= 50) return 0.8
  return 0.3
}

// Определение релевантной страницы для ключевого слова
function getRelevantUrl(keyword: string): string {
  if (keyword.includes('NAKEN') || keyword.includes('нейкен')) return '/'
  if (keyword.includes('футболка')) return '/catalog?category=футболки'
  if (keyword.includes('худи')) return '/catalog?category=худи'
  if (keyword.includes('old money')) return '/catalog?style=old-money'
  if (keyword.includes('каталог') || keyword.includes('купить')) return '/catalog'
  return '/'
}

// Анализ конкурентов
export async function analyzeCompetitors(keyword: string): Promise<CompetitorData[]> {
  const results: CompetitorData[] = []
  
  for (const domain of COMPETITORS.slice(0, 5)) {
    // Имитация парсинга SERP
    results.push({
      domain,
      keyword,
      position: Math.floor(Math.random() * 20) + 1,
      title: generateCompetitorTitle(domain, keyword),
      description: generateCompetitorDescription(domain, keyword)
    })
  }
  
  return results.sort((a, b) => a.position - b.position)
}

function generateCompetitorTitle(domain: string, keyword: string): string {
  const brand = domain.split('.')[0].toUpperCase()
  return `${keyword} | ${brand} - Интернет-магазин`
}

function generateCompetitorDescription(domain: string, keyword: string): string {
  const brand = domain.split('.')[0].toUpperCase()
  return `${keyword} в ${brand}. Широкий выбор, доставка по России, скидки до 70%.`
}

// Генерация SEO отчета
export async function generateSEOReport(): Promise<{
  summary: any,
  topKeywords: SEOMetrics[],
  improvementOpportunities: string[],
  competitorAnalysis: any
}> {
  const allKeywords = [
    ...TARGET_KEYWORDS.brand,
    ...TARGET_KEYWORDS.category,
    ...TARGET_KEYWORDS.product,
    ...TARGET_KEYWORDS.commercial
  ]
  
  const positions = await checkSEOPositions(allKeywords)
  
  const topKeywords = positions
    .filter(p => p.position <= 10)
    .sort((a, b) => a.position - b.position)
  
  const summary = {
    totalKeywords: positions.length,
    top3: positions.filter(p => p.position <= 3).length,
    top10: positions.filter(p => p.position <= 10).length,
    top20: positions.filter(p => p.position <= 20).length,
    avgPosition: Math.round(positions.reduce((sum, p) => sum + p.position, 0) / positions.length),
    estimatedTraffic: positions.reduce((sum, p) => sum + (p.searchVolume * p.ctr / 100), 0),
    totalVolume: positions.reduce((sum, p) => sum + p.searchVolume, 0)
  }
  
  const improvementOpportunities = generateImprovements(positions)
  
  return {
    summary,
    topKeywords,
    improvementOpportunities,
    competitorAnalysis: await analyzeTopCompetitors()
  }
}

// Генерация рекомендаций по улучшению
function generateImprovements(positions: SEOMetrics[]): string[] {
  const improvements: string[] = []
  
  const weakPositions = positions.filter(p => p.position > 20 && p.searchVolume > 1000)
  if (weakPositions.length > 0) {
    improvements.push(`🔧 Доработать ${weakPositions.length} ключевых слов с позиций 20+`)
  }
  
  const highVolumeOutside = positions.filter(p => p.position > 10 && p.searchVolume > 5000)
  if (highVolumeOutside.length > 0) {
    improvements.push(`📈 Поднять в топ-10: "${highVolumeOutside[0].keyword}" (${highVolumeOutside[0].searchVolume}/мес)`)
  }
  
  const brandingIssues = positions.filter(p => 
    p.keyword.includes('NAKEN') && p.position > 3
  )
  if (brandingIssues.length > 0) {
    improvements.push(`🏷️ Улучшить брендовые запросы - некоторые не в топ-3`)
  }
  
  improvements.push(`💰 Потенциал трафика: +${Math.round(positions.reduce((sum, p) => sum + p.searchVolume * 0.1, 0))} посетителей/мес`)
  
  return improvements
}

// Анализ топ конкурентов
async function analyzeTopCompetitors() {
  const topKeyword = 'одежда интернет магазин'
  const competitors = await analyzeCompetitors(topKeyword)
  
  return {
    topCompetitor: competitors[0],
    ourPosition: Math.floor(Math.random() * 30) + 15, // Текущая позиция NAKEN
    gapAnalysis: competitors.slice(0, 3).map(c => ({
      domain: c.domain,
      advantage: `Позиция ${c.position}, оптимизированный title`
    }))
  }
}

// Трекинг изменений позиций
export class SEOTracker {
  private history: SEOMetrics[] = []
  
  async trackKeywords(keywords: string[]): Promise<void> {
    const newPositions = await checkSEOPositions(keywords)
    this.history.push(...newPositions)
  }
  
  getMovement(keyword: string, days: number = 7): {
    current: number,
    previous: number,
    change: number,
    trend: 'up' | 'down' | 'stable'
  } {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    const recent = this.history
      .filter(h => h.keyword === keyword && h.date >= weekAgo)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
    
    if (recent.length < 2) {
      return { current: 0, previous: 0, change: 0, trend: 'stable' }
    }
    
    const current = recent[0].position
    const previous = recent[recent.length - 1].position
    const change = previous - current // Положительное = улучшение
    
    return {
      current,
      previous,
      change,
      trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable'
    }
  }
  
  getTopMovers(limit: number = 5): Array<{
    keyword: string,
    change: number,
    current: number
  }> {
    const movements = TARGET_KEYWORDS.category.map(keyword => ({
      keyword,
      ...this.getMovement(keyword)
    }))
    
    return movements
      .sort((a, b) => b.change - a.change)
      .slice(0, limit)
      .map(m => ({
        keyword: m.keyword,
        change: m.change,
        current: m.current
      }))
  }
}

// Автоматические алерты
export class SEOAlerts {
  static async checkAlerts(): Promise<string[]> {
    const alerts: string[] = []
    const positions = await checkSEOPositions(TARGET_KEYWORDS.brand)
    
    // Алерт на падение брендовых запросов
    const brandIssues = positions.filter(p => p.position > 5)
    if (brandIssues.length > 0) {
      alerts.push(`🚨 Брендовый запрос "${brandIssues[0].keyword}" упал на позицию ${brandIssues[0].position}`)
    }
    
    // Алерт на появление в топ-10
    const newTopResults = positions.filter(p => p.position <= 10)
    if (newTopResults.length > 0) {
      alerts.push(`🎉 Вошли в топ-10 по "${newTopResults[0].keyword}" - позиция ${newTopResults[0].position}`)
    }
    
    return alerts
  }
  
  static async sendDailyReport(): Promise<void> {
    const report = await generateSEOReport()
    
    console.log(`
📊 ЕЖЕДНЕВНЫЙ SEO ОТЧЕТ NAKEN STORE

📈 ОСНОВНЫЕ МЕТРИКИ:
- Всего ключевых слов: ${report.summary.totalKeywords}
- В топ-3: ${report.summary.top3}
- В топ-10: ${report.summary.top10}
- Средняя позиция: ${report.summary.avgPosition}
- Оценочный трафик: ${Math.round(report.summary.estimatedTraffic)} посетителей/мес

🏆 ЛУЧШИЕ ПОЗИЦИИ:
${report.topKeywords.slice(0, 5).map(k => 
  `- "${k.keyword}" - позиция ${k.position}`
).join('\n')}

💡 РЕКОМЕНДАЦИИ:
${report.improvementOpportunities.slice(0, 3).map(i => `- ${i}`).join('\n')}
    `)
  }
}

// Экспорт для использования
export const seoMonitoring = {
  checkPositions: checkSEOPositions,
  analyzeCompetitors,
  generateReport: generateSEOReport,
  TARGET_KEYWORDS,
  SEOTracker,
  SEOAlerts
}

export default seoMonitoring 