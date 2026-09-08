import Link from 'next/link'
import { useRouter } from 'next/router'

const links = [
  { href: '/ai', label: 'Asistente IA' },
  { href: '/ai/conversations', label: 'Conversaciones' },
  { href: '/ai/settings', label: 'Configuración' }
]

export default function AiNav() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/ai/logout', { method: 'POST' })
    await router.replace('/ai/login')
  }

  return (
    <nav aria-label="Navegación de TELAR AI" className="ai-nav mb-7 flex flex-wrap items-end gap-x-7 gap-y-4 border-b border-[#dfe7e5] pb-4">
      <div>
        <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#63717a]">TELAR AI</p>
        <div className="flex flex-wrap gap-1">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#075c59] transition hover:bg-[#e9f2ef]">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="ml-auto">
        <button
          onClick={logout}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-[#63717a] transition hover:bg-[#f5f5f5]"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}