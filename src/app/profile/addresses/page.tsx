'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { ArrowLeft, Plus, MapPin, Edit, Trash2, Home, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

// Локальный тип для адреса
interface AddressType {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  userId: string;
}

const initialFormData = {
  name: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Россия',
  phone: '',
  isDefault: false,
};

// Модальное окно для формы
const AddressModal = ({
  isOpen,
  onClose,
  onSave,
  address,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: typeof initialFormData, id?: string) => Promise<void>
  address?: AddressType | null
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (address) {
            setFormData({
                name: address.name,
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                country: address.country,
                phone: address.phone || '',
                isDefault: address.isDefault,
            });
        } else {
            setFormData(initialFormData);
        }
    }
  }, [isOpen, address]);

  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData, address?.id);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
        <h2 className="text-xl font-medium mb-6">{address ? 'Редактировать адрес' : 'Новый адрес'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Название (например, Дом или Работа)" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500" required />
          <input name="street" value={formData.street} onChange={handleChange} placeholder="Улица, дом, квартира" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="city" value={formData.city} onChange={handleChange} placeholder="Город" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500" required />
            <input name="state" value={formData.state} onChange={handleChange} placeholder="Регион/Область" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="Индекс" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500" required />
            <input name="country" value={formData.country} onChange={handleChange} placeholder="Страна" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500" required />
          </div>
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Телефон для связи (необязательно)" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} id="isDefault" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
            <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">Сделать адресом по умолчанию</label>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-medium">Отмена</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 flex items-center gap-2 font-medium">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={16} />}
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Основная страница
export default function AddressesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { success, error } = useToast()
  
  const [addresses, setAddresses] = useState<AddressType[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(null)

  const fetchAddresses = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/addresses')
      if (!response.ok) throw new Error('Не удалось загрузить адреса')
      const data = await response.json()
      setAddresses(data) // Prisma уже возвращает нужные поля
    } catch (err: any) {
      error(err.message)
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile/addresses')
    }
    if (status === 'authenticated') {
      fetchAddresses()
    }
  }, [status, router, fetchAddresses])

  const handleSaveAddress = async (data: typeof initialFormData, id?: string) => {
    const url = id ? `/api/user/addresses/${id}` : '/api/user/addresses'
    const method = id ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Не удалось сохранить адрес')
      }
      success(`Адрес успешно ${id ? 'обновлен' : 'добавлен'}!`)
      setIsModalOpen(false)
      fetchAddresses()
    } catch (err: any) {
      error(err.message)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот адрес?')) {
      try {
        const response = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' })
        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || 'Не удалось удалить адрес')
        }
        success('Адрес удален')
        fetchAddresses()
      } catch (err: any) {
        error(err.message)
      }
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Loader2 className="animate-spin text-teal-500" size={48} />
      </div>
    )
  }

  return (
    <>
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
        address={editingAddress}
      />
      <div className="bg-white min-h-screen">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Link href="/profile" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6">
            <ArrowLeft size={18} />
            Назад в профиль
          </Link>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-light text-gray-900">Мои адреса</h1>
            <button
              onClick={() => {
                setEditingAddress(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium px-4 py-2 rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300"
            >
              <Plus size={16} />
              Добавить адрес
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm text-center py-16 px-6">
              <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-800 mb-2">У вас нет сохраненных адресов</h2>
              <p className="text-gray-500 font-light">Добавьте адрес, чтобы оформлять заказы быстрее.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map(addr => (
                <div key={addr.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-lg">{addr.name}</h3>
                        {addr.isDefault && (
                          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Home size={12} /> По умолчанию
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1 font-light">{`${addr.street}, ${addr.city}, ${addr.state}, ${addr.zipCode}`}</p>
                      {addr.phone && <p className="text-gray-500 text-sm mt-1 font-light">Телефон: {addr.phone}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => {
                          setEditingAddress(addr)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
} 