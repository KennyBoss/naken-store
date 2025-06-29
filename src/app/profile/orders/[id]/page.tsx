'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      images: string
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

const statusConfig = {
  PENDING: { label: 'Ожидает подтверждения', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'Обрабатывается', color: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { label: 'Отправлен', color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Доставлен', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Отменен', color: 'bg-red-100 text-red-800', icon: XCircle }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState<string | null>(null)
  
  // Распаковываем params
  useEffect(() => {
    params.then(p => setOrderId(p.id))
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && orderId) {
      loadOrder()
    }
  }, [status, orderId])

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else if (response.status === 404) {
        router.push('/profile/orders')
      }
    } catch (error) {
      console.error('Ошибка загрузки заказа:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/profile/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Назад к заказам
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Заказ #{order.orderNumber}
            </h1>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              <StatusIcon size={16} />
              {statusInfo.label}
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Дата заказа</div>
              <div className="font-medium flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Номер заказа</div>
              <div className="font-medium">#{order.orderNumber}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Сумма заказа</div>
              <div className="font-medium text-lg">{formatPrice(order.total)}</div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {(order.shippingAddress || order.comment) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Адрес доставки
            </h2>
            
            {order.shippingAddress ? (
              <div className="text-sm space-y-2">
                <div>
                  <span className="text-gray-500">Получатель:</span> {order.shippingAddress.name}
                </div>
                <div>
                  <span className="text-gray-500">Адрес:</span> {order.shippingAddress.street}
                </div>
                <div>
                  <span className="text-gray-500">Город:</span> {order.shippingAddress.city}
                  {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                </div>
                {order.shippingAddress.zipCode && (
                  <div>
                    <span className="text-gray-500">Индекс:</span> {order.shippingAddress.zipCode}
                  </div>
                )}
                {order.shippingAddress.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    {order.shippingAddress.phone}
                  </div>
                )}
              </div>
            ) : (
              order.comment && (
                <div className="text-sm whitespace-pre-line">
                  {order.comment}
                </div>
              )
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package size={20} />
            Товары в заказе
          </h2>
          
          <div className="space-y-4">
            {order.items.map((item) => {
              let images = []
              try {
                images = JSON.parse(item.product.images || '[]')
              } catch (e) {
                images = []
              }
              
              return (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {images[0] ? (
                      <img 
                        src={images[0]} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      Количество: {item.quantity} × {formatPrice(item.price)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Итого:</span>
              <span className="text-xl font-bold">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 