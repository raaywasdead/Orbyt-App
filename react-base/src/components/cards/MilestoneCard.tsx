import { useState } from 'react'
import { Calendar, Clock, Target, CheckCircle2, Circle, MoreVertical, Edit, Trash2, Info } from 'lucide-react'

interface Tarefa {
  id: string;
  texto: string;
  prioridade?: string;
  prazo?: string;
  notas?: string;
  categoria?: string;
  concluida?: boolean;
}

interface MilestoneCardProps {
  tarefa: Tarefa;
  index: number;
  total: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDetails: () => void;
  zoom?: number;
}

export default function MilestoneCard({
  tarefa,
  index,
  total,
  onToggle,
  onEdit,
  onDelete,
  onDetails,
  zoom
}: MilestoneCardProps) {
  const [menuAberto, setMenuAberto] = useState(false)

  const getStatusIcon = () => {
    if (tarefa.concluida) {
      return <CheckCircle2 size={20} className="status-icon concluida" />
    }
    return <Circle size={20} className="status-icon pendente" />
  }

  const getPriorityColor = (prioridade: string | undefined) => {
    switch (prioridade) {
      case 'alta': return 'alta'
      case 'media': return 'media'
      case 'baixa': return 'baixa'
      default: return 'neutra'
    }
  }

  const formatarPrazo = (iso: string | undefined) => {
    if (!iso) return null
    const data = new Date(iso)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const diffDias = Math.floor((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDias === 0) return 'Hoje'
    if (diffDias === 1) return 'Amanhã'
    if (diffDias === -1) return 'Ontem'
    if (diffDias > 0 && diffDias <= 7) return `Em ${diffDias} dias`
    if (diffDias < 0 && diffDias >= -7) return `${Math.abs(diffDias)} dias atrás`

    return data.toLocaleDateString('pt-BR')
  }

  const getConnectorColor = () => {
    if (tarefa.concluida) return '#10b981'
    return '#a855f7'
  }

  return (
    <div className={`milestone-card ${tarefa.concluida ? 'concluida' : ''}`}>
      <div
        className="milestone-connector"
        style={{ backgroundColor: getConnectorColor() }}
      />

      <div className="milestone-content">
        <div className="milestone-header">
          <div className="milestone-status">
            {getStatusIcon()}
          </div>

          <div className="milestone-priority">
            <span className={`priority-badge ${getPriorityColor(tarefa.prioridade)}`}>
              {tarefa.prioridade || 'neutra'}
            </span>
          </div>

          <div className="milestone-menu">
            <button
              className="menu-btn"
              onClick={() => setMenuAberto(!menuAberto)}
              aria-label="Menu da tarefa"
            >
              <MoreVertical size={16} />
            </button>

            {menuAberto && (
              <>
                <div className="menu-overlay" onClick={() => setMenuAberto(false)} />
                <div className="milestone-dropdown">
                  <button onClick={() => { onDetails(); setMenuAberto(false) }}>
                    <Info size={16} />
                    <span>Detalhes</span>
                  </button>
                  <button onClick={() => { onEdit(); setMenuAberto(false) }}>
                    <Edit size={16} />
                    <span>Editar</span>
                  </button>
                  <button onClick={() => { onDelete(); setMenuAberto(false) }}>
                    <Trash2 size={16} />
                    <span>Excluir</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="milestone-body">
          <h4 className="milestone-title">{tarefa.texto}</h4>

          <div className="milestone-meta">
            {tarefa.prazo && (
              <div className="meta-item">
                <Calendar size={14} />
                <span>{formatarPrazo(tarefa.prazo)}</span>
              </div>
            )}

            {tarefa.notas && (
              <div className="meta-item">
                <Info size={14} />
                <span>Com notas</span>
              </div>
            )}

            <div className="meta-item">
              <Target size={14} />
              <span>{tarefa.categoria || 'Geral'}</span>
            </div>
          </div>
        </div>

        <button
          className="milestone-toggle"
          onClick={onToggle}
        >
          {tarefa.concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
        </button>
      </div>
    </div>
  )
}
