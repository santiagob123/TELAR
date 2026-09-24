import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const fetcher = async (url: string) => {
  const response = await fetch(url)
  const data = await response.json()
  if (!response.ok) {
    const error: any = new Error(data?.error || 'No se pudieron cargar las conversaciones.')
    error.status = response.status
    throw error
  }
  return data
}

export default function AiConversations() {
  const router = useRouter()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [appliedFromDate, setAppliedFromDate] = useState('')
  const [appliedToDate, setAppliedToDate] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const query = new URLSearchParams()
  if (appliedFromDate) query.set('from', appliedFromDate)
  if (appliedToDate) query.set('to', appliedToDate)
  const queryString = query.toString()
  const { data, error, mutate } = useSWR(`/api/ai/conversations${queryString ? `?${queryString}` : ''}`, fetcher)

  useEffect(() => {
    // Redirige a /ai/login — NO a /admin/login
    if (error?.status === 401) router.replace('/ai/login')
  }, [error, router])

  function applyFilters() {
    setAppliedFromDate(fromDate)
    setAppliedToDate(toDate)
  }

  function clearFilters() {
    setFromDate('')
    setToDate('')
    setAppliedFromDate('')
    setAppliedToDate('')
  }

  async function exportJson() {
    const exportQuery = queryString ? `?${queryString}` : ''
    setExporting(true)
    setExportError('')

    try {
      const response = await fetch(`/api/ai/conversations/export-json${exportQuery}`)
      if (response.status === 401) {
        await router.replace('/ai/login')
        return
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'No se pudieron exportar las conversaciones.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] || 'telar-ai-conversations.json'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error: any) {
      setExportError(error.message || 'No se pudieron exportar las conversaciones.')
    } finally {
      setExporting(false)
    }
  }

  const markHuman = useCallback(async (id: string) => {
    const response = await fetch(`/api/ai/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'human' })
    })
    if (response.status === 401) {
      await router.replace('/ai/login')
      return
    }
    mutate()
  }, [mutate, router])

  return (
    <div>
      <div className="mb-7">
        <p className="eyebrow mb-3">TELAR AI</p>
        <h1 className="text-3xl font-bold">Conversaciones</h1>
        <p className="muted mt-2">Revisa las interacciones y decide cuándo necesita intervenir tu equipo.</p>
      </div>
      {error && error.status !== 401 && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</p>
      )}
      <div className="surface mb-5 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="mb-1 block text-xs font-semibold" htmlFor="conversation-from">Fecha desde</label>
          <input id="conversation-from" type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} className="rounded-lg border border-[#cbd9d6] px-3 py-2 text-sm outline-none focus:border-[#087f78]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" htmlFor="conversation-to">Fecha hasta</label>
          <input id="conversation-to" type="date" value={toDate} onChange={event => setToDate(event.target.value)} className="rounded-lg border border-[#cbd9d6] px-3 py-2 text-sm outline-none focus:border-[#087f78]" />
        </div>
        <button type="button" onClick={applyFilters} className="rounded-lg bg-[#087f78] px-4 py-2 text-sm font-semibold text-white">Aplicar</button>
        <button type="button" onClick={clearFilters} className="rounded-lg border border-[#cbd9d6] px-4 py-2 text-sm font-semibold text-[#075c59]">Limpiar</button>
        <button type="button" onClick={exportJson} disabled={exporting} className="rounded-lg border border-[#087f78] px-4 py-2 text-sm font-semibold text-[#075c59] disabled:opacity-50">{exporting ? 'Generando...' : 'Descargar JSON'}</button>
      </div>
      {exportError && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{exportError}</p>}
      <div className="space-y-4">
        {data?.map((c: any) => (
          <div key={c.id} className="surface p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="text-sm"><span className="muted">Contacto</span><br /><strong>{c.from}</strong></div>
                <div className="mt-2 text-sm"><span className="muted">Última actividad</span><br /><strong>{new Date(c.lastActivityAt || c.createdAt).toLocaleString()}</strong></div>
              </div>
              <div>
                <span className="mr-3 rounded-full bg-[#e9f2ef] px-3 py-1 text-xs font-semibold text-[#075c59]">{c.state === 'human' ? 'Atención humana' : 'Asistente IA'}</span>
                <button onClick={() => markHuman(c.id)} className="rounded-lg border border-[#e3b3ae] px-3 py-2 text-sm font-semibold text-[#a33b32]">Derivar a una persona</button>
              </div>
            </div>
            <div className="mt-2">
              {c.messages.map((m: any) => (
                <div key={m.id} className="border-t border-[#dfe7e5] py-2 text-sm"><span className="font-semibold">{m.from === 'agent' ? 'Asistente' : 'Cliente'}:</span> {m.text}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}