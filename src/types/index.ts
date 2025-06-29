// Импорты из Prisma
import type {
  User,
  Product,
  CartItem,
  Order,
  OrderItem,
  Address,
  Review,
  WishlistItem,
  Role,
  OrderStatus,
} from '@prisma/client'

// Временно определяем PaymentStatus пока Prisma Client не обновился
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID', 
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

// Временные типы до обновления Prisma Client
export type Size = {
  id: string
  name: string
  russianSize: string
  createdAt: Date
}

export type Color = {
  id: string
  name: string
  hexCode: string
  createdAt: Date
}

export type ProductSize = {
  id: string
  productId: string
  sizeId: string
  stock: number
  size?: Size
}

// Re-export для удобства
export type {
  User,
  Product,
  CartItem,
  Order,
  OrderItem,
  Address,
  Review,
  WishlistItem,
  Role,
  OrderStatus,
}

// Дополнительные типы для UI
export type ProductWithSizeColor = Product & {
  sizes: (ProductSize & { size: Size })[]
  color: Color | null
  slug: string
}

export type CartItemWithProduct = {
  id: string
  quantity: number
  sizeId?: string
  product: ProductWithSizeColor
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
  })[]
  shippingAddress: Address | null
}

// Расширенный тип заказа с полной информацией для админки
export type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: Product
  })[]
  shippingAddress: Address | null
  user: User | null
  paymentStatus: PaymentStatus
  paymentId: string | null
  paymentMethod: string | null
  paymentData: string | null
}

// Типы для форм
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AddToCartData {
  productId: string
  quantity: number
  sizeId?: string
}

export interface CheckoutForm {
  addressId: string
  shippingMethod: 'standard' | 'express'
  paymentMethod: 'card' | 'paypal'
}

// API Response типы
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Фильтры и поиск
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  size?: string
  color?: string
  search?: string
  sort?: 'price-asc' | 'price-desc' | 'name' | 'created'
}

// Analytics типы
export interface SalesData {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  id: string
  name: string
  sales: number
  revenue: number
} 