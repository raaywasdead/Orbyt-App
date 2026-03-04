import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Camera, Check, Edit2, LogOut, Trash2, X,
  CheckCircle2, Flame, Medal, User, ChevronRight,
  Zap, Target, Leaf, Star, TrendingUp, Trophy,
  Lock, ShieldCheck,
} from 'lucide-react'
import { BADGES } from '../data/BadgesData'
import '../styles/ProfilePage.css'

// ── Types ────────────────────────────────────────────────────────
interface ProfileData {
  nome: string
  email: string
  bio: string
  avatar: string | null
  membro_desde: string
}

const PROFILE_KEY = 'orbyt_profile'

const RANK_LEVELS = [
  { min: 0,   label: 'Iniciante',   color: '#6b7280', Icon: Leaf      },
  { min: 10,  label: 'Produtivo',   color: '#8b5cf6', Icon: Zap       },
  { min: 30,  label: 'Focado',      color: '#3b82f6', Icon: Target    },
  { min: 75,  label: 'Consistente', color: '#10b981', Icon: Flame     },
  { min: 150, label: 'Expert',      color: '#f59e0b', Icon: Trophy    },
  { min: 300, label: 'Lendário',    color: '#ec4899', Icon: Star      },
]

function getRank(n: number) {
  return [...RANK_LEVELS].reverse().find(r => n >= r.min) || RANK_LEVELS[0]
}
function getRankProgress(n: number) {
  const idx = RANK_LEVELS.findIndex(r => n < r.min)
  if (idx === -1) return { pct: 100, next: null }
  if (idx === 0)  return { pct: 0, next: RANK_LEVELS[0] }
  const cur = RANK_LEVELS[idx - 1]
  const nxt = RANK_LEVELS[idx]
  return { pct: ((n - cur.min) / (nxt.min - cur.min)) * 100, next: nxt }
}

// ── Load helpers ─────────────────────────────────────────────────
function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    nome: 'Usuário',
    email: '—',
    bio: '',
    avatar: null,
    membro_desde: new Date().toISOString(),
  }
}
function saveProfile(d: ProfileData) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(d)) } catch {}
}

function loadTarefasConcluidas(): number {
  return parseInt(localStorage.getItem('totalConcluidasHistorico') || '0', 10)
}
function loadStreak(): number {
  try {
    const raw = localStorage.getItem('streakData')
    if (!raw) return 0
    return JSON.parse(raw)?.dias ?? 0
  } catch { return 0 }
}
function loadUserBadges() {
  try {
    const raw = localStorage.getItem('userBadges')
    if (!raw) return BADGES.map((b, i) => ({ ...b, desbloqueado: i === 0 }))
    const parsed = JSON.parse(raw)
    return BADGES.map((b, i) => {
      const saved = parsed.find((s: any) => s.id === b.id)
      return saved ? { ...b, ...saved, niveis: b.niveis, icone: b.icone } : { ...b, desbloqueado: i === 0 }
    })
  } catch { return BADGES.map((b, i) => ({ ...b, desbloqueado: i === 0 })) }
}
function loadTema(): string {
  const map: Record<string, string> = {
    padrao: 'Padrão', aurora: 'Aurora', galaxy: 'Galaxy',
    midnight: 'Midnight', sunset: 'Sunset', forest: 'Forest', claro: 'Claro',
  }
  try {
    const id = localStorage.getItem('temaVisual') || 'padrao'
    return map[id] || 'Padrão'
  } catch { return 'Padrão' }
}

// ── Component ────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate    = useNavigate()
  const fileRef     = useRef<HTMLInputElement>(null)

  const [profile, setProfile]         = useState<ProfileData>(loadProfile)
  const [isAdmin, setIsAdmin]         = useState(false)
  const [editingNome, setEditingNome] = useState(false)
  const [editingBio,  setEditingBio]  = useState(false)
  const [tempNome,    setTempNome]    = useState('')
  const [tempBio,     setTempBio]     = useState('')
  const [toast,       setToast]       = useState(false)
  const [confirmDel,  setConfirmDel]  = useState(false)

  // Live stats from App's localStorage
  const tarefasConcluidas = useMemo(() => loadTarefasConcluidas(), [])
  const streak            = useMemo(() => loadStreak(), [])
  const userBadges        = useMemo(() => loadUserBadges(), [])
  const tema              = useMemo(() => loadTema(), [])
  const conquistas        = useMemo(() => userBadges.filter(b => b.desbloqueado).length, [userBadges])

  // Try to enrich nome/email from backend — never overwrites user edits
  useEffect(() => {
    fetch('http://localhost:3001/api/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.usuario) return
        if (d.usuario.role === 'admin') setIsAdmin(true)
        setProfile(prev => {
          const isDefaultNome = prev.nome === 'Usuário'
          const merged: ProfileData = {
            ...prev,
            email: d.usuario.email ?? prev.email,
            nome: isDefaultNome ? (d.usuario.nome ?? prev.nome) : prev.nome,
          }
          saveProfile(merged)
          return merged
        })
      })
      .catch(() => {})
  }, [])

  function updateProfile(patch: Partial<ProfileData>) {
    setProfile(prev => {
      const next = { ...prev, ...patch }
      saveProfile(next)
      return next
    })
    setToast(true)
    setTimeout(() => setToast(false), 2200)
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateProfile({ avatar: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  function saveNome() {
    if (tempNome.trim()) updateProfile({ nome: tempNome.trim() })
    setEditingNome(false)
  }
  function saveBio() {
    updateProfile({ bio: tempBio })
    setEditingBio(false)
  }

  function handleLogout() {
    localStorage.removeItem('orbyt_onboarded')
    fetch('http://localhost:3001/api/logout', { method: 'POST', credentials: 'include' })
      .catch(() => {})
      .finally(() => { window.location.href = '/' })
  }

  const rank = getRank(tarefasConcluidas)
  const { pct, next } = getRankProgress(tarefasConcluidas)
  const RankIcon = rank.Icon

  const membroDesde = new Date(profile.membro_desde).toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric',
  })

  // ── Badge categories for the compact grid ──
  const badgesDesbloqueados = userBadges.filter(b => b.desbloqueado)
  const badgesBloqueados    = userBadges.filter(b => !b.desbloqueado)

  return (
    <div className="pp-root">


      {/* Toast */}
      <div className={`pp-toast ${toast ? 'show' : ''}`}>
        <Check size={13} strokeWidth={2.5} /> Salvo
      </div>

      {/* Header */}
      <header className="pp-header">
        <button className="pp-back" onClick={() => navigate('/app')}>
          <ArrowLeft size={15} /> Voltar
        </button>
        <div className="pp-logo">
          <img src="/Logo-Orbyt.svg" alt="" />
          <span>Orbyt</span>
        </div>
        <div style={{ width: 80 }} />
      </header>

      <main className="pp-main">

        {/* ── SIDEBAR ── */}
        <aside className="pp-sidebar">

          {/* Avatar */}
          <div className="pp-avatar-area" onClick={() => fileRef.current?.click()}>
            <div className="pp-avatar-ring" style={{ '--ring-color': rank.color } as React.CSSProperties}>
              {profile.avatar
                ? <img src={profile.avatar} alt="avatar" className="pp-avatar-img" />
                : <div className="pp-avatar-initial">{profile.nome.charAt(0).toUpperCase()}</div>
              }
              <div className="pp-avatar-hover"><Camera size={18} /></div>
            </div>
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handleAvatar} />
          </div>

          {/* Nome */}
          <div className="pp-identity">
            {editingNome ? (
              <div className="pp-inline-edit">
                <input
                  className="pp-inline-input"
                  value={tempNome}
                  onChange={e => setTempNome(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter')  saveNome()
                    if (e.key === 'Escape') setEditingNome(false)
                  }}
                  autoFocus
                />
                <button className="pp-iBtn ok" onClick={saveNome}><Check size={13} /></button>
                <button className="pp-iBtn no" onClick={() => setEditingNome(false)}><X size={13} /></button>
              </div>
            ) : (
              <div className="pp-name-row">
                <h1 className="pp-name">{profile.nome}</h1>
                <button className="pp-iBtn muted"
                  onClick={() => { setTempNome(profile.nome); setEditingNome(true) }}>
                  <Edit2 size={12} />
                </button>
              </div>
            )}
            <p className="pp-email">{profile.email}</p>
          </div>

          {/* Bio */}
          <div className="pp-bio-area">
            {editingBio ? (
              <>
                <textarea
                  className="pp-bio-input"
                  value={tempBio}
                  onChange={e => setTempBio(e.target.value)}
                  placeholder="Escreva algo sobre você..."
                  maxLength={100}
                  autoFocus
                />
                <div className="pp-bio-foot">
                  <span className="pp-bio-count">{tempBio.length}/100</span>
                  <button className="pp-iBtn ok" onClick={saveBio}><Check size={13} /></button>
                  <button className="pp-iBtn no" onClick={() => setEditingBio(false)}><X size={13} /></button>
                </div>
              </>
            ) : (
              <button className="pp-bio-trigger"
                onClick={() => { setTempBio(profile.bio); setEditingBio(true) }}>
                <span className={profile.bio ? 'pp-bio-text' : 'pp-bio-placeholder'}>
                  {profile.bio || 'Adicionar bio...'}
                </span>
                <Edit2 size={12} className="pp-bio-edit-ico" />
              </button>
            )}
          </div>

          {/* Meta */}
          <div className="pp-meta">
            <div className="pp-meta-row">
              <User size={12} />
              <span>Membro desde {membroDesde}</span>
            </div>
          </div>

          {/* Rank */}
          <div className="pp-rank">
            <div className="pp-rank-head">
              <div className="pp-rank-icon-wrap"
                style={{ background: `${rank.color}18`, color: rank.color }}>
                <RankIcon size={16} strokeWidth={2} />
              </div>
              <div>
                <p className="pp-rank-sup">Nível atual</p>
                <p className="pp-rank-name" style={{ color: rank.color }}>{rank.label}</p>
              </div>
            </div>
            <div className="pp-rank-track">
              <div className="pp-rank-fill" style={{ width: `${pct}%`, background: rank.color }} />
            </div>
            <p className="pp-rank-hint">
              {next
                ? <><strong style={{ color: next.color }}>{next.min - tarefasConcluidas}</strong> tarefas para {next.label}</>
                : <span style={{ color: rank.color }}>Nível máximo!</span>
              }
            </p>
          </div>

          {/* Account */}
          <div className="pp-account">
            {isAdmin && (
              <button className="pp-account-btn pp-admin-btn" onClick={() => navigate('/admin')}>
                <ShieldCheck size={14} /> Painel Admin
              </button>
            )}
            <button className="pp-account-btn" onClick={handleLogout}>
              <LogOut size={14} /> Sair da conta
            </button>
            {!confirmDel ? (
              <button className="pp-account-btn danger" onClick={() => setConfirmDel(true)}>
                <Trash2 size={14} /> Deletar conta
              </button>
            ) : (
              <div className="pp-del-confirm">
                <p>Isso é irreversível.</p>
                <div className="pp-del-btns">
                  <button className="pp-account-btn danger solid"
                    onClick={() => alert('Disponível em breve.')}>
                    Confirmar
                  </button>
                  <button className="pp-account-btn" onClick={() => setConfirmDel(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <div className="pp-content">

          {/* Stats */}
          <section className="pp-card">
            <h2 className="pp-card-title">Estatísticas</h2>
            <div className="pp-stats">
              <div className="pp-stat">
                <div className="pp-stat-icon-wrap" style={{ color: '#10b981', background: '#10b98115' }}>
                  <CheckCircle2 size={18} strokeWidth={1.8} />
                </div>
                <div className="pp-stat-num">{tarefasConcluidas}</div>
                <div className="pp-stat-lbl">Concluídas</div>
              </div>
              <div className="pp-stat">
                <div className="pp-stat-icon-wrap" style={{ color: '#f59e0b', background: '#f59e0b15' }}>
                  <Flame size={18} strokeWidth={1.8} />
                </div>
                <div className="pp-stat-num">{streak}</div>
                <div className="pp-stat-lbl">Dias seguidos</div>
              </div>
              <div className="pp-stat">
                <div className="pp-stat-icon-wrap" style={{ color: '#a855f7', background: '#a855f715' }}>
                  <Medal size={18} strokeWidth={1.8} />
                </div>
                <div className="pp-stat-num">{conquistas}</div>
                <div className="pp-stat-lbl">Conquistas</div>
              </div>
            </div>
          </section>

          {/* Badges */}
          <section className="pp-card">
            <div className="pp-badges-header">
              <h2 className="pp-card-title" style={{ margin: 0 }}>Conquistas</h2>
              <div className="pp-badges-counter">
                <div className="pp-badges-counter-bar">
                  <div
                    className="pp-badges-counter-fill"
                    style={{ width: `${(conquistas / userBadges.length) * 100}%` }}
                  />
                </div>
                <span>{conquistas} / {userBadges.length}</span>
              </div>
            </div>

            {/* Desbloqueados */}
            {badgesDesbloqueados.length > 0 && (
              <div className="pp-badges-section">
                <p className="pp-badges-section-label unlocked-label">Desbloqueados</p>
                <div className="pp-badges-grid">
                  {badgesDesbloqueados.map(badge => {
                    const Icon = badge.icone
                    return (
                      <div key={badge.id} className="pp-badge-chip unlocked" title={badge.nome}
                        style={{ '--chip-color': badge.cor } as React.CSSProperties}>
                        <div className="pp-badge-chip-icon">
                          <Icon size={18} />
                        </div>
                        <span className="pp-badge-chip-name">{badge.nome}</span>
                        <div className="pp-badge-chip-check">
                          <Check size={9} strokeWidth={3} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Bloqueados */}
            {badgesBloqueados.length > 0 && (
              <div className="pp-badges-section">
                <p className="pp-badges-section-label locked-label">Bloqueados</p>
                <div className="pp-badges-grid">
                  {badgesBloqueados.map(badge => (
                    <div key={badge.id} className="pp-badge-chip locked" title={badge.nome}>
                      <div className="pp-badge-chip-icon locked-icon">
                        <Lock size={13} />
                      </div>
                      <span className="pp-badge-chip-name locked-name">
                        {badge.tipo === 'secret' ? '????' : badge.nome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Tema */}
          <section className="pp-card pp-card-row">
            <div>
              <h2 className="pp-card-title" style={{ marginBottom: 4 }}>Tema atual</h2>
              <p className="pp-tema-sub">Altere nas Configurações do app</p>
            </div>
            <div className="pp-tema-right">
              <div className="pp-tema-dots">
                <div className="pp-tema-dot" style={{ background: '#7c3aed' }} />
                <div className="pp-tema-dot" style={{ background: '#a855f7' }} />
                <div className="pp-tema-dot" style={{ background: '#c084fc' }} />
              </div>
              <span className="pp-tema-name">{tema}</span>
              <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}