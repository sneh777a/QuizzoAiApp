/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        accent: {
          light: "var(--color-accent-light)",
          'hover-light': "var(--color-accent-hover-light)",
          dark: "var(--color-accent-dark)",
          'hover-dark': "var(--color-accent-hover-dark)",
        },
        success: {
          light: "var(--color-success-light)",
          dark: "var(--color-success-dark)",
        },
        warning: {
          light: "var(--color-warning-light)",
          dark: "var(--color-warning-dark)",
        },
        error: {
          light: "var(--color-error-light)",
          dark: "var(--color-error-dark)",
        },
        app: {
          bg: {
            light: "var(--color-bg-light)",
            dark: "var(--color-bg-dark)",
          },
          card: {
            light: "var(--color-card-light)",
            dark: "var(--color-card-dark)",
          },
          text: {
            primary: {
              light: "var(--color-text-primary-light)",
              dark: "var(--color-text-primary-dark)",
            },
            secondary: {
              light: "var(--color-text-secondary-light)",
              dark: "var(--color-text-secondary-dark)",
            },
          },
          border: {
            light: "var(--color-border-light)",
            dark: "var(--color-border-dark)",
          },
          input: {
            light: "var(--color-input-light)",
            dark: "var(--color-input-dark)",
          },
        },
      },
      fontFamily: {
        sans: ["Inter var", "sans-serif"],
      },
    },
  },
  plugins: [],
};
