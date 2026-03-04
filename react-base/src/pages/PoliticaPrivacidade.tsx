import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import '../styles/PoliticaPrivacidade.css';

const sections = [
  {
    number: '01',
    title: 'Quem está por trás',
    content: `O Orbyt é um projeto pessoal criado por um estudante de programação. Não há empresa, equipe jurídica nem estrutura corporativa — é um projeto individual feito no tempo livre. Qualquer dúvida sobre seus dados, pode falar diretamente comigo pelos canais da plataforma.`,
  },
  {
    number: '02',
    title: 'O que coleto',
    content: `Coleto apenas o mínimo: e-mail e senha para criar e autenticar sua conta, e preferências locais (tema, configurações) para personalizar sua experiência. A senha é armazenada criptografada — nem eu tenho acesso a ela.`,
  },
  {
    number: '03',
    title: 'Por que coleto',
    content: `Seus dados são usados exclusivamente para o app funcionar. E-mail para identificar sua conta, senha para protegê-la, preferências para lembrar suas escolhas. Nada além disso.`,
  },
  {
    number: '04',
    title: 'Compartilhamento',
    content: `Não vendo, alugo nem compartilho seus dados com ninguém. A única situação em que isso mudaria seria por exigência legal — o que é muito improvável de acontecer num projeto pessoal desse tamanho.`,
  },
  {
    number: '05',
    title: 'Cookies e sessão',
    content: `Uso cookies apenas para manter você logado. Sem rastreamento, sem anúncios, sem analytics de comportamento.`,
  },
  {
    number: '06',
    title: 'Seus direitos',
    content: `Você pode pedir pra ver, corrigir ou deletar seus dados a qualquer momento. Para excluir sua conta e todos os dados associados, acesse as configurações ou entre em contato. Procuro respeitar o espírito da LGPD dentro das minhas possibilidades como desenvolvedor individual.`,
  },
  {
    number: '07',
    title: 'Segurança',
    content: `Faço o possível para manter seus dados seguros: senhas criptografadas e conexão HTTPS. Mas como é um projeto pessoal sem infraestrutura profissional, não posso garantir segurança absoluta. Use uma senha forte e evite salvar informações sensíveis nas tarefas.`,
  },
  {
    number: '08',
    title: 'Atualizações',
    content: `Se esta política mudar de forma relevante, aviso pelo app. Última atualização: 1 de março de 2026.`,
  },
];

export default function PoliticaPrivacidadePage() {
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
    <div className="pp-root" ref={rootRef}>
      <div className="pp-bg" aria-hidden="true" />

      <div className="pp-body">

        {/* Header */}
        <header className={`pp-header${scrolled ? ' scrolled' : ''}`}>
          <div className="pp-header-inner">
            <Link to="/" className="pp-logo-link">
              <img src="/Logo-Orbyt.svg" alt="Orbyt" />
              <span>Orbyt</span>
            </Link>
            <button onClick={() => navigate('/')} className="pp-btn-back">
              Início
            </button>
          </div>
        </header>

        {/* Page header */}
        <div className="pp-page-header">
          <div className="pp-page-tag">
            <span className="pp-tag-dot" />
            Documento Legal
          </div>
          <h1 className="pp-page-title">
            Política de <span className="pp-grad">Privacidade</span>
          </h1>
          <div className="pp-page-meta">
            <span className="pp-meta-chip"><strong>Versão</strong> 1.0</span>
            <span className="pp-meta-dot" />
            <span className="pp-meta-chip"><strong>Atualização</strong> 26 fev. 2026</span>
            <span className="pp-meta-dot" />
            <span className="pp-meta-chip">{sections.length} seções</span>
          </div>
        </div>

        {/* Accordion */}
        <div className="pp-sections">
          {sections.map((s) => (
            <div
              key={s.number}
              className={`pp-section${activeSection === s.number ? ' active' : ''}`}
              onClick={() => setActiveSection(activeSection === s.number ? null : s.number)}
            >
              <div className="pp-sec-top">
                <span className="pp-sec-num">{s.number}</span>
                <h2 className="pp-sec-title">{s.title}</h2>
                <div className="pp-sec-chevron">
                  <ChevronDown />
                </div>
              </div>
              <div className="pp-sec-body">
                <div className="pp-sec-body-inner">
                  <p>{s.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pp-footer">
          <div className="pp-footer-info">
            <img src="/Logo-Orbyt.svg" alt="Orbyt" />
            <span>© 2026 Orbyt. Todos os direitos reservados.</span>
          </div>
          <button onClick={() => navigate('/')} className="pp-btn-primary">
            Voltar ao início <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}