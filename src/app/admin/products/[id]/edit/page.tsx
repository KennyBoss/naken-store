'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Save,
  Upload, 
  X, 
  Plus,
  Loader2,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/ui/ImageUpload'
import { generateSEODescription, validateSEODescription, generateProductKeywords } from '@/lib/utils'

interface ProductFormData {
  name: string
  description: string
  price: number
  salePrice?: number
  sku: string
  stock: number
  images: string[]
  sizeIds: string[]
  colorId: string
  published: boolean
}

interface Size {
  id: string
  name: string
  russianSize: string
}

interface Color {
  id: string
  name: string
  hexCode: string
}

export default function EditProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  
  const showMessage = (message: string, type: 'success' | 'error') => {
    alert(`${type === 'success' ? '✅' : '❌'} ${message}`)
  }
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Данные формы
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    salePrice: undefined,
    sku: '',
    stock: 0,
    images: [],
    sizeIds: [],
    colorId: '',
    published: false
  })

  // Доступные размеры и цвета
  const [sizes, setSizes] = useState<Size[]>([])
  const [colors, setColors] = useState<Color[]>([])
  
  // UI состояния
  const [newImage, setNewImage] = useState('')
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/products')
      return
    }
    
    if (session?.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    // Загружаем товар и справочники
    loadData()
  }, [status, session, router, params.id])

  const loadData = async () => {
    try {
      // Загружаем размеры, цвета и данные товара параллельно
      const [sizesResponse, colorsResponse, productResponse] = await Promise.all([
        fetch('/api/admin/sizes'),
        fetch('/api/admin/colors'),
        fetch(`/api/admin/products/${params.id}`)
      ])

      if (sizesResponse.ok) {
        const sizesData = await sizesResponse.json()
        setSizes(sizesData)
      }

      if (colorsResponse.ok) {
        const colorsData = await colorsResponse.json()
        setColors(colorsData)
      }

      if (productResponse.ok) {
        const productData = await productResponse.json()
        
        // Преобразуем данные товара в формат формы
        setFormData({
          name: productData.name,
          description: productData.description || '',
          price: productData.price,
          salePrice: productData.salePrice || undefined,
          sku: productData.sku,
          stock: productData.stock,
          images: JSON.parse(productData.images || '[]'),
          sizeIds: productData.sizes?.map((ps: any) => ps.sizeId) || [],
          colorId: productData.colorId || '',
          published: productData.published
        })
      } else {
        showMessage('Товар не найден', 'error')
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
      showMessage('Ошибка загрузки данных', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || formData.price <= 0 || formData.sizeIds.length === 0 || !formData.colorId) {
      showMessage('Заполните все обязательные поля (название, цена, размеры, цвет)', 'error')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        showMessage('Товар обновлен', 'success')
        router.push('/admin/products')
      } else {
        const data = await response.json()
        showMessage(data.error || 'Ошибка обновления товара', 'error')
      }
    } catch (err) {
      showMessage('Ошибка обновления товара', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const addImage = () => {
    if (newImage && !formData.images.includes(newImage)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }))
      setNewImage('')
    }
  }

  const removeImage = (image: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== image)
    }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" />
          <span className="text-lg text-gray-600">Загрузка...</span>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/products"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                Назад
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Редактирование товара</h1>
                <p className="text-gray-600">Изменение информации о товаре</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Основная информация */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Основная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название товара *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена со скидкой
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.salePrice || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, salePrice: parseFloat(e.target.value) || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU (артикул) *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество в наличии
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
                <button
                  type="button"
                  onClick={() => {
                    // Автогенерация описания на основе текущих данных
                    if (formData.name && formData.price > 0) {
                      const selectedSizes = formData.sizeIds
                        .map(id => sizes.find(s => s.id === id)?.name)
                        .filter((name): name is string => Boolean(name))
                      const selectedColor = colors.find(c => c.id === formData.colorId)?.name
                      
                      const productData = {
                        name: formData.name,
                        description: formData.description,
                        price: formData.price,
                        salePrice: formData.salePrice,
                        sizes: selectedSizes,
                        colors: selectedColor ? [selectedColor] : [],
                        category: 'одежда',
                        brand: 'NAKEN'
                      }
                      
                      const autoDescription = generateSEODescription(productData)
                      setFormData(prev => ({ ...prev, description: autoDescription }))
                    }
                  }}
                  className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  🤖 Авто-SEO
                </button>
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Стильные кроссовки Nike Air Max 90 с воздушной подушкой. Высокое качество, быстрая доставка..."
              />
              
              {/* SEO валидация и превью */}
              {formData.description && (() => {
                const validation = validateSEODescription(formData.description)
                return (
                  <div className="mt-3 space-y-2">
                    {/* Статус валидации */}
                    <div className="flex items-center gap-2">
                      {validation.isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className={`text-xs font-medium ${validation.isValid ? 'text-green-700' : 'text-yellow-700'}`}>
                        SEO: {validation.isValid ? 'Оптимизировано' : 'Требуется доработка'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formData.description.length}/160 символов
                      </span>
                    </div>
                    
                    {/* Предупреждения */}
                    {validation.warnings.length > 0 && (
                      <div className="text-xs text-red-600 space-y-1">
                        {validation.warnings.map((warning, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span>⚠️</span>
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Рекомендации */}
                    {validation.suggestions.length > 0 && (
                      <div className="text-xs text-blue-600 space-y-1">
                        {validation.suggestions.map((suggestion, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span>💡</span>
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Варианты товара */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Вариант товара</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Размеры - множественный выбор */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Размеры * (выберите все доступные)
              </label>
              {sizes.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  Сначала добавьте размеры в <Link href="/admin/sizes" className="text-blue-600 hover:text-blue-800">управлении размерами</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {sizes.map(size => (
                    <label
                      key={size.id}
                      className={`
                        flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all
                        ${formData.sizeIds.includes(size.id) 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        value={size.id}
                        checked={formData.sizeIds.includes(size.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              sizeIds: [...prev.sizeIds, size.id] 
                            }))
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              sizeIds: prev.sizeIds.filter(id => id !== size.id) 
                            }))
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">
                        {size.name} ({size.russianSize})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Цвет */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цвет *
              </label>
              {colors.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  Сначала добавьте цвета в <Link href="/admin/colors" className="text-blue-600 hover:text-blue-800">управлении цветами</Link>
                </div>
              ) : (
                <select
                  value={formData.colorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  required
                >
                  <option value="">Выберите цвет</option>
                  {colors.map(color => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Изображения */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Изображения</h2>
            
            {/* Переключатель режима */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUploadMode('upload')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  uploadMode === 'upload' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📁 Загрузить файлы
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  uploadMode === 'url' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔗 По ссылке
              </button>
            </div>
          </div>

          {uploadMode === 'upload' ? (
            <ImageUpload
              images={formData.images}
              onImagesChange={(newImages) => 
                setFormData(prev => ({ ...prev, images: newImages }))
              }
              maxImages={10}
              keepAspectRatio={true}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Добавить
                </button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Изображение ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Настройки */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Настройки</h2>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Опубликовать товар (сделать видимым в каталоге)
            </label>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Link
            href="/admin/products"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Отмена
          </Link>
          
          <button
            type="submit"
            disabled={submitting || sizes.length === 0 || colors.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={20} />
            {submitting ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  )
} 