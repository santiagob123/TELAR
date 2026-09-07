import Link from 'next/link'

const groups = [
  {
    label: 'TELAR TAG',
    links: [
      { href: '/admin/profile', label: 'Perfiles' },
      { href: '/admin/tags', label: 'Tags' }
    ]
  }
]

export default function AdminNav() {
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
    </nav>
  )
}