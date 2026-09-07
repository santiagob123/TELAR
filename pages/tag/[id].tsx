import { GetServerSideProps } from 'next'
import Link from 'next/link'
import prisma from '../../lib/prisma'

type Props = { tag: any }

export default function TagPage({ tag }: Props) {
  if (!tag) return (
    <div className="surface mx-auto max-w-2xl p-8 text-center">
      <p className="eyebrow mb-3">TELAR TAG</p>
      <h1 className="text-2xl font-bold">No encontramos esta experiencia</h1>
      <p className="muted mt-2">Comprueba el enlace del TAG e inténtalo de nuevo.</p>
      <Link href="/tag/simulate" className="mt-4 inline-block text-sm font-semibold text-[#087f78]">Intenta otro TAG →</Link>
    </div>
  )

  if (tag.status === 'inactive') {
    return (
      <div className="mx-auto max-w-xl">
        <div className="surface p-8 text-center">
          <p className="eyebrow mb-3">TELAR TAG</p>
          <h1 className="text-3xl font-bold text-[#17232b]">Este TAG está inactivo</h1>
          <p className="muted mt-3">La información pública no está disponible temporalmente.</p>
          <Link href="/tag/simulate" className="mt-5 inline-block text-sm font-semibold text-[#087f78]">Volver a simular →</Link>
        </div>
      </div>
    )
  }
  
  const profile = tag.profile
  const business = profile?.business
  const hasPublicData = Boolean(
    business?.name ||
    profile?.title ||
    profile?.description ||
    business?.contactPhone ||
    business?.whatsapp ||
    business?.email ||
    business?.address ||
    business?.openingHours ||
    business?.website ||
    business?.instagram ||
    business?.facebook ||
    business?.linkedin
  )

  if (!hasPublicData) {
    return (
      <div className="surface mx-auto max-w-2xl p-8 text-center">
        <p className="eyebrow mb-3">TELAR TAG</p>
        <h1 className="text-2xl font-bold">Este perfil aún no tiene información pública</h1>
        <p className="muted mt-2">El negocio todavía no completó los datos visibles para este TAG.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="surface overflow-hidden">
        <div className="bg-[#087f78] px-7 py-8 text-white sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#d8eea8]">Perfil Digital</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{profile.title || business?.name}</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-emerald-50">{profile.description || business?.description}</p>
        </div>
        
        <div className="grid gap-6 p-7 sm:grid-cols-2 sm:p-10">
          <div className="space-y-4">
            <div>
              <p className="eyebrow mb-2">Sobre el negocio</p>
              <p className="text-lg font-semibold">{business?.name}</p>
              {business?.description && <p className="muted mt-2 text-sm leading-6">{business.description}</p>}
            </div>

            {business?.address && (
              <div>
                <p className="text-xs eyebrow">Dirección</p>
                <p className="mt-1 text-sm font-medium text-[#17232b]">{business.address}</p>
              </div>
            )}

            {business?.openingHours && (
              <div>
                <p className="text-xs eyebrow">Horarios</p>
                <p className="mt-1 text-sm font-medium text-[#17232b]">{business.openingHours}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-[#dfe7e5] pt-5 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            {business?.contactPhone && (
              <div>
                <p className="text-xs eyebrow">Teléfono</p>
                <a href={`tel:${business.contactPhone}`} className="mt-1 block text-lg font-semibold text-[#087f78] hover:underline">
                  {business.contactPhone}
                </a>
              </div>
            )}
            {business?.whatsapp && (
              <div>
                <p className="text-xs eyebrow">WhatsApp</p>
                <a href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-1 block text-lg font-semibold text-[#087f78] hover:underline">
                  {business.whatsapp}
                </a>
              </div>
            )}
            {business?.email && (
              <div>
                <p className="text-xs eyebrow">Correo</p>
                <a href={`mailto:${business.email}`} className="mt-1 block text-lg font-semibold text-[#087f78] hover:underline">
                  {business.email}
                </a>
              </div>
            )}
            {business?.website && (
              <div>
                <p className="text-xs eyebrow">Sitio web</p>
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="mt-1 block text-lg font-semibold text-[#087f78] hover:underline">
                  {business.website}
                </a>
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              {business?.instagram && (
                <a href={`https://instagram.com/${business.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#087f78] hover:underline">Instagram</a>
              )}
              {business?.facebook && (
                <a href={`https://facebook.com/${business.facebook.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#087f78] hover:underline">Facebook</a>
              )}
              {business?.linkedin && (
                <a href={`https://linkedin.com/in/${business.linkedin.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#087f78] hover:underline">LinkedIn</a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <p className="muted mt-5 text-center text-xs">Información compartida por el negocio. Siempre actualizada sin cambiar la etiqueta física.</p>
      
      <div className="mt-8 p-4 bg-[#f5f8f6] border border-[#dfe7e5] rounded-lg text-center">
        <p className="text-xs muted mb-3">Modo administración</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link href="/admin/profile" className="text-sm font-semibold text-[#087f78] hover:underline">
            ← Volver a editar
          </Link>
          <Link href="/tag/simulate" className="text-sm font-semibold text-[#087f78] hover:underline">
            Simular otro TAG
          </Link>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id } = ctx.query
  const tag = await prisma.tag.findUnique({
    where: { identifier: String(id) },
    include: { profile: { include: { business: true } } }
  })
  return { props: { tag: JSON.parse(JSON.stringify(tag)) } }
}
