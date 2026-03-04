import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Lightbulb,
  ArrowUpDown,
  Calendar,
  FileText,
  Trophy,
  Palette,
  Accessibility,
  Mic,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import '../styles/IntroOnboarding.css'

interface IntroOnboardingProps {
  onComplete: () => void
}

export default function IntroOnboarding({ onComplete }: IntroOnboardingProps) {
  const { t } = useTranslation()
  const [stage, setStage] = useState<'loader' | 'hero' | 'step' | 'exit'>('loader')
  const [progress, setProgress] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [dir, setDir] = useState<'left' | 'right'>('right')
  const [animating, setAnimating] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const STEPS = [
    { id: 'drag',     label: t('app.onboarding.step1.label'), title: t('app.onboarding.step1.title'), text: t('app.onboarding.step1.desc'), tip: t('app.onboarding.step1.tip') },
    { id: 'priority', label: t('app.onboarding.step2.label'), title: t('app.onboarding.step2.title'), text: t('app.onboarding.step2.desc'), tip: t('app.onboarding.step2.tip') },
    { id: 'stats',    label: t('app.onboarding.step3.label'), title: t('app.onboarding.step3.title'), text: t('app.onboarding.step3.desc'), tip: t('app.onboarding.step3.tip') },
    { id: 'extra',    label: t('app.onboarding.step4.label'), title: t('app.onboarding.step4.title'), text: t('app.onboarding.step4.desc'), tip: t('app.onboarding.step4.tip') },
  ]

  // ── Loader progress ──────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'loader') return
    const start = Date.now()
    const duration = 2800
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const tVal = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - tVal, 3)
      const val = Math.round(eased * 100)
      setProgress(val)
      if (val >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setTimeout(() => setStage('hero'), 400)
      }
    }, 16)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [stage])


  const goStep = (next: number, direction: 'left' | 'right') => {
    if (animating) return
    setAnimating(true)
    setDir(direction)
    setTimeout(() => {
      setStepIdx(next)
      setAnimating(false)
    }, 320)
  }

  const finish = () => {
    setStage('exit')
    localStorage.setItem('orbyt_onboarded', 'true')
    setTimeout(onComplete, 650)
  }

  const step = STEPS[stepIdx]
  const isFirst = stepIdx === 0
  const isLast = stepIdx === STEPS.length - 1

  return (
    <div className={`io-root ${stage === 'exit' ? 'io-exit' : ''}`}>

      <div className="io-noise" />


      {/* ── LOADER ─────────────────────────────────────────────────────── */}
      {stage === 'loader' && (
        <div className="io-loader">
          <div className="io-loader-orbit">
            <div className="io-loader-ring io-ring-1" />
            <div className="io-loader-ring io-ring-2" />
            <div className="io-loader-ring io-ring-3" />
            <div className="io-loader-core">
              <img src="/Logo-Orbyt.svg" alt="Orbyt" className="io-loader-logo" />
            </div>
          </div>
          <div className="io-loader-label">orbyt</div>
          <div className="io-loader-bar">
            <div className="io-loader-fill" style={{ width: `${progress}%` }}>
              <div className="io-loader-glow" />
            </div>
          </div>
          <div className="io-loader-pct">{progress}%</div>
        </div>
      )}

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      {stage === 'hero' && (
        <div className="io-hero io-fadein">
          <div className="io-hero-left">
            <div className="io-hero-eyebrow">
              <span className="io-hero-dot" />
              {t('app.onboarding.hero.welcome')}
            </div>
            <h1 className="io-hero-title">
              <span className="io-hero-brand">Orbyt</span>
            </h1>
            <p className="io-hero-sub">
              {t('app.onboarding.hero.sub')}
            </p>
            <div className="io-hero-pills">
              {[
                t('app.onboarding.hero.pill1'),
                t('app.onboarding.hero.pill2'),
                t('app.onboarding.hero.pill3'),
                t('app.onboarding.hero.pill4'),
                t('app.onboarding.hero.pill5'),
              ].map(p => (
                <span key={p} className="io-pill">{p}</span>
              ))}
            </div>
            <div className="io-hero-actions">
              <button className="io-btn-primary" onClick={() => setStage('step')}>
                {t('app.onboarding.startTour')}
                <ArrowRight size={15} className="io-btn-icon" />
              </button>
              <button className="io-btn-ghost" onClick={finish}>
                {t('app.onboarding.skip')}
              </button>
            </div>
          </div>

          <div className="io-hero-right">
            <div className="io-hero-mockup">
              <div className="io-mockup-header">
                <div className="io-mockup-dots">
                  <span /><span /><span />
                </div>
                <span className="io-mockup-title">Orbyt</span>
              </div>
              <div className="io-mockup-body">
                {[
                  { text: 'Revisar proposta do cliente', prio: 'alta',   done: false },
                  { text: 'Preparar apresentação',       prio: 'media',  done: true  },
                  { text: 'Atualizar dependências',      prio: 'baixa',  done: false },
                  { text: 'Documentar API nova',         prio: 'neutra', done: true  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`io-mock-task ${item.done ? 'done' : ''}`}
                    style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                  >
                    <span className={`io-mock-check ${item.done ? 'checked' : ''}`} />
                    <span className="io-mock-text">{item.text}</span>
                    <span className={`io-mock-prio ${item.prio}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEPS ──────────────────────────────────────────────────────── */}
      {stage === 'step' && (
        <div className="io-step-wrap">
          <div className="io-dots">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                className={`io-dot ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'past' : ''}`}
                onClick={() => goStep(i, i > stepIdx ? 'right' : 'left')}
                aria-label={s.label}
              />
            ))}
          </div>

          <div className={`io-step ${animating ? `io-step-out-${dir}` : 'io-step-in'}`}>
            <div className="io-step-left">
              <div className="io-step-num">{String(stepIdx + 1).padStart(2, '0')}</div>
              <h2 className="io-step-title">{step.title}</h2>
              <p className="io-step-text">{step.text}</p>
              <div className="io-step-tip">
                <Lightbulb size={13} className="io-tip-icon" />
                {step.tip}
              </div>

              <div className="io-step-actions">
                {!isFirst && (
                  <button className="io-btn-back" onClick={() => goStep(stepIdx - 1, 'left')}>
                    <ArrowLeft size={14} />
                    {t('app.onboarding.back')}
                  </button>
                )}
                {!isLast ? (
                  <button className="io-btn-primary" onClick={() => goStep(stepIdx + 1, 'right')}>
                    {t('app.onboarding.next')}
                    <ArrowRight size={15} className="io-btn-icon" />
                  </button>
                ) : (
                  <button className="io-btn-finish" onClick={finish}>
                    <Sparkles size={15} />
                    {t('app.onboarding.finish')}
                  </button>
                )}
              </div>
            </div>

            <div className="io-step-right">
              <StepVisual id={step.id} />
            </div>
          </div>

          <button className="io-skip-btn" onClick={finish}>
            {t('app.onboarding.skipTour')}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Visuais por step ─────────────────────────────────────────────────────────

function StepVisual({ id }: { id: string }) {
  const { t } = useTranslation()

  const PRIORITY_ITEMS = [
    { label: t('app.onboarding.step2.high'),    cls: 'alta',   bar: 100 },
    { label: t('app.onboarding.step2.medium'),  cls: 'media',  bar: 65  },
    { label: t('app.onboarding.step2.low'),     cls: 'baixa',  bar: 35  },
    { label: t('app.onboarding.step2.neutral'), cls: 'neutra', bar: 15  },
  ]

  const EXTRA_ITEMS = [
    { Icon: Calendar,      title: t('app.onboarding.step4.deadlines'),    desc: t('app.onboarding.step4.deadlinesDesc') },
    { Icon: FileText,      title: t('app.onboarding.step4.notes'),        desc: t('app.onboarding.step4.notesDesc') },
    { Icon: Trophy,        title: t('app.onboarding.step4.achievements'), desc: t('app.onboarding.step4.achievementsDesc') },
    { Icon: Palette,       title: t('app.onboarding.step4.themes'),       desc: t('app.onboarding.step4.themesDesc') },
    { Icon: Accessibility, title: t('app.onboarding.step4.accessibility'),desc: t('app.onboarding.step4.accessibilityDesc') },
    { Icon: Mic,           title: t('app.onboarding.step4.voice'),        desc: t('app.onboarding.step4.voiceDesc') },
  ]

  if (id === 'drag') return (
    <div className="io-visual io-visual-drag">
      {[
        t('app.onboarding.step1.card1'),
        t('app.onboarding.step1.card2'),
        t('app.onboarding.step1.card3'),
      ].map((text, i) => (
        <div
          key={i}
          className={`io-drag-card ${i === 1 ? 'io-drag-floating' : ''}`}
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <div className="io-drag-grip">
            <span /><span /><span /><span /><span /><span />
          </div>
          <span>{text}</span>
          <span className="io-drag-order">{i + 1}</span>
        </div>
      ))}
      <div className="io-drag-arrow">
        <ArrowUpDown size={18} />
      </div>
    </div>
  )

  if (id === 'priority') return (
    <div className="io-visual io-visual-priority">
      {PRIORITY_ITEMS.map((p, i) => (
        <div key={p.cls} className="io-prio-row" style={{ animationDelay: `${i * 0.1}s` }}>
          <span className={`io-prio-dot ${p.cls}`} />
          <span className="io-prio-label">{p.label}</span>
          <div className="io-prio-bar-bg">
            <div className={`io-prio-bar ${p.cls}`} style={{ width: `${p.bar}%` }} />
          </div>
        </div>
      ))}
    </div>
  )

  if (id === 'stats') return (
    <div className="io-visual io-visual-stats">
      <div className="io-stats-ring-wrap">
        <svg viewBox="0 0 120 120" className="io-stats-ring">
          <circle cx="60" cy="60" r="50" className="io-ring-bg" />
          <circle cx="60" cy="60" r="50" className="io-ring-fg" strokeDasharray="314" strokeDashoffset="50" />
        </svg>
        <div className="io-stats-ring-label">
          <span className="io-ring-pct">84%</span>
          <span className="io-ring-sub">{t('app.onboarding.step3.labelRate')}</span>
        </div>
      </div>
      <div className="io-stats-cards">
        {[
          { val: '7',  sub: t('app.onboarding.step3.labelDays') },
          { val: '42', sub: t('app.onboarding.step3.labelDone') },
          { val: '3',  sub: t('app.onboarding.step3.labelCats') },
        ].map((c, i) => (
          <div key={i} className="io-stats-mini" style={{ animationDelay: `${i * 0.12}s` }}>
            <span className="io-stats-val">{c.val}</span>
            <span className="io-stats-sub">{c.sub}</span>
          </div>
        ))}
      </div>
    </div>
  )

  if (id === 'extra') return (
    <div className="io-visual io-visual-extra">
      {EXTRA_ITEMS.map(({ Icon, title, desc }, i) => (
        <div key={i} className="io-extra-card" style={{ animationDelay: `${i * 0.07}s` }}>
          <div className="io-extra-icon-wrap">
            <Icon size={15} />
          </div>
          <div className="io-extra-text">
            <strong>{title}</strong>
            <span>{desc}</span>
          </div>
        </div>
      ))}
    </div>
  )

  return null
}
