import useSWR from 'swr'
import { useCallback } from 'react'

const fetcher = (url:string)=> fetch(url).then(r=>r.json())

export default function Conversations(){
  const { data, mutate } = useSWR('/api/ai/conversations', fetcher)

  const markHuman = useCallback(async (id:string)=>{
    await fetch(`/api/ai/conversations/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ state: 'human' }) })
    mutate()
  }, [mutate])

  return (
    <div>
      <div className="mb-7">
        <p className="eyebrow mb-3">TELAR AI</p>
        <h1 className="text-3xl font-bold">Conversaciones</h1>
        <p className="muted mt-2">Revisa las interacciones y decide cuándo necesita intervenir tu equipo.</p>
      </div>
      <div className="space-y-4">
        {data?.map((c:any)=> (
          <div key={c.id} className="surface p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="text-sm"><span className="muted">Contacto</span><br /><strong>{c.from}</strong></div>
                <div className="mt-2 text-sm"><span className="muted">Recibida</span><br /><strong>{new Date(c.createdAt).toLocaleString()}</strong></div>
              </div>
              <div>
                <span className="mr-3 rounded-full bg-[#e9f2ef] px-3 py-1 text-xs font-semibold text-[#075c59]">{c.state === 'human' ? 'Atención humana' : 'Asistente IA'}</span>
                <button onClick={()=>markHuman(c.id)} className="rounded-lg border border-[#e3b3ae] px-3 py-2 text-sm font-semibold text-[#a33b32]">Derivar a una persona</button>
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
