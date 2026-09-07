import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">T</span>
          <span>TELAR</span>
        </Link>
        <nav className="topnav" aria-label="Navegacion principal">
          <Link className={router.pathname.startsWith('/admin') ? 'nav-link active' : 'nav-link'} href="/admin">Panel</Link>
          <Link className={router.pathname.startsWith('/tag') ? 'nav-link active' : 'nav-link'} href="/tag/demo123">TAG demo</Link>
        </nav>
        <span className="demo-badge">Modo demo</span>
      </header>
      <main className="main-content">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
