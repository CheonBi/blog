/** @type {import('tailwindcss').Config} */

/**
 * Kinetograph design tokens
 *
 * Prefer semantic utilities such as `bg-surface`, `text-text`,
 * `border-border`, and `text-accent` in components. Primitive utilities such
 * as `bg-burgundy-600` are available for exceptional cases.
 */
const primitive = {
  burgundy: {
    50: '#F8F1F2',
    100: '#F0E1E4',
    200: '#DEC2C7',
    300: '#C79CA4',
    400: '#A96D78',
    500: '#8E4F5B',
    600: '#7A3E48',
    700: '#62313A',
    800: '#502A31',
    900: '#44272C',
    950: '#251216',
  },
  ivory: {
    50: '#FFFDF9',
    100: '#FCF9F4',
    200: '#F6F1E8',
    300: '#EEE6DA',
    400: '#DDD4C8',
    500: '#C3B7A8',
    600: '#A99B8A',
    700: '#8C7D6D',
    800: '#6C6054',
    900: '#4D453D',
    950: '#2A2521',
  },
  charcoal: {
    50: '#F7F6F5',
    100: '#E8E5E2',
    200: '#D0CBC6',
    300: '#B3ACA5',
    400: '#968D84',
    500: '#807771',
    600: '#685F59',
    700: '#514A45',
    800: '#38332F',
    900: '#282522',
    950: '#181614',
  },
  olive: {
    50: '#F5F6F2',
    100: '#E8EBE1',
    200: '#D3D9C7',
    300: '#B5C0A3',
    400: '#93A07C',
    500: '#77835F',
    600: '#626D4F',
    700: '#4F583F',
    800: '#414936',
    900: '#373E30',
    950: '#1C2118',
  },
  sepia: {
    50: '#FAF6F2',
    100: '#F2E8DF',
    200: '#E2CFC0',
    300: '#CEAD96',
    400: '#B88769',
    500: '#9D6C50',
    600: '#835841',
    700: '#694535',
    800: '#573A2F',
    900: '#493229',
    950: '#281914',
  },
  state: {
    success: '#5F7558',
    warning: '#A77A3F',
    danger: '#9A4C4C',
    info: '#586A7A',
  },
  common: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    current: 'currentColor',
  },
}

/**
 * Semantic mappings are the single place to update when the site is
 * reskinned. Components should normally use these tokens.
 */
const semantic = {
  accent: {
    DEFAULT: primitive.burgundy[600],
    hover: primitive.burgundy[700],
    active: primitive.burgundy[800],
    subtle: primitive.burgundy[50],
    muted: primitive.burgundy[100],
    foreground: primitive.common.white,
  },
  background: {
    DEFAULT: primitive.ivory[200],
    subtle: primitive.ivory[100],
    muted: primitive.ivory[300],
  },
  surface: {
    DEFAULT: primitive.ivory[50],
    elevated: primitive.common.white,
    muted: primitive.ivory[100],
    sunken: primitive.ivory[300],
  },
  text: {
    DEFAULT: primitive.charcoal[900],
    secondary: primitive.charcoal[700],
    muted: primitive.charcoal[500],
    subtle: primitive.charcoal[400],
    inverse: primitive.ivory[50],
    accent: primitive.burgundy[600],
  },
  border: {
    DEFAULT: primitive.ivory[400],
    subtle: primitive.ivory[300],
    strong: primitive.ivory[500],
    accent: primitive.burgundy[300],
  },
  link: {
    DEFAULT: primitive.burgundy[600],
    hover: primitive.burgundy[700],
    visited: primitive.burgundy[800],
  },
  selection: {
    DEFAULT: primitive.burgundy[100],
    foreground: primitive.burgundy[900],
  },
  overlay: {
    DEFAULT: 'rgb(24 22 20 / 0.48)',
    strong: 'rgb(24 22 20 / 0.72)',
  },
  status: {
    success: primitive.state.success,
    warning: primitive.state.warning,
    danger: primitive.state.danger,
    info: primitive.state.info,
  },
}

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,md,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,md,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,md,mdx}',
    './content/**/*.{md,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        burgundy: primitive.burgundy,
        ivory: primitive.ivory,
        charcoal: primitive.charcoal,
        olive: primitive.olive,
        sepia: primitive.sepia,
        accent: semantic.accent,
        background: semantic.background,
        surface: semantic.surface,
        text: semantic.text,
        border: semantic.border,
        link: semantic.link,
        selection: semantic.selection,
        overlay: semantic.overlay,
        status: semantic.status,
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        serif: ['Georgia', 'Times New Roman', 'ui-serif', 'serif'],
        mono: [
          'Geist Mono',
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      maxWidth: {
        article: '720px',
        photo: '960px',
        content: '1120px',
      },
      letterSpacing: {
        meta: '0.12em',
        title: '-0.025em',
      },
      borderRadius: {
        photo: '0.875rem',
      },
      boxShadow: {
        paper: '0 10px 30px rgb(40 37 34 / 0.06)',
        photo: '0 8px 24px rgb(40 37 34 / 0.10)',
      },
    },
  },
  plugins: [],
}

module.exports = config
