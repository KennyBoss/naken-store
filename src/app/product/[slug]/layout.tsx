import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { formatPrice, generateSEODescription, generateProductKeywords } from '@/lib/utils'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'

interface ProductLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const product = await prisma.product.findUnique({
      where: { slug, published: true },
      include: { 
        reviews: true,
        sizes: {
          include: {
            size: true
          }
        },
        color: true
      }
    })

    if (!product) {
      return { title: 'Товар не найден | NAKEN Store' }
    }

    let images: string[] = []
    try {
      images = Array.isArray(product.images) ? product.images : JSON.parse(product.images as string || '[]')
    } catch (e) {
      images = []
    }

    const price = product.salePrice || product.price

    // Собираем данные для SEO-оптимизации
    const sizes = product.sizes?.map(ps => ps.size.name) || []
    const colors = product.color ? [product.color.name] : []
    
    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice,
      sizes,
      colors,
      category: 'одежда', // TODO: добавить категории в БД
      brand: 'NAKEN'
    }

    // Генерируем SEO-оптимизированное описание
    const seoDescription = generateSEODescription(productData)
    
    // Генерируем ключевые слова
    const keywords = generateProductKeywords({
      name: product.name,
      category: 'одежда',
      brand: 'NAKEN',
      sizes,
      colors,
      price: product.price
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://naken.store'
    const productUrl = `${baseUrl}/product/${product.slug}`
    const imageUrl = images.length > 0 
      ? (images[0].startsWith('http') ? images[0] : `${baseUrl}${images[0]}`)
      : `${baseUrl}/placeholder.png`

    // 🚀 Используем SEO-оптимизированный title или генерируем автоматически
    const optimizedTitle = product.seoTitle || (() => {
      const titleParts = [product.name]
      if (sizes.length > 0) {
        titleParts.push(`размеры ${sizes.slice(0, 3).join(', ')}`)
      }
      return `${titleParts.join(' | ')} | NAKEN Store`
    })()

    return {
      title: optimizedTitle.length > 60 ? `${product.name} | NAKEN Store` : optimizedTitle,
      description: seoDescription,
      keywords,
              openGraph: {
          title: `${product.name} | NAKEN Store`,
          description: seoDescription,
          url: productUrl,
          siteName: 'NAKEN Store',
          images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
          type: 'website',
          locale: 'ru_RU'
        },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | NAKEN Store`,
        description: seoDescription,
        images: [imageUrl],
      },
      alternates: {
        canonical: productUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    console.error('Ошибка генерации метаданных товара:', error)
    return { title: 'Ошибка загрузки товара | NAKEN Store' }
  }
}

export default async function ProductLayout({ children, params: paramsPromise }: ProductLayoutProps) {
  const { slug } = await paramsPromise;
  const product = await prisma.product.findUnique({
    where: { slug: slug },
    include: {
      reviews: true
    }
  })

  if (!product) return <>{children}</>

  // Данные для хлебных крошек
  const breadcrumbItems = [
    { name: 'Главная', url: process.env.NEXT_PUBLIC_BASE_URL || 'https://naken.store' },
    { name: 'Каталог', url: `${process.env.NEXT_PUBLIC_BASE_URL}/catalog` },
    { name: product.name, url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${product.slug}` }
  ]

  // Преобразование product для ProductJsonLd
  const productForLd = {
    ...product,
    images: product.images ? JSON.parse(product.images as string) : [],
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    description: product.description || "",
    salePrice: product.salePrice,
    slug: product.slug || ""
  }

  return (
    <>
      <ProductJsonLd product={productForLd} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  )
} 