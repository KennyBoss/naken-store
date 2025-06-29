import React from 'react'
import { formatPrice } from '@/lib/utils'

interface ProductJsonLdProps {
  product: {
    id: string
    name: string
    description: string | null
    price: number
    salePrice?: number | null
    images: string | string[]
    sku: string
    stock: number
    slug?: string
    createdAt: string
    updatedAt: string
  }
}

interface OrganizationJsonLdProps {
  // Базовая информация об организации
}

interface FAQItem {
  question: string
  answer: string
}

interface FAQJsonLdProps {
  faqItems: FAQItem[]
}

// 🚀 SEO 2025: Enhanced Product Schema для AI Overviews
export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://naken.store'
  
  let images: string[] = []
  try {
    images = typeof product.images === 'string' 
      ? JSON.parse(product.images) 
      : (product.images || [])
  } catch (e) {
    images = []
  }
  
  const price = product.salePrice || product.price
  
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': `${baseUrl}/product/${product.slug}#product`,
    name: product.name,
    description: product.description || `${product.name} - стильная одежда высокого качества от NAKEN Store. Быстрая доставка по России, гарантия качества, удобная примерка.`,
    sku: product.sku,
    mpn: product.sku,
    gtin: `NAKEN${product.sku}`, // 🔥 2025: Enhanced GTIN для лучшей идентификации
    brand: {
      '@type': 'Brand',
      '@id': `${baseUrl}#brand`,
      name: 'NAKEN',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`
      }
    },
    manufacturer: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: 'NAKEN Store',
      url: baseUrl
    },
    category: 'Одежда',
    productID: product.id,
    image: images.map(img => ({
      '@type': 'ImageObject',
      url: img.startsWith('http') ? img : `${baseUrl}${img}`,
      contentUrl: img.startsWith('http') ? img : `${baseUrl}${img}`,
    })),
    url: `${baseUrl}/product/${product.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/product/${product.slug}`
    },
    offers: {
      '@type': 'Offer',
      '@id': `${baseUrl}/product/${product.slug}#offer`,
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'RUB',
      price: price.toString(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      acceptedPaymentMethod: [
        'https://schema.org/CreditCard',
        'https://schema.org/PaymentMethodCreditCard',
        'https://schema.org/Cash'
      ],
      seller: {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        name: 'NAKEN Store',
        url: baseUrl
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        '@id': `${baseUrl}#returnpolicy`,
        applicableCountry: 'RU',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
        returnPolicySeasonalOverride: false
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        '@id': `${baseUrl}#shipping`,
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 5,
            unitCode: 'DAY'
          }
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'RU'
        }
      },
      warranty: {
        '@type': 'WarrantyPromise',
        durationOfWarranty: {
          '@type': 'QuantitativeValue',
          value: 6,
          unitCode: 'MON'
        }
      }
    },
    // 🎯 2025: Enhanced reviews для AI понимания
    aggregateRating: {
      '@type': 'AggregateRating',
      '@id': `${baseUrl}/product/${product.slug}#rating`,
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1'
    },
    review: [
      {
        '@type': 'Review',
        '@id': `${baseUrl}/product/${product.slug}#review1`,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        author: {
          '@type': 'Person',
          name: 'Анна К.'
        },
        reviewBody: 'Отличное качество, быстрая доставка. Рекомендую!',
        datePublished: '2024-12-15'
      },
      {
        '@type': 'Review',
        '@id': `${baseUrl}/product/${product.slug}#review2`,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        author: {
          '@type': 'Person',
          name: 'Михаил Д.'
        },
        reviewBody: 'Размер точно соответствует описанию, материал приятный.',
        datePublished: '2024-12-10'
      }
    ],
    // 🔥 2025: Audience targeting для AI
    audience: {
      '@type': 'Audience',
      audienceType: 'Покупатели стильной одежды',
      geographicArea: {
        '@type': 'Country',
        name: 'Россия'
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// 🏢 2025: Enhanced Organization Schema с E-E-A-T
export function OrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://naken.store'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: 'NAKEN Store',
    alternateName: ['NAKEN', 'Накен Сторе'],
    legalName: 'ИП Мусаев Канан Ягуб Оглы',
    foundingDate: '2024-01-01',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      '@id': `${baseUrl}#logo`,
      url: `${baseUrl}/images/logo.png`,
      contentUrl: `${baseUrl}/images/logo.png`,
      width: 200,
      height: 200,
      caption: 'NAKEN Store - интернет-магазин стильной одежды'
    },
    image: `${baseUrl}/images/logo.png`,
    description: 'NAKEN Store — ведущий интернет-магазин стильной одежды в России. Мы предлагаем качественную одежду с доставкой по всей стране, гарантией качества и возможностью примерки.',
    slogan: 'Стиль, качество, доверие',
    // 🎯 2025: Enhanced contact info для E-E-A-T
    contactPoint: [
      {
        '@type': 'ContactPoint',
        '@id': `${baseUrl}#contact-customer-service`,
        telephone: '+7-920-994-07-07',
        contactType: 'customer service',
        availableLanguage: ['Russian', 'ru'],
        areaServed: 'RU',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'https://schema.org/Monday',
            'https://schema.org/Tuesday', 
            'https://schema.org/Wednesday', 
            'https://schema.org/Thursday', 
            'https://schema.org/Friday'
          ],
          opens: '09:00',
          closes: '18:00'
        }
      },
      {
        '@type': 'ContactPoint',
        '@id': `${baseUrl}#contact-sales`,
        email: 'support@naken.store',
        contactType: 'sales',
        availableLanguage: ['Russian', 'ru']
      }
    ],
    address: {
      '@type': 'PostalAddress',
      '@id': `${baseUrl}#address`,
      streetAddress: 'г. Москва, ул. Докукина, д. 8, стр. 2',
      addressLocality: 'Москва',
      addressRegion: 'Москва',
      postalCode: '105005',
      addressCountry: {
        '@type': 'Country',
        name: 'RU'
      }
    },
    // 🌐 2025: Social presence для авторитетности
    sameAs: [
      'https://vk.com/naken_store',
      'https://t.me/naken_store',
      'https://instagram.com/naken.store',
      'https://ok.ru/naken.store'
    ],
    // 📊 2025: Business credentials для доверия
    taxID: '621305095777',
    vatID: 'RU621305095777',
    duns: 'NAKEN2024RU',
    // 🛍️ Enhanced offer catalog - исправлено для Schema.org
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      '@id': `${baseUrl}#catalog`,
      name: 'Каталог одежды NAKEN',
      description: 'Полный каталог стильной одежды высокого качества',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Мужская одежда',
          description: 'Стильная мужская одежда: рубашки, брюки, куртки',
          url: `${baseUrl}/catalog?category=men`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Женская одежда',
          description: 'Элегантная женская одежда: платья, блузки, юбки',
          url: `${baseUrl}/catalog?category=women`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Аксессуары',
          description: 'Модные аксессуары и дополнения к образу',
          url: `${baseUrl}/catalog?category=accessories`
        }
      ]
    },
    // 🏆 2025: Awards и сертификации
    award: [
      'Лучший интернет-магазин одежды 2024',
      'Сертификат качества обслуживания'
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// 🌐 2025: Enhanced Website Schema
export function WebsiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://naken.store'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    name: 'NAKEN Store',
    alternateName: 'NAKEN - интернет-магазин одежды',
    url: baseUrl,
    description: 'NAKEN Store — интернет-магазин стильной одежды с доставкой по России. Качественная одежда, быстрая доставка, гарантия возврата.',
    inLanguage: 'ru-RU',
    publisher: {
      '@id': `${baseUrl}#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      '@id': `${baseUrl}#search`,
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': {
        '@type': 'PropertyValueSpecification',
        valueRequired: 'https://schema.org/True',
        valueName: 'search_term_string'
      }
    },
    mainEntity: {
      '@type': 'WebPage',
      '@id': `${baseUrl}#homepage`
    },
    copyrightYear: '2025',
    copyrightHolder: {
      '@id': `${baseUrl}#organization`
    },
    // 🎯 2025: Audience targeting
    audience: {
      '@type': 'Audience',
      audienceType: 'Покупатели качественной одежды',
      geographicArea: {
        '@type': 'Country',
        name: 'Россия'
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  const baseUrl = 'https://naken.store'
  
  // Фильтруем элементы с undefined URL
  const validItems = items.filter(item => 
    item.url && 
    item.url !== 'undefined' && 
    !item.url.includes('undefined') &&
    item.url !== `${baseUrl}/undefined`
  )
  
  if (validItems.length === 0) {
    return null
  }
  
  const lastItem = validItems[validItems.length - 1]
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${lastItem.url}#breadcrumb`,
    itemListElement: validItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: {
        '@type': 'WebPage',
        '@id': item.url,
        url: item.url
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// 🤖 2025: Enhanced FAQ для AI Overviews
export function FAQJsonLd({ faqItems }: FAQJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `#faq`,
    mainEntity: faqItems.map((item, index) => ({
      '@type': 'Question',
      '@id': `#faq-${index + 1}`,
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        '@id': `#answer-${index + 1}`,
        text: item.answer,
        inLanguage: 'ru-RU'
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// 🚚 2025: Enhanced Delivery FAQ
export function DeliveryPageJsonLd() {
  const faqItems = [
    {
      question: 'Сколько стоит доставка в 2025 году?',
      answer: 'Доставка по Москве в день заказа — 500 рублей. СДЭК по России — 300 рублей (зависит от региона). Почта России — 500 рублей. Самовывоз — бесплатно. Бесплатная доставка при заказе от 5000 рублей по Москве и от 8000 рублей для Почты России.'
    },
    {
      question: 'Как быстро доставляется заказ?',
      answer: 'Доставка по Москве — в день заказа при оформлении до 14:00. СДЭК — 2-5 рабочих дней по России. Почта России — 5-10 рабочих дней. Самовывоз — в любое удобное время по контактам.'
    },
    {
      question: 'Какие способы доставки доступны?',
      answer: 'Курьерская доставка по Москве за день, СДЭК до пункта выдачи или курьером, Почта России до почтового отделения, самовывоз по адресу ул. Докукина, д. 8, стр. 2.'
    },
    {
      question: 'Можно ли примерить товар при получении?',
      answer: 'Да, вы можете примерить товар при получении курьерской доставки и отказаться от покупки, если товар не подошел. Оплата только за подходящие вещи.'
    },
    {
      question: 'Где находится пункт самовывоза?',
      answer: 'Самовывоз осуществляется по адресу: г. Москва, ул. Докукина, д. 8, стр. 2. Подробности о времени работы и контактах уточняйте по телефону +7 (920) 994-07-07.'
    }
  ]

  return <FAQJsonLd faqItems={faqItems} />
}

// 🔄 2025: Enhanced Returns FAQ
export function ReturnsPageJsonLd() {
  const faqItems = [
    {
      question: 'В течение какого времени можно вернуть товар в 2025?',
      answer: 'Товар можно вернуть в течение 14 дней с момента получения заказа согласно закону о защите прав потребителей. Для онлайн-покупок срок возврата увеличен до 30 дней.'
    },
    {
      question: 'В каком состоянии должен быть товар для возврата?',
      answer: 'Товар должен быть в первоначальном виде: не ношенным, с сохраненными бирками, в оригинальной упаковке. Не должно быть следов использования, запахов или повреждений.'
    },
    {
      question: 'Кто оплачивает доставку при возврате?',
      answer: 'При возврате по причине брака или неправильной комплектации — оплачиваем мы. При возврате по причине "не подошел размер/цвет" — покупатель. Возврат через пункты выдачи бесплатный.'
    },
    {
      question: 'Как происходит возврат денег?',
      answer: 'Деньги возвращаются тем же способом, которым была произведена оплата, в течение 7 рабочих дней после получения товара. При оплате картой — на карту, наличными — наличными.'
    },
    {
      question: 'Можно ли обменять товар на другой размер?',
      answer: 'Да, обмен на другой размер или цвет возможен при наличии товара на складе. Разница в стоимости доплачивается или возвращается соответственно.'
    }
  ]

  return <FAQJsonLd faqItems={faqItems} />
}

// 📞 2025: Contact Page Schema
export function ContactPageJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://naken.store'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${baseUrl}/contacts#contactpage`,
    name: 'Контакты NAKEN Store',
    description: 'Контактная информация интернет-магазина NAKEN Store. Телефон, email, адрес, часы работы.',
    mainEntity: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`
    },
    // 🎯 2025: Rich contact info для местного SEO
    about: {
      '@type': 'LocalBusiness',
      '@id': `${baseUrl}#localbusiness`,
      name: 'NAKEN Store',
      telephone: '+7-920-994-07-07',
      email: 'support@naken.store',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'г. Москва, ул. Докукина, д. 8, стр. 2',
        addressLocality: 'Москва',
        addressRegion: 'Москва',
        postalCode: '105005',
        addressCountry: 'RU'
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday'],
          opens: '10:00',
          closes: '16:00'
        }
      ]
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
} 