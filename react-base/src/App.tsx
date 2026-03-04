import { useState, useEffect, useLayoutEffect, useRef, Fragment, useMemo, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

// Extend Window interface to include Web Speech API and Web Audio API types
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    AudioContext: typeof AudioContext
    webkitAudioContext: typeof AudioContext
  }
}
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, DragOverlay, type DraggableAttributes, type DraggableSyntheticListeners, type Modifier } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Accessibility,
  AlertCircle,
  ArrowUpDown,
  Award,
  BarChart3,
  CalendarDays,
  Check,
  ChevronLeft,
  CheckCircle2,
  Command,
  Copy,
  Circle,
  CornerDownLeft,
  Brackets,
  FileText,
  Flag,
  FolderOpen,
  GripVertical,
  Hash,
  HelpCircle,
  Image,
  Info,
  Lightbulb,
  Layers,
  MapPin,
  Menu,
  Moon,
  Palette,
  PartyPopper,
  Pencil,
  Play,
  Plus,
  Search,
  Sparkles,
  Sun,
  Tag,
  Target,
  Trash2,
  X,
  Zap,
  ListChecks,
  Eye,
  Settings,
  Mic,
  Flame,
  User,
} from 'lucide-react'
import './App.css'
import './styles/Mobile.css'
import Sidebar from './components/ui/Sidebar';

// Components
const BackgroundParticles = lazy(() => import('./components/effects/BackgroundParticles'))
import ShimmerText from './components/effects/ShimmerText'
import PillNav from './components/ui/PillNav'
import Stats from './components/ui/Stats'
import Spotlight from './components/effects/Spotlight'
const BadgesGallery = lazy(() => import('./components/modals/BadgesGallery'))
const ThemeSelector = lazy(() => import('./components/modals/ThemeSelector'))
const SettingsModal = lazy(() => import('./components/modals/SettingsModal'))

// Data
import { BADGES } from './data/BadgesData'
import { getThemeById } from './data/ThemesData'

// Utility: convert hex like #a855f7 or a855f7 to "r, g, b" string
function hexToRgb(hex: string): string {
  if (!hex) return '168, 85, 247';
  const cleaned = hex.replace('#', '').trim();
  const full = cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned;
  const r = parseInt(full.substring(0, 2), 16) || 168;
  const g = parseInt(full.substring(2, 4), 16) || 85;
  const b = parseInt(full.substring(4, 6), 16) || 247;
  return `${r}, ${g}, ${b}`;
}
// Utility: check if a task is overdue (past its deadline and not completed)
function estaAtrasada(tarefa: { prazo?: string; concluida: boolean }): boolean {
  if (!tarefa.prazo || tarefa.concluida) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(tarefa.prazo + 'T00:00:00')
  return deadline < today
}

// import OnboardingDragDemo from './OnboardingDragDemo'

interface BadgeMsg {
  nome: string;
  raridade: string;
  icone: React.ComponentType<any>;
  cor: string;
}

type BadgeRaridade = 'common' | 'rare' | 'epic' | 'secret';

const badgeTestePorRaridade: Record<BadgeRaridade, typeof BADGES[number] | undefined> = {
  common: BADGES.find(b => b.tipo === 'common'),
  rare: BADGES.find(b => b.tipo === 'rare'),
  epic: BADGES.find(b => b.tipo === 'epic'),
  secret: BADGES.find(b => b.tipo === 'secret'),
};

interface Tarefa {
  id: string;
  texto: string;
  prioridade?: string;
  prazo?: string;
  notas?: string;
  categoria?: string;
  concluida: boolean;
  criadaEm: number;
  ordem?: number | null;
}

function App() {
  const { t, i18n } = useTranslation()

  // Sync document lang with selected language
  useEffect(() => {
    document.documentElement.lang = i18n.language === 'en' ? 'en' : 'pt-BR'
  }, [i18n.language])

  // Smooth fade-in when app mounts (transition from onboarding)
  useLayoutEffect(() => {
    const root = document.getElementById('root')
    root?.classList.add('app-entering')
    const timer = setTimeout(() => root?.classList.remove('app-entering'), 700)
    return () => clearTimeout(timer)
  }, [])

  // Apply initial theme CSS variables from ThemesData on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('selectedTheme') || 'padrao';
      const theme = getThemeById(saved);
      const root = document.documentElement.style;
      const primary = theme.accent.primary || '#a855f7';
      const hover = theme.accent.hover || '#9333ea';
      const light = theme.accent.light || '#e9d5ff';
      root.setProperty('--accent-color', primary);
      root.setProperty('--accent-hover', hover);
      root.setProperty('--accent-light', light);
      root.setProperty('--accent-rgb', hexToRgb(primary));
      root.setProperty('--accent-alt-rgb', hexToRgb(theme.preview.linkColor || hover));
      root.setProperty('--accent-hover-rgb', hexToRgb(hover));
      root.setProperty('--accent-light-rgb', hexToRgb(light));
      root.setProperty('--accent-glow', theme.accent.glow || `rgba(${hexToRgb(primary)}, 0.35)`);
      root.setProperty('--logo-neon-color', theme.accent.glow || `rgba(${hexToRgb(primary)}, 0.35)`);
      root.setProperty('--bg-gradient', theme.background?.gradient || '#05030d');
    } catch (e) {
      // fail quietly
    }
  }, []);
  const [badgeUnlockExiting, setBadgeUnlockExiting] = useState(false);
  const [badgeUnlockMsg, setBadgeUnlockMsg] = useState<BadgeMsg | null>(null);
  const badgeUnlockTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [badgesModalAberto, setBadgesModalAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false)

  const testarBadgeUnlock = (raridade: BadgeRaridade) => {
    const badge = badgeTestePorRaridade[raridade];
    if (badge) {
      setBadgeUnlockMsg({
        nome: badge.nome,
        raridade: badge.tipo,
        icone: badge.icone,
        cor: badge.cor
      });
      setBadgeUnlockExiting(false);
      if (badgeUnlockTimeout.current) clearTimeout(badgeUnlockTimeout.current);
      badgeUnlockTimeout.current = setTimeout(() => {
        setBadgeUnlockExiting(true);
      }, 3000);
    }
  };

  const [tarefas, setTarefas] = useState<Tarefa[]>(() => {
    const salvas = localStorage.getItem('tarefas');
    const parsed = salvas ? JSON.parse(salvas) : [];
    if (!Array.isArray(parsed)) return [];
    const base = parsed.map((t: any) => ({
      ...t,
      criadaEm: typeof t.criadaEm === 'number' ? t.criadaEm : Date.now(),
      prazo: typeof t.prazo === 'string' ? t.prazo : '',
      notas: typeof t.notas === 'string' ? t.notas : '',
      concluida: typeof t.concluida === 'boolean' ? t.concluida : false,
    }));
    const normalizarCat = (c: string) => (c && c.trim() ? c.trim() : 'geral');
    const porCat = new Map<string, any[]>();
    base.forEach((t: any, idx: number) => {
      const cat = normalizarCat(t.categoria);
      if (!porCat.has(cat)) porCat.set(cat, []);
      porCat.get(cat)!.push({ id: t.id, idx, ordem: typeof t.ordem === 'number' ? t.ordem : null });
    });
    const ordemPorId = new Map<string, number>();
    for (const [, items] of porCat.entries()) {
      items.sort((a, b) => {
        if (a.ordem !== null && b.ordem !== null && a.ordem !== b.ordem) return a.ordem - b.ordem;
        if (a.ordem === null && b.ordem !== null) return 1;
        if (a.ordem !== null && b.ordem === null) return -1;
        return a.idx - b.idx;
      });
      items.forEach((it: any, i: number) => ordemPorId.set(it.id, i));
    }
    return base.map((t: any) => ({
      ...t,
      ordem: ordemPorId.has(t.id) ? ordemPorId.get(t.id) : 0,
    }));
  });

  // Estado inicial dos badges do usuário, persistente no localStorage
  const [userBadges, setUserBadges] = useState(() => {
    const salvos = localStorage.getItem('userBadges')
    if (salvos) {
      try {
        const parsed = JSON.parse(salvos)
        // Garante que todos os badges do BADGES existam, mesmo se BADGES mudar
        return BADGES.map((b, i) => {
          const salvo = parsed.find((sb: any) => sb.id === b.id)
          // Preserva definição (niveis, cores, ícone) do BADGES; só mantém progresso do salvo
          return salvo ? { ...b, ...salvo, niveis: b.niveis, coresNiveis: b.coresNiveis, nomesNiveis: b.nomesNiveis } : { ...b, desbloqueado: i === 0 }
        })
      } catch {
        // fallback para todos bloqueados, exceto o primeiro
        return BADGES.map((b, i) => ({ ...b, desbloqueado: i === 0 }))
      }
    }
    return BADGES.map((b, i) => ({ ...b, desbloqueado: i === 0 }))
  })

  // Persiste badges desbloqueados no localStorage
  useEffect(() => {
    localStorage.setItem('userBadges', JSON.stringify(userBadges))
  }, [userBadges])

  // Meta Diária Personalizada - desbloqueado com badge "Foco Total"
  const metaDiariaDesbloqueada = userBadges.find(b => b.id === 'foco-total' && b.desbloqueado)

  // ═══════════════════════════════════════════════════════════════
  // STREAK COUNTER - Dias seguidos completando tarefas
  // ═══════════════════════════════════════════════════════════════
  const [totalConcluidasHistorico, setTotalConcluidasHistorico] = useState(() => {
    const saved = localStorage.getItem('totalConcluidasHistorico')
    return saved ? parseInt(saved, 10) : 0
  })

  useEffect(() => {
    localStorage.setItem('totalConcluidasHistorico', String(totalConcluidasHistorico))
  }, [totalConcluidasHistorico])

  const [streakData, setStreakData] = useState(() => {
    const saved = localStorage.getItem('streakData')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return { dias: 0, ultimoDia: null, melhorStreak: 0 }
      }
    }
    return { dias: 0, ultimoDia: null, melhorStreak: 0 }
  })

  // Persiste streak no localStorage
  useEffect(() => {
    localStorage.setItem('streakData', JSON.stringify(streakData))
  }, [streakData])

  // Função para atualizar streak quando completa uma tarefa
  const atualizarStreak = () => {
    const hoje = new Date().toDateString()
    const ontem = new Date(Date.now() - 86400000).toDateString()

    setStreakData((prev: { dias: number; ultimoDia: string | null; melhorStreak: number }) => {
      // Se já completou hoje, não faz nada
      if (prev.ultimoDia === hoje) return prev

      // Se completou ontem, incrementa streak
      if (prev.ultimoDia === ontem) {
        const novoStreak = prev.dias + 1
        return {
          dias: novoStreak,
          ultimoDia: hoje,
          melhorStreak: Math.max(novoStreak, prev.melhorStreak)
        }
      }

      // Se não completou ontem, reseta streak para 1
      return {
        dias: 1,
        ultimoDia: hoje,
        melhorStreak: Math.max(1, prev.melhorStreak)
      }
    })
  }

  // Verifica se streak quebrou (não completou ontem)
  useEffect(() => {
    const hoje = new Date().toDateString()
    const ontem = new Date(Date.now() - 86400000).toDateString()

    if (streakData.ultimoDia && streakData.ultimoDia !== hoje && streakData.ultimoDia !== ontem) {
      // Streak quebrou, mas mantém registro do melhor
      setStreakData((prev: { dias: number; ultimoDia: string | null; melhorStreak: number }) => ({
        ...prev,
        dias: 0
      }))
    }
  }, [])

  // Logo personalizado - desbloqueado com badge "Explorador"
  const logoDesbloqueado = userBadges.find(b => b.id === 'explorador' && b.desbloqueado)

  // Estado do logo customizado (imagem base64 ou URL)
  const [logoCustom, setLogoCustom] = useState<string | null>(() => {
    return localStorage.getItem('logoCustom')
  })

  // Estado da cor do neon ao redor do logo
  const [logoNeonColor, setLogoNeonColor] = useState<string>(() => {
    return localStorage.getItem('logoNeonColor') || '#a855f7'
  })

  // Persiste configurações do logo
  useEffect(() => {
    if (logoCustom) {
      localStorage.setItem('logoCustom', logoCustom)
    } else {
      localStorage.removeItem('logoCustom')
    }
  }, [logoCustom])

  useEffect(() => {
    localStorage.setItem('logoNeonColor', logoNeonColor)
  }, [logoNeonColor])

  // Handler para upload de imagem
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        setLogoCustom(result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Auto-desbloqueia badge Explorador para liberar seletor de logo
  useEffect(() => {
    const exploradorBadge = userBadges.find(b => b.id === 'explorador');
    if (exploradorBadge && !exploradorBadge.desbloqueado) {
      setUserBadges(prev => prev.map(b => b.id === 'explorador' ? { ...b, desbloqueado: true } : b));
    }
  }, []); // Apenas na montagem

  // Desbloqueia badge "Organizador" ao criar 5 categorias diferentes
  useEffect(() => {
    const categoriasUnicas = new Set(
      tarefas.map(t => (t.categoria && t.categoria.trim() ? t.categoria.trim() : 'geral'))
    );
    const organizadorDesbloqueado = userBadges.find(b => b.id === 'organizador' && b.desbloqueado);
    if (categoriasUnicas.size >= 5 && !organizadorDesbloqueado) {
      desbloquearBadge('organizador');
    }
  }, [tarefas, userBadges]);

  // Função para desbloquear badge e mostrar mensagem
  const desbloquearBadge = (badgeId: string) => {
    setUserBadges(prev => prev.map(b => b.id === badgeId ? { ...b, desbloqueado: true } : b))
    const badge = BADGES.find(b => b.id === badgeId)
    if (badge) {
      setBadgeUnlockMsg({
        nome: badge.nome,
        raridade: badge.tipo,
        icone: badge.icone,
        cor: badge.cor
      })
      setBadgeUnlockExiting(false);
      if (badgeUnlockTimeout.current) clearTimeout(badgeUnlockTimeout.current)
      badgeUnlockTimeout.current = setTimeout(() => {
        setBadgeUnlockExiting(true);
      }, 3000)
    }
  }

  // Set persistente de IDs de tarefas únicas que já contaram para o evolutivo
  const [tarefasContadasEvolutivo, setTarefasContadasEvolutivo] = useState<Set<string>>(() => {
    const salvas = localStorage.getItem('tarefasContadasEvolutivo');
    if (salvas) {
      try {
        return new Set(JSON.parse(salvas));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Persiste as tarefas contadas
  useEffect(() => {
    localStorage.setItem('tarefasContadasEvolutivo', JSON.stringify([...tarefasContadasEvolutivo]));
  }, [tarefasContadasEvolutivo]);

  // Evolução do badge "Evolutivo" - conta tarefas ÚNICAS concluídas, nunca regride
  useEffect(() => {
    const badgeEvolucao = userBadges.find(b => b.id === 'evolutivo');
    if (!badgeEvolucao) return;

    // Encontra tarefas concluídas que ainda não foram contadas
    const tarefasConcluidasAtuais = tarefas.filter(t => t.concluida);
    const novasContadas = tarefasConcluidasAtuais.filter(t => !tarefasContadasEvolutivo.has(t.id));

    // Adiciona novas tarefas ao Set (progresso só aumenta, nunca diminui)
    if (novasContadas.length > 0) {
      setTarefasContadasEvolutivo(prev => {
        const novoSet = new Set(prev);
        novasContadas.forEach(t => novoSet.add(t.id));
        return novoSet;
      });
    }

    // O progresso é o tamanho do Set (tarefas únicas já contadas)
    const progressoTotal = tarefasContadasEvolutivo.size + novasContadas.length;

    const niveis = badgeEvolucao.niveis || [5, 25, 50, 75, 100];
    let novoNivel = 0;
    for (let i = 0; i < niveis.length; i++) {
      if (progressoTotal >= niveis[i]) novoNivel = i + 1;
    }

    // Atualiza se mudou progresso ou nível
    const precisaAtualizar = badgeEvolucao.progressoAtual !== progressoTotal || badgeEvolucao.nivelAtual !== novoNivel;
    if (!precisaAtualizar) return;

    const nivelMudou = badgeEvolucao.nivelAtual !== novoNivel;

    setUserBadges(prev => prev.map(b =>
      b.id === 'evolutivo'
        ? { ...b, nivelAtual: novoNivel, desbloqueado: novoNivel > 0, progressoAtual: progressoTotal }
        : b
    ));

    // Mostra popup apenas ao atingir um novo nível
    if (novoNivel > 0 && nivelMudou) {
      desbloquearBadge('evolutivo');
    }
  }, [tarefas, userBadges, tarefasContadasEvolutivo]);

  // Badge "Mestre do Tempo" - rastreia uso em 3 períodos (manhã, tarde, noite)
  const [periodosUsados, setPeriodosUsados] = useState<{ manha: boolean; tarde: boolean; noite: boolean }>(() => {
    const salvos = localStorage.getItem('periodosUsados');
    if (salvos) {
      try {
        return JSON.parse(salvos);
      } catch {
        return { manha: false, tarde: false, noite: false };
      }
    }
    return { manha: false, tarde: false, noite: false };
  });

  // Persiste períodos usados
  useEffect(() => {
    localStorage.setItem('periodosUsados', JSON.stringify(periodosUsados));
  }, [periodosUsados]);

  // Detecta período atual e atualiza badge
  useEffect(() => {
    const hora = new Date().getHours();
    let periodo: 'manha' | 'tarde' | 'noite';

    if (hora >= 6 && hora < 12) {
      periodo = 'manha'; // 6h-12h
    } else if (hora >= 12 && hora < 18) {
      periodo = 'tarde'; // 12h-18h
    } else {
      periodo = 'noite'; // 18h-6h
    }

    // Se ainda não marcou este período
    if (!periodosUsados[periodo]) {
      setPeriodosUsados(prev => ({ ...prev, [periodo]: true }));
    }

    // Verifica se completou os 3 períodos
    const todosPeriodos = periodosUsados.manha && periodosUsados.tarde && periodosUsados.noite;
    const badgeTempo = userBadges.find(b => b.id === 'mestre-tempo');

    if (todosPeriodos && badgeTempo && !badgeTempo.desbloqueado) {
      setUserBadges(prev => prev.map(b =>
        b.id === 'mestre-tempo' ? { ...b, desbloqueado: true } : b
      ));
      desbloquearBadge('mestre-tempo');
    }
  }, [periodosUsados, userBadges]);

  // Exemplo de estatísticas do usuário (pode ser expandido depois)
  const [userStats] = useState({
    tarefasConcluidas: tarefas.filter(t => t.concluida).length,
    diasConsecutivos: 1,
  })

  // Handler para badge social (pode abrir modal/comunidade futuramente)
  const handleShowCommunity = () => {
    alert('Em breve: painel de comunidade!')
  }

  // ═══════════════════════════════════════════════════════════════
  // BADGES - Estados e Hooks para desbloqueio automático
  // ═══════════════════════════════════════════════════════════════

  // Estado para rastrear tarefas removidas (badge "Limpeza")
  const [tarefasRemovidas, setTarefasRemovidas] = useState(() => {
    const saved = localStorage.getItem('tarefasRemovidas')
    return saved ? parseInt(saved, 10) : 0
  })
  useEffect(() => {
    localStorage.setItem('tarefasRemovidas', String(tarefasRemovidas))
  }, [tarefasRemovidas])

  // Estado para rastrear timestamps de tarefas adicionadas (badge "Rapidez")
  const timestampsAdicao = useRef<number[]>([])

  // Estado para rastrear tarefas na sessão atual (badge "Foco Total")
  const [tarefasSessao, setTarefasSessao] = useState(0)

  // Estado para rastrear áreas visitadas (badge "Explorador")
  const [areasVisitadas, setAreasVisitadas] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('areasVisitadas')
    if (saved) {
      try {
        return new Set(JSON.parse(saved))
      } catch {
        return new Set()
      }
    }
    return new Set()
  })
  useEffect(() => {
    localStorage.setItem('areasVisitadas', JSON.stringify([...areasVisitadas]))
  }, [areasVisitadas])

  // Função para marcar área como visitada
  const marcarAreaVisitada = (area: string) => {
    if (!areasVisitadas.has(area)) {
      setAreasVisitadas(prev => new Set([...prev, area]))
    }
  }

  // Estado para rastrear prioridades usadas (badge "Mestre das Prioridades")
  const [prioridadesUsadas, setPrioridadesUsadas] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('prioridadesUsadas')
    if (saved) {
      try {
        return new Set(JSON.parse(saved))
      } catch {
        return new Set()
      }
    }
    return new Set()
  })
  useEffect(() => {
    localStorage.setItem('prioridadesUsadas', JSON.stringify([...prioridadesUsadas]))
  }, [prioridadesUsadas])

  // Badge "Primeira Tarefa" - ao concluir primeira tarefa
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'primeira-tarefa')
    if (badge?.desbloqueado) return

    const temConcluida = tarefas.some(t => t.concluida)
    if (temConcluida) {
      desbloquearBadge('primeira-tarefa')
    }
  }, [tarefas, userBadges])

  // Badge "Maratona" - 7 dias seguidos (usa o streakData existente)
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'maratona')
    if (badge?.desbloqueado) return

    if (streakData.dias >= 7) {
      desbloquearBadge('maratona')
    }
  }, [streakData, userBadges])

  // Badge "Foco Total" - completar 5 tarefas na sessão sem sair
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'foco-total')
    if (badge?.desbloqueado) return

    if (tarefasSessao >= 5) {
      desbloquearBadge('foco-total')
    }
  }, [tarefasSessao, userBadges])

  // Badge "Mestre das Prioridades" - usar todas as prioridades
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'mestre-prioridades')
    if (badge?.desbloqueado) return

    // Verifica prioridades usadas nas tarefas
    const prioridadesNasTarefas = new Set(tarefas.map(t => t.prioridade || 'media'))
    const todasPrioridades = prioridadesNasTarefas.has('alta') &&
      prioridadesNasTarefas.has('media') &&
      prioridadesNasTarefas.has('baixa')

    if (todasPrioridades) {
      desbloquearBadge('mestre-prioridades')
    }
  }, [tarefas, userBadges])

  // Badge "Notas Criativas" - adicionar notas em 10 tarefas
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'notas-criativas')
    if (badge?.desbloqueado) return

    const tarefasComNotas = tarefas.filter(t => t.notas && t.notas.trim().length > 0)
    if (tarefasComNotas.length >= 10) {
      desbloquearBadge('notas-criativas')
    }
  }, [tarefas, userBadges])

  // Badge "Noite Produtiva" - concluir tarefa entre 0h e 6h
  // (verificado na função alternarConclusao)

  // Badge "Limpeza" - remover 20 tarefas
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'limpeza')
    if (badge?.desbloqueado) return

    if (tarefasRemovidas >= 20) {
      desbloquearBadge('limpeza')
    }
  }, [tarefasRemovidas, userBadges])

  // Badge "Colecionador" - desbloquear 8 badges
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'colecionador')
    if (badge?.desbloqueado) return

    const badgesDesbloqueados = userBadges.filter(b => b.desbloqueado && b.id !== 'colecionador')
    if (badgesDesbloqueados.length >= 8) {
      desbloquearBadge('colecionador')
    }
  }, [userBadges])

  // Badge "Rapidez" - adicionar 3 tarefas em menos de 1 minuto
  const verificarBadgeRapidez = () => {
    const badge = userBadges.find(b => b.id === 'rapidez')
    if (badge?.desbloqueado) return

    const agora = Date.now()
    timestampsAdicao.current.push(agora)
    // Mantém só os últimos 60 segundos
    timestampsAdicao.current = timestampsAdicao.current.filter(t => agora - t < 60000)

    if (timestampsAdicao.current.length >= 3) {
      desbloquearBadge('rapidez')
    }
  }

  // Badge "Explorador" - visitar todas as áreas
  const AREAS_APP = ['configuracoes', 'estatisticas', 'badges', 'detalhes', 'ajuda']
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'explorador')
    if (badge?.desbloqueado) return

    const todasVisitadas = AREAS_APP.every(area => areasVisitadas.has(area))
    if (todasVisitadas) {
      desbloquearBadge('explorador')
    }
  }, [areasVisitadas, userBadges])

  // Badge "Veterano" - 30 dias seguidos
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'veterano')
    if (badge?.desbloqueado) return
    if (streakData.dias >= 30) {
      desbloquearBadge('veterano')
    }
  }, [streakData, userBadges])

  // Badge "Planejador" - 10 tarefas com prazo definido
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'planejador')
    if (badge?.desbloqueado) return
    const comPrazo = tarefas.filter(t => t.prazo && t.prazo.trim().length > 0).length
    if (comPrazo >= 10) {
      desbloquearBadge('planejador')
    }
  }, [tarefas, userBadges])

  // Badge "Decisivo" - concluir 10 tarefas de prioridade alta
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'decisivo')
    if (badge?.desbloqueado) return
    const altasConcluidas = tarefas.filter(t => t.concluida && t.prioridade === 'alta').length
    if (altasConcluidas >= 10) {
      desbloquearBadge('decisivo')
    }
  }, [tarefas, userBadges])

  // Badge "Perfeccionista" - 10 tarefas concluídas com notas E prazo
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'perfeccionista')
    if (badge?.desbloqueado) return
    const count = tarefas.filter(t => t.concluida && t.notas?.trim() && t.prazo?.trim()).length
    if (count >= 10) {
      desbloquearBadge('perfeccionista')
    }
  }, [tarefas, userBadges])

  // Badge "Multitarefa" - ter 15+ tarefas pendentes ao mesmo tempo
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'multitarefa')
    if (badge?.desbloqueado) return
    const pendentes = tarefas.filter(t => !t.concluida).length
    if (pendentes >= 15) {
      desbloquearBadge('multitarefa')
    }
  }, [tarefas, userBadges])

  // Badge "Conquistador" - desbloquear 12 badges (exceto o próprio e o evolutivo)
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'conquistador')
    if (badge?.desbloqueado) return
    const count = userBadges.filter(b => b.desbloqueado && b.id !== 'conquistador' && b.id !== 'evolutivo').length
    if (count >= 12) {
      desbloquearBadge('conquistador')
    }
  }, [userBadges])

  // Badge "Assíduo" - abrir app em 7 dias diferentes
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'assiduo')
    if (badge?.desbloqueado) return
    try {
      const stored = localStorage.getItem('diasAbertos')
      const dias = stored ? JSON.parse(stored) : []
      if (dias.length >= 7) {
        desbloquearBadge('assiduo')
      }
    } catch { /* ignore */ }
  }, [userBadges])

  // Badge "Maestro" - concluir tarefas de 5 categorias diferentes
  useEffect(() => {
    const badge = userBadges.find(b => b.id === 'maestro')
    if (badge?.desbloqueado) return
    const categorias = new Set(
      tarefas
        .filter(t => t.concluida && t.categoria && t.categoria.trim())
        .map(t => t.categoria!.trim().toLowerCase())
    )
    if (categorias.size >= 5) {
      desbloquearBadge('maestro')
    }
  }, [tarefas, userBadges])

  // Badge "Secreto" - clicar 7 vezes no logo
  const cliquesLogoRef = useRef(0)
  const ultimoCliqueLogoRef = useRef(0)
  const [logoClicado, setLogoClicado] = useState(false)

  const handleLogoClick = () => {
    const agora = Date.now()
    // Reset se passou mais de 2 segundos desde o último clique
    if (agora - ultimoCliqueLogoRef.current > 2000) {
      cliquesLogoRef.current = 0
    }
    ultimoCliqueLogoRef.current = agora
    cliquesLogoRef.current++

    // Efeito visual de pop
    setLogoClicado(true)
    setTimeout(() => setLogoClicado(false), 150)

    // Som de pop
    tocarSom('add')

    if (cliquesLogoRef.current >= 7) {
      const badge = userBadges.find(b => b.id === 'secreto')
      if (badge && !badge.desbloqueado) {
        desbloquearBadge('secreto')
        tocarSom('success')
      }
      cliquesLogoRef.current = 0
    }
  }

  // ═══════════════════════════════════════════════════════════════

  const [texto, setTexto] = useState('')

  const [filtro, setFiltro] = useState('todas')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [textoEditando, setTextoEditando] = useState('')
  const [removendoId, setRemovendoId] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState('manual')
  const [menuOrdenacaoAberto, setMenuOrdenacaoAberto] = useState(false)
  const [menuOrdenacaoVisivel, setMenuOrdenacaoVisivel] = useState(false)
  const [focoOrdenacaoIndex, setFocoOrdenacaoIndex] = useState(0)
  const [detalhesAberto, setDetalhesAberto] = useState(false)
  const [detalhesId, setDetalhesId] = useState<string | null>(null)
  const [detalhesPrazo, setDetalhesPrazo] = useState('')
  const [detalhesPrazoTexto, setDetalhesPrazoTexto] = useState('')
  const [detalhesNotas, setDetalhesNotas] = useState('')

  // Tema do localStorage na inicialização
  const [temaEscuro, setTemaEscuro] = useState(() => {
    const salvo = localStorage.getItem('temaEscuro')
    return salvo !== null ? JSON.parse(salvo) : true
  })

  // Estado do tema visual (cores/partículas)
  const [temaVisual, setTemaVisual] = useState(() => {
    const salvo = localStorage.getItem('temaVisual')
    return salvo || 'padrao'
  })
  const [themeSelectorAberto, setThemeSelectorAberto] = useState(false)

  // Partículas de fundo - pode ser desativado nas configurações (padrão: DESLIGADO)
  const [particulasAtivas, setParticulasAtivas] = useState(() => {
    const salvo = localStorage.getItem('particulasAtivas')
    return salvo !== null ? JSON.parse(salvo) : false
  })

  // Registra temas usados e verifica badge "Artista"
  useEffect(() => {
    try {
      const stored = localStorage.getItem('temasUsados');
      const set = stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
      set.add(temaVisual);
      localStorage.setItem('temasUsados', JSON.stringify([...set]));
      const badge = userBadges.find((b: any) => b.id === 'artista');
      if (!badge?.desbloqueado && set.size >= 3) {
        desbloquearBadge('artista');
      }
    } catch { /* ignore */ }
  }, [temaVisual, userBadges]);

  // Registra dias distintos de abertura (para badge "Assíduo") — só no mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('diasAbertos');
      const set = stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
      set.add(new Date().toISOString().split('T')[0]);
      localStorage.setItem('diasAbertos', JSON.stringify([...set]));
    } catch { /* ignore */ }
  }, []);

  // Calcula nível evolutivo atual
  const nivelEvolutivo = useMemo(() => {
    const badgeEvolucao = userBadges.find((b: any) => b.id === 'evolutivo')
    return badgeEvolucao?.nivelAtual || 0
  }, [userBadges])

  // Obtém configuração do tema atual
  const temaAtual = useMemo(() => getThemeById(temaVisual), [temaVisual])

  // Aplica cores de destaque do tema como CSS variables
  useEffect(() => {
    const root = document.documentElement;
    let accentPrimary: string;
    let accentHover: string;
    let accentLight: string;
    let accentGlow: string;
    let bgGradient: string;

    if (temaVisual === 'custom') {
      accentPrimary = localStorage.getItem('customAccentPrimary') || '#a855f7';
      accentHover = localStorage.getItem('customAccentHover') || '#9333ea';
      accentLight = localStorage.getItem('customAccentLight') || '#e9d5ff';
      accentGlow = localStorage.getItem('customAccentGlow') || 'rgba(168,85,247,0.4)';
      const bgStart = localStorage.getItem('customBgStart') || '#1a1625';
      const bgEnd = localStorage.getItem('customBgEnd') || '#2d1b4e';
      bgGradient = `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd} 100%)`;
    } else {
      accentPrimary = temaAtual?.accent?.primary || '#a855f7';
      accentHover = temaAtual?.accent?.hover || '#9333ea';
      accentLight = temaAtual?.accent?.light || '#e9d5ff';
      accentGlow = temaAtual?.accent?.glow || 'rgba(168, 85, 247, 0.4)';
      bgGradient = temaAtual?.background?.gradient || '#05030d';
    }

    root.style.setProperty('--accent-color', accentPrimary);
    root.style.setProperty('--accent-hover', accentHover);
    root.style.setProperty('--accent-light', accentLight);
    root.style.setProperty('--accent-glow', accentGlow);
    root.style.setProperty('--bg-gradient', bgGradient);
    // Ensure RGB tuple vars are updated so rgba(var(--accent-rgb), ...) follows the selected theme
    try {
      const accRgb = hexToRgb(accentPrimary);
      const hoverRgb = hexToRgb(accentHover);
      const lightRgb = hexToRgb(accentLight);
      const altRgb = temaVisual === 'custom'
        ? hexToRgb(localStorage.getItem('customParticleLinkColor') || accentPrimary)
        : hexToRgb(temaAtual?.preview?.linkColor || accentHover);
      root.style.setProperty('--accent-rgb', accRgb);
      root.style.setProperty('--accent-hover-rgb', hoverRgb);
      root.style.setProperty('--accent-light-rgb', lightRgb);
      root.style.setProperty('--accent-alt-rgb', altRgb);
    } catch (e) {
      // ignore
    }
    root.style.removeProperty('--menu-bg');
    // ensure logo neon matches accent glow so drop-shadow uses current theme
    root.style.setProperty('--logo-neon-color', accentGlow);
  }, [temaAtual, temaVisual])

  // Persiste tema visual
  useEffect(() => {
    localStorage.setItem('temaVisual', temaVisual)
  }, [temaVisual])

  const [prioridade, setPrioridade] = useState(() => {
    const salvo = localStorage.getItem('prioridadeAtual')
    return salvo ? salvo : 'neutra'
  })
  const [menuPrioridadeAberto, setMenuPrioridadeAberto] = useState(false)
  const [menuPrioridadeVisivel, setMenuPrioridadeVisivel] = useState(false)
  const prioridades = useMemo(() => ['neutra', 'baixa', 'media', 'alta'], [])
  const opcoesOrdenacao = useMemo(() => ([
    { value: 'manual', label: t('app.sort.manual') },
    { value: 'prioridade', label: t('app.sort.priority') },
    { value: 'prazo', label: t('app.sort.deadline') },
    { value: 'recentes', label: t('app.sort.newest') },
    { value: 'antigas', label: t('app.sort.oldest') },
    { value: 'az', label: t('app.sort.az') },
    { value: 'za', label: t('app.sort.za') },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]), [t])
  const labelOrdenacaoCurto = useMemo<Record<string, string>>(() => ({
    manual: t('app.sort.manualShort'),
    prioridade: t('app.sort.priorityShort'),
    prazo: t('app.sort.deadlineShort'),
    recentes: t('app.sort.newestShort'),
    antigas: t('app.sort.oldestShort'),
    az: t('app.sort.az'),
    za: t('app.sort.za'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [t])
  const [focoPrioridadeIndex, setFocoPrioridadeIndex] = useState(0)
  const prioridadeContainerRef = useRef(null)
  const [confeteAtivo, setConfeteAtivo] = useState(() => {
    const salvo = localStorage.getItem('confeteAtivo')
    return salvo !== null ? JSON.parse(salvo) : true
  })
  const [coresPrioridadeAtivas, setCoresPrioridadeAtivas] = useState(() => {
    const salvo = localStorage.getItem('coresPrioridadeAtivas')
    return salvo !== null ? JSON.parse(salvo) : true
  })
  const [barraPorcentagemAtiva, setBarraPorcentagemAtiva] = useState(() => {
    const salvo = localStorage.getItem('barraPorcentagemAtiva')
    return salvo !== null ? JSON.parse(salvo) : true
  })
  const [acoesRapidasAtivas, setAcoesRapidasAtivas] = useState(() => {
    const salvo = localStorage.getItem('acoesRapidasAtivas')
    return salvo !== null ? JSON.parse(salvo) : false
  })
  const [buscaBarAtiva, setBuscaBarAtiva] = useState(() => {
    const salvo = localStorage.getItem('buscaBarAtiva')
    return salvo !== null ? JSON.parse(salvo) : true
  })
  const [ordenacaoAtiva, setOrdenacaoAtiva] = useState(() => {
    const salvo = localStorage.getItem('ordenacaoAtiva')
    return salvo !== null ? JSON.parse(salvo) : true
  })
  const [filtrosAtivos, setFiltrosAtivos] = useState(() => {
    const salvo = localStorage.getItem('filtrosAtivos')
    return salvo !== null ? JSON.parse(salvo) : true
  })
  const [loteAberto, setLoteAberto] = useState(false)
  const [loteVisivel, setLoteVisivel] = useState(false)
  const [loteTexto, setLoteTexto] = useState('')
  const [loteAjudaAberta, setLoteAjudaAberta] = useState(false)
  const [loteCopiado, setLoteCopiado] = useState<string | null>(null)
  const [confirmLimparAberto, setConfirmLimparAberto] = useState(false)
  const [confirmRemoverAberto, setConfirmRemoverAberto] = useState(false)
  const [overdueNotifVisible, setOverdueNotifVisible] = useState(false)
  const overdueNotifShownRef = useRef(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const [menuVisivel, setMenuVisivel] = useState(false)
  const [catPadrao, setCatPadrao] = useState(() => {
    const salvo = localStorage.getItem('catPadrao')
    return salvo !== null ? salvo : ''
  })
  const [localAberto, setLocalAberto] = useState(false)
  const [localVisivel, setLocalVisivel] = useState(false)

  // Ref para o container principal (scroll tracking)
  const mainContentRef = useRef<HTMLElement>(null)
  // Ref para o body do page-overlay (reset de scroll ao trocar de página)
  const pageOverlayBodyRef = useRef<HTMLDivElement>(null)
  // Rastreia página anterior para animação de entrada/saída do workspace
  const prevPaginaRef = useRef('tarefas')

  // Refs para detectar cliques fora
  const menuRef = useRef<HTMLDivElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const prioridadeMenuRef = useRef<HTMLDivElement>(null)
  const prioridadeBtnRef = useRef<HTMLButtonElement>(null)
  const loteRef = useRef<HTMLDivElement>(null)
  const loteBtnRef = useRef<HTMLButtonElement>(null)
  const localRef = useRef<HTMLDivElement>(null)
  const localBtnRef = useRef<HTMLButtonElement>(null)
  const loteCopiadoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const detalhesDateNativeRef = useRef<HTMLInputElement>(null)
  const detalhesDateTextRef = useRef<HTMLInputElement>(null)
  const ordenacaoMenuRef = useRef<HTMLDivElement>(null)
  const ordenacaoBtnRef = useRef<HTMLButtonElement>(null)
  const inputTarefaRef = useRef<HTMLInputElement>(null)

  const [dragAtivo, setDragAtivo] = useState(() => {
    const salvo = localStorage.getItem('dragAtivo')
    return salvo !== null ? JSON.parse(salvo) : true
  })

  // Estados de Acessibilidade
  const [modoFoco, setModoFoco] = useState(() => {
    const salvo = localStorage.getItem('modoFoco')
    return salvo !== null ? JSON.parse(salvo) : false
  })
  // Destaque de foco global (toggle separado para a classe CSS)
  const [focoVisivel, setFocoVisivel] = useState(() => {
    const salvo = localStorage.getItem('focoVisivel')
    return salvo !== null ? JSON.parse(salvo) : false
  })
  const [altoContraste, setAltoContraste] = useState(() => {
    const salvo = localStorage.getItem('altoContraste')
    return salvo !== null ? JSON.parse(salvo) : false
  })
  const [reducaoMovimento, setReducaoMovimento] = useState(() => {
    const salvo = localStorage.getItem('reducaoMovimento')
    return salvo !== null ? JSON.parse(salvo) : false
  })
  const [espacamentoAumentado, setEspacamentoAumentado] = useState(() => {
    const salvo = localStorage.getItem('espacamentoAumentado')
    return salvo !== null ? JSON.parse(salvo) : false
  })

  const [feedbackVisual, setFeedbackVisual] = useState(() => {
    const salvo = localStorage.getItem('feedbackVisual')
    return salvo !== null ? JSON.parse(salvo) : true
  })
  // Modo de controle por voz
  const [vozAtiva, setVozAtiva] = useState(() => {
    const salvo = localStorage.getItem('vozAtiva')
    return salvo !== null ? JSON.parse(salvo) : false
  })
  useEffect(() => {
    localStorage.setItem('vozAtiva', JSON.stringify(vozAtiva))
  }, [vozAtiva])

  // Streak counter ativo/desativado
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const [streakAtivo, setStreakAtivo] = useState(() => {
    const salvo = localStorage.getItem('streakAtivo')
    return salvo !== null ? JSON.parse(salvo) : true
  })
  useEffect(() => {
    localStorage.setItem('streakAtivo', JSON.stringify(streakAtivo))
  }, [streakAtivo])

  // Voz no navegador (Web Speech API)
  const [vozOuvindo, setVozOuvindo] = useState(false)
  const [vozSuportada] = useState(() => {
    return typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
  })
  const recognitionRef = useRef<any>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Sons satisfatórios ativados/desativados
  const [sonsAtivos, setSonsAtivos] = useState(() => {
    const salvo = localStorage.getItem('sonsAtivos')
    return salvo !== null ? JSON.parse(salvo) : false
  })
  useEffect(() => {
    localStorage.setItem('sonsAtivos', JSON.stringify(sonsAtivos))
  }, [sonsAtivos])

  const tocarBeep = (freq = 880, durMs = 120) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx()
      }
      const ctx = audioCtxRef.current
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durMs / 1000)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + durMs / 1000)
    } catch (e) {
      console.warn('Não foi possível tocar beep:', e)
    }
  }

  // 🔊 SONS SATISFATÓRIOS
  const tocarSom = (tipo: 'check' | 'delete' | 'add' | 'success') => {
    if (!sonsAtivos) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx()
      }
      const ctx = audioCtxRef.current
      if (!ctx) return

      if (tipo === 'check') {
        // Som de "ding" satisfatório ao completar - duas notas subindo
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain = ctx.createGain()

        osc1.type = 'sine'
        osc2.type = 'sine'
        osc1.frequency.value = 880  // Lá5
        osc2.frequency.value = 1108 // Dó#6

        gain.gain.setValueAtTime(0.12, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(ctx.destination)

        osc1.start(ctx.currentTime)
        osc2.start(ctx.currentTime + 0.08)
        osc1.stop(ctx.currentTime + 0.15)
        osc2.stop(ctx.currentTime + 0.3)
      }

      if (tipo === 'delete') {
        // Som de "swoosh" descendente ao deletar
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(400, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15)

        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.15)
      }

      if (tipo === 'add') {
        // Som de "pop" suave ao adicionar
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08)

        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.1)
      }

      if (tipo === 'success') {
        // Som de "fanfarra mini" quando zera a lista - acorde maior
        const freqs = [523, 659, 784] // Dó, Mi, Sol (acorde maior)
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()

          osc.type = 'sine'
          osc.frequency.value = freq

          gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4 + i * 0.05)

          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime + i * 0.05)
          osc.stop(ctx.currentTime + 0.4 + i * 0.05)
        })
      }
    } catch (e) {
      console.warn('Erro ao tocar som:', e)
    }
  }

  useEffect(() => {
    if (!vozSuportada) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SpeechRecognition()
    rec.lang = 'pt-BR'
    rec.continuous = false
    rec.interimResults = false

    rec.onstart = () => {
      setVozOuvindo(true)
      tocarBeep(900, 120) // beep curtinho ao começar a gravar
    }
    rec.onend = () => {
      setVozOuvindo(false)
      tocarBeep(500, 120) // beep diferente ao terminar
    }

    rec.onresult = (event: any) => {
      const textoReconhecido = event.results[0][0].transcript
      console.log('🎤 Texto reconhecido:', textoReconhecido)
      tratarTextoDeVoz(textoReconhecido)
    }

    rec.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error)
      setVozOuvindo(false)
    }

    recognitionRef.current = rec

    return () => {
      rec.onresult = null
      rec.onerror = null
    }
  }, [vozSuportada])

  const interpretarComandoVoz = (bruto: string) => {
    if (!bruto) {
      return { acao: 'nenhuma', titulo: '', categoria: '', prioridade: null }
    }

    const textoOriginal = bruto.trim()
    const texto = textoOriginal.toLowerCase()

    // 1) Se começar com "conclu..." tratamos sempre como comando de concluir
    if (texto.startsWith('conclu')) {
      // tenta usar tudo depois da palavra "tarefa" como título
      const idxTarefa = texto.indexOf('tarefa')
      let resto = ''
      if (idxTarefa !== -1) {
        const inicioTitulo = idxTarefa + 'tarefa'.length
        resto = textoOriginal.slice(inicioTitulo).trim()
      } else {
        // se não tiver "tarefa", usa tudo depois de "conclu..."
        const idxConclu = texto.indexOf('conclu')
        const inicioTitulo = idxConclu + 'concluir'.length
        resto = textoOriginal.slice(inicioTitulo).trim()
      }

      resto = resto
        .replace(/como concluíd[ao]s?/gi, '')
        .replace(/concluíd[ao]s?$/gi, '')
        .trim()

      if (!resto) {
        // não cria nada se não tiver um alvo claro
        return { acao: 'nenhuma', titulo: '', categoria: '', prioridade: null }
      }

      return {
        acao: 'concluir',
        titulo: resto,
        categoria: '',
        prioridade: null,
      }
    }

    // 2) Comando de criação: "categoria cozinha tarefa fazer comida prioridade média"
    let categoria = ''
    let titulo = ''
    let prioridade = null

    const pegarTrecho = (textoLower: string, chave: string, proximasChaves: string[]) => {
      const idx = textoLower.indexOf(chave)
      if (idx === -1) return ''
      const inicio = idx + chave.length
      let fim = textoLower.length
      for (const prox of proximasChaves) {
        const j = textoLower.indexOf(prox, inicio)
        if (j !== -1 && j < fim) fim = j
      }
      return textoOriginal.slice(inicio, fim).replace(/[:,\-]/g, ' ').trim()
    }

    categoria = pegarTrecho(texto, 'categoria', ['tarefa', 'prioridade'])
    titulo = pegarTrecho(texto, 'tarefa', ['categoria', 'prioridade'])

    const blocoPrioridade = pegarTrecho(texto, 'prioridade', ['categoria', 'tarefa'])
    const pLower = blocoPrioridade.toLowerCase()
    if (pLower.includes('alta')) prioridade = 'alta'
    else if (pLower.includes('baixa')) prioridade = 'baixa'
    else if (pLower.includes('média') || pLower.includes('media')) prioridade = 'media'

    // fallback: se não achar "tarefa", usa a frase toda como título
    if (!titulo) titulo = textoOriginal

    return {
      acao: 'criar' as const,
      titulo: titulo,
      categoria: categoria,
      prioridade: prioridade,
    }
  }

  const tratarTextoDeVoz = (textoReconhecido: string) => {
    const { acao, titulo, categoria, prioridade } = interpretarComandoVoz(textoReconhecido)
    if (!titulo.trim()) return

    if (acao === 'concluir') {
      // Marca como concluída a tarefa cujo texto contém o trecho falado
      const alvo = titulo.toLowerCase()
      setTarefas((prev) =>
        prev.map((t) =>
          t.texto.toLowerCase().includes(alvo) ? { ...t, concluida: true } : t,
        ),
      )
      return
    }

    if (acao === 'criar') {
      const catKey =
        (categoria && categoria.trim()) ||
        (catPadrao && catPadrao.trim() ? catPadrao.trim() : 'geral')

      setTarefas((prev) => {
        const maxOrdem = prev.reduce((acc, t) => {
          const c = t.categoria && t.categoria.trim() ? t.categoria.trim() : 'geral'
          if (c !== catKey) return acc
          const o = typeof t.ordem === 'number' ? t.ordem : -1
          return Math.max(acc, o)
        }, -1)

        const novaTarefa: Tarefa = {
          id: Date.now().toString(),
          texto: titulo.trim(),
          concluida: false,
          prioridade: prioridade || 'neutra',
          categoria: catKey,
          criadaEm: Date.now(),
          prazo: '',
          notas: '',
          ordem: maxOrdem + 1,
        }

        return [...prev, novaTarefa]
      })
      setTexto('')
    }
  }

  const iniciarReconhecimentoVoz = () => {
    if (!vozSuportada || !recognitionRef.current) {
      console.warn('Reconhecimento de voz não suportado neste navegador.')
      return
    }
    try {
      recognitionRef.current.start()
    } catch (e) {
      console.error('Erro ao iniciar voz:', e)
    }
  }

  const pararReconhecimentoVoz = () => {
    if (!vozSuportada || !recognitionRef.current) return
    try {
      recognitionRef.current.stop()
    } catch (e) {
      console.error('Erro ao parar voz:', e)
    }
  }

  // Modal de Estatísticas
  const [statsModalAberto, setStatsModalAberto] = useState(false)
  const [statsModalVisivel, setStatsModalVisivel] = useState(false)

  // Página ativa na sidebar (slide-in)
  const [paginaAtiva, setPaginaAtiva] = useState('tarefas')
  // Classe de animação para o workspace (entra/sai quando overlay abre/fecha)
  const [tarefasAnimClass, setTarefasAnimClass] = useState('')

  // Trava scroll do main-content quando page-overlay estiver aberta
  useEffect(() => {
    const el = mainContentRef.current
    if (!el || paginaAtiva === 'tarefas') return
    el.scrollTop = 0
    const lock = () => { el.scrollTop = 0 }
    el.addEventListener('scroll', lock)
    return () => el.removeEventListener('scroll', lock)
  }, [paginaAtiva])

  // Reseta o scroll do page-overlay-body antes do browser pintar (evita flash de 1 frame)
  useLayoutEffect(() => {
    if (paginaAtiva !== 'tarefas') {
      pageOverlayBodyRef.current?.scrollTo(0, 0)
    }
  }, [paginaAtiva])

  // Animação de entrada/saída do workspace ao abrir/fechar overlays
  useEffect(() => {
    const prev = prevPaginaRef.current
    prevPaginaRef.current = paginaAtiva
    if (paginaAtiva !== 'tarefas' && prev === 'tarefas') {
      // Overlay abrindo: workspace sai pela direita
      setTarefasAnimClass('panel-exiting')
    } else if (paginaAtiva === 'tarefas' && prev !== 'tarefas') {
      // Overlay fechando: workspace entra pela esquerda
      setTarefasAnimClass('panel-entering')
      const timer = window.setTimeout(() => setTarefasAnimClass(''), 420)
      return () => clearTimeout(timer)
    }
  }, [paginaAtiva])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    }),
  )

  const abrirMenuOpcoes = () => {
    setMenuVisivel(true)
    setMenuAberto(true)
    marcarAreaVisitada('configuracoes')
  }

  const fecharMenuOpcoes = () => {
    setMenuAberto(false)
    setTimeout(() => {
      setMenuVisivel(false)
    }, 180)
  }

  // Keyboard navigation shortcuts (active when body has class 'navegacao-teclado')
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!document.body.classList.contains('navegacao-teclado')) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        inputTarefaRef.current?.focus()
      }
      if (e.key === 'Escape') {
        fecharMenuOpcoes()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const abrirMenuPrioridade = () => {
    setMenuPrioridadeVisivel(true)
    setMenuPrioridadeAberto(true)
  }

  const fecharMenuPrioridade = () => {
    if (!menuPrioridadeAberto && !menuPrioridadeVisivel) return
    setMenuPrioridadeAberto(false)
    setTimeout(() => {
      setMenuPrioridadeVisivel(false)
    }, 160)
  }

  const abrirMenuOrdenacao = () => {
    setMenuOrdenacaoVisivel(true)
    setMenuOrdenacaoAberto(true)
  }

  const fecharMenuOrdenacao = () => {
    if (!menuOrdenacaoAberto && !menuOrdenacaoVisivel) return
    setMenuOrdenacaoAberto(false)
    setTimeout(() => {
      setMenuOrdenacaoVisivel(false)
    }, 160)
  }

  const abrirStatsModal = () => {
    setStatsModalVisivel(true)
    setStatsModalAberto(true)
    marcarAreaVisitada('estatisticas')
  }

  const fecharStatsModal = () => {
    if (!statsModalAberto && !statsModalVisivel) return
    setStatsModalAberto(false)
    setTimeout(() => {
      setStatsModalVisivel(false)
    }, 180)
  }

  const abrirLocal = () => {
    setLocalVisivel(true)
    setLocalAberto(true)
  }

  const fecharLocal = () => {
    if (!localAberto && !localVisivel) return
    setLocalAberto(false)
    setTimeout(() => {
      setLocalVisivel(false)
    }, 160)
  }

  const abrirLote = () => {
    setLoteVisivel(true)
    setLoteAberto(true)
  }

  const fecharLote = () => {
    if (!loteAberto && !loteVisivel) return
    setLoteAberto(false)
    setTimeout(() => {
      setLoteVisivel(false)
    }, 160)
  }

  const formatISOParaBR = (iso: string) => {
    if (!iso) return ''
    const parts = iso.split('-')
    if (parts.length !== 3) return ''
    const [y, m, d] = parts
    if (!y || !m || !d) return ''
    return `${d}/${m}/${y}`
  }

  const parseParaISO = (texto: string) => {
    const t = (texto || '').trim()
    if (!t) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
    const digits = t.replace(/[^\d]/g, '')
    if (digits.length !== 8) return ''
    const dd = digits.slice(0, 2)
    const mm = digits.slice(2, 4)
    const yyyy = digits.slice(4, 8)
    const d = Number(dd)
    const m = Number(mm)
    const y = Number(yyyy)
    if (!y || m < 1 || m > 12 || d < 1 || d > 31) return ''
    const iso = `${yyyy}-${mm}-${dd}`
    const ts = Date.parse(iso)
    if (Number.isNaN(ts)) return ''
    return iso
  }

  const abrirDetalhes = (tarefa: Tarefa) => {
    setDetalhesId(tarefa.id)
    const prazo = tarefa.prazo || ''
    setDetalhesPrazo(prazo)
    setDetalhesPrazoTexto(formatISOParaBR(prazo))
    setDetalhesNotas(tarefa.notas || '')
    setDetalhesAberto(true)
    marcarAreaVisitada('detalhes')
  }

  const fecharDetalhes = () => {
    setDetalhesAberto(false)
    setDetalhesId(null)
    setDetalhesPrazo('')
    setDetalhesPrazoTexto('')
    setDetalhesNotas('')
  }

  const salvarDetalhes = () => {
    if (detalhesId === null) return
    const prazoISO = parseParaISO(detalhesPrazoTexto)
    setTarefas((prev) => prev.map((t) => (
      t.id === detalhesId
        ? { ...t, prazo: prazoISO, notas: detalhesNotas }
        : t
    )))
    fecharDetalhes()
  }

  // Hook para fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuAberto && menuRef.current && !menuRef.current.contains(target) && !menuBtnRef.current?.contains(target)) {
        fecharMenuOpcoes()
      }
      if (menuPrioridadeAberto && prioridadeMenuRef.current && !prioridadeMenuRef.current.contains(target) && !prioridadeBtnRef.current?.contains(target)) {
        fecharMenuPrioridade()
      }
      if (menuOrdenacaoAberto && ordenacaoMenuRef.current && !ordenacaoMenuRef.current.contains(target) && !ordenacaoBtnRef.current?.contains(target)) {
        fecharMenuOrdenacao()
      }
      if (loteAberto && loteRef.current && !loteRef.current.contains(target) && !loteBtnRef.current?.contains(target)) {
        const loteAjudaModal = document.querySelector('.lote-ajuda-modal')
        if (!loteAjudaModal || !loteAjudaModal.contains(target)) {
          fecharLote()
        }
      }
      if (localAberto && localRef.current && !localRef.current.contains(target) && !localBtnRef.current?.contains(target)) {
        fecharLocal()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuAberto, menuPrioridadeAberto, menuOrdenacaoAberto, loteAberto, localAberto])




  // Sistema de Toast e Undo
  interface ToastAction {
    label: string
    onClick: () => void
  }

  const [toasts, setToasts] = useState<Array<{ id: number; type: string; title: string; message: string; actions: ToastAction[]; exiting?: boolean }>>([])
  interface UndoHistoryItem {
    action: string
    data: any
    timestamp: number
  }

  const [undoHistory, setUndoHistory] = useState<UndoHistoryItem[]>([])
  const toastIdCounter = useRef(0)

  const addToast = (type: string, title: string, message: string, actions: ToastAction[] = []) => {
    const id = toastIdCounter.current++
    const newToast = { id, type, title, message, actions }
    setToasts(prev => [...prev, newToast])

    // Auto-remove após 4 segundos
    setTimeout(() => {
      removeToast(id)
    }, 4000)

    return id
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }

  const addUndoAction = (action: string, data: any) => {
    setUndoHistory(prev => [...prev.slice(-9), { action, data, timestamp: Date.now() }])
  }

  const executeUndo = (action: string, data: any) => {
    if (action === 'delete') {
      // Restaurar tarefa deletada
      setTarefas(prev => [...prev, data.tarefa])
      addToast('success', 'Restaurado', `Tarefa "${data.tarefa.texto}" foi restaurada`)
    } else if (action === 'deleteMultiple') {
      // Restaurar múltiplas tarefas
      setTarefas(prev => [...prev, ...data.tarefas])
      addToast('success', 'Restaurado', `${data.tarefas.length} tarefas foram restauradas`)
    } else if (action === 'clearCompleted') {
      // Restaurar tarefas concluídas
      setTarefas(prev => [...prev, ...data.tarefas])
      addToast('success', 'Restaurado', `${data.tarefas.length} tarefas concluídas foram restauradas`)
    }
  }

  const aplicarPerfilAcessibilidade = (_perfil: string) => {
    setModoFoco(false)
    setAltoContraste(false)
    setReducaoMovimento(false)
    setEspacamentoAumentado(false)
    setFeedbackVisual(true)
  }

  // Persistência de tarefas
  useEffect(() => {
    localStorage.setItem('tarefas', JSON.stringify(tarefas))
  }, [tarefas])

  // Persistência de tema
  useEffect(() => {
    localStorage.setItem('temaEscuro', JSON.stringify(temaEscuro))
    document.body.classList.toggle('tema-escuro', temaEscuro)
    document.body.classList.toggle('tema-claro', !temaEscuro)
    document.documentElement.classList.toggle('tema-escuro', temaEscuro)
    document.documentElement.classList.toggle('tema-claro', !temaEscuro)
  }, [temaEscuro])

  // Persistência de preferência de confete
  useEffect(() => {
    localStorage.setItem('confeteAtivo', JSON.stringify(confeteAtivo))
  }, [confeteAtivo])
  useEffect(() => {
    localStorage.setItem('coresPrioridadeAtivas', JSON.stringify(coresPrioridadeAtivas))
    document.body.classList.toggle('cores-prioridade-desligadas', !coresPrioridadeAtivas)
  }, [coresPrioridadeAtivas])
  useEffect(() => {
    localStorage.setItem('barraPorcentagemAtiva', JSON.stringify(barraPorcentagemAtiva))
  }, [barraPorcentagemAtiva])
  useEffect(() => {
    localStorage.setItem('acoesRapidasAtivas', JSON.stringify(acoesRapidasAtivas))
  }, [acoesRapidasAtivas])
  useEffect(() => {
    localStorage.setItem('buscaBarAtiva', JSON.stringify(buscaBarAtiva))
  }, [buscaBarAtiva])
  useEffect(() => {
    localStorage.setItem('ordenacaoAtiva', JSON.stringify(ordenacaoAtiva))
  }, [ordenacaoAtiva])

  useEffect(() => {
    localStorage.setItem('dragAtivo', JSON.stringify(dragAtivo))
  }, [dragAtivo])
  useEffect(() => {
    localStorage.setItem('modoFoco', JSON.stringify(modoFoco))
    document.body.classList.toggle('modo-foco', modoFoco)
  }, [modoFoco])
  useEffect(() => {
    try { localStorage.setItem('focoVisivel', JSON.stringify(focoVisivel)) } catch { }
    document.body.classList.toggle('foco-visivel-forte', focoVisivel)
  }, [focoVisivel])
  useEffect(() => {
    localStorage.setItem('altoContraste', JSON.stringify(altoContraste))
    document.body.classList.toggle('alto-contraste', altoContraste)
  }, [altoContraste])
  useEffect(() => {
    localStorage.setItem('reducaoMovimento', JSON.stringify(reducaoMovimento))
    document.body.classList.toggle('reducao-movimento', reducaoMovimento)
  }, [reducaoMovimento])
  useEffect(() => {
    localStorage.setItem('espacamentoAumentado', JSON.stringify(espacamentoAumentado))
    document.body.classList.toggle('espacamento-aumentado', espacamentoAumentado)
  }, [espacamentoAumentado])

  useEffect(() => {
    localStorage.setItem('feedbackVisual', JSON.stringify(feedbackVisual))
  }, [feedbackVisual])
  useEffect(() => {
    localStorage.setItem('filtrosAtivos', JSON.stringify(filtrosAtivos))
  }, [filtrosAtivos])
  useEffect(() => {
    localStorage.setItem('catPadrao', catPadrao)
  }, [catPadrao])
  useEffect(() => {
    localStorage.setItem('prioridadeAtual', prioridade)
  }, [prioridade])


  useEffect(() => {
    if (menuPrioridadeAberto) {
      if (prioridadeContainerRef.current) (prioridadeContainerRef.current as HTMLDivElement).focus()
    }
  }, [menuPrioridadeAberto])

  // Parser inteligente para extrair categoria da linha
  const parseLinha = (linha: string, catPadrao: string = 'geral') => {
    const texto = linha.trim()
    if (!texto) return { textoFinal: '', categoriaFinal: catPadrao }
    const leading = texto.match(/^\s*(?:\[(?<cat>[^\]]+)\]|(?<cat2>[^:>\-|#]+))\s*[:>\-|]\s*(?<text>.+)$/)
    const trailing = texto.match(/^(?<text>.+?)\s+(?:[@#])(?<cat>[A-Za-zÀ-ÿ0-9_\- ]+)$/)
    const parens = texto.match(/^(?<text>.+?)\s*\((?<cat>[^)]+)\)$/)
    let textoFinal = texto
    let categoriaFinal = catPadrao
    if (leading && leading.groups) {
      textoFinal = leading.groups.text.trim()
      categoriaFinal = (leading.groups.cat || leading.groups.cat2 || catPadrao).trim()
    } else if (trailing && trailing.groups) {
      textoFinal = trailing.groups.text.trim()
      categoriaFinal = trailing.groups.cat.trim()
    } else if (parens && parens.groups) {
      textoFinal = parens.groups.text.trim()
      categoriaFinal = parens.groups.cat.trim()
    }
    return { textoFinal, categoriaFinal }
  }

  const normalizar = (s: string | undefined) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const buscaNorm = normalizar(busca.trim())

  const tarefasFiltradas = tarefas
    .filter((tarefa) => {
      if (filtro === 'pendentes') return !tarefa.concluida
      if (filtro === 'concluidas') return tarefa.concluida
      return true
    })
    .filter((tarefa) => {
      if (!buscaNorm) return true
      const hay = `${tarefa.texto || ''} ${tarefa.categoria || ''} ${tarefa.notas || ''}`
      return normalizar(hay).includes(buscaNorm)
    })

  const ordemPrioridade: Record<string, number> = { alta: 4, media: 3, baixa: 2, neutra: 1 }
  const ordenarTasks = (tasks: Tarefa[]) => {
    const arr = [...tasks]
    arr.sort((a, b) => {
      const oa = typeof a.ordem === 'number' ? a.ordem : 0
      const ob = typeof b.ordem === 'number' ? b.ordem : 0
      if (ordenacao === 'manual') return oa - ob
      if (ordenacao === 'prioridade') {
        const pa = ordemPrioridade[a.prioridade || 'neutra'] || 0
        const pb = ordemPrioridade[b.prioridade || 'neutra'] || 0
        if (pb !== pa) return pb - pa
        return oa - ob
      }
      if (ordenacao === 'prazo') {
        const da = a.prazo ? Date.parse(a.prazo) : Number.POSITIVE_INFINITY
        const db = b.prazo ? Date.parse(b.prazo) : Number.POSITIVE_INFINITY
        if (da !== db) return da - db
        return oa - ob
      }
      if (ordenacao === 'recentes') {
        const ca = typeof a.criadaEm === 'number' ? a.criadaEm : 0
        const cb = typeof b.criadaEm === 'number' ? b.criadaEm : 0
        if (cb !== ca) return cb - ca
        return oa - ob
      }
      if (ordenacao === 'antigas') {
        const ca = typeof a.criadaEm === 'number' ? a.criadaEm : 0
        const cb = typeof b.criadaEm === 'number' ? b.criadaEm : 0
        if (ca !== cb) return ca - cb
        return oa - ob
      }
      if (ordenacao === 'az') {
        const d = (a.texto || '').localeCompare(b.texto || '')
        if (d !== 0) return d
        return oa - ob
      }
      if (ordenacao === 'za') {
        const d = (b.texto || '').localeCompare(a.texto || '')
        if (d !== 0) return d
        return oa - ob
      }
      return 0
    })
    return arr
  }

  const grupos: Array<[string, Tarefa[]]> = (() => {
    const mapa = new Map<string, Tarefa[]>()
    tarefasFiltradas.forEach((t) => {
      const key = t.categoria && t.categoria.trim() ? t.categoria.trim() : 'geral'
      if (!mapa.has(key)) mapa.set(key, [])
      mapa.get(key)!.push(t)
    })
    const entries = Array.from(mapa.entries())
    return entries.map(([cat, tasks]) => [cat, ordenarTasks(tasks)])
  })()

  const pendentes = tarefas.filter(t => !t.concluida).length
  const concluidas = tarefas.filter(t => t.concluida).length
  const atrasadas = tarefas.filter(t => estaAtrasada(t)).length
  const progresso = tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0
  const tarefaDetalhes = detalhesId !== null ? tarefas.find((t) => t.id === detalhesId) : null

  // Show overdue notification once per session when there are overdue tasks
  useEffect(() => {
    if (overdueNotifShownRef.current) return
    if (atrasadas > 0) {
      overdueNotifShownRef.current = true
      const timer = setTimeout(() => setOverdueNotifVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [atrasadas])

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const handleDragStart = (event: any) => {
    setDraggedTaskId(String(event.active.id))
    document.body.classList.add('is-dragging')
    // Haptic feedback (vibração no mobile)
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const handleDragEnd = (event: any) => {
    mainContentRef.current?.scrollTo({ left: 0, top: mainContentRef.current.scrollTop, behavior: 'instant' })
    const { active, over } = event
    setDraggedTaskId(null)
    document.body.classList.remove('is-dragging')

    if (!over || active.id === over.id) return
    if (ordenacao !== 'manual') return
    if (!dragAtivo) return

    // Haptic feedback de sucesso
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30])
    }

    setTarefas((atual) => {
      const tarefaOrigem = atual.find((t) => t.id === active.id)
      const tarefaDestino = atual.find((t) => t.id === over.id)
      if (!tarefaOrigem || !tarefaDestino) return atual

      const normalizarCat = (c: string) => (c && c.trim() ? c.trim() : 'geral')
      const catOrigem = normalizarCat(tarefaOrigem.categoria || '')
      const catDestino = normalizarCat(tarefaDestino.categoria || '')

      // Só permite reordenar dentro da mesma categoria
      if (catOrigem !== catDestino) return atual

      // Pega todas as tarefas da categoria na ordem atual
      const tarefasCategoria = atual.filter((t) => normalizarCat(t.categoria || '') === catOrigem)
      const idsOrdenados = tarefasCategoria
        .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
        .map((t) => t.id)

      const oldIndex = idsOrdenados.indexOf(active.id)
      const newIndex = idsOrdenados.indexOf(over.id)

      if (oldIndex === -1 || newIndex === -1) return atual

      // Reordena os IDs
      const idsReordenados = arrayMove(idsOrdenados, oldIndex, newIndex)

      // Cria mapa com novas ordens
      const ordemPorId = new Map(idsReordenados.map((id, i) => [id, i]))

      // Atualiza apenas as tarefas da categoria afetada
      return atual.map((t) => {
        if (normalizarCat(t.categoria || '') !== catOrigem) return t
        if (!ordemPorId.has(t.id)) return t
        return { ...t, ordem: ordemPorId.get(t.id) }
      })
    })
  }

  const handleDragCancel = () => {
    mainContentRef.current?.scrollTo({ left: 0, top: mainContentRef.current.scrollTop, behavior: 'instant' })
    setDraggedTaskId(null)
    document.body.classList.remove('is-dragging')
  }

  const adicionarTarefa = () => {
    const textoLimpo = texto.trim()
    if (!textoLimpo) return
    const { textoFinal, categoriaFinal } = parseLinha(textoLimpo, catPadrao && catPadrao.trim() ? catPadrao.trim() : 'geral')
    if (!textoFinal) return
    const catKey = categoriaFinal && categoriaFinal.trim() ? categoriaFinal.trim() : 'geral'
    setTarefas((prev) => {
      const maxOrdem = prev.reduce((acc, t) => {
        const c = t.categoria && t.categoria.trim() ? t.categoria.trim() : 'geral'
        if (c !== catKey) return acc
        const o = typeof t.ordem === 'number' ? t.ordem : -1
        return Math.max(acc, o)
      }, -1)
      const novaTarefa: Tarefa = {
        id: Date.now().toString(),
        texto: textoFinal,
        concluida: false,
        prioridade: prioridade,
        categoria: catKey,
        criadaEm: Date.now(),
        prazo: '',
        notas: '',
        ordem: maxOrdem + 1,
      }
      return [...prev, novaTarefa]
    })
    setTexto('')
    setMenuPrioridadeAberto(false)
    tocarSom('add')
    verificarBadgeRapidez()
  }

  const adicionarLote = () => {
    const normalizado = loteTexto
      .replace(/\r/g, '')
      .replace(/\\n|\/n/gi, '\n')
    const linhas = normalizado.split('\n')
    let catAtual = catPadrao && catPadrao.trim() ? catPadrao.trim() : 'geral'
    const novas: Array<{
      id: number
      texto: string
      concluida: boolean
      prioridade: string
      categoria: string
      criadaEm: number
      prazo: string
      notas: string
    }> = []
    for (const bruta of linhas) {
      const linha = bruta.trim()
      if (!linha) continue
      const header = linha.match(/^\s*(?:[-–—]{2,})\s*(.+?)\s*(?:[-–—]{2,})\s*$/)
      const headerCategoria = linha.match(/^\s*(?:categoria|cat|grupo|secao|seção)\s*:\s*(.+)\s*$/i)
      const headerDoisPontos = linha.match(/^\s*(.+)\s*:\s*$/)
      const headerHash = linha.match(/^\s*#\s*(.+)\s*$/)
      const headerBrackets = linha.match(/^\s*\[(.+)\]\s*$/)
      if (header) {
        catAtual = header[1].trim()
        continue
      }
      if (headerCategoria) {
        catAtual = headerCategoria[1].trim()
        continue
      }
      if (headerDoisPontos) {
        catAtual = headerDoisPontos[1].trim()
        continue
      }
      if (headerHash) {
        catAtual = headerHash[1].trim()
        continue
      }
      if (headerBrackets) {
        catAtual = headerBrackets[1].trim()
        continue
      }
      // Formatos inteligentes:
      // 1) cozinha: tarefa | cozinha - tarefa | cozinha > tarefa | cozinha | tarefa
      const leading = linha.match(/^\s*(?:\[(?<cat>[^\]]+)\]|(?<cat2>[^:>\-|#]+))\s*[:>\-|]\s*(?<text>.+)$/)
      // 2) tarefa #cozinha | tarefa @cozinha
      const trailing = linha.match(/^(?<text>.+?)\s+(?:[@#])(?<cat>[A-Za-zÀ-ÿ0-9_\- ]+)$/)
      // 3) tarefa (cozinha)
      const parens = linha.match(/^(?<text>.+?)\s*\((?<cat>[^)]+)\)$/)
      let textoFinal = linha
      let categoriaFinal = catAtual
      if (leading && leading.groups) {
        textoFinal = leading.groups.text.trim()
        categoriaFinal = (leading.groups.cat || leading.groups.cat2 || catAtual).trim()
      } else if (trailing && trailing.groups) {
        textoFinal = trailing.groups.text.trim()
        categoriaFinal = trailing.groups.cat.trim()
      } else if (parens && parens.groups) {
        textoFinal = parens.groups.text.trim()
        categoriaFinal = parens.groups.cat.trim()
      }
      novas.push({
        id: Date.now() + Math.random(),
        texto: textoFinal,
        concluida: false,
        prioridade,
        categoria: categoriaFinal,
        criadaEm: Date.now(),
        prazo: '',
        notas: ''
      })
    }
    if (novas.length === 0) return
    setTarefas((prev) => {
      const normalizarCat = (c: string) => (c && c.trim() ? c.trim() : 'geral')
      const maxPorCat = new Map()
      for (const t of prev) {
        const cat = normalizarCat(t.categoria || '')
        const o = typeof t.ordem === 'number' ? t.ordem : -1
        maxPorCat.set(cat, Math.max(maxPorCat.get(cat) ?? -1, o))
      }
      const novasComOrdem = novas.map((t) => {
        const cat = normalizarCat(t.categoria)
        const next = (maxPorCat.get(cat) ?? -1) + 1
        maxPorCat.set(cat, next)
        return { ...t, id: t.id.toString(), categoria: cat, ordem: next }
      })
      return [...prev, ...novasComOrdem]
    })
    setLoteTexto('')
    fecharLote()
  }

  const copiarParaClipboard = async (textoParaCopiar: string) => {
    if (loteCopiadoTimeoutRef.current) {
      clearTimeout(loteCopiadoTimeoutRef.current)
      loteCopiadoTimeoutRef.current = null
    }

    try {
      await navigator.clipboard.writeText(textoParaCopiar)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = textoParaCopiar
      textarea.style.position = 'fixed'
      textarea.style.top = '0'
      textarea.style.left = '0'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setLoteCopiado(textoParaCopiar)
    loteCopiadoTimeoutRef.current = setTimeout(() => {
      setLoteCopiado(null)
      loteCopiadoTimeoutRef.current = null
    }, 900)
  }

  const alternarConclusao = (id: string) => {
    const tarefa = tarefas.find(t => t.id === id)

    // 🎉 CONFETE QUANDO COMPLETA
    if (confeteAtivo && tarefa && !tarefa.concluida && !reducaoMovimento) {
      import('canvas-confetti').then(({ default: confetti }) => confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#9333ea', '#7e22ce', '#ffffff']
      }))
    }

    // ✨ FEEDBACK VISUAL para acessibilidade
    if (feedbackVisual && tarefa && !tarefa.concluida) {
      const flashElement = document.createElement('div')
      flashElement.className = 'feedback-flash'
      flashElement.textContent = '✓ Tarefa concluída!'
      document.body.appendChild(flashElement)
      setTimeout(() => flashElement.remove(), 2000)
    }

    // 🔥 ATUALIZA STREAK quando completa tarefa
    if (tarefa && !tarefa.concluida) {
      atualizarStreak()
      setTotalConcluidasHistorico(prev => {
        const jaContadas: string[] = JSON.parse(
          localStorage.getItem('tarefasContadasEvolutivo') || '[]'
        )
        return jaContadas.includes(tarefa.id) ? prev : prev + 1
      })
      tocarSom('check')

      // 🏆 BADGES: Incrementa contador de sessão e verifica noite produtiva
      setTarefasSessao(prev => prev + 1)

      // Badge "Noite Produtiva" - concluir tarefa entre 0h e 6h
      const hora = new Date().getHours()
      if (hora >= 0 && hora < 6) {
        const badge = userBadges.find(b => b.id === 'noite-produtiva')
        if (badge && !badge.desbloqueado) {
          desbloquearBadge('noite-produtiva')
        }
      }
      // Badge "Insone" - concluir tarefa entre 2h e 4h
      if (hora >= 2 && hora < 4) {
        const badge = userBadges.find(b => b.id === 'insone')
        if (badge && !badge.desbloqueado) {
          desbloquearBadge('insone')
        }
      }
    }

    setTarefas(prev => prev.map(tarefa =>
      tarefa.id === id
        ? { ...tarefa, concluida: !tarefa.concluida }
        : tarefa
    ))
  }

  const removerTarefa = (id: string) => {
    const tarefaRemovida = tarefas.find(t => t.id === id)
    if (!tarefaRemovida) return

    tocarSom('delete')
    setRemovendoId(id)

    // 🏆 Badge "Limpeza" - incrementa contador de tarefas removidas
    setTarefasRemovidas(prev => prev + 1)

    setTimeout(() => {
      setTarefas(prev => prev.filter(tarefa => tarefa.id !== id))
      setRemovendoId(null)

      // Adicionar toast com botão Undo
      addUndoAction('delete', { tarefa: tarefaRemovida })
      addToast(
        'success',
        t('app.toast.taskDeleted'),
        `"${tarefaRemovida.texto}" ${t('app.toast.taskDeletedSuffix')}`,
        [
          {
            label: t('app.toast.undo'),
            onClick: () => executeUndo('delete', { tarefa: tarefaRemovida })
          }
        ]
      )
    }, 300)
  }

  const limparConcluidas = () => {
    const tarefasConcluidas = tarefas.filter(t => t.concluida)
    setTarefas(prev => prev.filter(tarefa => !tarefa.concluida))

    // Adicionar toast com botão Undo
    if (tarefasConcluidas.length > 0) {
      addUndoAction('clearCompleted', { tarefas: tarefasConcluidas })
      addToast(
        'success',
        t('app.toast.tasksCleaned'),
        `${tarefasConcluidas.length} ${t('app.toast.taskDeletedSuffix')}`,
        [
          {
            label: t('app.toast.undo'),
            onClick: () => executeUndo('clearCompleted', { tarefas: tarefasConcluidas })
          }
        ]
      )
    }
  }

  const iniciarEdicao = (tarefa: Tarefa) => {
    setEditandoId(tarefa.id)
    setTextoEditando(tarefa.texto)
  }

  const salvarEdicao = (id: string) => {
    const textoLimpo = textoEditando.trim()
    if (!textoLimpo) {
      cancelarEdicao()
      return
    }

    setTarefas(prev => prev.map(tarefa =>
      tarefa.id === id
        ? { ...tarefa, texto: textoLimpo }
        : tarefa
    ))

    cancelarEdicao()
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setTextoEditando('')
  }

  const handleKeyPressAdicionar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      adicionarTarefa()
    }
  }

  const handleKeyPressEditar = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      salvarEdicao(id)
    } else if (e.key === 'Escape') {
      cancelarEdicao()
    }
  }

  const handlePrioridadeKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      fecharMenuPrioridade()
      return
    }
    if (!menuPrioridadeAberto && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setFocoPrioridadeIndex(prioridades.indexOf(prioridade))
      abrirMenuPrioridade()
      e.preventDefault()
      return
    }
    if (menuPrioridadeAberto) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocoPrioridadeIndex((i) => (i + 1) % prioridades.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocoPrioridadeIndex((i) => (i - 1 + prioridades.length) % prioridades.length)
      } else if (e.key === 'Enter') {
        const nova = prioridades[focoPrioridadeIndex]
        setPrioridade(nova)
        fecharMenuPrioridade()
      }
    }
  }

  const handleOrdenacaoKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') {
      fecharMenuOrdenacao()
      return
    }
    if (!menuOrdenacaoAberto && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      const idx = opcoesOrdenacao.findIndex((o) => o.value === ordenacao)
      setFocoOrdenacaoIndex(idx >= 0 ? idx : 0)
      abrirMenuOrdenacao()
      e.preventDefault()
      return
    }
    if (menuOrdenacaoAberto) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocoOrdenacaoIndex((i) => (i + 1) % opcoesOrdenacao.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocoOrdenacaoIndex((i) => (i - 1 + opcoesOrdenacao.length) % opcoesOrdenacao.length)
      } else if (e.key === 'Enter') {
        const escolha = opcoesOrdenacao[focoOrdenacaoIndex]?.value
        if (escolha) setOrdenacao(escolha)
        fecharMenuOrdenacao()
      }
    }
  }

  return (
    <>
      {badgeUnlockMsg && (
        <div
          className={`badge-unlock-popup popup-raridade-${badgeUnlockMsg.raridade}${badgeUnlockExiting ? ' badge-unlock-popup-exit' : ''}`}
          onAnimationEnd={() => {
            if (badgeUnlockExiting) {
              setBadgeUnlockMsg(null);
              setBadgeUnlockExiting(false);
            }
          }}
        >
          <div className="badge-unlock-shimmer" />
          <div className="badge-unlock-bg-glow" />
          <div className="badge-unlock-inner">
            <div className="badge-unlock-label">{t('app.badge.unlocked')}</div>
            <div className="badge-unlock-body">
              <div className="badge-unlock-icon-wrap">
                <div className="badge-unlock-icon-bg" />
                <span className="badge-unlock-icon" style={{ color: badgeUnlockMsg.cor }}>
                  {badgeUnlockMsg.icone ? <badgeUnlockMsg.icone size={34} /> : '🏅'}
                </span>
              </div>
              <div className="badge-unlock-texts">
                <div className="badge-unlock-nome">{badgeUnlockMsg.nome}</div>
                <div className={`badge-unlock-raridade badge-raridade-${badgeUnlockMsg.raridade}`}>{
                  badgeUnlockMsg.raridade === 'common' ? t('app.badge.common') :
                    badgeUnlockMsg.raridade === 'rare' ? t('app.badge.rare') :
                      badgeUnlockMsg.raridade === 'epic' ? t('app.badge.epic') :
                        badgeUnlockMsg.raridade === 'secret' ? t('app.badge.secret') :
                          badgeUnlockMsg.raridade === 'evolutivo' ? t('app.badge.special') : badgeUnlockMsg.raridade
                }</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de conquistas/badges */}
      {badgesModalAberto && (
        <Suspense fallback={null}>
          <BadgesGallery
            userBadges={userBadges}
            userStats={userStats}
            periodosUsados={periodosUsados}
            onShowCommunity={handleShowCommunity}
            onClose={() => setBadgesModalAberto(false)}
          />
        </Suspense>
      )}
      {/* Modal de seleção de temas */}
      {themeSelectorAberto && (
        <Suspense fallback={null}>
          <ThemeSelector
            temaAtual={temaVisual}
            nivelEvolutivo={nivelEvolutivo}
            onSelectTheme={(id) => { if (id === 'claro') { setTemaEscuro(false) } else { setTemaEscuro(true) }; setTemaVisual(id) }}
            onClose={() => setThemeSelectorAberto(false)}
          />
        </Suspense>
      )}
      {/* Camada de fundo do tema */}
      {temaVisual !== 'padrao' && temaVisual !== 'claro' && (
        <div
          className="theme-background-layer"
          style={{
            position: 'fixed',
            inset: 0,
            background: temaAtual.background.gradient,
            opacity: temaEscuro ? 1 : 0.5,
            pointerEvents: 'none',
            zIndex: -2,
            transition: 'background 0.5s ease, opacity 0.5s ease'
          }}
        />
      )}
      {/* Partículas de fundo - pode ser desativado nas config */}
      {particulasAtivas && (
        <Suspense fallback={null}>
          <BackgroundParticles temaEscuro={temaEscuro} themeParticles={temaAtual.particles} />
        </Suspense>
      )}

      {/* ── AURORA BACKGROUND ─────────────────────────────── */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* ── LAYOUT PRINCIPAL ──────────────────────────────── */}
      <div className="app-layout">
        <Sidebar
          onNavigate={(id) => {
            if (id === 'ajuda') {
              mainContentRef.current?.scrollTo(0, 0)
              setPaginaAtiva('ajuda')
              marcarAreaVisitada('ajuda')
              return
            }
            if (id === 'sobre') {
              mainContentRef.current?.scrollTo(0, 0)
              setPaginaAtiva('sobre')
              return
            }
            mainContentRef.current?.scrollTo(0, 0)
            setPaginaAtiva(id)
            if (id === 'badges') marcarAreaVisitada('badges')
            if (id === 'stats') marcarAreaVisitada('estatisticas')
            if (id === 'configuracoes') marcarAreaVisitada('configuracoes')
          }}
          activePage={paginaAtiva}
          streakDias={streakData.dias}
          streakAtivo={streakAtivo}
          logoCustom={logoCustom}
          onLogoClick={handleLogoClick}
          logoNeonColor={logoNeonColor}
          mobileOpen={mobileSidebarOpen}
          onMobileOpen={() => setMobileSidebarOpen(true)}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <main className={`main-content${paginaAtiva !== 'tarefas' ? ' overlay-open' : ''}`} ref={mainContentRef}>
          {overdueNotifVisible && atrasadas > 0 && (
            <div className="overdue-notif" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>
                {atrasadas !== 1
                  ? t('app.overdue.notifMany', { count: atrasadas })
                  : t('app.overdue.notif', { count: atrasadas })}
              </span>
              <button
                className="overdue-notif-close"
                onClick={() => setOverdueNotifVisible(false)}
                aria-label={t('app.overdue.dismiss')}
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className={`card${tarefasAnimClass ? ` ${tarefasAnimClass}` : ''}`} role="main">
            <div className="workspace-topbar">
              <div>
                <h1><ShimmerText>{t('app.title')}</ShimmerText></h1>
                <p className="workspace-date">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <button
                className="btn-profile"
                onClick={() => window.location.href = '/perfil'}
                aria-label="Abrir perfil"
              >
                {/* Pode exibir iniciais aqui enquanto não busca a foto */}
                <User size={16} />
              </button>
            </div>

            <div className="input-container">
              <div className="input-top">
                <input
                  ref={inputTarefaRef}
                  type="text"
                  placeholder={t('app.input.placeholder')}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={handleKeyPressAdicionar}
                />
                <button
                  className="btn-adicionar"
                  onClick={adicionarTarefa}
                  disabled={!texto.trim()}
                >
                  {t('app.input.add')}
                </button>
                {vozSuportada && vozAtiva && (
                  <button
                    type="button"
                    className={`btn-microfone ${vozOuvindo ? 'gravando' : ''}`}
                    onMouseDown={iniciarReconhecimentoVoz}
                    onMouseUp={pararReconhecimentoVoz}
                    onMouseLeave={pararReconhecimentoVoz}
                    onTouchStart={iniciarReconhecimentoVoz}
                    onTouchEnd={pararReconhecimentoVoz}
                    aria-pressed={vozOuvindo}
                    aria-label={t('app.input.micLabel')}
                    title={t('app.input.micLabel')}
                  >
                    <Mic size={18} />
                    <span>{vozOuvindo ? t('app.input.micRecording') : t('app.input.micHold')}</span>
                  </button>
                )}
              </div>
              <div className="input-extra">
                <div
                  className="prioridade-container"
                  ref={prioridadeContainerRef}
                  tabIndex={0}
                  aria-label={t('app.priority.ariaLabel')}
                  onKeyDown={handlePrioridadeKeyDown}
                >
                  <button
                    type="button"
                    ref={prioridadeBtnRef}
                    className={`btn-prioridade prioridade-${prioridade}`}
                    onClick={() => {
                      if (menuPrioridadeAberto) {
                        fecharMenuPrioridade()
                      } else {
                        setFocoPrioridadeIndex(prioridades.indexOf(prioridade))
                        fecharLote()
                        fecharLocal()
                        abrirMenuPrioridade()
                      }
                    }}
                    aria-haspopup="menu"
                    aria-expanded={menuPrioridadeAberto}
                    onKeyDown={handlePrioridadeKeyDown}
                  >
                    <span className="prioridade-label">
                      {prioridade === 'neutra' && (<><span className="prioridade-icon neutra" aria-hidden="true"><Circle fill="currentColor" stroke="none" /></span>{t('app.priority.neutral')}</>)}
                      {prioridade === 'baixa' && (<><span className="prioridade-icon baixa" aria-hidden="true"><Circle fill="currentColor" stroke="none" /></span>{t('app.priority.low')}</>)}
                      {prioridade === 'media' && (<><span className="prioridade-icon media" aria-hidden="true"><Circle fill="currentColor" stroke="none" /></span>{t('app.priority.medium')}</>)}
                      {prioridade === 'alta' && (<><span className="prioridade-icon alta" aria-hidden="true"><Circle fill="currentColor" stroke="none" /></span>{t('app.priority.high')}</>)}
                    </span>
                    <span className="prioridade-caret">▾</span>
                  </button>
                  {menuPrioridadeVisivel && (
                    <div
                      className={`prioridade-dropdown ${!menuPrioridadeAberto ? 'fechando' : ''}`}
                      role="menu"
                      ref={prioridadeMenuRef}
                    >
                      <button
                        role="menuitemradio"
                        aria-checked={prioridade === 'neutra'}
                        disabled={prioridade === 'neutra'}
                        className={`prioridade-item neutra ${prioridade === 'neutra' ? 'ativa' : ''} ${focoPrioridadeIndex === 0 ? 'foco' : ''}`}
                        onClick={() => { setPrioridade('neutra'); setMenuPrioridadeAberto(false) }}
                      >
                        <span className="prioridade-icon neutra" aria-hidden="true"><Circle fill="currentColor" stroke="none" /></span>
                        {t('app.priority.neutral')}
                      </button>
                      <button
                        role="menuitemradio"
                        aria-checked={prioridade === 'baixa'}
                        disabled={prioridade === 'baixa'}
                        className={`prioridade-item baixa ${prioridade === 'baixa' ? 'ativa' : ''} ${focoPrioridadeIndex === 1 ? 'foco' : ''}`}
                        onClick={() => { setPrioridade('baixa'); setMenuPrioridadeAberto(false) }}
                      >
                        <span className="prioridade-icon baixa" aria-hidden="true"><Circle fill="currentColor" stroke="none" /></span>
                        {t('app.priority.low')}
                      </button>
                      <button
                        role="menuitemradio"
                        aria-checked={prioridade === 'media'}
                        disabled={prioridade === 'media'}
                        className={`prioridade-item media ${prioridade === 'media' ? 'ativa' : ''} ${focoPrioridadeIndex === 2 ? 'foco' : ''}`}
                        onClick={() => { setPrioridade('media'); setMenuPrioridadeAberto(false) }}
                      >
                        <span className="prioridade-icon media" aria-hidden="true"><Circle fill="currentColor" stroke="none" /></span>
                        {t('app.priority.medium')}
                      </button>
                      <button
                        role="menuitemradio"
                        aria-checked={prioridade === 'alta'}
                        disabled={prioridade === 'alta'}
                        className={`prioridade-item alta ${prioridade === 'alta' ? 'ativa' : ''} ${focoPrioridadeIndex === 3 ? 'foco' : ''}`}
                        onClick={() => { setPrioridade('alta'); setMenuPrioridadeAberto(false) }}
                      >
                        <span className="prioridade-icon alta" aria-hidden="true"><Circle fill="currentColor" stroke="none" /></span>
                        {t('app.priority.high')}
                      </button>
                    </div>
                  )}
                </div>
                <div className="local-container">
                  <button
                    type="button"
                    ref={localBtnRef}
                    className="btn-local"
                    onClick={() => {
                      if (localAberto) {
                        fecharLocal()
                      } else {
                        fecharMenuPrioridade()
                        fecharLote()
                        abrirLocal()
                      }
                    }}
                    onMouseDown={() => {
                      fecharMenuPrioridade()
                      fecharLote()
                    }}
                    aria-expanded={localAberto}
                    aria-controls="input-local"
                    title={t('app.input.localLabel')}
                  >
                    <Tag aria-hidden="true" />
                    {t('app.input.local')}
                  </button>
                  {localVisivel && (
                    <div
                      className={`local-dropdown ${!localAberto ? 'fechando' : ''}`}
                      role="dialog"
                      aria-label={t('app.input.localLabel')}
                      ref={localRef}
                    >
                      <label className="local-label" htmlFor="input-local">{t('app.input.localLabel')}</label>
                      <input
                        id="input-local"
                        type="text"
                        className="input-local"
                        placeholder={t('app.input.localPlaceholder')}
                        value={catPadrao}
                        onChange={(e) => setCatPadrao(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') fecharLocal()
                          if (e.key === 'Escape') fecharLocal()
                        }}
                        autoFocus
                      />
                      <div className="local-acoes">
                        <button className="btn-local-confirmar" onClick={fecharLocal}>{t('app.input.localApply')}</button>
                        <button className="btn-local-cancelar" onClick={fecharLocal}>{t('app.input.localClose')}</button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  ref={loteBtnRef}
                  className="btn-lote"
                  onClick={() => {
                    if (loteAberto) {
                      fecharLote()
                    } else {
                      fecharMenuPrioridade()
                      fecharLocal()
                      abrirLote()
                    }
                  }}
                  aria-expanded={loteAberto}
                >
                  <Layers aria-hidden="true" />
                  {t('app.input.batch')}
                </button>
              </div>
              {loteVisivel && (
                <div
                  ref={loteRef}
                  className={`lote-panel ${!loteAberto ? 'fechando' : ''}`}
                  tabIndex={-1}
                  onKeyDown={(e) => {
                    const target = e.target as HTMLElement
                    if (e.key === 'Escape') {
                      fecharLote()
                    } else if (e.key === 'Enter' && !e.shiftKey && target.tagName !== 'TEXTAREA') {
                      adicionarLote()
                    }
                  }}
                >
                  <textarea
                    className="lote-textarea"
                    rows={6}
                    placeholder={t('app.input.batchPlaceholder')}
                    value={loteTexto}
                    onChange={(e) => setLoteTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        fecharLote()
                        return
                      }
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        adicionarLote()
                      }
                    }}
                  />
                  <div className="lote-acoes">
                    <div className="lote-acoes-esq">
                      <button
                        type="button"
                        className="lote-ajuda-toggle"
                        onClick={() => setLoteAjudaAberta((v: boolean) => !v)}
                        aria-expanded={loteAjudaAberta}
                      >
                        {t('app.input.batchMiniGuide')}
                      </button>
                    </div>
                    <div className="lote-acoes-dir">
                      <button className="btn-lote-confirmar" onClick={adicionarLote} disabled={!loteTexto.trim()}>{t('app.input.batchAdd')}</button>
                      <button className="btn-lote-cancelar" onClick={fecharLote}>{t('app.input.batchClose')}</button>
                    </div>
                  </div>
                  {loteAjudaAberta && (
                    <div className="lote-ajuda lote-ajuda-modal">
                      <div className="lote-ajuda-header">
                        <div className="lote-ajuda-title">
                          <HelpCircle aria-hidden="true" />
                          {t('app.batchGuide.title')}
                        </div>
                        <div className="lote-ajuda-sub">{t('app.batchGuide.sub')}</div>
                      </div>

                      <div className="lote-guia-grid">
                        <div className="lote-guia-card">
                          <div className="lote-guia-card-top">
                            <div className="lote-guia-card-title">
                              <CornerDownLeft aria-hidden="true" />
                              {t('app.batchGuide.oneLine')}
                            </div>
                          </div>
                          <div className="lote-guia-card-desc">{t('app.batchGuide.oneLineDesc')}</div>
                          <div className="lote-guia-code">
                            <code>comprar leite</code>
                          </div>
                          <div className="lote-guia-actions">
                            <button className="lote-guia-btn" type="button" onClick={() => copiarParaClipboard('comprar leite')} aria-label="Copiar exemplo">
                              <Copy aria-hidden="true" />
                              <span className="lote-guia-btn-text">{loteCopiado === 'comprar leite' ? t('app.batchGuide.copied') : t('app.batchGuide.copy')}</span>
                            </button>
                          </div>
                        </div>

                        <div className="lote-guia-card">
                          <div className="lote-guia-card-top">
                            <div className="lote-guia-card-title">
                              <Hash aria-hidden="true" />
                              {t('app.batchGuide.tagCat')}
                            </div>
                          </div>
                          <div className="lote-guia-card-desc">{t('app.batchGuide.tagCatDesc')}</div>
                          <div className="lote-guia-code">
                            <code>arrumar a mesa #cozinha</code>
                          </div>
                          <div className="lote-guia-actions">
                            <button className="lote-guia-btn" type="button" onClick={() => copiarParaClipboard('arrumar a mesa #cozinha')} aria-label="Copiar exemplo">
                              <Copy aria-hidden="true" />
                              <span className="lote-guia-btn-text">{loteCopiado === 'arrumar a mesa #cozinha' ? t('app.batchGuide.copied') : t('app.batchGuide.copy')}</span>
                            </button>
                          </div>
                        </div>

                        <div className="lote-guia-card">
                          <div className="lote-guia-card-top">
                            <div className="lote-guia-card-title">
                              <Tag aria-hidden="true" />
                              {t('app.batchGuide.prefixCat')}
                            </div>
                          </div>
                          <div className="lote-guia-card-desc">{t('app.batchGuide.prefixCatDesc')}</div>
                          <div className="lote-guia-code">
                            <code>cozinha: fazer a janta</code>
                          </div>
                          <div className="lote-guia-actions">
                            <button className="lote-guia-btn" type="button" onClick={() => copiarParaClipboard('cozinha: fazer a janta')} aria-label="Copiar exemplo">
                              <Copy aria-hidden="true" />
                              <span className="lote-guia-btn-text">{loteCopiado === 'cozinha: fazer a janta' ? t('app.batchGuide.copied') : t('app.batchGuide.copy')}</span>
                            </button>
                          </div>
                        </div>

                        <div className="lote-guia-card">
                          <div className="lote-guia-card-top">
                            <div className="lote-guia-card-title">
                              <MapPin aria-hidden="true" />
                              {t('app.batchGuide.parenLoc')}
                            </div>
                          </div>
                          <div className="lote-guia-card-desc">{t('app.batchGuide.parenLocDesc')}</div>
                          <div className="lote-guia-code">
                            <code>varrer o chão (quarto)</code>
                          </div>
                          <div className="lote-guia-actions">
                            <button className="lote-guia-btn" type="button" onClick={() => copiarParaClipboard('varrer o chão (quarto)')} aria-label="Copiar exemplo">
                              <Copy aria-hidden="true" />
                              <span className="lote-guia-btn-text">{loteCopiado === 'varrer o chão (quarto)' ? t('app.batchGuide.copied') : t('app.batchGuide.copy')}</span>
                            </button>
                          </div>
                        </div>

                        <div className="lote-guia-card lote-guia-card-wide">
                          <div className="lote-guia-card-top">
                            <div className="lote-guia-card-title">
                              <Layers aria-hidden="true" />
                              {t('app.batchGuide.groupHeader')}
                            </div>
                          </div>
                          <div className="lote-guia-card-desc">{t('app.batchGuide.groupHeaderDesc')}</div>
                          <div className="lote-guia-code">
                            <code>-- sala --</code>
                          </div>
                          <div className="lote-guia-actions">
                            <button className="lote-guia-btn" type="button" onClick={() => copiarParaClipboard('-- sala --')} aria-label="Copiar exemplo">
                              <Copy aria-hidden="true" />
                              <span className="lote-guia-btn-text">{loteCopiado === '-- sala --' ? t('app.batchGuide.copied') : t('app.batchGuide.copy')}</span>
                            </button>
                          </div>

                          <div className="lote-guia-divider" />

                          <div className="lote-guia-alt-title">
                            <Brackets aria-hidden="true" />
                            {t('app.batchGuide.alternatives')}
                          </div>
                          <div className="lote-guia-alt">
                            {[
                              'sala:',
                              'categoria: sala',
                              '#sala',
                              '[sala]',
                            ].map((linha) => (
                              <span
                                key={linha}
                                className="lote-guia-pill"
                              >
                                {linha}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {tarefas.length > 0 ? (
              <div className="stats-container">
                <div className="contador">
                  {filtrosAtivos && (
                    <>
                      <span className="contador-pendente">{pendentes} {pendentes !== 1 ? t('app.stats.pendentes') : t('app.stats.pending')}</span>
                      <span className="contador-divisor">•</span>
                      <span className="contador-concluida">{concluidas} {concluidas !== 1 ? t('app.stats.donePlural') : t('app.stats.done')}</span>
                    </>
                  )}
                  {atrasadas > 0 && (
                    <span className="contador-atrasada" title={atrasadas !== 1 ? t('app.overdue.notifMany', { count: atrasadas }) : t('app.overdue.notif', { count: atrasadas })}>
                      <AlertCircle size={12} aria-hidden="true" />
                      {atrasadas} {atrasadas !== 1 ? t('app.overdue.many') : t('app.overdue.one')}
                    </span>
                  )}
                </div>
                {barraPorcentagemAtiva && (
                  <div className="barra-progresso-container">
                    <div className="barra-progresso">
                      <div className="barra-progresso-fill" style={{ width: `${progresso}%` }}>
                        <span className="barra-progresso-texto">{progresso}%</span>
                      </div>
                    </div>
                  </div>
                )}
                {acoesRapidasAtivas && (
                  <div className="limpar-container">
                    {concluidas > 0 && (
                      <button className="btn-limpar" onClick={() => setConfirmLimparAberto(true)}>
                        {t('app.actions.clearDone')}
                      </button>
                    )}
                    <button className="btn-remover-tudo" onClick={() => setConfirmRemoverAberto(true)}>
                      {t('app.actions.clearAll')}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
            <div className="controls">
              <div className="filtros">
                <PillNav
                  items={[
                    { value: 'todas', label: t('app.filters.all') },
                    { value: 'pendentes', label: t('app.filters.pending') },
                    { value: 'concluidas', label: t('app.filters.done') }
                  ]}
                  activeItem={filtro}
                  onItemClick={setFiltro}
                />
              </div>

              {(buscaBarAtiva || ordenacaoAtiva) && (
                <div
                  className={`tools-row ${buscaBarAtiva && ordenacaoAtiva ? 'dupla' : 'unica'}`}
                  role="region"
                  aria-label="Ferramentas"
                >
                  {buscaBarAtiva && (
                    <div className="tool-search">
                      <Search aria-hidden="true" />
                      <input
                        type="text"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder={t('app.actions.searchPlaceholder')}
                        aria-label={t('app.actions.searchLabel')}
                      />
                    </div>
                  )}
                  {ordenacaoAtiva && (
                    <div className="tool-sort">
                      <button
                        type="button"
                        ref={ordenacaoBtnRef}
                        className="btn-ordenacao"
                        aria-haspopup="menu"
                        aria-expanded={menuOrdenacaoAberto}
                        onKeyDown={handleOrdenacaoKeyDown}
                        onClick={(e) => {
                          if (menuOrdenacaoAberto) {
                            fecharMenuOrdenacao()
                            e.currentTarget.blur()
                            return
                          }
                          fecharMenuPrioridade()
                          fecharLote()
                          fecharLocal()
                          const idx = opcoesOrdenacao.findIndex((o) => o.value === ordenacao)
                          setFocoOrdenacaoIndex(idx >= 0 ? idx : 0)
                          abrirMenuOrdenacao()
                        }}
                      >
                        <ArrowUpDown aria-hidden="true" />
                        <span className="ordenacao-text">
                          {labelOrdenacaoCurto[ordenacao] || (opcoesOrdenacao.find((o) => o.value === ordenacao)?.label) || t('app.sort.label')}
                        </span>
                        <span className="ordenacao-caret">▾</span>
                      </button>
                      {menuOrdenacaoVisivel && (
                        <div
                          className={`ordenacao-dropdown ${!menuOrdenacaoAberto ? 'fechando' : ''}`}
                          role="menu"
                          ref={ordenacaoMenuRef}
                        >
                          {opcoesOrdenacao.map((opt, idx) => (
                            <button
                              key={opt.value}
                              role="menuitemradio"
                              aria-checked={ordenacao === opt.value}
                              disabled={ordenacao === opt.value}
                              className={`ordenacao-item ${ordenacao === opt.value ? 'ativa' : ''} ${focoOrdenacaoIndex === idx ? 'foco' : ''}`}
                              onClick={() => {
                                setOrdenacao(opt.value)
                                fecharMenuOrdenacao()
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <ul className="task-list">
                  {grupos.map(([cat, tasks]) => (
                    <Fragment key={`grupo-${cat || 'geral'}`}>
                      <li className="grupo-cabecalho"><span>{(cat || 'geral')}</span></li>
                      <SortableContext
                        items={tasks.map((t: Tarefa) => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {tasks.map((tarefa: Tarefa) => (
                          <TaskItem
                            key={tarefa.id}
                            tarefa={tarefa}
                            editandoId={editandoId}
                            textoEditando={textoEditando}
                            setTextoEditando={setTextoEditando}
                            removendoId={removendoId}
                            alternarConclusao={alternarConclusao}
                            iniciarEdicao={iniciarEdicao}
                            removerTarefa={removerTarefa}
                            salvarEdicao={salvarEdicao}
                            cancelarEdicao={cancelarEdicao}
                            handleKeyPressEditar={handleKeyPressEditar}
                            dragDisponivel={dragAtivo && ordenacao === 'manual'}
                            abrirDetalhes={abrirDetalhes}
                            isDragging={draggedTaskId === tarefa.id}
                          />
                        ))}
                      </SortableContext>
                    </Fragment>
                  ))}
                </ul>
              </DndContext>
              {tarefasFiltradas.length === 0 && (
                <div className="vazio-state">
                  <div className="vazio-state-icon" aria-hidden="true">
                    {filtro === 'pendentes' && <PartyPopper />}
                    {filtro === 'concluidas' && <CheckCircle2 />}
                    {filtro === 'todas' && <ListChecks />}
                  </div>
                  <p className="vazio-state-title">
                    {filtro === 'pendentes' && t('app.empty.noPending')}
                    {filtro === 'concluidas' && t('app.empty.noDone')}
                    {filtro === 'todas' && t('app.empty.noTasks')}
                  </p>
                  <p className="vazio-state-sub">
                    {filtro === 'pendentes' && t('app.empty.noPendingSub')}
                    {filtro === 'concluidas' && t('app.empty.noDoneSub')}
                    {filtro === 'todas' && t('app.empty.noTasksSub')}
                  </p>
                </div>
              )}
            </>
          </div>

          {/* ── PAGE OVERLAY ──────────────────────────────── */}
          <div
            className={`page-overlay${paginaAtiva !== 'tarefas' ? ' page-overlay-active' : ''}`}
            aria-hidden={paginaAtiva === 'tarefas'}
          >
            {/* Topbar da página */}
            <div className="page-overlay-topbar">
              <button
                className="page-overlay-back"
                onClick={() => setPaginaAtiva('tarefas')}
                aria-label="Voltar para tarefas"
              >
                <ChevronLeft size={16} />
                <span>{t('app.pages.tasks')}</span>
              </button>
              <span className="page-overlay-titulo">
                {paginaAtiva === 'stats' && t('app.pages.stats')}
                {paginaAtiva === 'temas' && t('app.pages.themes')}
                {paginaAtiva === 'configuracoes' && t('app.pages.settings')}
                {paginaAtiva === 'badges' && t('app.pages.badges')}
                {paginaAtiva === 'sobre' && t('app.pages.about')}
                {paginaAtiva === 'ajuda' && t('app.pages.help')}
              </span>
            </div>

            {/* Conteúdo da página */}
            <div className="page-overlay-body" ref={pageOverlayBodyRef}>
              {paginaAtiva === 'stats' && <Stats tarefas={tarefas} />}
              {paginaAtiva === 'badges' && (
                <Suspense fallback={null}>
                  <BadgesGallery
                    pageMode
                    userBadges={userBadges}
                    userStats={userStats}
                    periodosUsados={periodosUsados}
                    onShowCommunity={handleShowCommunity}
                    onClose={() => setPaginaAtiva('tarefas')}
                  />
                </Suspense>
              )}
              {paginaAtiva === 'temas' && (
                <Suspense fallback={null}>
                  <ThemeSelector
                    pageMode
                    temaAtual={temaVisual}
                    nivelEvolutivo={nivelEvolutivo}
                    onSelectTheme={(id) => { if (id === 'claro') { setTemaEscuro(false) } else { setTemaEscuro(true) }; setTemaVisual(id) }}
                    onClose={() => setPaginaAtiva('tarefas')}
                  />
                </Suspense>
              )}
              {paginaAtiva === 'configuracoes' && (
                <Suspense fallback={null}>
                  <SettingsModal
                    pageMode
                    confeteAtivo={confeteAtivo}
                    buscaBarAtiva={buscaBarAtiva}
                    ordenacaoAtiva={ordenacaoAtiva}
                    filtrosAtivos={filtrosAtivos}
                    barraPorcentagemAtiva={barraPorcentagemAtiva}
                    acoesRapidasAtivas={acoesRapidasAtivas}
                    dragAtivo={dragAtivo}
                    vozAtiva={vozAtiva}
                    streakAtivo={streakAtivo}
                    sonsAtivos={sonsAtivos}
                    particulasAtivas={particulasAtivas}
                    logoDesbloqueado={!!logoDesbloqueado}
                    logoCustom={logoCustom}
                    logoNeonColor={logoNeonColor}
                    handleLogoUpload={handleLogoUpload}
                    setLogoCustom={setLogoCustom}
                    setLogoNeonColor={setLogoNeonColor}
                    setConfeteAtivo={setConfeteAtivo}
                    setBuscaBarAtiva={setBuscaBarAtiva}
                    setOrdenacaoAtiva={setOrdenacaoAtiva}
                    setFiltrosAtivos={setFiltrosAtivos}
                    setFiltro={setFiltro}
                    setBarraPorcentagemAtiva={setBarraPorcentagemAtiva}
                    setAcoesRapidasAtivas={setAcoesRapidasAtivas}
                    setDragAtivo={setDragAtivo}
                    setVozAtiva={setVozAtiva}
                    setStreakAtivo={setStreakAtivo}
                    setSonsAtivos={setSonsAtivos}
                    setParticulasAtivas={setParticulasAtivas}
                    setModoFoco={setModoFoco}
                    setAltoContraste={setAltoContraste}
                    setReducaoMovimento={setReducaoMovimento}
                    setEspacamentoAumentado={setEspacamentoAumentado}
                    aplicarPerfilAcessibilidade={aplicarPerfilAcessibilidade}
                    onOpenGuia={() => { mainContentRef.current?.scrollTo(0, 0); setPaginaAtiva('ajuda'); marcarAreaVisitada('ajuda') }}
                    onLimparConcluidas={() => setConfirmLimparAberto(true)}
                    onRemoverTudo={() => setConfirmRemoverAberto(true)}
                    onClose={() => setPaginaAtiva('tarefas')}
                  />
                </Suspense>
              )}
              {paginaAtiva === 'sobre' && (
                <div className="sobre-panel">
                  {/* App brand */}
                  <div className="sobre-app-block">
                    <div className="sobre-app-logo">
                      <img src="/logoorbyt.png" alt="Orbyt" className="sobre-logoorbyt"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <span className="sobre-app-name-text">Orbyt</span>
                    </div>
                    <p className="sobre-tagline">{t('app.about.tagline')}</p>
                  </div>

                  <div className="sobre-divider" />

                  {/* Autor */}
                  <div className="sobre-autor-block">
                    <span className="sobre-autor-label">{t('app.about.madeBy')}</span>
                    <div className="sobre-autor-row">
                      <img src="/logo.png" alt="Logo" className="sobre-autor-logo" />
                      <span className="sobre-autor-nome">João V.</span>
                    </div>
                    <div className="sobre-links">
                      <a
                        href="https://www.linkedin.com/in/joaov-bds/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sobre-link sobre-link-linkedin"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        LinkedIn
                      </a>
                      <a
                        href="https://github.com/raaywasdead"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sobre-link sobre-link-github"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {paginaAtiva === 'ajuda' && (
                <div className="guia-content">
                  {/* Seção: Começando */}
                  <div className="guia-section">
                    <div className="guia-section-header">
                      <Play size={16} className="guia-section-icon-svg" />
                      <span className="guia-section-title">{t('app.guide.getting')}</span>
                    </div>
                    <div className="guia-cards">
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><Plus size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.createTask')}</strong>
                          <span>{t('app.guide.createTaskDesc')}</span>
                        </div>
                      </div>
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><CheckCircle2 size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.completeTask')}</strong>
                          <span>{t('app.guide.completeTaskDesc')}</span>
                        </div>
                      </div>
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><Pencil size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.editTask')}</strong>
                          <span>{t('app.guide.editTaskDesc')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção: Organização */}
                  <div className="guia-section">
                    <div className="guia-section-header">
                      <FolderOpen size={16} className="guia-section-icon-svg" />
                      <span className="guia-section-title">{t('app.guide.organization')}</span>
                    </div>
                    <div className="guia-cards">
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><Tag size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.categories')}</strong>
                          <span>{t('app.guide.categoriesDesc')}</span>
                        </div>
                      </div>
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><Flag size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.priorities')}</strong>
                          <span>{t('app.guide.prioritiesDesc')}</span>
                        </div>
                      </div>
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><ListChecks size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.bulkInput')}</strong>
                          <span>{t('app.guide.bulkInputDesc')}</span>
                        </div>
                      </div>
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><GripVertical size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.reorder')}</strong>
                          <span>{t('app.guide.reorderDesc')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção: Personalização */}
                  <div className="guia-section">
                    <div className="guia-section-header">
                      <Palette size={16} className="guia-section-icon-svg" />
                      <span className="guia-section-title">{t('app.guide.customization')}</span>
                    </div>
                    <div className="guia-cards">
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><Sparkles size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.themes')}</strong>
                          <span>{t('app.guide.themesDesc')}</span>
                        </div>
                      </div>
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><Image size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.customLogo')}</strong>
                          <span>{t('app.guide.customLogoDesc')}</span>
                        </div>
                      </div>
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><Accessibility size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.accessibility')}</strong>
                          <span>{t('app.guide.accessibilityDesc')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção: Recursos */}
                  <div className="guia-section">
                    <div className="guia-section-header">
                      <Zap size={16} className="guia-section-icon-svg" />
                      <span className="guia-section-title">{t('app.guide.features')}</span>
                    </div>
                    <div className="guia-cards">
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><Award size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.achievements')}</strong>
                          <span>{t('app.guide.achievementsDesc')}</span>
                        </div>
                      </div>
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><BarChart3 size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.statistics')}</strong>
                          <span>{t('app.guide.statisticsDesc')}</span>
                        </div>
                      </div>
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><Target size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.dailyGoal')}</strong>
                          <span>{t('app.guide.dailyGoalDesc')}</span>
                        </div>
                      </div>
                      <div className="guia-card">
                        <div className="guia-card-icon-wrapper"><PartyPopper size={18} /></div>
                        <div className="guia-card-content">
                          <strong>{t('app.guide.animations')}</strong>
                          <span>{t('app.guide.animationsDesc')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção: Atalhos */}
                  <div className="guia-section">
                    <div className="guia-section-header">
                      <Command size={16} className="guia-section-icon-svg" />
                      <span className="guia-section-title">{t('app.guide.shortcuts')}</span>
                    </div>
                    <div className="guia-shortcuts">
                      <div className="guia-shortcut">
                        <kbd>Enter</kbd>
                        <span>{t('app.guide.shortcutAdd')}</span>
                      </div>
                      <div className="guia-shortcut">
                        <kbd>Esc</kbd>
                        <span>{t('app.guide.shortcutCancel')}</span>
                      </div>
                      <div className="guia-shortcut">
                        <kbd>Ctrl</kbd> + <kbd>V</kbd>
                        <span>{t('app.guide.shortcutPaste')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Nota informativa */}
                  <div className="guia-tip">
                    <Info size={18} className="guia-tip-icon-svg" />
                    <span className="guia-tip-text">
                      <strong>{t('app.guide.noteImportant')}</strong> {t('app.guide.saveNote')}
                    </span>
                  </div>
                </div>
              )}
              {/* Seção: Links úteis */}
              <div className="guia-section">
                <div className="guia-section-header">
                  <HelpCircle size={16} className="guia-section-icon-svg" />
                  <span className="guia-section-title">{t('app.guide.moreInfo')}</span>
                </div>
                <div className="guia-links">
                  <a href="/faq" target="_blank" rel="noopener noreferrer" className="guia-link-btn">
                    <HelpCircle size={16} /> FAQ
                  </a>
                  <a href="/contato" target="_blank" rel="noopener noreferrer" className="guia-link-btn">
                    <CornerDownLeft size={16} /> {t('app.guide.contact')}
                  </a>
                  <a href="/termos" target="_blank" rel="noopener noreferrer" className="guia-link-btn">
                    <FileText size={16} /> {t('app.guide.terms')}
                  </a>
                  <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="guia-link-btn">
                    <FileText size={16} /> {t('app.guide.privacy')}
                  </a>
                </div>
              </div>
            </div>{/* fim page-overlay-body */}
          </div>{/* fim page-overlay */}
        </main>
      </div>
      {/* ── FIM DO APP-LAYOUT ─────────────────────────────── */}

      {detalhesAberto && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('app.details.ariaLabel')}>
          <div className="modal">
            <div className="modal-header">
              <h2>{t('app.details.title')}</h2>
              <button className="modal-close" onClick={fecharDetalhes} aria-label={t('app.details.closeLabel')}><X /></button>
            </div>
            <div className="modal-body modal-form">
              <div className="details-top">
                <div className="details-title">{tarefaDetalhes?.texto || t('app.details.taskFallback')}</div>
                <div className="details-sub">{tarefaDetalhes?.categoria ? `${t('app.details.categoryPrefix')}${tarefaDetalhes.categoria}` : t('app.details.noCategory')}</div>
              </div>

              <label className="details-label" htmlFor="details-prazo">
                <CalendarDays aria-hidden="true" />
                {t('app.details.deadline')}
              </label>
              <div className="details-date">
                <input
                  ref={detalhesDateTextRef}
                  id="details-prazo"
                  className="details-input details-date-text"
                  type="text"
                  inputMode="numeric"
                  placeholder={t('app.details.datePlaceholder')}
                  value={detalhesPrazoTexto}
                  onChange={(e) => {
                    const raw = e.target.value
                    const caret = e.target.selectionStart ?? raw.length
                    const digitsBeforeRaw = raw.slice(0, caret).replace(/[^\d]/g, '').length
                    const digits = raw.replace(/[^\d]/g, '').slice(0, 8)
                    const digitsBefore = Math.min(digitsBeforeRaw, digits.length)

                    let formatted = digits
                    if (digits.length > 4) {
                      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
                    } else if (digits.length > 2) {
                      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
                    }

                    setDetalhesPrazoTexto(formatted)
                    setDetalhesPrazo(parseParaISO(formatted))

                    requestAnimationFrame(() => {
                      const el = detalhesDateTextRef.current
                      if (!el) return
                      let pos = digitsBefore
                      if (pos > 2) pos += 1
                      if (pos > 4) pos += 1
                      pos = Math.min(pos, formatted.length)
                      el.setSelectionRange(pos, pos)
                    })
                  }}
                  onBlur={() => {
                    const iso = parseParaISO(detalhesPrazoTexto)
                    if (!iso) return
                    setDetalhesPrazoTexto(formatISOParaBR(iso))
                    setDetalhesPrazo(iso)
                  }}
                />
                <button
                  type="button"
                  className="details-date-btn"
                  aria-label={t('app.details.calendarLabel')}
                  onClick={() => {
                    const el = detalhesDateNativeRef.current
                    if (!el) return
                    if (typeof el.showPicker === 'function') {
                      el.showPicker()
                      return
                    }
                    el.focus()
                    el.click()
                  }}
                >
                  <CalendarDays aria-hidden="true" />
                </button>
                <input
                  ref={detalhesDateNativeRef}
                  className="details-date-native"
                  type="date"
                  value={detalhesPrazo}
                  onChange={(e) => {
                    const iso = e.target.value
                    setDetalhesPrazo(iso)
                    setDetalhesPrazoTexto(formatISOParaBR(iso))
                  }}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>

              <label className="details-label" htmlFor="details-notas">
                <FileText aria-hidden="true" />
                {t('app.details.notes')}
              </label>
              <textarea
                id="details-notas"
                className="details-textarea"
                rows={5}
                placeholder={t('app.details.notesPlaceholder')}
                value={detalhesNotas}
                onChange={(e) => setDetalhesNotas(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={fecharDetalhes}>{t('app.modal.cancel')}</button>
              <button className="btn-modal-ok" onClick={salvarDetalhes}>{t('app.modal.save')}</button>
            </div>
          </div>
        </div>
      )}

      {statsModalVisivel && (
        <div className={`modal-overlay ${!statsModalAberto ? 'fechando' : ''}`} role="dialog" aria-modal="true" aria-label={t('app.details.statsTitle')}>
          <div className={`modal stats-modal ${!statsModalAberto ? 'fechando' : ''}`}>
            <div className="modal-header">
              <h2>{t('app.details.statsTitle')}</h2>
              <button className="modal-close" onClick={fecharStatsModal} aria-label={t('app.details.statsCloseLabel')}><X /></button>
            </div>
            <div className="modal-body">
              <Stats tarefas={tarefas} />
            </div>
          </div>
        </div>
      )}

      {confirmLimparAberto && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('app.modal.clearDone.title')}>
          <div className="modal modal-confirm">
            <div className="modal-header">
              <h2>{t('app.modal.clearDone.title')}</h2>
              <button className="modal-close" onClick={() => setConfirmLimparAberto(false)} aria-label={t('app.modal.cancel')}><X /></button>
            </div>
            <div className="modal-body">
              <p>{t('app.modal.clearDone.body')}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setConfirmLimparAberto(false)}>{t('app.modal.cancel')}</button>
              <button
                className="btn-modal-ok"
                onClick={() => {
                  limparConcluidas()
                  setConfirmLimparAberto(false)
                }}
              >
                {t('app.modal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmRemoverAberto && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('app.modal.removeAll.title')}>
          <div className="modal modal-confirm">
            <div className="modal-header">
              <h2>{t('app.modal.removeAll.title')}</h2>
              <button className="modal-close" onClick={() => setConfirmRemoverAberto(false)} aria-label={t('app.modal.cancel')}><X /></button>
            </div>
            <div className="modal-body">
              <p>{t('app.modal.removeAll.body')}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setConfirmRemoverAberto(false)}>{t('app.modal.cancel')}</button>
              <button
                className="btn-modal-ok"
                onClick={() => {
                  setTarefas([])
                  setEditandoId(null)
                  setTextoEditando('')
                  setRemovendoId(null)
                  setConfirmRemoverAberto(false)
                }}
              >
                {t('app.modal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {menuVisivel && (
        <Suspense fallback={null}>
          <SettingsModal
            confeteAtivo={confeteAtivo}
            buscaBarAtiva={buscaBarAtiva}
            ordenacaoAtiva={ordenacaoAtiva}
            filtrosAtivos={filtrosAtivos}
            barraPorcentagemAtiva={barraPorcentagemAtiva}
            acoesRapidasAtivas={acoesRapidasAtivas}
            dragAtivo={dragAtivo}
            vozAtiva={vozAtiva}
            streakAtivo={streakAtivo}
            sonsAtivos={sonsAtivos}
            particulasAtivas={particulasAtivas}
            logoDesbloqueado={!!logoDesbloqueado}
            logoCustom={logoCustom}
            logoNeonColor={logoNeonColor}
            handleLogoUpload={handleLogoUpload}
            setLogoCustom={setLogoCustom}
            setLogoNeonColor={setLogoNeonColor}
            setConfeteAtivo={setConfeteAtivo}
            setBuscaBarAtiva={setBuscaBarAtiva}
            setOrdenacaoAtiva={setOrdenacaoAtiva}
            setFiltrosAtivos={setFiltrosAtivos}
            setFiltro={setFiltro}
            setBarraPorcentagemAtiva={setBarraPorcentagemAtiva}
            setAcoesRapidasAtivas={setAcoesRapidasAtivas}
            setDragAtivo={setDragAtivo}
            setVozAtiva={setVozAtiva}
            setStreakAtivo={setStreakAtivo}
            setSonsAtivos={setSonsAtivos}
            setParticulasAtivas={setParticulasAtivas}
            setModoFoco={setModoFoco}
            setAltoContraste={setAltoContraste}
            setReducaoMovimento={setReducaoMovimento}
            setEspacamentoAumentado={setEspacamentoAumentado}
            aplicarPerfilAcessibilidade={aplicarPerfilAcessibilidade}
            onOpenGuia={() => { mainContentRef.current?.scrollTo(0, 0); setPaginaAtiva('ajuda'); marcarAreaVisitada('ajuda'); fecharMenuOpcoes() }}
            onLimparConcluidas={() => { setConfirmLimparAberto(true); fecharMenuOpcoes() }}
            onRemoverTudo={() => { setConfirmRemoverAberto(true); fecharMenuOpcoes() }}
            onClose={fecharMenuOpcoes}
          />
        </Suspense>
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}
          >
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle2 />}
              {toast.type === 'error' && <X />}
              {toast.type === 'warning' && <Sparkles />}
              {toast.type === 'info' && <Lightbulb />}
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>
            {toast.actions && toast.actions.length > 0 && (
              <div className="toast-actions">
                {toast.actions.map((action, idx) => (
                  <button
                    key={idx}
                    className="toast-btn"
                    onClick={() => {
                      action.onClick()
                      removeToast(toast.id)
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            <button
              className="toast-btn-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Fechar notificação"
            >
              <X />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

interface TaskItemProps {
  tarefa: Tarefa
  editandoId: string | null
  textoEditando: string
  setTextoEditando: (texto: string) => void
  removendoId: string | null
  alternarConclusao: (id: string) => void
  iniciarEdicao: (tarefa: Tarefa) => void
  removerTarefa: (id: string) => void
  salvarEdicao: (id: string) => void
  cancelarEdicao: () => void
  handleKeyPressEditar: (e: React.KeyboardEvent<HTMLInputElement>, id: string) => void
  dragDisponivel: boolean
  abrirDetalhes: (tarefa: Tarefa) => void
  isDragging: boolean
}

function TaskItem({
  tarefa,
  editandoId,
  textoEditando,
  setTextoEditando,
  removendoId,
  alternarConclusao,
  iniciarEdicao,
  removerTarefa,
  salvarEdicao,
  cancelarEdicao,
  handleKeyPressEditar,
  dragDisponivel,
  abrirDetalhes,
  isDragging,
}: TaskItemProps) {
  const isEditing = editandoId === tarefa.id

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dndIsDragging,
  } = useSortable({ id: tarefa.id, disabled: !dragDisponivel })

  const clampedTransform = transform ? { ...transform, x: 0 } : transform

  const style = {
    transform: CSS.Transform.toString(clampedTransform),
    transition: dndIsDragging ? 'none' : undefined,
    opacity: 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`
        ${tarefa.concluida ? 'concluida' : ''}
        prioridade-${tarefa.prioridade || 'media'}
        ${removendoId === tarefa.id ? 'removing' : ''}
        ${isDragging ? 'dragging' : ''}
        ${dndIsDragging ? 'is-dragging' : ''}
      `.trim()}
      tabIndex={0}
      onClick={(e) => {
        if (!isEditing) {
          alternarConclusao(tarefa.id)
          // Remove o foco para permitir hover imediatamente
          e.currentTarget.blur()
        }
      }}
      onKeyDown={(e) => {
        if (isEditing) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          alternarConclusao(tarefa.id)
          // Remove o foco para permitir hover imediatamente
          e.currentTarget.blur()
        }
      }}
    >
      {isEditing ? (
        <TaskEditMode
          texto={textoEditando}
          onTextoChange={setTextoEditando}
          onSalvar={() => salvarEdicao(tarefa.id)}
          onCancelar={cancelarEdicao}
          onKeyPress={(e) => handleKeyPressEditar(e, tarefa.id)}
        />
      ) : (
        <TaskViewMode
          tarefa={tarefa}
          onEdit={() => iniciarEdicao(tarefa)}
          onDelete={() => removerTarefa(tarefa.id)}
          onDetails={() => abrirDetalhes(tarefa)}
          dragAtivo={dragDisponivel}
          dragAttributes={dragDisponivel ? attributes : undefined}
          dragListeners={dragDisponivel ? listeners : undefined}
        />
      )}
    </li>
  )
}

interface TaskViewModeProps {
  tarefa: Tarefa
  onEdit: () => void
  onDelete: () => void
  onDetails: () => void
  dragAtivo: boolean
  dragAttributes?: DraggableAttributes
  dragListeners?: DraggableSyntheticListeners
}

function TaskViewMode({ tarefa, onEdit, onDelete, onDetails, dragAtivo, dragAttributes, dragListeners }: TaskViewModeProps) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [menuFechando, setMenuFechando] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const dragDisponivel = !!dragListeners
  const dragAttrs: DraggableAttributes | undefined = dragDisponivel ? dragAttributes : undefined
  const dragList: DraggableSyntheticListeners | undefined = dragDisponivel ? dragListeners : undefined

  const formatarPrazo = (iso: string) => {
    if (!iso) return ''
    const parts = iso.split('-')
    if (parts.length !== 3) return iso
    const [y, m, d] = parts
    if (!y || !m || !d) return iso
    return `${d}/${m}/${y}`
  }

  const overdueTask = estaAtrasada(tarefa)

  const resumoNota = (texto: string) => {
    const t = (texto || '').trim().replace(/\s+/g, ' ')
    if (!t) return ''
    return t.length > 28 ? `${t.slice(0, 28)}…` : t
  }

  const fecharMenu = () => {
    setMenuFechando(true)
    setTimeout(() => {
      setMenuAberto(false)
      setMenuFechando(false)
    }, 200)
  }

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuAberto && menuRef.current && !menuRef.current.contains(target) && btnRef.current && !btnRef.current.contains(target)) {
        fecharMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuAberto])

  return (
    <div className="task-view">
      <button
        className="task-toggle"
        type="button"
      >
        <span className="task-checkbox">
          {tarefa.concluida && <Check aria-hidden="true" />}
        </span>
        <span className="task-main">
          <span className="task-text">{tarefa.texto}</span>
          {(tarefa.prazo || tarefa.notas) && (
            <span className="task-meta" aria-label="Detalhes da tarefa">
              {tarefa.prazo && (
                <span className={`task-meta-chip${overdueTask ? ' task-meta-chip--overdue' : ''}`}>
                  {overdueTask ? <AlertCircle size={12} aria-hidden="true" /> : <CalendarDays aria-hidden="true" />}
                  {formatarPrazo(tarefa.prazo)}
                  {overdueTask && <span className="task-overdue-badge">!</span>}
                </span>
              )}
              {tarefa.notas && (
                <span className="task-meta-chip">
                  <FileText aria-hidden="true" />
                  {resumoNota(tarefa.notas) || 'Nota'}
                </span>
              )}
            </span>
          )}
        </span>
      </button>

      <div className="task-actions">
        <span className={`task-prio-tag prio-tag-${tarefa.prioridade || 'media'}`}>
          ● {tarefa.prioridade === 'alta' ? 'Alta' : tarefa.prioridade === 'media' ? 'Média' : tarefa.prioridade === 'baixa' ? 'Baixa' : 'Neutra'}
        </span>
        <div className="task-menu-container">
          <button
            ref={btnRef}
            type="button"
            className="btn-task-menu"
            onClick={(e) => {
              e.stopPropagation()
              if (menuAberto) {
                fecharMenu()
              } else {
                setMenuAberto(true)
              }
            }}
            aria-label="Menu de ações"
            aria-expanded={menuAberto}
          >
            <Menu aria-hidden="true" />
          </button>
          {(menuAberto || menuFechando) && (
            <div ref={menuRef} className={`task-dropdown-menu ${menuFechando ? 'closing' : 'opening'}`}>
              {dragAtivo && (
                <button
                  type="button"
                  className={`task-menu-item drag-item ${!dragDisponivel ? 'disabled' : ''}`}
                  disabled={!dragDisponivel}
                  {...(dragAttrs || {})}
                  {...(dragList || {})}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={dragDisponivel ? 'Arrastar tarefa' : 'Arrastar disponível apenas em Manual'}
                >
                  <GripVertical aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="task-menu-item btn-detalhes"
                onClick={(e) => {
                  e.stopPropagation()
                  onDetails()
                  fecharMenu()
                }}
              >
                <FileText aria-hidden="true" />
                <span>Detalhes</span>
              </button>
              <button
                type="button"
                className="task-menu-item btn-editar-menu"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                  fecharMenu()
                }}
              >
                <Pencil aria-hidden="true" />
                <span>Editar</span>
              </button>
              <button
                type="button"
                className="task-menu-item danger"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                  fecharMenu()
                }}
              >
                <Trash2 aria-hidden="true" />
                <span>Remover</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface TaskEditModeProps {
  texto: string
  onTextoChange: (texto: string) => void
  onSalvar: () => void
  onCancelar: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

function TaskEditMode({ texto, onTextoChange, onSalvar, onCancelar, onKeyPress }: TaskEditModeProps) {
  return (
    <div className="task-edit">
      <input
        type="text"
        className="input-edicao"
        value={texto}
        onChange={(e) => onTextoChange(e.target.value)}
        onKeyDown={onKeyPress}
        autoFocus
      />
      <div className="task-actions">
        <button
          className="btn-salvar"
          onClick={onSalvar}
          aria-label="Salvar alterações"
        >
          <Check aria-hidden="true" />
        </button>
        <button
          className="btn-cancelar"
          onClick={onCancelar}
          aria-label="Cancelar edição"
        >
          <X aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default App