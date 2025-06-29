'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FeaturedProducts from '@/components/FeaturedProducts'
import FashionFAQ from '@/components/FashionFAQ'

export default function Home() {
  // 🚀 LCP КРИТИЧНО: убираем лишние состояния и задержки!

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FeaturedProducts />
      
      {/* GEO: FAQ для ответов ИИ на fashion-запросы */}
      <div className="container mx-auto px-4 py-12">
        <FashionFAQ category="general" />
      </div>
    </main>
  )
}
