/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        interlink: {
          violet: '#6962F1',
          'violet-hover': '#5851DE',
          'violet-light': '#8E88FA',
          'violet-subtle': '#EEF0FD',
          'violet-card': '#F4F5FD',
          dark: '#0E121B',
          'dark-soft': '#222738',
          muted: '#525866',
          'muted-light': '#99A0AE',
          border: '#EBEFF5',
          'border-light': '#F5F7FA',
          canvas: '#FFFFFF',
          surface: '#F8F9FE',
          pill: '#F5F7FA',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        body: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'interlink-pill': '0 2px 8px rgba(105, 98, 241, 0.15)',
        'interlink-button': '0 4px 14px rgba(105, 98, 241, 0.35)',
        'interlink-card': '0 10px 30px -10px rgba(105, 98, 241, 0.08)',
        'interlink-float': '0 20px 40px -15px rgba(14, 18, 27, 0.08)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
