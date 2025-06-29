'use client'

import { Building2, Phone, Mail, MapPin, Clock, FileText } from 'lucide-react'
import Link from 'next/link'

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Контакты и реквизиты</h1>

        {/* Реквизиты компании */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Реквизиты организации</h2>
          </div>
          
          <div className="space-y-3 text-gray-600 font-light">
            <div>
              <p className="text-sm text-gray-500">Полное наименование</p>
              <p className="font-medium text-gray-900">Индивидуальный предприниматель Мусаев Канан Ягуб Оглы</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ИНН</p>
                <p className="font-medium text-gray-900">621305095777</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ОГРНИП</p>
                <p className="font-medium text-gray-900">323623400037470</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Юридический адрес</p>
              <p className="font-medium text-gray-900">г. Москва, ул. Докукина, д. 8, стр. 2</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Фактический адрес</p>
              <p className="font-medium text-gray-900">г. Москва, ул. Докукина, д. 8, стр. 2</p>
            </div>
          </div>
        </div>

        {/* Банковские реквизиты */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Банковские реквизиты</h2>
          </div>
          
          <div className="space-y-3 text-gray-600 font-light">
            <div>
              <p className="text-sm text-gray-500">Наименование банка</p>
              <p className="font-medium text-gray-900">ПАО "СБЕРБАНК РОССИИ"</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Расчетный счет</p>
                <p className="font-medium text-gray-900">40702810999999999999</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Корреспондентский счет</p>
                <p className="font-medium text-gray-900">30101810400000000225</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">БИК</p>
                <p className="font-medium text-gray-900">044525225</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Код по ОКВЭД</p>
                <p className="font-medium text-gray-900">47.71</p>
              </div>
            </div>
          </div>
        </div>

        {/* Руководство */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">Руководство</h2>
          
          <div className="space-y-3 text-gray-600 font-light">
            <div>
              <p className="text-sm text-gray-500">Индивидуальный предприниматель</p>
              <p className="font-medium text-gray-900">Мусаев Канан Ягуб Оглы</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Действует на основании</p>
              <p className="font-medium text-gray-900">Свидетельства о государственной регистрации ИП</p>
            </div>
          </div>
        </div>

        {/* Контактная информация */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">Контактная информация</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-sm text-gray-500">Телефон</p>
                <p className="font-medium">
                  <a href="tel:+79209940707" className="text-teal-600 hover:underline">+7 (920) 994-07-07</a>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-sm text-gray-500">Email для общих вопросов</p>
                <p className="font-medium">
                  <a href="mailto:naken.storesupp@gmail.com" className="text-teal-600 hover:underline">naken.storesupp@gmail.com</a>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-sm text-gray-500">Email для сотрудничества</p>
                <p className="font-medium">
                  <a href="mailto:partners@naken.store" className="text-teal-600 hover:underline">partners@naken.store</a>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-sm text-gray-500">Адрес офиса и шоурума</p>
                <p className="font-medium text-gray-900">г. Москва, ул. Докукина, д. 8, стр. 2</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-sm text-gray-500">График работы</p>
                <p className="font-medium text-gray-900">Ежедневно с 10:00 до 21:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Отделы */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">Отделы</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-medium text-gray-900">Служба поддержки клиентов</h3>
              <p className="text-sm text-gray-600 font-light">Email: <a href="mailto:support@naken.store" className="text-teal-600 hover:underline">support@naken.store</a></p>
              <p className="text-sm text-gray-600 font-light">Телефон: +7 (920) 994-07-07</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">Отдел доставки</h3>
              <p className="text-sm text-gray-600 font-light">Email: <a href="mailto:delivery@naken.store" className="text-teal-600 hover:underline">delivery@naken.store</a></p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-900">Отдел возвратов</h3>
              <p className="text-sm text-gray-600 font-light">Email: <a href="mailto:returns@naken.store" className="text-teal-600 hover:underline">returns@naken.store</a></p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-gray-900">Отдел оптовых продаж</h3>
              <p className="text-sm text-gray-600 font-light">Email: <a href="mailto:wholesale@naken.store" className="text-teal-600 hover:underline">wholesale@naken.store</a></p>
            </div>
          </div>
        </div>

        {/* Документы */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-medium mb-4">Правовая информация</h2>
          
          <div className="space-y-3">
            <Link href="/privacy" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300 mr-4">
              → Политика конфиденциальности
            </Link>
            <Link href="/offer" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300 mr-4">
              → Публичная оферта
            </Link>
            <Link href="/terms" className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
              → Пользовательское соглашение
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 