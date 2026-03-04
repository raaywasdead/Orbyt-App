import { useMemo } from 'react'
import { TrendingUp, Award, CalendarDays, Flame, Clock, CheckCircle2, Zap } from 'lucide-react'
import '../../styles/Stats.css'

interface Tarefa {
  criadaEm: number;
  concluida: boolean;
  prioridade?: string;
}

interface StatsProps {
  tarefas: Tarefa[];
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const DIAS_SEMANA_COMPLETO = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function Stats({ tarefas }: StatsProps) {
  const stats = useMemo(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
      const data = new Date(hoje)
      data.setDate(data.getDate() - (6 - i))
      return data.getTime()
    })

    const tarefasPorDia = ultimos7Dias.map(dia =>
      tarefas.filter(t => {
        const d = new Date(t.criadaEm)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === dia && t.concluida
      }).length
    )

    const totalConcluidas = tarefas.filter(t => t.concluida).length
    const totalPendentes = tarefas.filter(t => !t.concluida).length
    const totalTarefas = tarefas.length
    const taxaConclusao = totalTarefas > 0
      ? Math.round((totalConcluidas / totalTarefas) * 100)
      : 0

    // Streak atual (dias consecutivos)
    let streak = 0
    for (let i = tarefasPorDia.length - 1; i >= 0; i--) {
      if (tarefasPorDia[i] > 0) streak++
      else break
    }

    // Melhor sequência histórica (últimos 7 dias)
    let melhorStreak = 0
    let streakTemp = 0
    for (const v of tarefasPorDia) {
      if (v > 0) { streakTemp++; melhorStreak = Math.max(melhorStreak, streakTemp) }
      else streakTemp = 0
    }

    // Esta semana (últimos 7 dias)
    const concluidasSemana = tarefasPorDia.reduce((a, b) => a + b, 0)

    // Melhor dia da semana (mais conclusões)
    const maxIdx = tarefasPorDia.indexOf(Math.max(...tarefasPorDia))
    const melhorDia = tarefasPorDia[maxIdx] > 0
      ? DIAS_SEMANA_COMPLETO[new Date(ultimos7Dias[maxIdx]).getDay()]
      : '—'

    // Média diária (últimos 7 dias com tarefas)
    const diasAtivos = tarefasPorDia.filter(v => v > 0).length
    const mediaDiaria = diasAtivos > 0
      ? (concluidasSemana / diasAtivos).toFixed(1)
      : '0'

    // Distribuição por prioridade
    const prioridades = { alta: 0, media: 0, baixa: 0, neutra: 0 }
    tarefas.forEach(t => {
      const p = t.prioridade as keyof typeof prioridades
      if (p && prioridades[p] !== undefined) prioridades[p]++
    })

    const maxDia = Math.max(...tarefasPorDia, 1)

    // Insight da semana
    let insight = 'Continue assim!'
    if (streak >= 3) insight = `🔥 ${streak} dias seguidos! Incrível!`
    else if (concluidasSemana === 0) insight = 'Nenhuma tarefa esta semana. Vamos começar?'
    else if (taxaConclusao >= 75) insight = 'Ótima taxa de conclusão! Você está arrasando.'
    else if (totalPendentes > totalConcluidas) insight = `${totalPendentes} tarefas esperando por você.`

    return {
      tarefasPorDia, maxDia, totalConcluidas, totalPendentes,
      taxaConclusao, streak, melhorStreak, concluidasSemana,
      melhorDia, mediaDiaria, prioridades, totalTarefas, insight,
    }
  }, [tarefas])

  const totalPrioridades = Object.values(stats.prioridades).reduce((a, b) => a + b, 0)
  const circumference = 2 * Math.PI * 40 // r=40

  return (
    <div className="stats-panel">

      {/* ── Hero: ring gauge + KPI chips ── */}
      <div className="stats-hero">
        <div className="stats-hero-ring">
          <svg viewBox="0 0 100 100" width="110" height="110">
            <defs>
              <linearGradient id="statsRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6d28d9" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx="50" cy="50" r="40" fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            {/* Progress */}
            <circle cx="50" cy="50" r="40" fill="none"
              stroke="url(#statsRingGrad)" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - stats.taxaConclusao / 100)}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x="50" y="44" textAnchor="middle" fill="#fff"
              fontSize="20" fontWeight="800" fontFamily="Poppins,sans-serif">
              {stats.taxaConclusao}%
            </text>
            <text x="50" y="59" textAnchor="middle" fill="rgba(255,255,255,0.35)"
              fontSize="8" fontFamily="Poppins,sans-serif" letterSpacing="0.5">
              CONCLUSÃO
            </text>
          </svg>
        </div>

        <div className="stats-hero-kpis">
          {/* KPI chips principais */}
          <div className="stats-kpi-row">
            <div className="stats-kpi-chip stats-kpi--streak">
              <Zap size={13} />
              <span className="stats-kpi-val">{stats.streak}</span>
              <span className="stats-kpi-lbl">Sequência</span>
            </div>
            <div className="stats-kpi-chip stats-kpi--done">
              <Award size={13} />
              <span className="stats-kpi-val">{stats.totalConcluidas}</span>
              <span className="stats-kpi-lbl">Concluídas</span>
            </div>
            <div className="stats-kpi-chip stats-kpi--pending">
              <TrendingUp size={13} />
              <span className="stats-kpi-val">{stats.totalPendentes}</span>
              <span className="stats-kpi-lbl">Pendentes</span>
            </div>
          </div>

          {/* Mini stats secundários */}
          <div className="stats-kpi-row stats-kpi-row--secondary">
            <div className="stats-kpi-mini">
              <CheckCircle2 size={11} />
              <span>{stats.concluidasSemana}</span> esta semana
            </div>
            <div className="stats-kpi-mini">
              <Flame size={11} />
              <span>{stats.melhorStreak}</span> melhor seq.
            </div>
            <div className="stats-kpi-mini">
              <Clock size={11} />
              <span>{stats.mediaDiaria}</span> média/dia
            </div>
          </div>
        </div>
      </div>

      {/* ── Gráfico ── */}
      <div className="stats-chart">
        <div className="chart-title">Últimos 7 dias</div>
        <div className="chart-bars">
          {stats.tarefasPorDia.map((count, index) => {
            const height = (count / stats.maxDia) * 100
            const dia = new Date()
            dia.setDate(dia.getDate() - (6 - index))
            const diaSemana = DIAS_SEMANA[dia.getDay()]
            const isToday = index === 6
            const isEmpty = count === 0
            return (
              <div key={index} className={`chart-bar-container${isToday ? ' today' : ''}`}>
                <div className="chart-bar-wrapper">
                  <div
                    className={`chart-bar${isEmpty ? ' empty' : ''}`}
                    style={{ height: `${height || 6}%` }}
                    data-count={count}
                  >
                    {count > 0 && <span className="bar-count">{count}</span>}
                  </div>
                </div>
                <div className="chart-label">{diaSemana}</div>
              </div>
            )
          })}
        </div>
        {/* Insight */}
        <div className="stats-insight">
          <span>{stats.insight}</span>
          {stats.melhorDia !== '—' && (
            <span className="stats-melhor-dia">
              <CalendarDays size={13} />
              Melhor dia: <strong>{stats.melhorDia}</strong>
            </span>
          )}
        </div>
      </div>

      {/* ── Bottom 2-col: prioridades + total ── */}
      <div className="stats-bottom">
        {totalPrioridades > 0 && (
          <div className="stats-prioridades">
            <div className="stats-section-title">Por Prioridade</div>
            <div className="prioridade-bars">
              {(['alta', 'media', 'baixa', 'neutra'] as const).map(p => {
                const count = stats.prioridades[p]
                const pct = totalPrioridades > 0 ? Math.round((count / totalPrioridades) * 100) : 0
                const labels = { alta: 'Alta', media: 'Média', baixa: 'Baixa', neutra: 'Neutra' }
                return (
                  <div key={p} className={`prio-row prio-${p}`}>
                    <span className="prio-label">{labels[p]}</span>
                    <div className="prio-bar-track">
                      <div className="prio-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="prio-count">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="stats-total-card">
          <div className="stats-total-info">
            <span className="stats-total-num">{stats.totalTarefas}</span>
            <span className="stats-total-label">tarefas no total</span>
          </div>
          <div className="stats-total-bar">
            <div
              className="stats-total-fill"
              style={{ width: `${stats.taxaConclusao}%` }}
            />
          </div>
          <span className="stats-total-pct">{stats.taxaConclusao}% concluído</span>
        </div>
      </div>

    </div>
  )
}
