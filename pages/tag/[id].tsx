import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { getPublicTagByIdentifier, PublicTagResultDto } from '../../lib/public-tag'
type Props = { tag: PublicTagResultDto | null }

export default function TagPage({ tag }: Props) {
  if (!tag) return (
    <div className="surface mx-auto max-w-2xl p-8 text-center">
      <p className="eyebrow mb-3">TELAR TAG</p>
      <h1 className="text-2xl font-bold">No encontramos esta experiencia</h1>
      <p className="muted mt-2">Comprueba el enlace del TAG e inténtalo de nuevo.</p>
      <Link href="/tag/simulate" className="mt-4 inline-block text-sm font-semibold text-[#087f78]">Intenta otro TAG →</Link>
    </div>
  )

  if (tag.kind === 'inactive') {
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

  const whatsappNumber = business?.whatsapp?.replace(/[^0-9]/g, '')
  const websiteUrl = business?.website && (/^https?:\/\//i.test(business.website) ? business.website : `https://${business.website}`)

  return (
    <main className="mx-auto max-w-4xl pb-6">
      <article className="surface overflow-hidden">
        <div className="relative isolate min-h-[250px] overflow-hidden bg-[#0c1826] sm:min-h-[330px]">
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt={`Imagen de ${profile.title || business?.name || 'negocio'}`} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_15%,rgba(111,179,192,.32),transparent_38%),linear-gradient(135deg,#152538,#0c1826_70%)]" />
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0c1826] via-[#0c1826]/55 to-[#0c1826]/10" />
          <div className="relative flex min-h-[250px] flex-col justify-end px-6 py-7 sm:min-h-[330px] sm:px-10 sm:py-9">
            <span className="mb-4 w-fit rounded-full border border-white/25 bg-[#0c1826]/65 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-[#e1b366] backdrop-blur">Perfil digital · TELAR TAG</span>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl">{profile?.title || business?.name}</h1>
            {(profile?.description || business?.description) && <p className="mt-3 max-w-2xl text-sm leading-6 text-[#e8edf3]/90 sm:text-base sm:leading-7">{profile?.description || business?.description}</p>}
            {(business?.whatsapp || business?.contactPhone || websiteUrl) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {whatsappNumber && <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#e1b366] px-5 py-2.5 text-sm font-bold text-[#0c1826] transition hover:bg-[#efc77f] focus:outline-none focus:ring-2 focus:ring-white">Escríbenos por WhatsApp <span aria-hidden="true" className="ml-2">↗</span></a>}
                {business?.contactPhone && <a href={`tel:${business.contactPhone}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">Llamar</a>}
                {websiteUrl && <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">Visitar sitio <span aria-hidden="true" className="ml-2">↗</span></a>}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:grid-cols-[1.1fr_.9fr] sm:gap-10 sm:p-10">
          <section aria-labelledby="business-details-title">
            <p className="eyebrow mb-2">Conócenos</p>
            <h2 id="business-details-title" className="text-2xl font-bold text-[#17232b] sm:text-3xl">{business?.name || profile?.title}</h2>
            {business?.description && business.description !== profile?.description && <p className="muted mt-4 text-sm leading-7">{business.description}</p>}
            <div className="mt-7 grid gap-3">
              {business?.address && <div className="rounded-2xl border border-[#dfe7e5] bg-[#f5f8f6] p-4"><p className="eyebrow text-[10px]">Visítanos</p><p className="mt-2 text-sm font-medium leading-6 text-[#17232b]">{business.address}</p></div>}
              {business?.openingHours && <div className="rounded-2xl border border-[#dfe7e5] bg-[#f5f8f6] p-4"><p className="eyebrow text-[10px]">Horario de atención</p><p className="mt-2 text-sm font-medium leading-6 text-[#17232b]">{business.openingHours}</p></div>}
            </div>
          </section>

          <section aria-labelledby="contact-title" className="border-t border-[#dfe7e5] pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <p className="eyebrow mb-2">Contacto</p>
            <h2 id="contact-title" className="text-xl font-bold text-[#17232b]">Estamos para ayudarte</h2>
            <div className="mt-5 space-y-4">
              {business?.contactPhone && <div><p className="muted text-xs font-semibold">Teléfono</p><a href={`tel:${business.contactPhone}`} className="mt-1 block break-all text-sm font-semibold text-[#087f78] hover:underline">{business.contactPhone}</a></div>}
              {business?.whatsapp && <div><p className="muted text-xs font-semibold">WhatsApp</p><a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-sm font-semibold text-[#087f78] hover:underline">{business.whatsapp}</a></div>}
              {business?.email && <div><p className="muted text-xs font-semibold">Correo</p><a href={`mailto:${business.email}`} className="mt-1 block break-all text-sm font-semibold text-[#087f78] hover:underline">{business.email}</a></div>}
              {websiteUrl && <div><p className="muted text-xs font-semibold">Sitio web</p><a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-sm font-semibold text-[#087f78] hover:underline">{business?.website}</a></div>}
            </div>
            {(business?.instagram || business?.facebook || business?.linkedin) && <div className="mt-6 border-t border-[#dfe7e5] pt-5"><p className="muted mb-3 text-xs font-semibold">Síguenos</p><div className="flex flex-wrap gap-2">
              {business?.instagram && <a href={`https://instagram.com/${business.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#24405e] px-3 py-2 text-xs font-semibold text-[#6fb3c0] transition hover:border-[#6fb3c0]">Instagram ↗</a>}
              {business?.facebook && <a href={`https://facebook.com/${business.facebook.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#24405e] px-3 py-2 text-xs font-semibold text-[#6fb3c0] transition hover:border-[#6fb3c0]">Facebook ↗</a>}
              {business?.linkedin && <a href={`https://linkedin.com/in/${business.linkedin.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#24405e] px-3 py-2 text-xs font-semibold text-[#6fb3c0] transition hover:border-[#6fb3c0]">LinkedIn ↗</a>}
            </div></div>}
          </section>
        </div>
      </article>
      <p className="muted mt-5 px-3 text-center text-xs leading-5">Información compartida por el negocio. Siempre actualizada sin cambiar la etiqueta física.</p>
    </main>
  )
}
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id } = ctx.query
  const tag = await getPublicTagByIdentifier(String(id))
  if (!tag) return { notFound: true }
  return { props: { tag: JSON.parse(JSON.stringify(tag)) } }
}
