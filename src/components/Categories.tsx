import Link from 'next/link'
import { ShirtIcon, StarIcon } from 'lucide-react'

const categories = [
  {
    id: 1,
    name: 'Мужская одежда',
    description: 'Стильная одежда для мужчин',
    icon: ShirtIcon,
    href: '/men',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Женская одежда',
    description: 'Элегантная одежда для женщин',
    icon: StarIcon,
    href: '/women',
    color: 'bg-pink-500'
  }
]

export default function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Категории</h2>
          <p className="text-lg text-gray-600">Выберите категорию, которая вам подходит</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link
                key={category.id}
                href={category.href}
                className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-8 text-center">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                  <div className="mt-4 text-blue-600 group-hover:text-blue-800 font-medium">
                    Смотреть →
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
} 