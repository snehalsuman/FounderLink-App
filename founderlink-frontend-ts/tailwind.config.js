/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Apple-inspired surface stack — true blacks, no navy
        dark: {
          900: '#000000',   // pure black  (page bg)
          800: '#1c1c1e',   // Apple secondary bg / card
          700: '#2c2c2e',   // elevated card / input bg
          600: '#3a3a3c',   // hover / pressed
          500: '#48484a',   // dividers / borders
          400: '#636366',   // muted / disabled
          300: '#8e8e93',   // tertiary text
        },
        // iOS / macOS system blue — crisp, premium
        accent: {
          DEFAULT: '#0a84ff',
          hover:   '#0071e3',
          light:   '#409cff',
        },
        primary: {
          50:  '#f0f8ff',
          100: '#e0f0ff',
          500: '#0a84ff',
          600: '#0071e3',
          700: '#005dc1',
          900: '#003380',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', "'SF Pro Display'",
          "'Inter'", 'system-ui', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
