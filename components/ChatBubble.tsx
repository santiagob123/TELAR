import { FormEvent, useEffect, useRef, useState } from 'react'
import { usePublicChat } from './usePublicChat'

export default function ChatBubble() {
  const [open, setOpen] = useState(false)
  const { sessionId, text, setText, messages, loading, waitingLong, error, sendMessage } = usePublicChat()
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const wasNearBottomRef = useRef(true)

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    const container = messagesRef.current
    if (!container || !open || !wasNearBottomRef.current) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, open])

  function handleScroll() {
    const container = messagesRef.current
    if (!container) return
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    wasNearBottomRef.current = distanceFromBottom < 72
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await sendMessage()
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div id="telar-public-chat" className="chat-bubble-panel mb-3 flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#dfe7e5] bg-white shadow-2xl" role="dialog" aria-label="Chat público de TELAR AI" aria-modal="false">
          <div className="chat-bubble-header flex items-center justify-between px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="chat-bubble-brand-mark" aria-hidden="true">T</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-wide">TELAR AI</p>
                <p className="chat-bubble-status text-xs" aria-live="polite"><span className="chat-bubble-status-dot" aria-hidden="true" />{loading ? waitingLong ? 'El modelo está tardando; puede tomar hasta 60 segundos...' : 'Preparando una respuesta...' : 'Asistente público'}</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar chat" className="chat-bubble-close" title="Cerrar chat">×</button>
          </div>
          <div ref={messagesRef} onScroll={handleScroll} className="chat-bubble-messages flex max-h-72 min-h-40 flex-col gap-2 overflow-y-auto scroll-smooth bg-[#f5f8f6] p-3" aria-live="polite" aria-busy={loading}>
            {messages.length === 0 && <p className="chat-bubble-empty m-auto text-center text-xs">Escribe una pregunta para comenzar.</p>}
            {messages.map((message, index) => (
              <div key={index} className={`chat-bubble-message max-w-[88%] rounded-lg px-3 py-2 text-sm ${message.from === 'user' ? 'chat-bubble-message-user ml-auto bg-[#087f78] text-white' : 'chat-bubble-message-ai mr-auto bg-white text-[#17232b]'}`}>
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble-typing mr-auto rounded-lg bg-white px-3 py-2 text-sm text-[#63717a]" role="status" aria-label="TELAR AI está escribiendo">
                <span className="sr-only">TELAR AI está escribiendo</span>
                <span aria-hidden="true" className="chat-bubble-dot" />
                <span aria-hidden="true" className="chat-bubble-dot" />
                <span aria-hidden="true" className="chat-bubble-dot" />
              </div>
            )}
            {error && <p className="chat-bubble-error rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700" role="alert">{error}</p>}
          </div>
          <form onSubmit={handleSubmit} className="chat-bubble-composer flex gap-2 border-t border-[#dfe7e5] p-3">
            <input ref={inputRef} value={text} onChange={event => setText(event.target.value)} maxLength={2000} aria-label="Mensaje para TELAR AI" placeholder="Escribe tu mensaje..." className="chat-bubble-input min-w-0 flex-1 rounded-lg border border-[#cbd9d6] px-3 py-2 text-sm outline-none transition focus:border-[#087f78]" />
            <button type="submit" disabled={loading || !sessionId} aria-label={loading ? 'Esperando respuesta de TELAR AI' : 'Enviar mensaje'} className="chat-bubble-send rounded-lg bg-[#087f78] px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{loading ? '...' : 'Enviar'}</button>
          </form>
        </div>
      )}
      <button type="button" onClick={() => setOpen(previous => !previous)} aria-expanded={open} aria-controls="telar-public-chat" aria-label={open ? 'Cerrar asistente TELAR AI' : 'Abrir asistente TELAR AI'} title="Abrir asistente TELAR AI" className="chat-bubble-toggle ml-auto grid h-14 w-14 place-items-center rounded-full bg-[#087f78] text-2xl text-white shadow-lg transition hover:bg-[#075c59]">
        {open ? '×' : '✦'}
      </button>
    </div>
  )
}
