import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaMedal } from 'react-icons/fa';
import { X, Trophy, Lock, Check, Sparkles, Star } from 'lucide-react';
import '../../styles/BadgesGallery.css';

interface Badge {
  id: string;
  nome: string;
  descricao: string;
  icone: React.ComponentType<any>;
  cor: string;
  tipo: string;
  desbloqueado?: boolean;
  niveis?: number[];
  progressoAtual?: number;
  nivelAtual?: number;
  coresNiveis?: string[];
  nomesNiveis?: string[];
}

interface PeriodosUsados {
  manha: boolean;
  tarde: boolean;
  noite: boolean;
}

interface BadgesGalleryProps {
  userBadges?: Badge[];
  userStats?: Record<string, any>;
  periodosUsados?: PeriodosUsados;
  onShowCommunity?: () => void;
  onClose: () => void;
  pageMode?: boolean;
}

const RARIDADE_CONFIG: Record<string, { title: string; cor: string; icon: React.ReactNode; glow: string }> = {
  common:    { title: 'Comum',   cor: '#94a3b8', icon: <FaMedal />,          glow: 'rgba(148,163,184,0.28)' },
  rare:      { title: 'Rara',    cor: '#38bdf8', icon: <Star size={13} />,   glow: 'rgba(56,189,248,0.28)'  },
  epic:      { title: 'Épica',   cor: '#a78bfa', icon: <Sparkles size={13} />, glow: 'rgba(167,139,250,0.28)' },
  secret:    { title: 'Secreta', cor: '#f59e0b', icon: <Star size={13} />,   glow: 'rgba(245,158,11,0.28)'  },
  evolutivo: { title: 'Especial',cor: '#fb7185', icon: <Trophy size={13} />, glow: 'rgba(251,113,133,0.28)' },
};

const NIVEL_NOMES = ['', 'Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante', 'Lendário'];
const NIVEL_CORES = ['', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#fbbf24', '#00e5ff'];
const NUMERAIS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];

export default function BadgesGallery({
  userBadges = [],
  userStats = {},
  periodosUsados = { manha: false, tarde: false, noite: false },
  onShowCommunity,
  onClose,
  pageMode = false,
}: BadgesGalleryProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (pageMode) { onClose(); return; }
    setIsClosing(true);
    setTimeout(() => { onClose(); }, 180);
  };

  // Contadores
  const { total, desbloqueadas, percentual } = useMemo(() => {
    const total = userBadges.length;
    const desbloqueadas = userBadges.filter(b => b.desbloqueado).length;
    return { total, desbloqueadas, percentual: total > 0 ? Math.round((desbloqueadas / total) * 100) : 0 };
  }, [userBadges]);

  // Funções auxiliares — stable refs, não dependem de state
  const getRaridade = useCallback((badge: Badge): string => {
    if (badge.tipo === 'evolutivo') return 'evolutivo';
    if (badge.tipo === 'secret' || badge.tipo === 'secreto') return 'secret';
    if (badge.tipo === 'epic') return 'epic';
    if (badge.tipo === 'rare' || badge.tipo === 'social') return 'rare';
    return 'common';
  }, []);

  const getNivelAtual = useCallback((badge: Badge): number => {
    if (badge.tipo !== 'evolutivo' || !badge.niveis || typeof badge.progressoAtual !== 'number') return 0;
    let nivel = 0;
    for (let i = 0; i < badge.niveis.length; i++) {
      if (badge.progressoAtual >= badge.niveis[i]) nivel = i + 1;
    }
    return nivel;
  }, []);

  const getProgresso = useCallback((badge: Badge): { atual: number; meta: number; percent: number } | null => {
    if (!badge.niveis || typeof badge.progressoAtual !== 'number') return null;
    const maxMeta = badge.niveis[badge.niveis.length - 1];
    const nivelIdx = badge.niveis.findIndex((n: number) => badge.progressoAtual! < n);
    if (nivelIdx === -1) return { atual: badge.progressoAtual, meta: maxMeta, percent: 100 };
    const meta = badge.niveis[nivelIdx];
    // Barra reflete progresso total (atual/max), não só o segmento do nível atual
    const percent = Math.round((badge.progressoAtual / maxMeta) * 100);
    return { atual: badge.progressoAtual, meta, percent };
  }, []);

  // Agrupa badges por raridade — recalcula só quando userBadges muda
  const raridades = ['evolutivo', 'secret', 'epic', 'rare', 'common'];
  const badgesPorRaridade = useMemo(() => {
    const result: Record<string, Badge[]> = {};
    raridades.forEach(r => { result[r] = userBadges.filter(b => getRaridade(b) === r); });
    return result;
  }, [userBadges, getRaridade]);

  const inner = (
    <div className={`badges-modal${isClosing ? ' fechando' : ''}${pageMode ? ' badges-page-mode' : ''}`}>
        {/* Header */}
        <div className="badges-header">
          <div className="badges-header-content">
            <Trophy className="badges-header-icon" />
            <div>
              <h2>Conquistas & Badges</h2>
              <p>Desbloqueie badges completando desafios e tarefas</p>
            </div>
          </div>
          {!pageMode && (
            <button className="badges-close-btn" onClick={handleClose} aria-label="Fechar">
              <X />
            </button>
          )}
        </div>

        {/* Progress Hero */}
        <div className="badges-progress-hero">
          {/* Ring de progresso */}
          <div className="bph-ring-wrap">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <defs>
                <linearGradient id="badgesRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="32" fill="none"
                stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none"
                stroke="url(#badgesRingGrad)" strokeWidth="6"
                strokeDasharray={201.1}
                strokeDashoffset={201.1 * (1 - percentual / 100)}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
              <text x="40" y="36" textAnchor="middle" fill="#fff"
                fontSize="14" fontWeight="800" fontFamily="Poppins,sans-serif">{desbloqueadas}</text>
              <text x="40" y="50" textAnchor="middle" fill="rgba(255,255,255,0.32)"
                fontSize="8" fontFamily="Poppins,sans-serif">/ {total}</text>
            </svg>
            <span className="bph-pct">{percentual}%</span>
          </div>

          {/* Chips por raridade */}
          <div className="bph-rarity-chips">
            {Object.entries(RARIDADE_CONFIG).map(([key, cfg]) => {
              const unlocked = badgesPorRaridade[key]?.filter(b => b.desbloqueado).length ?? 0;
              const tot = badgesPorRaridade[key]?.length ?? 0;
              if (tot === 0) return null;
              return (
                <div key={key} className="bph-chip" style={{ '--chip-c': cfg.cor } as React.CSSProperties}>
                  <span className="bph-chip-icon">{cfg.icon}</span>
                  <span className="bph-chip-label">{cfg.title}</span>
                  <span className="bph-chip-count">{unlocked}/{tot}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges Grid por Raridade */}
        <div className="badges-content">
          {raridades.map(raridade => {
            const badges = badgesPorRaridade[raridade];
            if (!badges || badges.length === 0) return null;
            const config = RARIDADE_CONFIG[raridade];

            return (
              <div key={raridade} className="badges-section">
                <div className="badges-section-header">
                  <div className="badges-section-line" style={{ background: config.cor }} />
                  <span className="badges-section-title" style={{ color: config.cor }}>
                    {config.icon}
                    {config.title}
                  </span>
                  <div className="badges-section-line" style={{ background: config.cor }} />
                </div>

                <div className="badges-grid">
                  {badges.map((badge) => {
                    const Icon = typeof badge.icone === 'function' ? badge.icone : FaMedal;
                    const bloqueada = !badge.desbloqueado;
                    const nivel = getNivelAtual(badge);
                    const progresso = getProgresso(badge);
                    const isEvolutivo = raridade === 'evolutivo';

                    return (
                      <button
                        key={badge.id}
                        className={`badge-card ${bloqueada ? 'locked' : 'unlocked'} raridade-${raridade}`}
                        onClick={() => setSelectedBadge(badge)}
                        style={{
                          '--badge-color': bloqueada ? '#555' : (isEvolutivo && nivel > 0 ? NIVEL_CORES[nivel] : badge.cor),
                          '--badge-glow': bloqueada ? 'transparent' : config.glow,
                        } as React.CSSProperties}
                      >
                        {/* Ícone */}
                        <div className="bc-icon-area">
                          {raridade === 'secret' && bloqueada
                            ? <span className="bc-mystery">?</span>
                            : <Icon size={26} />
                          }
                          {bloqueada && raridade !== 'secret' && (
                            <div className="bc-lock"><Lock size={10} /></div>
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div className="bc-content">
                          <div className="bc-top">
                            <span className="bc-name">
                              {raridade === 'secret' && bloqueada ? '????' : badge.nome}
                            </span>
                            {!bloqueada && !isEvolutivo && (
                              <span className="bc-check"><Check size={10} /></span>
                            )}
                            {isEvolutivo && nivel > 0 && (
                              <span className="bc-nivel-pill" style={{ background: NIVEL_CORES[nivel] }}>
                                {NUMERAIS[nivel]}
                              </span>
                            )}
                          </div>
                          {!(raridade === 'secret' && bloqueada) && (
                            <div className="bc-desc">{badge.descricao}</div>
                          )}
                          {isEvolutivo && progresso && (
                            <div className="bc-progress">
                              <div className="bc-progress-bar">
                                <div className="bc-progress-fill" style={{
                                  width: `${progresso.percent}%`,
                                  background: nivel > 0 ? NIVEL_CORES[nivel] : '#a084ee'
                                }} />
                              </div>
                              <span className="bc-progress-text">{progresso.atual}/{progresso.meta}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="badges-footer">
          <Trophy size={13} className="badges-footer-icon" />
          <span>Continue desbloqueando conquistas — cada badge conta uma história.</span>
        </div>

        {/* Modal de Detalhes do Badge */}
        {selectedBadge && (
          <BadgeDetailModal
            badge={selectedBadge}
            onClose={() => setSelectedBadge(null)}
            getNivelAtual={getNivelAtual}
            getProgresso={getProgresso}
            getRaridade={getRaridade}
            periodosUsados={periodosUsados}
          />
        )}
    </div>
  );

  if (pageMode) return inner;

  return (
    <div className={`badges-overlay${isClosing ? ' fechando' : ''}`} onClick={handleClose}>
      {inner}
    </div>
  );
}

// Modal de Detalhes
interface BadgeDetailModalProps {
  badge: Badge;
  onClose: () => void;
  getNivelAtual: (badge: Badge) => number;
  getProgresso: (badge: Badge) => { atual: number; meta: number; percent: number } | null;
  getRaridade: (badge: Badge) => string;
  periodosUsados: PeriodosUsados;
}

function BadgeDetailModal({ badge, onClose, getNivelAtual, getProgresso, getRaridade, periodosUsados }: BadgeDetailModalProps) {
  const Icon = typeof badge.icone === 'function' ? badge.icone : FaMedal;
  const raridade = getRaridade(badge);
  const config = RARIDADE_CONFIG[raridade];
  const nivel = getNivelAtual(badge);
  const progresso = getProgresso(badge);
  const isEvolutivo = raridade === 'evolutivo';
  const bloqueada = !badge.desbloqueado;
  const isSecret = raridade === 'secret';
  const iconColor = bloqueada ? '#4a4a5a' : (isEvolutivo && nivel > 0 ? NIVEL_CORES[nivel] : badge.cor);

  return createPortal(
    <div className="badge-detail-overlay" onClick={onClose}>
      <div
        className={`badge-detail-modal raridade-${raridade}`}
        style={{ '--detail-rarity-color': config.cor, '--detail-icon-color': iconColor } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button className="badge-detail-close" onClick={onClose} aria-label="Fechar">
          <X size={16} />
        </button>

        {/* ── Header: ícone + glow atmosférico ── */}
        <div className={`badge-detail-header ${bloqueada ? 'locked' : 'unlocked'} raridade-${raridade}`}>
          {/* Glow radial de fundo */}
          <div className="badge-detail-header-glow" />

          {/* Ícone circular + status dot wrapper */}
          <div className="badge-detail-icon-wrap">
            <div className={`badge-detail-icon-circle ${isEvolutivo && nivel > 0 ? `nivel-${nivel}` : ''}`}>
              {isSecret && bloqueada ? (
                <span className="badge-detail-secret-q">?</span>
              ) : (
                <Icon size={48} />
              )}
            </div>
            <div className={`badge-detail-status-dot ${bloqueada ? 'locked' : 'unlocked'}`}>
              {bloqueada ? <Lock size={11} /> : <Check size={11} />}
            </div>
          </div>

          {/* Rarity tag no header */}
          <div className="badge-detail-rarity-tag">
            {config.icon}
            <span>{config.title}</span>
          </div>
        </div>

        {/* ── Conteúdo ── */}
        <div className="badge-detail-body">
          <h3 className="badge-detail-name">
            {isSecret && bloqueada ? '????' : badge.nome}
          </h3>

          <p className="badge-detail-desc">
            {isSecret && bloqueada
              ? 'Complete ações especiais para revelar esta conquista secreta...'
              : badge.descricao}
          </p>

          {/* Níveis do badge evolutivo */}
          {isEvolutivo && (
            <div className="badge-detail-niveis">
              <div className="badge-detail-section-label">Evolução</div>
              <div className="badge-detail-niveis-list">
                {badge.niveis?.map((meta, idx) => {
                  const nivelNum = idx + 1;
                  const alcancado = nivel >= nivelNum;
                  return (
                    <div
                      key={idx}
                      className={`badge-detail-nivel-item ${alcancado ? 'alcancado' : ''}`}
                      style={{ '--nivel-cor': NIVEL_CORES[nivelNum] } as React.CSSProperties}
                    >
                      <span className="nivel-numeral">{NUMERAIS[nivelNum]}</span>
                      <span className="nivel-nome">{NIVEL_NOMES[nivelNum]}</span>
                      <span className="nivel-meta">{meta} tarefas</span>
                      {alcancado && <Check size={12} className="nivel-check" />}
                    </div>
                  );
                })}
              </div>
              {progresso && (
                <div className="badge-detail-progresso">
                  <div className="badge-detail-progress-bar">
                    <div
                      className="badge-detail-progress-fill"
                      style={{ width: `${progresso.percent}%`, background: nivel > 0 ? NIVEL_CORES[nivel] : config.cor }}
                    />
                  </div>
                  <span className="badge-detail-progress-text">{progresso.atual} / {progresso.meta}</span>
                </div>
              )}
            </div>
          )}

          {/* Períodos do Mestre do Tempo */}
          {badge.id === 'mestre-tempo' && (
            <div className="badge-detail-periodos">
              <div className="badge-detail-section-label">Períodos registrados</div>
              <div className="badge-detail-periodos-list">
                {[
                  { emoji: '🌅', nome: 'Manhã',  horario: '6h–12h',  ok: periodosUsados.manha },
                  { emoji: '☀️', nome: 'Tarde',  horario: '12h–18h', ok: periodosUsados.tarde },
                  { emoji: '🌙', nome: 'Noite',  horario: '18h–6h',  ok: periodosUsados.noite },
                ].map(({ emoji, nome, horario, ok }) => (
                  <div key={nome} className={`badge-detail-periodo-item ${ok ? 'alcancado' : ''}`}>
                    <span className="periodo-emoji">{emoji}</span>
                    <span className="periodo-nome">{nome}</span>
                    <span className="periodo-horario">{horario}</span>
                    {ok && <Check size={12} className="nivel-check" />}
                  </div>
                ))}
              </div>
              <div className="badge-detail-periodos-info">
                {[periodosUsados.manha, periodosUsados.tarde, periodosUsados.noite].filter(Boolean).length} / 3 períodos
              </div>
            </div>
          )}

          {/* Status bar */}
          <div className={`badge-detail-status-bar ${bloqueada ? 'locked' : 'unlocked'}`}>
            {bloqueada ? <Lock size={14} /> : <Check size={14} />}
            <span>{bloqueada ? 'Ainda não desbloqueada' : 'Desbloqueada!'}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
