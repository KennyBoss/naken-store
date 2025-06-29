'use client'

import { useState, useEffect } from 'react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  Users, TrendingUp, ShoppingCart, Activity,
  Calendar, Phone, Mail, DollarSign
} from 'lucide-react'

interface AnalyticsData {
  period: {
    start: string
    end: string
    days: number
  }
  summary: {
    totalUsers: number
    newUsers: number
    totalOrders: number
    totalRevenue: number
  }
  registrations: Array<{
    date: string
    registrations: number
    label: string
  }>
  authConversion: Array<{
    type: string
    total: number
    success: number
    conversion: number
  }>
  userActivity: Array<{
    userId: string
    activities: number
    contact: string
    name: string
  }>
  salesByUser: Array<{
    userId: string
    totalSales: number
    orderCount: number
    contact: string
    name: string
  }>
}

const COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('7')

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?range=${range}`)
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

  useEffect(() => {
    fetchAnalytics()
  }, [range])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Ошибка загрузки данных</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-gray-600">
            Период: {data.period.start} - {data.period.end}
          </p>
        </div>
        
        {/* Фильтр периода */}
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

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего пользователей</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalUsers}</p>
              <p className="text-sm text-green-600">+{data.summary.newUsers} новых</p>
            </div>
            <Users className="w-8 h-8 text-teal-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Заказы</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalOrders}</p>
              <p className="text-sm text-gray-500">за период</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Выручка</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.totalRevenue.toLocaleString('ru-RU')} ₽
              </p>
              <p className="text-sm text-gray-500">за период</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Средний чек</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.totalOrders > 0 
                  ? Math.round(data.summary.totalRevenue / data.summary.totalOrders).toLocaleString('ru-RU')
                  : 0
                } ₽
              </p>
              <p className="text-sm text-gray-500">на заказ</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 📊 1. Регистрации по дням */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            Регистрации по дням
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.registrations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="registrations" 
                stroke="#14b8a6" 
                strokeWidth={2}
                dot={{ fill: '#14b8a6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 📊 2. Конверсия авторизации */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Конверсия авторизации
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.authConversion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'conversion' ? `${value}%` : value,
                  name === 'total' ? 'Всего попыток' : 
                  name === 'success' ? 'Успешных' : 'Конверсия'
                ]}
              />
              <Bar dataKey="total" fill="#e5e7eb" name="total" />
              <Bar dataKey="success" fill="#14b8a6" name="success" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.authConversion.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  {item.type === 'SMS' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  {item.type}
                </span>
                <span className="font-medium">{item.conversion}% конверсия</span>
              </div>
            ))}
          </div>
        </div>

        {/* 📊 3. Активность пользователей */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Топ активных пользователей
          </h3>
          <div className="space-y-3">
            {data.userActivity.slice(0, 8).map((user, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.contact}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{user.activities}</p>
                  <p className="text-xs text-gray-500">действий</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 📊 4. Продажи по пользователям */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Топ покупатели
          </h3>
          <div className="space-y-3">
            {data.salesByUser.slice(0, 8).map((user, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.contact}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {user.totalSales.toLocaleString('ru-RU')} ₽
                  </p>
                  <p className="text-xs text-gray-500">{user.orderCount} заказов</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Дополнительная статистика */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Сводка по авторизации</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.authConversion.map((item, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-2">
                {item.type === 'SMS' ? 
                  <Phone className="w-6 h-6 text-blue-500" /> : 
                  <Mail className="w-6 h-6 text-green-500" />
                }
              </div>
              <p className="text-sm text-gray-600">{item.type} авторизация</p>
              <p className="text-xl font-bold text-gray-900">{item.conversion}%</p>
              <p className="text-xs text-gray-500">
                {item.success} из {item.total} попыток
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 