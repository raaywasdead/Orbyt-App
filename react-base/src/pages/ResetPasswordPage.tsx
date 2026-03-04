import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import '../styles/LoginPage.css'
import '../styles/ResetPasswordPage.css'

/* ── Starfield (igual à LoginPage) ── */
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

/* ── Regras de validação de senha ── */
const rules = [
  { id: 'len',   label: 'Mínimo 8 caracteres',        test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'Uma letra maiúscula',          test: (v: string) => /[A-Z]/.test(v) },
  { id: 'num',   label: 'Um número',                   test: (v: string) => /[0-9]/.test(v) },
]

type Phase = 'form' | 'success' | 'invalid'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [senha, setSenha]         = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showSenha, setShowSenha]       = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [erro, setErro]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [phase, setPhase]         = useState<Phase>('form')

  const cardRef    = useRef<HTMLDivElement>(null)
  const resultRef  = useRef<HTMLDivElement>(null)

  /* Animação de entrada do card */
  useEffect(() => {
    if (phase !== 'form' || !cardRef.current) return
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    )
  }, [phase])

  /* Animação da tela de resultado */
  useEffect(() => {
    if (phase === 'form' || !resultRef.current) return
    gsap.fromTo(resultRef.current,
      { opacity: 0, scale: 0.75 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }
    )
  }, [phase])

  /* Token ausente → inválido */
  useEffect(() => {
    if (!token) setPhase('invalid')
  }, [token])

  const senhaOk    = rules.every(r => r.test(senha))
  const confirmOk  = senha === confirmar && confirmar.length > 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    if (!senhaOk)   { setErro('A senha não atende aos requisitos.'); return }
    if (!confirmOk) { setErro('As senhas não coincidem.'); return }

    setLoading(true)
    try {
      const resp = await fetch('https://orbyt-app.up.railway.app/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, senha }),
      })
      const data = await resp.json()
      if (data.sucesso) { setPhase('success') }
      else              { setErro(data.mensagem || 'Link inválido ou expirado.'); setPhase('invalid') }
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
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* ── Formulário ── */}
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
              <Lock size={22} color="#a855f7" />
            </div>
            <h2>Redefinir senha</h2>
            <p>Escolha uma senha nova e segura para sua conta.</p>
          </div>

          <form className="lp-login-form" onSubmit={handleSubmit}>
            {/* Campo Senha */}
            <div className="lp-field">
              <label htmlFor="rp-senha">Nova senha</label>
              <div className="lp-input-wrap">
                <input
                  id="rp-senha"
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setErro('') }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  autoFocus
                  disabled={loading}
                />
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() => setShowSenha(v => !v)}
                  aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Checklist de requisitos */}
            {senha.length > 0 && (
              <ul className="rp-rules">
                {rules.map(r => (
                  <li key={r.id} className={r.test(senha) ? 'rp-rule--ok' : 'rp-rule--fail'}>
                    <span className="rp-rule-dot" />
                    {r.label}
                  </li>
                ))}
              </ul>
            )}

            {/* Campo Confirmar */}
            <div className="lp-field">
              <label htmlFor="rp-confirmar">Confirmar senha</label>
              <div className="lp-input-wrap">
                <input
                  id="rp-confirmar"
                  type={showConfirmar ? 'text' : 'password'}
                  value={confirmar}
                  onChange={e => { setConfirmar(e.target.value); setErro('') }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                  className={confirmar.length > 0 ? (confirmOk ? 'rp-input--ok' : 'rp-input--fail') : ''}
                />
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() => setShowConfirmar(v => !v)}
                  aria-label={showConfirmar ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && <div className="lp-login-error">{erro}</div>}

            <button
              type="submit"
              className="lp-btn-submit"
              disabled={loading || !senhaOk || !confirmOk}
              style={{ opacity: (loading || !senhaOk || !confirmOk) ? 0.6 : 1 }}
            >
              <span>{loading ? 'Salvando...' : 'Salvar nova senha'}</span>
              <div className="lp-btn-shimmer" />
            </button>
          </form>
        </div>
      )}

      {/* ── Sucesso ── */}
      {phase === 'success' && (
        <div className="lp-sent-screen" ref={resultRef}>
          <div className="lp-sent-icon-wrap" style={{ borderColor: 'rgba(134,239,172,0.35)', background: 'rgba(134,239,172,0.1)' }}>
            <CheckCircle size={40} color="#4ade80" strokeWidth={1.5} />
            <div className="lp-sent-glow" style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.2) 0%, transparent 70%)' }} />
          </div>
          <h2 className="lp-sent-title">Senha redefinida!</h2>
          <p className="lp-sent-sub">
            Sua senha foi alterada com sucesso.
            <span className="lp-sent-sub-muted">Agora é só fazer login com a nova senha.</span>
          </p>
          <button className="lp-btn-submit" style={{ marginTop: '1.5rem', maxWidth: 240 }} onClick={() => navigate('/login')}>
            <span>Ir para o login →</span>
            <div className="lp-btn-shimmer" />
          </button>
        </div>
      )}

      {/* ── Link inválido / expirado ── */}
      {phase === 'invalid' && (
        <div className="lp-sent-screen" ref={resultRef}>
          <div className="lp-sent-icon-wrap" style={{ borderColor: 'rgba(248,113,113,0.35)', background: 'rgba(248,113,113,0.1)' }}>
            <XCircle size={40} color="#f87171" strokeWidth={1.5} />
            <div className="lp-sent-glow" style={{ background: 'radial-gradient(circle, rgba(248,113,113,0.2) 0%, transparent 70%)' }} />
          </div>
          <h2 className="lp-sent-title" style={{ color: '#fca5a5' }}>Link inválido</h2>
          <p className="lp-sent-sub">
            {erro || 'Este link expirou ou já foi usado.'}
            <span className="lp-sent-sub-muted">Solicite um novo link de recuperação.</span>
          </p>
          <button className="lp-btn-submit" style={{ marginTop: '1.5rem', maxWidth: 240 }} onClick={() => navigate('/esqueci-senha')}>
            <span>Solicitar novo link →</span>
            <div className="lp-btn-shimmer" />
          </button>
        </div>
      )}
    </div>
  )
}