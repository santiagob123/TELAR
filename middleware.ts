import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE } from './lib/admin-session-constants'
import { AI_SESSION_COOKIE } from './lib/ai-session-constants'

const USER_SESSION_COOKIE = 'telar_user_session'

async function hasValidSession(value: string | undefined, token: string, purpose = 'telar-admin-session') {
  if (!value) return false
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(token),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(purpose))
  const expected = Array.from(new Uint8Array(signature)).map(byte => byte.toString(16).padStart(2, '0')).join('')
  return value === expected
}

async function hasValidUserSession(value: string | undefined) {
  const secret = process.env.SESSION_SECRET
  if (!value || !secret || new TextEncoder().encode(secret).length < 32) return false
  const [payload, signature, extra] = value.split('.')
  if (!payload || !signature || extra) return false
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
    const expected = btoa(String.fromCharCode(...new Uint8Array(signed))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
    if (signature !== expected) return false
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof decoded.userId === 'string' && typeof decoded.exp === 'number' && decoded.exp > Date.now() / 1000
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN
  const pathname = req.nextUrl.pathname

  if (pathname === '/admin/ai') {
    return NextResponse.redirect(new URL('/ai', req.url), 308)
  }
  if (pathname === '/admin/conversations') {
    return NextResponse.redirect(new URL('/ai/conversations', req.url), 308)
  }

  if (pathname === '/admin/login') return NextResponse.next()
  if (pathname === '/ai/login') return NextResponse.redirect(new URL('/admin/login', req.url), 308)

  if (pathname.startsWith('/admin')) {
    if (await hasValidUserSession(req.cookies.get(USER_SESSION_COOKIE)?.value)) return NextResponse.next()
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))
    const header = req.headers.get('x-admin-token')
    const sessionValid = await hasValidSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value, token || '')
    if (header !== token && !sessionValid) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  if (pathname.startsWith('/ai')) {
    if (await hasValidUserSession(req.cookies.get(USER_SESSION_COOKIE)?.value)) return NextResponse.next()
    const adminToken = process.env.ADMIN_TOKEN
    const adminHeader = req.headers.get('x-admin-token')
    const adminSessionValid = adminToken
      ? await hasValidSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value, adminToken)
      : false
    if ((adminToken && adminHeader === adminToken) || adminSessionValid) return NextResponse.next()

    const aiToken = process.env.AI_TOKEN
    if (!aiToken) return NextResponse.redirect(new URL('/admin/login', req.url))
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
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/ai/:path*'] }
