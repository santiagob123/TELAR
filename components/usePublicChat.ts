import { useEffect, useState } from 'react'

export type PublicChatMessage = { from: 'user' | 'assistant'; text: string; kind?: 'system' | 'streamed' }

export function usePublicChat() {
  const [sessionId, setSessionId] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<PublicChatMessage[]>([])
  const [streamingReply, setStreamingReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitingLong, setWaitingLong] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading) {
      setWaitingLong(false)
      return
    }
    const timer = window.setTimeout(() => setWaitingLong(true), 8_000)
    return () => window.clearTimeout(timer)
  }, [loading])

  useEffect(() => {
    const storedSession = window.sessionStorage.getItem('telar_chat_session')
    const nextSession = storedSession || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem('telar_chat_session', nextSession)
    setSessionId(nextSession)

    try {
      const savedMessages = JSON.parse(window.sessionStorage.getItem(`telar_chat_messages:${nextSession}`) || '[]')
      if (Array.isArray(savedMessages)) {
        setMessages(savedMessages.filter((message): message is PublicChatMessage =>
          message &&
          (message.from === 'user' || message.from === 'assistant') &&
          typeof message.text === 'string' &&
          (message.kind === undefined || message.kind === 'system' || message.kind === 'streamed')
        ).slice(-100))
      }
    } catch {
      window.sessionStorage.removeItem(`telar_chat_messages:${nextSession}`)
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return
    try {
      window.sessionStorage.setItem(`telar_chat_messages:${sessionId}`, JSON.stringify(messages.slice(-100)))
    } catch {
      // The chat remains usable if browser storage is unavailable or full.
    }
  }, [messages, sessionId])

  async function sendMessage() {
    const message = text.trim()
    if (!message || !sessionId || loading) return

    setText('')
    setError('')
    setMessages(previous => [...previous, { from: 'user', text: message }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ text: message, sessionId })
      })
      if (response.status === 429) {
        const data = await response.json().catch(() => ({}))
        setMessages(previous => {
          const last = previous[previous.length - 1]
          return last?.from === 'user' && last.text === message ? previous.slice(0, -1) : previous
        })
        setText(message)
        setError(data?.error || 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.')
        return
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'No se pudo enviar el mensaje.')
      }

      if (!response.headers.get('content-type')?.includes('text/event-stream')) {
        const data = await response.json().catch(() => ({}))
        if (data.handedOff === true) {
          setMessages(previous => [...previous, { from: 'assistant', text: 'Un asesor te atenderá pronto.', kind: 'system' }])
        } else if (data.handedOff === false && typeof data.aiReply === 'string' && data.aiReply.trim()) {
          setMessages(previous => [...previous, { from: 'assistant', text: data.aiReply }])
        }
        return
      }

      if (!response.body) throw new Error('El navegador no pudo abrir la respuesta en tiempo real.')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let streamedText = ''
      let handedOff = false
      let completed = false

      const consumeEvent = (event: string) => {
        const data = event
          .split(/\r?\n/)
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).trim())
          .join('\n')
        if (!data) return
        const payload = JSON.parse(data) as {
          type?: string
          text?: string
          aiReply?: string | null
          handedOff?: boolean
          error?: string
        }

        if (payload.type === 'token' && typeof payload.text === 'string') {
          streamedText += payload.text
          setStreamingReply(streamedText)
        } else if (payload.type === 'done') {
          completed = true
          handedOff = payload.handedOff === true
          if (typeof payload.aiReply === 'string') {
            streamedText = payload.aiReply
            setStreamingReply(streamedText)
          }
        } else if (payload.type === 'error') {
          throw new Error(payload.error || 'No se pudo enviar el mensaje.')
        }
      }

      try {
        let streamEnded = false
        while (!streamEnded) {
          const { done, value } = await reader.read()
          if (done) {
            streamEnded = true
            continue
          }
          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split(/\r?\n\r?\n/)
          buffer = events.pop() || ''
          for (const event of events) consumeEvent(event)
        }
        buffer += decoder.decode()
        if (buffer.trim()) consumeEvent(buffer)
      } finally {
        reader.releaseLock()
      }

      if (!completed) throw new Error('La respuesta se interrumpió antes de terminar. Inténtalo de nuevo.')
      if (handedOff) {
        setMessages(previous => [...previous, { from: 'assistant', text: 'Un asesor te atenderá pronto.', kind: 'system' }])
      } else if (streamedText.trim()) {
        setMessages(previous => [...previous, { from: 'assistant', text: streamedText, kind: 'streamed' }])
      }
    } catch (sendError: any) {
      setError(sendError.message || 'No se pudo enviar el mensaje.')
    } finally {
      setStreamingReply('')
      setLoading(false)
    }
  }

  return { sessionId, text, setText, messages, streamingReply, loading, waitingLong, error, sendMessage }
}
