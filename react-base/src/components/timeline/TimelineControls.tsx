import { ZoomIn, ZoomOut, List, Calendar } from 'lucide-react'

interface Periodo {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number }>;
  count: number;
}

interface TimelineControlsProps {
  periodos: Periodo[];
  periodoAtivo: string;
  onPeriodoChange: (id: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export default function TimelineControls({
  periodos,
  periodoAtivo,
  onPeriodoChange,
  zoom,
  onZoomChange
}: TimelineControlsProps) {
  return (
    <div className="timeline-controls">
      <div className="periodo-selector">
        {periodos.map(periodo => {
          const Icon = periodo.icon
          return (
            <button
              key={periodo.id}
              className={`periodo-btn ${periodoAtivo === periodo.id ? 'ativo' : ''}`}
              onClick={() => onPeriodoChange(periodo.id)}
            >
              <Icon size={16} />
              <span className="periodo-label">{periodo.label}</span>
              <span className="periodo-count">{periodo.count}</span>
            </button>
          )
        })}
      </div>

      <div className="timeline-actions">
        <div className="zoom-controls">
          <button
            className="zoom-btn"
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
            disabled={zoom <= 0.5}
            aria-label="Diminuir zoom"
          >
            <ZoomOut size={16} />
          </button>

          <span className="zoom-level">{Math.round(zoom * 100)}%</span>

          <button
            className="zoom-btn"
            onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
            disabled={zoom >= 2}
            aria-label="Aumentar zoom"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
