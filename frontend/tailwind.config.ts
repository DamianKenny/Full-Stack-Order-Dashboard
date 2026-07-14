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
        '2xl': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'lg': ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'base': ['15px', { lineHeight: '24px', fontWeight: '500' }],
        'sm': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'xs': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        'xl': '12px',
        'lg': '8px',
      },
      boxShadow: {
        'elevated': '0 1px 2px oklch(0% 0 0 / 0.04), 0 8px 24px oklch(0% 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;