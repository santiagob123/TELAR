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
  const [page, setPage] = useState(1)
  const [loadingOlder, setLoadingOlder] = useState<Record<string, boolean>>({})
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf' | null>(null)
  const [exportError, setExportError] = useState('')
  const [humanDrafts, setHumanDrafts] = useState<Record<string, string>>({})
  const [humanErrors, setHumanErrors] = useState<Record<string, string>>({})
  const [sendingHuman, setSendingHuman] = useState<string | null>(null)
  const [reopening, setReopening] = useState<string | null>(null)
  const filters = new URLSearchParams()
  if (appliedFromDate) filters.set('from', appliedFromDate)
  if (appliedToDate) filters.set('to', appliedToDate)
  const query = new URLSearchParams(filters)
  query.set('page', String(page))
  query.set('pageSize', '20')
  const queryString = query.toString()
  const { data, error, mutate, isLoading } = useSWR(`/api/ai/conversations${queryString ? `?${queryString}` : ''}`, fetcher)

  useEffect(() => {
    if (error?.status === 401) router.replace('/admin/login')
  }, [error, router])

  function applyFilters() {
    setPage(1)
    setAppliedFromDate(fromDate)
    setAppliedToDate(toDate)
  }

  function clearFilters() {
    setPage(1)
    setFromDate('')
    setToDate('')
    setAppliedFromDate('')
    setAppliedToDate('')
  }

  async function exportConversations(format: 'json' | 'csv' | 'pdf') {
    const exportFilters = filters.toString()
    const exportQueryString = exportFilters ? `?${exportFilters}` : ''
    const printWindow = format === 'pdf' ? window.open('', '_blank') : null
    if (format === 'pdf' && !printWindow) {
      setExportError('Permite las ventanas emergentes para preparar el PDF.')
      return
    }
    setExporting(true)
    setExportFormat(format)
    setExportError('')

    try {
      const endpoint = format === 'csv' ? 'export-csv' : 'export-json'
      const response = await fetch(`/api/ai/conversations/${endpoint}${exportQueryString}`)
      if (response.status === 401) {
        printWindow?.close()
        await router.replace('/admin/login')
        return
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'No se pudieron exportar las conversaciones.')
      }

      if (format === 'pdf') {
        const payload = await response.json()
        const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[character] as string))
        const dateLabel = (value: string) => new Intl.DateTimeFormat('es-CO', {
          dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota'
        }).format(new Date(value))
        const conversations = Array.isArray(payload.conversations) ? payload.conversations : []
        const rows = conversations.map((conversation: any) => `
          <article class="conversation">
            <header><div><h2>${escapeHtml(conversation.business?.name || 'TELAR AI')}</h2><p>Contacto: ${escapeHtml(conversation.from || 'No especificado')}</p></div>
              <p>Última actividad: ${escapeHtml(dateLabel(conversation.lastActivityAt || conversation.createdAt))}</p></header>
            <div class="messages">${(Array.isArray(conversation.messages) ? conversation.messages : []).map((message: any) => `
              <section class="message"><strong>${message.role === 'assistant' ? 'Asistente' : 'Cliente'}</strong><time>${escapeHtml(dateLabel(message.createdAt))}</time><p>${escapeHtml(message.content).replace(/\n/g, '<br>')}</p></section>`).join('')}
            </div>
          </article>`).join('')
        printWindow!.document.open()
        printWindow!.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>TELAR AI · Conversaciones</title>
          <style>
            @page { size: auto; margin: 16mm; }
            * { box-sizing: border-box; }
            body { margin: 0; color: #17232b; font: 12px/1.5 Arial, sans-serif; }
            h1 { margin: 0 0 4px; font-size: 24px; } h2 { margin: 0; font-size: 16px; }
            .report-head { margin-bottom: 20px; border-bottom: 2px solid #24405e; padding-bottom: 12px; }
            .report-head p, header p { margin: 4px 0 0; color: #526273; }
            .conversation { break-inside: avoid; margin: 0 0 18px; border: 1px solid #cbd5df; border-radius: 8px; padding: 12px; }
            .conversation header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #d9e0e7; padding-bottom: 8px; }
            .messages { padding-top: 4px; } .message { break-inside: avoid; border-bottom: 1px solid #edf0f3; padding: 8px 0; }
            .message:last-child { border: 0; } .message strong { color: #285b69; } .message time { float: right; color: #66788a; }
            .message p { margin: 5px 0 0; white-space: normal; overflow-wrap: anywhere; }
            .empty { color: #526273; }
          </style></head><body><div class="report-head"><h1>TELAR AI · Conversaciones</h1>
          <p>${conversations.length} conversaciones · Generado ${escapeHtml(dateLabel(payload.exportedAt || new Date().toISOString()))}</p>
          <p>Zona horaria: America/Bogota${payload.filters?.from || payload.filters?.to ? ` · Filtro: ${escapeHtml(payload.filters.from || 'inicio')} a ${escapeHtml(payload.filters.to || 'hoy')}` : ''}</p></div>
          ${rows || '<p class="empty">No hay conversaciones para los filtros seleccionados.</p>'}
          <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script></body></html>`)
        printWindow!.document.close()
      } else {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] || `telar-ai-conversations.${format}`
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error: any) {
      printWindow?.close()
      setExportError(error.message || 'No se pudieron exportar las conversaciones.')
    } finally {
      setExporting(false)
      setExportFormat(null)
    }
  }

  async function loadOlderMessages(conversation: any) {
    const oldest = conversation.messages?.[0]
    if (!oldest) return
    setLoadingOlder(previous => ({ ...previous, [conversation.id]: true }))
    try {
      const cursor = new URLSearchParams({
        beforeAt: new Date(oldest.createdAt).toISOString(),
        beforeId: oldest.id
      })
      const response = await fetch(`/api/ai/conversations/${conversation.id}/messages?${cursor}`)
      if (response.status === 401) {
        await router.replace('/admin/login')
        return
      }
      const data = await response.json()
      if (!response.ok || !Array.isArray(data.items)) throw new Error(data?.error || 'No se pudieron cargar mensajes anteriores.')
      await mutate((current: any) => current ? {
        ...current,
        items: current.items.map((item: any) => item.id === conversation.id
          ? { ...item, messages: [...data.items, ...item.messages], messagesHaveOlder: data.hasMore }
          : item)
      } : current, false)
    } catch (loadError) {
      setHumanErrors(previous => ({ ...previous, [conversation.id]: loadError instanceof Error ? loadError.message : 'No se pudieron cargar mensajes anteriores.' }))
    } finally {
      setLoadingOlder(previous => ({ ...previous, [conversation.id]: false }))
    }
  }

  const markHuman = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/ai/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'human' })
      })
      if (response.status === 401) {
        await router.replace('/admin/login')
        return
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'No se pudo derivar la conversación.')
      }
      await mutate()
    } catch (error: any) {
      setHumanErrors(previous => ({ ...previous, [id]: error.message || 'No se pudo derivar la conversación.' }))
    }
  }, [mutate, router])

  async function sendHumanMessage(id: string) {
    const text = (humanDrafts[id] || '').trim()
    if (!text) {
      setHumanErrors(previous => ({ ...previous, [id]: 'Escribe un mensaje antes de enviarlo.' }))
      return
    }

    setSendingHuman(id)
    setHumanErrors(previous => ({ ...previous, [id]: '' }))
    try {
      const response = await fetch(`/api/ai/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (response.status === 401) {
        await router.replace('/admin/login')
        return
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'No se pudo enviar el mensaje humano.')
      }
      setHumanDrafts(previous => ({ ...previous, [id]: '' }))
      await mutate()
    } catch (error: any) {
      setHumanErrors(previous => ({ ...previous, [id]: error.message || 'No se pudo enviar el mensaje humano.' }))
    } finally {
      setSendingHuman(null)
    }
  }

  async function reopenConversation(id: string) {
    setReopening(id)
    setHumanErrors(previous => ({ ...previous, [id]: '' }))
    try {
      const response = await fetch(`/api/ai/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'open' })
      })
      if (response.status === 401) {
        await router.replace('/admin/login')
        return
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'No se pudo reabrir la conversación.')
      }
      await mutate()
    } catch (error: any) {
      setHumanErrors(previous => ({ ...previous, [id]: error.message || 'No se pudo reabrir la conversación.' }))
    } finally {
      setReopening(null)
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="eyebrow mb-3">TELAR AI</p>
        <h1 className="text-3xl font-bold">Conversaciones</h1>
        <p className="muted mt-2">Revisa las interacciones y decide cuándo necesita intervenir tu equipo.</p>
      </div>
      {error && error.status !== 401 && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</p>
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
        <button type="button" onClick={() => void exportConversations('json')} disabled={exporting} className="rounded-lg border border-[#087f78] px-4 py-2 text-sm font-semibold text-[#075c59] disabled:opacity-50">{exporting && exportFormat === 'json' ? 'Generando...' : 'Descargar JSON'}</button>
        <button type="button" onClick={() => void exportConversations('csv')} disabled={exporting} className="rounded-lg border border-[#087f78] px-4 py-2 text-sm font-semibold text-[#075c59] disabled:opacity-50">{exporting && exportFormat === 'csv' ? 'Generando...' : 'Descargar CSV'}</button>
        <button type="button" onClick={() => void exportConversations('pdf')} disabled={exporting} className="rounded-lg border border-[#087f78] px-4 py-2 text-sm font-semibold text-[#075c59] disabled:opacity-50">{exporting && exportFormat === 'pdf' ? 'Preparando PDF...' : 'Imprimir / Guardar PDF'}</button>
      </div>
      {exportError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{exportError}</p>}
      <div className="space-y-4">
        {isLoading && <div role="status" className="surface p-6 text-center text-sm muted">Cargando conversaciones…</div>}
        {!isLoading && !error && data?.items?.length === 0 && <div className="surface p-6 text-center"><p className="font-semibold">No hay conversaciones para mostrar</p><p className="muted mt-2 text-sm">Cuando haya actividad, aparecerá aquí.</p></div>}
        {data?.items?.map((c: any) => (
          <div key={c.id} className="surface p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="text-sm"><span className="muted">Contacto</span><br /><strong>{c.from}</strong></div>
                {c.business && <div className="mt-2 text-sm"><span className="muted">Negocio</span><br /><strong>{c.business.name}</strong>{c.business.owner?.email && <><br /><span className="muted text-xs">Propietario: {c.business.owner.email}</span></>}</div>}
                <div className="mt-2 text-sm"><span className="muted">Última actividad</span><br /><strong>{new Date(c.lastActivityAt || c.createdAt).toLocaleString()}</strong></div>
              </div>
              <div>
                <span className="mr-3 rounded-full bg-[#e9f2ef] px-3 py-1 text-xs font-semibold text-[#075c59]">{c.state === 'human' ? 'Atención humana' : 'Asistente IA'}</span>
                {c.state === 'human' ? (
                  <button type="button" onClick={() => reopenConversation(c.id)} disabled={reopening === c.id} className="rounded-lg border border-[#cbd9d6] px-3 py-2 text-sm font-semibold text-[#075c59] disabled:opacity-50">
                    {reopening === c.id ? 'Reabriendo...' : 'Reabrir asistente'}
                  </button>
                ) : (
                  <button type="button" onClick={() => markHuman(c.id)} className="rounded-lg border border-[#e3b3ae] px-3 py-2 text-sm font-semibold text-[#a33b32]">Derivar a una persona</button>
                )}
              </div>
            </div>
            <div className="mt-2">
              {c.messagesHaveOlder && (
                <button type="button" onClick={() => void loadOlderMessages(c)} disabled={loadingOlder[c.id]} className="mb-2 text-sm font-semibold text-[#075c59] disabled:opacity-50">
                  {loadingOlder[c.id] ? 'Cargando…' : 'Cargar mensajes anteriores'}
                </button>
              )}
              {c.messages.map((m: any) => (
                <div key={m.id} className="border-t border-[#dfe7e5] py-2 text-sm"><span className="font-semibold">{m.from === 'human' ? 'Equipo' : m.from === 'agent' ? 'Asistente' : 'Cliente'}:</span> {m.text}</div>
              ))}
            </div>
            {humanErrors[c.id] && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{humanErrors[c.id]}</p>}
            {c.state === 'human' && (
              <form onSubmit={event => { event.preventDefault(); void sendHumanMessage(c.id) }} className="mt-4 flex gap-2 border-t border-[#dfe7e5] pt-4">
                <input
                  value={humanDrafts[c.id] || ''}
                  onChange={event => setHumanDrafts(previous => ({ ...previous, [c.id]: event.target.value }))}
                  maxLength={2000}
                  placeholder="Escribe una respuesta humana..."
                  aria-label={`Respuesta humana para ${c.from}`}
                  className="min-w-0 flex-1 rounded-lg border border-[#cbd9d6] px-3 py-2 text-sm outline-none focus:border-[#087f78]"
                />
                <button type="submit" disabled={sendingHuman === c.id} className="rounded-lg bg-[#087f78] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {sendingHuman === c.id ? 'Enviando...' : 'Responder'}
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
      {data && (
        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page <= 1} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">Anterior</button>
          <span className="muted text-sm">Página {page}</span>
          <button type="button" onClick={() => setPage(value => value + 1)} disabled={!data.hasMore} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">Siguiente</button>
        </div>
      )}
    </div>
  )
}
