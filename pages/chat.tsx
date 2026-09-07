import { FormEvent, useEffect, useState } from 'react'

export default function PublicChat() {
  const [sessionId, setSessionId] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Array<{ from: 'user' | 'assistant'; text: string }>>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const storedSession = window.sessionStorage.getItem('telar_chat_session')
    const nextSession = storedSession || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem('telar_chat_session', nextSession)
    setSessionId(nextSession)
  }, [])

  async function sendMessage(event: FormEvent) {
    event.preventDefault()
    if (!text.trim() || !sessionId) return
    setLoading(true)
    setError('')
    const message = text.trim()
    setText('')
    setMessages(previous => [...previous, { from: 'user', text: message }])

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
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <p className="eyebrow mb-3">TELAR AI</p>
        <h1 className="text-3xl font-bold">Chat con TELAR</h1>
        <p className="muted mt-2">Escribe tu pregunta y conversa con el asistente de TELAR AI.</p>
      </div>
      <div className="surface p-5 sm:p-7">
        <div className="mb-5 min-h-48 space-y-2 rounded-lg bg-[#f5f8f6] p-4">
          {messages.length === 0 && <p className="muted text-sm">Aún no hay mensajes.</p>}
          {messages.map((message, index) => (
            <div key={index} className={`rounded-lg px-3 py-2 text-sm ${message.from === 'user' ? 'ml-auto max-w-[85%] bg-[#087f78] text-white' : 'mr-auto max-w-[85%] bg-white text-[#17232b]'}`}>
              {message.text}
            </div>
          ))}
        </div>
        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input value={text} onChange={event => setText(event.target.value)} maxLength={2000} className="flex-1 rounded-lg border border-[#cbd9d6] p-3 outline-none focus:border-[#087f78]" placeholder="Escribe un mensaje..." />
          <button disabled={loading || !sessionId} className="rounded-lg bg-[#087f78] px-5 py-2 font-semibold text-white disabled:opacity-50">{loading ? 'Enviando...' : 'Enviar'}</button>
        </form>
      </div>
    </div>
  )
}