import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import {
  CheckSquare, Award, Palette, BarChart2,
  Mic, ArrowRight,
  List, TrendingUp, Trophy,
  Sparkles, Zap, Shield, Rocket,
  Library
} from 'lucide-react'
import '../styles/LandingPage.css'

gsap.registerPlugin(ScrollTrigger)

const StarField = () => {
  const count = useMemo(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 160
  , [])
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() < 0.65 ? 1 : Math.random() < 0.85 ? 1.5 : 2,
      opacity: 0.22 + Math.random() * 0.55,
      delay: Math.random() * 10,
      duration: 3 + Math.random() * 5,
    })),
  [count])

  return (
    <div className="lp-starfield" aria-hidden="true">
      {stars.map(s => (
        <span
          key={s.id}
          className="lp-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            ['--s-op' as string]: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

interface LandingPageProps {
  onStart: () => void
  onSignup?: () => void
}

const TW_WORDS = ['Conquiste.', 'Cresça.', 'Alcance.', 'Realize.', 'Supere.', 'Vença.']

export default function LandingPage({ onStart, onSignup }: LandingPageProps) {
  const handleSignup = onSignup ?? onStart
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [twText, setTwText] = useState('Conquiste.')
  const twRef = useRef({ idx: 0, pos: 10, phase: 'pause' as 'type' | 'delete' | 'pause', until: Date.now() + 2400 })

  const stepIcons = [<List size={20} />, <TrendingUp size={20} />, <Trophy size={20} />]
  const stepNums = ['01', '02', '03']
  const steps = stepNums.map((num, i) => ({
    num,
    icon: stepIcons[i],
    title: t(`landing.how.step${i}.title`),
    desc: t(`landing.how.step${i}.desc`),
  }))

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 40)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onMouseDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node))
        setMobileMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileMenuOpen(false) }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const id = setInterval(() => {
      const s = twRef.current
      const word = TW_WORDS[s.idx]
      if (s.phase === 'pause') {
        if (Date.now() >= s.until) s.phase = 'delete'
      } else if (s.phase === 'delete') {
        if (s.pos > 0) { s.pos--; setTwText(word.slice(0, s.pos)) }
        else { s.idx = (s.idx + 1) % TW_WORDS.length; s.phase = 'type' }
      } else {
        const next = TW_WORDS[s.idx]
        if (s.pos < next.length) { s.pos++; setTwText(next.slice(0, s.pos)) }
        else { s.phase = 'pause'; s.until = Date.now() + 2400 }
      }
    }, 80)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const frame = el.querySelector('.lp-hero-preview-frame') as HTMLElement | null
    if (!frame) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      frame.style.transform = `perspective(900px) rotateX(${y * -14}deg) rotateY(${x * 10}deg) scale(1.02)`
    }
    const onLeave = () => { frame.style.transform = 'none' }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  useEffect(() => {
    ScrollTrigger.defaults({ scroller: '.lp-root' })
    ;[
      { sel: '.lp-hero-preview', delay: 0.1 },
      { sel: '.lp-hero-title',   delay: 0.18 },
      { sel: '.lp-hero-sub',     delay: 0.32 },
      { sel: '.lp-hero-actions', delay: 0.46 },
      { sel: '.lp-hero-trust',   delay: 0.56 },
    ].forEach(({ sel, delay }) =>
      gsap.fromTo(sel, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay })
    )
    gsap.to('.lp-features-section .lp-section-header', {
      scrollTrigger: { trigger: '.lp-features-section', start: 'top 58%', once: true },
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
    })
    gsap.to('.lp-carousel-wrap', {
      scrollTrigger: { trigger: '.lp-features-section', start: 'top 65%', once: true },
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
    })
    gsap.to('.lp-how-section .lp-section-header', {
      scrollTrigger: { trigger: '.lp-how-section', start: 'top 58%', once: true },
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
    })
    gsap.to('.lp-how-section .lp-hwf-card', {
      scrollTrigger: { trigger: '.lp-how-section', start: 'top 55%', once: true },
      opacity: 1, y: 0, duration: 0.65, stagger: 0.2, ease: 'power2.out',
    })
    gsap.to('.lp-cta-section .lp-cta-inner', {
      scrollTrigger: { trigger: '.lp-cta-section', start: 'top 62%', once: true },
      opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
    })
    gsap.fromTo('.lp-footer-top',
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: '.lp-footer', start: 'top 88%', once: true } }
    )
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const wrap = track.parentElement as HTMLElement
    let totalW = 0
    const computeTotal = () => { totalW = track.scrollWidth / 2 }
    computeTotal()
    let x = 0
    const SPEED = 0.9
    let dragging = false
    let lastClientX = 0
    const tick = () => {
      if (!dragging) { x = (x + SPEED) % totalW; gsap.set(track, { x: -x }) }
    }
    gsap.ticker.add(tick)
    gsap.ticker.fps(60)
    const getClientX = (e: MouseEvent | TouchEvent) =>
      'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
    const onDown = (e: MouseEvent | TouchEvent) => { dragging = true; lastClientX = getClientX(e) }
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return
      const cx = getClientX(e)
      x = (x + (lastClientX - cx) + totalW) % totalW
      lastClientX = cx
      gsap.set(track, { x: -x })
    }
    const onUp = () => { dragging = false }
    wrap.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    wrap.addEventListener('touchstart', onDown, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      gsap.ticker.remove(tick)
      wrap.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      wrap.removeEventListener('touchstart', onDown)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  const scrollTo = (id: string) => {
    const target = document.getElementById(id)
    const container = rootRef.current
    if (target && container) {
      const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
      container.scrollTo({ top, behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="lp-root" ref={rootRef}>
      <StarField />
      <div className="lp-nebula" aria-hidden="true" />

      {/* ── HEADER ── */}
      <header className={`lp-header ${scrolled ? 'scrolled' : ''}`} ref={headerRef}>
        <div className="lp-header-inner">
          <div className="lp-header-logo">
            <img src="/Logo-Orbyt.svg" alt="Orbyt" />
            <span>Orbyt</span>
          </div>
          <nav className="lp-nav">
            <button onClick={() => scrollTo('features')}>{t('landing.nav.features')}</button>
            <span className="lp-nav-sep" aria-hidden="true" />
            <button onClick={() => scrollTo('how')}>{t('landing.nav.how')}</button>
            <button className="lp-nav-cta" onClick={() => scrollTo('cta')}>
              {t('landing.nav.startNow')} <ArrowRight size={12} />
            </button>
          </nav>
          <div className="lp-header-actions">
            <button className="lp-btn-enter" onClick={onStart}>
              {t('landing.nav.enter')} <ArrowRight size={15} />
            </button>
            <button className="lp-btn-header-cta" onClick={handleSignup}>
              {t('landing.nav.create')} <ArrowRight size={14} />
            </button>
            <button
              className={`lp-mobile-menu-btn${mobileMenuOpen ? ' open' : ''}`}
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="lp-hamburger" aria-hidden="true">
                <span /><span /><span />
              </span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lp-mobile-menu">
            <div className="lp-mm-nav-section">
              <span className="lp-mm-section-label">{t('landing.nav.navLabel')}</span>
              <button className="lp-mm-nav-item" onClick={() => scrollTo('features')}>
                <div className="lp-mm-nav-icon"><Sparkles size={14} /></div>
                <span className="lp-mm-nav-label">{t('landing.nav.features')}</span>
                <ArrowRight size={13} className="lp-mm-chevron" />
              </button>
              <button className="lp-mm-nav-item" onClick={() => scrollTo('how')}>
                <div className="lp-mm-nav-icon"><Zap size={14} /></div>
                <span className="lp-mm-nav-label">{t('landing.nav.how')}</span>
                <ArrowRight size={13} className="lp-mm-chevron" />
              </button>
              <button className="lp-mm-nav-item" onClick={() => scrollTo('cta')}>
                <div className="lp-mm-nav-icon"><Rocket size={14} /></div>
                <span className="lp-mm-nav-label">{t('landing.nav.startNow')}</span>
                <ArrowRight size={13} className="lp-mm-chevron" />
              </button>
            </div>
            <div className="lp-mm-divider" />
            <div className="lp-mm-cta-section">
              <span className="lp-mm-cta-label">{t('landing.nav.startLabel')}</span>
              <button className="lp-mobile-cta-btn" onClick={handleSignup}>
                {t('landing.nav.create')} <ArrowRight size={14} />
              </button>
              <button className="lp-mm-enter-btn" onClick={onStart}>
                {t('landing.nav.enter')} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="lp-hero-section">
        <div className="lp-hero-nebula" aria-hidden="true" />
        <div className="lp-hero-inner">
          <h1 className="lp-hero-title">
            <span className="lp-ht-line">{t('landing.hero.title1')}</span>
            <span className="lp-ht-line lp-ht-muted">{t('landing.hero.title2')}</span>
            <span className="lp-ht-line lp-ht-typewriter">
              <span className="lp-gradient-text">{twText || '\u00A0'}</span>
              <span className="lp-ht-cursor" aria-hidden="true" />
            </span>
          </h1>
          <p className="lp-hero-sub">{t('landing.hero.sub')}</p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={handleSignup}>
              {t('landing.hero.cta')} <ArrowRight size={16} />
            </button>
            <button className="lp-btn-ghost" onClick={() => scrollTo('features')}>
              {t('landing.hero.explore')}
            </button>
          </div>
          <div className="lp-hero-trust">
            <span><CheckSquare size={11} /> Gratuito</span>
            <span className="lp-hero-trust-sep" />
            <span><Shield size={11} /> Privacidade garantida</span>
          </div>
        </div>

        <div className="lp-hero-preview" ref={previewRef}>
          <div className="lp-hero-preview-glow" aria-hidden="true" />

          <div className="lp-hero-orbit" aria-hidden="true">
            <div className="lp-hero-orbit-ring lp-hero-orbit-ring--1">
              <div className="lp-hero-orbit-dot lp-hero-orbit-dot--a" />
            </div>
            <div className="lp-hero-orbit-ring lp-hero-orbit-ring--2">
              <div className="lp-hero-orbit-dot lp-hero-orbit-dot--b" />
            </div>
          </div>

          <div className="lp-hero-preview-frame">
            <div className="lp-hero-preview-shimmer" aria-hidden="true" />
            <div className="lp-hero-preview-bar">
              <div className="lp-hpb-dots">
                <span className="lp-hpb-dot red" />
                <span className="lp-hpb-dot yellow" />
                <span className="lp-hpb-dot green" />
              </div>
              <div className="lp-hpb-nav" aria-hidden="true">
                <svg width="6" height="11" viewBox="0 0 6 11" fill="none"><path d="M5 1L1 5.5 5 10" stroke="rgba(255,255,255,0.32)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <svg width="6" height="11" viewBox="0 0 6 11" fill="none"><path d="M1 1l4 4.5L1 10" stroke="rgba(255,255,255,0.18)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="lp-hpb-url-bar">
                <svg className="lp-hpb-lock-icon" width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden="true">
                  <path d="M1.5 5V3.5a3 3 0 016 0V5" stroke="#34d399" strokeWidth="1.25" strokeLinecap="round"/>
                  <rect x="0.5" y="4.5" width="8" height="6" rx="1.5" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.45)" strokeWidth="1"/>
                </svg>
                <span className="lp-hpb-url-text">orbyt.app</span>
              </div>
              <div className="lp-hpb-refresh" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M11.5 6.5a5 5 0 11-1.46-3.54" stroke="rgba(255,255,255,0.25)" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M10 2.5V5H7.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <img src="/app-preview.png" alt="Orbyt — lista de tarefas" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features-section" id="features">
        <div className="lp-section-inner" style={{ paddingBottom: 0 }}>
          <div className="lp-section-header lp-anim">
            <div className="lp-section-tag">{t('landing.features.tag')}</div>
            <h2 className="lp-section-title">{t('landing.features.title')}</h2>
            <p className="lp-section-sub">{t('landing.features.sub')}</p>
          </div>
        </div>

        <div className="lp-carousel-wrap lp-anim">
          <div className="lp-carousel-track" ref={trackRef}>
            {([0, 1] as const).flatMap(dk => [

              <div className="lp-cc-card" key={`tasks-${dk}`}>
                <div className="lp-cc-header">
                  <div className="lp-cc-icon"><CheckSquare size={15} /></div>
                  <span className="lp-cc-tag">{t('landing.features.card0.title')}</span>
                </div>
                <h3 className="lp-cc-title">Organize e priorize</h3>
                <div className="lp-cc-demo">
                  {([
                    { label: 'Finalizar relatório Q4', done: true,  p: 'h' },
                    { label: 'Code review #47',        done: true,  p: 'm' },
                    { label: 'Deploy frontend',        done: false, p: 'h' },
                    { label: 'Reunião de equipe',      done: false, p: 'l' },
                  ] as { label: string; done: boolean; p: string }[]).map((row, i) => (
                    <div className={`lp-cc-task${row.done ? ' done' : ''}`} key={i}>
                      <div className={`lp-cc-check${row.done ? ' checked' : ''}`} />
                      <span>{row.label}</span>
                      <div className={`lp-cc-dot lp-cc-dot-${row.p}`} />
                    </div>
                  ))}
                </div>
              </div>,

              <div className="lp-cc-card lp-cc-card--amber" key={`badges-${dk}`}>
                <div className="lp-cc-header">
                  <div className="lp-cc-icon"><Award size={15} /></div>
                  <span className="lp-cc-tag">{t('landing.features.card1.title')}</span>
                </div>
                <h3 className="lp-cc-title">Conquistas reais</h3>
                <div className="lp-cc-demo">
                  {[
                    { sym: '●', name: 'Primeira Tarefa', rar: 'Comum', cls: ''     },
                    { sym: '◆', name: 'Sequência de 7',  rar: 'Rara',  cls: 'rare' },
                    { sym: '✦', name: 'Maratonista',     rar: 'Épica', cls: 'epic' },
                  ].map((b, i) => (
                    <div className={`lp-cc-badge${b.cls ? ` ${b.cls}` : ''}`} key={i}>
                      <span className="lp-cc-badge-sym">{b.sym}</span>
                      <div>
                        <div className="lp-cc-badge-name">{b.name}</div>
                        <div className="lp-cc-badge-rar">{b.rar}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>,

              <div className="lp-cc-card lp-cc-card--pink" key={`themes-${dk}`}>
                <div className="lp-cc-header">
                  <div className="lp-cc-icon"><Palette size={15} /></div>
                  <span className="lp-cc-tag">{t('landing.features.card2.title')}</span>
                </div>
                <h3 className="lp-cc-title">Sua cara, seu estilo</h3>
                <div className="lp-cc-demo" style={{ flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: 'linear-gradient(135deg,rgba(236,72,153,0.12),rgba(124,58,237,0.08))', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg,#ec4899,#a855f7)', boxShadow: '0 0 7px rgba(236,72,153,0.7)', flexShrink: 0 }} />
                      <div style={{ height: 4, borderRadius: 99, background: 'rgba(236,72,153,0.45)', flex: 1 }} />
                      <div style={{ height: 4, width: '28%', borderRadius: 99, background: 'rgba(236,72,153,0.2)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <div style={{ width: 26, background: 'rgba(236,72,153,0.15)', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '6px 0' }}>
                        {[1, 1, 0.5, 0.5].map((op, i) => (
                          <div key={i} style={{ width: 12, height: 12, borderRadius: 4, background: `rgba(236,72,153,${op * 0.5})`, border: i === 0 ? '1px solid rgba(236,72,153,0.6)' : 'none' }} />
                        ))}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ height: 18, borderRadius: 5, background: 'rgba(236,72,153,0.18)', border: '1px solid rgba(236,72,153,0.25)', display: 'flex', alignItems: 'center', padding: '0 6px', gap: 4 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ec4899', boxShadow: '0 0 5px #ec4899' }} />
                          <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.3)', flex: 1 }} />
                        </div>
                        {[80, 60, 70].map((w, i) => (
                          <div key={i} style={{ height: 4, borderRadius: 99, background: `rgba(236,72,153,${0.15 + i * 0.05})`, width: `${w}%` }} />
                        ))}
                        <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                          {(['#ec4899', '#a855f7', 'rgba(255,255,255,0.12)'] as string[]).map((c, i) => (
                            <div key={i} style={{ height: 14, flex: i === 2 ? 1 : 'none', width: i < 2 ? 28 : undefined, borderRadius: 4, background: c, opacity: i === 2 ? 1 : 0.8 }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {([
                      { bg: 'linear-gradient(135deg,#ec4899,#a855f7)', name: 'Aurora', active: true  },
                      { bg: 'linear-gradient(135deg,#7c3aed,#4f46e5)', name: 'Cosmos', active: false },
                      { bg: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', name: 'Ocean',  active: false },
                      { bg: 'linear-gradient(135deg,#10b981,#84cc16)', name: 'Forest', active: false },
                    ] as { bg: string; name: string; active: boolean }[]).map((theme, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', height: 26, borderRadius: 7, background: theme.bg, border: theme.active ? '2px solid rgba(255,255,255,0.75)' : '2px solid transparent', boxShadow: theme.active ? '0 0 12px rgba(236,72,153,0.55)' : 'none', position: 'relative', overflow: 'hidden' }}>
                          {theme.active && <div style={{ position: 'absolute', bottom: 3, right: 3, width: 8, height: 8, borderRadius: '50%', background: 'white', boxShadow: '0 0 4px rgba(0,0,0,0.4)' }} />}
                        </div>
                        <span style={{ fontSize: 9, color: theme.active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.28)', fontWeight: theme.active ? 600 : 400 }}>{theme.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>,

              <div className="lp-cc-card lp-cc-card--cyan" key={`stats-${dk}`}>
                <div className="lp-cc-header">
                  <div className="lp-cc-icon"><BarChart2 size={15} /></div>
                  <span className="lp-cc-tag">{t('landing.features.card3.title')}</span>
                </div>
                <h3 className="lp-cc-title">Veja seu progresso</h3>
                <div className="lp-cc-demo lp-cc-demo-stats">
                  <svg viewBox="0 0 72 72" width="68" height="68" style={{ flexShrink: 0 }}>
                    <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(14,165,233,0.14)" strokeWidth="5" />
                    <circle cx="36" cy="36" r="28" fill="none" stroke="#0ea5e9" strokeWidth="5"
                      strokeDasharray="175.9" strokeDashoffset="44" strokeLinecap="round"
                      transform="rotate(-90 36 36)"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(14,165,233,0.55))' }} />
                    <text x="36" y="41" textAnchor="middle" fill="#bae6fd" fontSize="14" fontWeight="800" fontFamily="Poppins,sans-serif">75%</text>
                  </svg>
                  <div className="lp-cc-stat-rows">
                    {([['23','tarefas'],['7','dias seguidos'],['94%','conclusão']] as [string,string][]).map(([n, l], i) => (
                      <div className="lp-cc-stat-row" key={i}>
                        <span className="lp-cc-stat-n">{n}</span>
                        <span>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>,

              <div className="lp-cc-card lp-cc-card--emerald" key={`voice-${dk}`}>
                <div className="lp-cc-header">
                  <div className="lp-cc-icon"><Mic size={15} /></div>
                  <span className="lp-cc-tag">{t('landing.features.card4.title')}</span>
                </div>
                <h3 className="lp-cc-title">Fale, não digite</h3>
                <div className="lp-cc-demo lp-cc-demo-voice">
                  <div className="lp-cc-mic-ring"><Mic size={20} /></div>
                  <div className="lp-cc-wave-bars">
                    {Array.from({ length: 9 }, (_, i) => (
                      <span key={i} className="lp-cc-wave-bar" style={{ animationDelay: `${i * 0.09}s` }} />
                    ))}
                  </div>
                  <p className="lp-cc-voice-hint">"Reunião amanhã às 14h"</p>
                </div>
              </div>,

              <div className="lp-cc-card lp-cc-card--indigo" key={`batch-${dk}`}>
                <div className="lp-cc-header">
                  <div className="lp-cc-icon"><Zap size={15} /></div>
                  <span className="lp-cc-tag">{t('landing.features.card5.title')}</span>
                </div>
                <h3 className="lp-cc-title">Cole, importe, organize</h3>
                <div className="lp-cc-demo" style={{ flexDirection: 'column', gap: 7, padding: 0 }}>
                  <div style={{ background: 'rgba(10,8,28,0.7)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 5, minHeight: 90, position: 'relative' }}>
                    {([
                      { text: 'cozinha: fazer a janta', dim: false },
                      { text: 'trabalho: code review',  dim: false },
                      { text: '-- compras --',          dim: true  },
                      { text: 'leite e ovos',           dim: false },
                    ] as { text: string; dim: boolean }[]).map((line, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 10, color: line.dim ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>{line.text}</span>
                        {i === 3 && <span style={{ display: 'inline-block', width: 1.5, height: 11, background: '#818cf8', borderRadius: 1, animation: 'lp-blink 1.1s step-end infinite' }} />}
                      </div>
                    ))}
                    <div style={{ position: 'absolute', bottom: 3, right: 3, width: 8, height: 8, borderRight: '1.5px solid rgba(99,102,241,0.35)', borderBottom: '1.5px solid rgba(99,102,241,0.35)', borderRadius: '0 0 3px 0' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 5 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 9px', fontSize: 9.5, color: 'rgba(255,255,255,0.4)', fontWeight: 500, whiteSpace: 'nowrap' }}>Mini guia</div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <div style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 6, padding: '4px 10px', fontSize: 9.5, color: 'white', fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}>Adicionar linhas</div>
                      <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 9px', fontSize: 9.5, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Fechar</div>
                    </div>
                  </div>
                </div>
              </div>,

            ])}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="lp-how-section" id="how">
        <div className="lp-section-inner">
          <div className="lp-section-header lp-anim">
            <div className="lp-section-tag">{t('landing.how.tag')}</div>
            <h2 className="lp-section-title">
              {t('landing.how.title1')}<br />{t('landing.how.title2')}
            </h2>
          </div>
          <div className="lp-how-flow">
            {steps.map((s, i) => {
              const HW_COLORS = ['#22d3ee', '#818cf8', '#c084fc'] as const
              const color = HW_COLORS[i]
              return (
                <Fragment key={i}>
                  <div className="lp-hwf-card lp-anim" style={{ '--hw-c': color } as React.CSSProperties}>
                    <div className="lp-hwf-top">
                      <div className="lp-hwf-node"><span className="lp-hwf-num">{s.num}</span></div>
                      <div className="lp-hwf-icon">{s.icon}</div>
                    </div>
                    <div className="lp-hwf-text">
                      <h3 className="lp-hwf-title">{s.title}</h3>
                      <p className="lp-hwf-desc">{s.desc}</p>
                    </div>
                    <div className="lp-hwf-mock">
                      {i === 0 && (
                        <div className="lp-tl-mock">
                          <div className="lp-tl-input-row">
                            <div className="lp-tl-input">
                              <span className="lp-tl-input-text">Reunião amanhã às 14h</span>
                              <span className="lp-tl-cursor" />
                            </div>
                            <div className="lp-tl-add-btn">+</div>
                          </div>
                          <div className="lp-tl-input-meta">
                            <div className="lp-tl-prio lp-tl-prio-h" />
                            <span>Alta prioridade</span>
                          </div>
                          <div className="lp-tl-new-task">
                            <div className="lp-tl-new-chk" />
                            <span>Reunião amanhã às 14h</span>
                            <span className="lp-tl-new-label">nova</span>
                          </div>
                        </div>
                      )}
                      {i === 1 && (
                        <div className="lp-tl-mock lp-tl-mock-streak">
                          <div className="lp-tl-streak-hero">
                            <div className="lp-tl-streak-fire"><Library size={26} /></div>
                            <div>
                              <div className="lp-tl-streak-num">7</div>
                              <div className="lp-tl-streak-sub">dias seguidos</div>
                            </div>
                          </div>
                          <div className="lp-tl-streak-days">
                            {['S','T','Q','Q','S','S','D'].map((d, idx) => (
                              <div key={idx} className={`lp-tl-streak-day${idx < 5 ? ' active' : ''}`}>
                                <div className="lp-tl-streak-dot" />
                                <span>{d}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {i === 2 && (
                        <div className="lp-tl-mock lp-tl-mock-unlock">
                          <div className="lp-tl-unlock-badge">
                            <div className="lp-tl-unlock-glow" />
                            <span className="lp-tl-unlock-sym">✦</span>
                            <div className="lp-tl-unlock-check">✓</div>
                          </div>
                          <div className="lp-tl-unlock-info">
                            <div className="lp-tl-unlock-name">Maratonista</div>
                            <div className="lp-tl-unlock-rar">Conquista Épica</div>
                            <div className="lp-tl-unlock-msg">Desbloqueada!</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {i < 2 && (
                    <div className="lp-hwf-connector" aria-hidden="true">
                      <div className="lp-hwf-arrow" />
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta-section" id="cta">
        <div className="lp-cta-orbit" aria-hidden="true">
          <div className="lp-cta-orbit-ring lp-cta-orbit-ring--1"><div className="lp-cta-orbit-dot" /></div>
          <div className="lp-cta-orbit-ring lp-cta-orbit-ring--2"><div className="lp-cta-orbit-dot" /></div>
          <div className="lp-cta-orbit-ring lp-cta-orbit-ring--3"><div className="lp-cta-orbit-dot" /></div>
        </div>

        <div className="lp-cta-inner lp-anim">
          <div className="lp-cta-glow"   aria-hidden="true" />
          <div className="lp-cta-glow-2" aria-hidden="true" />
          <div className="lp-section-tag">{t('landing.cta.tag')}</div>
          <h2 className="lp-cta-title">
            {t('landing.cta.title')}{' '}
            <span className="lp-gradient-text">{t('landing.cta.highlight')}</span>
          </h2>
          <p className="lp-cta-sub">{t('landing.cta.sub')}</p>
          <div className="lp-cta-pills">
            <div className="lp-cta-pill"><Sparkles size={13} /> Gratuito pra sempre</div>
            <div className="lp-cta-pill"><Zap size={13} /> Pronto em segundos</div>
            <div className="lp-cta-pill"><Shield size={13} /> Privacidade garantida</div>
          </div>
          <button className="lp-btn-primary large lp-cta-btn" onClick={handleSignup}>
            {t('landing.cta.btn')} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">
              <img src="/Logo-Orbyt.svg" alt="Orbyt" />
              <span>Orbyt</span>
            </div>
            <p className="lp-footer-tagline">{t('landing.footer.made')}</p>
          </div>
          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <span className="lp-footer-col-title">Legal</span>
              <Link to="/termos" className="lp-footer-link">Termos de Uso</Link>
              <Link to="/privacidade" className="lp-footer-link">Política de Privacidade</Link>
              <Link to="/faq" className="lp-footer-link">FAQ</Link>
            </div>
            <div className="lp-footer-col">
              <span className="lp-footer-col-title">App</span>
              <button className="lp-footer-link" onClick={() => scrollTo('features')}>Funcionalidades</button>
              <button className="lp-footer-link" onClick={onStart}>Entrar</button>
            </div>
            <div className="lp-footer-col">
              <span className="lp-footer-col-title">Contato</span>
              <Link to="/contato" className="lp-footer-link">Fale comigo</Link>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p className="lp-footer-copy">{t('landing.footer.copy')}</p>
          <div className="lp-footer-bottom-links">
            <Link to="/termos" className="lp-footer-copy-link">Termos</Link>
            <span className="lp-footer-dot" />
            <Link to="/privacidade" className="lp-footer-copy-link">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}