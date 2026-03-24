/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        panel: {
          bg: 'var(--panel-bg)',
          surface: 'var(--panel-surface)',
          popover: 'var(--panel-popover)',
          hover: 'var(--panel-hover)',
          border: 'var(--panel-border)',
          track: 'var(--panel-track)',
          fill: 'var(--panel-fill)',
          accent: 'rgb(var(--panel-accent) / <alpha-value>)',
          'accent-hover': 'rgb(var(--panel-accent-hover) / <alpha-value>)',
          text: 'rgb(var(--panel-text) / <alpha-value>)',
          'text-muted': 'rgb(var(--panel-text-muted) / <alpha-value>)'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-down': 'slideDown 0.2s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
