const API = 'http://localhost:3001'

// Chaves do localStorage que pertencem à conta do usuário
// e devem ser sincronizadas com o servidor
export const SYNC_KEYS = [
  'tarefas',
  'userBadges',
  'streakData',
  'totalConcluidasHistorico',
  'tarefasContadasEvolutivo',
  'periodosUsados',
  'tarefasRemovidas',
  'areasVisitadas',
  'prioridadesUsadas',
  'selectedTheme',
  'temaEscuro',
  'temaVisual',
  'temasUsados',
  'diasAbertos',
  'orbyt_onboarded',
  'particulasAtivas',
]

// ──────────────────────────────────────────────
// preloadServerData
// Roda ANTES do React inicializar.
// Verifica se o usuário tem sessão ativa e, se sim,
// baixa os dados do servidor e escreve no localStorage.
// Assim o React já lê os dados certos ao montar.
// ──────────────────────────────────────────────
export async function preloadServerData(): Promise<void> {
  try {
    // 1. Verifica se há sessão ativa (timeout de 3s para não travar em redes lentas)
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 3000)
    const meRes = await fetch(`${API}/api/me`, { credentials: 'include', signal: controller.signal })
    clearTimeout(tid)
    if (!meRes.ok) return

    const meData = await meRes.json()
    if (!meData?.sucesso) return

    // 2. Usuário está logado — busca os dados
    await loadServerData()
  } catch {
    // Servidor offline ou erro de rede → usa localStorage como fallback
  }
}

// ──────────────────────────────────────────────
// loadServerData
// Busca os dados do servidor e escreve no localStorage.
// Exportada para ser chamada também após o login.
// ──────────────────────────────────────────────
export async function loadServerData(): Promise<void> {
  try {
    const dadosRes = await fetch(`${API}/api/dados`, { credentials: 'include' })
    if (!dadosRes.ok) return

    const { dados } = await dadosRes.json()
    if (!dados || Object.keys(dados).length === 0) return

    // Escreve cada chave no localStorage
    for (const key of SYNC_KEYS) {
      if (dados[key] !== undefined) {
        // JSON.stringify porque localStorage só aceita strings
        localStorage.setItem(key, JSON.stringify(dados[key]))
      }
    }
  } catch {
    // silently fail
  }
}

// ──────────────────────────────────────────────
// uploadToServer
// Lê todas as SYNC_KEYS do localStorage e envia
// para o servidor como um JSON único.
// ──────────────────────────────────────────────
async function uploadToServer(): Promise<void> {
  try {
    const dados: Record<string, unknown> = {}
    for (const key of SYNC_KEYS) {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        // JSON.parse converte de string de volta ao tipo original
        try { dados[key] = JSON.parse(raw) } catch { dados[key] = raw }
      }
    }

    await fetch(`${API}/api/dados`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ dados }),
    })
    // Se o usuário não estiver logado, o servidor retorna 401
    // e o catch silencia o erro — não tem problema
  } catch {
    // silently fail
  }
}

// ──────────────────────────────────────────────
// setupSync — Monkey-patch do localStorage.setItem
//
// "Monkey-patch" = substituir uma função nativa por outra
// que faz algo a mais, sem mudar quem a chama.
//
// Toda vez que qualquer parte do app chamar
// localStorage.setItem('tarefas', ...) por exemplo,
// nossa versão:
//   1. Chama o original (salva no localStorage normalmente)
//   2. Verifica se é uma chave que sincronizamos
//   3. Agenda um upload pro servidor em 2 segundos
//      (o timer reinicia se mais coisas forem salvas,
//       assim não enviamos 50 requests por segundo enquanto
//       o usuário digita — esperamos ele parar)
// ──────────────────────────────────────────────
export function setupSync(): void {
  let timer: ReturnType<typeof setTimeout> | null = null

  // Guarda a versão original antes de substituir
  const original = localStorage.setItem.bind(localStorage)

  // Substitui pela nossa versão
  localStorage.setItem = (key: string, value: string) => {
    // Sempre chama o original primeiro
    original(key, value)

    // Só agenda sync se for uma chave relevante
    if (!SYNC_KEYS.includes(key)) return

    // Debounce de 2 segundos:
    // cancela o timer anterior e cria um novo
    if (timer) clearTimeout(timer)
    timer = setTimeout(uploadToServer, 2000)
  }
}
