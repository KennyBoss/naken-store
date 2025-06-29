'use client'

import { ArrowLeftRight, Clock, Package, AlertCircle, CheckCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import { ReturnsPageJsonLd } from '@/components/JsonLd'

export default function ReturnsPage() {
  return (
    <>
      <ReturnsPageJsonLd />
      <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Возврат товара</h1>

        {/* Основные условия */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeftRight className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Условия возврата</h2>
          </div>
          
          <div className="space-y-4 text-gray-600 font-light">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="font-medium text-teal-900 mb-2">Основные правила:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Возврат товара надлежащего качества возможен в течение 14 дней</li>
                <li>Товар не должен быть в употреблении</li>
                <li>Должны быть сохранены товарный вид, потребительские свойства, пломбы, фабричные ярлыки</li>
                <li>Наличие чека или другого документа, подтверждающего оплату</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Товары, не подлежащие возврату:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Нижнее белье и купальники</li>
                <li>Чулочно-носочные изделия</li>
                <li>Товары, изготовленные на заказ по индивидуальным параметрам</li>
                <li>Товары со скидкой более 50%</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Процедура возврата */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Как вернуть товар</h2>
          </div>
          
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="bg-teal-100 text-teal-800 w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0">1</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Свяжитесь с нами</p>
                <p className="text-gray-600 text-sm font-light">Позвоните по телефону +7 (920) 994-07-07 или напишите на returns@naken.store</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-teal-100 text-teal-800 w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0">2</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Заполните заявление</p>
                <p className="text-gray-600 text-sm font-light">Мы отправим вам форму заявления на возврат по email</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-teal-100 text-teal-800 w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0">3</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Отправьте товар</p>
                <p className="text-gray-600 text-sm font-light">Передайте товар курьеру или отправьте почтой по указанному адресу</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-teal-100 text-teal-800 w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0">4</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Получите деньги</p>
                <p className="text-gray-600 text-sm font-light">После проверки товара мы вернем деньги в течение 10 дней</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Обмен товара */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeftRight className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Обмен товара</h2>
          </div>
          
          <div className="space-y-3 text-gray-600 font-light">
            <p>Если товар не подошел по размеру, цвету или фасону, вы можете обменять его на аналогичный товар другого размера, цвета или модели.</p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900 mb-1">Важно знать:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Обмен возможен только на товар той же или большей стоимости</li>
                    <li>При обмене на более дорогой товар необходима доплата</li>
                    <li>Доставка при обмене оплачивается покупателем</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Возврат денег */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Сроки возврата денежных средств</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">При оплате банковской картой</h3>
              <p className="text-gray-600 font-light">Возврат осуществляется на ту же карту в течение 3-10 рабочих дней</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900">При оплате наличными</h3>
              <p className="text-gray-600 font-light">Возврат наличными в офисе или переводом на карту в течение 3 дней</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-900">При оплате через СБП</h3>
              <p className="text-gray-600 font-light">Возврат на счет отправителя в течение 1-2 рабочих дней</p>
            </div>
          </div>
        </div>

        {/* Гарантия качества */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Гарантия качества</h2>
          </div>
          
          <div className="space-y-3 text-gray-600 font-light">
            <p>На все товары распространяется гарантия производителя. В случае обнаружения производственного брака:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Мы принимаем товар обратно в любое время</li>
              <li>Полностью возмещаем стоимость товара и доставки</li>
              <li>По вашему желанию можем заменить товар на аналогичный</li>
              <li>Компенсируем расходы на обратную отправку</li>
            </ul>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
              <p className="text-sm text-green-900">
                <strong>Наша цель</strong> — чтобы вы остались довольны покупкой. Если у вас есть вопросы или сомнения, свяжитесь с нами, и мы найдем решение!
              </p>
            </div>
          </div>
        </div>

        {/* Контакты */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Служба поддержки</h2>
          </div>
          
          <div className="space-y-3 text-gray-600 font-light">
            <p>По всем вопросам возврата и обмена:</p>
            <div className="space-y-2">
              <p>• Телефон: <a href="tel:+79209940707" className="text-teal-600 hover:underline">+7 (920) 994-07-07</a></p>
              <p>• Email: <a href="mailto:returns@naken.store" className="text-teal-600 hover:underline">returns@naken.store</a></p>
              <p>• Время работы: ежедневно с 9:00 до 21:00</p>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-900 mb-2">Адрес для возврата:</p>
              <p>г. Москва, ул. Докукина, д. 8, стр. 2</p>
              <p>Получатель: ООО "НАКЕН"</p>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/payment"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            ← Оплата
          </Link>
          <Link
            href="/privacy"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300"
          >
            Политика конфиденциальности →
          </Link>
        </div>
      </div>
    </div>
    </>
  )
} 