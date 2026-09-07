import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE } from './lib/admin-session-constants'
import { AI_SESSION_COOKIE } from './lib/ai-session-constants'

async function hasValidSession(value: string | undefined, token: string) {
  if (!value) return false
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(token),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('telar-admin-session'))
  const expected = Array.from(new Uint8Array(signature)).map(byte => byte.toString(16).padStart(2, '0')).join('')
  return value === expected
}

export async function middleware(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN
  const pathname = req.nextUrl.pathname

  if (pathname === '/admin/login') return NextResponse.next()
  if (pathname === '/ai/login') return NextResponse.next()

  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))
    const header = req.headers.get('x-admin-token')
    const sessionValid = await hasValidSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value, token || '')
    if (header !== token && !sessionValid) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  if (pathname.startsWith('/ai')) {
    const aiToken = process.env.AI_TOKEN
    if (!aiToken) return NextResponse.redirect(new URL('/ai/login', req.url))
    const header = req.headers.get('x-ai-token')
    const sessionValue = req.cookies.get(AI_SESSION_COOKIE)?.value
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(aiToken),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('telar-ai-session'))
    const expected = Array.from(new Uint8Array(signature)).map(byte => byte.toString(16).padStart(2, '0')).join('')
    if (header !== aiToken && sessionValue !== expected) {
      return NextResponse.redirect(new URL('/ai/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/ai/:path*'] }
