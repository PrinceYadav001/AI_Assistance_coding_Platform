/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary background palette (dark theme)
        surface: {
          950: '#060810',
          900: '#0d1117',
          800: '#161b22',
          700: '#21262d',
          600: '#30363d',
          500: '#3d444d',
        },
        // Accent blues
        accent: {
          400: '#58a6ff',
          500: '#388bfd',
          600: '#1f6feb',
          700: '#1158c7',
        },
        // Success greens
        success: {
          400: '#3fb950',
          500: '#2ea043',
          600: '#238636',
        },
        // Error reds
        error: {
          400: '#f85149',
          500: '#da3633',
          600: '#b62324',
        },
        // Warning yellows
        warning: {
          400: '#d29922',
          500: '#bb8009',
          600: '#9e6a03',
        },
        // Text
        muted: '#7d8590',
        subtle: '#6e7681',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
    },
  },
  plugins: [],
};
