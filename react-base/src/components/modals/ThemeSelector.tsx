import { useState } from 'react';
import { X, Lock, Check, Sparkles } from 'lucide-react';
import { THEMES, isThemeUnlocked } from '../../data/ThemesData';
import ThemeCustomizer, { CustomThemeColors } from './ThemeCustomizer';
import '../../styles/ThemeSelector.css';

interface ThemeSelectorProps {
  temaAtual: string;
  nivelEvolutivo: number;
  onSelectTheme: (themeId: string, customColors?: CustomThemeColors) => void;
  onClose: () => void;
  pageMode?: boolean;
}

const NIVEL_NOMES = ['', 'Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante', 'Lendário'];

export default function ThemeSelector({
  temaAtual,
  nivelEvolutivo,
  onSelectTheme,
  onClose,
  pageMode = false,
}: ThemeSelectorProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { onClose(); }, 180);
  };

  const handleThemeClick = (themeId: string, unlocked: boolean) => {
    if (!unlocked) return;
    if (themeId === 'custom') {
      setShowThemeCustomizer(true);
    } else {
      onSelectTheme(themeId);
    }
  };

  const inner = (
    <div className={`theme-selector-modal${isClosing ? ' fechando' : ''}${pageMode ? ' theme-selector-page' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="theme-selector-header">
        <div className="theme-selector-header-content">
          <Sparkles className="theme-selector-icon" />
          <div>
            <h2>Temas Visuais</h2>
            <p>Desbloqueie temas evoluindo seu badge "Evolutivo"</p>
          </div>
        </div>
        <button className="theme-close-btn" onClick={handleClose} aria-label="Fechar">
          <X />
        </button>
      </div>

      <div className="theme-nivel-info">
        <span>Seu nível atual:</span>
        <span className={`theme-nivel-badge nivel-${nivelEvolutivo}`}>
          {nivelEvolutivo === 0 ? 'Nenhum' : `Nível ${nivelEvolutivo} - ${NIVEL_NOMES[nivelEvolutivo]}`}
        </span>
      </div>

      <div className="theme-grid">
        {THEMES.map((theme) => {
          const unlocked = theme ? isThemeUnlocked(theme.id, nivelEvolutivo) : false;
          const isActive = theme ? temaAtual === theme.id : false;
          const Icon = theme ? theme.icone : Sparkles;
          const preview = theme?.preview ?? { gradientStart: '#1a1625', gradientEnd: '#2d1b4e', particleColor: '#ffffff', linkColor: '#a855f7' };

          // For 'custom' theme, show stored colors if available
          const customBgStart = theme.id === 'custom' ? (localStorage.getItem('customBgStart') || preview.gradientStart) : preview.gradientStart;
          const customBgEnd   = theme.id === 'custom' ? (localStorage.getItem('customBgEnd')   || preview.gradientEnd)   : preview.gradientEnd;
          const customParticle = theme.id === 'custom' ? (localStorage.getItem('customParticleColor') || preview.particleColor) : preview.particleColor;
          const customLink     = theme.id === 'custom' ? (localStorage.getItem('customParticleLinkColor') || preview.linkColor) : preview.linkColor;

          return (
            <button
              key={theme.id}
              className={`theme-card ${isActive ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
              onClick={() => handleThemeClick(theme.id, unlocked)}
              disabled={!unlocked}
              aria-label={`Tema ${theme.nome}${!unlocked ? ' (Bloqueado)' : ''}`}
            >
              {/* Preview do tema — mini UI mockup */}
              <div
                className="theme-preview"
                style={{ background: `linear-gradient(145deg, ${customBgStart} 0%, ${customBgEnd} 100%)` }}
              >
                {/* Mini sidebar */}
                <div className="tp-sidebar" style={{ borderRight: `1px solid ${customLink}28` }}>
                  <div className="tp-logo" style={{ background: customLink }} />
                  <div className="tp-nav-item" style={{ background: customLink, opacity: 0.7 }} />
                  <div className="tp-nav-item" style={{ background: customParticle, opacity: 0.25 }} />
                  <div className="tp-nav-item" style={{ background: customParticle, opacity: 0.18 }} />
                  <div className="tp-nav-item" style={{ background: customParticle, opacity: 0.12 }} />
                </div>
                {/* Mini task list */}
                <div className="tp-body">
                  <div className="tp-task" style={{ background: `${customLink}18`, border: `1px solid ${customLink}30` }}>
                    <div className="tp-check" style={{ borderColor: customLink, background: customLink }} />
                    <div className="tp-lines">
                      <div className="tp-line tp-line--w65" style={{ background: customParticle, opacity: 0.55 }} />
                      <div className="tp-line tp-line--w85" style={{ background: customParticle, opacity: 0.2 }} />
                    </div>
                  </div>
                  <div className="tp-task" style={{ background: `${customParticle}0a`, border: `1px solid ${customParticle}18` }}>
                    <div className="tp-check tp-check--empty" style={{ borderColor: `${customParticle}50` }} />
                    <div className="tp-lines">
                      <div className="tp-line tp-line--w80" style={{ background: customParticle, opacity: 0.35 }} />
                      <div className="tp-line tp-line--w55" style={{ background: customParticle, opacity: 0.15 }} />
                    </div>
                  </div>
                  <div className="tp-task" style={{ background: `${customParticle}06`, border: `1px solid ${customParticle}10` }}>
                    <div className="tp-check tp-check--empty" style={{ borderColor: `${customParticle}30` }} />
                    <div className="tp-lines">
                      <div className="tp-line tp-line--w70" style={{ background: customParticle, opacity: 0.2 }} />
                    </div>
                  </div>
                </div>

                {!unlocked && (
                  <div className="theme-lock-overlay">
                    <Lock size={24} />
                    <span>Nível {theme.nivelRequerido}</span>
                  </div>
                )}
                {isActive && unlocked && (
                  <div className="theme-active-check">
                    <Check size={20} />
                  </div>
                )}
              </div>

              {/* Info do tema */}
              <div className="theme-info">
                <div className="theme-name">
                  <Icon size={16} />
                  <span>{theme.nome}</span>
                </div>
                <p className="theme-desc">{theme.descricao}</p>

                {theme.id === 'custom' ? (
                  <span className={`theme-req theme-req--custom${unlocked ? ' unlocked' : ''}`}>
                    {unlocked ? '🎨 Clique para personalizar' : `🔒 Requer Nível 6 — Lendário`}
                  </span>
                ) : theme.nivelRequerido === 0 ? (
                  <span className="theme-req unlocked">✓ Sempre disponível</span>
                ) : unlocked ? (
                  <span className="theme-req unlocked">✓ Desbloqueado</span>
                ) : (
                  <span className="theme-req">
                    🔒 Requer Nível {theme.nivelRequerido} — {NIVEL_NOMES[theme.nivelRequerido] ?? 'Lendário'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {showThemeCustomizer && (
        <ThemeCustomizer
          onApply={(colors) => {
            onSelectTheme('custom', colors);
            setShowThemeCustomizer(false);
          }}
          onClose={() => setShowThemeCustomizer(false)}
        />
      )}
      {pageMode ? inner : (
        <div className={`theme-selector-overlay${isClosing ? ' fechando' : ''}`} onClick={handleClose}>
          {inner}
        </div>
      )}
    </>
  );
}
