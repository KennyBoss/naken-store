'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { 
  Package, 
  Search, 
  Filter, 
  Eye,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
  User,
  Phone,
  MapPin,
  Trash2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Bell,
  Download,
  Plus,
  Minus,
  AlertCircle,
  CreditCard,
  X,
  Star,
  Users,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface OrderWithDetails {
  id: string
  orderNumber: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  total: number
  createdAt: string
  updatedAt: string
  
  // Добавляем поля для статуса платежа
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED'
  paymentMethod?: string | null
  paymentId?: string | null
  paymentData?: string | null
  
  user: {
    name: string | null
    email: string | null
    phone: string | null
  } | null
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
      sku: string
    }
  }>
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
    phone: string | null
  } | null
  comment: string | null
}

interface OrderStats {
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
}

const statusConfig = {
  PENDING: { label: 'Ожидает', color: 'from-amber-400 to-yellow-500', textColor: 'text-amber-900', bgColor: 'bg-amber-50', icon: Clock },
  PROCESSING: { label: 'Обрабатывается', color: 'from-orange-400 to-red-500', textColor: 'text-orange-900', bgColor: 'bg-orange-50', icon: Package },
  SHIPPED: { label: 'Отправлен', color: 'from-purple-400 to-pink-500', textColor: 'text-purple-900', bgColor: 'bg-purple-50', icon: Truck },
  DELIVERED: { label: 'Доставлен', color: 'from-emerald-400 to-teal-500', textColor: 'text-emerald-900', bgColor: 'bg-emerald-50', icon: CheckCircle },
  CANCELLED: { label: 'Отменен', color: 'from-gray-400 to-slate-500', textColor: 'text-gray-900', bgColor: 'bg-gray-50', icon: XCircle }
}

// Конфигурация для статуса платежа в стиле проекта
const paymentStatusConfig = {
  PENDING: { label: 'Ожидает оплаты', color: 'from-slate-300 to-gray-400', textColor: 'text-slate-800', bgColor: 'bg-slate-50', icon: Clock },
  PAID: { label: 'Оплачен', color: 'from-emerald-400 to-teal-500', textColor: 'text-emerald-900', bgColor: 'bg-emerald-50', icon: CheckCircle },
  FAILED: { label: 'Ошибка оплаты', color: 'from-red-400 to-rose-500', textColor: 'text-red-900', bgColor: 'bg-red-50', icon: XCircle },
  CANCELLED: { label: 'Отменен', color: 'from-gray-400 to-slate-500', textColor: 'text-gray-900', bgColor: 'bg-gray-50', icon: X },
  EXPIRED: { label: 'Истекло время', color: 'from-orange-400 to-amber-500', textColor: 'text-orange-900', bgColor: 'bg-orange-50', icon: AlertCircle }
}

// Функция для определения статуса платежа из comment
const getPaymentStatusFromComment = (comment: string | null): 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' => {
  if (!comment) return 'PENDING'
  
  if (comment.includes('T-Bank: CONFIRMED') || comment.includes('T-Bank: AUTHORIZED')) {
    return 'PAID'
  }
  if (comment.includes('T-Bank: REJECTED')) {
    return 'FAILED'
  }
  if (comment.includes('T-Bank: CANCELED')) {
    return 'CANCELLED'
  }
  if (comment.includes('T-Bank: DEADLINE_EXPIRED')) {
    return 'EXPIRED'
  }
  
  return 'PENDING'
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { success, error, info } = useToast()
  
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderWithDetails | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Автообновление каждые 30 секунд
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadOrders(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/orders')
      return
    }
    
    if (session?.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    loadOrders()
  }, [status, session, router])

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setRefreshing(true)
    
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        const newOrders = data.orders || []
        
        // Проверяем новые заказы
        if (orders.length > 0 && newOrders.length > orders.length) {
          const newCount = newOrders.length - orders.length
          setNewOrdersCount(newCount)
          info(`🔔 ${newCount} новых заказов!`)
        }
        
        setOrders(newOrders)
        calculateStats(newOrders)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [orders.length, info])

  const calculateStats = (orderList: OrderWithDetails[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayOrders = orderList.filter(order => 
      new Date(order.createdAt) >= today
    )
    
    const stats: OrderStats = {
      total: orderList.length,
      pending: orderList.filter(o => o.status === 'PENDING').length,
      processing: orderList.filter(o => o.status === 'PROCESSING').length,
      shipped: orderList.filter(o => o.status === 'SHIPPED').length,
      delivered: orderList.filter(o => o.status === 'DELIVERED').length,
      cancelled: orderList.filter(o => o.status === 'CANCELLED').length,
      totalRevenue: orderList.reduce((sum, o) => o.status !== 'CANCELLED' ? sum + o.total : sum, 0),
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, o) => o.status !== 'CANCELLED' ? sum + o.total : sum, 0)
    }
    
    setStats(stats)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        success('Статус заказа обновлен')
        loadOrders(true)
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any })
        }
      } else {
        error('Ошибка обновления статуса')
      }
    } catch (err) {
      error('Ошибка обновления статуса')
    }
  }

  const deleteOrder = async (orderId: string) => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        success('Заказ успешно удален')
        loadOrders(true)
        setShowDeleteConfirm(false)
        setOrderToDelete(null)
        if (selectedOrder?.id === orderId) {
          setShowOrderDetail(false)
          setSelectedOrder(null)
        }
      } else {
        const data = await response.json()
        error(data.error || 'Ошибка удаления заказа')
      }
    } catch (err) {
      error('Ошибка удаления заказа')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteClick = (order: OrderWithDetails) => {
    setOrderToDelete(order)
    setShowDeleteConfirm(true)
  }

  const exportOrders = () => {
    const csv = [
      ['Номер заказа', 'Покупатель', 'Телефон', 'Email', 'Сумма', 'Статус', 'Дата'].join(','),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.user?.name || '',
        order.user?.phone || '',
        order.user?.email || '',
        order.total,
        statusConfig[order.status].label,
        new Date(order.createdAt).toLocaleDateString('ru-RU')
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.user?.phone?.includes(searchQuery)
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt)
      const today = new Date()
      
      switch (dateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === today.toDateString()
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = orderDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = orderDate >= monthAgo
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-teal-500 to-cyan-500"></div>
            <div className="text-lg text-gray-700 font-light">Загружаем админ-панель...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navbar */}
      <div className="backdrop-blur-md bg-white/95 border-b border-white/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-light">Админ-панель</span>
              </Link>
              <div className="text-xl font-light text-gray-800">Заказы</div>
              {newOrdersCount > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  +{newOrdersCount} новых
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  autoRefresh 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg' 
                    : 'bg-white/60 text-gray-600 hover:bg-white/80'
                }`}
                title={autoRefresh ? 'Автообновление включено' : 'Автообновление выключено'}
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => loadOrders(false)}
                disabled={refreshing}
                className="bg-white/60 hover:bg-white/80 text-gray-700 px-4 py-2 rounded-lg font-light transition-all duration-300 disabled:opacity-50"
              >
                {refreshing ? 'Обновляем...' : 'Обновить'}
              </button>
              
              <button
                onClick={exportOrders}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-light hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-4 hover:bg-white/80 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-light text-gray-800">{stats.total}</div>
                <div className="text-sm text-gray-600">Всего заказов</div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-4 hover:bg-white/80 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-light text-gray-800">{formatPrice(stats.totalRevenue)}</div>
                <div className="text-sm text-gray-600">Выручка</div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-4 hover:bg-white/80 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-light text-gray-800">{stats.todayOrders}</div>
                <div className="text-sm text-gray-600">Сегодня</div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-4 hover:bg-white/80 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-light text-gray-800">{formatPrice(stats.todayRevenue)}</div>
                <div className="text-sm text-gray-600">Сегодня ₽</div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-4 hover:bg-white/80 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-light text-gray-800">{stats.pending}</div>
                <div className="text-sm text-gray-600">В ожидании</div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-4 hover:bg-white/80 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-light text-gray-800">{stats.shipped}</div>
                <div className="text-sm text-gray-600">В пути</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по номеру, имени, телефону..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/80 border border-white/50 rounded-lg text-sm font-light focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/80 border border-white/50 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
            >
              <option value="all">Все статусы</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label} ({orders.filter(o => o.status === key).length})
                </option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white/80 border border-white/50 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
            >
              <option value="all">Все периоды</option>
              <option value="today">Сегодня</option>
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
            </select>
          </div>

          {/* Quick status filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-light transition-all duration-300 ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                  : 'bg-white/80 text-gray-600 hover:bg-white/90'
              }`}
            >
              Все ({stats.total})
            </button>
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = orders.filter(o => o.status === key).length
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1 rounded-full text-sm font-light transition-all duration-300 ${
                    statusFilter === key
                      ? `bg-gradient-to-r ${config.color} text-white shadow-md`
                      : 'bg-white/80 text-gray-600 hover:bg-white/90'
                  }`}
                >
                  {config.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50/80 to-white/80 border-b border-white/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Заказ</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Покупатель</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Статус</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Статус платежа</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Сумма</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Дата</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/30">
                {filteredOrders.map((order) => {
                  // Определяем статус платежа
                  const paymentStatus = order.paymentStatus || getPaymentStatusFromComment(order.comment)
                  const paymentConfig = paymentStatusConfig[paymentStatus]
                  const PaymentIcon = paymentConfig.icon

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-white/60 transition-all duration-300 group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm">{order.orderNumber}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleString('ru-RU')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {order.user?.name || 'Не указано'}
                            </div>
                            <div className="text-xs text-gray-600">
                              {order.user?.phone || order.user?.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${statusConfig[order.status].color} text-white shadow-sm`}>
                          {React.createElement(statusConfig[order.status].icon, { className: 'h-3 w-3' })}
                          {statusConfig[order.status].label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${paymentConfig.color} text-white shadow-sm`}>
                          <PaymentIcon className="h-3 w-3" />
                          {paymentConfig.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{formatPrice(order.total)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderDetail(true)
                            }}
                            className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-all duration-200"
                            title="Просмотр"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(order)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-light text-gray-600 mb-2">Заказы не найдены</div>
              <div className="text-sm text-gray-500">Попробуйте изменить фильтры или поисковый запрос</div>
            </div>
          )}
        </div>

        {/* Auto-refresh info */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500 font-light">
            {autoRefresh && (
              <>Автообновление включено • </>
            )}
            Последнее обновление: {lastRefresh.toLocaleTimeString('ru-RU')}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-md bg-white/95 border border-white/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-white/80 to-gray-50/80 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-light text-gray-800">
                    Заказ #{selectedOrder.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-600 font-light mt-1">
                    Создан: {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderDetail(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Info */}
                <div className="space-y-6">
                  <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-light text-gray-800 mb-4 flex items-center gap-3">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      Покупатель
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-white/30">
                        <span className="text-sm text-gray-600 font-light">Имя:</span>
                        <span className="text-sm font-medium text-gray-800">{selectedOrder.user?.name || 'Не указано'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/30">
                        <span className="text-sm text-gray-600 font-light">Телефон:</span>
                        <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {selectedOrder.user?.phone || 'Не указан'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600 font-light">Email:</span>
                        <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {selectedOrder.user?.email || 'Не указан'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-light text-gray-800 mb-4 flex items-center gap-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      Платеж
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const paymentStatus = selectedOrder.paymentStatus || getPaymentStatusFromComment(selectedOrder.comment)
                        const paymentConfig = paymentStatusConfig[paymentStatus]
                        const PaymentIcon = paymentConfig.icon
                        
                        return (
                          <>
                            <div className="flex justify-between items-center py-2 border-b border-white/30">
                              <span className="text-sm text-gray-600 font-light">Статус:</span>
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${paymentConfig.color} text-white shadow-sm`}>
                                <PaymentIcon className="h-3 w-3" />
                                {paymentConfig.label}
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/30">
                              <span className="text-sm text-gray-600 font-light">Способ:</span>
                              <span className="text-sm font-medium text-gray-800">
                                {selectedOrder.paymentMethod === 'tbank' ? 'T-Bank' : 
                                 selectedOrder.paymentMethod || 'Не указан'}
                              </span>
                            </div>
                            {selectedOrder.paymentId && (
                              <div className="flex justify-between items-center py-2 border-b border-white/30">
                                <span className="text-sm text-gray-600 font-light">ID платежа:</span>
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                                  {selectedOrder.paymentId}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm text-gray-600 font-light">Сумма:</span>
                              <span className="text-lg font-light text-gray-800">{formatPrice(selectedOrder.total)}</span>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                  
                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress ? (
                    <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-light text-gray-800 mb-4 flex items-center gap-3">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        Доставка
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/30">
                          <span className="text-sm text-gray-600 font-light">Получатель:</span>
                          <span className="text-sm font-medium text-gray-800">{selectedOrder.shippingAddress.name}</span>
                        </div>
                        <div className="py-2 border-b border-white/30">
                          <span className="text-sm text-gray-600 font-light block mb-1">Адрес:</span>
                          <span className="text-sm font-medium text-gray-800">{selectedOrder.shippingAddress.street}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/30">
                          <span className="text-sm text-gray-600 font-light">Город:</span>
                          <span className="text-sm font-medium text-gray-800">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/30">
                          <span className="text-sm text-gray-600 font-light">Индекс:</span>
                          <span className="text-sm font-medium text-gray-800">{selectedOrder.shippingAddress.zipCode}</span>
                        </div>
                        {selectedOrder.shippingAddress.phone && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-600 font-light">Телефон:</span>
                            <span className="text-sm font-medium text-gray-800">{selectedOrder.shippingAddress.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    selectedOrder.comment && (
                      <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-light text-gray-800 mb-4 flex items-center gap-3">
                          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-white" />
                          </div>
                          Комментарий
                        </h3>
                        <div className="bg-gray-50/50 rounded-lg p-4">
                          <p className="text-sm font-light text-gray-700 whitespace-pre-line">{selectedOrder.comment}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
                
                {/* Order Items */}
                <div>
                  <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-light text-gray-800 mb-4 flex items-center gap-3">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      Товары ({selectedOrder.items.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="bg-white/80 border border-white/50 rounded-lg p-4 hover:bg-white/90 transition-all duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 mb-1">{item.product.name}</h4>
                              <p className="text-xs text-gray-500 font-light">SKU: {item.product.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-light text-lg text-gray-800">{formatPrice(item.price)}</p>
                              <p className="text-xs text-gray-500 font-light">× {item.quantity}</p>
                              <p className="text-sm font-medium text-teal-600 mt-1">
                                = {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Summary */}
                    <div className="mt-6 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-lg p-4 border border-white/50">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 font-light">
                          <span>Количество товаров:</span>
                          <span>{selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} шт.</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 font-light">
                          <span>Стоимость товаров:</span>
                          <span>{formatPrice(selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                        </div>
                        <div className="border-t border-white/40 pt-3 mt-3">
                          <div className="flex justify-between">
                            <span className="text-lg font-light text-gray-800">Итого к оплате:</span>
                            <span className="text-xl font-medium text-teal-600">{formatPrice(selectedOrder.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-8 border-t border-white/30 pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="text-sm text-gray-500 font-light">
                    <p>Создан: {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}</p>
                    <p>Обновлен: {new Date(selectedOrder.updatedAt).toLocaleString('ru-RU')}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const StatusIcon = config.icon
                      return (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(selectedOrder.id, status)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all duration-300 hover:shadow-md ${
                            selectedOrder.status === status 
                              ? `bg-gradient-to-r ${config.color} text-white shadow-md`
                              : 'bg-white/80 text-gray-700 hover:bg-white/90 border border-white/50'
                          }`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {config.label}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => handleDeleteClick(selectedOrder)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-md transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && orderToDelete && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-md bg-white/95 border border-white/30 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-light text-gray-800">
                    Удалить заказ?
                  </h3>
                  <p className="text-sm text-gray-600 font-light">
                    #{orderToDelete.orderNumber}
                  </p>
                </div>
              </div>
              
              <div className="backdrop-blur-sm bg-red-50/80 border border-red-200/50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800 mb-2">Внимание!</p>
                    <p className="text-red-700 font-light mb-3">
                      Это действие нельзя отменить. Будут удалены:
                    </p>
                    <ul className="space-y-1 text-red-700 font-light">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        Информация о заказе
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        Данные о товарах
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        Адрес доставки
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setOrderToDelete(null)
                  }}
                  className="flex-1 px-4 py-2 bg-white/80 border border-white/50 rounded-lg text-gray-700 hover:bg-white/90 font-light transition-all duration-200"
                  disabled={deleting}
                >
                  Отмена
                </button>
                <button
                  onClick={() => orderToDelete && deleteOrder(orderToDelete.id)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg font-light disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Удаление...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Удалить</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 