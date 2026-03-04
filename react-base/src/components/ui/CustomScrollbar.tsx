import { useState, useEffect, useRef } from 'react'

interface CustomScrollbarProps {
  temaEscuro: boolean;
  introAberta?: boolean;
  scrollableRef?: React.RefObject<HTMLElement | null>;
}

const CustomScrollbar = ({ temaEscuro, introAberta, scrollableRef }: CustomScrollbarProps) => {
  const [thumbHeight, setThumbHeight] = useState(100)
  const [containerHeight, setContainerHeight] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const dragControls = useRef({ startY: 0, startScrollTop: 0 })

  useEffect(() => {
    const getEl = () => scrollableRef?.current ?? null

    const updateMetrics = () => {
      const el = getEl()
      if (el) {
        const ch = el.clientHeight
        const sh = el.scrollHeight
        setContainerHeight(ch)
        const height = Math.max((ch / sh) * ch, 50)
        setThumbHeight(height)
      } else {
        const vh = window.innerHeight
        const sh = document.documentElement.scrollHeight
        setContainerHeight(vh)
        const height = Math.max((vh / sh) * vh, 50)
        setThumbHeight(height)
      }
    }

    const handleScroll = () => {
      const el = getEl()
      if (el) {
        const scrollTop = el.scrollTop
        const scrollRange = el.scrollHeight - el.clientHeight
        const progress = scrollRange > 0 ? scrollTop / scrollRange : 0
        setScrollProgress(progress)
      } else {
        const scrollTop = window.scrollY
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0
        setScrollProgress(progress)
      }
    }

    const el = getEl()
    const scrollTarget = el ?? window

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateMetrics)
    updateMetrics()
    handleScroll()

    const observer = new ResizeObserver(updateMetrics)
    if (el) {
      observer.observe(el)
    } else {
      observer.observe(document.body)
    }

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateMetrics)
      observer.disconnect()
    }
  }, [scrollableRef])

  useEffect(() => {
    if (!introAberta) {
      const timeout = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timeout)
    } else {
      setIsVisible(false)
    }
  }, [introAberta])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const el = scrollableRef?.current ?? null
      const deltaY = e.clientY - dragControls.current.startY
      const yRange = containerHeight - thumbHeight
      if (yRange <= 0) return

      if (el) {
        const scrollRange = el.scrollHeight - el.clientHeight
        const deltaScroll = (deltaY / yRange) * scrollRange
        el.scrollTop = dragControls.current.startScrollTop + deltaScroll
      } else {
        const scrollRange = document.documentElement.scrollHeight - containerHeight
        const deltaScroll = (deltaY / yRange) * scrollRange
        window.scrollTo(0, dragControls.current.startScrollTop + deltaScroll)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isDragging, containerHeight, thumbHeight, scrollableRef])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    const el = scrollableRef?.current ?? null
    dragControls.current = {
      startY: e.clientY,
      startScrollTop: el ? el.scrollTop : window.scrollY
    }
    document.body.style.userSelect = 'none'
  }

  const yRange = containerHeight - thumbHeight
  const yPosition = scrollProgress * (yRange > 0 ? yRange : 0)

  if (introAberta) return null

  return (
    <div
      className="custom-scrollbar-container"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '8px',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'flex-end',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        style={{
          height: thumbHeight,
          transform: `translateY(${yPosition}px)`,
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          pointerEvents: 'auto',
          cursor: 'default',
        }}
      >
        <div
          onMouseDown={handleMouseDown}
          style={{
            width: '8px',
            height: '100%',
            background: temaEscuro
              ? 'linear-gradient(180deg, var(--accent-alt) 0%, var(--accent-color) 100%)'
              : 'linear-gradient(180deg, var(--accent-alt) 0%, var(--accent-color) 100%)',
            borderRadius: '999px',
            boxShadow: temaEscuro
              ? '0 0 15px rgba(var(--accent-rgb), 0.3)'
              : '0 0 10px rgba(var(--accent-rgb), 0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
      </div>
    </div>
  )
}

export default CustomScrollbar
