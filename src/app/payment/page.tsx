'use client'

import { CreditCard, Shield, Lock, CheckCircle, Info, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Способы оплаты</h1>

        {/* Доступные способы оплаты */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Как вы можете оплатить заказ</h2>
          </div>
          
          <div className="space-y-6">
            {/* Онлайн оплата */}
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-medium text-lg mb-2">Онлайн оплата банковской картой</h3>
              <div className="text-gray-600 space-y-2 font-light">
                <p>Мы принимаем карты следующих платежных систем:</p>
                <div className="flex gap-3 my-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">МИР</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">Visa</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">MasterCard</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">Maestro</span>
                </div>
                <p>• Оплата происходит через безопасный платежный шлюз ЮKassa</p>
                <p>• После оплаты вы получите электронный чек на email</p>
                <p>• Средства списываются сразу после подтверждения платежа</p>
              </div>
            </div>

            {/* Электронные кошельки */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-lg mb-2">Электронные кошельки</h3>
              <div className="text-gray-600 space-y-2 font-light">
                <p>Доступные электронные платежные системы:</p>
                <div className="flex gap-3 my-3">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg">ЮMoney</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg">QIWI</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg">WebMoney</span>
                </div>
                <p>• Моментальное зачисление средств</p>
                <p>• Комиссия взимается согласно тарифам платежной системы</p>
              </div>
            </div>

            {/* СБП */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-lg mb-2">Система быстрых платежей (СБП)</h3>
              <div className="text-gray-600 space-y-2 font-light">
                <p>• Оплата через мобильное приложение вашего банка</p>
                <p>• Мгновенное зачисление средств</p>
                <p>• Без комиссии для большинства банков</p>
                <p>• Максимальная сумма платежа: 1 000 000 ₽</p>
              </div>
            </div>

            {/* Оплата при получении */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-lg mb-2">Оплата при получении</h3>
              <div className="text-gray-600 space-y-2 font-light">
                <p>• Оплата наличными или картой курьеру</p>
                <p>• Доступна только для доставки по Москве</p>
                <p>• Обязательна предоплата 20% от суммы заказа</p>
                <p>• Чек выдается курьером на месте</p>
              </div>
            </div>
          </div>
        </div>

        {/* Безопасность платежей */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Безопасность платежей</h2>
          </div>
          
          <div className="space-y-4 text-gray-600 font-light">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">SSL-сертификат</h3>
                <p>Все данные передаются по защищенному протоколу HTTPS с использованием SSL-шифрования</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Стандарт PCI DSS</h3>
                <p>Платежная система ЮKassa соответствует международным стандартам безопасности PCI DSS</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Токенизация платежей</h3>
                <p>Данные вашей карты заменяются на уникальный токен и не хранятся на наших серверах</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">3D-Secure</h3>
                <p>Дополнительная проверка платежа через SMS-код от вашего банка</p>
              </div>
            </div>
          </div>
        </div>

        {/* Процесс оплаты */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Как происходит оплата</h2>
          </div>
          
          <ol className="space-y-3 text-gray-600 font-light">
            <li className="flex gap-3">
              <span className="bg-teal-100 text-teal-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
              <div>
                <p className="font-medium text-gray-900">Выберите способ оплаты</p>
                <p className="text-sm">При оформлении заказа выберите удобный способ оплаты</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-teal-100 text-teal-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
              <div>
                <p className="font-medium text-gray-900">Введите данные</p>
                <p className="text-sm">Заполните необходимые поля для выбранного способа оплаты</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-teal-100 text-teal-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
              <div>
                <p className="font-medium text-gray-900">Подтвердите платеж</p>
                <p className="text-sm">Введите код из SMS для подтверждения операции</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-teal-100 text-teal-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
              <div>
                <p className="font-medium text-gray-900">Получите чек</p>
                <p className="text-sm">Электронный чек будет отправлен на указанный email</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Возврат средств */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Возврат денежных средств</h2>
          </div>
          
          <div className="space-y-3 text-gray-600 font-light">
            <p>При отмене заказа или возврате товара денежные средства возвращаются тем же способом, которым была произведена оплата:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>На банковскую карту — в течение 3-10 рабочих дней</li>
              <li>На электронный кошелек — в течение 1-3 рабочих дней</li>
              <li>Через СБП — мгновенно или в течение 1 рабочего дня</li>
              <li>При оплате наличными — возврат наличными в офисе или переводом</li>
            </ul>
            <p className="text-sm bg-gray-50 p-3 rounded-xl">
              <strong>Важно:</strong> Срок зачисления средств зависит от банка-эмитента вашей карты и может составлять до 30 дней.
            </p>
          </div>
        </div>

        {/* Онлайн-касса */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Электронные чеки</h2>
          </div>
          
          <div className="space-y-3 text-gray-600 font-light">
            <p>В соответствии с требованиями 54-ФЗ мы используем облачную онлайн-кассу для формирования электронных чеков.</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Чек отправляется на email сразу после оплаты</li>
              <li>Чек содержит QR-код для проверки в ФНС</li>
              <li>Все чеки сохраняются в личном кабинете</li>
              <li>При необходимости можем выслать дубликат чека</li>
            </ul>
          </div>
        </div>

        {/* Контакты */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-medium">Нужна помощь?</h2>
          </div>
          
          <div className="space-y-3 text-gray-600 font-light">
            <p>Если у вас возникли вопросы по оплате:</p>
            <div className="space-y-2">
              <p>• Телефон: <a href="tel:+79209940707" className="text-teal-600 hover:underline">+7 (920) 994-07-07</a></p>
              <p>• Email: <a href="mailto:payment@naken.store" className="text-teal-600 hover:underline">payment@naken.store</a></p>
              <p>• Время работы: ежедневно с 9:00 до 21:00</p>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/delivery"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            ← Доставка
          </Link>
          <Link
            href="/returns"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300"
          >
            Возврат товара →
          </Link>
        </div>
      </div>
    </div>
  )
} 