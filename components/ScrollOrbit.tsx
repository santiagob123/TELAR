import { PointerEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'

const TRACK_START = 0.06
const TRACK_LENGTH = 0.88

function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value))
}

export default function ScrollOrbit() {
  const railRef = useRef<HTMLElement | null>(null)
  const dragOffsetRef = useRef(0)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [progress, setProgress] = useState(0)
  const [canScroll, setCanScroll] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    const syncProgress = (showActivity: boolean) => {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      setCanScroll(maxScroll > 2)
      setProgress(maxScroll > 0 ? clampProgress(window.scrollY / maxScroll) : 0)

      if (showActivity && maxScroll > 2) {
        setIsScrolling(true)
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
          scrollTimeoutRef.current = null
        }, 240)
      }
    }

    const onScroll = () => syncProgress(true)
    const onResize = () => syncProgress(false)
    const mainContent = document.querySelector('.main-content')
    const mutationObserver = mainContent ? new MutationObserver(() => syncProgress(false)) : null
    const resizeObserver = mainContent && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => syncProgress(false)) : null
    mutationObserver?.observe(mainContent as HTMLElement, { childList: true, subtree: true })
    resizeObserver?.observe(mainContent as HTMLElement)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    syncProgress(false)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      mutationObserver?.disconnect()
      resizeObserver?.disconnect()
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  function scrollToProgress(nextProgress: number) {
    const next = clampProgress(nextProgress)
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    setProgress(next)
    document.documentElement.scrollTop = next * maxScroll
  }

  function setProgressFromPointer(clientY: number) {
    const rail = railRef.current
    if (!rail) return
    const bounds = rail.getBoundingClientRect()
    const trackTop = bounds.top + bounds.height * TRACK_START
    const trackHeight = bounds.height * TRACK_LENGTH
    if (trackHeight <= 0) return
    const thumbCenter = clientY - dragOffsetRef.current
    scrollToProgress((thumbCenter - trackTop) / trackHeight)
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault()
    const thumb = event.currentTarget.getBoundingClientRect()
    dragOffsetRef.current = event.clientY - (thumb.top + thumb.height / 2)
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
    setIsScrolling(false)
    setProgressFromPointer(event.clientY)
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (isDragging) {
      event.preventDefault()
      setProgressFromPointer(event.clientY)
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setIsDragging(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const steps: Record<string, number> = {
      ArrowDown: 0.04,
      ArrowRight: 0.04,
      ArrowUp: -0.04,
      ArrowLeft: -0.04,
      PageDown: 0.15,
      PageUp: -0.15,
    }

    if (event.key === 'Home') {
      event.preventDefault()
      scrollToProgress(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      scrollToProgress(1)
    } else if (steps[event.key] !== undefined) {
      event.preventDefault()
      scrollToProgress(progress + steps[event.key])
    }
  }

  if (!canScroll) return null

  const percent = Math.round(progress * 100)
  const thumbTop = TRACK_START * 100 + progress * TRACK_LENGTH * 100
  const activeClass = isDragging ? ' is-dragging' : isScrolling ? ' is-scrolling' : ''

  return (
    <>
      <div className="scroll-progress-bar" style={{ width: `${percent}%` }} aria-hidden="true" />
      <aside ref={railRef} className="scroll-orbit-rail">
        <button
          type="button"
          className={`scroll-orbit-thumb${activeClass}`}
          style={{ top: `${thumbTop}%` }}
          role="slider"
          aria-label="Desplazamiento de página"
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`${percent}%`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
        >
          <span className="scroll-orbit-ring" aria-hidden="true" />
          <span className="scroll-orbit-ring is-reverse" aria-hidden="true" />
          <span className="scroll-orbit-path" aria-hidden="true"><span /></span>
          <span className="scroll-orbit-core" aria-hidden="true" />
        </button>
        <span className={`scroll-orbit-label${isDragging || isScrolling ? ' is-visible' : ''}`} style={{ top: `${thumbTop}%` }} aria-hidden="true">
          {percent}%
        </span>
      </aside>
    </>
  )
}
