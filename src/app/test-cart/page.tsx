'use client'

import { useCart } from '@/context/CartContext'
import { useEffect } from 'react'

export default function TestCartPage() {
  const { items, addToCart } = useCart()

  useEffect(() => {
    console.log('Current cart items:', items)
  }, [items])

  const handleTestAdd = async () => {
    try {
      await addToCart({
        productId: 'cmc1zdhtp0001rr4qybmcqon2',
        quantity: 1,
        sizeId: 'cmc1xt1jy0002rrqauzd933wu'
      })
      console.log('Successfully added to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Cart</h1>
      <button 
        onClick={handleTestAdd}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Add to Cart
      </button>
      
      <div className="mt-4">
        <h2 className="text-xl mb-2">Cart Items:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(items, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4">
        <h2 className="text-xl mb-2">LocalStorage:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {typeof window !== 'undefined' ? localStorage.getItem('cart') : 'Loading...'}
        </pre>
      </div>
    </div>
  )
} 