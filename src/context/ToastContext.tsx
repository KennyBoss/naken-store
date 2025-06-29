'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import Toast from '@/components/Toast'

interface ToastData {
  id: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastData['type'], duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((
    message: string, 
    type: ToastData['type'] = 'info', 
    duration = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastData = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
  }, [])

  const success = useCallback((message: string) => {
    showToast(message, 'success')
  }, [showToast])

  const error = useCallback((message: string) => {
    showToast(message, 'error')
  }, [showToast])

  const info = useCallback((message: string) => {
    showToast(message, 'info')
  }, [showToast])

  const warning = useCallback((message: string) => {
    showToast(message, 'warning')
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      
      {/* Render Toasts */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-4 z-50 space-y-3 pointer-events-none">
        <div className="flex flex-col items-center sm:items-end space-y-3">
          {toasts.map((toast, index) => (
            <div 
              key={toast.id}
              className="w-full sm:w-auto pointer-events-auto"
              style={{ 
                transform: `translateY(${index * 5}px)`,
                zIndex: 1000 - index,
                animationDelay: `${index * 100}ms`
              }}
            >
              <Toast
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
} 