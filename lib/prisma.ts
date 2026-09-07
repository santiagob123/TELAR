import { PrismaClient } from '@prisma/client'

declare global {
  // allow global prisma in dev to avoid multiple instances
  // eslint-disable-next-line
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
