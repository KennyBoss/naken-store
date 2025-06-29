'use client'

interface FashionFAQProps {
  category?: string
}

export default function FashionFAQ({ category = 'general' }: FashionFAQProps) {
  // FAQ данные для разных категорий
  const faqData = {
    general: [
      {
        question: "Как выбрать правильный размер одежды?",
        answer: "Для выбора размера используйте нашу таблицу размеров. Измерьте обхват груди, талии и бедер. Если сомневаетесь между размерами, выбирайте больший для комфортной посадки."
      },
      {
        question: "Какие стили одежды подходят для офиса?",
        answer: "Для офиса выбирайте деловой и smart-casual стили: классические брюки, блузки, жакеты, платья-футляр. Избегайте слишком ярких цветов и откровенных фасонов."
      },
      {
        question: "Как создать базовый гардероб?",
        answer: "Базовый гардероб включает: белая рубашка, классические брюки, маленькое черное платье, джинсы, кардиган, базовая футболка и качественная обувь нейтральных цветов."
      },
      {
        question: "Какие цвета в одежде универсальны?",
        answer: "Универсальные цвета: черный, белый, серый, бежевый, темно-синий. Они легко сочетаются между собой и подходят для любого случая."
      }
    ],
    seasonal: [
      {
        question: "Как одеваться весной 2025?",
        answer: "Весна 2025: многослойность, пастельные оттенки, легкие ткани, кардиганы, тренчи, белые кроссовки и яркие аксессуары."
      },
      {
        question: "Что носить летом в офисе?",
        answer: "Летом в офисе: легкие блузки из натуральных тканей, льняные брюки, платья миди, открытая обувь на низком каблуке, кардиган для кондиционера."
      },
      {
        question: "Как утеплиться стильно зимой?",
        answer: "Зимний стиль: многослойность, качественное пальто, теплые свитеры, шарфы, стильные сапоги, шапки и перчатки в тон основной одежде."
      }
    ],
    style: [
      {
        question: "Что такое капсульный гардероб?",
        answer: "Капсульный гардероб - это минимальный набор качественных вещей (20-40 предметов), которые хорошо сочетаются между собой и подходят для разных случаев."
      },
      {
        question: "Как найти свой стиль в одежде?",
        answer: "Для поиска стиля: определите образ жизни, изучите свой тип фигуры, найдите вдохновение в журналах, экспериментируйте с цветами и фасонами."
      },
      {
        question: "Как сочетать принты в одежде?",
        answer: "Правила сочетания принтов: объединяйте по цвету, сочетайте крупный с мелким принтом, используйте однотонные вещи как основу, не более 2-3 принтов в образе."
      }
    ]
  }

  const currentFAQ = faqData[category as keyof typeof faqData] || faqData.general

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": currentFAQ.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Визуальное отображение FAQ */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          Часто задаваемые вопросы
        </h3>
        
        <div className="space-y-4">
          {currentFAQ.map((item, index) => (
            <details 
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <summary className="font-medium text-gray-900 cursor-pointer hover:text-teal-600 transition-colors">
                {item.question}
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
} 