import { useState } from 'react'
import Link from 'next/link'
import TagQr from '../../components/TagQr'

export default function TagsAdmin() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    contactPhone: '',
    whatsapp: '',
    identifier: '',
    status: 'active',
    email: '',
    address: '',
    openingHours: '',
    website: '',
    instagram: '',
    facebook: '',
    linkedin: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function create(e: any) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tags', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Error al crear')
      setResult(data)
      setForm({ name: '', description: '', contactPhone: '', whatsapp: '', identifier: '', status: 'active', email: '', address: '', openingHours: '', website: '', instagram: '', facebook: '', linkedin: '' })
    } catch (err: any) {
      setError(err.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="eyebrow mb-3">TELAR TAG</p>
        <h1 className="text-3xl font-bold">Crear un nuevo negocio</h1>
        <p className="muted mt-2">Completa los datos para crear un perfil digital con su TAG único.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Formulario */}
        <div className="surface p-5 sm:p-7">
          <h2 className="font-semibold mb-4">Información del negocio</h2>
          <form onSubmit={create} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Nombre del negocio *</label>
              <input 
                required
                placeholder="Ej: Cafetería El Puente" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Descripción (breve) *</label>
              <textarea 
                required
                placeholder="Ej: Los mejores cafés y pasteles del barrio" 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition h-24"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Teléfono *</label>
                <input 
                  required
                  placeholder="Ej: +1 234 567 8900" 
                  value={form.contactPhone} 
                  onChange={e => setForm({ ...form, contactPhone: e.target.value })} 
                  className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">WhatsApp *</label>
                <input 
                  required
                  placeholder="Ej: +1 234 567 8900" 
                  value={form.whatsapp} 
                  onChange={e => setForm({ ...form, whatsapp: e.target.value })} 
                  className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Identificador del TAG</label>
                <input 
                  placeholder="Ej: tagcafe123" 
                  value={form.identifier} 
                  onChange={e => setForm({ ...form, identifier: e.target.value })} 
                  className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Estado inicial</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Correo electrónico</label>
                <input 
                  type="email"
                  placeholder="Ej: contacto@negocio.com" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Sitio web</label>
                <input 
                  placeholder="https://ejemplo.com" 
                  value={form.website} 
                  onChange={e => setForm({ ...form, website: e.target.value })} 
                  className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Dirección</label>
              <input 
                placeholder="Ej: Av. San Martín 123" 
                value={form.address} 
                onChange={e => setForm({ ...form, address: e.target.value })} 
                className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Horarios</label>
              <input 
                placeholder="Ej: Lun a Vie 9:00 - 18:00" 
                value={form.openingHours} 
                onChange={e => setForm({ ...form, openingHours: e.target.value })} 
                className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Instagram</label>
                <input 
                  placeholder="@negocio" 
                  value={form.instagram} 
                  onChange={e => setForm({ ...form, instagram: e.target.value })} 
                  className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Facebook</label>
                <input 
                  placeholder="@negocio" 
                  value={form.facebook} 
                  onChange={e => setForm({ ...form, facebook: e.target.value })} 
                  className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">LinkedIn</label>
                <input 
                  placeholder="@negocio" 
                  value={form.linkedin} 
                  onChange={e => setForm({ ...form, linkedin: e.target.value })} 
                  className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
            <button 
              disabled={loading}
              className="w-full rounded-lg bg-[#087f78] px-5 py-3 font-semibold text-white transition hover:bg-[#075c59] disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear negocio y TAG'}
            </button>
          </form>
        </div>

        {/* Información o Resultado */}
        <div className="surface p-5 sm:p-7">
          {!result ? (
            <div>
              <h2 className="font-semibold mb-4">¿Qué sucede?</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="text-[#087f78] font-bold">1.</span>
                  <div>
                    <strong>Se crea un perfil digital</strong>
                    <p className="muted mt-1">Con toda la información de tu negocio.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#087f78] font-bold">2.</span>
                  <div>
                    <strong>Se genera un TAG único</strong>
                    <p className="muted mt-1">Un código especial que puedes asociar a una etiqueta física.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#087f78] font-bold">3.</span>
                  <div>
                    <strong>Tu cliente verá una experiencia moderna</strong>
                    <p className="muted mt-1">Al acercar su teléfono, verá tu perfil actualizado en tiempo real.</p>
                  </div>
                </li>
              </ul>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="font-semibold text-lg mb-2">¡Negocio creado exitosamente!</h3>
              <p className="muted text-sm mb-4">{result.business.name}</p>
              
              <div className="bg-[#f5f8f6] border border-[#cbd9d6] rounded-lg p-4 my-4 text-left">
                <p className="text-xs font-semibold text-[#63717a] mb-1">TU TAG ÚNICO</p>
                <p className="text-lg font-mono font-bold text-[#087f78]">{result.tag.identifier}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${result.tag.status === 'inactive' ? 'bg-[#fff0ee] text-[#a33b32]' : 'bg-[#e9f2ef] text-[#075c59]'}`}>
                    {result.tag.status === 'inactive' ? 'INACTIVO' : 'ACTIVO'}
                  </span>
                </div>
                <p className="text-xs muted mt-2">Guarda este código para asociarlo a tu etiqueta física.</p>
              </div>

              <TagQr identifier={result.tag.identifier} />

              <div className="space-y-2">
                <Link 
                  href="/admin/profile" 
                  className="w-full block rounded-lg bg-[#087f78] px-5 py-3 font-semibold text-white transition hover:bg-[#075c59] text-center"
                >
                  Editar perfil y detalles
                </Link>
                <button 
                  onClick={() => setResult(null)}
                  className="w-full rounded-lg bg-[#f5f8f6] px-5 py-3 font-semibold text-[#087f78] transition hover:bg-[#e9f2ef]"
                >
                  Crear otro negocio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
