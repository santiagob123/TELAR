import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'

type Message = { id?: string; from: string; text: string; isFromAI?: boolean }

export default function AIAdmin(){
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [convId, setConvId] = useState<string | null>(null)
  const [requiresHuman, setRequiresHuman] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)
  const sendingRef = useRef(false)

  useEffect(()=>{
    // Initialize business if needed, then fetch profiles
    async function setup() {
      try {
        // First, try to initialize
        const initResponse = await fetch('/api/ai/init')
        const initData = await initResponse.json()
        if (initResponse.status === 401) {
          await router.replace('/admin/login')
          return
        }
        if (!initResponse.ok || typeof initData.businessId !== 'string') throw new Error(initData?.error || 'No se pudo preparar el contexto de TELAR AI.')
        setBusinessId(initData.businessId)
      } catch (e: any) {
        setError(e.message || 'No se pudo preparar el asistente.')
      }
    }
    setup()
  }, [])

  useEffect(()=>{ if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, [messages])

  async function sendText(text:string){
    if (!businessId) return alert('No demo business found')
    if (sendingRef.current) return
    sendingRef.current = true
    setInput('')
    // optimistically show user message
    const userMsg: Message = { from: 'user', text }
    setMessages(prev=>[...prev, userMsg])
    setIsLoading(true)

    try {
      const startedAt = Date.now()
      const res = await fetch('/api/ai/message', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ businessId, from: '+demo', text }) })
      const data = await res.json()
      if (res.status === 401) {
        await router.replace('/admin/login')
        return
      }
      if (!res.ok) throw new Error(data?.error || 'No se pudo procesar el mensaje.')
      const remainingDelay = Math.max(0, 500 - (Date.now() - startedAt))
      if (remainingDelay > 0) await new Promise(resolve => setTimeout(resolve, remainingDelay))
      // show AI reply
      const aiText = data.aiReply || 'No response'
      const aiMsg: Message = { from: 'agent', text: aiText, isFromAI: true }
      setMessages(prev=>[...prev, aiMsg])
      setConvId(data.conv?.id || null)

      // detect if reply asks human escalation (demo heuristic)
      const low = aiText.toLowerCase()
      if (low.includes('deriva') || low.includes('humano') || low.includes('derivado') || low.includes('atención humana')){
        setRequiresHuman(true)
      } else {
        setRequiresHuman(false)
      }
    } catch (sendError: any) {
      setError(sendError.message || 'No se pudo procesar el mensaje.')
    } finally {
      sendingRef.current = false
      setIsLoading(false)
    }
  }

  async function sendPreset(text:string){
    setInput('')
    await sendText(text)
  }

  async function markHuman(){
    if (!convId) return
    const response = await fetch(`/api/ai/conversations/${convId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ state: 'human' }) })
    if (response.status === 401) {
      await router.replace('/admin/login')
      return
    }
    setRequiresHuman(true)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <p className="eyebrow mb-3">TELAR AI</p>
        <h1 className="text-3xl font-bold">Asistente para conversaciones</h1>
        <p className="muted mt-3 max-w-2xl leading-7">Prueba el asistente TELAR AI y revisa cómo deriva una conversación a una persona. Esta pantalla usa una simulación interna; no representa una integración real con WhatsApp.</p>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={()=>sendPreset('¿Cuál es el horario?')} className="rounded-full border border-[#cbd9d6] bg-white px-4 py-2 text-sm font-semibold text-[#075c59] transition hover:bg-[#e9f2ef]">Consultar horario</button>
        <button onClick={()=>sendPreset('¿Cuál es el contacto?')} className="rounded-full border border-[#cbd9d6] bg-white px-4 py-2 text-sm font-semibold text-[#075c59] transition hover:bg-[#e9f2ef]">Consultar contacto</button>
        <button onClick={()=>sendPreset('¿Cuál es el precio?')} className="rounded-full border border-[#cbd9d6] bg-white px-4 py-2 text-sm font-semibold text-[#075c59] transition hover:bg-[#e9f2ef]">Consultar precio</button>
      </div>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="surface flex h-[28rem] flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between border-b border-[#dfe7e5] pb-3">
          <div><p className="text-sm font-bold">Prueba del asistente</p><p className="muted text-xs">Simulación interna · sin integración real con WhatsApp</p></div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4d6c25]"><span className="h-2 w-2 rounded-full bg-[#7aaa3e]"></span>Activo</span>
        </div>
        <div className="flex-1 overflow-auto" ref={listRef}>
          {messages.length === 0 && <div className="flex h-full items-center justify-center px-6 text-center"><div><p className="text-lg font-semibold">Empieza una conversación</p><p className="muted mt-2 text-sm">Elige una pregunta de ejemplo o escribe un mensaje.</p></div></div>}
          {messages.map((m, i)=> (
            <div key={i} className={`my-2 max-w-[75%] ${m.isFromAI ? 'mr-auto' : 'ml-auto'}`}>
              <div className={`${m.isFromAI ? 'bg-[#e9f2ef] text-[#17232b]' : 'bg-[#087f78] text-white'} rounded-2xl px-3 py-2 text-sm leading-6`}>{m.text}</div>
            </div>
          ))}
          {isLoading && <div className="my-2 mr-auto max-w-[75%]">
            <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-[#e9f2ef] px-4 py-3" aria-label="La IA está escribiendo" aria-live="polite">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#087f78]" style={{ animationDelay: '0ms' }}></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#087f78]" style={{ animationDelay: '150ms' }}></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#087f78]" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>}
        </div>

        <div className="mt-2">
          <form onSubmit={e=>{ e.preventDefault(); if(input.trim()) sendText(input.trim()); }} className="flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 rounded-lg border border-[#cbd9d6] p-3 outline-none focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8]" />
            <button disabled={isLoading} className="rounded-lg bg-[#087f78] px-5 py-2 font-semibold text-white transition hover:bg-[#075c59] disabled:cursor-not-allowed disabled:opacity-60">Enviar</button>
          </form>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <div className="muted">Contexto de prueba: <strong className="text-[#17232b]">{businessId ? 'TELAR AI demo' : 'Preparando...'}</strong></div>
        {requiresHuman && <div className="rounded-full bg-[#fff0ee] px-3 py-1.5 font-semibold text-[#a33b32]">Atención humana necesaria</div>}
        <button onClick={markHuman} className="ml-auto rounded-lg border border-[#e3b3ae] px-3 py-2 font-semibold text-[#a33b32] transition hover:bg-[#fff0ee]">Derivar a una persona</button>
      </div>
    </div>
  )
}
