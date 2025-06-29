'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  MessageCircle, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Send,
  Minimize2,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ChatSession {
  id: string
  sessionId: string
  status: 'ACTIVE' | 'CLOSED' | 'WAITING' | 'TRANSFERRED'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  subject?: string
  createdAt: string
  lastActivity: string
  user?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  assignedUser?: {
    id: string
    name: string
  }
  messages: Array<{
    id: string
    content: string
    senderType: string
    senderName?: string
    createdAt: string
  }>
  _count: {
    messages: number
  }
}

export default function AdminChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentMessage, setCurrentMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin-login')
      return
    }
    
    if (session?.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    loadChatSessions()
  }, [status, session, router, statusFilter])

  const loadChatSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/chat?status=${statusFilter}&limit=50`)
      const data = await response.json()
      
      if (data.success) {
        setChatSessions(data.sessions)
      }
    } catch (error) {
      console.error('Ошибка загрузки чат-сессий:', error)
    } finally {
      setLoading(false)
    }
  }

  const assignChatToSelf = async (sessionId: string) => {
    try {
      const response = await fetch('/api/admin/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'assign',
          assignedTo: session?.user?.id
        })
      })

      if (response.ok) {
        loadChatSessions()
        if (selectedChat?.sessionId === sessionId) {
          setSelectedChat(prev => prev ? {...prev, assignedUser: { id: session!.user!.id, name: session!.user!.name || 'Админ' }} : null)
        }
      }
    } catch (error) {
      console.error('Ошибка назначения чата:', error)
    }
  }

  const changeChatStatus = async (sessionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status: newStatus
        })
      })

      if (response.ok) {
        loadChatSessions()
        if (selectedChat?.sessionId === sessionId) {
          setSelectedChat(prev => prev ? {...prev, status: newStatus as any} : null)
        }
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || !selectedChat) return

    setSendingMessage(true)
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedChat.sessionId,
          content: currentMessage.trim(),
          messageType: 'TEXT'
        })
      })

      if (response.ok) {
        setCurrentMessage('')
        // Перезагружаем сообщения для выбранного чата
        await loadChatDetails(selectedChat.sessionId)
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const loadChatDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/session?sessionId=${sessionId}`)
      const data = await response.json()
      
      if (data.success) {
        setSelectedChat(data.session)
      }
    } catch (error) {
      console.error('Ошибка загрузки деталей чата:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'CLOSED':
        return <XCircle className="w-4 h-4 text-gray-500" />
      case 'WAITING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <MessageCircle className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Управление чатами</h1>
                <p className="text-gray-600">Все обращения пользователей</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="ALL">Все статусы</option>
                  <option value="ACTIVE">Активные</option>
                  <option value="WAITING">Ожидающие</option>
                  <option value="CLOSED">Закрытые</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Список чатов */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">
                  Активные чаты ({chatSessions.length})
                </h2>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                {chatSessions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Нет активных чатов</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {chatSessions.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => loadChatDetails(chat.sessionId)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedChat?.sessionId === chat.sessionId ? 'bg-teal-50 border-r-4 border-teal-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(chat.status)}
                              <span className="font-medium text-sm">
                                {chat.user?.name || 'Анонимный пользователь'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(chat.priority)}`}>
                                {chat.priority}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-1">
                              {chat.subject || 'Общий вопрос'}
                            </p>
                            
                            {chat.messages.length > 0 && (
                              <p className="text-xs text-gray-500 truncate">
                                {chat.messages[0].content}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(chat.lastActivity), { addSuffix: true, locale: ru })}
                              </span>
                              <span className="text-xs text-gray-400">
                                {chat._count.messages} сообщений
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Детали чата */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
                
                {/* Заголовок чата */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedChat.user?.name || 'Анонимный пользователь'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedChat.user?.phone || selectedChat.user?.email || 'Контакт не указан'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!selectedChat.assignedUser && (
                        <button
                          onClick={() => assignChatToSelf(selectedChat.sessionId)}
                          className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
                        >
                          Взять в работу
                        </button>
                      )}
                      
                      {selectedChat.status === 'ACTIVE' && (
                        <button
                          onClick={() => changeChatStatus(selectedChat.sessionId, 'CLOSED')}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                          Закрыть чат
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Сообщения */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        message.senderType === 'ADMIN'
                          ? 'bg-teal-600 text-white'
                          : message.senderType === 'SYSTEM'
                          ? 'bg-gray-100 text-gray-600 text-center text-sm'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        
                        {message.senderType !== 'ADMIN' && message.senderType !== 'SYSTEM' && (
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              {message.senderName || 'Пользователь'}
                            </span>
                          </div>
                        )}
                        
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        <p className={`text-xs mt-1 ${
                          message.senderType === 'ADMIN' ? 'text-teal-100' : 'text-gray-500'
                        }`}>
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: ru })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Поле ввода */}
                {selectedChat.status === 'ACTIVE' && (
                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ответить клиенту..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        disabled={sendingMessage}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!currentMessage.trim() || sendingMessage}
                        className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Выберите чат для просмотра</p>
                  <p className="text-sm">Кликните на чат в списке слева</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 