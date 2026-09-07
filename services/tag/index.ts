import prisma from '../../lib/prisma'
import { nanoid } from 'nanoid'

export class TagValidationError extends Error {
  code = 'VALIDATION_ERROR'
}

function normalizeValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : value
}

function isValidEmail(value?: string) {
  if (!value || !value.trim()) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidPhone(value?: string) {
  if (!value || !value.trim()) return true
  if (!/^[0-9+().\s-]+$/.test(value.trim()) || !/^\+?[0-9]/.test(value.trim())) return false
  const numeric = value.replace(/[^0-9+]/g, '')
  const digits = value.replace(/\D/g, '')
  return numeric.length >= 8 && numeric.length <= 16 && digits.length >= 8 && digits.length <= 15
}

function normalizeStatus(value: unknown) {
  const status = String(value || 'active').toLowerCase()
  if (status !== 'active' && status !== 'inactive') {
    throw new TagValidationError('El estado del TAG debe ser active o inactive.')
  }
  return status
}

function normalizeIdentifier(value: unknown) {
  const identifier = String(normalizeValue(value) || '').trim()
  if (!identifier) throw new TagValidationError('El identificador del TAG no puede estar vacío.')
  if (identifier.length > 100) throw new TagValidationError('El identificador del TAG no puede superar 100 caracteres.')
  if (!/^[A-Za-z0-9_-]+$/.test(identifier)) {
    throw new TagValidationError('El identificador del TAG solo puede contener letras, números, guion y guion bajo.')
  }
  return identifier
}

export function validateBusinessInput(data: any) {
  const errors: string[] = []

  if (!normalizeValue(data?.name)) {
    errors.push('El nombre del negocio es obligatorio.')
  }

  if (!normalizeValue(data?.description)) {
    errors.push('La descripción del negocio es obligatoria.')
  }

  if (!normalizeValue(data?.contactPhone)) {
    errors.push('El teléfono de contacto es obligatorio.')
  } else if (!isValidPhone(String(data.contactPhone))) {
    errors.push('El teléfono no tiene un formato válido.')
  }

  if (!normalizeValue(data?.whatsapp)) {
    errors.push('El WhatsApp es obligatorio.')
  } else if (!isValidPhone(String(data.whatsapp))) {
    errors.push('El WhatsApp no tiene un formato válido.')
  }

  if (data?.email && !isValidEmail(String(data.email))) {
    errors.push('El correo electrónico no tiene un formato válido.')
  }

  if (data?.website && !/^https?:\/\//i.test(String(data.website))) {
    errors.push('La URL del sitio web debe incluir http:// o https://')
  }

  if (data?.instagram && !/^@?[A-Za-z0-9._]+$/i.test(String(data.instagram).replace(/^@/, ''))) {
    errors.push('El usuario de Instagram no tiene un formato válido.')
  }

  if (data?.facebook && !/^@?[A-Za-z0-9._]+$/i.test(String(data.facebook).replace(/^@/, ''))) {
    errors.push('El usuario de Facebook no tiene un formato válido.')
  }

  if (data?.linkedin && !/^@?[A-Za-z0-9._-]+$/i.test(String(data.linkedin).replace(/^@/, ''))) {
    errors.push('El usuario de LinkedIn no tiene un formato válido.')
  }

  if (data?.website && !/^https?:\/\//i.test(String(data.website))) {
    errors.push('La URL del sitio web debe incluir http:// o https://')
  }

  return errors
}

export function assertValidBusinessInput(data: any) {
  const errors = validateBusinessInput(data)
  if (errors.length > 0) throw new TagValidationError(errors[0])
}

export async function createProfileAndTag(data: any) {
  assertValidBusinessInput(data)

  const businessData = {
    name: String(normalizeValue(data.name) || '').trim(),
    description: String(normalizeValue(data.description) || '').trim(),
    contactPhone: String(normalizeValue(data.contactPhone) || '').trim(),
    whatsapp: String(normalizeValue(data.whatsapp) || '').trim(),
    email: normalizeValue(data.email) ? String(normalizeValue(data.email)).trim() : null,
    address: normalizeValue(data.address) ? String(normalizeValue(data.address)).trim() : null,
    openingHours: normalizeValue(data.openingHours) ? String(normalizeValue(data.openingHours)).trim() : null,
    website: normalizeValue(data.website) ? String(normalizeValue(data.website)).trim() : null,
    instagram: normalizeValue(data.instagram) ? String(normalizeValue(data.instagram)).trim() : null,
    facebook: normalizeValue(data.facebook) ? String(normalizeValue(data.facebook)).trim() : null,
    linkedin: normalizeValue(data.linkedin) ? String(normalizeValue(data.linkedin)).trim() : null,
  }

  const hasCustomIdentifier = data.identifier !== undefined && data.identifier !== null
  const identifier = hasCustomIdentifier
    ? normalizeIdentifier(data.identifier)
    : `tag${nanoid(8)}`
  const status = normalizeStatus(data.status)

  try {
    return await prisma.$transaction(async (transaction) => {
      const business = await transaction.business.create({
        data: {
          ...businessData,
          profile: {
            create: {
              title: normalizeValue(data.title) ? String(normalizeValue(data.title)).trim() : businessData.name,
              description: businessData.description,
              imageUrl: normalizeValue(data.imageUrl) ? String(normalizeValue(data.imageUrl)).trim() : ''
            }
          }
        },
        include: { profile: true }
      })

      const tag = await transaction.tag.create({
        data: {
          identifier,
          status,
          profileId: business.profile!.id
        }
      })

      return { business, tag }
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const conflict = new Error('El identificador del TAG ya existe. Ingresa uno diferente.')
      ;(conflict as any).code = 'CONFLICT'
      throw conflict
    }
    throw error
  }
}

export async function getProfileByIdentifier(identifier: string) {
  const tag = await prisma.tag.findUnique({
    where: { identifier },
    include: { profile: { include: { business: true } } }
  })

  return tag
}

export async function setTagStatusByIdentifier(identifier: string, status: string) {
  const normalizedStatus = normalizeStatus(status)
  const updatedTag = await prisma.tag.update({
    where: { identifier },
    data: { status: normalizedStatus }
  })

  return updatedTag
}
