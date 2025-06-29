import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

console.log('🔥 NextAuth route handler загружен')

const handler = NextAuth(authOptions)

export async function GET(req: Request, context: any) {
  console.log('🔥 NextAuth GET запрос:', req.method, req.url)
  return handler(req, context)
}

export async function POST(req: Request, context: any) {
  console.log('🔥 NextAuth POST запрос:', req.method, req.url)
  console.log('🔥 Headers:', Object.fromEntries(req.headers.entries()))
  
  try {
    const cloned = req.clone()
    const body = await cloned.text()
    console.log('🔥 Body:', body)
  } catch (e) {
    console.log('🔥 Body parse error:', e)
  }
  
  return handler(req, context)
} 