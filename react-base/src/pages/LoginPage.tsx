import { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import '../styles/LoginPage.css'
import { loadServerData } from '../services/sync'
import { useNavigate } from 'react-router-dom'

type Phase = 'form' | 'success' | 'welcome'

interface LoginPageProps {
  onEnter: () => void
  onBack: () => void
  defaultTab?: 'login' | 'signup'
}

// ── Star field ─────────────────────────────────
const StarField = () => {
  const stars = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() < 0.65 ? 1 : Math.random() < 0.85 ? 1.5 : 2,
      opacity: 0.15 + Math.random() * 0.4,
      delay: Math.random() * 10,
      duration: 3 + Math.random() * 5,
    })),
    [])
  return (
    <div className="lp-login-starfield" aria-hidden="true">
      {stars.map(s => (
        <span key={s.id} className="lp-login-star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          ['--s-op' as string]: s.opacity,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.duration}s`,
        }} />
      ))}
    </div>
  )
}

export default function LoginPage({ onEnter, onBack, defaultTab = 'login' }: LoginPageProps) {
  const [showTermoUso, setShowTermoUso] = useState(false);
  const { t } = useTranslation()
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab)
  const [showPass, setShowPass] = useState(false)
  const [loginErro, setLoginErro] = useState('')
  const [phase, setPhase] = useState<Phase>('form')
  const [signupNome, setSignupNome] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupSenha, setSignupSenha] = useState('');
  const [signupErro, setSignupErro] = useState('');

  const cardRef = useRef<HTMLDivElement>(null)
  const tabContentRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const welcomeRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    )
  }, [])

  useEffect(() => {
    if (phase !== 'success' || !successRef.current) return
    gsap.fromTo(successRef.current,
      { opacity: 0, scale: 0.75 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }
    )
  }, [phase])

  useEffect(() => {
    if (phase !== 'welcome') return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo('.lp-welcome-nebula', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
    tl.fromTo('.lp-welcome-logo-wrap', { opacity: 0, scale: 0.5, y: -60 }, { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0.35)
    tl.fromTo('.lp-orbit-active', { strokeDashoffset: 452 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.65)
    tl.fromTo('.lp-welcome-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, 1.05)
    tl.fromTo('.lp-welcome-sub', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 1.35)
    tl.fromTo('.lp-welcome-btn', { opacity: 0, y: 22, scale: 0.93 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.4)' }, 1.6)
  }, [phase])

  const switchTab = (tab: 'login' | 'signup') => {
    if (tab === activeTab) return
    if (!tabContentRef.current) { setActiveTab(tab); return }
    gsap.to(tabContentRef.current, {
      opacity: 0, y: 10, duration: 0.18, ease: 'power2.in',
      onComplete: () => {
        setActiveTab(tab)
        gsap.fromTo(tabContentRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
        )
      }
    })
  }

  const goSuccess = () => {
    setPhase('success')
    setTimeout(() => setPhase('welcome'), 2000)
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginErro('')
    try {
      const resp = await fetch('https://orbyt-app.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      })
      const data = await resp.json()
      if (data.sucesso) {
        loadServerData()
        goSuccess()
      } else { setLoginErro(data.mensagem || 'Erro ao fazer login') }
    } catch { setLoginErro(t('login.error.connection')) }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSignupErro('');
    try {
      const resp = await fetch('https://orbyt-app.up.railway.app/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nome: signupNome, email: signupEmail, senha: signupSenha }),
      });
      const data = await resp.json();
      if (data.sucesso) {
        loadServerData()
        goSuccess();
      } else { setSignupErro(data.erros?.[0] || data.mensagem || 'Erro ao criar conta'); }
    } catch { setSignupErro('Erro de conexão'); }
  }

  return (
    <>
      {/* ── Botão Voltar FORA do root — fixed real no viewport ── */}
      {phase === 'form' && (
        <button className="lp-login-back" onClick={onBack} aria-label={t('login.back')}>
          <ArrowLeft size={16} /> {t('login.back')}
        </button>
      )}

      <div className="lp-login-root">
        <StarField />

        {/* ── FORM ── */}
        {phase === 'form' && (
          <div className="lp-login-card" ref={cardRef}>
            {/* Card glow decoration */}
            <div className="lp-card-glow" aria-hidden="true" />

            <div className="lp-login-logo">
              <div className="lp-login-logo-ring">
                <img src="/Logo-Orbyt.svg" alt="Orbyt" />
              </div>
              <span>Orbyt</span>
            </div>

            <div className="lp-login-tabs" role="tablist">
              <button role="tab" aria-selected={activeTab === 'login'}
                className={activeTab === 'login' ? 'active' : ''}
                onClick={() => switchTab('login')}>
                {t('login.tabs.login')}
              </button>
              <button role="tab" aria-selected={activeTab === 'signup'}
                className={activeTab === 'signup' ? 'active' : ''}
                onClick={() => switchTab('signup')}>
                {t('login.tabs.signup')}
              </button>
              <div className="lp-tab-indicator"
                style={{ left: activeTab === 'login' ? '4px' : 'calc(50% + 4px)' }} />
            </div>

            <div className="lp-login-form-wrap" ref={tabContentRef}>
              {activeTab === 'login' ? (
                <form className="lp-login-form" onSubmit={handleLogin}>
                  <div className="lp-field">
                    <label htmlFor="login-email">{t('login.fields.email')}</label>
                    <input id="login-email" type="email" value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder={t('login.placeholders.email')} autoComplete="email" />
                  </div>
                  <div className="lp-field">
                    <label htmlFor="login-pass">{t('login.fields.password')}</label>
                    <div className="lp-input-pass">
                      <input id="login-pass" type={showPass ? 'text' : 'password'}
                        value={loginSenha} onChange={e => setLoginSenha(e.target.value)}
                        placeholder={t('login.placeholders.password')} autoComplete="current-password" />
                      <button type="button" className="lp-toggle-pass"
                        onClick={() => setShowPass(v => !v)}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="button" className="lp-forgot-link" onClick={() => navigate('/esqueci-senha')}>
                    {t('login.forgot')}
                  </button>
                  <button type="submit" className="lp-btn-submit">
                    <span>{t('login.loginBtn')}</span>
                    <div className="lp-btn-shimmer" />
                  </button>
                  {loginErro && <div className="lp-login-error">{loginErro}</div>}
                  <p className="lp-login-notice">
                    {t('login.notice.loginPrefix')}{' '}
                    <Link to="/termos" className="lp-link">{t('login.notice.terms')}</Link>.
                  </p>
                </form>
              ) : (
                <form className="lp-login-form" onSubmit={handleSignup}>
                  <div className="lp-field">
                    <label htmlFor="signup-name">{t('login.fields.name')}</label>
                    <input id="signup-name" type="text" value={signupNome}
                      onChange={e => setSignupNome(e.target.value)}
                      placeholder={t('login.placeholders.name')} autoComplete="name" />
                  </div>
                  <div className="lp-field">
                    <label htmlFor="signup-email">{t('login.fields.email')}</label>
                    <input id="signup-email" type="email" value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder={t('login.placeholders.email')} autoComplete="email" />
                  </div>
                  <div className="lp-field">
                    <label htmlFor="signup-pass">{t('login.fields.password')}</label>
                    <div className="lp-input-pass">
                      <input id="signup-pass" type={showPass ? 'text' : 'password'}
                        value={signupSenha} onChange={e => setSignupSenha(e.target.value)}
                        placeholder={t('login.placeholders.minPassword')} autoComplete="new-password" />
                      <button type="button" className="lp-toggle-pass"
                        onClick={() => setShowPass(v => !v)}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="lp-btn-submit">
                    <span>{t('login.signupBtn')}</span>
                    <div className="lp-btn-shimmer" />
                  </button>
                  {signupErro && <div className="lp-login-error">{signupErro}</div>}
                  <p className="lp-login-notice">
                    {t('login.notice.signupPrefix')}{' '}
                    <Link to="/termos" className="lp-link">{t('login.notice.terms')}</Link> {t('login.notice.and')}{' '}
                    <Link to="/privacidade" className="lp-link">{t('login.notice.privacy')}</Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {phase === 'success' && (
          <div className="lp-success-screen" ref={successRef}>
            <div className="lp-success-icon-wrap">
              <svg viewBox="0 0 52 52" className="lp-check-svg" aria-hidden="true">
                <circle cx="26" cy="26" r="23" className="lp-check-circle-bg" />
                <path d="M15 27l8 8 14-14" className="lp-check-path" />
              </svg>
              <div className="lp-success-glow" />
            </div>
            <h2 className="lp-success-title">{t('login.success.title')}</h2>
            <p className="lp-success-sub">{t('login.success.sub')}</p>
            <div className="lp-success-loader">
              <div className="lp-success-loader-bar" />
            </div>
          </div>
        )}

        {/* ── WELCOME ── */}
        {phase === 'welcome' && (
          <div className="lp-welcome-screen" ref={welcomeRef}>
            <div className="lp-welcome-nebula" aria-hidden="true" />
            <div className="lp-welcome-logo-wrap">
              <svg className="lp-welcome-orbit" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(192,132,252,0)" />
                    <stop offset="55%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="rgba(124,58,237,0.35)" />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r="72" stroke="rgba(168,85,247,0.12)" strokeWidth="1.5" />
                <circle cx="80" cy="80" r="72" stroke="url(#orbitGrad)" strokeWidth="2"
                  strokeLinecap="round" strokeDasharray="452" strokeDashoffset="452"
                  className="lp-orbit-active"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }} />
              </svg>
              <div className="lp-welcome-logo">
                <img src="/Logo-Orbyt.svg" alt="Orbyt" />
              </div>
            </div>
            <h1 className="lp-welcome-title">
              {t('login.welcome.title')}{' '}
              <span className="lp-welcome-brand">{t('login.welcome.brand')}</span>
            </h1>
            <p className="lp-welcome-sub">
              {t('login.welcome.sub')}<br />
              <span className="lp-welcome-sub-muted">{t('login.welcome.subMuted')}</span>
            </p>
            <button className="lp-welcome-btn" onClick={onEnter}>
              {t('login.welcome.cta')}
              <span className="lp-welcome-arrow"> →</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}