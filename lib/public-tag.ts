import prisma from './prisma'

export type PublicTagBusinessDto = {
  name: string
  description: string | null
  contactPhone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  openingHours: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  linkedin: string | null
}

export type PublicTagProfileDto = {
  title: string
  description: string | null
  imageUrl: string | null
  business: PublicTagBusinessDto
}

export type PublicTagDto = {
  kind: 'active'
  status: string
  identifier: string
  profile: PublicTagProfileDto | null
}

export type PublicTagInactiveDto = {
  kind: 'inactive'
  identifier: string
  status: string
}

export type PublicTagResultDto = PublicTagDto | PublicTagInactiveDto

type TagState = {
  identifier: string
  status: string
}

function safeImageUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function inactiveTag(tag: TagState): PublicTagInactiveDto {
  return { kind: 'inactive', identifier: tag.identifier, status: tag.status }
}

export async function getPublicTagByIdentifier(identifier: string): Promise<PublicTagResultDto | null> {
  const tag = await prisma.tag.findUnique({
    where: { identifier },
    select: {
      identifier: true,
      status: true,
      profile: {
        select: {
          title: true,
          description: true,
          imageUrl: true,
          business: {
            select: {
              name: true,
              description: true,
              contactPhone: true,
              whatsapp: true,
              email: true,
              address: true,
              openingHours: true,
              website: true,
              instagram: true,
              facebook: true,
              linkedin: true
            }
          }
        }
      }
    }
  })

  if (!tag) return null
  if (tag.status === 'inactive') return inactiveTag(tag)

  return {
    ...tag,
    kind: 'active',
    profile: tag.profile ? { ...tag.profile, imageUrl: safeImageUrl(tag.profile.imageUrl) } : null
  }
}
