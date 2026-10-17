import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react'

type AnimationPhase =
  | 'idle'
  | 'detecting'
  | 'waking'
  | 'awake'
  | 'confirmation'
  | 'notification'
  | 'notification-hide'
  | 'profile'
  | 'ai'
  | 'ai-exit'

type ChatInputPhase = 'idle' | 'typing' | 'clearing'

function AiConversation({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const [chatOpen, setChatOpen] = useState(false)
  const [headerPulse, setHeaderPulse] = useState(false)
  const [visibleMessages, setVisibleMessages] = useState<Set<string>>(new Set())
  const [revealedLines, setRevealedLines] = useState<Set<string>>(new Set())
  const [inputPhase, setInputPhase] = useState<ChatInputPhase>('idle')
  const [cursorVisible, setCursorVisible] = useState(false)
  const [placeholderHidden, setPlaceholderHidden] = useState(false)
  const [sendPulse, setSendPulse] = useState(false)

  useEffect(() => {
    if (!active) {
      setChatOpen(false)
      setHeaderPulse(false)
      setVisibleMessages(new Set())
      setRevealedLines(new Set())
      setInputPhase('idle')
      setCursorVisible(false)
      setPlaceholderHidden(false)
      setSendPulse(false)
      return
    }

    let cancelled = false
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const pendingWaits = new Set<() => void>()
    const schedule = (callback: () => void, ms: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer)
        callback()
      }, ms)
      timers.add(timer)
    }
    const wait = (ms: number) => new Promise<void>((resolve, reject) => {
      let cancel: () => void = () => {}
      const finish = () => {
        timers.delete(timer)
        pendingWaits.delete(cancel)
        resolve()
      }
      cancel = () => {
        clearTimeout(timer)
        timers.delete(timer)
        pendingWaits.delete(cancel)
        reject(new Error('Animación cancelada'))
      }
      const timer = setTimeout(finish, ms)
      timers.add(timer)
      pendingWaits.add(cancel)
    })
    const revealLines = (message: string, count: number, stepMs = 250, initialDelay = 150) => {
      Array.from({ length: count }, (_, index) => index).forEach((index) => {
        schedule(() => setRevealedLines((current) => new Set(current).add(`${message}-line-${index}`)), initialDelay + index * stepMs)
      })
    }
    const revealCodeLines = (message: string, count: number, stepMs = 170, initialDelay = 200) => {
      Array.from({ length: count }, (_, index) => index).forEach((index) => {
        schedule(() => setRevealedLines((current) => new Set(current).add(`${message}-code-${index}`)), initialDelay + index * stepMs)
      })
    }
    const showMessage = (message: string) => setVisibleMessages((current) => new Set(current).add(message))
    const hideMessage = (message: string) => setVisibleMessages((current) => {
      const next = new Set(current)
      next.delete(message)
      return next
    })
    const pulseHeader = () => {
      setHeaderPulse(true)
      schedule(() => setHeaderPulse(false), 720)
    }
    const userTypes = async (durationMs: number) => {
      setCursorVisible(true)
      setPlaceholderHidden(true)
      await wait(80)
      if (cancelled) return
      setInputPhase('typing')
      await wait(durationMs)
      await wait(280)
    }
    const userSends = async () => {
      setSendPulse(true)
      setInputPhase('clearing')
      await wait(320)
      if (cancelled) return
      setInputPhase('idle')
      setPlaceholderHidden(false)
      await wait(180)
      setSendPulse(false)
    }

    const runSequence = async () => {
      setChatOpen(false)
      setHeaderPulse(false)
      setVisibleMessages(new Set())
      setRevealedLines(new Set())
      setInputPhase('idle')
      setCursorVisible(false)
      setPlaceholderHidden(false)
      setSendPulse(false)

      await wait(400)
      if (cancelled) return
      setChatOpen(true)
      await wait(1100)

      setCursorVisible(true)
      await wait(450)
      await userTypes(1000)
      await userSends()

      showMessage('u1')
      schedule(() => revealLines('u1', 2, 220, 120), 100)
      pulseHeader()
      await wait(750)

      showMessage('t1')
      await wait(1500)

      hideMessage('t1')
      await wait(80)
      showMessage('a1')
      revealLines('a1', 2, 260, 200)
      await wait(1400)

      showMessage('a2')
      revealLines('a2', 1, 200, 150)
      revealCodeLines('a2', 5, 160, 420)
      await wait(1900)

      setCursorVisible(true)
      await userTypes(850)
      await userSends()

      showMessage('u2')
      schedule(() => revealLines('u2', 1, 200, 100), 100)
      pulseHeader()
      await wait(650)

      showMessage('t2')
      await wait(1300)
      hideMessage('t2')
      await wait(80)
      showMessage('a3')
      revealLines('a3', 3, 240, 180)
      await wait(1400)

      if (!cancelled) onComplete()
    }

    void runSequence().catch(() => undefined)

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      timers.clear()
      Array.from(pendingWaits).forEach((finish) => finish())
    }
  }, [active, onComplete])

  const line = (message: string, index: number, width: number) => (
    <div
      key={`${message}-line-${index}`}
      className={`line${revealedLines.has(`${message}-line-${index}`) ? ' reveal' : ''}`}
      style={{ '--w': `${width}px` } as CSSProperties}
    />
  )

  const codeLine = (message: string, index: number, width: number, indent = '') => (
    <div
      key={`${message}-code-${index}`}
      className={`code-line ${indent}${revealedLines.has(`${message}-code-${index}`) ? ' reveal' : ''}`}
      style={{ '--w': `${width}px` } as CSSProperties}
    />
  )

  const messageClass = (key: string, role: 'user' | 'assistant') => `msg ${role}${visibleMessages.has(key) ? ' show' : ''}`

  return (
    <div className="telar-ai-demo" aria-hidden={!active}>
      <div className="scene">
        <div className={`chat-window${chatOpen ? ' open' : ''}`}>
          <div className="chat-header">
            <div className={`header-avatar${headerPulse ? ' pulse' : ''}`}>
              <div className="status" />
            </div>
            <div className="header-text">
              <div className="title-line" />
              <div className="sub-line" />
            </div>
            <div className="header-dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>
          </div>

          <div className="chat-body">
            <div className="messages">
              <div className={messageClass('u1', 'user')}>
                <div className="msg-inner"><div className="bubble">{[200, 120].map((width, index) => line('u1', index, width))}</div></div>
              </div>
              <div className={messageClass('t1', 'assistant')}>
                <div className="msg-inner"><div className="avatar" /><div className="typing-bubble"><div className="tdot" /><div className="tdot" /><div className="tdot" /></div></div>
              </div>
              <div className={messageClass('a1', 'assistant')}>
                <div className="msg-inner"><div className="avatar" /><div className="bubble">{[190, 150].map((width, index) => line('a1', index, width))}</div></div>
              </div>
              <div className={messageClass('a2', 'assistant')}>
                <div className="msg-inner">
                  <div className="avatar" />
                  <div className="bubble">
                    {line('a2', 0, 100)}
                    <div className="code-block">
                      {codeLine('a2', 0, 160)}
                      {codeLine('a2', 1, 130, 'indent-1')}
                      {codeLine('a2', 2, 90, 'indent-2')}
                      {codeLine('a2', 3, 110, 'indent-1')}
                      {codeLine('a2', 4, 70)}
                    </div>
                  </div>
                </div>
              </div>
              <div className={messageClass('u2', 'user')}>
                <div className="msg-inner"><div className="bubble">{line('u2', 0, 150)}</div></div>
              </div>
              <div className={messageClass('t2', 'assistant')}>
                <div className="msg-inner"><div className="avatar" /><div className="typing-bubble"><div className="tdot" /><div className="tdot" /><div className="tdot" /></div></div>
              </div>
              <div className={messageClass('a3', 'assistant')}>
                <div className="msg-inner"><div className="avatar" /><div className="bubble">{[195, 165, 110].map((width, index) => line('a3', index, width))}</div></div>
              </div>
            </div>
          </div>

          <div className="chat-input">
            <div className="input-field">
              <div className={`input-text-wrapper${inputPhase === 'typing' ? ' grow' : ''}${inputPhase === 'clearing' ? ' clearing' : ''}`}>
                <div className="typed-line" />
                <div className={`cursor${cursorVisible ? ' visible' : ''}`} />
              </div>
              <div className={`placeholder-line${placeholderHidden ? ' hidden' : ''}`} />
            </div>
            <div className={`send-button${sendPulse ? ' pulse' : ''}`} />
          </div>
        </div>
        <div className="caption-line" />
      </div>
    </div>
  )
}

export default function TelarHomeAnimation() {
  const [phase, setPhase] = useState<AnimationPhase>('idle')
  const [scanning, setScanning] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const aiCompletion = useRef<(() => void) | null>(null)

  const completeAiConversation = useCallback(() => {
    aiCompletion.current?.()
    aiCompletion.current = null
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(preference.matches)
    updatePreference()
    preference.addEventListener('change', updatePreference)
    return () => preference.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setPhase('profile')
      setScanning(false)
      return
    }

    let cancelled = false
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const pendingWaits = new Set<() => void>()
    const schedule = (callback: () => void, ms: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer)
        callback()
      }, ms)
      timers.add(timer)
    }
    const wait = (ms: number) => new Promise<void>((resolve, reject) => {
      let cancel: () => void = () => {}
      const finish = () => {
        timers.delete(timer)
        pendingWaits.delete(cancel)
        resolve()
      }
      cancel = () => {
        clearTimeout(timer)
        timers.delete(timer)
        pendingWaits.delete(cancel)
        reject(new Error('Animación cancelada'))
      }
      const timer = setTimeout(finish, ms)
      timers.add(timer)
      pendingWaits.add(cancel)
    })
    const waitForAi = () => new Promise<void>((resolve) => { aiCompletion.current = resolve })

    const playContinuously = async () => {
      await wait(400)
      while (!cancelled) {
        setPhase('idle')
        setScanning(false)
        await wait(500)
        if (cancelled) return

        setPhase('detecting')
        schedule(() => setScanning(true), 120)
        await wait(650)
        if (cancelled) return

        setPhase('waking')
        await wait(900)
        setPhase('awake')
        setScanning(false)
        await wait(700)

        setPhase('confirmation')
        await wait(2200)
        setPhase('awake')
        await wait(300)

        setPhase('notification')
        await wait(1400)
        setPhase('notification-hide')
        await wait(180)
        setPhase('profile')
        await wait(2050)

        setPhase('ai')
        await waitForAi()
        if (cancelled) return
        setPhase('ai-exit')
        await wait(400)
        setPhase('idle')
        await wait(500)
        await wait(1800)
      }
    }

    void playContinuously().catch(() => undefined)

    return () => {
      cancelled = true
      aiCompletion.current?.()
      aiCompletion.current = null
      timers.forEach(clearTimeout)
      timers.clear()
      Array.from(pendingWaits).forEach((finish) => finish())
    }
  }, [reducedMotion])

  const phoneDetecting = phase === 'detecting' || phase === 'waking'
  const screenOn = phase !== 'idle' && phase !== 'detecting'
  const sceneActive = phase === 'ai' || phase === 'ai-exit'

  return (
    <div className="telar-home-animation" aria-label="Demostración animada de TELAR TAG y TELAR AI">
      <div className={`scene${sceneActive ? ' ai-active' : ''}`} aria-hidden="true">
        <div className={`phone${phoneDetecting ? ' detecting' : ''}${screenOn ? ' awake' : ''}`}>
          <div className="sensor-dot" />
          <div className={`screen${screenOn ? ' on' : ''}${scanning ? ' scanning' : ''}`}>
            <div className="flash" />
            <div className="scanline" />
            <div className="status-bar">
              <div className="left-line" />
              <div className="right"><div className="bubble-sm" /><div className="bubble-sm" /><div className="battery-pill" /></div>
            </div>
            <div className="content">
              <div className={`detect-dots${phoneDetecting ? ' active' : ''}`}><div className="dot" /><div className="dot" /><div className="dot" /></div>
              <div className={`confirmation${phase === 'confirmation' ? ' show' : ''}`}>
                <div className="check-wrap"><div className="check-ring ring-2" /><div className="check-ring" /><div className="check-circle">✓</div></div>
                <div className="confirm-lines"><div className="line line-1" /><div className="line line-2" /></div>
              </div>
              <div className={`notification${phase === 'notification' ? ' show' : ''}${phase === 'notification-hide' ? ' hide' : ''}`}>
                <div className="notif-icon" /><div className="notif-text"><div className="notif-title" /><div className="notif-body" /></div>
              </div>
              <div className={`profile${phase === 'profile' ? ' show' : ''}`}>
                <div className="profile-avatar reveal" /><div className="profile-name-line reveal" /><div className="profile-handle-line reveal" />
                <div className="tags reveal"><div className="tag-bubble t1" /><div className="tag-bubble t2" /><div className="tag-bubble t3" /></div>
                <div className="info-block reveal"><div className="block-title-line" /><div className="block-line w-100" /><div className="block-line w-70" /></div>
                <div className="info-block reveal"><div className="block-title-line" style={{ width: '32%' }} /><div className="block-line w-85" /><div className="block-line w-55" /></div>
                <div className="cta-line reveal" />
              </div>
              <div className={`ai-chat-frame${phase === 'ai' ? ' show' : ''}`}>
                <AiConversation active={phase === 'ai'} onComplete={completeAiConversation} />
              </div>
            </div>
          </div>
        </div>
        <div className={`phone-wave${phase === 'idle' ? '' : ' active'}`} />
        <div className="nfc-card"><span className="nfc-card-wave" /></div>
        <div className="caption-line" />
      </div>
    </div>
  )
}
