import type { NextApiRequest, NextApiResponse } from 'next'
import { hashPassword } from '../../../lib/user-session'
import { requireAdminAccess } from '../../../lib/admin-auth'
import prisma from '../../../lib/prisma'

function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const access = await requireAdminAccess(req, res)
    if (!access) return
    if (!access.isGlobalAdmin) return res.status(403).json({ error: 'Solo el administrador global puede gestionar usuarios.' })

    if (req.method === 'GET') {
      const adminId = process.env.ADMIN_USER_ID?.trim()
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          businesses: { select: { id: true, name: true }, orderBy: { name: 'asc' } }
        },
        orderBy: { createdAt: 'asc' }
      })

      return res.status(200).json({
        users: users.map(user => ({
          ...user,
          role: user.id === adminId ? 'admin' : 'owner'
        }))
      })
    }

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''

    if (!isValidEmail(email)) return res.status(400).json({ error: 'Escribe un correo válido.' })
    if (name.length > 120) return res.status(400).json({ error: 'El nombre no puede superar 120 caracteres.' })
    if (password.length < 12 || password.length > 200) {
      return res.status(400).json({ error: 'La contraseña inicial debe tener entre 12 y 200 caracteres.' })
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (existing) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' })

    const user = await prisma.user.create({
      data: { email, name: name || null, password: await hashPassword(password) },
      select: { id: true, email: true, name: true, createdAt: true }
    })
    return res.status(201).json({ user: { ...user, role: 'owner', businesses: [] } })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' })
    }
    console.error('[TELAR] admin user management failed', error instanceof Error ? error.message : 'unknown error')
    if (!res.headersSent) return res.status(503).json({ error: 'No se pudo gestionar la cuenta.' })
  }
}
