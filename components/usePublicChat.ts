import { useEffect, useState } from 'react'

export type PublicChatMessage = { from: 'user' | 'assistant'; text: string; kind?: 'system' }

export function usePublicChat() {
  const [sessionId, setSessionId] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<PublicChatMessage[]>([])
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
          (message.kind === undefined || message.kind === 'system')
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, sessionId })
      })
      const data = await response.json().catch(() => ({}))
      if (response.status === 429) {
        setMessages(previous => {
          const last = previous[previous.length - 1]
          return last?.from === 'user' && last.text === message ? previous.slice(0, -1) : previous
        })
        setText(message)
        setError(data?.error || 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.')
        return
      }
      if (!response.ok) throw new Error(data?.error || 'No se pudo enviar el mensaje.')
      if (data.handedOff === true) {
        setMessages(previous => [...previous, { from: 'assistant', text: 'Un asesor te atenderá pronto.', kind: 'system' }])
      } else if (data.handedOff === false && typeof data.aiReply === 'string' && data.aiReply.trim()) {
        setMessages(previous => [...previous, { from: 'assistant', text: data.aiReply }])
      }
    } catch (sendError: any) {
      setError(sendError.message || 'No se pudo enviar el mensaje.')
    } finally {
      setLoading(false)
    }
  }

  return { sessionId, text, setText, messages, loading, waitingLong, error, sendMessage }
}
