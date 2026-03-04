import purgecss from '@fullhuman/postcss-purgecss';

export default {
  plugins: [
    purgecss({
      content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}',
      ],
      safelist: [
        // Classe de tema claro
        'tema-claro',
        // Classes dinâmicas importantes
        'active',
        'open',
        'show',
        'hidden',
        'disabled',
        // Classes de i18n
        'pt',
        'en',
        // Classes de animação
        /^animate-/,
        // Preserve classes que podem ser adicionadas dinamicamente
        /^lp-/,
        /^io-/,
        /^modal-/,
        /^sidebar-/,
        /^timeline-/,
        /^pills-/,
        /^task-/,
        /^form-/,
        /^input-/,
        /^btn-/,
        /^badge-/,
        /^theme-/,
        /^stats-/,
      ],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?=%\]|\w|\/)|[\d\w-]+/g) || [],
      keyframes: true,
      variables: true,
    }),
  ],
};
