import { useState, useMemo } from 'react'
import { Calendar, Clock, Target, CheckCircle2, Circle, Play, Pause } from 'lucide-react'
import MilestoneCard from '../cards/MilestoneCard'
import TimelineControls from './TimelineControls'
import '../../styles/Timeline.css'

interface TimelineViewProps {
  tarefas: any[]
  filtro: string
  onAlternarConclusao: (id: string) => void
  onEditar: (tarefa: any) => void
  onRemover: (id: string) => void
  onDetalhes: (tarefa: any) => void
  onAdicionarTarefa: () => void
}

export default function TimelineView({
  tarefas,
  filtro,
  onAlternarConclusao,
  onEditar,
  onRemover,
  onDetalhes,
  onAdicionarTarefa
}: TimelineViewProps) {
  const [periodoAtivo, setPeriodoAtivo] = useState('hoje')
  const [zoom, setZoom] = useState(1)

  const tarefasFiltradas = useMemo(() => {
    let filtered = tarefas

    // Aplicar filtro de status
    if (filtro === 'pendentes') {
      filtered = filtered.filter(t => !t.concluida)
    } else if (filtro === 'concluidas') {
      filtered = filtered.filter(t => t.concluida)
    }

    // Agrupar por período
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const grupos: Record<string, any[]> = {
      hoje: [],
      semana: [],
      mes: [],
      futuro: []
    }

    filtered.forEach(tarefa => {
      const dataPrazo = tarefa.prazo ? new Date(tarefa.prazo) : null
      const dataCriacao = new Date(tarefa.criadaEm)

      let periodo = 'futuro'

      if (dataPrazo) {
        const diffDias = Math.floor((dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDias === 0) periodo = 'hoje'
        else if (diffDias > 0 && diffDias <= 7) periodo = 'semana'
        else if (diffDias > 7 && diffDias <= 30) periodo = 'mes'
      } else {
        // Se não tem prazo, usar data de criação
        const diffDias = Math.floor((dataCriacao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDias >= -1) periodo = 'hoje' // tarefas de ontem e hoje
        else if (diffDias >= -7) periodo = 'semana'
        else if (diffDias >= -30) periodo = 'mes'
      }

      grupos[periodo].push(tarefa)
    })

    return grupos
  }, [tarefas, filtro])

  const periodos = [
    { id: 'hoje', label: 'Hoje', icon: Calendar, count: tarefasFiltradas.hoje.length },
    { id: 'semana', label: 'Esta Semana', icon: Clock, count: tarefasFiltradas.semana.length },
    { id: 'mes', label: 'Este Mês', icon: Target, count: tarefasFiltradas.mes.length },
    { id: 'futuro', label: 'Futuro', icon: Circle, count: tarefasFiltradas.futuro.length }
  ]

  const tarefasAtivas = tarefasFiltradas[periodoAtivo] || []

  // Organizar tarefas em jornadas (projetos) ou individuais
  const jornadas = useMemo(() => {
    const projetos = new Map()

    tarefasAtivas.forEach(tarefa => {
      const projeto = tarefa.categoria || 'geral'
      if (!projetos.has(projeto)) {
        projetos.set(projeto, [])
      }
      projetos.get(projeto).push(tarefa)
    })

    return Array.from(projetos.entries()).map(([nome, tarefas]) => ({
      nome,
      tarefas: tarefas.sort((a: any, b: any) => {
        // Ordenar por prioridade e depois por data
        const ordemPrioridade: Record<string, number> = { alta: 3, media: 2, baixa: 1, neutra: 0 }
        const prioA = ordemPrioridade[a.prioridade as string] || 0
        const prioB = ordemPrioridade[b.prioridade as string] || 0

        if (prioB !== prioA) return prioB - prioA

        const dataA = a.prazo ? new Date(a.prazo) : new Date(a.criadaEm)
        const dataB = b.prazo ? new Date(b.prazo) : new Date(b.criadaEm)
        return dataA.getTime() - dataB.getTime()
      })
    }))
  }, [tarefasAtivas])

  return (
    <div className="timeline-view">
      <TimelineControls
        periodos={periodos}
        periodoAtivo={periodoAtivo}
        onPeriodoChange={setPeriodoAtivo}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <div className="timeline-content">
        {jornadas.length === 0 ? (
          <div className="timeline-empty">
            <div className="empty-icon">
              <Calendar size={48} />
            </div>
            <h3>Nenhuma tarefa neste período</h3>
            <p>Que tal adicionar uma nova tarefa?</p>
            <button
              className="btn-adicionar-timeline"
              onClick={() => onAdicionarTarefa && onAdicionarTarefa()}
            >
              Adicionar Tarefa
            </button>
          </div>
        ) : (
          jornadas.map((jornada, jornadaIndex) => (
            <div key={jornada.nome} className="timeline-jornada">
              <div className="jornada-header">
                <h3 className="jornada-titulo">{jornada.nome}</h3>
                <span className="jornada-count">{jornada.tarefas.length} tarefa{jornada.tarefas.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="jornada-timeline">
                {jornada.tarefas.map((tarefa: any, index: number) => (
        <MilestoneCard
          key={tarefa.id}
          tarefa={tarefa}
          index={index}
          total={jornada.tarefas.length}
          onToggle={() => onAlternarConclusao(tarefa.id)}
          onEdit={() => onEditar(tarefa)}
          onDelete={() => onRemover(tarefa.id)}
          onDetails={() => onDetalhes(tarefa)}
          zoom={zoom}
        />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
