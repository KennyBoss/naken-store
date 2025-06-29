'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Palette, Ruler, TrendingUp, Package } from 'lucide-react'

interface SizesColorsData {
  period: { start: string; end: string; days: number }
  summary: { totalSizes: number; totalColors: number; activeSizes: number; activeColors: number }
  sizePopularity: Array<{ sizeName: string; russianSize: string; orders: number; quantity: number }>
  colorPopularity: Array<{ colorName: string; hexCode: string; orders: number; quantity: number }>
}

export default function SizesColorsAnalyticsPage() {
  const [data, setData] = useState<SizesColorsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30')

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/analytics/sizes-colors?range=${range}`)
        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error('Ошибка загрузки аналитики:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [range])

  if (loading) {
    return <div className="p-6"><div className="animate-pulse">Загрузка...</div></div>
  }

  if (!data) {
    return <div className="p-6"><p className="text-gray-500">Ошибка загрузки данных</p></div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Аналитика размеров и цветов</h1>
          <p className="text-gray-600">Период: {data.period.start} - {data.period.end}</p>
        </div>
        <select 
          value={range} 
          onChange={(e) => setRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="7">7 дней</option>
          <option value="14">14 дней</option>
          <option value="30">30 дней</option>
          <option value="90">90 дней</option>
        </select>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего размеров</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalSizes}</p>
              <p className="text-sm text-green-600">{data.summary.activeSizes} активных</p>
            </div>
            <Ruler className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего цветов</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalColors}</p>
              <p className="text-sm text-green-600">{data.summary.activeColors} активных</p>
            </div>
            <Palette className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Топ размер</p>
              <p className="text-xl font-bold text-gray-900">
                {data.sizePopularity[0]?.sizeName || 'Нет данных'}
              </p>
              <p className="text-sm text-gray-500">
                {data.sizePopularity[0]?.orders || 0} заказов
              </p>
            </div>
            <Package className="w-8 h-8 text-teal-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Топ цвет</p>
              <p className="text-xl font-bold text-gray-900">
                {data.colorPopularity[0]?.colorName || 'Нет данных'}
              </p>
              <p className="text-sm text-gray-500">
                {data.colorPopularity[0]?.orders || 0} заказов
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-pink-500" />
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Размеры */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярность размеров</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.sizePopularity.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sizeName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Цвета */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярность цветов</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.colorPopularity.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="colorName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Таблицы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ размеры */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ размеры</h3>
          <div className="space-y-3">
            {data.sizePopularity.slice(0, 10).map((size, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{size.sizeName}</p>
                  <p className="text-sm text-gray-600">Размер: {size.russianSize}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{size.orders}</p>
                  <p className="text-xs text-gray-500">{size.quantity} шт</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Топ цвета */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ цвета</h3>
          <div className="space-y-3">
            {data.colorPopularity.slice(0, 10).map((color, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: color.hexCode }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">{color.colorName}</p>
                    <p className="text-sm text-gray-600">{color.hexCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{color.orders}</p>
                  <p className="text-xs text-gray-500">{color.quantity} шт</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 