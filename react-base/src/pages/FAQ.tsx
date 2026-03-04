import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import '../styles/FAQ.css';

/* ── Dados ── */
interface FAQItem {
  number: string;
  question: string;
  answer: string;
  category: 'geral' | 'funcionalidades' | 'personalizacao' | 'privacidade';
}

const FAQ_ITEMS: FAQItem[] = [
  // Geral
  {
    number: '01',
    category: 'geral',
    question: 'O Orbyt é gratuito para usar?',
    answer: 'Sim! O Orbyt é completamente gratuito. Você cria sua conta em segundos, sem precisar de cartão de crédito, e tem acesso a todas as funcionalidades principais sem nenhum custo.',
  },
  {
    number: '02',
    category: 'geral',
    question: 'Preciso de cartão de crédito para criar uma conta?',
    answer: 'Não. Nenhum dado de pagamento é solicitado no cadastro. Basta um e-mail e uma senha para começar a usar o Orbyt imediatamente.',
  },
  {
    number: '03',
    category: 'geral',
    question: 'O Orbyt funciona no celular?',
    answer: 'O Orbyt é totalmente responsivo e funciona muito bem em smartphones e tablets modernos pelo navegador. Um aplicativo nativo para iOS e Android está nos planos futuros do projeto.',
  },
  {
    number: '04',
    category: 'geral',
    question: 'O Orbyt funciona offline?',
    answer: 'Sim! O Orbyt é uma PWA (Progressive Web App) e pode funcionar offline. As tarefas ficam salvas localmente e sincronizam automaticamente quando a conexão retornar.',
  },
  // Funcionalidades
  {
    number: '01',
    category: 'funcionalidades',
    question: 'Como funciona o sistema de badges e conquistas?',
    answer: 'À medida que você completa tarefas, mantém sequências diárias e atinge marcos de produtividade, o Orbyt desbloqueia badges automaticamente. Existem conquistas comuns, raras e épicas — cada uma com critérios únicos para te manter motivado.',
  },
  {
    number: '02',
    category: 'funcionalidades',
    question: 'O controle por voz funciona em português?',
    answer: 'Sim! O reconhecimento de voz do Orbyt é otimizado para português brasileiro. Basta falar o nome da tarefa — por exemplo, "reunião amanhã às 14h" — e ela é criada automaticamente.',
  },
  {
    number: '03',
    category: 'funcionalidades',
    question: 'Como funciona a importação em lote de tarefas?',
    answer: 'No modo de importação em lote, você cola uma lista de texto — uma tarefa por linha — e o Orbyt interpreta e cria todas de uma vez. Você pode usar prefixos como "trabalho:" ou "cozinha:" para organizar por categoria automaticamente.',
  },
  {
    number: '04',
    category: 'funcionalidades',
    question: 'Como posso acompanhar meu progresso ao longo do tempo?',
    answer: 'O painel de estatísticas do Orbyt exibe sua taxa de conclusão de tarefas, sequência de dias ativos, total de tarefas concluídas e evolução semanal. Tudo em gráficos simples e visuais.',
  },
  // Personalização
  {
    number: '01',
    category: 'personalizacao',
    question: 'Quais temas estão disponíveis no Orbyt?',
    answer: 'O Orbyt oferece temas desbloqueáveis conforme você evolui: Padrão (sempre disponível), Lua Nova (modo escuro intenso), Ártico (tons frios e gelados), Estelar (gradiente cósmico), Dourado (tons quentes e elegantes) e Personalizado (para nível máximo). Cada tema transforma completamente a aparência do app.',
  },
  {
    number: '02',
    category: 'personalizacao',
    question: 'Como desbloqueio novos temas?',
    answer: 'Os temas são desbloqueados conforme seu nível evolutivo sobe. Cada tema tem um nível mínimo necessário — quanto mais você usa o Orbyt e conclui tarefas, mais temas você desbloqueia.',
  },
  // Privacidade
  {
    number: '01',
    category: 'privacidade',
    question: 'Meus dados são compartilhados com terceiros?',
    answer: 'Não. O Orbyt é um projeto pessoal e não vende, aluga nem compartilha seus dados com ninguém. A única situação em que isso poderia mudar seria por exigência legal — o que é muito improvável num projeto desse tamanho.',
  },
  {
    number: '02',
    category: 'privacidade',
    question: 'Como posso excluir minha conta e meus dados?',
    answer: 'Você pode excluir sua conta a qualquer momento pelas configurações do app. Todos os seus dados são removidos permanentemente. Se precisar de ajuda, entre em contato pelos canais disponíveis na plataforma.',
  },
];

const CATEGORIES = [
  { id: 'todas',         label: 'Todas'              },
  { id: 'geral',         label: 'Geral'              },
  { id: 'funcionalidades', label: 'Funcionalidades'  },
  { id: 'personalizacao',  label: 'Personalização'   },
  { id: 'privacidade',     label: 'Privacidade & Dados' },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  geral:           'Geral',
  funcionalidades: 'Funcionalidades',
  personalizacao:  'Personalização',
  privacidade:     'Privacidade & Dados',
};

type CategoryFilter = typeof CATEGORIES[number]['id'];

export default function FAQPage() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('todas');
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const filteredItems = activeFilter === 'todas'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter(item => item.category === activeFilter);

  const groupedItems = filteredItems.reduce<Record<string, FAQItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalVisible = filteredItems.length;

  const toggleItem = (key: string) => {
    setActiveItem(prev => (prev === key ? null : key));
  };

  return (
    <div className="faq-root" ref={rootRef}>
      <div className="faq-bg" aria-hidden="true" />

      <div className="faq-body">

        {/* Header */}
        <header className={`faq-header${scrolled ? ' scrolled' : ''}`}>
          <div className="faq-header-inner">
            <Link to="/" className="faq-logo-link">
              <img src="/Logo-Orbyt.svg" alt="Orbyt" />
              <span>Orbyt</span>
            </Link>
            <button onClick={() => navigate('/')} className="faq-btn-back">
              Início
            </button>
          </div>
        </header>

        {/* Page header */}
        <div className="faq-page-header">
          <div className="faq-page-tag">
            <span className="faq-tag-dot" />
            Suporte
          </div>
          <h1 className="faq-page-title">
            Perguntas <span className="faq-grad">Frequentes</span>
          </h1>
          <div className="faq-page-meta">
            <span className="faq-meta-chip"><strong>{FAQ_ITEMS.length}</strong> perguntas</span>
            <span className="faq-meta-dot" />
            <span className="faq-meta-chip"><strong>{CATEGORIES.length - 1}</strong> categorias</span>
            <span className="faq-meta-dot" />
            <span className="faq-meta-chip">Atualizado <strong>mar. 2026</strong></span>
          </div>
        </div>

        {/* Filtros */}
        <div className="faq-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`faq-filter-btn${activeFilter === cat.id ? ' active' : ''}`}
              onClick={() => { setActiveFilter(cat.id); setActiveItem(null); }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion agrupado por categoria */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="faq-group">
            {activeFilter === 'todas' && (
              <p className="faq-group-label">{CATEGORY_LABELS[category]}</p>
            )}
            <div className="faq-items">
              {items.map(item => {
                const key = `${item.category}-${item.number}`;
                return (
                  <div
                    key={key}
                    className={`faq-section${activeItem === key ? ' active' : ''}`}
                    onClick={() => toggleItem(key)}
                  >
                    <div className="faq-sec-top">
                      <span className="faq-sec-num">{item.number}</span>
                      <h2 className="faq-sec-title">{item.question}</h2>
                      <div className="faq-sec-chevron">
                        <ChevronDown />
                      </div>
                    </div>
                    <div className="faq-sec-body">
                      <div className="faq-sec-body-inner">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="faq-footer">
          <div className="faq-footer-info">
            <img src="/Logo-Orbyt.svg" alt="Orbyt" />
            <span>© 2026 Orbyt. Todos os direitos reservados.</span>
          </div>
          <button onClick={() => navigate('/')} className="faq-btn-primary">
            Voltar ao início <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}