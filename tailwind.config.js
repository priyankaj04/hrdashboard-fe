/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Relic inspired color palette
        newrelic: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#00ce7c', // New Relic primary green
            600: '#00b96b',
            700: '#00a05d',
            800: '#065f46',
            900: '#064e3b',
          },
          dark: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b', // New Relic dark gray
            900: '#0f172a', // New Relic darkest
            950: '#0c0f18', // Almost black
          },
          blue: {
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
          },
          purple: {
            400: '#a855f7',
            500: '#9333ea',
            600: '#7c3aed',
          },
          orange: {
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
          },
          red: {
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
          },
        },
        // Override default colors to fit New Relic theme
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00ce7c',
          600: '#00b96b',
          700: '#00a05d',
          800: '#065f46',
          900: '#064e3b',
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0c0f18',
        },
        dark: '#0c0f18',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      },
      boxShadow: {
        'newrelic': '0 4px 20px rgba(0, 206, 124, 0.15)',
        'newrelic-lg': '0 10px 40px rgba(0, 206, 124, 0.2)',
        'dark': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 40px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}

