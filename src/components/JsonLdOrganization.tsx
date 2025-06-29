'use client'

interface JsonLdOrganizationProps {
  baseUrl?: string
}

export default function JsonLdOrganization({ baseUrl = 'https://naken.store' }: JsonLdOrganizationProps) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization", 
    "name": "NAKEN Store",
    "alternateName": "NAKEN",
    "description": "Интернет-магазин стильной одежды NAKEN - современная мода для активных людей. Качественная одежда, актуальные тренды, доступные цены.",
    "url": baseUrl,
    "logo": `${baseUrl}/android-chrome-512x512.png`,
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RU",
      "addressLocality": "Россия"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Russian"],
      "email": "info@naken.store"
    },
    "knowsAbout": [
      "Женская мода",
      "Мужская мода", 
      "Стильная одежда",
      "Современные тренды",
      "Casual стиль",
      "Деловая одежда",
      "Повседневная одежда"
    ],
    "serviceArea": {
      "@type": "Country",
      "name": "Россия"
    },
    "currenciesAccepted": "RUB",
    "slogan": "Стиль для каждого дня"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  )
}