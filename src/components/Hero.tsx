import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-black text-white">
      <div className="absolute inset-0 bg-black/20 z-10"></div>
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Новая коллекция
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">
              Зима 2024
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            Откройте для себя последние тренды в моде. Стиль, качество и комфорт в каждой детали.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/catalog" 
              className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Посмотреть коллекцию
            </Link>
            <Link 
              href="/sale" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
            >
              Скидки до 50%
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 