import { useEffect, useState } from 'react'

export type PublicChatMessage = { from: 'user' | 'assistant'; text: string }

export function usePublicChat() {
  const [sessionId, setSessionId] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<PublicChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedSession = window.sessionStorage.getItem('telar_chat_session')
    const nextSession = storedSession || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem('telar_chat_session', nextSession)
    setSessionId(nextSession)
  }, [])

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
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'No se pudo enviar el mensaje.')
      setMessages(previous => [...previous, { from: 'assistant', text: data.aiReply }])
    } catch (sendError: any) {
      setError(sendError.message || 'No se pudo enviar el mensaje.')
    } finally {
      setLoading(false)
    }
  }

  return { sessionId, text, setText, messages, loading, error, sendMessage }
}