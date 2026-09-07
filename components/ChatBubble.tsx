import { FormEvent, useEffect, useState } from 'react'

type Message = { from: 'user' | 'assistant'; text: string }

export default function ChatBubble() {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedSession = window.sessionStorage.getItem('telar_chat_session')
    const nextSession = storedSession || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem('telar_chat_session', nextSession)
    setSessionId(nextSession)
  }, [])

  async function sendMessage(event: FormEvent) {
    event.preventDefault()
    if (!text.trim() || !sessionId || loading) return

    const message = text.trim()
    setText('')
    setError('')
    setMessages(previous => [...previous, { from: 'user', text: message }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, sessionId })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'No se pudo enviar el mensaje.')
      setMessages(previous => [...previous, { from: 'assistant', text: data.aiReply }])
    } catch (sendError: any) {
      setError(sendError.message || 'No se pudo enviar el mensaje.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#dfe7e5] bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#087f78] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">TELAR AI</p>
              <p className="text-xs text-emerald-50">Asistente público</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar chat" className="text-xl leading-none text-white" title="Cerrar chat">×</button>
          </div>
          <div className="flex max-h-72 min-h-40 flex-col gap-2 overflow-y-auto bg-[#f5f8f6] p-3">
            {messages.length === 0 && <p className="m-auto text-center text-xs text-[#63717a]">Escribe una pregunta para comenzar.</p>}
            {messages.map((message, index) => (
              <div key={index} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${message.from === 'user' ? 'ml-auto bg-[#087f78] text-white' : 'mr-auto bg-white text-[#17232b]'}`}>
                {message.text}
              </div>
            ))}
            {error && <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-[#dfe7e5] p-3">
            <input value={text} onChange={event => setText(event.target.value)} maxLength={2000} aria-label="Mensaje para TELAR AI" placeholder="Escribe tu mensaje..." className="min-w-0 flex-1 rounded-lg border border-[#cbd9d6] px-3 py-2 text-sm outline-none focus:border-[#087f78]" />
            <button type="submit" disabled={loading || !sessionId} className="rounded-lg bg-[#087f78] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? '...' : 'Enviar'}</button>
          </form>
        </div>
      )}
      <button type="button" onClick={() => setOpen(previous => !previous)} aria-label={open ? 'Cerrar asistente TELAR AI' : 'Abrir asistente TELAR AI'} title="Abrir asistente TELAR AI" className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-[#087f78] text-2xl text-white shadow-lg transition hover:bg-[#075c59]">
        {open ? '×' : '✦'}
      </button>
    </div>
  )
}