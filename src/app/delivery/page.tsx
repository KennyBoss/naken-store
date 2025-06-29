'use client'

import { Truck, Package, Clock, MapPin, Phone, Info } from 'lucide-react'
import Link from 'next/link'
import { DeliveryPageJsonLd } from '@/components/JsonLd'

export default function DeliveryPage() {
  return (
    <>
      <DeliveryPageJsonLd />
      <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Доставка</h1>

        {/* Основная информация */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Способы доставки</h2>
          </div>
          
          <div className="space-y-6">
            {/* Доставка по Москве */}
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-medium text-lg mb-2">Доставка по Москве</h3>
              <div className="text-gray-600 space-y-2 font-light">
                <p>• Стоимость: 500 ₽</p>
                <p>• Срок доставки: в день заказа (при оформлении до 14:00)</p>
                <p>• Время доставки: с 10:00 до 22:00</p>
                <p>• Доставка в пределах МКАД</p>
                <p>• Бесплатная доставка при заказе от 5000 ₽</p>
              </div>
            </div>

            {/* СДЭК */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-lg mb-2">СДЭК</h3>
              <div className="text-gray-600 space-y-2 font-light">
                <p>• Стоимость: 300 ₽</p>
                <p>• Срок доставки: 2-5 рабочих дней</p>
                <p>• Доставка во все регионы России</p>
                <p>• Доставка до пункта выдачи или курьером</p>
                <p>• Стоимость может варьироваться в зависимости от региона</p>
              </div>
            </div>

            {/* Почта России */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-lg mb-2">Почта России</h3>
              <div className="text-gray-600 space-y-2 font-light">
                <p>• Стоимость: 500 ₽</p>
                <p>• Срок доставки: 5-10 рабочих дней</p>
                <p>• Доставка во все населенные пункты России</p>
                <p>• Доставка до почтового отделения</p>
                <p>• Бесплатная доставка при заказе от 8000 ₽</p>
              </div>
            </div>

            {/* Самовывоз */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-lg mb-2">Самовывоз</h3>
              <div className="text-gray-600 space-y-2 font-light">
                <p>• Стоимость: Бесплатно</p>
                <p>• Адрес: г. Москва, ул. Докукина, д. 8, стр. 2</p>
                <p>• Подробности по контактам</p>
                <p>• Время работы: уточняйте по телефону</p>
                <p>• Срок хранения заказа: 7 дней</p>
              </div>
            </div>
          </div>
        </div>

        {/* Условия доставки */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Важная информация</h2>
          </div>
          
          <div className="space-y-4 text-gray-600 font-light">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Оформление доставки</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Доставка осуществляется после подтверждения заказа менеджером</li>
                <li>Курьер свяжется с вами за 30-60 минут до доставки</li>
                <li>При получении заказа необходим документ, удостоверяющий личность</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Проверка заказа</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Вы можете проверить комплектность и качество товара при курьере</li>
                <li>В случае обнаружения брака или несоответствия, отказ от товара происходит на месте</li>
                <li>После подписания документов о получении претензии не принимаются</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Повреждение или утеря при доставке</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>При повреждении товара службой доставки мы полностью компенсируем ущерб</li>
                <li>В случае утери посылки мы отправим новый заказ или вернем деньги</li>
                <li>Все посылки застрахованы на полную стоимость</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Контакты */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Остались вопросы?</h2>
          </div>
          
          <div className="space-y-3 text-gray-600 font-light">
            <p>По всем вопросам доставки вы можете связаться с нами:</p>
            <div className="space-y-2">
              <p>• Телефон: <a href="tel:+79209940707" className="text-teal-600 hover:underline">+7 (920) 994-07-07</a></p>
              <p>• Email: <a href="mailto:delivery@naken.store" className="text-teal-600 hover:underline">delivery@naken.store</a></p>
              <p>• Время работы службы поддержки: ежедневно с 9:00 до 21:00</p>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/payment"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300"
          >
            Способы оплаты →
          </Link>
          <Link
            href="/returns"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Возврат товара →
          </Link>
        </div>
      </div>
    </div>
    </>
  )
} 