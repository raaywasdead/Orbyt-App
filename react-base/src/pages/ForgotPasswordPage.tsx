import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import '../styles/LoginPage.css'
import '../styles/ForgotPasswordPage.css'

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
    })), [])

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

type Phase = 'form' | 'sent'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<Phase>('form')
  const cardRef = useRef<HTMLDivElement>(null)
  const sentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    )
  }, [])

  useEffect(() => {
    if (phase !== 'sent' || !sentRef.current) return
    gsap.fromTo(sentRef.current,
      { opacity: 0, scale: 0.75 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }
    )
  }, [phase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    if (!email.trim()) { setErro('Informe seu e-mail.'); return }
    setLoading(true)
    try {
      const resp = await fetch('https://orbyt-app.up.railway.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await resp.json()
      if (data.sucesso) { setPhase('sent') }
      else { setErro(data.mensagem || 'Erro ao enviar e-mail.') }
    } catch {
      setErro('Erro de conexão. Verifique sua internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lp-login-root">
      <StarField />

      <button className="lp-login-back" onClick={() => navigate('/login')} aria-label="Voltar">
        <ArrowLeft size={14} /> Voltar
      </button>

      {phase === 'form' && (
        <div className="lp-login-card" ref={cardRef}>
          <div className="lp-card-glow" aria-hidden="true" />
          <div className="lp-login-logo">
            <div className="lp-login-logo-ring">
              <img src="/Logo-Orbyt.svg" alt="Orbyt" />
            </div>
            <span>Orbyt</span>
          </div>
          <div className="lp-forgot-header">
            <div className="lp-forgot-icon-wrap">
              <Mail size={22} color="#a855f7" />
            </div>
            <h2>Esqueci minha senha</h2>
            <p>Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
          </div>
          <form className="lp-login-form" onSubmit={handleSubmit}>
            <div className="lp-field">
              <label htmlFor="forgot-email">E-mail</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>
            {erro && <div className="lp-login-error">{erro}</div>}
            <button type="submit" className="lp-btn-submit" disabled={loading}>
              <span>{loading ? 'Enviando...' : 'Enviar link de recuperação'}</span>
              <div className="lp-btn-shimmer" />
            </button>
            <p className="lp-login-notice">
              Lembrou a senha?{' '}
              <button type="button" className="lp-forgot-link" onClick={() => navigate('/login')}>
                Fazer login
              </button>
            </p>
          </form>
        </div>
      )}

      {phase === 'sent' && (
        <div className="lp-sent-screen" ref={sentRef}>
          <div className="lp-sent-icon-wrap">
            <CheckCircle size={40} color="#a855f7" strokeWidth={1.5} />
            <div className="lp-sent-glow" />
          </div>
          <h2 className="lp-sent-title">E-mail enviado!</h2>
          <p className="lp-sent-sub">
            Verifique sua caixa de entrada.
            <span className="lp-sent-sub-muted">
              Não recebeu? Confira o spam ou tente novamente.
            </span>
          </p>
          <button className="lp-welcome-btn" onClick={() => navigate('/login')}>
            Voltar ao login <span className="lp-welcome-arrow">→</span>
          </button>
        </div>
      )}
    </div>
  )
}