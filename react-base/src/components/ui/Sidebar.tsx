import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ListChecks,
  BarChart3,
  Sparkles,
  Palette,
  Settings,
  ChevronLeft,
  Flame,
  HelpCircle,
  Info,
} from 'lucide-react'
import '../../styles/Sidebar.css'

interface SidebarProps {
  onNavigate: (id: string) => void
  activePage: string
  streakDias: number
  streakAtivo: boolean
  logoCustom: string | null
  onLogoClick: () => void
  logoNeonColor?: string
  mobileOpen?: boolean
  onMobileOpen?: () => void
  onMobileClose?: () => void
}

const navItemDefs = [
  { id: 'tarefas',       icon: ListChecks, key: 'sidebar.tasks'    },
  { id: 'stats',         icon: BarChart3,  key: 'sidebar.stats'    },
  { id: 'badges',        icon: Sparkles,   key: 'sidebar.badges'   },
  { id: 'temas',         icon: Palette,    key: 'sidebar.themes'   },
  { id: 'configuracoes', icon: Settings,   key: 'sidebar.settings' },
  { id: 'ajuda',         icon: HelpCircle, key: 'sidebar.help'     },
  { id: 'sobre',         icon: Info,       key: 'sidebar.about'    },
]

const SIDEBAR_W = 260
const PEEK     = 5   // largura da aba visível quando fechada

export default function Sidebar({
  onNavigate,
  activePage,
  streakDias,
  streakAtivo,
  logoCustom,
  onLogoClick,
  logoNeonColor,
  mobileOpen = false,
  onMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const asideRef = useRef<HTMLElement>(null)

  // refs estáveis para não remontar o effect
  const openRef  = useRef(mobileOpen)
  const cbOpen   = useRef(onMobileOpen)
  const cbClose  = useRef(onMobileClose)
  useEffect(() => { openRef.current = mobileOpen   }, [mobileOpen])
  useEffect(() => { cbOpen.current  = onMobileOpen }, [onMobileOpen])
  useEffect(() => { cbClose.current = onMobileClose}, [onMobileClose])

  const streakClass = streakDias >= 7 ? 'fire' : streakDias > 0 ? 'active' : ''

  const handleNavigate = (id: string) => {
    onNavigate(id)
    onMobileClose?.()
  }

  // ── Swipe: sidebar segue o dedo em tempo real ──
  useEffect(() => {
    const el = asideRef.current
    if (!el) return

    const EDGE_ZONE = 32  // px da borda esquerda para iniciar abertura

    let startX      = 0
    let startY      = 0
    let tracking    = false
    let decided     = false
    let isHoriz     = false
    let dragged     = false
    let dragStarted = false   // true só após o 1º movimento confirmado

    const mainEl = () => document.querySelector<HTMLElement>('.main-content')

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      // Fechado: só rastreia toque na aba de borda
      if (!openRef.current && t.clientX > EDGE_ZONE) return
      tracking    = true
      dragged     = false
      decided     = false
      isHoriz     = false
      dragStarted = false
      startX      = t.clientX
      startY      = t.clientY
      // NÃO desabilita transition aqui — só desabilita se for drag
    }

    const onMove = (e: TouchEvent) => {
      if (!tracking) return
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY

      if (!decided && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        decided = true
        isHoriz = Math.abs(dx) > Math.abs(dy)
      }
      if (!decided || !isHoriz) return

      // 1º movimento horizontal confirmado: desabilita transitions
      if (!dragStarted) {
        dragStarted = true
        el.style.transition = 'none'
        const mc = mainEl()
        if (mc) mc.style.transition = 'none'
      }

      dragged = true
      const base = openRef.current ? 0 : -(SIDEBAR_W - PEEK)
      const x    = Math.min(0, Math.max(-(SIDEBAR_W - PEEK), base + dx))
      el.style.transform = `translateX(${x}px)`

      // Blur progressivo: 0 (fechado) → 7px (aberto)
      const progress = (x + (SIDEBAR_W - PEEK)) / (SIDEBAR_W - PEEK)
      const mc = mainEl()
      if (mc) mc.style.filter = `blur(${(progress * 7).toFixed(1)}px)`
    }

    const onEnd = (e: TouchEvent) => {
      if (!tracking) return
      tracking = false
      el.style.transition = ''
      el.style.transform  = ''

      const dx    = e.changedTouches[0].clientX - startX
      const absDx = Math.abs(dx)
      const absDy = Math.abs(e.changedTouches[0].clientY - startY)

      const setBlur = (open: boolean) => {
        const mc = mainEl()
        if (!mc) return
        mc.style.transition = 'filter 0.3s ease'
        mc.style.filter     = open ? 'blur(7px)' : ''
      }

      // Tap na aba (fechado) → abre com animação CSS
      if (!dragged && absDx < 10 && absDy < 10) {
        if (!openRef.current) {
          // rAF: garante que o browser vê o estado "fechado" antes de
          // aplicar a classe mobile-open, para a CSS transition disparar
          requestAnimationFrame(() => cbOpen.current?.())
          setBlur(true)
        }
        return
      }

      if (!isHoriz) return

      let willOpen = openRef.current
      if (openRef.current) {
        if (dx < -50) { willOpen = false; cbClose.current?.() }
        // Não fechou: CSS snap-back restaura posição aberta
      } else {
        if (dx > 50) { willOpen = true; cbOpen.current?.() }
      }
      setBlur(willOpen)
    }

    // Listeners no document: captura arraste que começa no backdrop
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove',  onMove,  { passive: true })
    document.addEventListener('touchend',   onEnd,   { passive: true })

    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove',  onMove)
      document.removeEventListener('touchend',   onEnd)
    }
  }, [])

  // Sincroniza blur quando sidebar abre/fecha sem swipe (backdrop, botão, etc.)
  useEffect(() => {
    const mc = document.querySelector<HTMLElement>('.main-content')
    if (!mc) return
    mc.style.transition = 'filter 0.3s ease'
    mc.style.filter     = mobileOpen ? 'blur(7px)' : ''
  }, [mobileOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop${mobileOpen ? ' visible' : ''}`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        ref={asideRef as React.RefObject<HTMLElement>}
        className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}
        aria-label="Menu lateral"
      >
        {/* Aba lateral — filho do aside, desliza junto com o menu */}
        <div className="sidebar-edge-tab" aria-hidden="true" />

        <div className="sidebar-header">
          <div
            className="sidebar-logo-wrap"
            onClick={onLogoClick}
            style={logoNeonColor ? { boxShadow: `0 0 14px ${logoNeonColor}` } : undefined}
            title="Orbyt"
          >
            {logoCustom
              ? <img src={logoCustom} alt="Logo" />
              : <img src="../../Logo-Orbyt.svg" alt="Logo Orbyt" className="sidebar-logo-svg" />
            }
          </div>
          <span className="sidebar-app-name">Orbyt</span>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            title={collapsed ? t('sidebar.expandShort') : t('sidebar.collapseShort')}
          >
            <ChevronLeft size={14} />
          </button>
        </div>

        <nav className="sidebar-nav" role="navigation">
          {navItemDefs.map(({ id, icon: Icon, key }) => {
            const label = t(key)
            return (
              <button
                key={id}
                className={`sidebar-item${activePage === id ? ' active' : ''}`}
                onClick={() => handleNavigate(id)}
                data-tooltip={label}
                aria-current={activePage === id ? 'page' : undefined}
              >
                <span className="sidebar-item-icon"><Icon /></span>
                <span className="sidebar-item-label">{label}</span>
              </button>
            )
          })}
        </nav>

        {streakAtivo && (
          <div className="sidebar-footer">
            <div className={`sidebar-streak${streakClass ? ` ${streakClass}` : ''}`}>
              <span className="sidebar-streak-icon"><Flame /></span>
              <div className="sidebar-streak-info">
                <span className="sidebar-streak-number">{streakDias}</span>
                <span className="sidebar-streak-label">
                  {streakDias === 1 ? t('sidebar.dayStreak') : t('sidebar.daysStreak')}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
