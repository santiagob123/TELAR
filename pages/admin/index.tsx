import Link from 'next/link'
import { useEffect, useState } from 'react'

type DashboardCounts = {
  businesses: number
  profiles: number
  tags: number
  activeTags: number
  conversations: number
  humanConversations: number
}

export default function Admin() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null)
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/admin/dashboard')
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data?.error || 'No se pudieron cargar los indicadores.')
        return data as DashboardCounts
      })
      .then(data => { if (active) setCounts(data) })
      .catch(error => { if (active) setDashboardError(error instanceof Error ? error.message : 'No se pudieron cargar los indicadores.') })
    return () => { active = false }
  }, [])

  return (
    <div>
      <div className="mb-9">
        <p className="eyebrow mb-2">Espacio de trabajo</p>
        <h1 className="text-3xl font-bold">Panel de control</h1>
        <p className="muted mt-2">Elige un área para continuar con la demo.</p>
      </div>

      {dashboardError && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{dashboardError}</p>}
      {counts && <section aria-label="Resumen de tus recursos" className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Negocios', counts.businesses],
          ['Perfiles', counts.profiles],
          ['TAG activos', `${counts.activeTags} / ${counts.tags}`],
          ['Conversaciones · atención humana', `${counts.humanConversations} / ${counts.conversations}`]
        ].map(([label, value]) => <div key={label} className="surface p-4">
          <p className="muted text-xs">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>)}
      </section>}

      <section className="mb-10">
        <h2 className="font-semibold mb-4 text-sm eyebrow">TELAR AI · Administración</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/ai" className="surface block p-5 no-underline transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-3xl">✦</span>
            <h3 className="mt-4 text-lg font-bold">Automatización de mensajes</h3>
            <p className="muted mt-1 text-sm">Prueba las respuestas de TELAR AI y revisa el estado del canal de WhatsApp.</p>
          </Link>
          <Link href="/ai/conversations" className="surface block p-5 no-underline transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-3xl">☷</span>
            <h3 className="mt-4 text-lg font-bold">Conversaciones</h3>
            <p className="muted mt-1 text-sm">Revisa chats y gestiona el handoff humano.</p>
          </Link>
          <Link href="/ai/knowledge" className="surface block p-5 no-underline transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-3xl">▤</span>
            <h3 className="mt-4 text-lg font-bold">Knowledge Base</h3>
            <p className="muted mt-1 text-sm">Administra el conocimiento del asistente.</p>
          </Link>
        </div>
      </section>

      {/* MVP TAG */}
      <div className="mb-10">
        <h2 className="font-semibold mb-4 text-sm eyebrow">TELAR TAG</h2>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Link href="/admin/tags" className="surface block p-5 no-underline transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-3xl">✚</span>
            <h3 className="mt-4 text-lg font-bold">Crear negocio</h3>
            <p className="muted mt-1 text-sm">1. Crea un perfil y recibe un TAG único.</p>
          </Link>
          <Link href="/admin/profile" className="surface block p-5 no-underline transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-3xl">✎</span>
            <h3 className="mt-4 text-lg font-bold">Editar información</h3>
            <p className="muted mt-1 text-sm">2. Actualiza datos de tu perfil público.</p>
          </Link>
          <Link href="/tag/simulate" className="surface block p-5 no-underline transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-3xl">▶</span>
            <h3 className="mt-4 text-lg font-bold">Ver experiencia</h3>
            <p className="muted mt-1 text-sm">3. Simula cómo ve tu cliente el TAG.</p>
          </Link>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-10 p-6 sm:p-8 bg-[#f1f8df] border border-[#c8dda8] rounded-lg">
        <p className="font-semibold text-sm mb-3">💡 Consejo para la demo:</p>
        <ol className="text-sm space-y-2 muted">
          <li><strong>1.</strong> Crea un negocio en "Crear negocio"</li>
          <li><strong>2.</strong> Guarda el TAG que recibirás</li>
          <li><strong>3.</strong> Ve a "Editar información" y actualiza teléfono o WhatsApp</li>
          <li><strong>4.</strong> Usa "Ver experiencia" con tu TAG para comprobar los cambios</li>
        </ol>
      </div>
    </div>
  )
}
