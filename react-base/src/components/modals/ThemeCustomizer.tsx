import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, Check } from 'lucide-react';
import '../../styles/ThemeCustomizer.css';

export interface CustomThemeColors {
  accentPrimary: string;
  accentHover: string;
  accentLight: string;
  accentGlow: string;
  bgStart: string;
  bgEnd: string;
  particleColor: string;
  particleLinkColor: string;
}

const DEFAULTS: CustomThemeColors = {
  accentPrimary:    '#a855f7',
  accentHover:      '#9333ea',
  accentLight:      '#e9d5ff',
  accentGlow:       '#a855f7',
  bgStart:          '#1a1625',
  bgEnd:            '#2d1b4e',
  particleColor:    '#ffffff',
  particleLinkColor:'#a855f7',
};

const LS_KEYS: Record<keyof CustomThemeColors, string> = {
  accentPrimary:    'customAccentPrimary',
  accentHover:      'customAccentHover',
  accentLight:      'customAccentLight',
  accentGlow:       'customAccentGlow',
  bgStart:          'customBgStart',
  bgEnd:            'customBgEnd',
  particleColor:    'customParticleColor',
  particleLinkColor:'customParticleLinkColor',
};

function loadColors(): CustomThemeColors {
  const c = { ...DEFAULTS };
  (Object.keys(LS_KEYS) as (keyof CustomThemeColors)[]).forEach((k) => {
    const stored = localStorage.getItem(LS_KEYS[k]);
    if (stored) c[k] = stored;
  });
  return c;
}

function saveColors(colors: CustomThemeColors) {
  (Object.keys(LS_KEYS) as (keyof CustomThemeColors)[]).forEach((k) => {
    localStorage.setItem(LS_KEYS[k], colors[k]);
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

interface ColorPickerRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function ColorPickerRow({ label, value, onChange }: ColorPickerRowProps) {
  return (
    <div className="tc-row">
      <label className="tc-label">{label}</label>
      <div className="tc-picker-wrap">
        <input
          type="color"
          className="tc-color-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="tc-hex-value">{value.toUpperCase()}</span>
      </div>
    </div>
  );
}

// ─── Realistic App Preview ────────────────────────────────────
interface AppPreviewProps {
  colors: CustomThemeColors;
}

function AppPreview({ colors }: AppPreviewProps) {
  const accent = colors.accentPrimary;
  const accentRgb = hexToRgb(accent);
  const accentGlow = hexToRgba(colors.accentGlow, 0.18);
  const accentBorder = hexToRgba(accent, 0.3);
  const accentBg = hexToRgba(accent, 0.12);
  const accentBgStrong = hexToRgba(accent, 0.22);

  const bg = `linear-gradient(135deg, ${colors.bgStart} 0%, ${colors.bgEnd} 100%)`;

  // glow blobs behind content
  const blob1 = hexToRgba(colors.accentPrimary, 0.15);
  const blob2 = hexToRgba(colors.accentHover, 0.10);

  const tasks = [
    { text: 'Finalizar relatório mensal', prio: 'alta',  pColor: '#ef4444', done: false },
    { text: 'Reunião com equipe às 15h',  prio: 'media', pColor: '#f59e0b', done: true  },
    { text: 'Revisar pull request',        prio: 'baixa', pColor: '#22c55e', done: false },
  ];

  return (
    <div className="tc-app-preview" style={{ background: bg }}>
      {/* Aurora blobs */}
      <div className="tc-blob tc-blob-1" style={{ background: `radial-gradient(circle, ${blob1} 0%, transparent 70%)` }} />
      <div className="tc-blob tc-blob-2" style={{ background: `radial-gradient(circle, ${blob2} 0%, transparent 70%)` }} />

      {/* Particles */}
      <svg className="tc-particles-svg" viewBox="0 0 400 260" preserveAspectRatio="none">
        {[
          [40,30],[120,55],[200,20],[300,45],[350,80],
          [80,120],[180,100],[260,130],[330,110],[60,200],
          [160,180],[240,210],[320,185],[380,220],
        ].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="1.2" fill={colors.particleColor} opacity="0.25" />
        ))}
        {[[40,30,120,55],[120,55,200,20],[200,20,300,45],[300,45,350,80],
          [80,120,180,100],[180,100,260,130],[260,130,330,110],
          [60,200,160,180],[160,180,240,210]
        ].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={colors.particleLinkColor} strokeOpacity="0.18" strokeWidth="0.6" />
        ))}
      </svg>

      {/* Sidebar */}
      <div className="tc-sidebar" style={{ borderColor: hexToRgba(accent, 0.12) }}>
        {/* Logo area */}
        <div className="tc-sidebar-logo">
          <img
            src="/Logo-Orbyt.svg"
            alt="Orbyt"
            className="tc-logo-img"
            style={{ filter: `drop-shadow(0 0 6px ${hexToRgba(colors.accentGlow, 0.5)})` }}
          />
          <span className="tc-sidebar-appname" style={{ color: accent }}>orbyt</span>
        </div>

        {/* Nav items */}
        {[
          { label: 'Tarefas', active: true },
          { label: 'Badges',  active: false },
          { label: 'Stats',   active: false },
          { label: 'Temas',   active: false },
        ].map(({ label, active }) => (
          <div key={label} className={`tc-nav-item ${active ? 'tc-nav-item--active' : ''}`} style={active ? {
            background: accentBg,
            borderColor: accentBorder,
            color: accent,
          } : {}}>
            <div className="tc-nav-dot" style={active ? { background: accent } : {}} />
            {label}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="tc-main">
        {/* Workspace title */}
        <div className="tc-workspace-title">
          <div className="tc-title-bar" style={{ background: accent }} />
          <div>
            <div className="tc-title-text">Lista de Tarefas</div>
            <div className="tc-title-date">hoje, segunda-feira</div>
          </div>
        </div>

        {/* Input mock */}
        <div className="tc-input-container" style={{
          borderTopColor: accentBorder,
          boxShadow: `0 0 0 1px ${hexToRgba(accent, 0.04)}, 0 8px 24px rgba(0,0,0,0.25)`,
        }}>
          <div className="tc-input-field">
            <span className="tc-input-placeholder">Nova tarefa...</span>
          </div>
          <div className="tc-input-add-btn" style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${colors.accentHover} 100%)`,
            boxShadow: `0 4px 14px ${hexToRgba(colors.accentGlow, 0.4)}`,
          }}>
            + Add
          </div>
        </div>

        {/* Progress bar */}
        <div className="tc-progress-wrap">
          <div className="tc-progress-bar" style={{ borderColor: accentBorder }}>
            <div className="tc-progress-fill" style={{
              background: `linear-gradient(90deg, ${accent} 0%, ${colors.accentHover} 100%)`,
              width: '33%',
            }} />
            <span className="tc-progress-text">1/3</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="tc-filters">
          {['Todas', 'Pendentes', 'Concluídas'].map((f, i) => (
            <div key={f} className="tc-filter-btn" style={i === 0 ? {
              background: `linear-gradient(135deg, ${accent} 0%, ${colors.accentHover} 100%)`,
              color: '#fff',
            } : {}}>
              {f}
            </div>
          ))}
        </div>

        {/* Task list */}
        <div className="tc-task-list">
          {tasks.map((t, i) => (
            <div key={i} className={`tc-task-item ${t.done ? 'tc-task-done' : ''}`}
              style={{ borderColor: hexToRgba(t.pColor, 0.22) }}>
              {/* Priority bar */}
              <div className="tc-task-prio-bar" style={{ background: t.pColor }} />
              {/* Checkbox */}
              <div className="tc-task-checkbox" style={t.done ? {
                background: `linear-gradient(135deg, ${accent} 0%, ${colors.accentHover} 100%)`,
                borderColor: accent,
              } : { borderColor: hexToRgba(accent, 0.5) }}>
                {t.done && <span style={{ color: '#fff', fontSize: '6px', fontWeight: 900 }}>✓</span>}
              </div>
              {/* Text */}
              <span className="tc-task-text" style={t.done ? { opacity: 0.45, textDecoration: 'line-through' } : {}}>
                {t.text}
              </span>
              {/* Priority tag */}
              <span className="tc-task-tag" style={{
                color: t.pColor,
                background: hexToRgba(t.pColor, 0.12),
              }}>
                {t.prio}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating buttons */}
      <div className="tc-float-btn tc-float-menu" style={{
        borderColor: hexToRgba(accent, 0.3),
        boxShadow: `0 4px 14px ${hexToRgba(colors.accentGlow, 0.25)}`,
      }}>☰</div>
      <div className="tc-float-btn tc-float-stats" style={{
        borderColor: hexToRgba(accent, 0.3),
        boxShadow: `0 4px 14px ${hexToRgba(colors.accentGlow, 0.25)}`,
      }}>◈</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
interface ThemeCustomizerProps {
  onApply: (colors: CustomThemeColors) => void;
  onClose: () => void;
}

export default function ThemeCustomizer({ onApply, onClose }: ThemeCustomizerProps) {
  const [colors, setColors] = useState<CustomThemeColors>(loadColors);
  const [snapshot] = useState<CustomThemeColors>(loadColors);

  const update = useCallback((key: keyof CustomThemeColors, value: string) => {
    setColors((prev) => {
      const next = { ...prev, [key]: value };
      applyPreviewVars(next);
      return next;
    });
  }, []);

  function applyPreviewVars(c: CustomThemeColors) {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', c.accentPrimary);
    root.style.setProperty('--accent-hover', c.accentHover);
    root.style.setProperty('--accent-light', c.accentLight);
    root.style.setProperty('--accent-glow', hexToRgba(c.accentGlow, 0.4));
    root.style.setProperty('--bg-gradient', `linear-gradient(135deg, ${c.bgStart} 0%, ${c.bgEnd} 100%)`);
  }

  function handleReset() {
    setColors(DEFAULTS);
    applyPreviewVars(DEFAULTS);
  }

  function handleCancel() {
    applyPreviewVars(snapshot);
    onClose();
  }

  function handleApply() {
    saveColors(colors);
    applyPreviewVars(colors);
    onApply(colors);
    onClose();
  }

  return createPortal(
    <div className="tc-overlay" onClick={handleCancel}>
      <div className="tc-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="tc-header">
          <div className="tc-header-title">
            <span className="tc-header-emoji">🎨</span>
            <div>
              <h2>Personalizar Tema</h2>
              <p>Escolha as cores do seu app livremente</p>
            </div>
          </div>
          <button className="tc-close-btn" onClick={handleCancel} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Body: 2 colunas */}
        <div className="tc-body">

          {/* Coluna esquerda: pickers */}
          <div className="tc-pickers">
            <div className="tc-section-label">Cores de Destaque</div>
            <ColorPickerRow label="Cor Principal (Accent)"    value={colors.accentPrimary}     onChange={(v) => update('accentPrimary', v)} />
            <ColorPickerRow label="Cor Hover"                 value={colors.accentHover}       onChange={(v) => update('accentHover', v)} />
            <ColorPickerRow label="Variante Clara"            value={colors.accentLight}       onChange={(v) => update('accentLight', v)} />
            <ColorPickerRow label="Brilho / Glow"             value={colors.accentGlow}        onChange={(v) => update('accentGlow', v)} />

            <div className="tc-section-label tc-section-label--mt">Fundo do App</div>
            <ColorPickerRow label="Fundo — Cor 1 (Início)"   value={colors.bgStart}           onChange={(v) => update('bgStart', v)} />
            <ColorPickerRow label="Fundo — Cor 2 (Fim)"      value={colors.bgEnd}             onChange={(v) => update('bgEnd', v)} />

            <div className="tc-section-label tc-section-label--mt">Partículas</div>
            <ColorPickerRow label="Cor dos Pontos"            value={colors.particleColor}     onChange={(v) => update('particleColor', v)} />
            <ColorPickerRow label="Cor dos Links (linhas)"    value={colors.particleLinkColor} onChange={(v) => update('particleLinkColor', v)} />
          </div>

          {/* Coluna direita: preview realista */}
          <div className="tc-preview-col">
            <div className="tc-section-label">Prévia — como ficará seu app</div>
            <AppPreview colors={colors} />

            {/* Swatches */}
            <div className="tc-color-swatches">
              {Object.values(colors).map((c, i) => (
                <span key={i} className="tc-swatch" style={{ background: c }} title={c} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="tc-footer">
          <button className="tc-btn tc-btn--reset" onClick={handleReset}>
            <RotateCcw size={14} />
            Resetar Padrão
          </button>
          <div className="tc-footer-right">
            <button className="tc-btn tc-btn--cancel" onClick={handleCancel}>Cancelar</button>
            <button className="tc-btn tc-btn--apply" onClick={handleApply}>
              <Check size={14} />
              Aplicar
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}