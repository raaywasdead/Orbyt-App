import { useEffect, useState, useMemo, memo } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import type { IOptions, RecursivePartial } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim'

interface ThemeParticles {
  color: string;
  linkColor: string;
  opacity: number;
  speed: number;
  quantity: number;
  shape: string;
  linkOpacity: number;
}

interface BackgroundParticlesProps {
  temaEscuro: boolean;
  themeParticles?: ThemeParticles;
}

const BackgroundParticles = memo(({ temaEscuro, themeParticles }: BackgroundParticlesProps) => {
  const [init, setInit] = useState(false)

  const options: RecursivePartial<IOptions> = useMemo(() => {
    const largura = typeof window !== 'undefined' ? window.innerWidth : 1200
    const mobile = largura < 600
    
    // Usa configurações do tema se disponíveis, senão usa padrão
    const corParticulas = themeParticles?.color || (temaEscuro ? '#c4b5fd' : '#4b5563')
    const corLinks = themeParticles?.linkColor || (temaEscuro ? '#7c3aed' : '#9333ea')
    const opacidade = themeParticles?.opacity || (temaEscuro ? 0.18 : 0.25)
    const velocidade = themeParticles?.speed || 0.6
    const quantidade = themeParticles?.quantity || 45
    const forma = themeParticles?.shape || 'circle'
    const linkOpacity = themeParticles?.linkOpacity || (temaEscuro ? 0.10 : opacidade)

    return {
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'grab',
          },
          onClick: {
            enable: false,
          },
          resize: { enable: true },
        },
        modes: {
          grab: {
            distance: 160,
            links: {
              opacity: 0.35,
            },
          },
          push: {
            quantity: 2,
          },
        },
      },
      particles: {
        color: {
          value: corParticulas,
        },
        links: {
          color: corLinks,
          distance: mobile ? 120 : 150,
          enable: true,
          opacity: mobile ? linkOpacity * 0.7 : linkOpacity,
          width: 1.2,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: true,
          speed: mobile ? velocidade * 0.75 : velocidade,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: mobile ? Math.round(quantidade * 0.67) : quantidade,
        },
        opacity: {
          value: opacidade,
          animation: {
            enable: true,
            speed: 0.5,
            minimumValue: opacidade * 0.3,
            sync: false,
          },
        },
        shape: {
          type: forma,
        },
        size: {
          value: { min: 1, max: 3 },
          animation: {
            enable: true,
            speed: 2,
            minimumValue: 0.5,
            sync: false,
          },
        },
      },
      detectRetina: true,
    }
  }, [temaEscuro, themeParticles])

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  if (!init) return null

  return (
    <Particles
      id="tsparticles"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // Garante que fique atrás de tudo
        pointerEvents: 'none', // Não interfere nos cliques do site
      }}
      options={options}
    />
  )
})

export default BackgroundParticles
