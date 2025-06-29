'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Bot } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Message {
  id: string
  content: string
  senderType: 'USER' | 'ADMIN' | 'SYSTEM' | 'MANAGER'
  senderName?: string
  createdAt: string
  isRead: boolean
  sender?: {
    id: string
    name: string
    image?: string
  }
}

interface ChatSession {
  sessionId: string
  status: string
  subject?: string
  messages: Message[]
}

export default function OnlineChat() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Скролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Инициализация чата
  const initChat = async (initialMessage?: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Вопрос по магазину',
          message: initialMessage,
          clientInfo: {
            url: window.location.href,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const sessionData = { sessionId: data.sessionId, status: 'ACTIVE', messages: [] }
        setChatSession(sessionData)
        localStorage.setItem('nakenChatSession', JSON.stringify(sessionData))
        await loadMessages(data.sessionId)
      }
    } catch (error) {
      console.error('Ошибка инициализации чата:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Загрузка сообщений
  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`)
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages)
        
        // Отмечаем сообщения как прочитанные
        const unreadMessages = data.messages.filter((msg: Message) => 
          !msg.isRead && msg.senderType !== 'USER'
        )
        
        if (unreadMessages.length > 0) {
          await markAsRead(sessionId, unreadMessages.map((msg: Message) => msg.id))
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    }
  }

  // Отправка сообщения
  const sendMessage = async () => {
    if (!currentMessage.trim() || !chatSession) return

    const messageText = currentMessage.trim()
    setCurrentMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: chatSession.sessionId,
          content: messageText,
          messageType: 'TEXT'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessages(prev => [...prev, data.message])
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
    } finally {
      setIsTyping(false)
    }
  }

  // Отметка как прочитанные
  const markAsRead = async (sessionId: string, messageIds: string[]) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messageIds })
      })
    } catch (error) {
      console.error('Ошибка отметки прочтения:', error)
    }
  }

  // Открытие чата
  const openChat = () => {
    setIsOpen(true)
    setHasNewMessages(false)
    
    // Проверяем сохраненную сессию
    const savedSession = localStorage.getItem('nakenChatSession')
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession)
        setChatSession(sessionData)
        loadMessages(sessionData.sessionId)
      } catch (error) {
        console.error('Ошибка восстановления сессии:', error)
        localStorage.removeItem('nakenChatSession')
      }
    }
  }

  // Закрытие чата
  const closeChat = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  // Начать новый чат
  const startNewChat = () => {
    setChatSession(null)
    setMessages([])
    localStorage.removeItem('nakenChatSession')
    initChat('Здравствуйте! У меня есть вопрос.')
  }

  // Обработка нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Polling для новых сообщений (в реальном проекте лучше использовать WebSocket)
  useEffect(() => {
    if (!chatSession) return

    const interval = setInterval(async () => {
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        const response = await fetch(
          `/api/chat/messages?sessionId=${chatSession.sessionId}&lastMessageId=${lastMessage.id}`
        )
        const data = await response.json()
        
        if (data.success && data.messages.length > 0) {
          setMessages(prev => [...prev, ...data.messages])
          if (!isOpen) {
            setHasNewMessages(true)
          }
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [chatSession, messages, isOpen])

  // Форматирование времени
  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ru 
    })
  }

  return (
    <>
      {/* Кнопка чата */}
      {!isOpen && (
        <button
          onClick={openChat}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
            hasNewMessages ? 'animate-bounce' : ''
          }`}
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {hasNewMessages && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </button>
      )}

      {/* Окно чата */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          
          {/* Заголовок чата */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-medium">NAKEN Support</h3>
                <p className="text-xs text-teal-100">Обычно отвечаем в течение часа</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={closeChat}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Сообщения */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {!chatSession ? (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Здравствуйте! Как дела с вашим заказом? Есть вопросы?
                    </p>
                    <button
                      onClick={startNewChat}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Подключаем...' : 'Начать чат'}
                    </button>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl p-3 ${
                          message.senderType === 'USER'
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                            : message.senderType === 'SYSTEM'
                            ? 'bg-gray-100 text-gray-600 text-center text-sm'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          
                          {message.senderType !== 'USER' && message.senderType !== 'SYSTEM' && (
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4" />
                              <span className="text-xs font-medium">
                                {message.senderName || 'Поддержка'}
                              </span>
                            </div>
                          )}
                          
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          
                          <p className={`text-xs mt-1 ${
                            message.senderType === 'USER' ? 'text-teal-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl p-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Поле ввода */}
              {chatSession && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Напишите сообщение..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!currentMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Работаем пн-пт 9:00-18:00, сб 10:00-16:00
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
} 