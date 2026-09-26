import { PrismaClient } from '@prisma/client'

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

  if (!email || !name) {
    throw new Error('Uso: npm run provision:user -- --email=admin@example.com --name="Nombre"')
  }

  if (!isValidEmail(email)) {
    throw new Error('El email no tiene un formato válido.')
  }

  if (name.length > 200) {
    throw new Error('El nombre no puede superar 200 caracteres.')
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name },
    select: { id: true, email: true, name: true }
  })

  process.stdout.write(`${JSON.stringify(user)}\n`)
}

main()
  .catch(() => {
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })