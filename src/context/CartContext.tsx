'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { CartItemWithProduct, AddToCartData } from '@/types'

interface CartState {
  items: CartItemWithProduct[]
  total: number
  itemCount: number
  isLoading: boolean
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: CartItemWithProduct[] }
  | { type: 'ADD_ITEM'; payload: CartItemWithProduct }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ITEMS':
      const items = action.payload
      const total = items.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price
        return sum + (price * item.quantity)
      }, 0)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
      return { ...state, items, total, itemCount }
    
    case 'ADD_ITEM':
      const newItem = action.payload
      const existingIndex = state.items.findIndex(
        item => item.product.id === newItem.product.id && 
               item.sizeId === newItem.sizeId
      )
      
      let updatedItems: CartItemWithProduct[]
      if (existingIndex >= 0) {
        updatedItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        updatedItems = [...state.items, newItem]
      }
      
      const newTotal = updatedItems.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price
        return sum + (price * item.quantity)
      }, 0)
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return { ...state, items: updatedItems, total: newTotal, itemCount: newItemCount }
    
    case 'UPDATE_QUANTITY':
      const { id, quantity } = action.payload
      const itemsAfterUpdate = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      const totalAfterUpdate = itemsAfterUpdate.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price
        return sum + (price * item.quantity)
      }, 0)
      const countAfterUpdate = itemsAfterUpdate.reduce((sum, item) => sum + item.quantity, 0)
      
      return { ...state, items: itemsAfterUpdate, total: totalAfterUpdate, itemCount: countAfterUpdate }
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload)
      const totalAfterRemove = filteredItems.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price
        return sum + (price * item.quantity)
      }, 0)
      const countAfterRemove = filteredItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return { ...state, items: filteredItems, total: totalAfterRemove, itemCount: countAfterRemove }
    
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0, itemCount: 0 }
    
    default:
      return state
  }
}

interface CartContextType extends CartState {
  addToCart: (data: AddToCartData) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  loadCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Загрузка корзины
  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Сначала пытаемся загрузить из API (для авторизованных)
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items.length > 0) {
          dispatch({ type: 'SET_ITEMS', payload: data.items })
          return
        }
      }
      
      // Если API вернул пустую корзину, проверяем localStorage
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          try {
            const cartItems = JSON.parse(savedCart)
            console.log('Загружена корзина из localStorage:', cartItems)
            dispatch({ type: 'SET_ITEMS', payload: cartItems })
          } catch (e) {
            console.error('Ошибка парсинга корзины из localStorage:', e)
            localStorage.removeItem('cart')
          }
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error)
      
      // Fallback к localStorage при ошибке API
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          try {
            const cartItems = JSON.parse(savedCart)
            dispatch({ type: 'SET_ITEMS', payload: cartItems })
          } catch (e) {
            localStorage.removeItem('cart')
          }
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Сохранение в localStorage
  const saveToLocalStorage = (items: CartItemWithProduct[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }

  // Функция для отслеживания добавления в корзину
  const trackAddToCart = (product: any, quantity: number, sizeId?: string) => {
    // JavaScript-событие для цели
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(102911798, 'reachGoal', 'ADD_TO_CART', {
        productId: product.id,
        productName: product.name,
        price: product.salePrice || product.price,
        quantity: quantity,
        sizeId: sizeId
      })

      // E-commerce событие
      window.ym(102911798, 'ecommerce', 'add', {
        purchase: {
          products: [{
            id: product.id,
            name: product.name,
            category: 'Одежда', // Статическая категория, пока нет в схеме
            price: product.salePrice || product.price,
            quantity: quantity
          }]
        }
      })

      console.log('🎯 Отслежено добавление в корзину:', {
        productName: product.name,
        price: product.salePrice || product.price,
        quantity
      })
    }
  }

  // Функция для отслеживания удаления из корзины
  const trackRemoveFromCart = (product: any, quantity: number) => {
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(102911798, 'reachGoal', 'REMOVE_FROM_CART', {
        productId: product.id,
        productName: product.name,
        quantity: quantity
      })

      // E-commerce событие
      window.ym(102911798, 'ecommerce', 'remove', {
        purchase: {
          products: [{
            id: product.id,
            name: product.name,
            category: 'Одежда', // Статическая категория, пока нет в схеме
            price: product.salePrice || product.price,
            quantity: quantity
          }]
        }
      })
    }
  }

  // Добавление в корзину
  const addToCart = async (data: AddToCartData) => {
    console.log('🛒 addToCart вызван с данными:', data)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      console.log('📥 Ответ от API:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Результат от API:', result)
        
        if (result.success && result.product) {
          // Для неавторизованных пользователей - добавляем в localStorage
          const newItem = {
            id: `temp-${Date.now()}`,
            product: result.product,
            quantity: data.quantity,
            sizeId: data.sizeId
          }
          
          // Отслеживаем добавление в корзину
          trackAddToCart(result.product, data.quantity, data.sizeId)
          
          // Добавляем в Redux state (автоматически сохранится в localStorage через useEffect)
          dispatch({ type: 'ADD_ITEM', payload: newItem })
        } else {
          // Для авторизованных пользователей - элемент уже в БД
          // Получаем данные товара для аналитики
          if (result.product) {
            trackAddToCart(result.product, data.quantity, data.sizeId)
          }
          dispatch({ type: 'ADD_ITEM', payload: result })
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Ошибка от API:', errorText)
        throw new Error('Ошибка добавления в корзину')
      }
    } catch (error) {
      console.error('❌ Ошибка добавления в корзину:', error)
      throw error
    }
  }

  // Обновление количества
  const updateQuantity = async (id: string, quantity: number) => {
    try {
      // Проверяем, это временный ID (localStorage) или реальный ID из БД
      if (id.startsWith('temp-')) {
        // Для localStorage - обновляем локально
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
        
        // Обновляем localStorage
        const updatedItems = state.items.map(item => 
          item.id === id ? { ...item, quantity } : item
        )
        saveToLocalStorage(updatedItems)
      } else {
        // Для авторизованных пользователей - отправляем в API
        const response = await fetch(`/api/cart/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        })
        
        if (response.ok) {
          dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
        } else {
          throw new Error('Ошибка обновления количества')
        }
      }
    } catch (error) {
      console.error('Ошибка обновления количества:', error)
    }
  }

  // Удаление из корзины
  const removeFromCart = async (id: string) => {
    try {
      // Находим товар для аналитики перед удалением
      const itemToRemove = state.items.find(item => item.id === id)
      
      // Проверяем, это временный ID (localStorage) или реальный ID из БД
      if (id.startsWith('temp-')) {
        // Для localStorage - удаляем локально
        dispatch({ type: 'REMOVE_ITEM', payload: id })
        
        // Обновляем localStorage
        const updatedItems = state.items.filter(item => item.id !== id)
        saveToLocalStorage(updatedItems)
      } else {
        // Для авторизованных пользователей - отправляем в API
        const response = await fetch(`/api/cart/${id}`, { method: 'DELETE' })
        if (response.ok) {
          dispatch({ type: 'REMOVE_ITEM', payload: id })
        } else {
          throw new Error('Ошибка удаления из корзины')
        }
      }

      // Отслеживаем удаление из корзины
      if (itemToRemove?.product) {
        trackRemoveFromCart(itemToRemove.product, itemToRemove.quantity)
      }
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error)
    }
  }

  // Очистка корзины
  const clearCart = async () => {
    try {
      // Всегда очищаем локальное состояние
      dispatch({ type: 'CLEAR_CART' })
      
      // Очищаем localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart')
      }
      
      // Для авторизованных пользователей также очищаем БД
      try {
        const response = await fetch('/api/cart', { method: 'DELETE' })
        if (!response.ok) {
          console.warn('Не удалось очистить корзину на сервере')
        }
      } catch (apiError) {
        console.warn('Ошибка очистки корзины на сервере:', apiError)
      }
    } catch (error) {
      console.error('Ошибка очистки корзины:', error)
    }
  }

  // Загрузка корзины при монтировании
  useEffect(() => {
    loadCart()
  }, [])
  
  // Автоматическое сохранение в localStorage при изменении корзины
  useEffect(() => {
    if (state.items.some(item => item.id.startsWith('temp-'))) {
      // Сохраняем только если есть временные элементы (неавторизованный пользователь)
      const itemsToSave = state.items.filter(item => item.id.startsWith('temp-'))
      saveToLocalStorage(itemsToSave)
    }
  }, [state.items])

  const value: CartContextType = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 