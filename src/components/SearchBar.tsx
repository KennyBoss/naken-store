'use client'

import { useState, useEffect } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchResults, setSearchResults] = useState<string[]>([])

  // Умный поиск с debounce
  useEffect(() => {
    if (searchQuery.length > 0) {
      const timeoutId = setTimeout(() => {
        performSmartSearch(searchQuery)
      }, 300) // 300ms задержка для debounce
      
      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const performSmartSearch = (query: string) => {
    // Мок данные для умного поиска
    const mockResults = [
      'Черная куртка зимняя',
      'Белая рубашка классическая', 
      'Синие джинсы slim fit',
      'Красное платье вечернее',
      'Серый свитер оверсайз',
      'Черные брюки классические',
      'Кроссовки белые',
      'Пальто шерстяное'
    ].filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
    
    setSearchResults(mockResults)
    console.log('Умный поиск:', query, mockResults)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsExpanded(false)
  }

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative">
          {/* Основная строка поиска */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-6 w-6 text-gray-400" />
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
              placeholder="Начните вводить для поиска товаров..."
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Умные результаты поиска */}
          {(isExpanded || searchResults.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  <div className="text-xs text-gray-500 px-3 py-2 font-medium">Найденные товары:</div>
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSearchQuery(result)
                        setIsExpanded(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <SearchIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{result}</span>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length === 0 && (
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm text-gray-500 font-medium">Популярные запросы:</span>
                    {['Джинсы', 'Рубашки', 'Платья', 'Куртки', 'Кроссовки'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500 font-medium">Категории:</span>
                    {['Мужская одежда', 'Женская одежда', 'Обувь', 'Аксессуары'].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSearchQuery(category)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-full text-sm text-blue-700 transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 