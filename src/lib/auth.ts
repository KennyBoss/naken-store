import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { verifySMSCode } from '@/lib/sms'
import { verifyEmailCode } from '@/lib/email'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Включаем debug временно для диагностики сессии
  
  // Настройки для работы за proxy
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Автоматически связываем аккаунты с одинаковым email
  // ВНИМАНИЕ: это может быть небезопасно, но необходимо для работы Google OAuth
  // с существующими пользователями
  events: {
    async linkAccount({ user, account, profile }) {
      console.log('🔗 Аккаунт связан:', { user: user.email, provider: account.provider })
    }
  },
  
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Провайдер для входа по email + пароль
    CredentialsProvider({
      id: 'credentials-password',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🚀 ВЫЗВАН ПРОВАЙДЕР EMAIL+PASSWORD')
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const normalizedEmail = credentials.email.toLowerCase()

        // Ищем пользователя в БД
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        })
        
        if (!user) {
          console.log('❌ Пользователь не найден:', normalizedEmail)
          return null
        }

        // Проверяем пароль
        if (!user.password) {
          console.log('❌ У пользователя нет пароля')
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          console.log('❌ Неверный пароль для:', normalizedEmail)
          return null
        }
        
        console.log('✅ Пользователь успешно авторизован:', user.email)

        return {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role
        }
      }
    }),
    // Провайдер для входа по телефону + SMS  
    CredentialsProvider({
      id: 'phone',
      name: 'Phone',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        code: { label: 'Code', type: 'text' }
      },
      async authorize(credentials) {
        console.log('🚀 ВЫЗВАН ПРОВАЙДЕР PHONE')
        if (!credentials?.phone || !credentials?.code) {
          return null
        }

        // Проверяем SMS код
        const isValidCode = await verifySMSCode(credentials.phone, credentials.code)
        if (!isValidCode) {
          return null
        }

        // Нормализуем номер телефона
        let phone = credentials.phone.replace(/\D/g, '')
        if (phone.startsWith('8')) {
          phone = '7' + phone.substring(1)
        }
        if (phone.length === 10) {
          phone = '7' + phone
        }
        const normalizedPhone = '+' + phone

        // Ищем или создаем пользователя в БД
        const { prisma } = await import('@/lib/db')
        let user = await prisma.user.findUnique({
          where: { phone: normalizedPhone }
        })
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: normalizedPhone,
              role: 'USER'
            }
          })
          console.log(`👤 Создан новый пользователь: ${normalizedPhone}`)
        }

        return {
          id: user.id,
          phone: user.phone,
          email: user.email,
          role: user.role
        }
      }
    }),

    // Провайдер для входа по email + код
    CredentialsProvider({
      id: 'email',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' }
      },
      async authorize(credentials) {
        console.log('🚀 ВЫЗВАН ПРОВАЙДЕР EMAIL')
        if (!credentials?.email || !credentials?.code) {
          return null
        }

        // Проверяем email код
        const isValidCode = await verifyEmailCode(credentials.email, credentials.code)
        if (!isValidCode) {
          return null
        }

        const normalizedEmail = credentials.email.toLowerCase()

        // Ищем или создаем пользователя в БД
        const { prisma } = await import('@/lib/db')
        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        })
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              role: 'USER'
            }
          })
          console.log(`👤 Создан новый пользователь: ${normalizedEmail}`)
        }

        return {
          id: user.id,
          phone: user.phone,
          email: user.email,
          role: user.role
        }
      }
    }),

    // Провайдер для админа
    CredentialsProvider({
      id: 'credentials',
      name: 'Admin',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🚀 ВЫЗВАН ПРОВАЙДЕР CREDENTIALS (АДМИН)')
        console.log('📞 Телефон:', credentials?.phone)
        console.log('🔑 Пароль получен:', credentials?.password ? 'ДА' : 'НЕТ')
        
        if (!credentials?.phone || !credentials?.password) {
          console.log('❌ Нет телефона или пароля')
          return null
        }

        // Ищем админа в БД
        const { prisma } = await import('@/lib/db')
        const admin = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        })
        
        console.log('🔍 Попытка входа админа:', credentials.phone)
        
        // Если админа нет
        if (!admin) {
          console.log('❌ Админ не найден:', credentials.phone)
          return null
        }
        
        // Проверяем роль
        if (admin.role !== 'ADMIN') {
          console.log('❌ Пользователь не админ:', admin.role)
          return null
        }
        
        // Проверяем пароль
        if (!admin.password) {
          console.log('❌ У админа нет пароля в базе')
          return null
        }
        
        let isPasswordValid = false
        
        // Проверяем, хешированный ли пароль в базе
        if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
          // Хешированный пароль - используем bcrypt
          const bcrypt = await import('bcryptjs')
          isPasswordValid = await bcrypt.compare(credentials.password, admin.password)
          console.log('🔍 Проверка хешированного пароля')
        } else {
          // Обычный текстовый пароль - сравниваем напрямую
          isPasswordValid = credentials.password === admin.password
          console.log('🔍 Проверка текстового пароля')
        }
        
        if (!isPasswordValid) {
          console.log('❌ Неверный пароль для админа:', credentials.phone)
          console.log('❌ Введенный пароль:', credentials.password)
          console.log('❌ Пароль в базе:', admin.password.substring(0, 10) + '...')
          return null
        }
        
        console.log('✅ Админ успешно авторизован:', admin.phone)

        return {
          id: admin.id,
          phone: admin.phone,
          email: admin.email,
          role: admin.role
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    // Увеличиваем время жизни сессии
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.naken.store' : undefined
      }
    },
    state: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.state'
        : 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.naken.store' : undefined,
        maxAge: 900 // 15 минут
      }
    }
  },

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🔥 SignIn callback вызван:', { user, account, profile })
      
      // Если это Google OAuth
      if (account?.provider === 'google' && user.email) {
        try {
          // Проверяем, есть ли уже пользователь с таким email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true }
          })
          
          if (existingUser) {
            // Проверяем, есть ли уже связь с Google
            const googleAccount = existingUser.accounts.find(acc => acc.provider === 'google')
            
            if (!googleAccount) {
              // Связываем Google аккаунт с существующим пользователем
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  refresh_token: account.refresh_token
                }
              })
              
              // Обновляем информацию пользователя из Google
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  name: user.name || existingUser.name,
                  image: user.image || existingUser.image
                }
              })
              
              console.log('✅ Google аккаунт связан с существующим пользователем:', user.email)
            }
          }
          
          return true
        } catch (error) {
          console.error('❌ Ошибка при связывании Google аккаунта:', error)
          return true // Все равно разрешаем вход
        }
      }
      
      return true
    },
    
    async jwt({ token, user }) {
      // console.log('🔥 JWT callback вызван:', { 
      //   token: { ...token, role: token.role || user?.role }, 
      //   user,
      //   hasRole: !!(token.role || user?.role)
      // })
      if (user) {
        token.role = user.role
        token.phone = user.phone
        token.email = user.email
      }
      return token
    },
    
    async session({ session, token }) {
      console.log('🔥 Session callback вызван:', { 
        session, 
        token,
        tokenRole: token.role,
        willSetRole: !!token.role
      })
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.phone = token.phone as string
        session.user.email = token.email as string
      }
      return session
    }
  },

  pages: {
    signIn: '/auth/signin'
  }
} 