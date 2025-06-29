'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Save, Upload, Image as ImageIcon, Globe, Search, User } from 'lucide-react'
import { DEFAULT_SETTINGS, type SiteSetting } from '@/lib/site-settings'

interface Settings {
  [key: string]: {
    value: string
    type: string
    category: string
    description?: string
  }
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Проверка доступа
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'ADMIN') {
      router.push('/admin-login')
      return
    }
  }, [session, status, router])

  // Загрузка настроек
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // Дефолтные настройки на случай ошибки
      const defaultSettings: Settings = {}
      Object.values(DEFAULT_SETTINGS).forEach(setting => {
        defaultSettings[setting.key] = {
          value: setting.value,
          type: setting.type,
          category: setting.category,
          description: setting.description
        }
      })
      
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || defaultSettings)
      } else {
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
      setMessage('Ошибка загрузки настроек')
      // Используем дефолтные настройки при ошибке
      const defaultSettings: Settings = {}
      Object.values(DEFAULT_SETTINGS).forEach(setting => {
        defaultSettings[setting.key] = {
          value: setting.value,
          type: setting.type,
          category: setting.category,
          description: setting.description
        }
      })
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        setMessage('Настройки успешно сохранены!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(error.message || 'Ошибка сохранения')
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      setMessage('Ошибка сохранения настроек')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (key: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const { url } = await response.json()
        handleInputChange(key, url)
        setMessage('Изображение успешно загружено!')
      } else {
        setMessage('Ошибка загрузки изображения')
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      setMessage('Ошибка загрузки изображения')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seo': return <Search size={20} />
      case 'branding': return <ImageIcon size={20} />
      case 'general': return <Globe size={20} />
      default: return <User size={20} />
    }
  }

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'seo': return 'SEO и поисковая оптимизация'
      case 'branding': return 'Брендинг и дизайн'
      case 'general': return 'Общие настройки'
      default: return 'Прочие настройки'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Загрузка настроек...</p>
        </div>
      </div>
    )
  }

  // Группировка настроек по категориям
  const categorizedSettings = Object.entries(settings).reduce((acc, [key, setting]) => {
    const category = setting.category || 'general'
    if (!acc[category]) acc[category] = []
    acc[category].push({ key, ...setting })
    return acc
  }, {} as Record<string, Array<{ key: string } & Settings[string]>>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-gray-800 mb-2">Настройки сайта</h1>
              <p className="text-gray-600">Управление основными параметрами сайта</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-4 mb-6">
            <p className={`${message.includes('Ошибка') ? 'text-red-600' : 'text-green-600'} font-medium`}>
              {message}
            </p>
          </div>
        )}

        {/* Settings by Categories */}
        {Object.entries(categorizedSettings).map(([category, categorySettings]) => (
          <div key={category} className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-teal-600">
                {getCategoryIcon(category)}
              </div>
              <h2 className="text-xl font-medium text-gray-800">
                {getCategoryTitle(category)}
              </h2>
            </div>

            <div className="space-y-6">
              {categorySettings.map(setting => (
                <div key={setting.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {setting.description || setting.key}
                  </label>
                  
                  {setting.type === 'textarea' ? (
                    <textarea
                      value={setting.value}
                      onChange={(e) => handleInputChange(setting.key, e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 backdrop-blur-sm bg-white/40 border border-white/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder={`Введите ${setting.description?.toLowerCase() || setting.key}`}
                    />
                  ) : setting.type === 'image' ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => handleInputChange(setting.key, e.target.value)}
                        className="w-full px-4 py-3 backdrop-blur-sm bg-white/40 border border-white/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="URL изображения или путь к файлу"
                      />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-white/70 rounded-lg hover:bg-white/80 cursor-pointer transition-colors">
                          <Upload size={16} />
                          <span className="text-sm">Загрузить файл</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(setting.key, file)
                            }}
                            className="hidden"
                          />
                        </label>
                        {setting.value && (
                          <img
                            src={setting.value}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg border border-white/50"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={setting.value}
                      onChange={(e) => handleInputChange(setting.key, e.target.value)}
                      className="w-full px-4 py-3 backdrop-blur-sm bg-white/40 border border-white/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder={`Введите ${setting.description?.toLowerCase() || setting.key}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 