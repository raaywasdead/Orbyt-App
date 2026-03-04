import { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', minHeight: '100vh',
          background: '#020202', color: '#fff',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Poppins, sans-serif', gap: 16, padding: 24,
          boxSizing: 'border-box', textAlign: 'center',
        }}>
          <img src="/Logo-Orbyt.svg" alt="Orbyt" style={{ width: 64, opacity: 0.7 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            Algo saiu da órbita
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', margin: 0 }}>
            Um erro inesperado aconteceu. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg,#6d28d9,#9333ea)',
              border: 'none', color: '#fff', fontFamily: 'Poppins,sans-serif',
              fontWeight: 600, fontSize: '0.9rem', padding: '10px 24px',
              borderRadius: 99, cursor: 'pointer', marginTop: 8,
            }}
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
