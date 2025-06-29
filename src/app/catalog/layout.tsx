import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Каталог одежды - NAKEN Store | Стильная одежда онлайн",
  description: "Каталог стильной одежды NAKEN Store. Мужская и женская одежда высокого качества. Бесплатная доставка от 3000₽. Скидки до 50%. Примерка при получении.",
  keywords: "каталог одежды, мужская одежда, женская одежда, стильная одежда, NAKEN Store, интернет-магазин одежды, скидки на одежду, качественная одежда",
  openGraph: {
    title: "Каталог одежды - NAKEN Store",
    description: "Широкий выбор стильной одежды. Мужская и женская одежда высокого качества с доставкой по России.",
    url: "/catalog",
    siteName: "NAKEN Store",
    type: "website",
    images: [
      {
        url: "/og-catalog.jpg",
        width: 1200,
        height: 630,
        alt: "Каталог одежды NAKEN Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Каталог одежды - NAKEN Store",
    description: "Широкий выбор стильной одежды. Мужская и женская одежда высокого качества с доставкой по России.",
    images: ["/og-catalog.jpg"],
  },
  alternates: {
    canonical: "/catalog",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 