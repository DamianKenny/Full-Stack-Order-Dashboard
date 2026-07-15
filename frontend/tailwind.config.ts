import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        '3xl': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        '2xl': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'xl': ['22px', { lineHeight: '30px', fontWeight: '600' }],
        'lg': ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'base': ['15px', { lineHeight: '24px', fontWeight: '500' }],
        'sm': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'xs': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'elevated': '0 1px 2px rgba(15, 23, 42, 0.05), 0 12px 32px rgba(15, 23, 42, 0.08)',
        'soft': '0 12px 40px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        accent: {
          coral: '#fb7185',
          pink: '#ec4899',
          violet: '#8b5cf6',
          mint: '#34d399',
          amber: '#fbbf24',
        },
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
      },
    },
  },
  plugins: [],
};

export default config;