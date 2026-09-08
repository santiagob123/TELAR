import Link from 'next/link'

const links = [
  { href: '/ai', label: 'Dashboard' },
  { href: '/chat', label: 'Chat público' },
  { href: '/ai/conversations', label: 'Conversaciones' },
  { href: '/ai/settings', label: 'Configuración' }
]

export default function AiNav() {
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
    </nav>
  )
}