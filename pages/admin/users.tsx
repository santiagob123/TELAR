import { FormEvent, useEffect, useState } from 'react'

type ManagedUser = {
  id: string
  email: string
  name: string | null
  createdAt: string
  role: 'admin' | 'owner'
  businesses: Array<{ id: string; name: string }>
}

export default function AdminUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadUsers() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'No se pudieron cargar las cuentas.')
      setUsers(Array.isArray(data.users) ? data.users : [])
      setError('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las cuentas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadUsers() }, [])

  async function createOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'No se pudo crear la cuenta.')
      setUsers(current => [...current, data.user as ManagedUser].sort((left, right) => left.email.localeCompare(right.email)))
      setName('')
      setEmail('')
      setPassword('')
      setNotice('Cuenta de propietario creada. Comparte la contraseña inicial por un canal seguro.')
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'No se pudo crear la cuenta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="eyebrow mb-3">ADMINISTRACIÓN</p>
        <h1 className="text-3xl font-bold">Usuarios y propietarios</h1>
        <p className="muted mt-2">El administrador gestiona las cuentas; cada propietario accede solo a los negocios asignados.</p>
      </div>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-lg border border-[#cbd9d6] bg-[#e9f2ef] p-3 text-sm">{notice}</p>}

      <section className="surface mb-7 p-5 sm:p-7">
        <h2 className="text-lg font-bold">Crear cuenta de propietario</h2>
        <p className="muted mt-1 text-sm">La contraseña inicial se guarda como hash y no se vuelve a mostrar. Debe tener al menos 12 caracteres.</p>
        <form onSubmit={event => void createOwner(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Nombre
            <input value={name} onChange={event => setName(event.target.value)} maxLength={120} autoComplete="name" className="mt-1 w-full rounded-lg border border-[#cbd9d6] bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Correo
            <input type="email" required value={email} onChange={event => setEmail(event.target.value)} maxLength={254} autoComplete="email" className="mt-1 w-full rounded-lg border border-[#cbd9d6] bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Contraseña inicial
            <input type="password" required minLength={12} maxLength={200} value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" className="mt-1 w-full rounded-lg border border-[#cbd9d6] bg-white px-3 py-2 text-sm sm:max-w-md" />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-[#087f78] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066d67] disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Creando cuenta…' : 'Crear propietario'}
            </button>
          </div>
        </form>
      </section>

      <section aria-label="Cuentas registradas">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Cuentas registradas</h2>
            <p className="muted mt-1 text-sm">El rol admin se determina por `ADMIN_USER_ID`; las demás cuentas son propietarias.</p>
          </div>
          <button type="button" onClick={() => void loadUsers()} disabled={loading} className="rounded-lg border border-[#cbd9d6] px-3 py-2 text-sm font-semibold disabled:opacity-60">Actualizar</button>
        </div>

        {loading ? <p className="muted surface p-5">Cargando cuentas…</p> : users.length === 0 ? <p className="muted surface p-5">No hay cuentas registradas.</p> : (
          <div className="grid gap-3">
            {users.map(user => (
              <article key={user.id} className="surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{user.name || user.email}</h3>
                    {user.name && <p className="muted mt-0.5 text-sm">{user.email}</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${user.role === 'admin' ? 'bg-[#d7efe9] text-[#075c59]' : 'bg-[#eef1f0] text-[#4b5a59]'}`}>
                    {user.role === 'admin' ? 'Admin' : 'Propietario'}
                  </span>
                </div>
                <div className="mt-3 border-t border-[#dfe7e5] pt-3">
                  <p className="muted text-xs">Negocios asignados · {user.businesses.length}</p>
                  {user.businesses.length > 0 ? <ul className="mt-2 flex flex-wrap gap-2">
                    {user.businesses.map(business => <li key={business.id} className="rounded-full border border-[#dfe7e5] px-3 py-1 text-xs">{business.name}</li>)}
                  </ul> : <p className="muted mt-1 text-sm">Sin negocios asignados</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
