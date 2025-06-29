'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { 
  ArrowLeft,
  Plus,
  Code,
  Activity,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'

interface TrackingPixel {
  id: string
  name: string
  type: string
  pixelId: string
  code?: string
  isActive: boolean
  placement: string
  description?: string
  createdAt: string
  updatedAt: string
}

export default function PixelsAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { success, error } = useToast()
  
  const [pixels, setPixels] = useState<TrackingPixel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPixel, setEditingPixel] = useState<TrackingPixel | null>(null)
  
  // Форма
  const [formData, setFormData] = useState({
    name: '',
    type: 'YANDEX_METRIKA',
    pixelId: '',
    code: '',
    isActive: true,
    placement: 'HEAD',
    description: ''
  })

  const pixelTypes = [
    { value: 'YANDEX_METRIKA', label: 'Яндекс.Метрика', needsId: true },
    { value: 'GOOGLE_ANALYTICS', label: 'Google Analytics', needsId: true },
    { value: 'FACEBOOK_PIXEL', label: 'Facebook Pixel', needsId: true },
    { value: 'VK_PIXEL', label: 'VK Pixel', needsId: true },
    { value: 'GOOGLE_ADS', label: 'Google Ads', needsId: true },
    { value: 'YANDEX_DIRECT', label: 'Яндекс.Директ', needsId: true },
    { value: 'CUSTOM_HTML', label: 'Произвольный HTML/JS', needsId: false }
  ]

  const placements = [
    { value: 'HEAD', label: 'В <head> секции' },
    { value: 'BODY_START', label: 'В начале <body>' },
    { value: 'BODY_END', label: 'В конце <body>' }
  ]

  // Проверка авторизации
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin-login')
      return
    }
  }, [session, status, router])

  // Загрузка пикселей
  const loadPixels = async () => {
    try {
      const response = await fetch('/api/admin/pixels')
      if (response.ok) {
        const data = await response.json()
        setPixels(data.pixels)
      }
    } catch (err) {
      console.error('Ошибка загрузки пикселей:', err)
      error('Не удалось загрузить пиксели')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      loadPixels()
    }
  }, [session])

  // Сохранение пикселя
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isEditing = !!editingPixel
    const url = isEditing 
      ? `/api/admin/pixels/${editingPixel.id}`
      : '/api/admin/pixels'
    
    const method = isEditing ? 'PUT' : 'POST'
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        success(isEditing ? 'Пиксель обновлен' : 'Пиксель добавлен')
        setShowForm(false)
        setEditingPixel(null)
        setFormData({
          name: '',
          type: 'YANDEX_METRIKA',
          pixelId: '',
          code: '',
          isActive: true,
          placement: 'HEAD',
          description: ''
        })
        loadPixels()
      } else {
        const data = await response.json()
        error(data.error || 'Ошибка сохранения')
      }
    } catch (err) {
      console.error('Ошибка сохранения:', err)
      error('Не удалось сохранить пиксель')
    }
  }

  // Удаление пикселя
  const handleDelete = async (id: string) => {
    if (!confirm('Удалить пиксель?')) return
    
    try {
      const response = await fetch(`/api/admin/pixels/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        success('Пиксель удален')
        loadPixels()
      }
    } catch (err) {
      error('Ошибка удаления')
    }
  }

  // Переключение активности
  const toggleActive = async (pixel: TrackingPixel) => {
    try {
      const response = await fetch(`/api/admin/pixels/${pixel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pixel,
          isActive: !pixel.isActive
        })
      })
      
      if (response.ok) {
        success(pixel.isActive ? 'Пиксель отключен' : 'Пиксель включен')
        loadPixels()
      }
    } catch (err) {
      error('Ошибка обновления')
    }
  }

  // Редактирование
  const startEditing = (pixel: TrackingPixel) => {
    setEditingPixel(pixel)
    setFormData({
      name: pixel.name,
      type: pixel.type,
      pixelId: pixel.pixelId,
      code: pixel.code || '',
      isActive: pixel.isActive,
      placement: pixel.placement,
      description: pixel.description || ''
    })
    setShowForm(true)
  }

  // Отмена редактирования
  const cancelEditing = () => {
    setShowForm(false)
    setEditingPixel(null)
    setFormData({
      name: '',
      type: 'YANDEX_METRIKA',
      pixelId: '',
      code: '',
      isActive: true,
      placement: 'HEAD',
      description: ''
    })
  }

  const getPixelTypeLabel = (type: string) => {
    return pixelTypes.find(pt => pt.value === type)?.label || type
  }

  const getPlacementLabel = (placement: string) => {
    return placements.find(p => p.value === placement)?.label || placement
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Назад в админку
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Code className="text-purple-600" />
                Трекинг пиксели
              </h1>
              <p className="text-gray-600 mt-2">
                Управление счетчиками аналитики и рекламными пикселями
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
            >
              <Plus size={20} />
              Добавить пиксель
            </button>
          </div>
        </div>

        {/* Форма добавления/редактирования */}
        {showForm && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingPixel ? 'Редактировать пиксель' : 'Добавить пиксель'}
              </h2>
              <button
                onClick={cancelEditing}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Название */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Яндекс.Метрика основной"
                    required
                  />
                </div>

                {/* Тип пикселя */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип пикселя *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {pixelTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ID пикселя */}
                {pixelTypes.find(pt => pt.value === formData.type)?.needsId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID пикселя *
                    </label>
                    <input
                      type="text"
                      value={formData.pixelId}
                      onChange={(e) => setFormData({ ...formData, pixelId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="3663988"
                      required
                    />
                  </div>
                )}

                {/* Размещение */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Размещение
                  </label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {placements.map(placement => (
                      <option key={placement.value} value={placement.value}>
                        {placement.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Произвольный код */}
              {formData.type === 'CUSTOM_HTML' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML/JavaScript код *
                  </label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={6}
                    placeholder="<script>/* ваш код */</script>"
                    required
                  />
                </div>
              )}

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Основной счетчик для отслеживания конверсий"
                />
              </div>

              {/* Активность */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Активный пиксель
                </label>
              </div>

              {/* Кнопки */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingPixel ? 'Обновить' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Список пикселей */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="text-purple-600" />
              Активные пиксели ({pixels.length})
            </h2>
          </div>

          {pixels.length === 0 ? (
            <div className="p-8 text-center">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Пиксели не настроены</p>
              <p className="text-gray-400">Добавьте первый пиксель для отслеживания</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Пиксель
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тип
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID/Код
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Размещение
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pixels.map((pixel) => (
                    <tr key={pixel.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {pixel.name}
                          </div>
                          {pixel.description && (
                            <div className="text-sm text-gray-500">
                              {pixel.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getPixelTypeLabel(pixel.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-mono">
                          {pixel.pixelId || 'Custom Code'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getPlacementLabel(pixel.placement)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(pixel)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            pixel.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {pixel.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                          {pixel.isActive ? 'Активен' : 'Отключен'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(pixel)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Редактировать"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(pixel.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Удалить"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 