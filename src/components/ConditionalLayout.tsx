'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Скрываем navbar и footer на intro странице
  const hideNavAndFooter = pathname === '/intro'
  
  if (hideNavAndFooter) {
    return <>{children}</>
  }
  
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
} 