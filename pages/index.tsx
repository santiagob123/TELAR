import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <section className="max-w-3xl">
        <p className="eyebrow mb-3">Plataforma de experiencias conectadas</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Una forma mas clara de conectar tu negocio.</h1>
        <p className="muted mt-5 max-w-2xl text-lg leading-8">Explora los dos MVP de TELAR: gestiona perfiles y TAG desde un espacio, y accede a TELAR AI desde su propio entorno.</p>
      </section>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Link href="/admin" className="surface group block p-6 no-underline transition hover:-translate-y-1">
          <p className="eyebrow">Gestion</p>
          <h2 className="mt-3 text-2xl font-bold">Panel de control</h2>
          <p className="muted mt-2 leading-6">Revisa perfiles, tags, conversaciones y el asistente.</p>
          <span className="mt-7 inline-block font-semibold text-teal-700">Entrar al panel &rarr;</span>
        </Link>
        <Link href="/tag/demo123" className="surface group block border-0 bg-[#087f78] p-6 text-white no-underline transition hover:-translate-y-1">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#d8eea8]">Experiencia publica</p>
          <h2 className="mt-3 text-2xl font-bold">Ver TAG demo</h2>
          <p className="mt-2 leading-6 text-emerald-50">Mira la ficha que recibe una persona al escanear un TAG.</p>
          <span className="mt-7 inline-block font-semibold text-[#d8eea8]">Abrir experiencia &rarr;</span>
        </Link>
        <Link href="/ai/login" className="surface group block p-6 no-underline transition hover:-translate-y-1 md:col-span-2">
          <p className="eyebrow">TELAR AI</p>
          <h2 className="mt-3 text-2xl font-bold">Asistente IA</h2>
          <p className="muted mt-2 leading-6">Accede al espacio independiente para administrar el asistente y sus conversaciones.</p>
          <span className="mt-7 inline-block font-semibold text-teal-700">Acceder a TELAR AI &rarr;</span>
        </Link>
      </div>
    </div>
  )
}
