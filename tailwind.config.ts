import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': 'var(--bg-main)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'primary': 'var(--primary)',
        'primary-start': 'var(--primary-start)',
        'primary-mid': 'var(--primary-mid)',
        'primary-end': 'var(--primary-end)',
        'primary-hover': 'var(--primary-hover)',
        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'border-primary': 'var(--border-primary)',
        'border-hover': 'var(--border-hover)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      fontFamily: {
        'jost': ['var(--font-jost)', 'sans-serif'],
        'montserrat': ['var(--font-montserrat)', 'sans-serif'],
      },
      transitionTimingFunction: {
        'custom': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        'brutal': '6px 6px 0px #2D2219',
        'brutal-hover': '10px 10px 0px #2D2219',
      },
    },
  },
  plugins: [],
};

export default config;
