import { useRef, useEffect, useState } from 'react'
import '../../styles/PillNav.css'

interface PillNavItem {
  value: string;
  label: string;
}

interface PillNavProps {
  items: PillNavItem[];
  activeItem: string;
  onItemClick: (value: string) => void;
  className?: string;
}

export default function PillNav({ items, activeItem, onItemClick, className = '' }: PillNavProps) {
  const [pillStyle, setPillStyle] = useState({ opacity: 0, width: '0px', height: '0px', left: '0px' })
  const navRef = useRef(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const updatePillPosition = () => {
      const activeElement = itemRefs.current[activeItem]
      if (activeElement && navRef.current) {
        // offsetLeft já é relativo ao container, não precisa subtrair padding
        const left = activeElement.offsetLeft
        const width = activeElement.offsetWidth
        const height = activeElement.offsetHeight
        
        setPillStyle({
          width: `${width}px`,
          height: `${height}px`,
          left: `${left}px`,
          opacity: 1,
        })
      }
    }

    // Pequeno delay para garantir que os elementos estão renderizados
    const timer = setTimeout(updatePillPosition, 50)
    
    return () => clearTimeout(timer)
  }, [activeItem, mounted])

  return (
    <div ref={navRef} className={`pill-nav ${className}`}>
      <div className="pill-nav-background" style={pillStyle} />
      {items.map((item) => (
        <button
          key={item.value}
          ref={(el) => {
            if (el) itemRefs.current[item.value] = el
          }}
          className={`pill-nav-item ${activeItem === item.value ? 'active' : ''}`}
          onClick={() => onItemClick(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
