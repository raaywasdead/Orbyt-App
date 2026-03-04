import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import '../styles/TermoUsoPage.css';

const sections = [
  {
    number: '01',
    title: 'O que é o Orbyt',
    content: `O Orbyt é um projeto pessoal criado por um estudante de programação — não é uma empresa, startup nem serviço comercial. É um app de produtividade feito no tempo livre, com o objetivo de aprender e criar algo útil. Ao usar, você entende e aceita esse contexto.`,
  },
  {
    number: '02',
    title: 'Cadastro e Senha',
    content: `Você é responsável pela sua conta e senha. Se perceber algum acesso incomum, entre em contato. Não me responsabilizo por uso indevido das suas credenciais por terceiros.`,
  },
  {
    number: '03',
    title: 'Seus Dados',
    content: `Coleto apenas o mínimo necessário para o app funcionar (e-mail e senha). Não vendo nem compartilho seus dados. Procuro seguir as boas práticas da LGPD (Lei nº 13.709/2018) dentro das minhas possibilidades como desenvolvedor individual.`,
  },
  {
    number: '04',
    title: 'É Gratuito',
    content: `O Orbyt é completamente gratuito e assim pretendo manter. Se isso mudar no futuro, você será avisado com antecedência.`,
  },
  {
    number: '05',
    title: 'Uso Responsável',
    content: `Use o Orbyt de forma ética. Não tente acessar dados de outros usuários nem fazer nada que prejudique o serviço ou outras pessoas.`,
  },
  {
    number: '06',
    title: 'Propriedade Intelectual',
    content: `O design, código e nome do Orbyt são meus. Por favor não copie ou redistribua sem autorização — mas se tiver curiosidade sobre alguma parte técnica, pode perguntar.`,
  },
  {
    number: '07',
    title: 'Sem Garantias Formais',
    content: `O Orbyt é um projeto de aprendizado oferecido como está. Não há equipe técnica, SLA, suporte profissional nem servidor dedicado. Faço o melhor que posso para manter tudo funcionando, mas podem ocorrer instabilidades ou perda de dados. Use com essa consciência e, se possível, não dependa exclusivamente do app para informações críticas.`,
  },
  {
    number: '08',
    title: 'Contas e Suspensão',
    content: `Posso suspender contas que usem o serviço de forma abusiva. Você também pode excluir sua conta quando quiser pelas configurações.`,
  },
  {
    number: '09',
    title: 'Atualizações',
    content: `Estes termos podem mudar com o tempo conforme o projeto evolui. Se houver algo relevante, aviso pelo app.`,
  },
  {
    number: '10',
    title: 'Contato',
    content: `Dúvidas ou problemas? Fale comigo pelos canais disponíveis na plataforma. Sou estudante e faço isso no tempo livre, mas tento responder o quanto antes.`,
  },
];

export default function TermoUsoPage() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="tu-root" ref={rootRef}>
      <div className="tu-bg" aria-hidden="true" />

      <div className="tu-body">

        {/* Header */}
        <header className={`tu-header${scrolled ? ' scrolled' : ''}`}>
          <div className="tu-header-inner">
            <Link to="/" className="tu-logo-link">
              <img src="/Logo-Orbyt.svg" alt="Orbyt" />
              <span>Orbyt</span>
            </Link>
            <button onClick={() => navigate('/')} className="tu-btn-back">
              Início
            </button>
          </div>
        </header>

        {/* Page header — compacto */}
        <div className="tu-page-header">
          <div className="tu-page-tag">
            <span className="tu-tag-dot" />
            Documento Legal
          </div>
          <h1 className="tu-page-title">
            Termos de <span className="tu-grad">Uso</span>
          </h1>
          <div className="tu-page-meta">
            <span className="tu-meta-chip"><strong>Versão</strong> 1.0</span>
            <span className="tu-meta-dot" />
            <span className="tu-meta-chip"><strong>Atualização</strong> 26 fev. 2026</span>
            <span className="tu-meta-dot" />
            <span className="tu-meta-chip">{sections.length} cláusulas</span>
          </div>
        </div>

        {/* Accordion */}
        <div className="tu-sections">
          {sections.map((s) => (
            <div
              key={s.number}
              className={`tu-section${activeSection === s.number ? ' active' : ''}`}
              onClick={() => setActiveSection(activeSection === s.number ? null : s.number)}
            >
              <div className="tu-sec-top">
                <span className="tu-sec-num">{s.number}</span>
                <h2 className="tu-sec-title">{s.title}</h2>
                <div className="tu-sec-chevron">
                  <ChevronDown />
                </div>
              </div>
              <div className="tu-sec-body">
                <div className="tu-sec-body-inner">
                  <p>{s.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="tu-footer">
          <div className="tu-footer-info">
            <img src="/Logo-Orbyt.svg" alt="Orbyt" />
            <span>© 2026 Orbyt. Todos os direitos reservados.</span>
          </div>
          <button onClick={() => navigate('/')} className="tu-btn-primary">
            Voltar ao início <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}