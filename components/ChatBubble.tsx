import { FormEvent, useEffect, useRef, useState } from 'react'
import { usePublicChat } from './usePublicChat'

export default function ChatBubble() {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [cloudVisible, setCloudVisible] = useState(false)
  const [cloudDismissed, setCloudDismissed] = useState(false)
  const [cloudText, setCloudText] = useState('')
  const [cloudTyping, setCloudTyping] = useState(false)
  const [revealingMessageIndex, setRevealingMessageIndex] = useState<number | null>(null)
  const { sessionId, text, setText, messages, streamingReply, loading, waitingLong, error, sendMessage } = usePublicChat()
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const wasNearBottomRef = useRef(true)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousMessageCountRef = useRef<number | null>(null)
  const cloudGreeting = '¡Hola! Soy SAPO. Pulsa la burbuja para conversar.'

  function closeChat() {
    if (!open || closing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOpen(false)
      return
    }
    setClosing(true)
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
      setClosing(false)
      closeTimeoutRef.current = null
    }, 240)
  }

  function toggleChat() {
    if (open && closing) {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
      setClosing(false)
      return
    }
    if (open) closeChat()
    else {
      setCloudDismissed(true)
      setCloudVisible(false)
      setOpen(true)
    }
  }

  function openFromCloud() {
    setCloudDismissed(true)
    setCloudVisible(false)
    setOpen(true)
  }

  function dismissCloud() {
    setCloudDismissed(true)
    setCloudVisible(false)
  }

  useEffect(() => {
    if (open || cloudDismissed) return
    const timer = window.setTimeout(() => setCloudVisible(true), 900)
    return () => window.clearTimeout(timer)
  }, [open, cloudDismissed])

  useEffect(() => {
    if (!cloudVisible || open || cloudDismissed) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCloudText(cloudGreeting)
      setCloudTyping(false)
      return
    }

    const characters = Array.from(cloudGreeting)
    let index = 0
    let timer: number
    setCloudText('')
    setCloudTyping(true)

    const typeNextCharacter = () => {
      index += 1
      setCloudText(characters.slice(0, index).join(''))
      if (index >= characters.length) {
        setCloudTyping(false)
        return
      }
      timer = window.setTimeout(typeNextCharacter, 32)
    }

    timer = window.setTimeout(typeNextCharacter, 360)
    return () => window.clearTimeout(timer)
  }, [cloudVisible, open, cloudDismissed, cloudGreeting])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeChat()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, closing])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current)
  }, [])

  useEffect(() => {
    if (!sessionId) return

    // The first populated list may come from sessionStorage; only animate replies added afterward.
    if (previousMessageCountRef.current === null) {
      previousMessageCountRef.current = messages.length
      return
    }

    const previousCount = previousMessageCountRef.current
    previousMessageCountRef.current = messages.length
    if (messages.length <= previousCount) return

    const latestIndex = messages.length - 1
    const latestMessage = messages[latestIndex]
    if (latestMessage?.from !== 'assistant' || latestMessage.kind === 'system' || latestMessage.kind === 'streamed') {
      setRevealingMessageIndex(null)
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current)
      replyTimeoutRef.current = null
      return
    }

    setRevealingMessageIndex(latestIndex)
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current)
    const wordCount = latestMessage.text.match(/\S+/g)?.length ?? 0
    const revealDuration = Math.min(2200, Math.max(500, wordCount * 22 + 300))
    replyTimeoutRef.current = setTimeout(() => {
      setRevealingMessageIndex(null)
      replyTimeoutRef.current = null
    }, revealDuration)
  }, [messages, sessionId])

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
    <div className="chat-bubble-launcher fixed bottom-8 right-8 z-50">
      {cloudVisible && !cloudDismissed && !open && (
        <div className="chat-bubble-cloud-wrap">
          <button type="button" className="chat-bubble-cloud-open" onClick={openFromCloud} aria-label="Abrir la conversación con SAPO">
            <span>{cloudText}</span>
            {cloudTyping && <span className="chat-bubble-cloud-cursor" aria-hidden="true" />}
          </button>
          <button type="button" className="chat-bubble-cloud-close" onClick={dismissCloud} aria-label="Ocultar saludo de SAPO" title="Cerrar">×</button>
        </div>
      )}
      {open && (
        <div id="telar-public-chat" className={`chat-bubble-panel mb-3 flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#dfe7e5] bg-white shadow-2xl${closing ? ' is-closing' : ''}`} role="dialog" aria-label="Chat público de SAPO" aria-modal="false">
          <div className="chat-bubble-header flex items-center justify-between px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="chat-bubble-brand-mark" aria-hidden="true">S</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-wide">SAPO</p>
                <p className="chat-bubble-status text-xs" aria-live="polite"><span className={`chat-bubble-status-dot${loading ? ' is-loading' : ''}`} aria-hidden="true" />{loading ? waitingLong ? 'El modelo está tardando; puede tomar hasta 60 segundos...' : 'Preparando una respuesta...' : 'Asistente público'}</p>
              </div>
            </div>
            <button type="button" onClick={closeChat} aria-label="Cerrar chat" className="chat-bubble-close" title="Cerrar chat"><span aria-hidden="true">×</span></button>
          </div>
          <div ref={messagesRef} onScroll={handleScroll} className="chat-bubble-messages flex max-h-72 min-h-40 flex-col gap-2 overflow-y-auto scroll-smooth bg-[#f5f8f6] p-3" aria-live="polite" aria-busy={loading}>
            {messages.length === 0 && <p className="chat-bubble-empty m-auto text-center text-xs">Escribe una pregunta para comenzar.</p>}
            {messages.map((message, index) => {
              const animateReply = revealingMessageIndex === index && message.from === 'assistant' && message.kind !== 'system' && message.kind !== 'streamed'
              let wordIndex = 0

              return (
                <div key={index} className={`chat-bubble-message max-w-[88%] rounded-lg px-3 py-2 text-sm ${message.from === 'user' ? 'chat-bubble-message-user ml-auto bg-[#087f78] text-white' : 'chat-bubble-message-ai mr-auto bg-white text-[#17232b]'}`}>
                  {animateReply ? (
                    <>
                      <span className="sr-only">{message.text}</span>
                      <span aria-hidden="true">
                        {message.text.split(/(\s+)/).map((part, partIndex) => {
                          if (/^\s+$/.test(part)) return <span key={partIndex}>{part}</span>
                          const delay = Math.min(wordIndex++ * 22, 1800)
                          return <span key={partIndex} className="chat-bubble-reply-word" style={{ animationDelay: `${delay}ms` }}>{part}</span>
                        })}
                      </span>
                    </>
                  ) : message.text}
                </div>
              )
            })}
            {streamingReply && (
              <div className="chat-bubble-message chat-bubble-message-ai mr-auto max-w-[88%] rounded-lg px-3 py-2 text-sm" aria-live="off">
                {streamingReply}
              </div>
            )}
            {loading && !streamingReply && (
              <div className="chat-bubble-typing mr-auto rounded-lg bg-white px-3 py-2 text-sm text-[#63717a]" role="status" aria-label="SAPO está escribiendo">
                <span className="sr-only">SAPO está escribiendo</span>
                <span aria-hidden="true" className="chat-bubble-dot" />
                <span aria-hidden="true" className="chat-bubble-dot" />
                <span aria-hidden="true" className="chat-bubble-dot" />
              </div>
            )}
            {error && <p className="chat-bubble-error rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700" role="alert">{error}</p>}
          </div>
          <form onSubmit={handleSubmit} className="chat-bubble-composer flex gap-2 border-t border-[#dfe7e5] p-3">
            <input ref={inputRef} value={text} onChange={event => setText(event.target.value)} maxLength={2000} aria-label="Mensaje para SAPO" placeholder="Escribe tu mensaje..." className="chat-bubble-input min-w-0 flex-1 rounded-lg border border-[#cbd9d6] px-3 py-2 text-sm outline-none transition focus:border-[#087f78]" />
            <button type="submit" disabled={loading || !sessionId} aria-label={loading ? 'Esperando respuesta de SAPO' : 'Enviar mensaje'} className="chat-bubble-send rounded-lg bg-[#087f78] px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{loading ? '...' : 'Enviar'}</button>
          </form>
        </div>
      )}
      <button type="button" onClick={toggleChat} aria-expanded={open} aria-controls="telar-public-chat" aria-label={open ? 'Cerrar asistente SAPO' : 'Abrir asistente SAPO'} title={open ? 'Cerrar asistente SAPO' : 'Abrir asistente SAPO'} className={`chat-bubble-toggle ml-auto grid h-14 w-14 place-items-center rounded-full bg-[#087f78] text-2xl text-white shadow-lg transition hover:bg-[#075c59]${open ? ' is-open' : ''}`}>
        <span className="chat-bubble-toggle-icon" aria-hidden="true">
          <span className="chat-bubble-toggle-sparkle">✦</span>
          <span className="chat-bubble-toggle-close">×</span>
        </span>
      </button>
    </div>
  )
}
