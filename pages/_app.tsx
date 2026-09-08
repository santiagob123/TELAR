import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'
import AiNav from '../components/AiNav'
import ChatBubble from '../components/ChatBubble'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isAiArea = router.pathname.startsWith('/ai')
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    const start = (url: string) => {
      if (url !== router.asPath) setIsNavigating(true)
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
    <div className={`app-shell ${isAiArea ? 'ai-shell' : ''}`}>
      {isNavigating && <div className="route-progress" aria-label="Cargando página" />}
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">T</span>
          <span>TELAR</span>
        </Link>
        <nav className="topnav" aria-label="Navegacion principal">
          <Link className={router.pathname.startsWith('/admin') ? 'nav-link active' : 'nav-link'} href="/admin">Panel</Link>
          <Link className={router.pathname.startsWith('/ai') ? 'nav-link active' : 'nav-link'} href="/ai/login">TELAR AI</Link>
          <Link className={router.pathname.startsWith('/tag') ? 'nav-link active' : 'nav-link'} href="/tag/demo123">TAG demo</Link>
        </nav>
        <span className="demo-badge">Modo demo</span>
      </header>
      <main className={`main-content ${isNavigating ? 'is-navigating' : ''}`}>
        {router.pathname.startsWith('/admin') && router.pathname !== '/admin/login' && <AdminNav />}
        {router.pathname.startsWith('/ai') && router.pathname !== '/ai/login' && <AiNav />}
        <Component {...pageProps} />
      </main>
      {!router.pathname.startsWith('/admin') && !router.pathname.startsWith('/ai') && router.pathname !== '/chat' && <ChatBubble />}
    </div>
  )
}
