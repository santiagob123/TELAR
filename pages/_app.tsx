import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminNav from '../components/AdminNav'
import AiNav from '../components/AiNav'
import ChatBubble from '../components/ChatBubble'

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
          <Link className={router.pathname.startsWith('/ai') ? 'nav-link active' : 'nav-link'} href="/ai/login">TELAR AI</Link>
          <Link className={router.pathname.startsWith('/tag') ? 'nav-link active' : 'nav-link'} href="/tag/demo123">TAG demo</Link>
        </nav>
        <span className="demo-badge">Modo demo</span>
      </header>
      <main className="main-content">
        {router.pathname.startsWith('/admin') && router.pathname !== '/admin/login' && <AdminNav />}
        {router.pathname.startsWith('/ai') && router.pathname !== '/ai/login' && <AiNav />}
        <Component {...pageProps} />
      </main>
      {!router.pathname.startsWith('/admin') && !router.pathname.startsWith('/ai') && router.pathname !== '/chat' && <ChatBubble />}
    </div>
  )
}
