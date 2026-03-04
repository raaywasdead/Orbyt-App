import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import {
  X,
  Settings,
  PartyPopper,
  Palette,
  Eye,
  Search,
  ArrowUpDown,
  ListChecks,
  BarChart3,
  Zap,
  GripVertical,
  Target,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Mic,
  Accessibility,
  Upload,
  RotateCcw,
  Flame,
  Sparkles,
  Volume2,
  Globe,
} from 'lucide-react';
import '../../styles/SettingsModal.css';

interface SettingsModalProps {
  confeteAtivo: boolean;
  buscaBarAtiva: boolean;
  ordenacaoAtiva: boolean;
  filtrosAtivos: boolean;
  barraPorcentagemAtiva: boolean;
  acoesRapidasAtivas: boolean;
  dragAtivo: boolean;
  vozAtiva: boolean;
  streakAtivo: boolean;
  sonsAtivos: boolean;
  particulasAtivas: boolean;
  logoDesbloqueado: boolean;
  logoCustom: string | null;
  logoNeonColor: string;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setLogoCustom: (v: string | null) => void;
  setLogoNeonColor: (v: string) => void;
  setConfeteAtivo: (fn: (v: boolean) => boolean) => void;
  setBuscaBarAtiva: (fn: (v: boolean) => boolean) => void;
  setOrdenacaoAtiva: (fn: (v: boolean) => boolean) => void;
  setFiltrosAtivos: (fn: (v: boolean) => boolean) => void;
  setFiltro: (v: string) => void;
  setBarraPorcentagemAtiva: (fn: (v: boolean) => boolean) => void;
  setAcoesRapidasAtivas: (fn: (v: boolean) => boolean) => void;
  setDragAtivo: (fn: (v: boolean) => boolean) => void;
  setVozAtiva: (fn: (v: boolean) => boolean) => void;
  setStreakAtivo: (fn: (v: boolean) => boolean) => void;
  setSonsAtivos: (fn: (v: boolean) => boolean) => void;
  setParticulasAtivas: (fn: (v: boolean) => boolean) => void;
  aplicarPerfilAcessibilidade: (perfil: string) => void;
  setModoFoco?: (v: boolean) => void;
  setAltoContraste?: (v: boolean) => void;
  setReducaoMovimento?: (v: boolean) => void;
  setEspacamentoAumentado?: (v: boolean) => void;
  setFocoVisivel?: (v: boolean) => void;
  onOpenGuia: () => void;
  onLimparConcluidas: () => void;
  onRemoverTudo: () => void;
  onClose: () => void;
  pageMode?: boolean;
}

// ── Helpers ───────────────────────────────────────────────

const readLS = (key: string) => {
  try { return localStorage.getItem(key) === 'true'; } catch { return false; }
};

const writeLS = (key: string, value: boolean) => {
  try { localStorage.setItem(key, String(value)); } catch {}
};

const toggleBodyClass = (className: string, active: boolean) => {
  document.body.classList.toggle(className, active);
};

// Resolve CSS var() para hex — input[type="color"] não aceita var()
const resolveColor = (color: string): string => {
  if (!color.startsWith('var(')) return color;
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-color')
    .trim() || '#a855f7';
};

// ── Sub-components ────────────────────────────────────────

const SettingCard = ({ children, className = '', onClick }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div className={`setting-card ${className}`} onClick={onClick}>
    {children}
  </div>
);

const SettingSection = ({ children, color, icon: Icon, title }: {
  children: React.ReactNode;
  color: string;
  icon?: React.ElementType;
  title: string;
}) => (
  <section className="settings-section">
    <div className="settings-section-header">
      <div className="settings-section-line" style={{ background: color }} />
      <span className="settings-section-title" style={{ color }}>
        {Icon && <Icon size={16} />}
        {title}
      </span>
      <div className="settings-section-line" style={{ background: color }} />
    </div>
    {children}
  </section>
);

const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button className={`setting-switch ${active ? 'on' : 'off'}`} onClick={onClick}>
    <span className="setting-switch-knob" />
  </button>
);

// ── Accessibility hook ────────────────────────────────────

function useAccessibilityToggle(
  localStorageKey: string,
  bodyClass: string,
  appSetter?: (v: boolean) => void
) {
  const [active, setActive] = useState<boolean>(() => {
    return document.body.classList.contains(bodyClass) || readLS(localStorageKey);
  });

  useEffect(() => {
    const stored = readLS(localStorageKey);
    if (stored && !document.body.classList.contains(bodyClass)) {
      toggleBodyClass(bodyClass, true);
    }
    setActive(document.body.classList.contains(bodyClass) || stored);
  }, []);

  const toggle = useCallback(() => {
    setActive(prev => {
      const next = !prev;
      toggleBodyClass(bodyClass, next);
      writeLS(localStorageKey, next);
      appSetter?.(next);
      return next;
    });
  }, [bodyClass, localStorageKey, appSetter]);

  return { active, toggle };
}

// ── Main component ────────────────────────────────────────

export default function SettingsModal({
  confeteAtivo,
  buscaBarAtiva,
  ordenacaoAtiva,
  filtrosAtivos,
  barraPorcentagemAtiva,
  acoesRapidasAtivas,
  dragAtivo,
  vozAtiva,
  streakAtivo,
  sonsAtivos,
  particulasAtivas,
  logoDesbloqueado,
  logoCustom,
  logoNeonColor,
  handleLogoUpload,
  setLogoCustom,
  setLogoNeonColor,
  setConfeteAtivo,
  setBuscaBarAtiva,
  setOrdenacaoAtiva,
  setFiltrosAtivos,
  setFiltro,
  setBarraPorcentagemAtiva,
  setAcoesRapidasAtivas,
  setDragAtivo,
  setVozAtiva,
  setStreakAtivo,
  setSonsAtivos,
  setParticulasAtivas,
  setReducaoMovimento,
  setFocoVisivel,
  onOpenGuia,
  onLimparConcluidas,
  onRemoverTudo,
  onClose,
  pageMode = false,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'pt');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const reduceMotion  = useAccessibilityToggle('reducaoMovimento', 'reducao-movimento', setReducaoMovimento);
  const focusHighlight = useAccessibilityToggle('focoVisivel', 'foco-visivel-forte', setFocoVisivel);

  const handleVoiceToggle = useCallback(() => {
    setVozAtiva(v => !v);
  }, [setVozAtiva]);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setCurrentLang(lang);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 180);
  };

  const inner = (
    <div
      className={`settings-modal${isClosing ? ' fechando' : ''}${pageMode ? ' settings-modal-page' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="settings-header">
        <div className="settings-header-content">
          <Settings className="settings-header-icon" />
          <div>
            <h2>{t('settings.title')}</h2>
            <p>{t('settings.sub')}</p>
          </div>
        </div>
        <button className="settings-close-btn" onClick={handleClose} aria-label={t('settings.close')}>
          <X />
        </button>
      </div>

      <div className="settings-content">

        {/* ── IDIOMA ── */}
        <SettingSection color="#a855f7" icon={Globe} title={t('settings.language.title')}>
          <div className="settings-grid">
            <SettingCard className="lang-card">
              <button className={`lang-btn${currentLang === 'pt' ? ' active' : ''}`} onClick={() => handleLanguageChange('pt')}>
              {t('settings.language.pt')}
              </button>
              <button className={`lang-btn${currentLang === 'en' ? ' active' : ''}`} onClick={() => handleLanguageChange('en')}>
              {t('settings.language.en')}
              </button>
            </SettingCard>
          </div>
        </SettingSection>

        {/* ── APARÊNCIA ── */}
        <SettingSection color="#a084ee" icon={Palette} title={t('settings.sections.appearance')}>
          <div className="settings-grid">
            {logoDesbloqueado && (
              <div className="logo-selector-section">
                <div className="logo-selector-header">
                  <div className="logo-selector-header-left">
                    <Palette size={18} className="logo-selector-icon-svg" />
                    <span className="logo-selector-title">{t('settings.appearance.logoCustom')}</span>
                  </div>
                </div>
                <div className="logo-custom-container">
                  <div className="logo-preview-box" style={{ '--preview-neon': resolveColor(logoNeonColor) } as React.CSSProperties}>
                    <img src={logoCustom || '/Logo-Orbyt.svg'} alt="Logo Preview" className="logo-preview-img" />
                  </div>
                  <div className="logo-controls">
                    <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleLogoUpload} className="logo-file-input" />
                    <div className="logo-upload-actions">
                      <button className="logo-upload-btn" onClick={() => logoInputRef.current?.click()}>
                        <Upload size={15} /> {t('settings.appearance.chooseImage')}
                      </button>
                      {logoCustom && (
                        <button className="logo-reset-btn" onClick={() => setLogoCustom(null)}>
                          <RotateCcw size={15} /> {t('settings.appearance.useDefault')}
                        </button>
                      )}
                    </div>
                    <div className="logo-neon-row">
                      <span className="logo-neon-label">{t('settings.appearance.neonColor')}</span>
                      <input
                        type="color"
                        value={resolveColor(logoNeonColor)}
                        onChange={(e) => setLogoNeonColor(e.target.value)}
                        className="logo-color-picker"
                      />
                    </div>
                    <div className="logo-quick-colors">
                      {['var(--accent-color, #a855f7)', '#f472b6', '#38bdf8', '#22d3ee', '#10b981', '#f97316', '#ef4444', '#fbbf24'].map(color => (
                        <button
                          key={color}
                          className={`logo-quick-color ${logoNeonColor === color ? 'selected' : ''}`}
                          style={{ background: color }}
                          onClick={() => setLogoNeonColor(resolveColor(color))}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SettingSection>

        {/* ── VISUALIZAÇÃO ── */}
        <SettingSection color="#00eaff" icon={Eye} title={t('settings.sections.display')}>
          <div className="settings-grid">
            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: '#00eaff22', color: '#00eaff' }}><Search size={18} /></div>
              <div className="setting-card-info">
                <div className="setting-card-name">{t('settings.display.search')}</div>
                <div className="setting-card-desc">{t('settings.display.searchDesc')}</div>
              </div>
              <Toggle active={buscaBarAtiva} onClick={() => setBuscaBarAtiva(v => !v)} />
            </SettingCard>

            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: '#00eaff22', color: '#00eaff' }}><ArrowUpDown size={18} /></div>
              <div className="setting-card-info">
                <div className="setting-card-name">{t('settings.display.sort')}</div>
                <div className="setting-card-desc">{t('settings.display.sortDesc')}</div>
              </div>
              <Toggle active={ordenacaoAtiva} onClick={() => setOrdenacaoAtiva(v => !v)} />
            </SettingCard>

            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: '#00eaff22', color: '#00eaff' }}><ListChecks size={18} /></div>
              <div className="setting-card-info">
                <div className="setting-card-name">{t('settings.display.indicators')}</div>
                <div className="setting-card-desc">{t('settings.display.indicatorsDesc')}</div>
              </div>
              <Toggle active={filtrosAtivos} onClick={() => setFiltrosAtivos(v => { const next = !v; if (!next) setFiltro('todas'); return next; })} />
            </SettingCard>

            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: '#00eaff22', color: '#00eaff' }}><BarChart3 size={18} /></div>
              <div className="setting-card-info">
                <div className="setting-card-name">{t('settings.display.progressBar')}</div>
                <div className="setting-card-desc">{t('settings.display.progressBarDesc')}</div>
              </div>
              <Toggle active={barraPorcentagemAtiva} onClick={() => setBarraPorcentagemAtiva(v => !v)} />
            </SettingCard>
          </div>
        </SettingSection>

        {/* ── COMPORTAMENTO ── */}
        <SettingSection color="#f97316" icon={Zap} title={t('settings.sections.behavior')}>
          <div className="settings-grid">
            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: '#fbbf2422', color: '#fbbf24' }}><PartyPopper size={18} /></div>
              <div className="setting-card-info">
                <div className="setting-card-name">{t('settings.behavior.confetti')}</div>
                <div className="setting-card-desc">{t('settings.behavior.confettiDesc')}</div>
              </div>
              <Toggle active={confeteAtivo} onClick={() => setConfeteAtivo(v => !v)} />
            </SettingCard>

            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: '#f9731622', color: '#f97316' }}><Zap size={18} /></div>
              <div className="setting-card-info">
                <div className="setting-card-name">{t('settings.behavior.quickActions')}</div>
                <div className="setting-card-desc">{t('settings.behavior.quickActionsDesc')}</div>
              </div>
              <Toggle active={acoesRapidasAtivas} onClick={() => setAcoesRapidasAtivas(v => !v)} />
            </SettingCard>

            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: '#f9731622', color: '#f97316' }}><GripVertical size={18} /></div>
              <div className="setting-card-info">
                <div className="setting-card-name">{t('settings.behavior.drag')}</div>
                <div className="setting-card-desc">{t('settings.behavior.dragDesc')}</div>
              </div>
              <Toggle active={dragAtivo} onClick={() => setDragAtivo(v => !v)} />
            </SettingCard>

            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: '#f9731622', color: '#f97316' }}><Flame size={18} /></div>
              <div className="setting-card-info">
                <div className="setting-card-name">{t('settings.behavior.streak')}</div>
                <div className="setting-card-desc">{t('settings.behavior.streakDesc')}</div>
              </div>
              <Toggle active={streakAtivo} onClick={() => setStreakAtivo(v => !v)} />
            </SettingCard>

            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: '#f9731622', color: '#f97316' }}><Volume2 size={18} /></div>
              <div className="setting-card-info">
                <div className="setting-card-name">{t('settings.behavior.sounds')}</div>
                <div className="setting-card-desc">{t('settings.behavior.soundsDesc')}</div>
              </div>
              <Toggle active={sonsAtivos} onClick={() => setSonsAtivos(v => !v)} />
            </SettingCard>

            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: '#a855f722', color: '#a855f7' }}>
                <Sparkles size={18} />
              </div>
              <div className="setting-card-info">
                <div className="setting-card-name">Partículas de Fundo</div>
                <div className="setting-card-desc">Animar partículas interativas</div>
              </div>
              <Toggle active={particulasAtivas} onClick={() => {
                setParticulasAtivas(v => !v);
                localStorage.setItem('particulasAtivas', String(!particulasAtivas));
              }} />
            </SettingCard>

            <SettingCard className="compact">
              <div className="setting-card-icon small" style={{ background: 'var(--accent-bg, #8b5cf622)', color: 'var(--accent-color, #8b5cf6)' }}>
                <Mic size={18} />
              </div>
              <div className="setting-card-info">
                <div className="setting-card-name">
                  {t('settings.accessibility.voice')}{' '}
                  <span className="beta-tag">{t('settings.accessibility.beta')}</span>
                </div>
                <div className="setting-card-desc">{t('settings.accessibility.voiceDesc')}</div>
              </div>
              <Toggle active={vozAtiva} onClick={handleVoiceToggle} />
            </SettingCard>
          </div>
        </SettingSection>

        {/* ── ACESSIBILIDADE ── */}

        {/* ── AÇÕES ── */}
        <SettingSection color="#ef4444" icon={Zap} title={t('settings.sections.actions')}>
          <div className="settings-actions-grid">
            <button className="settings-action-card primary" onClick={onOpenGuia}>
              <HelpCircle size={24} />
              <div className="settings-action-info">
                <div className="settings-action-name">{t('settings.actions.openGuide')}</div>
                <div className="settings-action-desc">{t('settings.actions.openGuideDesc')}</div>
              </div>
            </button>
            <button className="settings-action-card warning" onClick={onLimparConcluidas}>
              <CheckCircle2 size={24} />
              <div className="settings-action-info">
                <div className="settings-action-name">{t('settings.actions.clearDone')}</div>
                <div className="settings-action-desc">{t('settings.actions.clearDoneDesc')}</div>
              </div>
            </button>
            <button className="settings-action-card danger" onClick={onRemoverTudo}>
              <Trash2 size={24} />
              <div className="settings-action-info">
                <div className="settings-action-name">{t('settings.actions.removeAll')}</div>
                <div className="settings-action-desc">{t('settings.actions.removeAllDesc')}</div>
              </div>
            </button>
          </div>
        </SettingSection>

      </div>

      <div className="settings-footer">
        <p>{t('settings.footer')}</p>
      </div>
    </div>
  );

  if (pageMode) return inner;

  return (
    <div className={`settings-overlay${isClosing ? ' fechando' : ''}`} onClick={handleClose}>
      {inner}
    </div>
  );
}