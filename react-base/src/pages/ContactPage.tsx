import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Linkedin, Copy, Check, ArrowUpRight } from 'lucide-react'
import whatsappSvg from '../assets/whatsapp.svg'
import '../styles/ContactPage.css'

export default function ContactPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 20)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const copyEmail = () => {
    navigator.clipboard.writeText('joaov.bds20@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="ct-root" ref={rootRef}>
      <div className="ct-bg" aria-hidden="true" />

      <div className="ct-body">

        {/* Header */}
        <header className={`ct-header${scrolled ? ' scrolled' : ''}`}>
          <div className="ct-header-inner">
            <Link to="/" className="ct-logo-link">
              <img src="/Logo-Orbyt.svg" alt="Orbyt" />
              <span>Orbyt</span>
            </Link>
            <button onClick={() => navigate('/')} className="ct-btn-back">
              Início
            </button>
          </div>
        </header>

        {/* Hero */}
        <div className="ct-hero">
          <div className="ct-hero-tag">
            <span className="ct-tag-dot" />
            Contato
          </div>
          <h1 className="ct-title">
            Bora <span className="ct-grad">conversar</span>
          </h1>
          <p className="ct-sub">
            Escolha a melhor forma de falar comigo.<br />
            Respondo o mais rápido possível.
          </p>
        </div>

        {/* Cards */}
        <div className="ct-cards">

          {/* Email */}
          <div className="ct-card ct-card-email">
            <div className="ct-card-top">
              <div className="ct-icon-wrap ct-icon-email">
                <Mail size={20} />
              </div>
              <span className="ct-card-label">E-mail</span>
            </div>
            <p className="ct-card-value">joaov.bds20@gmail.com</p>
            <div className="ct-card-actions">
              <button className="ct-btn-action" onClick={copyEmail}>
                {copied
                  ? <><Check size={13} /> Copiado!</>
                  : <><Copy size={13} /> Copiar endereço</>
                }
              </button>
              <a
                href="mailto:joaov.bds20@gmail.com"
                className="ct-btn-action ct-btn-outline"
              >
                Enviar e-mail <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="ct-card ct-card-whatsapp">
            <div className="ct-card-top">
              <div className="ct-icon-wrap ct-icon-whatsapp">
                <img src={whatsappSvg} alt="WhatsApp" width={20} height={20} />
              </div>
              <span className="ct-card-label">WhatsApp</span>
            </div>
            <p className="ct-card-value">+55 51 8936-7134</p>
            <div className="ct-card-actions">
              <a
                href="https://wa.me/555189367134"
                target="_blank"
                rel="noopener noreferrer"
                className="ct-btn-action"
              >
                Abrir conversa <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="ct-card ct-card-linkedin">
            <div className="ct-card-top">
              <div className="ct-icon-wrap ct-icon-linkedin">
                <Linkedin size={20} />
              </div>
              <span className="ct-card-label">LinkedIn</span>
            </div>
            <p className="ct-card-value">João Vitor B.S</p>
            <div className="ct-card-actions">
              <a
                href="https://www.linkedin.com/in/joaov-bds"
                target="_blank"
                rel="noopener noreferrer"
                className="ct-btn-action"
              >
                Ver perfil <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="ct-footer">
          <span>© 2026 Orbyt · Feito com carinho</span>
        </div>

      </div>
    </div>
  )
}
