import { readFile } from 'fs/promises'
import { PrismaClient } from '@prisma/client'

type Mapping = { businessId: string; ownerId: string }

function parseMappingCsv(source: string): Mapping[] {
  const lines = source.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  if (lines.length < 2 || lines[0] !== 'businessId,ownerId') {
    throw new Error('El CSV debe iniciar con el encabezado exacto: businessId,ownerId')
  }

  const mappings = lines.slice(1).map((line, index) => {
    const columns = line.split(',').map(value => value.trim())
    if (columns.length !== 2 || !columns[0] || !columns[1]) {
      throw new Error(`Fila ${index + 2}: se requieren businessId y ownerId.`)
    }
    return { businessId: columns[0], ownerId: columns[1] }
  })

  const businessIds = new Set<string>()
  for (const mapping of mappings) {
    if (businessIds.has(mapping.businessId)) {
      throw new Error(`El negocio ${mapping.businessId} aparece más de una vez.`)
    }
    businessIds.add(mapping.businessId)
  }
  return mappings
}

async function main() {
  const filePath = process.argv[2]
  const apply = process.argv.includes('--apply')
  if (!filePath || process.argv.slice(3).some(argument => argument !== '--apply')) {
    throw new Error('Uso: npx ts-node scripts/backfill-owner.ts <mapping.csv> [--apply]')
  }

  const mappings = parseMappingCsv(await readFile(filePath, 'utf8'))
  const prisma = new PrismaClient()
  try {
    const businessIds = mappings.map(mapping => mapping.businessId)
    const ownerIds = [...new Set(mappings.map(mapping => mapping.ownerId))]
    const [businesses, owners] = await Promise.all([
      prisma.business.findMany({ where: { id: { in: businessIds } }, select: { id: true, ownerId: true } }),
      prisma.user.findMany({ where: { id: { in: ownerIds } }, select: { id: true } })
    ])
    const businessById = new Map(businesses.map(business => [business.id, business]))
    const knownOwners = new Set(owners.map(owner => owner.id))
    const errors: string[] = []

    for (const mapping of mappings) {
      const business = businessById.get(mapping.businessId)
      if (!business) errors.push(`No existe el negocio ${mapping.businessId}.`)
      else if (business.ownerId) errors.push(`El negocio ${mapping.businessId} ya tiene propietario ${business.ownerId}.`)
      if (!knownOwners.has(mapping.ownerId)) errors.push(`No existe el usuario ${mapping.ownerId}.`)
    }

    if (errors.length) throw new Error(errors.join('\n'))
    console.log(`${mappings.length} asignaciones válidas. Modo: ${apply ? 'APLICAR' : 'simulación'}.`)
    if (!apply) {
      console.log('No se modificó la base de datos. Añade --apply después de revisar el mapping.')
      return
    }

    await prisma.$transaction(async transaction => {
      for (const mapping of mappings) {
        const result = await transaction.business.updateMany({
          where: { id: mapping.businessId, ownerId: null },
          data: { ownerId: mapping.ownerId }
        })
        if (result.count !== 1) {
          throw new Error(`El negocio ${mapping.businessId} cambió durante la operación; se canceló la transacción.`)
        }
      }
    })
    console.log(`Asignación aplicada para ${mappings.length} negocios.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error('Backfill cancelado:', error instanceof Error ? error.message : 'Error desconocido')
  process.exitCode = 1
})
