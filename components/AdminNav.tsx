import Link from 'next/link'
import { useRouter } from 'next/router'

const groups = [
  {
    label: 'TELAR TAG',
    links: [
      { href: '/admin/profile', label: 'Perfiles' },
      { href: '/admin/tags', label: 'Tags' }
    ]
  },
  {
    label: 'TELAR AI',
    links: [
      { href: '/ai', label: 'Asistente' },
      { href: '/ai/conversations', label: 'Conversaciones' },
      { href: '/ai/knowledge', label: 'Knowledge Base' },
      { href: '/ai/settings', label: 'Configuración' }
    ]
  }
]

export default function AdminNav() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/ai/logout', { method: 'POST' })
    await router.replace('/admin/login')
  }

  return (
    <nav aria-label="Navegación administrativa" className="mb-7 flex flex-wrap items-end gap-x-7 gap-y-4 border-b border-[#dfe7e5] pb-4">
      <div>
        <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#63717a]">Panel</p>
        <Link href="/admin" className="inline-block rounded-lg px-3 py-2 text-sm font-semibold text-[#075c59] transition hover:bg-[#e9f2ef]">Dashboard</Link>
      </div>
      {groups.map(group => (
        <div key={group.label}>
          <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#63717a]">{group.label}</p>
          <div className="flex flex-wrap gap-1">
            {group.links.map(link => (
              <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#075c59] transition hover:bg-[#e9f2ef]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
      <button onClick={logout} className="ml-auto rounded-lg px-3 py-2 text-sm font-semibold text-[#63717a] transition hover:bg-[#f5f5f5]">
        Cerrar sesión
      </button>
    </nav>
  )
}
