import { FaMedal, FaTrophy, FaStar, FaCrown, FaUserFriends, FaPuzzlePiece, FaMicrophone, FaPalette, FaMoon, FaTrash, FaLightbulb, FaChartLine, FaBullseye, FaPenFancy, FaRocket, FaGem, FaAward } from 'react-icons/fa';
import { GiAchievement, GiLaurelsTrophy, GiLaurelCrown, GiNightSleep, GiProgression, GiNotebook, GiDiamondTrophy, GiPodiumWinner, GiSecretBook } from 'react-icons/gi';

export interface Badge {
  id: string;
  nome: string;
  descricao: string;
  icone: React.ComponentType<any>;
  cor: string;
  tipo: string;
  desbloqueado?: boolean;
  niveis?: number[];
  progressoAtual?: number;
  nivelAtual?: number;
  coresNiveis?: string[];
  nomesNiveis?: string[];
}

// Dados dos badges inovadores
export const BADGES: Badge[] = [
  {
    id: 'primeira-tarefa',
    nome: 'Primeira Tarefa',
    descricao: 'Conclua sua primeira tarefa para desbloquear. (Desbloqueia um tema extra!)',
    icone: FaMedal,
    cor: '#a855f7',
    tipo: 'common',
  },
  {
    id: 'maratona',
    nome: 'Maratona',
    descricao: 'Conclua tarefas por 7 dias seguidos. (Desbloqueia estatísticas avançadas!)',
    icone: FaRocket,
    cor: '#f59e42',
    tipo: 'epic',
  },
  {
    id: 'secreto',
    nome: 'Secreto',
    descricao: 'Quem persistir no centro, encontrará... 🤫',
    icone: GiSecretBook,
    cor: '#6366f1',
    tipo: 'secret',
  },
  {
    id: 'evolutivo',
    nome: 'Evolutivo',
    descricao: 'Complete 5, 25, 50, 75, 100 e 200 tarefas para evoluir este badge especial e desbloquear temas exclusivos!',
    icone: GiProgression,
    cor: '#e11d48',
    tipo: 'evolutivo',
    niveis: [5, 25, 50, 75, 100, 200],
    coresNiveis: ['#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#fbbf24', '#00e5ff'],
    nomesNiveis: ['Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante', 'Lendário'],
  },
  {
    id: 'foco-total',
    nome: 'Foco Total',
    descricao: 'Complete 5 tarefas na mesma sessão sem sair do app.',
    icone: FaBullseye,
    cor: '#f472b6',
    tipo: 'epic',
  },
  {
    id: 'mestre-prioridades',
    nome: 'Mestre das Prioridades',
    descricao: 'Use todas as prioridades pelo menos uma vez.',
    icone: FaAward,
    cor: '#fbbf24',
    tipo: 'rare',
  },
  {
    id: 'notas-criativas',
    nome: 'Notas Criativas',
    descricao: 'Adicione notas em 10 tarefas diferentes.',
    icone: FaPenFancy,
    cor: '#38bdf8',
    tipo: 'epic',
  },
  {
    id: 'noite-produtiva',
    nome: 'Noite Produtiva',
    descricao: 'Conclua uma tarefa entre 0h e 6h.',
    icone: FaMoon,
    cor: '#6366f1',
    tipo: 'secret',
  },
  {
    id: 'limpeza',
    nome: 'Limpeza Geral',
    descricao: 'Remova 20 tarefas concluídas.',
    icone: FaTrash,
    cor: '#ef4444',
    tipo: 'rare',
  },
  {
    id: 'colecionador',
    nome: 'Colecionador',
    descricao: 'Desbloqueie 8 badges diferentes.',
    icone: FaPuzzlePiece,
    cor: '#f472b6',
    tipo: 'epic',
  },
  {
    id: 'rapidez',
    nome: 'Mão Rápida',
    descricao: 'Adicione 3 tarefas em menos de 1 minuto.',
    icone: FaStar,
    cor: '#facc15',
    tipo: 'rare',
  },
  {
    id: 'organizador',
    nome: 'Organizador',
    descricao: 'Crie 5 categorias diferentes.',
    icone: FaTrophy,
    cor: '#60a5fa',
    tipo: 'common',
  },
  {
    id: 'explorador',
    nome: 'Explorador',
      descricao: 'Acesse todas as áreas do app pelo menos uma vez. (Desbloqueia a opção de personalizar a logo do app como quiser!)',
    icone: FaLightbulb,
    cor: '#fbbf24',
    tipo: 'epic',
  },
  {
    id: 'mestre-tempo',
    nome: 'Mestre do Tempo',
    descricao: 'Use o app em 3 períodos: Manhã (6h-12h), Tarde (12h-18h) e Noite (18h-6h).',
    icone: GiNightSleep,
    cor: '#38bdf8',
    tipo: 'rare',
  },
  {
    id: 'veterano',
    nome: 'Veterano',
    descricao: 'Mantenha uma sequência de 30 dias seguidos concluindo tarefas.',
    icone: GiPodiumWinner,
    cor: '#f97316',
    tipo: 'rare',
  },
  {
    id: 'planejador',
    nome: 'Planejador',
    descricao: 'Adicione prazo em pelo menos 10 tarefas diferentes.',
    icone: GiNotebook,
    cor: '#60a5fa',
    tipo: 'common',
  },
  {
    id: 'artista',
    nome: 'Artista',
    descricao: 'Experimente 3 temas visuais diferentes no app.',
    icone: FaPalette,
    cor: '#f472b6',
    tipo: 'rare',
  },
  {
    id: 'decisivo',
    nome: 'Decisivo',
    descricao: 'Conclua 10 tarefas marcadas com prioridade alta.',
    icone: GiLaurelsTrophy,
    cor: '#ef4444',
    tipo: 'epic',
  },
  {
    id: 'perfeccionista',
    nome: 'Perfeccionista',
    descricao: 'Conclua 10 tarefas que tenham tanto notas quanto prazo definido.',
    icone: FaGem,
    cor: '#a78bfa',
    tipo: 'epic',
  },
  {
    id: 'insone',
    nome: 'Insone',
    descricao: 'Conclua uma tarefa entre 2h e 4h da madrugada. 🌙',
    icone: GiLaurelCrown,
    cor: '#818cf8',
    tipo: 'secret',
  },
  {
    id: 'multitarefa',
    nome: 'Multitarefa',
    descricao: 'Tenha 15 ou mais tarefas pendentes ao mesmo tempo.',
    icone: FaChartLine,
    cor: '#34d399',
    tipo: 'common',
  },
  {
    id: 'conquistador',
    nome: 'Conquistador',
    descricao: 'Desbloqueie 12 badges diferentes (exceto o Evolutivo).',
    icone: FaCrown,
    cor: '#fbbf24',
    tipo: 'epic',
  },
  {
    id: 'assiduo',
    nome: 'Assíduo',
    descricao: 'Abra o app em 7 dias diferentes ao longo do tempo.',
    icone: GiAchievement,
    cor: '#4ade80',
    tipo: 'rare',
  },
  {
    id: 'maestro',
    nome: 'Maestro',
    descricao: 'Conclua tarefas em 5 categorias diferentes.',
    icone: FaUserFriends,
    cor: '#c084fc',
    tipo: 'rare',
  },
]
