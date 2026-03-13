import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        page: '#f8fafc',
        card: '#ffffff',
        border: '#e2e8f0',
        'border-light': '#f1f5f9',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
        'text-dim': '#94a3b8',
        accent: '#3b82f6',
        'accent-soft': '#eff6ff',
        success: '#059669',
        'success-soft': '#ecfdf5',
        warning: '#d97706',
        'warning-soft': '#fffbeb',
        danger: '#dc2626',
        'danger-soft': '#fef2f2',
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        pill: '99px',
      },
    },
  },
  plugins: [],
}
export default config
