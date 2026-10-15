import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type KnowledgeEntry = { id: string; title: string; content: string; isEditable: boolean; businessId: string; businessName: string; ownerEmail?: string | null }

export default function AiKnowledgePage() {
  const router = useRouter()
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [globalAdmin, setGlobalAdmin] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    async function loadEntries() {
      try {
        const response = await fetch('/api/ai/knowledge')
        if (response.status === 401) {
          await router.replace('/admin/login')
          return
        }
        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          throw new Error(`La API de Knowledge Base devolvió una respuesta inesperada (HTTP ${response.status}). Revisa que la base de datos esté disponible y la migración de Knowledge Base aplicada.`)
        }
        const data = await response.json()
        if (!response.ok || !Array.isArray(data?.entries)) throw new Error(data?.error || 'No se pudo cargar la Knowledge Base.')
        setGlobalAdmin(Boolean(data.globalAdmin))
        setEntries(data.entries)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la Knowledge Base.')
      } finally {
        setLoading(false)
      }
    }
    void loadEntries()
  }, [router])

  function startEdit(entry: KnowledgeEntry) {
    setEditingId(entry.id)
    setTitle(entry.title)
    setContent(entry.content)
    setError('')
    setNotice('')
  }

  function clearForm() {
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  async function saveEntry(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(editingId ? `/api/ai/knowledge/${editingId}` : '/api/ai/knowledge', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })
      if (response.status === 401) {
        await router.replace('/admin/login')
        return
      }
      const data = response.status === 204 ? null : await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'No se pudo guardar la entrada.')
      if (data) {
        setEntries(previous => editingId
          ? previous.map(entry => entry.id === editingId ? data : entry)
          : [...previous, data].sort((a, b) => a.title.localeCompare(b.title)))
      }
      clearForm()
      setNotice('Entrada guardada.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la entrada.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteEntry(entry: KnowledgeEntry) {
    if (!window.confirm(`¿Eliminar la entrada “${entry.title}”?`)) return
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/ai/knowledge/${entry.id}`, { method: 'DELETE' })
      if (response.status === 401) {
        await router.replace('/admin/login')
        return
      }
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'No se pudo eliminar la entrada.')
      setEntries(previous => previous.filter(item => item.id !== entry.id))
      if (editingId === entry.id) clearForm()
      setNotice('Entrada eliminada.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la entrada.')
    }
  }

  const systemEntries = entries.filter(entry => !entry.isEditable)
  const customEntries = entries.filter(entry => entry.isEditable)

  return (
    <div>
      <div className="mb-7">
        <p className="eyebrow mb-3">TELAR AI</p>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="muted mt-2">{globalAdmin ? 'Vista global de la base de conocimiento de todos los negocios.' : 'Las entradas del sistema se mantienen como referencia. Aquí puedes crear y administrar conocimiento propio.'}</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg border border-[#cbd9d6] bg-[#e9f2ef] p-3 text-sm">{notice}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="surface p-5">
          <h2 className="font-bold">{globalAdmin ? 'Conocimiento personalizado' : 'Conocimiento propio'} ({customEntries.length})</h2>
          {loading ? <p className="muted mt-3 text-sm">Cargando…</p> : customEntries.length === 0 ? (
            <p className="muted mt-3 text-sm">Todavía no hay entradas personalizadas.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#dfe7e5]">
              {customEntries.map(entry => (
                <li key={entry.id} className="py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{entry.title}</h3>
                      {globalAdmin && <p className="muted mt-1 text-xs">{entry.businessName} · {entry.ownerEmail || 'Sin propietario asignado'}</p>}
                      <p className="muted mt-1 whitespace-pre-wrap break-words text-sm">{entry.content}</p>
                    </div>
                    {!globalAdmin && <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(entry)} className="text-sm font-semibold text-[#075c59]">Editar</button>
                      <button type="button" onClick={() => void deleteEntry(entry)} className="text-sm font-semibold text-[#a33b32]">Eliminar</button>
                    </div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {globalAdmin ? <aside className="surface p-5"><h2 className="font-bold">Administración global</h2><p className="muted mt-2 text-sm">Esta vista reúne el conocimiento de todos los negocios. Para conservar el contexto de cada propietario, la edición de estas entradas se realiza desde la cuenta propietaria.</p></aside> : <form onSubmit={saveEntry} className="surface space-y-4 p-5">
          <h2 className="font-bold">{editingId ? 'Editar entrada' : 'Agregar conocimiento'}</h2>
          <div>
            <label htmlFor="knowledge-title" className="mb-1 block text-sm font-semibold">Título</label>
            <input id="knowledge-title" required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} className="w-full rounded-lg border p-3" />
          </div>
          <div>
            <label htmlFor="knowledge-content" className="mb-1 block text-sm font-semibold">Contenido</label>
            <textarea id="knowledge-content" required maxLength={12000} rows={9} value={content} onChange={event => setContent(event.target.value)} className="w-full rounded-lg border p-3" />
          </div>
          <div className="flex gap-3">
            <button disabled={saving} className="rounded-lg bg-[#087f78] px-4 py-2 font-semibold text-white disabled:opacity-50">
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar entrada'}
            </button>
            {editingId && <button type="button" onClick={clearForm} className="rounded-lg border px-4 py-2 font-semibold">Cancelar</button>}
          </div>
        </form>}
      </div>

      <section className="surface mt-5 p-5">
        <h2 className="font-bold">Entradas del sistema ({systemEntries.length})</h2>
        <p className="muted mt-1 text-sm">Estas entradas son de solo lectura y las mantiene el proyecto.</p>
        {systemEntries.map(entry => <details key={entry.id} className="border-b border-[#dfe7e5] py-3 last:border-0">
          <summary className="cursor-pointer font-semibold">{entry.title}{globalAdmin ? ` · ${entry.businessName} · ${entry.ownerEmail || 'Sin propietario asignado'}` : ''}</summary>
          <p className="muted mt-2 whitespace-pre-wrap text-sm">{entry.content}</p>
        </details>)}
      </section>
    </div>
  )
}
