import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import TagQr from '../../components/TagQr'

type Profile = any

export default function ProfileAdmin(){
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfiles() {
      const response = await fetch('/api/profiles')
      if (response.status === 401) {
        await router.replace('/admin/login')
        return
      }
      const data = await response.json()
      if (!response.ok || !Array.isArray(data)) {
        setError(data?.error || 'No se pudieron cargar los perfiles.')
        return
      }
      setProfiles(data)
    }
    loadProfiles().catch(() => setError('No se pudieron cargar los perfiles.'))
  }, [router])

  async function save(e:any){
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    setSaveSuccess(false)
    try {
      const res = await fetch(`/api/profiles/${selected.id}`, { 
        method: 'PATCH', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ 
          title: selected.title, 
          description: selected.description,
          contactPhone: selected.business?.contactPhone || '', 
          whatsapp: selected.business?.whatsapp || '',
          email: selected.business?.email || '',
          address: selected.business?.address || '',
          openingHours: selected.business?.openingHours || '',
          website: selected.business?.website || '',
          instagram: selected.business?.instagram || '',
          facebook: selected.business?.facebook || '',
          linkedin: selected.business?.linkedin || ''
        }) 
      })
      const data = await res.json()
      if (res.status === 401) {
        await router.replace('/admin/login')
        return
      }
      if (!res.ok) throw new Error(data?.error || 'Error al guardar')
      setProfiles(p=>p.map(x=> x.id===data.id ? data : x))
      setSelected(data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err:any) {
      alert(err.message || 'Error al guardar los cambios')
    } finally {
      setLoading(false)
    }
  }

  async function toggleTagStatus() {
    if (!selected?.tags?.[0]) return
    const tag = selected.tags[0]
    const nextStatus = tag.status === 'active' ? 'inactive' : 'active'

    try {
      const res = await fetch(`/api/tags/${tag.identifier}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      const data = await res.json()
      if (res.status === 401) {
        await router.replace('/admin/login')
        return
      }
      if (!res.ok) throw new Error(data?.error || 'No se pudo cambiar el estado del TAG')

      setProfiles(prev => prev.map((profile: any) => {
        if (profile.id !== selected.id) return profile
        return {
          ...profile,
          tags: profile.tags?.map((item: any) => item.id === tag.id ? { ...item, status: nextStatus } : item)
        }
      }))

      setSelected({
        ...selected,
        tags: selected.tags.map((item: any) => item.id === tag.id ? { ...item, status: nextStatus } : item)
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err:any) {
      alert(err.message || 'Error al cambiar el estado del TAG')
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="eyebrow mb-3">TELAR TAG</p>
        <h1 className="text-3xl font-bold">Administrar perfiles públicos</h1>
        <p className="muted mt-2">Edita cómo verá tu cliente la información cuando abra tu TAG.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[.85fr_1.5fr]">
        
        {/* Lista de Perfiles */}
        <div className="surface p-5">
          <h2 className="font-bold">Tus negocios</h2>
          <p className="muted mt-1 text-sm">Selecciona uno para editar su información pública.</p>
          {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {profiles.length === 0 ? (
            <div className="py-6 text-center">
              <p className="muted text-sm mb-3">No hay negocios aún</p>
              <Link href="/admin/tags" className="text-sm font-semibold text-[#087f78]">Crear el primer negocio →</Link>
            </div>
          ) : (
            <ul>
              {profiles.map(p=> (
                <li key={p.id} className="border-b border-[#dfe7e5] py-3 last:border-0">
                  <button 
                    className={`w-full text-left transition ${selected?.id === p.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                    onClick={()=>setSelected(p)}
                  >
                    <span className="block font-semibold">{p.title}</span>
                    <span className="muted block text-sm">{p.business?.name}</span>
                  </button>
                  {p.tags?.length ? (
                    <div className="mt-2 space-y-2">
                      {p.tags.map((tag: any) => (
                        <div key={tag.id} className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/tag/${tag.identifier}`}
                            className="inline-block text-xs font-semibold text-[#087f78] hover:underline"
                          >
                            Ver público →
                          </Link>
                          <span className="text-xs muted">ID: {tag.identifier}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tag.status === 'inactive' ? 'bg-[#fff0ee] text-[#a33b32]' : 'bg-[#e9f2ef] text-[#075c59]'}`}>
                            {tag.status === 'inactive' ? 'INACTIVO' : 'ACTIVO'}
                          </span>
                          <TagQr identifier={tag.identifier} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="muted mt-1 block text-xs">⚠ Sin TAG asignado</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Editor de Perfil */}
        <div className="surface p-5 sm:p-7">
          {selected ? (
            <form onSubmit={save} className="space-y-4">
              <div>
                <p className="text-xs eyebrow mb-4">Editando: {selected.business?.name}</p>
              </div>

              {/* Sección Información Pública */}
              <div className="pb-4 border-b border-[#dfe7e5]">
                <h3 className="font-semibold mb-3 text-sm">Información que verá el cliente</h3>
                
                <div>
                  <label className="mb-1 block text-sm font-semibold">Nombre del negocio (título)</label>
                  <input 
                    className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                    value={selected.title} 
                    onChange={e=>setSelected({...selected, title: e.target.value})} 
                  />
                  <p className="muted text-xs mt-1">Esto aparecerá como título en la experiencia pública.</p>
                </div>
              </div>

              <div className="pb-4 border-b border-[#dfe7e5]">
                <label className="mb-1 block text-sm font-semibold">Descripción</label>
                <textarea 
                  className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition h-20" 
                  value={selected.description} 
                  onChange={e=>setSelected({...selected, description: e.target.value})}
                />
              </div>

              {/* Sección Contacto */}
              <div className="pb-4 border-b border-[#dfe7e5]">
                <h3 className="font-semibold mb-3 text-sm">Información de contacto</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Teléfono</label>
                    <input 
                      className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                      value={selected.business?.contactPhone || ''} 
                      onChange={e=>setSelected({...selected, business: {...selected.business, contactPhone: e.target.value}})} 
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">WhatsApp</label>
                    <input 
                      className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                      value={selected.business?.whatsapp || ''} 
                      onChange={e=>setSelected({...selected, business: {...selected.business, whatsapp: e.target.value}})} 
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Correo</label>
                    <input 
                      className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                      value={selected.business?.email || ''} 
                      onChange={e=>setSelected({...selected, business: {...selected.business, email: e.target.value}})} 
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Sitio web</label>
                    <input 
                      className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                      value={selected.business?.website || ''} 
                      onChange={e=>setSelected({...selected, business: {...selected.business, website: e.target.value}})} 
                    />
                  </div>
                </div>
              </div>

              <div className="pb-4 border-b border-[#dfe7e5]">
                <h3 className="font-semibold mb-3 text-sm">Más información</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Dirección</label>
                    <input 
                      className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                      value={selected.business?.address || ''} 
                      onChange={e=>setSelected({...selected, business: {...selected.business, address: e.target.value}})} 
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Horarios</label>
                    <input 
                      className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                      value={selected.business?.openingHours || ''} 
                      onChange={e=>setSelected({...selected, business: {...selected.business, openingHours: e.target.value}})} 
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Instagram</label>
                    <input 
                      className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                      value={selected.business?.instagram || ''} 
                      onChange={e=>setSelected({...selected, business: {...selected.business, instagram: e.target.value}})} 
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Facebook</label>
                    <input 
                      className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                      value={selected.business?.facebook || ''} 
                      onChange={e=>setSelected({...selected, business: {...selected.business, facebook: e.target.value}})} 
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">LinkedIn</label>
                    <input 
                      className="w-full rounded-lg border border-[#cbd9d6] p-3 focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8] outline-none transition" 
                      value={selected.business?.linkedin || ''} 
                      onChange={e=>setSelected({...selected, business: {...selected.business, linkedin: e.target.value}})} 
                    />
                  </div>
                </div>
              </div>

              {/* Imagen (Deshabilitado) */}
              <div className="pb-4">
                <label className="mb-1 block text-sm font-semibold text-[#63717a]">Imagen (logo o foto)</label>
                <div className="w-full cursor-not-allowed rounded-lg border border-[#dfe7e5] bg-[#f5f8f6] p-3 text-[#63717a]">
                  Próximamente en futuras versiones
                </div>
                <p className="muted mt-1 text-xs">Estamos preparando esta funcionalidad para ti.</p>
              </div>

              {/* Mensajes de feedback */}
              {saveSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  ✓ Cambios guardados correctamente
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#dfe7e5]">
                <button 
                  disabled={loading}
                  className="rounded-lg bg-[#087f78] px-5 py-3 font-semibold text-white transition hover:bg-[#075c59] disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
                {selected.tags?.[0] && (
                  <>
                    <button
                      type="button"
                      onClick={toggleTagStatus}
                      className="rounded-lg border border-[#cbd9d6] bg-[#f5f8f6] px-5 py-3 font-semibold text-[#17232b] transition hover:bg-[#e9f2ef]"
                    >
                      {selected.tags[0].status === 'active' ? 'Desactivar TAG' : 'Activar TAG'}
                    </button>
                    <Link 
                      href={`/tag/${selected.tags[0].identifier}`} 
                      className="rounded-lg bg-[#f5f8f6] px-5 py-3 font-semibold text-[#087f78] transition hover:bg-[#e9f2ef]"
                    >
                      Ver cómo se ve público →
                    </Link>
                  </>
                )}
              </div>
            </form>
          ) : (
            <div className="flex min-h-64 items-center justify-center text-center">
              <div>
                <p className="text-lg font-semibold">Selecciona un perfil</p>
                <p className="muted mt-2 text-sm">Elige uno de tus negocios para editar cómo verán tus clientes la información.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
