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
  steel: {
    50: '#F6F7F7',
    100: '#EDF1F4',
    200: '#DCE4EF',
    300: '#D6D8D8',
    400: '#A7A8A8',
    500: '#A1B7CD',
    600: '#6F8D9D',
    700: '#4E5759',
    800: '#303A3D',
    900: '#20282A',
    950: '#121719',
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
    DEFAULT: primitive.steel[600],
    hover: primitive.steel[700],
    active: primitive.steel[800],
    subtle: primitive.steel[200],
    muted: primitive.steel[500],
    foreground: primitive.common.white,
  },
  background: {
    DEFAULT: primitive.steel[50],
    subtle: primitive.common.white,
    muted: primitive.steel[100],
  },
  surface: {
    DEFAULT: primitive.common.white,
    elevated: primitive.common.white,
    muted: primitive.steel[50],
    sunken: primitive.steel[100],
  },
  text: {
    DEFAULT: primitive.steel[950],
    secondary: primitive.steel[700],
    muted: primitive.steel[600],
    subtle: primitive.steel[400],
    inverse: primitive.common.white,
    accent: primitive.steel[600],
  },
  border: {
    DEFAULT: primitive.steel[300],
    subtle: primitive.steel[100],
    strong: primitive.steel[400],
    accent: primitive.steel[600],
  },
  link: {
    DEFAULT: primitive.steel[600],
    hover: primitive.steel[700],
    visited: primitive.steel[800],
  },
  selection: {
    DEFAULT: primitive.steel[200],
    foreground: primitive.steel[900],
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
        steel: primitive.steel,
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
          'Pretendard Variable',
          'Pretendard',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        serif: [
          'Pretendard Variable',
          'Pretendard',
          'Georgia',
          'Times New Roman',
          'ui-serif',
          'serif',
        ],
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
        paper: '0 10px 30px rgb(24 22 20 / 0.06)',
        photo: '0 8px 24px rgb(24 22 20 / 0.10)',
      },
    },
  },
  plugins: [],
}

module.exports = config
