import '../styles/globals.css'
import '../styles/telar-home-animation.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import AdminNav from '../components/AdminNav'
import ChatBubble from '../components/ChatBubble'
import ScrollOrbit from '../components/ScrollOrbit'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isAiArea = router.pathname.startsWith('/ai')
  const isAdminWorkspace = (router.pathname.startsWith('/admin') && router.pathname !== '/admin/login') || isAiArea
  const isHome = router.pathname === '/'
  const [isNavigating, setIsNavigating] = useState(false)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [navIndicator, setNavIndicator] = useState({ left: 0, width: 0, visible: false })
  const [isNavPreview, setIsNavPreview] = useState(false)
  const [showInitialLoader, setShowInitialLoader] = useState(true)
  const [isInitialLoaderClosing, setIsInitialLoaderClosing] = useState(false)
  const shouldShowInitialLoader = useRef<boolean | null>(null)
  const topNavRef = useRef<HTMLElement | null>(null)
  const panelLinkRef = useRef<HTMLAnchorElement | null>(null)
  const tagDemoLinkRef = useRef<HTMLAnchorElement | null>(null)

  const moveNavIndicator = useCallback((target: HTMLAnchorElement | null, preview = false) => {
    const nav = topNavRef.current
    if (!nav || !target) {
      setNavIndicator((current) => ({ ...current, visible: false }))
      setIsNavPreview(false)
      return
    }

    const navBounds = nav.getBoundingClientRect()
    const targetBounds = target.getBoundingClientRect()
    setNavIndicator({ left: targetBounds.left - navBounds.left, width: targetBounds.width, visible: true })
    setIsNavPreview(preview)
  }, [])

  const getActiveNavLink = useCallback(() => {
    if (router.pathname.startsWith('/admin') || isAiArea) return panelLinkRef.current
    if (router.pathname.startsWith('/tag')) return tagDemoLinkRef.current
    return null
  }, [isAiArea, router.pathname])

  useEffect(() => {
    if (shouldShowInitialLoader.current === null) {
      try {
        shouldShowInitialLoader.current = window.sessionStorage.getItem('telar:visited') !== 'true'
        if (shouldShowInitialLoader.current) window.sessionStorage.setItem('telar:visited', 'true')
      } catch {
        // If browser storage is unavailable, show the loader for this page visit.
        shouldShowInitialLoader.current = true
      }
    }

    if (!shouldShowInitialLoader.current) {
      setShowInitialLoader(false)
      return
    }

    const closeTimer = window.setTimeout(() => setIsInitialLoaderClosing(true), 4700)
    const removeTimer = window.setTimeout(() => setShowInitialLoader(false), 5000)
    return () => {
      window.clearTimeout(closeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [])

  useEffect(() => {
    const updateHeader = () => setIsHeaderScrolled(window.scrollY > 24)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  useEffect(() => {
    let isMounted = true
    const updateIndicator = () => {
      if (isMounted) moveNavIndicator(getActiveNavLink())
    }
    const frame = window.requestAnimationFrame(updateIndicator)
    window.addEventListener('resize', updateIndicator)
    void document.fonts?.ready.then(updateIndicator)
    return () => {
      isMounted = false
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [getActiveNavLink, moveNavIndicator])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const start = (url: string) => {
      if (url !== router.asPath) setIsNavigating(true)
      setIsMobileMenuOpen(false)
    }
    const finish = () => setIsNavigating(false)
    router.events.on('routeChangeStart', start)
    router.events.on('routeChangeComplete', finish)
    router.events.on('routeChangeError', finish)
    return () => {
      router.events.off('routeChangeStart', start)
      router.events.off('routeChangeComplete', finish)
      router.events.off('routeChangeError', finish)
    }
  }, [router])

  return (
    <div className={`app-shell${isAiArea ? ' ai-shell' : ''}${isHome ? ' home-shell' : ''}${isAdminWorkspace ? ' admin-app-shell' : ''}`}>
      {showInitialLoader && (
        <div className={`initial-loading-screen${isInitialLoaderClosing ? ' is-closing' : ''}`} role="status" aria-live="polite" aria-busy="true">
          <div className="initial-loading-brand">TELAR</div>
          <div className="initial-loading-center">
            <span className="initial-spinner-ring" aria-hidden="true" />
            <span className="initial-loading-title">Cargando</span>
            <span className="initial-loading-description">Estamos preparando todo para ti</span>
          </div>
          <div className="initial-loading-note">TELAR · TAG + AI</div>
        </div>
      )}
      {isNavigating && (
        <div className="route-loading-indicator" role="status" aria-live="polite">
          <span className="route-loading-spinner" aria-hidden="true" />
          <span>Cargando</span>
        </div>
      )}
      {isAdminWorkspace ? (
        <AdminNav><Component {...pageProps} /></AdminNav>
      ) : (
        <>
      <header className={`topbar floating-topbar${!showInitialLoader ? ' is-ready' : ''}${isHeaderScrolled ? ' is-scrolled' : ''}`}>
        <Link href="/" className="brand">
          <span className="brand-mark">T</span>
          <span>TELAR</span>
        </Link>
        <nav
          className="topnav"
          aria-label="Navegación principal"
          ref={topNavRef}
          onMouseLeave={() => moveNavIndicator(getActiveNavLink())}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget
            if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
              moveNavIndicator(getActiveNavLink())
            }
          }}
        >
          <span className={`nav-indicator${navIndicator.visible ? ' visible' : ''}${isNavPreview ? ' is-preview' : ''}`} style={{ left: `${navIndicator.left}px`, width: `${navIndicator.width}px` }} aria-hidden="true" />
          <span className={`nav-glow${navIndicator.visible ? ' visible' : ''}`} style={{ left: `${navIndicator.left + navIndicator.width / 2}px` }} aria-hidden="true" />
          <Link
            ref={panelLinkRef}
            className={router.pathname.startsWith('/admin') || isAiArea ? 'nav-link active' : 'nav-link'}
            href="/admin"
            onMouseEnter={(event) => moveNavIndicator(event.currentTarget, true)}
            onFocus={(event) => moveNavIndicator(event.currentTarget, true)}
          >Panel</Link>
          <Link
            ref={tagDemoLinkRef}
            className={router.pathname.startsWith('/tag') ? 'nav-link active' : 'nav-link'}
            href="/tag/demo123"
            onMouseEnter={(event) => moveNavIndicator(event.currentTarget, true)}
            onFocus={(event) => moveNavIndicator(event.currentTarget, true)}
          >TAG demo</Link>
        </nav>
        <button
          className={`menu-toggle${isMobileMenuOpen ? ' is-open' : ''}`}
          type="button"
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
      {isMobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <nav
            className="mobile-menu-panel"
            id="mobile-navigation"
            aria-label="Navegación móvil"
            onClick={(event) => event.stopPropagation()}
          >
            <Link href="/" className={router.pathname === '/' ? 'mobile-menu-link active' : 'mobile-menu-link'} onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
            <Link href="/admin" className={router.pathname.startsWith('/admin') || isAiArea ? 'mobile-menu-link active' : 'mobile-menu-link'} onClick={() => setIsMobileMenuOpen(false)}>Panel</Link>
            <Link href="/tag/demo123" className={router.pathname.startsWith('/tag') ? 'mobile-menu-link active' : 'mobile-menu-link'} onClick={() => setIsMobileMenuOpen(false)}>TAG demo</Link>
          </nav>
        </div>
      )}
      <main className="main-content">
        <Component {...pageProps} />
      </main>
        </>
      )}
      <ScrollOrbit />
      {!router.pathname.startsWith('/admin') && !isAiArea && router.pathname !== '/chat' && <ChatBubble />}
    </div>
  )
}
