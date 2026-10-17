import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'

type NavigationIcon = 'home' | 'dashboard' | 'users' | 'profile' | 'tag' | 'sparkle' | 'chat' | 'book' | 'settings'

const groups: Array<{
  label: string
  links: Array<{ href: string; label: string; icon: NavigationIcon }>
}> = [
  {
    label: 'Panel',
    links: [
      { href: '/', label: 'Inicio', icon: 'home' },
      { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
      { href: '/admin/users', label: 'Usuarios', icon: 'users' }
    ]
  },
  {
    label: 'TELAR TAG',
    links: [
      { href: '/admin/profile', label: 'Perfiles', icon: 'profile' },
      { href: '/admin/tags', label: 'Tags', icon: 'tag' }
    ]
  },
  {
    label: 'TELAR AI',
    links: [
      { href: '/ai', label: 'Automatización', icon: 'sparkle' },
      { href: '/ai/conversations', label: 'Conversaciones', icon: 'chat' },
      { href: '/ai/knowledge', label: 'Knowledge Base', icon: 'book' },
      { href: '/ai/settings', label: 'Configuración', icon: 'settings' }
    ]
  }
]

const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Usuarios',
  '/admin/profile': 'Perfiles',
  '/admin/tags': 'Tags',
  '/admin/ai': 'Automatización',
  '/admin/conversations': 'Conversaciones',
  '/ai': 'Automatización',
  '/ai/conversations': 'Conversaciones',
  '/ai/knowledge': 'Knowledge Base',
  '/ai/settings': 'Configuración'
}

function NavigationGlyph({ icon }: { icon: NavigationIcon }) {
  let drawing: ReactNode

  switch (icon) {
    case 'home':
      drawing = <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>
      break
    case 'dashboard':
      drawing = <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>
      break
    case 'users':
      drawing = <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20v-1.5A4.5 4.5 0 0 1 7 14h4a4.5 4.5 0 0 1 4.5 4.5V20" /><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.5a4.3 4.3 0 0 1 3.5 4.3V20" /></>
      break
    case 'profile':
      drawing = <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>
      break
    case 'tag':
      drawing = <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1" /></>
      break
    case 'sparkle':
      drawing = <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>
      break
    case 'chat':
      drawing = <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.4Z" /></>
      break
    case 'book':
      drawing = <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>
      break
    case 'settings':
      drawing = <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5v.2a2 2 0 1 1-4 0V19a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3.8a2 2 0 1 1 0-4H4a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3.2a2 2 0 1 1 4 0V4a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1h.2a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1.2Z" /></>
  }

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawing}</svg>
}

export default function AdminNav({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const currentTitle = router.pathname === '/' ? 'Inicio' : routeLabels[router.pathname] || 'Panel'

  function isActive(href: string) {
    return href === '/' || href === '/admin' || href === '/ai'
      ? router.pathname === href
      : router.pathname === href || router.pathname.startsWith(`${href}/`)
  }

  function toggleNavigation() {
    if (window.matchMedia('(max-width: 760px)').matches) {
      setIsMobileOpen(open => !open)
      return
    }
    setIsCollapsed(collapsed => !collapsed)
  }

  useEffect(() => {
    setIsMobileOpen(false)
  }, [router.asPath])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const updateViewport = () => {
      setIsMobileViewport(media.matches)
      if (!media.matches) setIsMobileOpen(false)
    }
    updateViewport()
    media.addEventListener('change', updateViewport)
    return () => media.removeEventListener('change', updateViewport)
  }, [])

  useEffect(() => {
    if (!isMobileOpen) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isMobileOpen])

  async function logout() {
    if (loggingOut) return
    setLoggingOut(true)
    setLogoutError('')

    try {
      const response = await fetch('/api/ai/logout', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store'
      })
      if (!response.ok) throw new Error('No se pudo cerrar la sesión.')
      window.location.replace('/admin/login')
    } catch {
      setLoggingOut(false)
      setLogoutError('No se pudo cerrar la sesión. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  return (
    <div className={`admin-layout${isCollapsed ? ' is-collapsed' : ''}`}>
      {isMobileOpen && <button type="button" className="admin-sidebar-overlay" onClick={() => setIsMobileOpen(false)} aria-label="Cerrar navegación" />}
      <aside className={`admin-sidebar${isMobileOpen ? ' is-open' : ''}`} id="admin-sidebar">
        <Link className="admin-brand" href="/" aria-label="TELAR, ir al inicio público">
          <span className="admin-brand-mark" aria-hidden="true">T</span>
          <span className="admin-brand-name">TELAR</span>
        </Link>

        <nav className="admin-sidebar-nav" aria-label="Navegación administrativa">
          {groups.map(group => (
            <section className="admin-sidebar-group" key={group.label}>
              <h2 className="admin-sidebar-label">{group.label}</h2>
              <div className="admin-sidebar-links">
                {group.links.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-label={link.label}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    title={isCollapsed ? link.label : undefined}
                    className={`admin-sidebar-link${isActive(link.href) ? ' is-active' : ''}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span className="admin-sidebar-icon"><NavigationGlyph icon={link.icon} /></span>
                    <span className="admin-sidebar-link-label">{link.label}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {logoutError && <p className="admin-logout-error" role="alert">{logoutError}</p>}
          <button type="button" onClick={() => void logout()} disabled={loggingOut} className="admin-logout">
            <span className="admin-logout-icon" aria-hidden="true">↪</span>
            <span className="admin-logout-label">{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              onClick={toggleNavigation}
              aria-controls="admin-sidebar"
              aria-expanded={isMobileViewport ? isMobileOpen : !isCollapsed}
              aria-label={isMobileOpen ? 'Cerrar navegación' : isCollapsed ? 'Expandir navegación' : 'Contraer navegación'}
              className="admin-menu-button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="admin-breadcrumbs" aria-label="Ruta actual">
              <Link href="/admin">Panel</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{currentTitle}</span>
            </div>
          </div>
          <span className="admin-topbar-mark">TELAR <span>ADMIN</span></span>
        </header>

        <main className="admin-content" id="admin-main">{children}</main>
      </section>
    </div>
  )
}
