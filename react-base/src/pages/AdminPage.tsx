import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Users, Database, ShieldCheck, RefreshCw } from 'lucide-react'
import '../styles/AdminPage.css'

const API = 'https://orbyt-app.up.railway.app'

interface Usuario {
  id: number
  nome: string
  email: string
  role: string
  ultimo_sync: string | null
}

interface Stats {
  totalUsuarios: number
  totalComDados: number
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [deletando, setDeletando] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  async function carregar() {
    setLoading(true)
    setErro('')
    try {
      const [statsRes, usuariosRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { credentials: 'include' }),
        fetch(`${API}/api/admin/usuarios`, { credentials: 'include' }),
      ])

      if (statsRes.status === 403 || usuariosRes.status === 403) {
        setErro('Acesso negado. Você não tem permissão de admin.')
        setLoading(false)
        return
      }
      if (statsRes.status === 401 || usuariosRes.status === 401) {
        navigate('/login')
        return
      }

      const statsData = await statsRes.json()
      const usuariosData = await usuariosRes.json()

      if (statsData.sucesso) setStats(statsData)
      if (usuariosData.sucesso) setUsuarios(usuariosData.usuarios)
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function deletarUsuario(id: number) {
    setDeletando(id)
    try {
      const res = await fetch(`${API}/api/admin/usuarios/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.sucesso) {
        setUsuarios(prev => prev.filter(u => u.id !== id))
        setStats(prev => prev ? { ...prev, totalUsuarios: prev.totalUsuarios - 1 } : prev)
      } else {
        alert(data.mensagem || 'Erro ao deletar usuário')
      }
    } catch {
      alert('Erro de conexão ao deletar usuário')
    } finally {
      setDeletando(null)
      setConfirmId(null)
    }
  }

  function formatarData(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="adm-page">
      {/* Header */}
      <header className="adm-header">
        <button className="adm-back" onClick={() => navigate('/app')} aria-label="Voltar">
          <ArrowLeft size={20} />
        </button>
        <div className="adm-header-title">
          <ShieldCheck size={22} className="adm-header-icon" />
          <span>Painel Admin</span>
        </div>
        <button className="adm-refresh" onClick={carregar} aria-label="Recarregar" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'adm-spin' : ''} />
        </button>
      </header>

      <main className="adm-main">
        {/* Stats cards */}
        {stats && (
          <div className="adm-stats">
            <div className="adm-stat-card">
              <Users size={24} className="adm-stat-icon adm-stat-icon--purple" />
              <div>
                <div className="adm-stat-value">{stats.totalUsuarios}</div>
                <div className="adm-stat-label">Usuários cadastrados</div>
              </div>
            </div>
            <div className="adm-stat-card">
              <Database size={24} className="adm-stat-icon adm-stat-icon--emerald" />
              <div>
                <div className="adm-stat-value">{stats.totalComDados}</div>
                <div className="adm-stat-label">Com dados sincronizados</div>
              </div>
            </div>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="adm-erro">{erro}</div>
        )}

        {/* Loading skeleton */}
        {loading && !erro && (
          <div className="adm-loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="adm-skeleton-row" />
            ))}
          </div>
        )}

        {/* Tabela de usuários */}
        {!loading && !erro && (
          <div className="adm-table-wrap">
            <div className="adm-table-header">
              <span className="adm-section-title">Usuários ({usuarios.length})</span>
            </div>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Role</th>
                  <th>Último sync</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className={u.role === 'admin' ? 'adm-row--admin' : ''}>
                    <td className="adm-td-id">{u.id}</td>
                    <td className="adm-td-nome">{u.nome}</td>
                    <td className="adm-td-email">{u.email}</td>
                    <td>
                      <span className={`adm-badge adm-badge--${u.role}`}>{u.role}</span>
                    </td>
                    <td className="adm-td-sync">{formatarData(u.ultimo_sync)}</td>
                    <td className="adm-td-action">
                      {u.role !== 'admin' && (
                        confirmId === u.id ? (
                          <div className="adm-confirm">
                            <span>Deletar?</span>
                            <button
                              className="adm-confirm-btn adm-confirm-btn--yes"
                              onClick={() => deletarUsuario(u.id)}
                              disabled={deletando === u.id}
                            >
                              {deletando === u.id ? '...' : 'Sim'}
                            </button>
                            <button
                              className="adm-confirm-btn adm-confirm-btn--no"
                              onClick={() => setConfirmId(null)}
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            className="adm-delete-btn"
                            onClick={() => setConfirmId(u.id)}
                            aria-label={`Deletar ${u.nome}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={6} className="adm-empty">Nenhum usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
