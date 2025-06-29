'use client'

import { useEffect, useRef, useState } from 'react'
import Masonry from 'masonry-layout'

interface MasonryGridProps {
  children: React.ReactNode[]
  className?: string
  columnWidth?: number
  gap?: number
}

export default function MasonryGrid({ 
  children, 
  className = '', 
  columnWidth = 300, 
  gap = 16 
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(1)
  const masonryInstance = useRef<Masonry | null>(null)
  const resizeObserver = useRef<ResizeObserver | null>(null)

  const calculateColumns = () => {
    if (!containerRef.current) return 1
    
    const containerWidth = containerRef.current.clientWidth
    const cols = Math.floor((containerWidth + gap) / (columnWidth + gap))
    return Math.max(1, cols)
  }

  useEffect(() => {
    const updateColumns = () => {
      const newColumns = calculateColumns()
      if (newColumns !== columns) {
        setColumns(newColumns)
      }
    }

    updateColumns()

    // Создаем ResizeObserver для отслеживания изменений размера
    resizeObserver.current = new ResizeObserver((entries) => updateColumns())
    
    if (containerRef.current) {
      resizeObserver.current.observe(containerRef.current)
    }

    // Слушаем изменения размера окна
    window.addEventListener('resize', updateColumns)

    return () => {
      window.removeEventListener('resize', updateColumns)
      if (resizeObserver.current) {
        resizeObserver.current.disconnect()
      }
    }
  }, [columns, columnWidth, gap])

  // Распределяем элементы по колонкам
  const distributeItems = () => {
    const cols: React.ReactNode[][] = Array.from({ length: columns }, () => [])
    const heights = new Array(columns).fill(0)

    children.forEach((child, index) => {
      // Находим колонку с минимальной высотой
      const shortestColIndex = heights.indexOf(Math.min(...heights))
      
      cols[shortestColIndex].push(
        <div key={index} style={{ marginBottom: gap }}>
          {child}
        </div>
      )
      
      // Примерная высота (будет корректироваться браузером)
      heights[shortestColIndex] += 300 + gap
    })

    return cols
  }

  const columnElements = distributeItems()

  return (
    <div ref={containerRef} className={`flex ${className}`} style={{ gap }}>
      {columnElements.map((column, index) => (
        <div
          key={index}
          className="flex-1"
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            minWidth: 0 // Предотвращает переполнение
          }}
        >
          {column}
        </div>
      ))}
    </div>
  )
} 