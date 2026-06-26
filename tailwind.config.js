/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
    "./app/app.vue",
    "./app/error.vue"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // blue-600
          hover: '#1D4ED8',   // blue-700
          ring: '#BFDBFE',    // blue-200
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          700: '#334155',
          900: '#0F172A',
        },
        success: {
          bg: '#F0FDF4',
          text: '#15803D',
          border: '#BBF7D0',
        },
        warning: {
          bg: '#FFFBEB',
          text: '#D97706',
          border: '#FDE68A',
        },
        danger: {
          bg: '#FEF2F2',
          text: '#DC2626',
          border: '#FECACA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '8px',
        xl: '12px',
      }
    },
  },
  plugins: [],
}
