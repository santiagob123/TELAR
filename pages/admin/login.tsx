import { FormEvent, useState } from 'react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(token ? { token } : { email, password })
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'No se pudo iniciar sesión.')
      }
      setPassword('')
      window.location.assign('/admin')
    } catch (loginError: any) {
      setError(loginError.message || 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="surface p-6 sm:p-8">
        <p className="eyebrow mb-3">TELAR TAG</p>
        <h1 className="text-3xl font-bold">Acceso administrativo</h1>
        <p className="muted mt-2">Inicia sesión con la cuenta propietaria de tus negocios.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold" htmlFor="admin-email">Correo</label>
          <input id="admin-email" type="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-lg border border-[#cbd9d6] p-3 outline-none focus:border-[#087f78]" autoComplete="username" required={!token} />
          <label className="block text-sm font-semibold" htmlFor="admin-password">Contraseña</label>
          <input id="admin-password" type="password" value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-lg border border-[#cbd9d6] p-3 outline-none focus:border-[#087f78]" autoComplete="current-password" required={!token} />
          <details className="text-sm text-slate-600">
            <summary className="cursor-pointer">Usar token de compatibilidad</summary>
            <input aria-label="Token administrativo" type="password" value={token} onChange={event => setToken(event.target.value)} className="mt-2 w-full rounded-lg border border-[#cbd9d6] p-3 outline-none focus:border-[#087f78]" autoComplete="off" />
          </details>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-[#087f78] px-5 py-3 font-semibold text-white disabled:opacity-50">
            {loading ? 'Comprobando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
