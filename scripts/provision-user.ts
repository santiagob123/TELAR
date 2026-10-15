import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/user-session'

const prisma = new PrismaClient()

function getOption(name: string) {
  const prefix = `--${name}=`
  const argument = process.argv.slice(2).find(value => value.startsWith(prefix))
  return argument ? argument.slice(prefix.length).trim() : ''
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function main() {
  const email = getOption('email').toLowerCase()
  const name = getOption('name')
  const password = process.env.TELAR_USER_PASSWORD || ''

  if (!email || !name || !password) {
    throw new Error('Uso: TELAR_USER_PASSWORD="..." npm run provision:user -- --email=usuario@example.com --name="Nombre"')
  }

  if (!isValidEmail(email)) {
    throw new Error('El email no tiene un formato válido.')
  }

  if (name.length > 200) {
    throw new Error('El nombre no puede superar 200 caracteres.')
  }

  const hashedPassword = await hashPassword(password)
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    throw new Error('Ya existe una cuenta con ese correo; no se modificó su contraseña ni sus datos.')
  }

  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword },
    select: { id: true, email: true, name: true }
  })

  process.stdout.write(`${JSON.stringify(user)}\n`)
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'No se pudo crear la cuenta.')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
