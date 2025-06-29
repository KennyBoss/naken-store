import 'next-auth'
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface User extends DefaultUser {
    role: string
    phone?: string | null
  }

  interface Session extends DefaultSession {
    user: User & {
      id: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string
    phone?: string | null
    id: string
  }
} 