import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

type Message = { from: string; text: string; isFromAI?: boolean }

export default function AiDashboard() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [convId, setConvId] = useState<string | null>(null)
  const [requiresHuman, setRequiresHuman] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isHandingOff, setIsHandingOff] = useState(false)
  const [waitingLong, setWaitingLong] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)
  const sendingRef = useRef(false)

  useEffect(() => {
    if (!isLoading) {
      setWaitingLong(false)
      return
    }
    const timer = window.setTimeout(() => setWaitingLong(true), 8_000)
    return () => window.clearTimeout(timer)
  }, [isLoading])

  useEffect(() => {
    let active = true
    async function setup() {
      try {
        const initResponse = await fetch('/api/ai/init', { method: 'POST' })
        if (initResponse.status === 401) {
          await router.replace('/admin/login')
          return
        }
        const initData = await initResponse.json().catch(() => ({}))
        if (!initResponse.ok || typeof initData.businessId !== 'string') {
          throw new Error(initData?.error || 'No se pudo preparar el contexto de TELAR AI.')
        }
        if (active) setBusinessId(initData.businessId)
      } catch (e: any) {
        if (active) setError(e.message || 'No se pudo preparar el asistente.')
      }
    }
    setup()
    return () => { active = false }
  }, [router])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  async function sendText(text: string) {
    if (!businessId) {
      setError('El contexto de TELAR AI todavía se está preparando. Inténtalo de nuevo en unos segundos.')
      return
    }
    if (sendingRef.current) return
    sendingRef.current = true
    setError('')
    setInput('')
    const userMsg: Message = { from: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const startedAt = Date.now()
      const res = await fetch('/api/ai/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, from: '+demo', text })
      })
      if (res.status === 401) {
        await router.replace('/admin/login')
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'No se pudo procesar el mensaje.')
      const remainingDelay = Math.max(0, 500 - (Date.now() - startedAt))
      if (remainingDelay > 0) await new Promise(resolve => setTimeout(resolve, remainingDelay))
      setConvId(data.conv?.id || null)
      if (data.handedOff === true) {
        setRequiresHuman(true)
        setMessages(prev => [...prev, { from: 'system', text: 'Tu mensaje fue recibido. Espera a que te atienda una persona.' }])
        return
      }
      const aiText = data.aiReply || 'No recibí una respuesta del asistente. Inténtalo nuevamente.'
      setMessages(prev => [...prev, { from: 'agent', text: aiText, isFromAI: true }])
      const low = aiText.toLowerCase()
      if (low.includes('deriva') || low.includes('humano') || low.includes('derivado') || low.includes('atención humana')) {
        setRequiresHuman(true)
      } else {
        setRequiresHuman(false)
      }
    } catch (sendError: any) {
      setMessages(previous => previous.filter(message => message !== userMsg))
      setInput(text)
      setError(sendError.message || 'No se pudo procesar el mensaje.')
    } finally {
      sendingRef.current = false
      setIsLoading(false)
    }
  }

  async function markHuman() {
    if (!convId || isHandingOff || requiresHuman) return
    setError('')
    setIsHandingOff(true)
    try {
      const response = await fetch(`/api/ai/conversations/${convId}`, {
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
      setRequiresHuman(true)
    } catch (handoffError: any) {
      setError(handoffError.message || 'No se pudo derivar la conversación.')
    } finally {
      setIsHandingOff(false)
    }
  }

  return (
    <div className="ai-dashboard">
      <header className="ai-page-heading">
        <div>
          <p className="eyebrow mb-3">TELAR AI · CENTRO DE AUTOMATIZACIÓN</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Automatización de mensajes para WhatsApp</h1>
          <p className="muted mt-3 max-w-3xl leading-7">Diseña una atención que responda con el conocimiento de tu negocio y pase la conversación a una persona cuando sea necesario.</p>
        </div>
        <div className="ai-channel-pill" role="status"><span className="ai-channel-dot" />WhatsApp · pendiente de conexión</div>
      </header>

      <section className="ai-flow-card" aria-labelledby="ai-flow-title">
        <div className="ai-flow-heading">
          <div>
            <p className="eyebrow">FLUJO DE ATENCIÓN</p>
            <h2 id="ai-flow-title" className="mt-1 text-lg font-bold">Así trabaja la automatización</h2>
          </div>
          <span className="ai-demo-label">Vista de demostración</span>
        </div>
        <ol className="ai-flow-steps">
          <li><span className="ai-flow-number">01</span><div><strong>Entra el mensaje</strong><p>Una consulta de tu cliente</p></div></li>
          <li><span className="ai-flow-number">02</span><div><strong>Responde TELAR AI</strong><p>Con información de tu negocio</p></div></li>
          <li><span className="ai-flow-number">03</span><div><strong>Continúa una persona</strong><p>Cuando la conversación lo necesite</p></div></li>
        </ol>
      </section>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="ai-workspace">
        <section className="surface ai-chat-card" aria-labelledby="ai-chat-title">
          <div className="ai-chat-heading">
            <div>
              <p className="eyebrow">PRUEBA INTERACTIVA</p>
              <h2 id="ai-chat-title" className="mt-1 text-lg font-bold">Simulación de atención</h2>
            </div>
            <span className={`ai-demo-status${businessId ? ' is-ready' : ''}`}><span />{businessId ? 'Lista para probar' : 'Preparando…'}</span>
          </div>

          <div className="ai-prompt-list" aria-label="Preguntas de ejemplo">
            <button type="button" disabled={!businessId || isLoading} onClick={() => void sendText('¿Cuál es el horario?')}>Horario</button>
            <button type="button" disabled={!businessId || isLoading} onClick={() => void sendText('¿Cuál es el contacto?')}>Contacto</button>
            <button type="button" disabled={!businessId || isLoading} onClick={() => void sendText('¿Cuál es el precio?')}>Precios</button>
          </div>

          <div className="ai-chat-log" ref={listRef} role="log" aria-live="polite" aria-relevant="additions text" aria-busy={isLoading}>
            {messages.length === 0 && (
              <div className="ai-chat-empty">
                <span aria-hidden="true" className="ai-chat-empty-mark">✦</span>
                <p className="font-semibold">Prueba una conversación</p>
                <p className="muted mt-1 text-sm">Elige una consulta de ejemplo o escribe tu propio mensaje.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={`${index}-${message.from}`} className={`ai-chat-message ${message.from === 'user' ? 'from-user' : message.from === 'system' ? 'from-system' : 'from-assistant'}`}>
                <span className="ai-chat-sender">{message.from === 'user' ? 'Tú' : message.from === 'system' ? 'Aviso' : 'TELAR AI'}</span>
                <p>{message.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="ai-chat-message from-assistant" role="status" aria-label={waitingLong ? 'TELAR AI está tardando en responder' : 'TELAR AI está escribiendo'}>
                <span className="ai-chat-sender">TELAR AI</span>
                <span className="ai-typing-dots" aria-hidden="true"><i /><i /><i /></span>
                {waitingLong && <p className="muted mt-2 text-xs">Puede tardar hasta 60 segundos.</p>}
              </div>
            )}
          </div>

          <form onSubmit={event => { event.preventDefault(); if (input.trim()) void sendText(input.trim()) }} className="ai-composer">
            <label htmlFor="ai-test-message" className="sr-only">Escribe un mensaje para probar TELAR AI</label>
            <input id="ai-test-message" value={input} maxLength={2000} disabled={!businessId || isLoading} onChange={event => setInput(event.target.value)} placeholder={businessId ? 'Escribe un mensaje…' : 'Preparando la simulación…'} />
            <button type="submit" disabled={!businessId || isLoading || !input.trim()}>{isLoading ? 'Enviando…' : 'Enviar'}</button>
          </form>
        </section>

        <aside className="ai-side-column">
          <section className="surface ai-whatsapp-card" aria-labelledby="whatsapp-status-title">
            <div className="ai-side-card-top"><span className="ai-whatsapp-mark" aria-hidden="true">WA</span><span className="ai-pending-badge">En preparación</span></div>
            <p className="eyebrow mt-5">CANAL WHATSAPP</p>
            <h2 id="whatsapp-status-title" className="mt-2 text-xl font-bold">Conecta la atención con tus clientes</h2>
            <p className="muted mt-2 text-sm leading-6">La automatización real por WhatsApp estará disponible cuando se configure una cuenta y sus credenciales. Esta página solo prueba el flujo interno.</p>
            <Link href="/ai/settings" className="ai-side-link">Ver configuración <span aria-hidden="true">→</span></Link>
          </section>

          <section className="surface ai-tools-card" aria-labelledby="ai-tools-title">
            <p className="eyebrow">HERRAMIENTAS</p>
            <h2 id="ai-tools-title" className="mt-2 text-lg font-bold">Prepara tu asistente</h2>
            <Link href="/ai/knowledge" className="ai-tool-link"><span className="ai-tool-icon" aria-hidden="true">▤</span><span><strong>Knowledge Base</strong><small>Administra las respuestas del negocio</small></span><span aria-hidden="true">→</span></Link>
            <Link href="/ai/conversations" className="ai-tool-link"><span className="ai-tool-icon" aria-hidden="true">☷</span><span><strong>Conversaciones</strong><small>Revisa chats y gestiona la atención humana</small></span><span aria-hidden="true">→</span></Link>
          </section>

          {requiresHuman && <div className="ai-handoff-notice" role="status"><strong>Atención humana solicitada</strong><span>La automatización se pausó para esta conversación.</span></div>}
          {convId && !requiresHuman && <button type="button" onClick={() => void markHuman()} disabled={isHandingOff} className="ai-handoff-button">{isHandingOff ? 'Derivando conversación…' : 'Derivar esta conversación a una persona'}</button>}
        </aside>
      </div>
      <p className="ai-demo-footnote">El chat de esta pantalla es una prueba web interna. No envía ni recibe mensajes de WhatsApp.</p>
    </div>
  )
}
