import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Контакты - NAKEN Store | Связаться с нами",
  description: "Контактная информация интернет-магазина NAKEN Store. Телефон: +7 (920) 994-07-07, email: support@naken.store. Адрес: Москва, ул. Докукина, д. 8, стр. 2. Время работы: ежедневно 9:00-21:00.",
  keywords: "контакты NAKEN Store, служба поддержки, адрес магазина, телефон поддержки, email поддержки, обратная связь",
  openGraph: {
    title: "Контакты - NAKEN Store",
    description: "Свяжитесь с нами любым удобным способом. Телефон, email, адрес офиса в Москве. Время работы: ежедневно 9:00-21:00.",
    url: "/contacts",
    siteName: "NAKEN Store",
    type: "website",
    images: [
      {
        url: "/og-contacts.jpg",
        width: 1200,
        height: 630,
        alt: "Контакты NAKEN Store",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Контакты - NAKEN Store",
    description: "Свяжитесь с нами любым удобным способом. Телефон, email, адрес офиса в Москве.",
  },
  alternates: {
    canonical: "/contacts",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Структурированные данные для страницы контактов */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "@id": "https://naken.store/contacts#contactpage",
            "name": "Контакты NAKEN Store",
            "description": "Контактная информация интернет-магазина NAKEN Store. Телефон, email, адрес, часы работы.",
            "mainEntity": {
              "@id": "https://naken.store#organization"
            },
            "about": {
              "@type": "LocalBusiness",
              "@id": "https://naken.store#localbusiness",
              "name": "NAKEN Store",
              "telephone": "+7-920-994-07-07",
              "email": "support@naken.store",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "г. Москва, ул. Докукина, д. 8, стр. 2",
                "addressLocality": "Москва",
                "addressRegion": "Москва",
                "postalCode": "105005",
                "addressCountry": "RU"
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "https://schema.org/Monday",
                    "https://schema.org/Tuesday",
                    "https://schema.org/Wednesday",
                    "https://schema.org/Thursday",
                    "https://schema.org/Friday"
                  ],
                  "opens": "09:00",
                  "closes": "18:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["https://schema.org/Saturday"],
                  "opens": "10:00",
                  "closes": "16:00"
                }
              ]
            }
          })
        }}
      />
      {children}
    </>
  )
} 