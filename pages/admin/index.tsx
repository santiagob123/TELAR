import Link from 'next/link'

export default function Admin() {
  return (
    <div>
      <div className="mb-9">
        <p className="eyebrow mb-2">Espacio de trabajo</p>
        <h1 className="text-3xl font-bold">Panel de control</h1>
        <p className="muted mt-2">Elige un área para continuar con la demo.</p>
      </div>

      {/* Flujo principal de TELAR TAG */}
      <div className="mb-10">
        <h2 className="font-semibold mb-4 text-sm eyebrow">FLUJO PRINCIPAL - TELAR TAG</h2>
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

      {/* Otras áreas (AI) */}
      <div>
        <h2 className="font-semibold mb-4 text-sm eyebrow">OTRAS FUNCIONALIDADES</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/admin/ai" className="surface block p-5 no-underline transition hover:-translate-y-1">
            <span className="text-2xl">✦</span>
            <h2 className="mt-4 text-xl font-bold">Asistente IA</h2>
            <p className="muted mt-1">Prueba respuestas en WhatsApp.</p>
          </Link>
          <Link href="/admin/conversations" className="surface block p-5 no-underline transition hover:-translate-y-1">
            <span className="text-2xl">•••</span>
            <h2 className="mt-4 text-xl font-bold">Conversaciones</h2>
            <p className="muted mt-1">Consulta y deriva conversaciones.</p>
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
