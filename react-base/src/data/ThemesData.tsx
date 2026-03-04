import { Sparkles, Moon, Snowflake, Star, Palette } from 'lucide-react'

export interface Theme {
  id: string;
  nome: string;
  descricao: string;
  icone: React.ComponentType<any>;
  nivelRequerido: number; // 0 = sempre disponível, 1-5 = nível evolutivo necessário
  preview: {
    gradientStart: string;
    gradientEnd: string;
    particleColor: string;
    linkColor: string;
  };
  particles: {
    color: string;
    linkColor: string;
    opacity: number;
    speed: number;
    quantity: number;
    shape: string;
    linkOpacity: number;
  };
  background: {
    gradient: string;
    overlayOpacity: number;
  };
  accent: {
    primary: string;
    hover: string;
    light: string;
    glow: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'padrao',
    nome: 'Padrão',
    descricao: 'O visual original do app',
    icone: Sparkles,
    nivelRequerido: 0,
    preview: {
      gradientStart: '#1a1625',
      gradientEnd: '#2d1b4e',
      particleColor: '#ffffff',
      linkColor: '#a855f7',
    },
    particles: {
      color: '#ffffff',
      linkColor: '#a855f7',
      opacity: 0.15,
      speed: 0.8,
      quantity: 60,
      shape: 'circle',
      linkOpacity: 0.15,
    },
    background: {
      gradient: 'linear-gradient(135deg, #1a1625 0%, #2d1b4e 100%)',
      overlayOpacity: 0,
    },
    accent: {
      primary: '#a855f7',
      hover: '#9333ea',
      light: '#e9d5ff',
      glow: 'rgba(168, 85, 247, 0.4)',
    },
  },
  {
    id: 'aurora',
    nome: 'Aurora',
    descricao: 'Tons suaves de rosa e lavanda',
    icone: Sparkles,
    nivelRequerido: 1,
    preview: {
      gradientStart: '#2d1b4e',
      gradientEnd: '#4a1942',
      particleColor: '#f9a8d4',
      linkColor: '#f472b6',
    },
    particles: {
      color: '#f9a8d4',
      linkColor: '#f472b6',
      opacity: 0.2,
      speed: 0.6,
      quantity: 50,
      shape: 'circle',
      linkOpacity: 0.18,
    },
    background: {
      gradient: 'linear-gradient(135deg, #2d1b4e 0%, #4a1942 50%, #2d1b4e 100%)',
      overlayOpacity: 0,
    },
    accent: {
      primary: '#f472b6',
      hover: '#ec4899',
      light: '#fce7f3',
      glow: 'rgba(244, 114, 182, 0.4)',
    },
  },
  {
    id: 'noite-estrelada',
    nome: 'Noite Estrelada',
    descricao: 'Azul profundo com estrelas brilhantes',
    icone: Moon,
    nivelRequerido: 2,
    preview: {
      gradientStart: '#0f172a',
      gradientEnd: '#1e3a5f',
      particleColor: '#e0f2fe',
      linkColor: '#38bdf8',
    },
    particles: {
      color: '#e0f2fe',
      linkColor: '#38bdf8',
      opacity: 0.25,
      speed: 0.4,
      quantity: 80,
      shape: 'star',
      linkOpacity: 0.12,
    },
    background: {
      gradient: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      overlayOpacity: 0,
    },
    accent: {
      primary: '#38bdf8',
      hover: '#0ea5e9',
      light: '#e0f2fe',
      glow: 'rgba(56, 189, 248, 0.4)',
    },
  },
  {
    id: 'cristal-artico',
    nome: 'Cristal Ártico',
    descricao: 'Tons de gelo e prata minimalista',
    icone: Snowflake,
    nivelRequerido: 3,
    preview: {
      gradientStart: '#0f172a',
      gradientEnd: '#164e63',
      particleColor: '#e0f7fa',
      linkColor: '#67e8f9',
    },
    particles: {
      color: '#e0f7fa',
      linkColor: '#67e8f9',
      opacity: 0.3,
      speed: 0.5,
      quantity: 45,
      shape: 'polygon',
      linkOpacity: 0.25,
    },
    background: {
      gradient: 'linear-gradient(135deg, #0f172a 0%, #164e63 50%, #0e7490 100%)',
      overlayOpacity: 0.1,
    },
    accent: {
      primary: '#22d3ee',
      hover: '#06b6d4',
      light: '#cffafe',
      glow: 'rgba(34, 211, 238, 0.4)',
    },
  },
  {
    id: 'galaxia',
    nome: 'Galáxia',
    descricao: 'Gradiente cósmico multicolorido',
    icone: Star,
    nivelRequerido: 4,
    preview: {
      gradientStart: '#0f0c29',
      gradientEnd: '#24243e',
      particleColor: '#c084fc',
      linkColor: '#f472b6',
    },
    particles: {
      color: '#c084fc',
      linkColor: '#f472b6',
      opacity: 0.28,
      speed: 0.9,
      quantity: 70,
      shape: 'star',
      linkOpacity: 0.22,
    },
    background: {
      gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 25%, #24243e 50%, #0f0c29 75%, #302b63 100%)',
      overlayOpacity: 0,
    },
    accent: {
      primary: '#c084fc',
      hover: '#a855f7',
      light: '#ede9fe',
      glow: 'rgba(192, 132, 252, 0.4)',
    },
  },
  {
    id: 'zen-master',
    nome: 'Zen Master',
    descricao: 'Gradiente escuro com partículas douradas elegantes',
    icone: Sparkles,
    nivelRequerido: 5,
    preview: {
      gradientStart: '#18181b',
      gradientEnd: '#23232b',
      particleColor: '#facc15',
      linkColor: '#eab308',
    },
    particles: {
      color: '#facc15',
      linkColor: '#eab308',
      opacity: 0.22,
      speed: 0.7,
      quantity: 70,
      shape: 'circle',
      linkOpacity: 0.18,
    },
    background: {
      gradient: 'linear-gradient(135deg, #18181b 0%, #23232b 100%)',
      overlayOpacity: 0.12,
    },
    accent: {
      primary: '#facc15',
      hover: '#eab308',
      light: '#23232b',
      glow: 'rgba(250, 204, 21, 0.22)',
    },
  },
  {
    id: 'custom',
    nome: 'Personalizado',
    descricao: 'Crie seu próprio tema com cores completamente livres',
    icone: Palette,
    nivelRequerido: 6,
    preview: {
      gradientStart: '#1a1625',
      gradientEnd: '#2d1b4e',
      particleColor: '#ffffff',
      linkColor: '#a855f7',
    },
    particles: {
      color: '#ffffff',
      linkColor: '#a855f7',
      opacity: 0.15,
      speed: 0.8,
      quantity: 60,
      shape: 'circle',
      linkOpacity: 0.15,
    },
    background: {
      gradient: 'linear-gradient(135deg, #1a1625 0%, #2d1b4e 100%)',
      overlayOpacity: 0,
    },
    accent: {
      primary: '#a855f7',
      hover: '#9333ea',
      light: '#e9d5ff',
      glow: 'rgba(168,85,247,0.4)',
    },
  },
];

export const getThemeById = (id: string): Theme => {
  return THEMES.find(t => t.id === id) || THEMES[0];
};

export const getAvailableThemes = (nivelEvolutivo: number): Theme[] => {
  return THEMES.filter(t => t.nivelRequerido <= nivelEvolutivo);
};

export const isThemeUnlocked = (themeId: string, nivelEvolutivo: number): boolean => {
  const theme = getThemeById(themeId);
  return theme.nivelRequerido <= nivelEvolutivo;
};