'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { WishlistItem, Product } from '@/types'

export interface WishlistItemWithProduct extends Omit<WishlistItem, 'product'> {
  product: Product
}

interface WishlistState {
  items: WishlistItemWithProduct[]
  isLoading: boolean
}

type WishlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: WishlistItemWithProduct[] }
  | { type: 'ADD_ITEM'; payload: WishlistItemWithProduct }
  | { type: 'REMOVE_ITEM'; payload: string } // productId

const initialState: WishlistState = {
  items: [],
  isLoading: false
}

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ITEMS':
      return { ...state, items: action.payload }
    
    case 'ADD_ITEM':
      const existingIndex = state.items.findIndex(item => item.productId === action.payload.productId)
      if (existingIndex >= 0) {
        // Товар уже в избранном
        return state
      }
      return { ...state, items: [action.payload, ...state.items] }
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.productId !== action.payload)
      return { ...state, items: filteredItems }
    
    default:
      return state
  }
}

interface WishlistContextType extends WishlistState {
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  loadWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState)

  // Сохранение в localStorage
  const saveToLocalStorage = (items: WishlistItemWithProduct[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(items))
    }
  }

  // Загрузка избранного
  const loadWishlist = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Сначала проверяем localStorage (быстрее)
      if (typeof window !== 'undefined') {
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedWishlist) {
          try {
            const wishlistItems = JSON.parse(savedWishlist)
            dispatch({ type: 'SET_ITEMS', payload: wishlistItems })
          } catch (e) {
            console.error('Ошибка парсинга избранного из localStorage:', e)
            localStorage.removeItem('wishlist')
          }
        }
      }
      
      // Затем пытаемся загрузить из API (для авторизованных)
      try {
        const response = await fetch('/api/wishlist')
        if (response.ok) {
          const data = await response.json()
          if (data.items && data.items.length > 0) {
            dispatch({ type: 'SET_ITEMS', payload: data.items })
          }
        }
        // Для 401 ошибок не выводим в консоль - это нормально для неавторизованных
      } catch (apiError) {
        // Игнорируем ошибки API - используем localStorage
      }
      
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Добавление в избранное
  const addToWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      
      if (response.ok) {
        const result = await response.json()
        dispatch({ type: 'ADD_ITEM', payload: result.item })
      } else if (response.status === 401) {
        // Неавторизованный пользователь - сохраняем в localStorage
        // Получаем данные товара
        const productResponse = await fetch(`/api/products/${productId}`)
        if (productResponse.ok) {
          const productData = await productResponse.json()
          const wishlistItem: WishlistItemWithProduct = {
            id: `temp-${Date.now()}`,
            productId,
            userId: 'guest',
            createdAt: new Date(),
            product: productData.product
          }
          
          dispatch({ type: 'ADD_ITEM', payload: wishlistItem })
          
          // Сохраняем в localStorage
          const updatedItems = [...state.items, wishlistItem]
          saveToLocalStorage(updatedItems)
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка добавления в избранное')
      }
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error)
      throw error
    }
  }

  // Удаление из избранного
  const removeFromWishlist = async (productId: string) => {
    try {
      // Проверяем, это временный элемент (localStorage) или реальный ID из БД
      const item = state.items.find(item => item.productId === productId)
      
      if (item?.id.startsWith('temp-')) {
        // Для localStorage - удаляем локально
        dispatch({ type: 'REMOVE_ITEM', payload: productId })
        
        // Обновляем localStorage
        const updatedItems = state.items.filter(item => item.productId !== productId)
        saveToLocalStorage(updatedItems)
      } else {
        // Для авторизованных пользователей - отправляем в API
        const response = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
        if (response.ok) {
          dispatch({ type: 'REMOVE_ITEM', payload: productId })
        } else {
          throw new Error('Ошибка удаления из избранного')
        }
      }
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error)
      throw error
    }
  }

  // Проверка наличия товара в избранном
  const isInWishlist = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId)
  }

  // Загрузка избранного при монтировании
  useEffect(() => {
    loadWishlist()
  }, [])
  
  // Автоматическое сохранение в localStorage при изменении избранного
  useEffect(() => {
    if (state.items.some(item => item.id.startsWith('temp-'))) {
      // Сохраняем только если есть временные элементы (неавторизованный пользователь)
      saveToLocalStorage(state.items.filter(item => item.id.startsWith('temp-')))
    }
  }, [state.items])

  const value: WishlistContextType = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loadWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
} 