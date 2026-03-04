import { useNavigate } from 'react-router-dom'
import '../styles/NotFoundPage.css'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const isOnboarded = !!localStorage.getItem('orbyt_onboarded')

  return (
    <div className="nf-root">
      <div className="nf-bg" aria-hidden="true" />

      <div className="nf-body">
        <div className="nf-satellite" aria-hidden="true">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* corpo */}
            <rect x="36" y="36" width="24" height="24" rx="4" fill="rgba(168,85,247,0.18)" stroke="rgba(168,85,247,0.6)" strokeWidth="1.5"/>
            {/* painel solar esquerdo */}
            <rect x="8" y="40" width="22" height="16" rx="2" fill="rgba(109,40,217,0.25)" stroke="rgba(168,85,247,0.4)" strokeWidth="1.2"/>
            <line x1="12" y1="40" x2="12" y2="56" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
            <line x1="17" y1="40" x2="17" y2="56" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
            <line x1="22" y1="40" x2="22" y2="56" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
            {/* painel solar direito */}
            <rect x="66" y="40" width="22" height="16" rx="2" fill="rgba(109,40,217,0.25)" stroke="rgba(168,85,247,0.4)" strokeWidth="1.2"/>
            <line x1="70" y1="40" x2="70" y2="56" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
            <line x1="75" y1="40" x2="75" y2="56" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
            <line x1="80" y1="40" x2="80" y2="56" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
            {/* antena */}
            <line x1="48" y1="36" x2="48" y2="20" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" strokeDasharray="3 2"/>
            <circle cx="48" cy="18" r="3" fill="rgba(168,85,247,0.7)"/>
            {/* brilho central */}
            <circle cx="48" cy="48" r="4" fill="rgba(192,132,252,0.4)"/>
          </svg>
        </div>

        <div className="nf-code">404</div>
        <h1 className="nf-title">Rota perdida no espaço</h1>
        <p className="nf-sub">
          Essa página saiu da órbita.<br />
          Vamos te levar de volta.
        </p>

        <div className="nf-actions">
          <button
            className="nf-btn-primary"
            onClick={() => navigate(isOnboarded ? '/app' : '/')}
          >
            {isOnboarded ? 'Voltar ao app' : 'Ir para o início'}
          </button>
          {isOnboarded && (
            <button className="nf-btn-ghost" onClick={() => navigate('/')}>
              Landing page
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
