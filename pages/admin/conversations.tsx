import useSWR from 'swr'
import { useCallback, useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const fetcher = async (url:string) => {
  const response = await fetch(url)
  const data = await response.json()
  if (!response.ok) {
    const error: any = new Error(data?.error || 'No se pudieron cargar las conversaciones.')
    error.status = response.status
    throw error
  }
  return data
}

export default function Conversations(){
  const router = useRouter()
  const { data, error, mutate, isLoading } = useSWR('/api/ai/conversations', fetcher)
  const [actionError, setActionError] = useState('')
  const [actingId, setActingId] = useState<string | null>(null)

  useEffect(() => {
    if (error?.status === 401) router.replace('/admin/login')
  }, [error, router])

  const markHuman = useCallback(async (id:string)=>{
    setActionError('')
    setActingId(id)
    try {
      const response = await fetch(`/api/ai/conversations/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ state: 'human' }) })
      if (response.status === 401) {
        await router.replace('/admin/login')
        return
      }
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result?.error || 'No se pudo derivar la conversación.')
      await mutate()
    } catch (actionError) {
      setActionError(actionError instanceof Error ? actionError.message : 'No se pudo derivar la conversación.')
    } finally {
      setActingId(null)
    }
  }, [mutate, router])

  return (
    <div>
      <div className="mb-7">
        <p className="eyebrow mb-3">TELAR AI</p>
        <h1 className="text-3xl font-bold">Conversaciones</h1>
        <p className="muted mt-2">Revisa las interacciones y decide cuándo necesita intervenir tu equipo.</p>
      </div>
      {error && error.status !== 401 && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</p>}
      {actionError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
      <div className="space-y-4">
        {isLoading && <div role="status" className="surface p-6 text-center text-sm muted">Cargando conversaciones…</div>}
        {!isLoading && !error && data?.length === 0 && <div className="surface p-6 text-center"><p className="font-semibold">No hay conversaciones para mostrar</p><p className="muted mt-2 text-sm">Cuando haya actividad, aparecerá aquí.</p></div>}
        {data?.map((c:any)=> (
          <div key={c.id} className="surface p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="text-sm"><span className="muted">Contacto</span><br /><strong>{c.from}</strong></div>
                <div className="mt-2 text-sm"><span className="muted">Recibida</span><br /><strong>{new Date(c.createdAt).toLocaleString()}</strong></div>
              </div>
              <div>
                <span className="mr-3 rounded-full bg-[#e9f2ef] px-3 py-1 text-xs font-semibold text-[#075c59]">{c.state === 'human' ? 'Atención humana' : 'Asistente IA'}</span>
                {c.state !== 'human' && <button type="button" onClick={()=>markHuman(c.id)} disabled={actingId === c.id} className="rounded-lg border border-[#e3b3ae] px-3 py-2 text-sm font-semibold text-[#a33b32] disabled:opacity-50">{actingId === c.id ? 'Derivando…' : 'Derivar a una persona'}</button>}
              </div>
            </div>
            <div className="mt-2">
              {c.messages.map((m:any)=> (
                <div key={m.id} className="border-t border-[#dfe7e5] py-2 text-sm"><span className="font-semibold">{m.from === 'agent' ? 'Asistente' : 'Cliente'}:</span> {m.text}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
